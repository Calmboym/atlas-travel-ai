"""TravelerProfileSummary schema — ATLAS-P2-AGENTS-04.

ADDED — ATLAS-P2-AGENTS-04. `ai/agents/traveler_profile_agent.py`'s
`output_schema`, per `AGENTS-02`'s own convention that a Core Agent's
`output_schema` builds on `ai.schemas.base.AgentOutputBase`.
"""

from __future__ import annotations

from pydantic import Field

from ai.schemas.base import AgentOutputBase


class TravelerProfileSummary(AgentOutputBase):
    """A structured traveler-preference summary other Core Agents
    (`AGENTS-05` through `AGENTS-08`) can consume.

    Every field below is a direct, unmodified pass-through of
    `TravelerProfileAgent`'s own database reads (`traveler_profiles` —
    `PROF-02`; `user_memory` — `MEM-02`) — never LLM-authored, so their
    accuracy never depends on model behavior (`GUIDELINES.md` §8:
    "Never invent... availability", extended here to "never invent a
    traveler's own preferences either"). Only `summary` (inherited from
    `AgentOutputBase`) is LLM-synthesized prose describing them, under
    a prompt (`ai/prompts/traveler_profile_prompt.py`) that explicitly
    forbids adding anything beyond what it is given.
    """

    travel_preference: str | None = Field(
        default=None, description="`TravelerProfile.travel_preference.value`, verbatim, or None if unset."
    )
    budget_level: str | None = Field(
        default=None, description="`TravelerProfile.budget_level.value`, verbatim, or None if unset."
    )
    accommodation_preference: str | None = Field(
        default=None,
        description="`TravelerProfile.accommodation_preference.value`, verbatim, or None if unset.",
    )
    transportation_preference: str | None = Field(
        default=None,
        description="`TravelerProfile.transportation_preference.value`, verbatim, or None if unset.",
    )
    food_preferences: tuple[str, ...] = Field(
        default_factory=tuple, description="`TravelerProfile.food_preferences`, verbatim, or empty if unset."
    )
    preferred_travel_language: str | None = Field(
        default=None,
        description="`TravelerProfile.preferred_travel_language`, verbatim, or None if unset.",
    )
    memory_notes: tuple[str, ...] = Field(
        default_factory=tuple,
        description=(
            "One `\"key: value\"` string per entry in `UserMemory.data`, verbatim — "
            "never reinterpreted or expanded upon."
        ),
    )
