"""Tests for the Tool Service (registry/permission/validation/monitoring)
and RAG retrieval (embeddings + Qdrant) — ATLAS-P2-AGENTS-03.

Runs against a real local Qdrant 1.19.1 server (this task's own
verification instance, started for this session — see
`PROJECT_STATE.md`'s Verification Results for AGENTS-03), not a mocked
client, matching this task's own acceptance criterion and every prior
Phase 1 session's "real infrastructure, not mocks" standard. A
dedicated test collection (`_TEST_COLLECTION_NAME`) is used and
dropped after every test that touches Qdrant, so this suite never
depends on, or leaves behind, anything a real running Atlas backend
would use.
"""

from __future__ import annotations

from collections.abc import AsyncGenerator, AsyncIterator

import pytest
from pydantic import BaseModel
from qdrant_client import AsyncQdrantClient

from ai.agents.base import Agent
from ai.providers.base import LLMMessage, LLMProvider
from ai.rag.embeddings import HashingEmbeddingProvider
from ai.rag.knowledge_base import CURATED_DOCUMENTS
from ai.rag.schemas import RAGQuery, RAGSearchResult, RetrievedPassage
from ai.rag.vector_store import QdrantKnowledgeStore
from ai.tools.knowledge_tools import KNOWLEDGE_SEARCH_TOOL_NAME, build_knowledge_search_tool
from ai.tools.registry import DuplicateToolError, ToolRegistry
from ai.tools.service import ToolService
from ai.tools.types import Tool, ToolNotFoundError, ToolPermissionError, ToolValidationError

_TEST_COLLECTION_NAME = "atlas_knowledge_base_test"


class FakeLLMProvider(LLMProvider):
    """Test double — never touches the network. Mirrors
    `test_orchestrator.py`'s/`test_agent_base.py`'s own `FakeLLMProvider`."""

    @property
    def model_name(self) -> str:
        return "fake-model-for-tests"

    async def complete(self, messages: list[LLMMessage]) -> str:
        raise NotImplementedError("Not exercised by these tests.")

    async def stream_complete(self, messages: list[LLMMessage]) -> AsyncIterator[str]:
        raise NotImplementedError("Not exercised by these tests.")
        yield  # pragma: no cover - unreachable, satisfies the AsyncIterator shape


class _EchoInput(BaseModel):
    value: str


class _EchoOutput(BaseModel):
    value: str


async def _echo_handler(arguments: BaseModel) -> BaseModel:
    assert isinstance(arguments, _EchoInput)
    return _EchoOutput(value=arguments.value)


def _echo_tool(name: str = "echo") -> Tool:
    return Tool(
        name=name,
        description="Echoes its input, for tests only.",
        input_schema=_EchoInput,
        output_schema=_EchoOutput,
        handler=_echo_handler,
    )


class _FakeAgentWithTools(Agent):
    """A minimal concrete Agent used only to exercise `ToolService`'s
    permission checks — never calls `self._provider` or `reason()`s
    about anything real."""

    def __init__(self, provider: LLMProvider, allowed_tools: tuple[str, ...]) -> None:
        super().__init__(provider, name="fake-tool-caller", intents=("fake",))
        self._allowed_tools = allowed_tools

    @property
    def mission(self) -> str:
        return "Exercise ToolService in tests."

    @property
    def responsibilities(self) -> tuple[str, ...]:
        return ()

    @property
    def allowed_tools(self) -> tuple[str, ...]:
        return self._allowed_tools

    @property
    def input_schema(self) -> type[BaseModel]:
        return _EchoInput

    @property
    def output_schema(self) -> type[BaseModel]:
        return _EchoOutput

    @property
    def reasoning_rules(self) -> tuple[str, ...]:
        return ()

    @property
    def system_prompt(self) -> str:
        return "unused"

    async def reason(self, messages: list[LLMMessage]) -> BaseModel:
        raise NotImplementedError("Not exercised by these tests.")


# ---------------------------------------------------------------------------
# ToolRegistry
# ---------------------------------------------------------------------------


def test_tool_registry_register_and_get() -> None:
    registry = ToolRegistry()
    tool = _echo_tool()
    registry.register(tool)
    assert registry.get("echo") is tool
    assert "echo" in registry
    assert len(registry) == 1
    assert registry.tools == (tool,)


def test_tool_registry_get_missing_returns_none() -> None:
    registry = ToolRegistry()
    assert registry.get("does-not-exist") is None


def test_tool_registry_rejects_duplicate_names() -> None:
    registry = ToolRegistry()
    registry.register(_echo_tool())
    with pytest.raises(DuplicateToolError):
        registry.register(_echo_tool())


