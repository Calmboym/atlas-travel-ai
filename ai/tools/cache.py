"""Response cache — ATLAS-P3-INTEG-01.

ADDED — ATLAS-P3-INTEG-01. One piece of the module's real foundation
(`WORK_BREAKDOWN_STRUCTURE.md` §Phase 3 → Module: INTEG) — a thin,
typed wrapper over the existing Redis singleton
(`app.core.redis.get_redis_client`, `AUTH-02`) for caching one external
provider's response string behind a string key, with a TTL.

Reuses the one existing Redis client rather than opening a second
connection — the same "extend, don't rebuild" precedent `AGENTS-01`
established for `conversation_manager` and `AGENTS-09` for `Orchestrator`,
applied here to Redis. This is also not the first `ai/` file to import
from `app.core.*` — `ai.agents.traveler_profile_agent` (`AGENTS-04`)
already established that cross-boundary import direction for `app.db`;
this module follows the same precedent for `app.core.redis`.
"""

from __future__ import annotations

from redis.asyncio import Redis

from app.core.redis import get_redis_client


class ResponseCache:
    """Get/set a cached response string, with a TTL.

    Deliberately narrow: `str` in, `str` out — no opinion on what a
    concrete adapter's own response shape is. `ai.tools.external_client.
    ExternalClient` (the other half of this task) is the caller; a
    future adapter (`INTEG-02` onward) is expected to serialize its own
    Pydantic response schema to JSON text before caching it and parse
    it back out after a hit — this class never needs to know that
    schema.
    """

    def __init__(self, redis_client: Redis | None = None) -> None:
        self._redis = redis_client if redis_client is not None else get_redis_client()

    async def get(self, key: str) -> str | None:
        """The cached value for `key`, or `None` if absent or expired."""
        value = await self._redis.get(key)
        if value is None:
            return None
        # `get_redis_client()` constructs the client with
        # `decode_responses=True`, so this is always a `str` at
        # runtime — but that flag is a runtime setting the redis-py
        # stubs can't see, so they still type `get()` as possibly
        # returning `bytes`. Handled for real here rather than
        # suppressed, so this stays correct even if that ever changes.
        return value if isinstance(value, str) else value.decode("utf-8")

    async def set(self, key: str, value: str, ttl_seconds: int) -> None:
        """Cache `value` under `key`, expiring after `ttl_seconds`."""
        await self._redis.set(key, value, ex=ttl_seconds)
