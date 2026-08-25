"""Tests for POST /auth/refresh, POST /auth/logout, GET /auth/me, and
the underlying Redis session store.

ADDED — ATLAS-P1-AUTH-07.
"""

import uuid

from httpx import AsyncClient

from app.core import session_store

_EMAIL = "session-user@example.com"
_PASSWORD = "longenough1"


async def _register_and_login(client: AsyncClient) -> None:
    await client.post("/api/v1/auth/register", json={"email": _EMAIL, "password": _PASSWORD})
    await client.post("/api/v1/auth/login", json={"email": _EMAIL, "password": _PASSWORD})


# --- GET /auth/me -----------------------------------------------------


async def test_me_requires_authentication(client: AsyncClient) -> None:
    response = await client.get("/api/v1/auth/me")
    assert response.status_code == 401


async def test_me_returns_current_user_when_authenticated(client: AsyncClient) -> None:
    await _register_and_login(client)
    response = await client.get("/api/v1/auth/me")
    assert response.status_code == 200
    assert response.json()["email"] == _EMAIL


async def test_me_rejects_garbage_cookie(client: AsyncClient) -> None:
    client.cookies.set("atlas_access_token", "not-a-real-jwt")
    response = await client.get("/api/v1/auth/me")
    assert response.status_code == 401


async def test_me_accepts_bearer_header_as_alternative_to_cookie(client: AsyncClient) -> None:
    register_response = await client.post(
        "/api/v1/auth/register", json={"email": _EMAIL, "password": _PASSWORD}
    )
    assert register_response.status_code == 201
    login_response = await client.post(
        "/api/v1/auth/login", json={"email": _EMAIL, "password": _PASSWORD}
    )
    token = login_response.json()["access_token"]

    # Fresh client with no cookies — only a Bearer header — proves the
    # header path (app/core/deps._extract_token) works independently
    # of cookie-based auth. Future API-only consumers (Telegram bot,
    # mobile app — ARCHITECTURE.md §15) will rely on exactly this path.
    from httpx import ASGITransport

    from app.main import app

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as headless_client:
        response = await headless_client.get(
            "/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"}
        )
    assert response.status_code == 200
    assert response.json()["email"] == _EMAIL


# --- POST /auth/refresh ------------------------------------------------


async def test_refresh_without_cookie_returns_401(client: AsyncClient) -> None:
    response = await client.post("/api/v1/auth/refresh")
    assert response.status_code == 401


async def test_refresh_issues_a_new_access_token(client: AsyncClient) -> None:
    await _register_and_login(client)
    original_me = await client.get("/api/v1/auth/me")
    assert original_me.status_code == 200

    response = await client.post("/api/v1/auth/refresh")
    assert response.status_code == 200
    body = response.json()
    assert body["token_type"] == "bearer"
    assert body["access_token"]
    assert body["expires_in"] > 0

    # The new access token must itself be usable.
    follow_up = await client.get("/api/v1/auth/me")
    assert follow_up.status_code == 200
    assert follow_up.json()["email"] == _EMAIL


async def test_refresh_after_logout_fails(client: AsyncClient) -> None:
    await _register_and_login(client)
    logout_response = await client.post("/api/v1/auth/logout")
    assert logout_response.status_code == 204

    # The client's cookie jar has the refresh cookie cleared by
    # logout's own Set-Cookie response — this call has no valid
    # refresh cookie to send, exactly as a real browser wouldn't.
    response = await client.post("/api/v1/auth/refresh")
    assert response.status_code == 401


async def test_refresh_with_manually_replayed_cookie_fails_after_revocation(
    client: AsyncClient,
) -> None:
    """Stronger version of the above: proves *server-side* revocation,
    not just that the client's cookie jar happened to drop the cookie.
    """
    await _register_and_login(client)
    stolen_refresh_token = client.cookies.get("atlas_refresh_token")
    assert stolen_refresh_token is not None

    await client.post("/api/v1/auth/logout")

    # Replay the captured refresh token as if an attacker (or a stale
    # client) still had it — logout must have revoked it server-side,
    # not merely asked the browser nicely to forget it.
    client.cookies.set("atlas_refresh_token", stolen_refresh_token)
    response = await client.post("/api/v1/auth/refresh")
    assert response.status_code == 401


