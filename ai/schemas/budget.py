"""Budget schemas — ATLAS-P2-AGENTS-06.

ADDED — ATLAS-P2-AGENTS-06. `ai/agents/budget_agent.py`'s
`output_schema`, per `AGENTS-02`'s own convention that a Core Agent's
`output_schema` builds on `ai.schemas.base.AgentOutputBase`.
"""

from __future__ import annotations

from pydantic import BaseModel, Field

from ai.schemas.base import AgentOutputBase


class BudgetCategory(BaseModel):
    """One spending category within a budget allocation (`PRD.md` §7.9:
    "Spending categories")."""

    name: str = Field(..., min_length=1)
    allocated_percentage: float = Field(..., ge=0, le=100)
    allocated_amount: float | None = Field(
        default=None,
        description="Only populated when the traveler stated their own total budget — "
        "this agent never invents one.",
    )


class BudgetEstimate(AgentOutputBase):
    """The Budget Agent's structured output.

    `estimate_disclosure` is a **required, non-empty field** — Pydantic
    itself rejects a `BudgetEstimate` missing it — making this task's
    own hard acceptance gate ("every output includes an explicit,
    unambiguous uncertainty/estimate disclosure") mechanically
    enforced, not merely a prompt instruction a model could skip.
    """

    total_budget: float | None = Field(
        default=None,
        description="The traveler's own stated total, verbatim as parsed — never invented.",
    )
    currency: str | None = Field(
        default=None, description="A 3-letter currency code, only when clearly stated or symbolized."
    )
    categories: tuple[BudgetCategory, ...] = Field(default_factory=tuple)
    estimate_disclosure: str = Field(
        ...,
        min_length=1,
        description=(
            "A fixed, deterministic statement that every figure here is a rough, "
            "unverified estimate — never model-authored, always present."
        ),
    )
