"""Qdrant knowledge store — ATLAS-P2-AGENTS-03.

ADDED — ATLAS-P2-AGENTS-03. The first real Qdrant client wiring in
this repository (verified empty before this task —
`INFRASTRUCTURE_BASELINE.md` §8 / `WORK_BREAKDOWN_STRUCTURE.md`
Module AGENTS: "`qdrant-client` is declared in `pyproject.toml` but
zero Qdrant client-instantiation code exists anywhere in the repo").

Wraps `qdrant_client.AsyncQdrantClient` — async, matching this
codebase's async-first convention (`GUIDELINES.md` §4) — and an
`EmbeddingProvider` (`ai/rag/embeddings.py`), storing/retrieving only
the static, curated documents in `ai/rag/knowledge_base.py` (Q1: no
live external data source).
"""

from __future__ import annotations

import uuid
from collections.abc import Sequence

from qdrant_client import AsyncQdrantClient, models

from ai.rag.embeddings import EmbeddingProvider
from ai.rag.knowledge_base import CuratedDocument
from ai.rag.schemas import RetrievedPassage

DEFAULT_COLLECTION_NAME = "atlas_knowledge_base"

# Qdrant point IDs must be an unsigned integer or a UUID — a
# `CuratedDocument.id` like "DOC_PASSPORT_COPY" is neither (confirmed
# empirically against the real local Qdrant instance during this
# task's own implementation: an arbitrary string is rejected with
# "is not a valid point ID"). `uuid5` deterministically derives the
# same UUID from the same document id every time, so re-indexing the
# same curated document updates its existing point rather than
# duplicating it.
_POINT_ID_NAMESPACE = uuid.UUID("6f9c3e1e-6f3b-4c5a-9c7e-6d2f3a1b5c9d")


def _point_id_for(document_id: str) -> str:
    return str(uuid.uuid5(_POINT_ID_NAMESPACE, document_id))


class QdrantKnowledgeStore:
    """Indexes and searches `CuratedDocument`s in a Qdrant collection."""

    def __init__(
        self,
        client: AsyncQdrantClient,
        embedding_provider: EmbeddingProvider,
        collection_name: str = DEFAULT_COLLECTION_NAME,
    ) -> None:
        self._client = client
        self._embeddings = embedding_provider
        self._collection_name = collection_name

    async def ensure_collection(self) -> None:
        """Create the collection if it doesn't exist yet.

        Idempotent — safe to call before every `index_documents()`/
        `search()`, matching `collection_exists` being the officially
        documented pre-check for `create_collection` (there is no
        `create_collection(..., if_not_exists=True)` in this client
        version's own API, per this task's own inspection of
        `AsyncQdrantClient`'s signatures).
        """
        if not await self._client.collection_exists(self._collection_name):
            await self._client.create_collection(
                self._collection_name,
                vectors_config=models.VectorParams(
                    size=self._embeddings.dimension,
                    distance=models.Distance.COSINE,
                ),
            )

    async def index_documents(self, documents: Sequence[CuratedDocument]) -> None:
        """Embed and upsert curated documents. Re-running with the same
        documents updates their existing points (see `_point_id_for`),
        it does not duplicate them."""
        if not documents:
            return
        await self.ensure_collection()
        vectors = await self._embeddings.embed([document.text for document in documents])
        points = [
            models.PointStruct(
                id=_point_id_for(document.id),
                vector=vector,
                payload={
                    "document_id": document.id,
                    "title": document.title,
                    "text": document.text,
                    "source_note": document.source_note,
                },
            )
            for document, vector in zip(documents, vectors, strict=True)
        ]
        await self._client.upsert(self._collection_name, points=points)

    async def search(self, query: str, top_k: int = 3) -> list[RetrievedPassage]:
        """Embed `query` and return the `top_k` nearest curated documents."""
        await self.ensure_collection()
        [query_vector] = await self._embeddings.embed([query])
        result = await self._client.query_points(
            self._collection_name,
            query=query_vector,
            limit=top_k,
            with_payload=True,
        )
        passages: list[RetrievedPassage] = []
        for point in result.points:
            payload = point.payload or {}
            passages.append(
                RetrievedPassage(
                    document_id=payload["document_id"],
                    title=payload["title"],
                    text=payload["text"],
                    source_note=payload["source_note"],
                    score=point.score,
                )
            )
        return passages
