"""Tests for the external adapter call foundation — ATLAS-P3-INTEG-01.

Runs against the real local Redis this project's test suite already
uses (`tests/conftest.py`'s own `_clean_database_and_redis` autouse
fixture flushes it before every test — no separate isolation mechanism
needed here). No live external provider is ever called — every
`fetch` below is a fake, in-test coroutine, per
`DESIGN_BIBLE_AMENDMENTS.md` Amendment 011's Q4.
"""

from __future__ import annotations

import asyncio

import pytest

from ai.tools.cache import ResponseCache
from ai.tools.external_client import (
    ExternalCallConfig,
    ExternalClient,
    ExternalProviderError,
    ExternalRateLimitedError,
    ExternalTimeoutError,
    ProviderRateLimiter,
)
from app.core.redis import get_redis_client


def _config(**overrides: object) -> ExternalCallConfig:
    defaults: dict[str, object] = {
        "provider_name": "test-provider",
        "timeout_seconds": 1.0,
        "max_retries": 2,
        "retry_backoff_seconds": 0.01,
        "cache_ttl_seconds": 60,
        "rate_limit_max_calls": 5,
        "rate_limit_window_seconds": 60,
    }
    defaults.update(overrides)
    return ExternalCallConfig(**defaults)  # type: ignore[arg-type]


def _client() -> ExternalClient:
    redis_client = get_redis_client()
    return ExternalClient(cache=ResponseCache(redis_client), rate_limiter=ProviderRateLimiter(redis_client))


# ---------------------------------------------------------------------------
# ResponseCache, in isolation
# ---------------------------------------------------------------------------


async def test_response_cache_get_returns_none_when_absent() -> None:
    cache = ResponseCache(get_redis_client())
    assert await cache.get("nonexistent-key") is None


async def test_response_cache_set_then_get_roundtrips() -> None:
    cache = ResponseCache(get_redis_client())
    await cache.set("roundtrip-key", "hello world", 60)
    assert await cache.get("roundtrip-key") == "hello world"


async def test_response_cache_value_expires_after_ttl() -> None:
    cache = ResponseCache(get_redis_client())
    await cache.set("short-lived-key", "value", 1)
    assert await cache.get("short-lived-key") == "value"
    await asyncio.sleep(1.2)
    assert await cache.get("short-lived-key") is None


# ---------------------------------------------------------------------------
# ProviderRateLimiter, in isolation
# ---------------------------------------------------------------------------


async def test_provider_rate_limiter_allows_up_to_the_configured_max() -> None:
    config = _config(rate_limit_max_calls=3, rate_limit_window_seconds=60)
    limiter = ProviderRateLimiter(get_redis_client())
    await limiter.check(config)
    await limiter.check(config)
    await limiter.check(config)  # 3rd call — still allowed


async def test_provider_rate_limiter_blocks_the_call_beyond_the_max() -> None:
    config = _config(rate_limit_max_calls=2, rate_limit_window_seconds=60)
    limiter = ProviderRateLimiter(get_redis_client())
    await limiter.check(config)
    await limiter.check(config)
    with pytest.raises(ExternalRateLimitedError) as exc_info:
        await limiter.check(config)
    assert exc_info.value.provider == "test-provider"


async def test_provider_rate_limiter_is_shared_across_limiter_instances() -> None:
    """The counter lives in Redis, keyed by provider_name — a second,
    independently-constructed ProviderRateLimiter for the same provider
    sees the same, shared count. This is the entire point of
    "provider-scoped" rather than per-caller."""
    config = _config(rate_limit_max_calls=1, rate_limit_window_seconds=60)
    first_limiter = ProviderRateLimiter(get_redis_client())
    second_limiter = ProviderRateLimiter(get_redis_client())
    await first_limiter.check(config)
    with pytest.raises(ExternalRateLimitedError):
        await second_limiter.check(config)


# ---------------------------------------------------------------------------
# ExternalClient.call — cache
# ---------------------------------------------------------------------------


async def test_cache_hit_never_calls_fetch_again() -> None:
    config = _config()
    client = _client()
    call_count = 0

    async def fetch() -> str:
        nonlocal call_count
        call_count += 1
        return '{"value": "fresh"}'

    first = await client.call(config, "same-key", fetch)
    second = await client.call(config, "same-key", fetch)

    assert call_count == 1
    assert first == second == '{"value": "fresh"}'


async def test_cache_miss_for_a_different_key_calls_fetch_again() -> None:
    config = _config()
    client = _client()
    call_count = 0

    async def fetch() -> str:
        nonlocal call_count
        call_count += 1
        return f'{{"n": {call_count}}}'

    await client.call(config, "key-a", fetch)
    await client.call(config, "key-b", fetch)

    assert call_count == 2


async def test_successful_call_is_cached_with_the_configured_ttl() -> None:
    config = _config(cache_ttl_seconds=120)
    redis_client = get_redis_client()
    client = ExternalClient(
        cache=ResponseCache(redis_client), rate_limiter=ProviderRateLimiter(redis_client)
    )

    async def fetch() -> str:
        return '{"v": 1}'

    await client.call(config, "ttl-key", fetch)

    ttl = await redis_client.ttl(f"external-cache:{config.provider_name}:ttl-key")
    assert 0 < ttl <= 120


