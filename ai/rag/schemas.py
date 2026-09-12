"""RAG retrieval schemas — ATLAS-P2-AGENTS-03.

ADDED — ATLAS-P2-AGENTS-03. Real Pydantic models (no `dict[str, Any]`
escape hatches, matching `AGENTS-02`'s own acceptance standard), scoped
to `ai/rag/` rather than `ai/schemas/` — `ai/schemas/` is `AGENTS-02`'s
own allowed-files boundary (Core Agent output schemas), and this
task's own allowed files are `ai/tools/**` and `ai/rag/**` only.
"""

from __future__ import annotations

from pydantic import BaseModel, Field


class RAGQuery(BaseModel):
    """Input to the `knowledge_search` tool (`ai/tools/knowledge_tools.py`)."""

    query: str = Field(..., min_length=1)
    top_k: int = Field(default=3, ge=1, le=10)


class RetrievedPassage(BaseModel):
    """One curated document, as returned from a Qdrant search."""

    document_id: str
    title: str
    text: str
    source_note: str
    score: float


class RAGSearchResult(BaseModel):
    """Output of the `knowledge_search` tool."""

    query: str
    passages: tuple[RetrievedPassage, ...]
