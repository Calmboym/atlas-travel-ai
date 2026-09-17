"""Budget Agent — ATLAS-P2-AGENTS-06.

ADDED — ATLAS-P2-AGENTS-06. `ARCHITECTURE.md` §8's "Budget Agent —
Purpose: Cost estimation and optimization" / `PRD.md` §7.9's "Currency
and Budget Planning" ("Trip budget estimation... Spending categories").

## Why this agent never invents a price

`GUIDELINES.md` §8's AI Safety Rules are explicit: "Never invent
prices." This task's own scope note is equally explicit: "no real
pricing exists until Phase 3's Flight/Hotel adapters" — there is no
live or curated pricing data source available to this agent at all
(unlike `AGENTS-05`, which had a curated *reference* set to ground
against; no equivalent exists for prices, and inventing one would mean
fabricating exactly the kind of specific, falsifiable claim
`GUIDELINES.md` §8 forbids).

Given that, this agent's only honest source of a concrete number is
**the traveler's own stated total** — parsed deterministically from
their message via `_extract_stated_budget` below (a plain regex, no
LLM involved in recognizing the number itself), then allocated across
spending categories using a fixed, general, commonly-used percentage
split (`_CATEGORY_SPLIT` below — a personal-finance-style budgeting
heuristic, not a claim about any destination's actual costs, the same
category of general/evergreen technique `AI_EXPERIENCE.md`'s own
"Budget Assistance" section describes: "Atlas continuously estimates:
Planned budget... Remaining budget"). If no total is stated, no amount
is ever invented — only the general percentage split is shown, with no
currency figure attached at all.

## The rest of the design, briefly

Only the free-text `summary` is LLM-authored, exactly matching
`AGENTS-04`/`AGENTS-05`'s own established pattern: the model is given a
*fixed*, already-computed breakdown and asked only to describe it —
never asked to compute or add a number. `estimate_disclosure`
(`ai/schemas/budget.py`) is a required, non-empty field — this task's
own hard acceptance gate ("every output includes an explicit,
unambiguous uncertainty/estimate disclosure") is enforced by Pydantic
itself, not left to prompt-following discipline.
"""

from __future__ import annotations

import re

from pydantic import BaseModel

from ai.agents.base import Agent
from ai.prompts.budget_prompt import BUDGET_SYSTEM_PROMPT
from ai.providers.base import LLMMessage, LLMProvider
from ai.schemas.base import ConfidenceLevel
from ai.schemas.budget import BudgetCategory, BudgetEstimate

# A general, commonly-used travel-budgeting starting split — a
# personal-finance-style heuristic, not destination-specific pricing
# data. Sums to 100.
_CATEGORY_SPLIT: tuple[tuple[str, float], ...] = (
    ("Accommodation", 30.0),
    ("Transportation", 20.0),
    ("Food & Dining", 20.0),
    ("Activities & Experiences", 20.0),
    ("Miscellaneous & Buffer", 10.0),
)

_ESTIMATE_DISCLOSURE = (
    "This is a rough, unverified starting point based on a commonly used budgeting "
    "split — not a real, current, or bookable price. Atlas does not yet have access "
    "to live pricing data; actual costs will vary by destination, season, and provider."
)

_PROVENANCE_REASONING = (
    "Computed by allocating the traveler's own stated total (if any) across a fixed, "
    "general spending-category split; no price was looked up, estimated, or invented."
)

_NO_TOTAL_UNCERTAINTY_NOTE = (
    "No total budget was stated, so no currency amount is shown — share a target "
    "budget for a breakdown with actual figures."
)

_SYMBOL_TO_CURRENCY = {"$": "USD", "€": "EUR", "£": "GBP"}
_WORD_TO_CURRENCY = {
    "dollars": "USD",
    "usd": "USD",
    "euros": "EUR",
    "eur": "EUR",
    "pounds": "GBP",
    "gbp": "GBP",
}

_AMOUNT_PATTERN = re.compile(
    r"(?P<symbol>[$€£])\s*(?P<amount1>[\d][\d,]*(?:\.\d+)?)"
    r"|(?P<amount2>[\d][\d,]*(?:\.\d+)?)\s*(?P<word>dollars|usd|euros|eur|pounds|gbp)\b",
    re.IGNORECASE,
)


def _extract_stated_budget(text: str) -> tuple[float | None, str | None]:
    """Deterministically parse a currency amount from free text —
    never an LLM call, so the number returned can only ever be one the
    traveler actually typed. Returns `(amount, currency_code)`; either
    or both may be `None` if nothing was found."""
    match = _AMOUNT_PATTERN.search(text)
    if match is None:
        return None, None

    if match.group("amount1") is not None:
        raw_amount = match.group("amount1")
        currency = _SYMBOL_TO_CURRENCY.get(match.group("symbol"))
    else:
        raw_amount = match.group("amount2")
        currency = _WORD_TO_CURRENCY.get((match.group("word") or "").lower())

    try:
        amount = float(raw_amount.replace(",", ""))
    except ValueError:  # pragma: no cover - regex guarantees a numeric string
        return None, None
    return amount, currency


