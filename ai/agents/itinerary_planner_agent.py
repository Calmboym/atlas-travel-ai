"""Itinerary Planner Agent — ATLAS-P2-AGENTS-07.

ADDED — ATLAS-P2-AGENTS-07. `ARCHITECTURE.md` §8's "Itinerary Planner
Agent — Purpose: Generate realistic travel plans" / `PRD.md` §7.3's
"Personalized Trip Planning."

## Composition, not independent generation

This task's own scope is explicit: "consuming Destination Intelligence
(`AGENTS-05`) and Budget (`AGENTS-06`) output." `ItineraryPlannerAgent`
is therefore constructed with **actual instances** of
`DestinationIntelligenceAgent` and `BudgetAgent` and calls their own
`reason()` methods directly during its own `reason()` — real agent-to-
agent composition, not a re-implementation of either agent's own logic.
`ItineraryPlan.destination`/`.budget` (`ai/schemas/itinerary.py`) hold
the literal objects those calls return, unmodified — this is the actual
mechanism behind this task's acceptance criterion ("budget figures
carry Budget Agent's own estimate disclosure forward, never restated as
confirmed"), not merely a documentation promise.

## Why the day-by-day schedule is a general template, not fabricated

`AI_EXPERIENCE.md` §Itinerary Generation lists 10 possible sections;
this task's own acceptance criterion scopes down to 6 achievable
without live data (overview/daily schedule/transportation/
accommodation/estimated costs/tips) — "Local recommendations,"
"Potential risks," "Weather considerations," and "Timeline generation"
are explicitly out of scope here (the last is its own module, per
`INDEX.md`'s `TIMELINE` entry; the others need live sources Phase 3
hasn't built yet). With no activity/venue database, naming specific
attractions, restaurants, or bookable activities would mean inventing
them — exactly what `GUIDELINES.md` §8 forbids. Instead, each day gets
a general, honestly-labeled THEME (`_MIDDLE_DAY_THEMES` below) the
traveler is expected to fill in themselves; only Day 1's own detail
text is genuinely grounded, reusing `AGENTS-05`'s own retrieved
destination description verbatim rather than writing something new
about that place.

## Tips reuse AGENTS-03's own already-curated content, verbatim

Rather than writing new "tips" content (a second content-curation
surface this task's own allowed files don't really call for), this
agent imports (read-only) three of `AGENTS-03`'s own already-reviewed
`CURATED_DOCUMENTS` entries and presents their `text` verbatim — zero
new fabrication surface, and no `ai/rag/`/`ai/tools/` file is touched
(same import-only pattern `AGENTS-05` established for `CuratedDocument`
itself).

## The rest of the design, briefly

Trip duration is parsed deterministically from the traveler's own text
(`_extract_trip_duration` — a plain regex, mirroring `AGENTS-06`'s own
`_extract_stated_budget` pattern exactly), defaulting to 3 days if
nothing is stated. Only the free-text `summary` is LLM-authored, given
a *fixed* set of already-computed facts, exactly matching every other
Phase 2 agent's established split between deterministic facts and
bounded prose synthesis.
"""

from __future__ import annotations

import re

from pydantic import BaseModel

from ai.agents.base import Agent
from ai.agents.budget_agent import BudgetAgent
from ai.agents.destination_intelligence_agent import DestinationIntelligenceAgent
from ai.prompts.itinerary_planner_prompt import ITINERARY_PLANNER_SYSTEM_PROMPT
from ai.providers.base import LLMMessage, LLMProvider
from ai.rag.knowledge_base import CURATED_DOCUMENTS
from ai.schemas.base import ConfidenceLevel
from ai.schemas.budget import BudgetEstimate
from ai.schemas.destination import DestinationOption, DestinationRecommendation
from ai.schemas.itinerary import ItineraryDay, ItineraryPlan

_DEFAULT_DURATION_DAYS = 3
_MIN_DURATION_DAYS = 1
_MAX_DURATION_DAYS = 30

_MIDDLE_DAY_THEMES: tuple[str, ...] = (
    "Explore local sights and attractions",
    "Local culture, food, and everyday life",
    "A flexible day to relax or add your own plans",
)

# Verbatim reuse of three of AGENTS-03's own already-curated documents —
# see this module's own docstring for why no new tip content is written here.
_TIP_DOCUMENT_IDS = ("DOC_PACKING_BASICS", "DOC_VISA_CHECK", "DOC_EMBASSY_REGISTRATION")
_TIPS: tuple[str, ...] = tuple(
    document.text for document in CURATED_DOCUMENTS if document.id in _TIP_DOCUMENT_IDS
)

