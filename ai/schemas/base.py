"""Base structured-output schema for Core Agents — ATLAS-P2-AGENTS-02.

ADDED — ATLAS-P2-AGENTS-02. First real content under `ai/schemas/`
(previously `.gitkeep` only — confirmed empty by `ATLAS-P2-AGENTS-01`'s
own verification and `WORK_BREAKDOWN_STRUCTURE.md`'s Phase 2
"infrastructure this module reuses" note: "`ai/schemas/` and
`ai/evaluations/` are both still empty").

Operationalizes two Design Bible requirements as real, validated
Pydantic fields rather than prose guidance a model response could
silently skip:

- `AI_EXPERIENCE.md` §Explainability: "When Atlas makes a
  recommendation, it should explain: Why it was selected. What
  assumptions were used. Possible alternatives. Confidence level if
  applicable."
- `AI_EXPERIENCE.md` §Uncertainty / `BRAND_GUIDELINES.md` §8 (Trust):
  "If Atlas is uncertain: State the uncertainty clearly... Never
  fabricate facts" — matching `GUIDELINES.md` §8's AI Safety Rules
  ("Never invent prices... Never invent visa requirements... Never
  fabricate availability").

Every Core Agent's `output_schema` (`AGENTS-04` through `AGENTS-08`,
each in their own `ai/schemas/*.py` file, per
`WORK_BREAKDOWN_STRUCTURE.md`) is expected to subclass
`AgentOutputBase` below and add whatever domain-specific fields it
needs — this file defines only the shared contract, not any
agent-specific shape (that would anticipate those tasks' own scope,
the same over-reach `AGENTS-01` deliberately avoided for `AGENTS-02`'s
own base `Agent` class).
"""

from __future__ import annotations

from enum import Enum

from pydantic import BaseModel, Field


class ConfidenceLevel(str, Enum):
    """How confident a Core Agent is in its own output.

    A closed set of three real, ordered values — not a bare `float`
    with no shared meaning across agents, and not a `str` an agent
    could populate with an arbitrary, unparseable phrase. Matches
    `AI_EXPERIENCE.md` §Explainability's "Confidence level if
    applicable".
    """

    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class AgentOutputBase(BaseModel):
    """The structured-output contract every Core Agent's `output_schema`
    is expected to build on.

    Real Pydantic validation, not a `dict[str, Any]` escape hatch
    (this task's acceptance criterion, `WORK_BREAKDOWN_STRUCTURE.md`):
    `summary`/`reasoning` must be non-empty strings, `confidence` must
    be one of `ConfidenceLevel`'s three real values, and
    `assumptions`/`uncertainty_notes` are typed tuples of strings a
    caller can render or inspect directly — an agent cannot return an
    empty `summary` or an unparseable confidence value and have it pass
    validation silently.
    """

    summary: str = Field(
        ...,
        min_length=1,
        description=(
            "The direct answer or recommendation, in Atlas's own voice "
            "(COPYWRITING_GUIDELINES.md) — the first thing a user reads."
        ),
    )
    reasoning: str = Field(
        ...,
        min_length=1,
        description=(
            "Why this was selected — AI_EXPERIENCE.md §Explainability's "
            "'Why this? Why now? Why for me?'"
        ),
    )
    confidence: ConfidenceLevel = Field(
        ...,
        description="AI_EXPERIENCE.md §Explainability's 'Confidence level if applicable'.",
    )
    assumptions: tuple[str, ...] = Field(
        default_factory=tuple,
        description="What assumptions were used, if any (AI_EXPERIENCE.md §Explainability).",
    )
    uncertainty_notes: tuple[str, ...] = Field(
        default_factory=tuple,
        description=(
            "Explicit statements of what could not be verified or is an "
            "estimate — never silently omitted (GUIDELINES.md §8; "
            "AI_EXPERIENCE.md §Uncertainty)."
        ),
    )
