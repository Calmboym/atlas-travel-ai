"""Tests for the Budget Agent — ATLAS-P2-AGENTS-06.

No external infrastructure needed beyond a `FakeLLMProvider` — this
agent computes entirely from parsed user text and a fixed internal
split, unlike `AGENTS-05` (no Qdrant, no tools).
"""

from __future__ import annotations

from collections.abc import AsyncIterator

import pytest
from pydantic import ValidationError

from ai.agents.budget_agent import BudgetAgent, BudgetQuery, _extract_stated_budget
from ai.orchestrator import AgentRegistry, Orchestrator
from ai.providers.base import LLMMessage, LLMProvider
from ai.schemas.base import ConfidenceLevel
from ai.schemas.budget import BudgetEstimate

_FAKE_REPLY = "About 30% of your budget is a reasonable starting point for accommodation."


class FakeLLMProvider(LLMProvider):
    """Test double — never touches the network. Mirrors every other
    Phase 2 test file's own `FakeLLMProvider`."""

    def __init__(self, reply: str = _FAKE_REPLY) -> None:
        self._reply = reply
        self.received_messages: list[LLMMessage] | None = None

    @property
    def model_name(self) -> str:
        return "fake-model-for-tests"

    async def complete(self, messages: list[LLMMessage]) -> str:
        self.received_messages = messages
        return self._reply

    async def stream_complete(self, messages: list[LLMMessage]) -> AsyncIterator[str]:
        raise NotImplementedError("Not exercised by these tests.")
        yield  # pragma: no cover - unreachable, satisfies the AsyncIterator shape


def _user_messages(*texts: str) -> list[LLMMessage]:
    return [LLMMessage(role="user", content=text) for text in texts]


# ---------------------------------------------------------------------------
# The 7 ARCHITECTURE.md §8 fields + AgentHandler shape
# ---------------------------------------------------------------------------


def test_agent_declares_no_allowed_tools() -> None:
    agent = BudgetAgent(FakeLLMProvider())
    assert agent.allowed_tools == ()


def test_agent_schemas_are_the_expected_types() -> None:
    agent = BudgetAgent(FakeLLMProvider())
    assert agent.input_schema is BudgetQuery
    assert agent.output_schema is BudgetEstimate
    assert agent.name == "budget-agent"
    assert "estimate my budget" in agent.intents


# ---------------------------------------------------------------------------
# _extract_stated_budget — deterministic parsing, never LLM-derived
# ---------------------------------------------------------------------------


@pytest.mark.parametrize(
    ("text", "expected_amount", "expected_currency"),
    [
        ("I have $2000 for this trip", 2000.0, "USD"),
        ("My budget is around 1500 euros", 1500.0, "EUR"),
        ("I have about 800 pounds to spend", 800.0, "GBP"),
        ("2,000 USD total", 2000.0, "USD"),
        ("budget of $1,250.50", 1250.5, "USD"),
        ("What can I do in Paris?", None, None),
        ("I want to spend \u20ac900 on this trip", 900.0, "EUR"),
        ("around 3000 dollars", 3000.0, "USD"),
    ],
)
def test_extract_stated_budget(
    text: str, expected_amount: float | None, expected_currency: str | None
) -> None:
    amount, currency = _extract_stated_budget(text)
    assert amount == expected_amount
    assert currency == expected_currency


# ---------------------------------------------------------------------------
# The hard acceptance gate: estimate_disclosure is always present
# ---------------------------------------------------------------------------


def test_budget_estimate_requires_a_non_empty_estimate_disclosure() -> None:
    with pytest.raises(ValidationError):
        BudgetEstimate(
            summary="s",
            reasoning="r",
            confidence=ConfidenceLevel.LOW,
            estimate_disclosure="",  # empty — must be rejected
        )


async def test_reason_always_includes_the_fixed_estimate_disclosure() -> None:
    agent = BudgetAgent(FakeLLMProvider())

    with_total = await agent.reason(_user_messages("I have $2000 for this trip"))
    without_total = await agent.reason(_user_messages("What can I do in Paris?"))

    assert isinstance(with_total, BudgetEstimate)
    assert isinstance(without_total, BudgetEstimate)
    assert "rough, unverified starting point" in with_total.estimate_disclosure
    assert with_total.estimate_disclosure == without_total.estimate_disclosure
    assert with_total.estimate_disclosure in with_total.uncertainty_notes
    assert without_total.estimate_disclosure in without_total.uncertainty_notes