_PROVENANCE_REASONING = (
    "Composed from AGENTS-05's own retrieved destination (if any) and AGENTS-06's own "
    "budget breakdown, plus a general day-by-day starting structure; no activity, "
    "venue, or price was invented."
)

_SCHEDULE_ADJUST_NOTE = (
    "The day-by-day plan below is a general starting structure to adjust — not a fixed "
    "or bookable schedule."
)

_NO_DESTINATION_UNCERTAINTY_NOTE = (
    "No destination was matched, so the plan below is fully generic — share more about "
    "where you'd like to go for a more grounded plan."
)

_DURATION_PATTERN = re.compile(
    r"(?P<num>\d+)\s*[- ]?\s*days?\b"
    r"|(?P<weeks_num>\d+)\s*[- ]?\s*weeks?\b"
    r"|\btwo\s+weeks\b"
    r"|\b(?:a|one)\s+week\b",
    re.IGNORECASE,
)


def _extract_trip_duration(text: str) -> int | None:
    """Deterministically parse a trip duration from free text — never
    an LLM call, mirroring `ai.agents.budget_agent._extract_stated_budget`'s
    own established pattern exactly."""
    match = _DURATION_PATTERN.search(text)
    if match is None:
        return None

    if match.group("num") is not None:
        days = int(match.group("num"))
    elif match.group("weeks_num") is not None:
        days = int(match.group("weeks_num")) * 7
    else:
        matched_text = match.group(0).lower()
        days = 14 if "two weeks" in matched_text else 7

    if days < _MIN_DURATION_DAYS or days > _MAX_DURATION_DAYS:
        return None
    return days


def _latest_user_message(messages: list[LLMMessage]) -> str:
    """Mirrors `ai.orchestrator.intent._latest_user_message`'s own
    logic exactly (private to its own module — see
    `ai/agents/destination_intelligence_agent.py`'s/`ai/agents/
    budget_agent.py`'s own identical helpers for the same,
    already-established reasoning)."""
    for message in reversed(messages):
        if message.role == "user":
            return message.content
    return ""


def _build_daily_schedule(
    duration_days: int, destination: DestinationOption | None
) -> tuple[ItineraryDay, ...]:
    if destination is not None:
        arrival_detail = f"Arrival in {destination.name}. {destination.description}"
    else:
        arrival_detail = (
            "Arrival day. Settle in and get oriented — no specific destination was "
            "matched yet, so adjust this once you have one in mind."
        )
    days = [ItineraryDay(day_number=1, theme="Arrival & Orientation", details=arrival_detail)]

    if duration_days == 1:
        return tuple(days)

    for day_number in range(2, duration_days):
        theme = _MIDDLE_DAY_THEMES[(day_number - 2) % len(_MIDDLE_DAY_THEMES)]
        days.append(
            ItineraryDay(
                day_number=day_number,
                theme=theme,
                details=f"{theme}. This is a general starting suggestion — adjust based "
                f"on your own interests.",
            )
        )

    days.append(
        ItineraryDay(day_number=duration_days, theme="Departure", details="Wrap up and travel home.")
    )
    return tuple(days)


def _build_transportation_notes(destination: DestinationOption | None) -> str:
    if destination is not None:
        return (
            f"Local transportation options (public transit, walking, ride-hailing) are "
            f"typically available in {destination.name} — check what's common before you "
            f"arrive."
        )
    return "Local transportation options vary by destination — check what's typically available once you've chosen one."


def _build_accommodation_notes(destination: DestinationOption | None) -> str:
    if destination is not None:
        return (
            f"Look for accommodation in {destination.name} that matches your travel "
            f"style, from budget-friendly to full-service options."
        )
    return "Accommodation options vary widely by destination and travel style, from budget-friendly to full-service."


class ItineraryQuery(BaseModel):
    """This agent's real input is the conversation `messages` `reason()`
    receives, forwarded as-is to the two agents it composes — no
    additional structured input is required, so this is deliberately a
    fieldless placeholder, matching every other Phase 2 agent's
    established pattern for the same situation."""


