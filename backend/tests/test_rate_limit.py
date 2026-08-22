"""Direct tests for the Redis-backed RateLimiter dependency.

ADDED — ATLAS-P1-AUTH-02. Complements the end-to-end rate-limit tests
in test_auth_register.py / test_auth_login.py / test_auth_verify_email.py
by exercising RateLimiter in isolation from any specific route.
"""

import pytest
from fastapi import HTTPException, Request

from app.core.rate_limit import RateLimiter


def _make_request(client_host: str) -> Request:
    scope = {"type": "http", "client": (client_host, 12345), "headers": []}
    return Request(scope)


async def test_rate_limiter_allows_up_to_max_requests() -> None:
    limiter = RateLimiter("unit-test-allow", max_requests=3, window_seconds=60)
    request = _make_request("10.0.0.1")
    for _ in range(3):
        await limiter(request)  # must not raise


async def test_rate_limiter_blocks_after_max_requests() -> None:
    limiter = RateLimiter("unit-test-block", max_requests=2, window_seconds=60)
    request = _make_request("10.0.0.2")
    await limiter(request)
    await limiter(request)

    with pytest.raises(HTTPException) as exc_info:
        await limiter(request)
    assert exc_info.value.status_code == 429
    assert exc_info.value.headers is not None
    assert "Retry-After" in exc_info.value.headers


async def test_rate_limiter_tracks_ips_independently() -> None:
    limiter = RateLimiter("unit-test-independent", max_requests=1, window_seconds=60)
    request_a = _make_request("10.0.0.3")
    request_b = _make_request("10.0.0.4")

    await limiter(request_a)  # uses up A's quota
    await limiter(request_b)  # B has its own quota — must not raise

    with pytest.raises(HTTPException):
        await limiter(request_a)  # A is now over quota
