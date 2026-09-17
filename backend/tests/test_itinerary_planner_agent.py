"""Tests for the Itinerary Planner Agent — ATLAS-P2-AGENTS-07.

Runs against the same real local Qdrant server every prior Phase 2 RAG
test has used (via a real `DestinationIntelligenceAgent`), in a
dedicated test collection dropped after every test — matching
`test_destination_intelligence_agent.py`'s own established fixture
pattern.
"""

from __future__ import annotations

from collections.abc import AsyncGenerator, AsyncIterator

import pytest
from qdrant_client import AsyncQdrantClient

from ai.agents.budget_agent import BudgetAgent
from ai.agents.destination_intelligence_agent import (
    CURATED_DESTINATIONS,
    DestinationIntelligenceAgent,
    build_destination_search_tool,
)
from ai.agents.itinerary_planner_agent import (
    ItineraryPlannerAgent,
    ItineraryQuery,
    _extract_trip_duration,
)
from ai.orchestrator import AgentRegistry, Orchestrator
from ai.providers.base import LLMMessage, LLMProvider
from ai.rag.embeddings import HashingEmbeddingProvider
from ai.rag.vector_store import QdrantKnowledgeStore
from ai.schemas.base import ConfidenceLevel
from ai.schemas.itinerary import ItineraryPlan
from ai.tools.registry import ToolRegistry
from ai.tools.service import ToolService

_TEST_COLLECTION_NAME = "atlas_destination_reference_itinerary_test"
_FAKE_REPLY = "Here's a general plan to get you started on your trip."


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


@pytest.fixture
async def destination_agent() -> AsyncGenerator[DestinationIntelligenceAgent, None]:
    """A real `DestinationIntelligenceAgent`, backed by a real local
    Qdrant server, using a dedicated test collection dropped after
    every test — mirrors `test_destination_intelligence_agent.py`'s own
    `destination_store` fixture."""
    client = AsyncQdrantClient(host="localhost", port=6333)
    store = QdrantKnowledgeStore(
        client, HashingEmbeddingProvider(), collection_name=_TEST_COLLECTION_NAME
    )
    await store.index_documents(CURATED_DESTINATIONS)
    registry = ToolRegistry()
    registry.register(build_destination_search_tool(store))
    tool_service = ToolService(registry)
    try:
        yield DestinationIntelligenceAgent(FakeLLMProvider(reply="destination summary"), tool_service)
    finally:
        if await client.collection_exists(_TEST_COLLECTION_NAME):
            await client.delete_collection(_TEST_COLLECTION_NAME)
        await client.close()


def _build_planner(
    destination_agent: DestinationIntelligenceAgent, reply: str = _FAKE_REPLY
) -> tuple[ItineraryPlannerAgent, FakeLLMProvider]:
    provider = FakeLLMProvider(reply=reply)
    budget_agent = BudgetAgent(FakeLLMProvider(reply="budget summary"))
    return ItineraryPlannerAgent(provider, destination_agent, budget_agent), provider


# ---------------------------------------------------------------------------
# The 7 ARCHITECTURE.md §8 fields + AgentHandler shape
# ---------------------------------------------------------------------------


def test_agent_declares_no_allowed_tools(destination_agent: DestinationIntelligenceAgent) -> None:
    planner, _ = _build_planner(destination_agent)
    assert planner.allowed_tools == ()


def test_agent_schemas_are_the_expected_types(destination_agent: DestinationIntelligenceAgent) -> None:
    planner, _ = _build_planner(destination_agent)
    assert planner.input_schema is ItineraryQuery
    assert planner.output_schema is ItineraryPlan
    assert planner.name == "itinerary-planner-agent"
    assert "plan my itinerary" in planner.intents


# ---------------------------------------------------------------------------
# _extract_trip_duration — deterministic parsing, never LLM-derived
# ---------------------------------------------------------------------------


@pytest.mark.parametrize(
    ("text", "expected"),
    [
        ("5 days", 5),
        ("a 5-day trip", 5),
        ("10 day trip", 10),
        ("a week", 7),
        ("one week in Japan", 7),
        ("two weeks", 14),
        ("3 weeks", 21),
        ("What can I do in Paris?", None),
        ("I want to go for 45 days", None),  # out of the sane range
    ],
)
def test_extract_trip_duration(text: str, expected: int | None) -> None:
    assert _extract_trip_duration(text) == expected


# ---------------------------------------------------------------------------
# Genuine composition — real DestinationIntelligenceAgent + real BudgetAgent
# ---------------------------------------------------------------------------