# ---------------------------------------------------------------------------
# ToolService — permission -> lookup -> input validation -> output validation
# ---------------------------------------------------------------------------


async def test_tool_service_denies_a_tool_not_in_allowed_tools() -> None:
    registry = ToolRegistry()
    registry.register(_echo_tool())
    service = ToolService(registry)
    agent = _FakeAgentWithTools(FakeLLMProvider(), allowed_tools=())

    with pytest.raises(ToolPermissionError):
        await service.invoke(agent, "echo", _EchoInput(value="hi"))


async def test_tool_service_permission_check_happens_even_for_an_unregistered_tool() -> None:
    """Permission is checked before the registry is ever consulted — an
    agent without permission gets `ToolPermissionError`, not
    `ToolNotFoundError`, even for a tool name that isn't registered
    either."""
    registry = ToolRegistry()  # deliberately empty
    service = ToolService(registry)
    agent = _FakeAgentWithTools(FakeLLMProvider(), allowed_tools=())

    with pytest.raises(ToolPermissionError):
        await service.invoke(agent, "nonexistent", _EchoInput(value="hi"))


async def test_tool_service_raises_not_found_for_a_permitted_but_unregistered_tool() -> None:
    registry = ToolRegistry()  # empty
    service = ToolService(registry)
    agent = _FakeAgentWithTools(FakeLLMProvider(), allowed_tools=("echo",))

    with pytest.raises(ToolNotFoundError):
        await service.invoke(agent, "echo", _EchoInput(value="hi"))


async def test_tool_service_rejects_wrong_input_type() -> None:
    registry = ToolRegistry()
    registry.register(_echo_tool())
    service = ToolService(registry)
    agent = _FakeAgentWithTools(FakeLLMProvider(), allowed_tools=("echo",))

    with pytest.raises(ToolValidationError):
        await service.invoke(agent, "echo", _EchoOutput(value="wrong-schema"))


async def test_tool_service_rejects_a_handler_returning_the_wrong_output_type() -> None:
    async def _bad_handler(arguments: BaseModel) -> BaseModel:
        return _EchoInput(value="should-have-been-EchoOutput")

    registry = ToolRegistry()
    registry.register(
        Tool(
            name="broken",
            description="Deliberately returns the wrong schema.",
            input_schema=_EchoInput,
            output_schema=_EchoOutput,
            handler=_bad_handler,
        )
    )
    service = ToolService(registry)
    agent = _FakeAgentWithTools(FakeLLMProvider(), allowed_tools=("broken",))

    with pytest.raises(ToolValidationError):
        await service.invoke(agent, "broken", _EchoInput(value="hi"))


async def test_tool_service_succeeds_for_a_permitted_valid_call() -> None:
    registry = ToolRegistry()
    registry.register(_echo_tool())
    service = ToolService(registry)
    agent = _FakeAgentWithTools(FakeLLMProvider(), allowed_tools=("echo",))

    result = await service.invoke(agent, "echo", _EchoInput(value="hello"))

    assert isinstance(result, _EchoOutput)
    assert result.value == "hello"


# ---------------------------------------------------------------------------
# HashingEmbeddingProvider — real, deterministic, no network
# ---------------------------------------------------------------------------


async def test_hashing_embedding_provider_dimension_is_consistent() -> None:
    provider = HashingEmbeddingProvider(dimension=64)
    [vector] = await provider.embed(["hello world"])
    assert provider.dimension == 64
    assert len(vector) == 64


async def test_hashing_embedding_provider_is_deterministic() -> None:
    provider = HashingEmbeddingProvider()
    first = await provider.embed(["same text every time"])
    second = await provider.embed(["same text every time"])
    assert first == second


async def test_hashing_embedding_provider_differs_for_different_text() -> None:
    provider = HashingEmbeddingProvider()
    [a] = await provider.embed(["passport and visa documents"])
    [b] = await provider.embed(["completely unrelated content here"])
    assert a != b


async def test_hashing_embedding_provider_rejects_non_positive_dimension() -> None:
    with pytest.raises(ValueError):
        HashingEmbeddingProvider(dimension=0)


# ---------------------------------------------------------------------------
# QdrantKnowledgeStore — a REAL local Qdrant instance, not a mock
# ---------------------------------------------------------------------------


@pytest.fixture
async def knowledge_store() -> AsyncGenerator[QdrantKnowledgeStore, None]:
    """A `QdrantKnowledgeStore` against a real, local Qdrant server
    (localhost:6333), using a dedicated test collection dropped after
    every test."""
    client = AsyncQdrantClient(host="localhost", port=6333)
    store = QdrantKnowledgeStore(
        client, HashingEmbeddingProvider(), collection_name=_TEST_COLLECTION_NAME
    )
    try:
        yield store
    finally:
        if await client.collection_exists(_TEST_COLLECTION_NAME):
            await client.delete_collection(_TEST_COLLECTION_NAME)
        await client.close()