async def test_reasoning_is_fixed_provenance_string_not_llm_output() -> None:
    agent = BudgetAgent(FakeLLMProvider(reply="anything the model might say"))
    result = await agent.reason(_user_messages("I have $2000 for this trip"))
    assert isinstance(result, BudgetEstimate)
    assert "no price was looked up, estimated, or invented" in result.reasoning


# ---------------------------------------------------------------------------
# A stated total — deterministic allocation, never LLM-derived numbers
# ---------------------------------------------------------------------------


async def test_reason_with_a_stated_total_allocates_across_categories_exactly() -> None:
    agent = BudgetAgent(FakeLLMProvider())

    result = await agent.reason(_user_messages("I have $2000 for this trip"))

    assert isinstance(result, BudgetEstimate)
    assert result.total_budget == 2000.0
    assert result.currency == "USD"
    assert result.confidence == ConfidenceLevel.HIGH
    assert len(result.categories) == 5
    percentages = {category.name: category.allocated_percentage for category in result.categories}
    assert percentages["Accommodation"] == 30.0
    assert sum(percentages.values()) == 100.0
    amounts = {category.name: category.allocated_amount for category in result.categories}
    assert amounts["Accommodation"] == 600.0  # 30% of 2000
    assert sum(a for a in amounts.values() if a is not None) == pytest.approx(2000.0)


async def test_facts_rendered_to_the_llm_never_contain_an_amount_not_in_the_total() -> None:
    provider = FakeLLMProvider()
    agent = BudgetAgent(provider)

    await agent.reason(_user_messages("My budget is around 1500 euros"))

    assert provider.received_messages is not None
    facts_text = provider.received_messages[1].content
    assert "1500.00 EUR" in facts_text
    assert "450.00 EUR" in facts_text  # 30% of 1500 for Accommodation


# ---------------------------------------------------------------------------
# No stated total — never an invented number
# ---------------------------------------------------------------------------


async def test_reason_with_no_stated_total_invents_no_amount() -> None:
    agent = BudgetAgent(FakeLLMProvider())

    result = await agent.reason(_user_messages("What should I pack for a beach trip?"))

    assert isinstance(result, BudgetEstimate)
    assert result.total_budget is None
    assert result.currency is None
    assert result.confidence == ConfidenceLevel.LOW
    assert all(category.allocated_amount is None for category in result.categories)
    # Percentages are still shown — that part of the split is general, not invented.
    assert {c.name for c in result.categories} == {
        "Accommodation",
        "Transportation",
        "Food & Dining",
        "Activities & Experiences",
        "Miscellaneous & Buffer",
    }
    assert any("No total budget was stated" in note for note in result.uncertainty_notes)


async def test_facts_rendered_to_the_llm_say_no_total_was_stated() -> None:
    provider = FakeLLMProvider()
    agent = BudgetAgent(provider)

    await agent.reason(_user_messages("What should I pack for a beach trip?"))

    assert provider.received_messages is not None
    facts_text = provider.received_messages[1].content
    assert "No total budget was stated by the traveler." in facts_text


async def test_bare_number_without_a_currency_indicator_is_not_treated_as_a_budget() -> None:
    """The regex intentionally requires a currency symbol or word — a
    bare number alone (e.g. trip length, traveler count) is never
    guessed to be a budget figure, since that false positive would be
    worse than not extracting one at all."""
    agent = BudgetAgent(FakeLLMProvider())
    result = await agent.reason(_user_messages("I have 2000 to spend, no idea on currency"))
    assert isinstance(result, BudgetEstimate)
    assert result.total_budget is None


# ---------------------------------------------------------------------------
# End-to-end through a real AgentRegistry/Orchestrator
# ---------------------------------------------------------------------------


async def test_agent_registers_and_dispatches_through_the_real_orchestrator() -> None:
    agent = BudgetAgent(FakeLLMProvider())
    registry = AgentRegistry()
    registry.register(agent)
    orchestrator = Orchestrator(registry=registry)
    passthrough_provider = FakeLLMProvider(reply="should not be used")

    result = await orchestrator.dispatch(
        passthrough_provider, _user_messages("Can you help me estimate my budget? I have $1000.")
    )

    assert result.decision.selected_agent == "budget-agent"
    assert _FAKE_REPLY in result.content
    assert passthrough_provider.received_messages is None