async def test_reason_composes_a_real_destination_and_budget_result(
    destination_agent: DestinationIntelligenceAgent,
) -> None:
    planner, _ = _build_planner(destination_agent)

    result = await planner.reason(
        _user_messages("Plan a 5-day trip with historic temples. I have $2000.")
    )

    assert isinstance(result, ItineraryPlan)
    assert result.duration_days == 5
    assert result.destination is not None
    assert result.destination.name in {document.title for document in CURATED_DESTINATIONS}
    assert result.budget.total_budget == 2000.0
    assert result.budget.currency == "USD"
    # The core composition guarantee: this is AGENTS-06's own object,
    # disclosure included, not a re-statement.
    assert "rough, unverified starting point" in result.budget.estimate_disclosure
    assert len(result.daily_schedule) == 5
    assert [day.day_number for day in result.daily_schedule] == [1, 2, 3, 4, 5]
    assert result.daily_schedule[0].theme == "Arrival & Orientation"
    assert result.daily_schedule[-1].theme == "Departure"
    assert result.confidence == ConfidenceLevel.HIGH


async def test_day_one_details_reuse_the_retrieved_destination_description_verbatim(
    destination_agent: DestinationIntelligenceAgent,
) -> None:
    planner, _ = _build_planner(destination_agent)

    result = await planner.reason(_user_messages("temples and gardens, 4 days"))

    assert isinstance(result, ItineraryPlan)
    assert result.destination is not None
    assert result.destination.description in result.daily_schedule[0].details


async def test_uncertainty_notes_carry_forward_the_budget_agents_own_notes(
    destination_agent: DestinationIntelligenceAgent,
) -> None:
    planner, _ = _build_planner(destination_agent)

    result = await planner.reason(_user_messages("temples and gardens, 4 days, no budget yet"))

    assert isinstance(result, ItineraryPlan)
    assert result.budget.total_budget is None
    assert any("No total budget was stated" in note for note in result.uncertainty_notes)
    assert any("general starting structure" in note for note in result.uncertainty_notes)


async def test_reasoning_is_fixed_provenance_string_not_llm_output(
    destination_agent: DestinationIntelligenceAgent,
) -> None:
    planner, _ = _build_planner(destination_agent, reply="anything the model might say")
    result = await planner.reason(_user_messages("temples and gardens"))
    assert isinstance(result, ItineraryPlan)
    assert "AGENTS-05's own retrieved destination" in result.reasoning


async def test_tips_are_verbatim_curated_content(destination_agent: DestinationIntelligenceAgent) -> None:
    planner, _ = _build_planner(destination_agent)
    result = await planner.reason(_user_messages("temples and gardens"))
    assert isinstance(result, ItineraryPlan)
    assert len(result.tips) == 3
    assert all(len(tip) > 0 for tip in result.tips)


# ---------------------------------------------------------------------------
# No destination match — never fabricates one
# ---------------------------------------------------------------------------


async def test_reason_with_no_destination_match_leaves_destination_none(
    destination_agent: DestinationIntelligenceAgent,
) -> None:
    planner, _ = _build_planner(destination_agent)

    result = await planner.reason(_user_messages("zzqxv nonsense gibberish query xkjq"))

    assert isinstance(result, ItineraryPlan)
    assert result.destination is None
    assert result.confidence == ConfidenceLevel.LOW
    assert "no specific destination was matched" in result.daily_schedule[0].details
    assert any("No destination was matched" in note for note in result.uncertainty_notes)


async def test_facts_rendered_to_the_llm_say_no_destination_was_matched(
    destination_agent: DestinationIntelligenceAgent,
) -> None:
    planner, provider = _build_planner(destination_agent)

    await planner.reason(_user_messages("zzqxv nonsense gibberish query xkjq"))

    assert provider.received_messages is not None
    facts_text = provider.received_messages[1].content
    assert "No destination was matched." in facts_text


# ---------------------------------------------------------------------------
# Default duration when none is stated
# ---------------------------------------------------------------------------


async def test_reason_defaults_to_three_days_when_no_duration_stated(
    destination_agent: DestinationIntelligenceAgent,
) -> None:
    planner, _ = _build_planner(destination_agent)
    result = await planner.reason(_user_messages("temples and gardens"))
    assert isinstance(result, ItineraryPlan)
    assert result.duration_days == 3
    assert len(result.daily_schedule) == 3


# ---------------------------------------------------------------------------
# End-to-end through a real AgentRegistry/Orchestrator
# ---------------------------------------------------------------------------


async def test_agent_registers_and_dispatches_through_the_real_orchestrator(
    destination_agent: DestinationIntelligenceAgent,
) -> None:
    planner, _ = _build_planner(destination_agent)
    registry = AgentRegistry()
    registry.register(planner)
    orchestrator = Orchestrator(registry=registry)
    passthrough_provider = FakeLLMProvider(reply="should not be used")

    result = await orchestrator.dispatch(
        passthrough_provider, _user_messages("Can you plan my itinerary for temples and gardens?")
    )

    assert result.decision.selected_agent == "itinerary-planner-agent"
    assert _FAKE_REPLY in result.content
    assert passthrough_provider.received_messages is None
