"""Itinerary schemas — ATLAS-P2-AGENTS-07.

ADDED — ATLAS-P2-AGENTS-07. `ai/agents/itinerary_planner_agent.py`'s
`output_schema`, per `AGENTS-02`'s own convention that a Core Agent's
`output_schema` builds on `ai.schemas.base.AgentOutputBase`.

`ItineraryPlan.destination`/`.budget` are **the actual objects returned
by `AGENTS-05`'s and `AGENTS-06`'s own `reason()` calls**, not new
fields re-stating the same information — the literal mechanism behind
this task's own acceptance criterion ("budget figures carry Budget
Agent's own estimate disclosure forward, never restated as confirmed").
"""

from __future__ import annotations

from pydantic import BaseModel, Field

from ai.schemas.base import AgentOutputBase
from ai.schemas.budget import BudgetEstimate
from ai.schemas.destination import DestinationOption


class ItineraryDay(BaseModel):
    """One day of the general starting structure `ItineraryPlannerAgent`
    builds — never a claim about a specific bookable activity or venue
    (`ai/agents/itinerary_planner_agent.py`'s own docstring explains
    why)."""

    day_number: int = Field(..., ge=1)
    theme: str = Field(..., min_length=1)
    details: str = Field(..., min_length=1)


class ItineraryPlan(AgentOutputBase):
    """The Itinerary Planner Agent's structured output.

    `summary` (inherited from `AgentOutputBase`) fulfils
    `AI_EXPERIENCE.md` §Itinerary Generation's "Overview" requirement —
    a separate `overview` field would only restate it.
    """

    destination: DestinationOption | None = Field(
        default=None,
        description=(
            "The top match from AGENTS-05's own retrieval, verbatim — None if no "
            "curated destination matched the request. Never a new/invented destination."
        ),
    )
    duration_days: int = Field(..., ge=1)
    daily_schedule: tuple[ItineraryDay, ...] = Field(default_factory=tuple)
    transportation_notes: str = Field(..., min_length=1)
    accommodation_notes: str = Field(..., min_length=1)
    budget: BudgetEstimate = Field(
        ..., description="AGENTS-06's own output, verbatim, disclosure included."
    )
    tips: tuple[str, ...] = Field(
        default_factory=tuple,
        description="Verbatim text from AGENTS-03's own already-curated documents.",
    )
