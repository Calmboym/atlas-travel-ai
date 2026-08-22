"""Redis client singleton.

ADDED — ATLAS-P1-AUTH-02. No Redis client existed as real code before
this task (Redis was a declared dependency in pyproject.toml, but
backend/app/ itself was empty — see .ai/INFRASTRUCTURE_BASELINE.md §8).
"""

from functools import lru_cache

import redis.asyncio as redis_async

from app.core.config import get_settings


@lru_cache
def get_redis_client() -> redis_async.Redis:
    settings = get_settings()
    return redis_async.from_url(settings.redis_url, decode_responses=True)
