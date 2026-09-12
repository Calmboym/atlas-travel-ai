"""The `knowledge_search` tool — ATLAS-P2-AGENTS-03.

ADDED — ATLAS-P2-AGENTS-03. Wires `ai.rag.vector_store.
QdrantKnowledgeStore` into a registrable `Tool`. A Core Agent never
calls `QdrantKnowledgeStore` directly — it goes through
`ai.tools.service.ToolService.invoke()`, which enforces permission
(the agent's own `allowed_tools`) and validates both the request and
the response before this handler ever runs or its result is ever
returned.
"""

from __future__ import annotations

from pydantic import BaseModel

from ai.rag.schemas import RAGQuery, RAGSearchResult
from ai.rag.vector_store import QdrantKnowledgeStore
from ai.tools.types import Tool

KNOWLEDGE_SEARCH_TOOL_NAME = "knowledge_search"

_DESCRIPTION = (
    "Search Atlas's static, curated travel-preparation knowledge base "
    "(packing, documents, safety, connectivity, general reminders to verify "
    "visas/health requirements officially). Does not know destination-specific "
    "facts, current prices, or live availability — those require sources this "
    "tool does not have access to."
)


def build_knowledge_search_tool(store: QdrantKnowledgeStore) -> Tool:
    """Build the `knowledge_search` `Tool`, bound to a given
    `QdrantKnowledgeStore` instance."""

    async def _handle(arguments: BaseModel) -> BaseModel:
        # `ToolService.invoke()` already validated `arguments` is a
        # `RAGQuery` before calling this handler; the assert below is
        # type-narrowing for mypy, not a second, redundant safety net.
        assert isinstance(arguments, RAGQuery)
        passages = await store.search(arguments.query, top_k=arguments.top_k)
        return RAGSearchResult(query=arguments.query, passages=tuple(passages))

    return Tool(
        name=KNOWLEDGE_SEARCH_TOOL_NAME,
        description=_DESCRIPTION,
        input_schema=RAGQuery,
        output_schema=RAGSearchResult,
        handler=_handle,
    )
