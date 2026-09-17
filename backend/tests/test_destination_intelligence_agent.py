"""Tests for the Destination Intelligence Agent — ATLAS-P2-AGENTS-05.

Runs against the same real local Qdrant 1.19.1 server every prior
Phase 2 RAG test has used (`localhost:6333`), in a dedicated test
collection dropped after every test — this suite never touches
`AGENTS-03`'s own `atlas_knowledge_base` collection or this agent's own
production collection name.
"""

from __future__ import annotations

from collections.abc import AsyncGenerator, AsyncIterator

import pytest
from qdrant_client import AsyncQdrantClient

from ai.agents.destination_intelligence_agent import (
    CURATED_DESTINATIONS,
    DESTINATION_SEARCH_TOOL_NAME,
    DestinationIntelligenceAgent,
    DestinationIntelligenceQuery,
    _DESTINATION_COLLECTION_NAME,
    build_destination_knowledge_store,
    build_destination_search_tool,
)
from ai.orchestrator import AgentRegistry, Orchestrator
from ai.providers.base import LLMMessage, LLMProvider
from ai.rag.embeddings import HashingEmbeddingProvider
from ai.rag.vector_store import QdrantKnowledgeStore
from ai.schemas.base import ConfidenceLevel
from ai.schemas.destination import DestinationRecommendation
from ai.tools.registry import ToolRegistry
from ai.tools.service import ToolService
from ai.tools.types import ToolPermissionError

_TEST_COLLECTION_NAME = "atlas_destination_reference_test"
_FAKE_REPLY = "Kyoto and Chiang Mai both offer historic temples if that's what you're after."
_CURATED_TITLES = {document.title for document in CURATED_DESTINATIONS}


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
async def destination_store() -> AsyncGenerator[QdrantKnowledgeStore, None]:
    """A destination-reference `QdrantKnowledgeStore` against the real
    local Qdrant server, pre-populated with `CURATED_DESTINATIONS`,
    using a dedicated test collection dropped after every test."""
    client = AsyncQdrantClient(host="localhost", port=6333)
    store = QdrantKnowledgeStore(
        client, HashingEmbeddingProvider(), collection_name=_TEST_COLLECTION_NAME
    )
    await store.index_documents(CURATED_DESTINATIONS)
    try:
        yield store
    finally:
        if await client.collection_exists(_TEST_COLLECTION_NAME):
            await client.delete_collection(_TEST_COLLECTION_NAME)
        await client.close()


def _build_tool_service(store: QdrantKnowledgeStore) -> ToolService:
    registry = ToolRegistry()
    registry.register(build_destination_search_tool(store))
    return ToolService(registry)


# ---------------------------------------------------------------------------
# The 7 ARCHITECTURE.md §8 fields + AgentHandler shape
# ---------------------------------------------------------------------------


def test_agent_allows_only_the_destination_search_tool(destination_store: QdrantKnowledgeStore) -> None:
    tool_service = _build_tool_service(destination_store)
    agent = DestinationIntelligenceAgent(FakeLLMProvider(), tool_service)
    assert agent.allowed_tools == (DESTINATION_SEARCH_TOOL_NAME,)


def test_agent_schemas_are_the_expected_types(destination_store: QdrantKnowledgeStore) -> None:
    tool_service = _build_tool_service(destination_store)
    agent = DestinationIntelligenceAgent(FakeLLMProvider(), tool_service)
    assert agent.input_schema is DestinationIntelligenceQuery
    assert agent.output_schema is DestinationRecommendation
    assert agent.name == "destination-intelligence-agent"
    assert "where should i go" in agent.intents


# ---------------------------------------------------------------------------
# A query with a genuine match in the curated set
# ---------------------------------------------------------------------------


async def test_reason_with_a_matching_query_returns_grounded_destinations(
    destination_store: QdrantKnowledgeStore,
) -> None:
    tool_service = _build_tool_service(destination_store)
    agent = DestinationIntelligenceAgent(FakeLLMProvider(), tool_service)

    result = await agent.reason(_user_messages("I want to see historic temples in Japan"))

    assert isinstance(result, DestinationRecommendation)
    assert len(result.destinations) > 0
    # The core anti-fabrication guarantee, checked mechanically: every
    # returned destination name is one of the actual curated titles.
    for option in result.destinations:
        assert option.name in _CURATED_TITLES
    assert any(option.name == "Kyoto, Japan" for option in result.destinations)
    assert result.confidence in (ConfidenceLevel.MEDIUM, ConfidenceLevel.HIGH)


async def test_reason_never_returns_a_destination_outside_the_curated_set(
    destination_store: QdrantKnowledgeStore,
) -> None:
    """A second, differently-worded query — the same mechanical
    fabrication-proof check, to reduce the chance of a single lucky
    pass."""
    tool_service = _build_tool_service(destination_store)
    agent = DestinationIntelligenceAgent(FakeLLMProvider(), tool_service)

    result = await agent.reason(_user_messages("mountains, alpine lakes, and adventure sports"))

    assert isinstance(result, DestinationRecommendation)
    for option in result.destinations:
        assert option.name in _CURATED_TITLES
        assert option.source_document_id in {document.id for document in CURATED_DESTINATIONS}


async def test_reason_includes_the_verify_specifics_uncertainty_note(
    destination_store: QdrantKnowledgeStore,
) -> None:
    tool_service = _build_tool_service(destination_store)
    agent = DestinationIntelligenceAgent(FakeLLMProvider(), tool_service)

    result = await agent.reason(_user_messages("temples and gardens"))

    assert isinstance(result, DestinationRecommendation)
    assert any("not verified here" in note for note in result.uncertainty_notes)


