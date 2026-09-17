"""Traveler Profile Agent — ATLAS-P2-AGENTS-04.

ADDED — ATLAS-P2-AGENTS-04. `ARCHITECTURE.md` §8's "Traveler Profile
Agent — Purpose: Understand user preferences." The first concrete Core
Agent — the first real subclass of `ai.agents.base.Agent`. Registering
it into a real `ai.orchestrator.registry.AgentRegistry` for an actual
request is `AGENTS-09`'s job (wiring the Orchestrator into
`chat_service.py`); this task ships the agent itself, tested standalone
and through a real `AgentRegistry`/`Orchestrator`, exactly as
`AGENTS-02`'s own tests did for the base contract.

Read-only against both of its data sources, by design and by this
task's own acceptance criterion:
- `backend/app/models/traveler_profile.py` (`PROF-02`) — structured
  preference fields.
- `backend/app/models/user_memory.py` (`MEM-02`) — freeform key/value
  AI memory entries.

Deliberately does NOT call
`app.services.profile_service.get_or_create_profile()` or
`app.services.memory_service.get_or_create_memory()` — both have a
write side effect (INSERT an empty row on first access) that this
task's acceptance criterion explicitly forbids ("this agent never
writes to `traveler_profile.py`"). This module runs its own plain
`SELECT` against each model instead (`_fetch_profile`/
`_fetch_memory_data` below), returning `None`/`{}` when no row exists
yet, rather than reusing a convenience function whose own contract
includes a write.

A note on this file's own dependency direction, stated rather than
left implicit: `ai/` has, until now, only ever been depended ON by
`backend/app/` (`backend/app/core/ai.py`'s own docstring: "`ai/
config.py` accepts settings from backend at startup... Keeps AI layer
reusable, provider-independent"). This is the first `ai/` file that
imports FROM `backend/app/` (its two ORM models) — a direct, necessary
consequence of this task's own scope ("reads `traveler_profile.py`
(`PROF-02`) and `user_memory` (`MEM-02`)", named verbatim in
`WORK_BREAKDOWN_STRUCTURE.md`). `ARCHITECTURE.md` §2's "AI Provider
Independence" is about LLM providers (OpenAI/Anthropic/Gemini), not
about decoupling from this backend's own Postgres schema — no
alternative data-access abstraction is documented anywhere in the
Design Bible, and inventing one here would be exactly the kind of
unrequested abstraction `MASTER_RULES.md` §1 warns against ("Never
introduce unnecessary technologies or abstractions").

The one LLM call this agent makes is narrow and bounded: writing a
short prose `summary` from an already-fetched, already-structured set
of facts (`ai/prompts/traveler_profile_prompt.py`). The structured
preference fields on `TravelerProfileSummary` are never LLM-authored —
direct pass-throughs of the DB reads below — and `reasoning` is a
fixed, deterministic provenance string, not model output. Neither can
be affected by model hallucination, satisfying `GUIDELINES.md` §8's AI
Safety Rules for exactly the data this agent is responsible for.
"""

from __future__ import annotations

import uuid
from typing import Any

from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ai.agents.base import Agent
from ai.prompts.traveler_profile_prompt import TRAVELER_PROFILE_SYSTEM_PROMPT
from ai.providers.base import LLMMessage, LLMProvider
from ai.schemas.base import ConfidenceLevel
from ai.schemas.traveler_profile import TravelerProfileSummary
from app.models.traveler_profile import TravelerProfile
from app.models.user_memory import UserMemory

_NO_FACTS_MESSAGE = (
    "No traveler facts are recorded yet. Say in one short sentence that no "
    "preferences have been saved yet."
)

_PROVENANCE_REASONING = (
    "Derived directly from the traveler's saved profile (traveler_profiles) and "
    "memory entries (user_memory); nothing was inferred beyond what is stored."
)


class TravelerProfileQuery(BaseModel):
    """This agent's real input is its own constructor (`db`, `user_id`)
    plus the conversation messages `reason()` receives — no additional
    structured input is required, so this is deliberately a fieldless
    placeholder rather than an invented, unused set of fields."""


