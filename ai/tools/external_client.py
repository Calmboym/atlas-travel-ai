"""External adapter call foundation — ATLAS-P3-INTEG-01.

ADDED — ATLAS-P3-INTEG-01. The real foundation `INTEG-02` through `06`
(Currency, Weather, Maps, Events, Travel/Safety-source adapters) build
on (`WORK_BREAKDOWN_STRUCTURE.md` §Phase 3 → Module: INTEG). Every
capability this task's own scope explicitly names
(`DESIGN_BIBLE_AMENDMENTS.md` Amendment 011, part 1) is here: timeout
handling, retry policy, provider-scoped rate limiting, response
caching, validation/error normalization, and monitoring hooks —
`GUIDELINES.md` §13's four adapter requirements, plus the two the
project owner's own direction added explicitly.

## A different layer from `ToolService` — extends it, does not duplicate it

`ai.tools.service.ToolService.invoke()` (`AGENTS-03`) already owns the
AGENT-FACING side of a tool call: permission check, then input
validation, then `tool.handler(...)`, then output validation, each
step logged. `ExternalClient` below is the layer *underneath* that —
what a concrete adapter's own `Tool.handler` calls when the tool wraps
a real network request to an external provider. An `Agent` never sees
or calls `ExternalClient` directly; it stays inside `Tool.handler`,
exactly as `ai.rag.vector_store.QdrantKnowledgeStore` already does for
the existing `knowledge_search`/`destination_search` tools — those two
wrap a local Qdrant call, this wraps a remote HTTP call, same
"the tool owns the plumbing, the agent only sees a typed
request/response" shape. Structured log events below reuse
`ToolService`'s own `structlog` event-name-plus-keyword-fields
convention rather than a second, differently-styled one.

## Provider-scoped rate limiting: a new, small class — not `RateLimiter` reused as-is

`app.core.rate_limit.RateLimiter` (`AUTH-02`) is a FastAPI dependency:
`__call__(self, request: Request)`, keyed **per-client-IP**
(`ratelimit:{prefix}:{client_ip}`), raises `HTTPException` directly.
None of that fits what this task needs — one shared counter *per
provider*, regardless of which user's request triggered the call, with
no `Request` object and no HTTP-status coupling (a `Tool.handler` is
not a route handler). `ProviderRateLimiter` below reuses the exact same
underlying mechanism (`app.core.redis.get_redis_client()`'s Redis
`INCR`+`EXPIRE` fixed-window counter) with a fixed, provider-scoped key
instead — a small sibling class, per this task's own
Allowed-files-to-modify note ("...only if a genuine reusable extension
is needed — report before doing so"), reported here rather than either
forking `RateLimiter`'s own body or coercing a `Request`-shaped
dependency into a non-HTTP call site.

## Error normalization

Every concrete provider's own raw failure — an HTTP status, a timeout,
a malformed body, a raised exception of any kind — is normalized to
exactly one of three types before it ever reaches a caller:
`ExternalRateLimitedError` (this provider's own shared limit was
already exceeded — raised before any network call is attempted),
`ExternalTimeoutError` (the call did not complete, even after every
configured retry), or `ExternalProviderError` (the provider responded,
or the call otherwise failed, in a way retrying could not resolve — or
in a way this module did not recognize at all). A concrete adapter's
own `fetch` callable is expected to raise `ExternalProviderError`
itself, with `retryable` set appropriately, for anything it recognizes
as a provider-specific failure (e.g. `retryable=True` for a 503,
`retryable=False` for a 400); any *other* exception `fetch` raises is
still caught here and normalized to a non-retryable
`ExternalProviderError` — no raw, provider-specific exception type ever
escapes this module. This is the direct mechanism behind
`DESIGN_BIBLE_AMENDMENTS.md` Amendment 011's Q2/Q3 provider-agnostic
principle: whatever answers a call, a caller two layers up sees one of
exactly three normalized exception types, never a provider's own.

## Verified with no live network call, per Q4

This module makes no provider choice and issues no network call of its
own — `fetch` is supplied entirely by the caller. Every behavior below
(cache hit, rate limit, timeout, retry, success, normalization) is
mechanically tested (`test_external_client.py`) against a fake `fetch`
coroutine and the real local Redis this project's own test suite
already runs against — never a live provider endpoint, exactly as
`DESIGN_BIBLE_AMENDMENTS.md` Amendment 011's Q4 requires for this task.
"""

from __future__ import annotations

import asyncio
from collections.abc import Awaitable, Callable
from dataclasses import dataclass

import structlog
from redis.asyncio import Redis

from ai.tools.cache import ResponseCache
from app.core.redis import get_redis_client

logger = structlog.get_logger(__name__)


class ExternalCallError(Exception):
    """Base class for every error this module raises.

    Carries the provider name so a caller (eventually a Domain Agent,
    Wave 2) can log or report which integration failed without parsing
    a message string.
    """

    def __init__(self, provider: str, detail: str) -> None:
        self.provider = provider
        self.detail = detail
        super().__init__(f"[{provider}] {detail}")


class ExternalRateLimitedError(ExternalCallError):
    """Raised before any network call is attempted — this provider's
    own shared rate limit was already exceeded."""


class ExternalTimeoutError(ExternalCallError):
    """Raised when the call did not complete within the configured
    timeout, even after every configured retry."""


