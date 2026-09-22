"""Recommendation schemas — ATLAS-P2-AGENTS-08.

ADDED — ATLAS-P2-AGENTS-08. `ai/agents/recommendation_agent.py`'s
`output_schema`, per `AGENTS-02`'s own convention that a Core Agent's
`output_schema` builds on `ai.schemas.base.AgentOutputBase`.

`Recommendation.destination` is **the actual `DestinationOption`
object retrieved by `AGENTS-05`'s own retrieval** (via a composed
`DestinationIntelligenceAgent`), not a new, re-derived candidate —
the same "carry the source agent's own object forward, unmodified"
mechanism `AGENTS-07` established for `ItineraryPlan.destination`/
`.budget`. A destination can therefore never appear here unless it
was already grounded in the curated reference set — this schema adds
no new fabrication surface of its own.
"""

from __future__ import annotations

from pydantic import BaseModel, Field

from ai.schemas.base import AgentOutputBase
from ai.schemas.destination import DestinationOption


class Recommendation(BaseModel):
    """One ranked, explained recommendation.

    `relevance_reasoning` is always specific to this one item — never a
    generic label (`PSYCHOLOGY_GUIDELINES.md` §15, Explainable AI:
    "Why this? Why now? Why for me?") — see
    `ai/agents/recommendation_agent.py`'s own `_build_relevance_reasoning`
    for exactly how it is built.
    """

    rank: int = Field(..., ge=1, description="1-based position in the curated, ranked list.")
    destination: DestinationOption
    relevance_reasoning: str = Field(
        ...,
        min_length=1,
        description="This item's own explanation — never a generic label like 'Recommended'.",
    )
    matched_preference: str | None = Field(
        default=None,
        description=(
            "The traveler's own saved preference value (e.g. 'adventure'), found as a "
            "literal, case-insensitive substring of this destination's own description — "
            "or None if no such overlap was found. Never a fabricated or inferred "
            "semantic 'fit' assessment — see this field's use in "
            "`ai/agents/recommendation_agent.py`'s own `_find_matched_preference`."
        ),
    )


class RecommendationList(AgentOutputBase):
    """The Recommendation Agent's structured output.

    `recommendations` is capped at `_MAX_RECOMMENDATIONS`
    (`ai/agents/recommendation_agent.py`) — a curated, ranked list,
    never an exhaustive one (`PSYCHOLOGY_GUIDELINES.md` §13, Decision
    Fatigue: "Instead of 100 hotels Recommend Top 5. Explain why.").
    """

    recommendations: tuple[Recommendation, ...] = Field(default_factory=tuple)