async def test_a_cache_hit_does_not_consume_rate_limit_budget() -> None:
    config = _config(rate_limit_max_calls=1, rate_limit_window_seconds=60)
    client = _client()

    async def fetch() -> str:
        return '{"value": "fresh"}'

    await client.call(config, "budget-key", fetch)  # consumes the only allowed call
    # A second call with the SAME key is a cache hit — must not raise,
    # even though the rate-limit budget (1) is already exhausted.
    result = await client.call(config, "budget-key", fetch)
    assert result == '{"value": "fresh"}'


# ---------------------------------------------------------------------------
# ExternalClient.call — rate limiting
# ---------------------------------------------------------------------------


async def test_rate_limit_exceeded_raises_before_any_fetch_call() -> None:
    config = _config(rate_limit_max_calls=1, rate_limit_window_seconds=60)
    client = _client()
    call_count = 0

    async def fetch() -> str:
        nonlocal call_count
        call_count += 1
        return f'{{"n": {call_count}}}'

    await client.call(config, "key-a", fetch)  # consumes the 1 allowed call
    with pytest.raises(ExternalRateLimitedError):
        await client.call(config, "key-b", fetch)  # different key — not a cache hit

    assert call_count == 1


# ---------------------------------------------------------------------------
# ExternalClient.call — timeout and retry
# ---------------------------------------------------------------------------


async def test_timeout_is_retried_then_raises_external_timeout_error() -> None:
    config = _config(timeout_seconds=0.05, max_retries=2, retry_backoff_seconds=0.01)
    client = _client()
    call_count = 0

    async def fetch() -> str:
        nonlocal call_count
        call_count += 1
        await asyncio.sleep(1)  # always exceeds the 0.05s timeout
        return "never reached"

    with pytest.raises(ExternalTimeoutError) as exc_info:
        await client.call(config, "timeout-key", fetch)

    assert call_count == 1 + config.max_retries  # 1 initial attempt + 2 retries
    assert exc_info.value.provider == "test-provider"


async def test_retryable_provider_error_is_retried_then_succeeds() -> None:
    config = _config(max_retries=3, retry_backoff_seconds=0.01)
    client = _client()
    attempts = 0

    async def fetch() -> str:
        nonlocal attempts
        attempts += 1
        if attempts < 3:
            raise ExternalProviderError("test-provider", "503 transient", retryable=True)
        return '{"ok": true}'

    result = await client.call(config, "retry-key", fetch)

    assert result == '{"ok": true}'
    assert attempts == 3


async def test_retryable_provider_error_exhausting_retries_still_raises() -> None:
    config = _config(max_retries=2, retry_backoff_seconds=0.01)
    client = _client()
    attempts = 0

    async def fetch() -> str:
        nonlocal attempts
        attempts += 1
        raise ExternalProviderError("test-provider", "503 always transient", retryable=True)

    with pytest.raises(ExternalProviderError) as exc_info:
        await client.call(config, "always-fails-key", fetch)

    assert attempts == 1 + config.max_retries
    assert exc_info.value.retryable is True


async def test_non_retryable_provider_error_fails_on_the_first_attempt() -> None:
    config = _config(max_retries=3, retry_backoff_seconds=0.01)
    client = _client()
    attempts = 0

    async def fetch() -> str:
        nonlocal attempts
        attempts += 1
        raise ExternalProviderError("test-provider", "400 bad request", retryable=False)

    with pytest.raises(ExternalProviderError) as exc_info:
        await client.call(config, "bad-request-key", fetch)

    assert attempts == 1  # never retried
    assert exc_info.value.retryable is False


async def test_unexpected_exception_is_normalized_to_a_non_retryable_provider_error() -> None:
    config = _config(max_retries=3, retry_backoff_seconds=0.01)
    client = _client()
    attempts = 0

    async def fetch() -> str:
        nonlocal attempts
        attempts += 1
        raise ValueError("some raw, provider-specific parsing bug")

    with pytest.raises(ExternalProviderError) as exc_info:
        await client.call(config, "unexpected-key", fetch)

    assert attempts == 1  # unexpected exceptions are never retried
    assert exc_info.value.retryable is False
    assert "some raw, provider-specific parsing bug" in exc_info.value.detail


async def test_a_failed_call_is_never_cached() -> None:
    config = _config(max_retries=0, retry_backoff_seconds=0.01)
    redis_client = get_redis_client()
    client = ExternalClient(
        cache=ResponseCache(redis_client), rate_limiter=ProviderRateLimiter(redis_client)
    )

    async def fetch() -> str:
        raise ExternalProviderError("test-provider", "500 server error", retryable=False)

    with pytest.raises(ExternalProviderError):
        await client.call(config, "never-cached-key", fetch)

    assert await redis_client.get(f"external-cache:{config.provider_name}:never-cached-key") is None
