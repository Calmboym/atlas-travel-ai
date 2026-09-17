"""Destination schemas — ATLAS-P2-AGENTS-05.

ADDED — ATLAS-P2-AGENTS-05. `ai/agents/destination_intelligence_agent.py`'s
`output_schema`, per `AGENTS-02`'s own convention that a Core Agent's
`output_schema` builds on `ai.schemas.base.AgentOutputBase`.
"""

from __future__ import annotations

from pydantic import BaseModel, Field

from ai.schemas.base import AgentOutputBase


class DestinationOption(BaseModel):
    """One destination the agent is recommending or discussing.

    Every field is a direct pass-through of a single retrieved
    `ai.rag.schemas.RetrievedPassage` (`ai/agents/destination_intelligence_agent.py`'s
    own `reason()`) — never LLM-authored, so a destination can never
    appear here unless it was actually retrieved from the curated
    reference set (this task's own acceptance criterion: "never returns
    a destination not grounded in the retrieved static/curated set").
    """

    name: str = Field(..., description="The retrieved document's title, verbatim.")
    description: str = Field(..., description="The retrieved document's text, verbatim.")
    source_document_id: str = Field(
        ..., description="Traceability back to the exact curated document this came from."
    )
    relevance_score: float = Field(..., description="The retrieval similarity score, verbatim.")


class DestinationRecommendation(AgentOutputBase):
    """The Destination Intelligence Agent's structured output.

    `destinations` is built entirely from retrieval results — see
    `DestinationOption`'s own docstring for why that makes fabricating
    an unlisted destination structurally impossible, not merely
    discouraged by a prompt instruction.
    """

    destinations: tuple[DestinationOption, ...] = Field(default_factory=tuple)