class TravelerProfileAgent(Agent):
    """Reads a traveler's saved profile and memory, and produces a
    structured, explainable summary other Core Agents can consume.

    Constructed per request, bound to one traveler's `db` session and
    `user_id` — `Agent.__init__`/`Orchestrator.dispatch()` only carry a
    provider (`ai/agents/base.py`'s own docstring explains why), so a
    user-specific agent like this one extends its own constructor with
    the additional context it needs. Wiring this into a real request
    (constructing it with the request's own session and current user)
    is `AGENTS-09`'s job, not this task's.
    """

    def __init__(self, provider: LLMProvider, db: AsyncSession, user_id: uuid.UUID) -> None:
        super().__init__(
            provider,
            name="traveler-profile-agent",
            intents=("my preferences", "my profile", "what do you know about me"),
        )
        self._db = db
        self._user_id = user_id

    @property
    def mission(self) -> str:
        return "Understand and explain what Atlas already knows about this traveler."

    @property
    def responsibilities(self) -> tuple[str, ...]:
        return (
            "Read the traveler's saved profile (travel style, budget, accommodation, "
            "transportation, food, and language preferences).",
            "Read the traveler's freeform saved memory entries.",
            "Produce one structured, explainable summary other Core Agents can consume.",
        )

    @property
    def allowed_tools(self) -> tuple[str, ...]:
        # This agent answers entirely from the traveler's own saved
        # data — it has no need for ai.tools.knowledge_tools's
        # general-guidance retrieval, or any other tool.
        return ()

    @property
    def input_schema(self) -> type[BaseModel]:
        return TravelerProfileQuery

    @property
    def output_schema(self) -> type[BaseModel]:
        return TravelerProfileSummary

    @property
    def reasoning_rules(self) -> tuple[str, ...]:
        return (
            "Never invent a preference not present in the traveler's saved profile or memory.",
            "Never write to traveler_profiles or user_memory — read-only, always.",
            "Never mention a price, a date, or a fact about a specific destination.",
        )

    @property
    def system_prompt(self) -> str:
        return TRAVELER_PROFILE_SYSTEM_PROMPT

    async def reason(self, messages: list[LLMMessage]) -> BaseModel:
        profile = await self._fetch_profile()
        memory_data = await self._fetch_memory_data()

        facts_text = self._render_facts(profile, memory_data)
        llm_messages = self._with_system_prompt([LLMMessage(role="user", content=facts_text)])
        raw_summary = await self._provider.complete(llm_messages)

        return TravelerProfileSummary(
            summary=raw_summary.strip() or "No traveler preferences are recorded yet.",
            reasoning=_PROVENANCE_REASONING,
            confidence=self._compute_confidence(profile, memory_data),
            assumptions=(),
            uncertainty_notes=self._compute_uncertainty_notes(profile),
            travel_preference=(
                profile.travel_preference.value if profile and profile.travel_preference else None
            ),
            budget_level=profile.budget_level.value if profile and profile.budget_level else None,
            accommodation_preference=(
                profile.accommodation_preference.value
                if profile and profile.accommodation_preference
                else None
            ),
            transportation_preference=(
                profile.transportation_preference.value
                if profile and profile.transportation_preference
                else None
            ),
            food_preferences=(
                tuple(profile.food_preferences) if profile and profile.food_preferences else ()
            ),
            preferred_travel_language=(profile.preferred_travel_language if profile else None),
            memory_notes=tuple(f"{key}: {value}" for key, value in sorted(memory_data.items())),
        )

    async def _fetch_profile(self) -> TravelerProfile | None:
        """Pure read — never creates a row, unlike
        `app.services.profile_service.get_or_create_profile`."""
        result = await self._db.execute(
            select(TravelerProfile).where(TravelerProfile.user_id == self._user_id)
        )
        return result.scalar_one_or_none()

    async def _fetch_memory_data(self) -> dict[str, Any]:
        """Pure read — never creates a row, unlike
        `app.services.memory_service.get_or_create_memory`."""
        result = await self._db.execute(select(UserMemory).where(UserMemory.user_id == self._user_id))
        memory = result.scalar_one_or_none()
        return memory.data if memory is not None else {}

    @staticmethod
    def _render_facts(profile: TravelerProfile | None, memory_data: dict[str, Any]) -> str:
        lines: list[str] = []
        if profile is not None:
            if profile.travel_preference:
                lines.append(f"Travel style: {profile.travel_preference.value}")
            if profile.budget_level:
                lines.append(f"Budget level: {profile.budget_level.value}")
            if profile.accommodation_preference:
                lines.append(f"Accommodation preference: {profile.accommodation_preference.value}")
            if profile.transportation_preference:
                lines.append(
                    f"Transportation preference: {profile.transportation_preference.value}"
                )
            if profile.food_preferences:
                lines.append(f"Food preferences: {', '.join(profile.food_preferences)}")
            if profile.preferred_travel_language:
                lines.append(f"Preferred travel language: {profile.preferred_travel_language}")
        for key, value in sorted(memory_data.items()):
            lines.append(f"Memory note — {key}: {value}")

        if not lines:
            return _NO_FACTS_MESSAGE
        return "Traveler facts:\n" + "\n".join(f"- {line}" for line in lines)

    @staticmethod
    def _compute_confidence(
        profile: TravelerProfile | None, memory_data: dict[str, Any]
    ) -> ConfidenceLevel:
        structured_field_count = 0
        if profile is not None:
            structured_field_count = sum(
                1
                for value in (
                    profile.travel_preference,
                    profile.budget_level,
                    profile.accommodation_preference,
                    profile.transportation_preference,
                    profile.preferred_travel_language,
                )
                if value
            ) + (1 if profile.food_preferences else 0)

        total_known = structured_field_count + len(memory_data)
        if total_known == 0:
            return ConfidenceLevel.LOW
        if total_known >= 3:
            return ConfidenceLevel.HIGH
        return ConfidenceLevel.MEDIUM

    @staticmethod
    def _compute_uncertainty_notes(profile: TravelerProfile | None) -> tuple[str, ...]:
        if profile is None:
            return ("No traveler profile has been saved yet.",)

        missing: list[str] = []
        if not profile.travel_preference:
            missing.append("travel style")
        if not profile.budget_level:
            missing.append("budget level")
        if not profile.accommodation_preference:
            missing.append("accommodation preference")
        if not profile.transportation_preference:
            missing.append("transportation preference")
        if not profile.food_preferences:
            missing.append("food preferences")
        if not profile.preferred_travel_language:
            missing.append("preferred travel language")

        if not missing:
            return ()
        return (f"Not yet set: {', '.join(missing)}.",)