async def test_knowledge_store_creates_its_collection_lazily(
    knowledge_store: QdrantKnowledgeStore,
) -> None:
    await knowledge_store.ensure_collection()
    await knowledge_store.ensure_collection()  # idempotent — must not raise


async def test_knowledge_store_indexes_and_searches_curated_documents(
    knowledge_store: QdrantKnowledgeStore,
) -> None:
    await knowledge_store.index_documents(CURATED_DOCUMENTS)

    results = await knowledge_store.search("power adapter for electronics abroad", top_k=3)

    assert len(results) > 0
    assert all(isinstance(passage, RetrievedPassage) for passage in results)
    top_ids = {passage.document_id for passage in results}
    assert "DOC_POWER_ADAPTER" in top_ids


async def test_knowledge_store_reindexing_updates_rather_than_duplicates(
    knowledge_store: QdrantKnowledgeStore,
) -> None:
    await knowledge_store.index_documents(CURATED_DOCUMENTS)
    await knowledge_store.index_documents(CURATED_DOCUMENTS)  # re-index, same ids

    results = await knowledge_store.search("passport copy", top_k=len(CURATED_DOCUMENTS) + 5)
    returned_ids = [passage.document_id for passage in results]
    assert len(returned_ids) == len(set(returned_ids)), "documents were duplicated, not updated"


async def test_knowledge_store_search_returns_curated_source_note(
    knowledge_store: QdrantKnowledgeStore,
) -> None:
    await knowledge_store.index_documents(CURATED_DOCUMENTS)
    [result] = await knowledge_store.search("embassy registration", top_k=1)
    assert "not sourced from any live or authoritative provider" in result.source_note


# ---------------------------------------------------------------------------
# knowledge_search Tool — end-to-end through ToolService against real Qdrant
# ---------------------------------------------------------------------------


async def test_knowledge_search_tool_end_to_end_through_tool_service(
    knowledge_store: QdrantKnowledgeStore,
) -> None:
    await knowledge_store.index_documents(CURATED_DOCUMENTS)

    registry = ToolRegistry()
    registry.register(build_knowledge_search_tool(knowledge_store))
    service = ToolService(registry)
    agent = _FakeAgentWithTools(FakeLLMProvider(), allowed_tools=(KNOWLEDGE_SEARCH_TOOL_NAME,))

    result = await service.invoke(
        agent, KNOWLEDGE_SEARCH_TOOL_NAME, RAGQuery(query="local currency and cash", top_k=2)
    )

    assert isinstance(result, RAGSearchResult)
    assert result.query == "local currency and cash"
    assert len(result.passages) <= 2
    assert all(isinstance(passage, RetrievedPassage) for passage in result.passages)


async def test_knowledge_search_tool_denied_for_an_agent_without_permission(
    knowledge_store: QdrantKnowledgeStore,
) -> None:
    registry = ToolRegistry()
    registry.register(build_knowledge_search_tool(knowledge_store))
    service = ToolService(registry)
    agent = _FakeAgentWithTools(FakeLLMProvider(), allowed_tools=())  # no permission

    with pytest.raises(ToolPermissionError):
        await service.invoke(agent, KNOWLEDGE_SEARCH_TOOL_NAME, RAGQuery(query="anything"))


# ---------------------------------------------------------------------------
# Curated knowledge base content — structural honesty checks. Whether the
# content is itself fabricated is a human-curation property (stated in
# this task's own handoff), not a mechanical one; these catch an obvious
# regression rather than substituting for that review.
# ---------------------------------------------------------------------------


def test_curated_documents_have_unique_ids() -> None:
    ids = [document.id for document in CURATED_DOCUMENTS]
    assert len(ids) == len(set(ids))


def test_curated_documents_all_carry_the_general_guidance_source_note() -> None:
    for document in CURATED_DOCUMENTS:
        assert "not sourced from any live or authoritative provider" in document.source_note


def test_curated_documents_never_use_forbidden_certainty_language() -> None:
    """Light structural check against `COPYWRITING_GUIDELINES.md`'s
    forbidden-language list (`Guaranteed`, `100% accurate`, ...)."""
    forbidden_substrings = ("guaranteed", "100% accurate", "always required", "never required")
    for document in CURATED_DOCUMENTS:
        lowered = document.text.lower()
        for phrase in forbidden_substrings:
            assert phrase not in lowered, f"{document.id} contains forbidden phrase '{phrase}'"