class ExternalProviderError(ExternalCallError):
    """Every other provider-side failure, normalized to one shape.

    `retryable` is set by a concrete adapter's own `fetch` callable
    when it raises this directly (e.g. `True` for a transient 503,
    `False` for a permanent 400) — `ExternalClient` itself always sets
    it to `False` for any exception it did not expect, per this
    module's own docstring ("no raw, provider-specific exception ever
    escapes").
    """

    def __init__(self, provider: str, detail: str, *, retryable: bool = False) -> None:
        self.retryable = retryable
        super().__init__(provider, detail)


@dataclass(frozen=True)
class ExternalCallConfig:
    """Everything one external provider integration needs from this
    foundation.

    One `ExternalCallConfig` per provider (e.g. one for Currency, a
    separate one for Weather) — never shared across two different
    providers, since `provider_name` is also the cache-key and
    rate-limit-key namespace (a collision would mean two unrelated
    providers sharing one rate-limit budget and one cache).
    """

    provider_name: str
    timeout_seconds: float
    max_retries: int
    retry_backoff_seconds: float
    cache_ttl_seconds: int
    rate_limit_max_calls: int
    rate_limit_window_seconds: int


class ProviderRateLimiter:
    """One shared counter per provider.

    See this module's own docstring, "Provider-scoped rate limiting",
    for why this is not `app.core.rate_limit.RateLimiter` reused as-is.
    """

    def __init__(self, redis_client: Redis | None = None) -> None:
        self._redis = redis_client if redis_client is not None else get_redis_client()

    async def check(self, config: ExternalCallConfig) -> None:
        """Raise `ExternalRateLimitedError` if this provider's own
        shared limit is already exceeded. Never calls the network
        itself — this is a pure Redis-backed counter check."""
        key = f"external-ratelimit:{config.provider_name}"
        current = await self._redis.incr(key)
        if current == 1:
            await self._redis.expire(key, config.rate_limit_window_seconds)

        if current > config.rate_limit_max_calls:
            ttl = await self._redis.ttl(key)
            logger.warning(
                "external_call_rate_limited",
                provider=config.provider_name,
                max_calls=config.rate_limit_max_calls,
                window_seconds=config.rate_limit_window_seconds,
            )
            raise ExternalRateLimitedError(
                config.provider_name,
                f"Rate limit exceeded ({config.rate_limit_max_calls} calls per "
                f"{config.rate_limit_window_seconds}s); retry after {max(ttl, 1)}s.",
            )


class ExternalClient:
    """The one path through which a concrete adapter's `Tool.handler`
    makes an external call.

    `call()`'s own order — cache, then rate limit, then timeout+retry
    — is this task's own acceptance criterion's enforcement mechanism:
    a cache hit never consumes rate-limit budget or reaches the network
    ("a cache hit never re-issues the network call"), and a
    rate-limited call is rejected before `fetch` is ever invoked
    ("rejected... before any network call is attempted").
    """

    def __init__(
        self,
        cache: ResponseCache | None = None,
        rate_limiter: ProviderRateLimiter | None = None,
    ) -> None:
        self._cache = cache if cache is not None else ResponseCache()
        self._rate_limiter = rate_limiter if rate_limiter is not None else ProviderRateLimiter()

    async def call(
        self,
        config: ExternalCallConfig,
        cache_key: str,
        fetch: Callable[[], Awaitable[str]],
    ) -> str:
        """Cache → rate limit → timeout+retry → normalize, with a
        structured log event for every outcome.

        `fetch` returns (and this method returns) a plain `str` — a
        concrete adapter's own already-serialized response (e.g.
        `SomeResponseSchema.model_dump_json()`) — kept deliberately
        generic so this class never needs to know any provider's own
        schema; the caller deserializes its own result on the way out.

        Raises `ExternalRateLimitedError`, `ExternalTimeoutError`, or
        `ExternalProviderError` — never a raw, unnormalized exception.
        """
        full_cache_key = f"external-cache:{config.provider_name}:{cache_key}"

        cached = await self._cache.get(full_cache_key)
        if cached is not None:
            logger.info(
                "external_call_cache_hit", provider=config.provider_name, key=cache_key
            )
            return cached

        await self._rate_limiter.check(config)

        logger.info("external_call_attempted", provider=config.provider_name, key=cache_key)

        attempt = 0
        while True:
            attempt += 1
            normalized: ExternalCallError
            retryable: bool
            try:
                result = await asyncio.wait_for(fetch(), timeout=config.timeout_seconds)
            except TimeoutError:
                normalized = ExternalTimeoutError(
                    config.provider_name,
                    f"Timed out after {config.timeout_seconds}s (attempt {attempt}).",
                )
                retryable = True
            except ExternalProviderError as exc:
                normalized = exc
                retryable = exc.retryable
            except Exception as exc:
                # Anything a concrete adapter's own `fetch` did not
                # already normalize is treated as a non-retryable
                # provider error — see this module's own docstring,
                # "Error normalization".
                normalized = ExternalProviderError(
                    config.provider_name, f"Unexpected error: {exc}", retryable=False
                )
                retryable = False
            else:
                logger.info(
                    "external_call_succeeded", provider=config.provider_name, key=cache_key
                )
                await self._cache.set(full_cache_key, result, config.cache_ttl_seconds)
                return result

            if not retryable or attempt > config.max_retries:
                logger.error(
                    "external_call_failed",
                    provider=config.provider_name,
                    key=cache_key,
                    reason=normalized.detail,
                    attempts=attempt,
                )
                raise normalized

            logger.warning(
                "external_call_retried",
                provider=config.provider_name,
                key=cache_key,
                reason=normalized.detail,
                attempt=attempt,
            )
            await asyncio.sleep(config.retry_backoff_seconds)
