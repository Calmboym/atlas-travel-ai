"""Redis-based rate limiting for authentication endpoints.

ADDED — ATLAS-P1-AUTH-02. Mandatory per GUIDELINES.md §11 ("Protect:
Login endpoints. Registration.") and ARCHITECTURE.md §12 ("Rate
Limiting ... Implementation: Redis-based rate limiter").

Mechanism: fixed-window counter via Redis INCR + EXPIRE — the exact
mechanism DEBUG_LOG.md's "Architecture Decisions Made" table described
as the M0-era design intent ("Rate limiter uses Redis INCR+EXPIRE
sliding window"). No rate limiter previously existed as real code
(backend/app/ was empty — see .ai/INFRASTRUCTURE_BASELINE.md §8-9);
this is the first actual implementation of that documented intent.
"""

from fastapi import HTTPException, Request, status

from app.core.redis import get_redis_client


class RateLimiter:
    """Callable FastAPI dependency: `Depends(RateLimiter("login", 10, 900))`."""

    def __init__(self, key_prefix: str, max_requests: int, window_seconds: int) -> None:
        self.key_prefix = key_prefix
        self.max_requests = max_requests
        self.window_seconds = window_seconds

    async def __call__(self, request: Request) -> None:
        redis_client = get_redis_client()
        client_ip = request.client.host if request.client else "unknown"
        key = f"ratelimit:{self.key_prefix}:{client_ip}"

        current = await redis_client.incr(key)
        if current == 1:
            await redis_client.expire(key, self.window_seconds)

        if current > self.max_requests:
            ttl = await redis_client.ttl(key)
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many requests. Please try again later.",
                headers={"Retry-After": str(max(ttl, 1))},
            )
