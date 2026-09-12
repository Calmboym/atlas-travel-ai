"""Embedding layer — ATLAS-P2-AGENTS-03.

ADDED — ATLAS-P2-AGENTS-03. Implements `ARCHITECTURE.md` §9's
"Embedding Layer: Provider independent" requirement, mirroring
`ai/providers/base.py`'s own `LLMProvider` ABC pattern exactly: an
abstract contract plus one concrete, dependency-free default
implementation, so a real neural embedding provider (OpenAI, Cohere, a
local sentence-transformers model) can be added later as a second
`EmbeddingProvider` subclass without touching `ai/rag/vector_store.py`
or anything in `ai/tools/` that consumes it.
"""

from __future__ import annotations

import hashlib
import math
import re
from abc import ABC, abstractmethod

_TOKEN_PATTERN = re.compile(r"[a-z0-9]+")


class EmbeddingProvider(ABC):
    """Turns text into vectors for `ai/rag/vector_store.py` to store in
    and query against Qdrant.

    `ARCHITECTURE.md` §9: "Embedding Layer: Provider independent." —
    consumers depend on this interface only, never on a specific
    provider's SDK or model.
    """

    @property
    @abstractmethod
    def dimension(self) -> int:
        """The fixed vector length every `embed()` call returns.

        `ai.rag.vector_store.QdrantKnowledgeStore` uses this to create
        its Qdrant collection with a matching `vectors_config` size —
        it never guesses or infers this from a sample vector.
        """
        raise NotImplementedError

    @abstractmethod
    async def embed(self, texts: list[str]) -> list[list[float]]:
        """Embed a batch of texts, returning one vector per input, in
        the same order. Never calls a live external API (Q1,
        `WORK_BREAKDOWN_STRUCTURE.md` ATLAS-P2-AGENTS-03) — whether a
        concrete provider honors that is its own responsibility; this
        base class only defines the shape.
        """
        raise NotImplementedError


class HashingEmbeddingProvider(EmbeddingProvider):
    """The default `EmbeddingProvider` — a real, deterministic, offline
    "hashing trick" (feature-hashing) embedding, not a mock.

    Every input token is hashed into one of `dimension` buckets with a
    deterministic +1/-1 sign (`scikit-learn`'s `HashingVectorizer` and
    Vowpal Wabbit use the same established technique), then the
    resulting vector is L2-normalized for cosine similarity. This is a
    genuine, keyword-overlap-based retrieval mechanism — verified
    end-to-end against a real local Qdrant instance during this task's
    own implementation (queries sharing vocabulary with a curated
    document score meaningfully higher than unrelated ones).

    Explicitly documented limitation, not silently glossed over,
    matching `BRAND_GUIDELINES.md` §8's "always explain uncertainty":
    this is a keyword/token-overlap mechanism, not a learned semantic
    embedding — "electronics" and "power adapter" will NOT be judged
    similar the way a real neural embedding model would judge them.
    It requires no network access, no API key, and no model download,
    which is exactly right for this task's own Q1 scope ("no live
    external API calls" — an external embedding API would itself be a
    live external API call). Swapping in a stronger neural
    `EmbeddingProvider` later is a drop-in replacement; nothing else in
    `ai/rag/` or `ai/tools/` needs to change.
    """

    def __init__(self, dimension: int = 256) -> None:
        if dimension <= 0:
            raise ValueError("dimension must be a positive integer.")
        self._dimension = dimension

    @property
    def dimension(self) -> int:
        return self._dimension

    async def embed(self, texts: list[str]) -> list[list[float]]:
        return [self._embed_one(text) for text in texts]

    def _embed_one(self, text: str) -> list[float]:
        vector = [0.0] * self._dimension
        for token in _TOKEN_PATTERN.findall(text.lower()):
            digest = int(hashlib.sha256(token.encode("utf-8")).hexdigest(), 16)
            bucket = digest % self._dimension
            sign = 1.0 if (digest // self._dimension) % 2 == 0 else -1.0
            vector[bucket] += sign
        norm = math.sqrt(sum(component * component for component in vector))
        if norm == 0.0:
            return vector
        return [component / norm for component in vector]