class ItineraryPlannerAgent(Agent):
    """Composes `DestinationIntelligenceAgent` and `BudgetAgent`'s own
    outputs into a general, honestly-labeled starting itinerary — never
    generating destination, activity, or price content of its own."""

    def __init__(
        self,
        provider: LLMProvider,
        destination_agent: DestinationIntelligenceAgent,
        budget_agent: BudgetAgent,
    ) -> None:
        super().__init__(
            provider,
            name="itinerary-planner-agent",
            intents=("plan my itinerary", "build my trip plan", "create an itinerary"),
        )
        self._destination_agent = destination_agent
        self._budget_agent = budget_agent

    @property
    def mission(self) -> str:
        return "Compose a general, honest starting itinerary from destination and budget agent output."

    @property
    def responsibilities(self) -> tuple[str, ...]:
        return (
            "Retrieve a candidate destination via the Destination Intelligence Agent.",
            "Retrieve a budget breakdown via the Budget Agent, disclosure included.",
            "Build a general, day-by-day starting structure — never a fabricated "
            "specific activity, venue, or price.",
        )

    @property
    def allowed_tools(self) -> tuple[str, ...]:
        # This agent never calls a tool directly — its two composed
        # agents each manage their own tool use (or lack of it).
        return ()

    @property
    def input_schema(self) -> type[BaseModel]:
        return ItineraryQuery

    @property
    def output_schema(self) -> type[BaseModel]:
        return ItineraryPlan

    @property
    def reasoning_rules(self) -> tuple[str, ...]:
        return (
            "Never invent a destination not returned by the Destination Intelligence Agent.",
            "Never invent a price — always carry the Budget Agent's own estimate and "
            "disclosure forward unchanged.",
            "The daily schedule is a general, adjustable starting structure, not a "
            "fixed or bookable plan.",
        )

    @property
    def system_prompt(self) -> str:
        return ITINERARY_PLANNER_SYSTEM_PROMPT

    async def reason(self, messages: list[LLMMessage]) -> BaseModel:
        destination_result = await self._destination_agent.reason(messages)
        assert isinstance(destination_result, DestinationRecommendation)
        budget_result = await self._budget_agent.reason(messages)
        assert isinstance(budget_result, BudgetEstimate)

        query_text = _latest_user_message(messages)
        duration_days = _extract_trip_duration(query_text) or _DEFAULT_DURATION_DAYS
        top_destination = destination_result.destinations[0] if destination_result.destinations else None

        daily_schedule = _build_daily_schedule(duration_days, top_destination)
        transportation_notes = _build_transportation_notes(top_destination)
        accommodation_notes = _build_accommodation_notes(top_destination)

        facts_text = self._render_facts(top_destination, duration_days, budget_result)
        llm_messages = self._with_system_prompt([LLMMessage(role="user", content=facts_text)])
        raw_summary = await self._provider.complete(llm_messages)

        return ItineraryPlan(
            summary=raw_summary.strip() or "Here is a general starting itinerary.",
            reasoning=_PROVENANCE_REASONING,
            confidence=self._compute_confidence(top_destination, budget_result),
            assumptions=(),
            uncertainty_notes=self._compute_uncertainty_notes(top_destination, budget_result),
            destination=top_destination,
            duration_days=duration_days,
            daily_schedule=daily_schedule,
            transportation_notes=transportation_notes,
            accommodation_notes=accommodation_notes,
            budget=budget_result,
            tips=_TIPS,
        )

    @staticmethod
    def _render_facts(
        destination: DestinationOption | None, duration_days: int, budget: BudgetEstimate
    ) -> str:
        lines = [f"Trip duration: {duration_days} day(s)."]
        if destination is not None:
            lines.append(f"Destination: {destination.name}. {destination.description}")
        else:
            lines.append("No destination was matched.")
        if budget.total_budget is not None:
            lines.append(f"Stated budget: {budget.total_budget:.2f} {budget.currency or ''}".rstrip())
        else:
            lines.append("No total budget was stated by the traveler.")
        lines.append(f"Budget disclosure: {budget.estimate_disclosure}")
        return "\n".join(lines)

    @staticmethod
    def _compute_confidence(
        destination: DestinationOption | None, budget: BudgetEstimate
    ) -> ConfidenceLevel:
        if destination is None:
            return ConfidenceLevel.LOW
        if budget.total_budget is not None:
            return ConfidenceLevel.HIGH
        return ConfidenceLevel.MEDIUM

    @staticmethod
    def _compute_uncertainty_notes(
        destination: DestinationOption | None, budget: BudgetEstimate
    ) -> tuple[str, ...]:
        notes = [_SCHEDULE_ADJUST_NOTE]
        if destination is None:
            notes.append(_NO_DESTINATION_UNCERTAINTY_NOTE)
        notes.extend(note for note in budget.uncertainty_notes if note not in notes)
        return tuple(notes)
