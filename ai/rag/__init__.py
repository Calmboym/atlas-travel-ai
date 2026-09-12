"""RAG (Retrieval-Augmented Generation) — ATLAS-P2-AGENTS-03.

ADDED — ATLAS-P2-AGENTS-03. `ARCHITECTURE.md` §9's "RAG System:
Required. Purpose: Provide accurate knowledge retrieval" and "Vector
Database: Recommended: Qdrant" — implemented against static, curated
knowledge sources only (Q1: no live external API calls; those are
Phase 3 `INTEG-*` adapters).

- `embeddings.py` — the provider-independent `EmbeddingProvider`
  abstraction (`ARCHITECTURE.md` §9) plus its default, offline,
  dependency-free implementation.
- `knowledge_base.py` — the curated documents themselves.
- `vector_store.py` — `QdrantKnowledgeStore`, the first real Qdrant
  client wiring in this repository.
- `schemas.py` — the Pydantic request/result models for a search.

Consumed by `ai/tools/knowledge_tools.py` as a registered `Tool`, never
called directly by a Core Agent — every retrieval goes through
`ai.tools.service.ToolService`'s permission + validation pipeline.
"""