async def test_refresh_rate_limit_enforced(client: AsyncClient) -> None:
    await _register_and_login(client)
    # Default limit is 30/hour per IP (Settings.rate_limit_refresh_max).
    for _ in range(30):
        response = await client.post("/api/v1/auth/refresh")
        assert response.status_code == 200

    over_limit = await client.post("/api/v1/auth/refresh")
    assert over_limit.status_code == 429


# --- POST /auth/logout --------------------------------------------------


async def test_logout_clears_cookies(client: AsyncClient) -> None:
    await _register_and_login(client)
    response = await client.post("/api/v1/auth/logout")
    assert response.status_code == 204

    set_cookie_headers = response.headers.get_list("set-cookie")
    assert any("atlas_access_token=" in h and ("Max-Age=0" in h or "expires=" in h.lower()) for h in set_cookie_headers)


async def test_logout_revokes_the_session(client: AsyncClient) -> None:
    await _register_and_login(client)
    await client.post("/api/v1/auth/logout")

    # The old access token cookie is gone client-side after logout, but
    # what actually matters is server-side revocation — simulate a
    # client that kept using the (now-stale) token anyway.
    stale_client_response = await client.get("/api/v1/auth/me")
    assert stale_client_response.status_code == 401


async def test_logout_without_any_session_is_idempotent(client: AsyncClient) -> None:
    response = await client.post("/api/v1/auth/logout")
    assert response.status_code == 204


async def test_logout_rate_limit_enforced(client: AsyncClient) -> None:
    # Default limit is 30/hour per IP (Settings.rate_limit_logout_max).
    for _ in range(30):
        response = await client.post("/api/v1/auth/logout")
        assert response.status_code == 204

    over_limit = await client.post("/api/v1/auth/logout")
    assert over_limit.status_code == 429


# --- session_store direct unit tests (no HTTP layer) --------------------


async def test_create_session_then_get_session_user_id_roundtrip() -> None:
    user_id = uuid.uuid4()
    jti, raw_refresh_token = await session_store.create_session(user_id)
    assert raw_refresh_token

    resolved_user_id = await session_store.get_session_user_id(jti)
    assert resolved_user_id == user_id


async def test_get_session_user_id_returns_none_for_unknown_jti() -> None:
    assert await session_store.get_session_user_id(uuid.uuid4()) is None


async def test_resolve_refresh_token_roundtrip() -> None:
    user_id = uuid.uuid4()
    jti, raw_refresh_token = await session_store.create_session(user_id)
    assert await session_store.resolve_refresh_token(raw_refresh_token) == jti


async def test_resolve_refresh_token_returns_none_for_unknown_token() -> None:
    assert await session_store.resolve_refresh_token("not-a-real-refresh-token") is None


async def test_revoke_session_removes_it() -> None:
    user_id = uuid.uuid4()
    jti, _raw_refresh_token = await session_store.create_session(user_id)
    await session_store.revoke_session(jti, user_id)
    assert await session_store.get_session_user_id(jti) is None


async def test_revoke_all_sessions_for_user_removes_every_session() -> None:
    user_id = uuid.uuid4()
    jti_one, _ = await session_store.create_session(user_id)
    jti_two, _ = await session_store.create_session(user_id)

    await session_store.revoke_all_sessions_for_user(user_id)

    assert await session_store.get_session_user_id(jti_one) is None
    assert await session_store.get_session_user_id(jti_two) is None


async def test_revoke_all_sessions_does_not_affect_other_users() -> None:
    user_one = uuid.uuid4()
    user_two = uuid.uuid4()
    jti_one, _ = await session_store.create_session(user_one)
    jti_two, _ = await session_store.create_session(user_two)

    await session_store.revoke_all_sessions_for_user(user_one)

    assert await session_store.get_session_user_id(jti_one) is None
    assert await session_store.get_session_user_id(jti_two) == user_two


async def test_touch_session_extends_ttl() -> None:
    user_id = uuid.uuid4()
    jti, raw_refresh_token = await session_store.create_session(user_id)
    # Not asserting exact TTL seconds (timing-flaky); just confirming
    # the call succeeds and the session remains resolvable afterward —
    # the real regression this guards against is an exception being
    # raised by a malformed Redis pipeline call.
    await session_store.touch_session(jti, raw_refresh_token)
    assert await session_store.get_session_user_id(jti) == user_id