def _latest_user_message(messages: list[LLMMessage]) -> str:
    """Mirrors `ai.orchestrator.intent._latest_user_message`'s own
    logic exactly (private to its own module — see
    `ai/agents/destination_intelligence_agent.py`'s own identical
    helper for the same, already-established reasoning)."""
    for message in reversed(messages):
        if message.role == "user":
            return message.content
    return ""


class BudgetQuery(BaseModel):
    """This agent's real input is the conversation `messages` `reason()`
    receives (the latest user message is parsed for a stated total) —
    no additional structured input is required, so this is deliberately
    a fieldless placeholder, matching `AGENTS-04`/`AGENTS-05`'s own
    established pattern for the same situation."""


class BudgetAgent(Agent):
    """Allocates a traveler's own stated budget across general spending
    categories — or, absent a stated total, shows the general category
    split alone. Never invents a price (see this module's own
    docstring)."""

    def __init__(self, provider: LLMProvider) -> None:
        super().__init__(
            provider,
            name="budget-agent",
            intents=("budget for this trip", "how much will this cost", "estimate my budget"),
        )

    @property
    def mission(self) -> str:
        return "Help travelers plan a budget breakdown, always clearly as a rough estimate."

    @property
    def responsibilities(self) -> tuple[str, ...]:
        return (
            "Parse a traveler-stated total budget, if one was given.",
            "Allocate that total across general spending categories using a fixed, "
            "general split.",
            "Always disclose that every figure shown is a rough, unverified estimate.",
        )

    @property
    def allowed_tools(self) -> tuple[str, ...]:
        # This agent computes entirely from the traveler's own stated
        # total plus a fixed internal split — it has no need for any
        # AGENTS-03 tool.
        return ()

    @property
    def input_schema(self) -> type[BaseModel]:
        return BudgetQuery

    @property
    def output_schema(self) -> type[BaseModel]:
        return BudgetEstimate

    @property
    def reasoning_rules(self) -> tuple[str, ...]:
        return (
            "Never invent a price, a total, or a percentage not derivable from the "
            "traveler's own stated total and the fixed category split.",
            "Never present a figure as confirmed, booked, or verified.",
            "Always include an explicit, unambiguous estimate disclosure.",
        )

    @property
    def system_prompt(self) -> str:
        return BUDGET_SYSTEM_PROMPT

    async def reason(self, messages: list[LLMMessage]) -> BaseModel:
        query_text = _latest_user_message(messages)
        total_budget, currency = _extract_stated_budget(query_text)

        categories = tuple(
            BudgetCategory(
                name=name,
                allocated_percentage=percentage,
                allocated_amount=(
                    round(total_budget * percentage / 100, 2) if total_budget is not None else None
                ),
            )
            for name, percentage in _CATEGORY_SPLIT
        )

        facts_text = self._render_facts(total_budget, currency, categories)
        llm_messages = self._with_system_prompt([LLMMessage(role="user", content=facts_text)])
        raw_summary = await self._provider.complete(llm_messages)

        return BudgetEstimate(
            summary=raw_summary.strip() or "Here is a general budget category breakdown.",
            reasoning=_PROVENANCE_REASONING,
            confidence=ConfidenceLevel.HIGH if total_budget is not None else ConfidenceLevel.LOW,
            assumptions=(),
            uncertainty_notes=self._compute_uncertainty_notes(total_budget),
            total_budget=total_budget,
            currency=currency,
            categories=categories,
            estimate_disclosure=_ESTIMATE_DISCLOSURE,
        )

    @staticmethod
    def _render_facts(
        total_budget: float | None, currency: str | None, categories: tuple[BudgetCategory, ...]
    ) -> str:
        lines = [
            f"- {category.name}: {category.allocated_percentage:.0f}%"
            + (
                f" ({category.allocated_amount:.2f} {currency or ''})".rstrip()
                if category.allocated_amount is not None
                else ""
            )
            for category in categories
        ]
        header = (
            f"Traveler's stated total: {total_budget:.2f} {currency or '(currency not stated)'}"
            if total_budget is not None
            else "No total budget was stated by the traveler."
        )
        return header + "\nCategory split:\n" + "\n".join(lines)

    @staticmethod
    def _compute_uncertainty_notes(total_budget: float | None) -> tuple[str, ...]:
        # Note: `_extract_stated_budget`'s regex only ever returns a
        # non-None currency alongside a non-None `total_budget` (both
        # of its alternatives require a currency symbol or word to
        # match at all) — there is intentionally no bare-number
        # fallback, since guessing that an unrelated number (trip
        # length, traveler count) is a budget figure would be a worse
        # mistake than not extracting one. So there is no separate
        # "amount found but currency unclear" case to report here.
        if total_budget is None:
            return (_ESTIMATE_DISCLOSURE, _NO_TOTAL_UNCERTAINTY_NOTE)
        return (_ESTIMATE_DISCLOSURE,)