async def test_reasoning_is_fixed_provenance_string_not_llm_output(
    destination_store: QdrantKnowledgeStore,
) -> None:
    tool_service = _build_tool_service(destination_store)
    agent = DestinationIntelligenceAgent(FakeLLMProvider(reply="anything the model might say"), tool_service)

    result = await agent.reason(_user_messages("temples and gardens"))

    assert isinstance(result, DestinationRecommendation)
    assert "Selected from Atlas's curated destination reference set" in result.reasoning


# ---------------------------------------------------------------------------
# A query with no good match
# ---------------------------------------------------------------------------


async def test_reason_with_no_match_returns_no_destinations_and_low_confidence(
    destination_store: QdrantKnowledgeStore,
) -> None:
    tool_service = _build_tool_service(destination_store)
    agent = DestinationIntelligenceAgent(FakeLLMProvider(), tool_service)

    result = await agent.reason(_user_messages("zzqxv nonsense gibberish query xkjq"))

    assert isinstance(result, DestinationRecommendation)
    assert result.destinations == ()
    assert result.confidence == ConfidenceLevel.LOW
    assert any("No candidate destinations matched" in note for note in result.uncertainty_notes)


async def test_facts_rendered_to_the_llm_forbid_inventing_a_destination_when_no_match(
    destination_store: QdrantKnowledgeStore,
) -> None:
    tool_service = _build_tool_service(destination_store)
    provider = FakeLLMProvider()
    agent = DestinationIntelligenceAgent(provider, tool_service)

    await agent.reason(_user_messages("zzqxv nonsense gibberish query xkjq"))

    assert provider.received_messages is not None
    facts_text = provider.received_messages[1].content
    assert "No candidate destinations were found" in facts_text
    assert "Do not name any destination" in facts_text


# ---------------------------------------------------------------------------
# Permission enforcement (wiring-specific — ToolService's own generic
# behavior is already covered by test_tools_rag.py)
# ---------------------------------------------------------------------------


async def test_agent_cannot_call_destination_search_if_not_registered(
    destination_store: QdrantKnowledgeStore,
) -> None:
    from ai.tools.types import ToolNotFoundError

    empty_registry = ToolRegistry()  # destination_search never registered
    tool_service = ToolService(empty_registry)
    agent = DestinationIntelligenceAgent(FakeLLMProvider(), tool_service)

    with pytest.raises(ToolNotFoundError):  # permission passes (it's in allowed_tools), lookup fails
        await agent.reason(_user_messages("temples and gardens"))


async def test_tool_service_denies_a_different_agents_permission_boundary(
    destination_store: QdrantKnowledgeStore,
) -> None:
    """Confirms `destination_search` really is gated by `allowed_tools`,
    not just present in the registry — using `ToolService` directly
    against an agent whose `allowed_tools` doesn't include it."""
    from ai.rag.schemas import RAGQuery

    class _NoToolsAgent(DestinationIntelligenceAgent):
        @property
        def allowed_tools(self) -> tuple[str, ...]:
            return ()

    tool_service = _build_tool_service(destination_store)
    restricted_agent = _NoToolsAgent(FakeLLMProvider(), tool_service)

    with pytest.raises(ToolPermissionError):
        await tool_service.invoke(
            restricted_agent, DESTINATION_SEARCH_TOOL_NAME, RAGQuery(query="temples")
        )


# ---------------------------------------------------------------------------
# End-to-end through a real AgentRegistry/Orchestrator
# ---------------------------------------------------------------------------


async def test_agent_registers_and_dispatches_through_the_real_orchestrator(
    destination_store: QdrantKnowledgeStore,
) -> None:
    tool_service = _build_tool_service(destination_store)
    agent = DestinationIntelligenceAgent(FakeLLMProvider(), tool_service)

    registry = AgentRegistry()
    registry.register(agent)
    orchestrator = Orchestrator(registry=registry)
    passthrough_provider = FakeLLMProvider(reply="should not be used")

    result = await orchestrator.dispatch(
        passthrough_provider, _user_messages("Can you recommend a destination with temples?")
    )

    assert result.decision.selected_agent == "destination-intelligence-agent"
    assert _FAKE_REPLY in result.content
    assert passthrough_provider.received_messages is None


# ---------------------------------------------------------------------------
# The curated destination reference set itself
# ---------------------------------------------------------------------------


def test_curated_destinations_have_unique_ids_and_titles() -> None:
    ids = [document.id for document in CURATED_DESTINATIONS]
    titles = [document.title for document in CURATED_DESTINATIONS]
    assert len(ids) == len(set(ids))
    assert len(titles) == len(set(titles))


def test_curated_destinations_never_use_forbidden_certainty_or_price_language() -> None:
    forbidden_substrings = ("guaranteed", "100% accurate", "$", "€", "£", "per night", "per person")
    for document in CURATED_DESTINATIONS:
        lowered = document.text.lower()
        for phrase in forbidden_substrings:
            assert phrase not in lowered, f"{document.id} contains forbidden phrase '{phrase}'"


async def test_build_destination_knowledge_store_is_idempotent() -> None:
    client = AsyncQdrantClient(host="localhost", port=6333)
    try:
        await build_destination_knowledge_store(client, HashingEmbeddingProvider())
        store = await build_destination_knowledge_store(client, HashingEmbeddingProvider())
        results = await store.search("temples", top_k=len(CURATED_DESTINATIONS) + 5)
        names = [passage.document_id for passage in results]
        assert len(names) == len(set(names)), "re-indexing duplicated points instead of updating them"
    finally:
        if await client.collection_exists(_DESTINATION_COLLECTION_NAME):
            await client.delete_collection(_DESTINATION_COLLECTION_NAME)
        await client.close()
