"""Tests for POST /api/v1/auth/login.

ADDED — ATLAS-P1-AUTH-05.
"""

from httpx import AsyncClient, Response

from app.core.security import decode_access_token

_EMAIL = "login-user@example.com"
_PASSWORD = "longenough1"


async def _register(client: AsyncClient, email: str = _EMAIL, password: str = _PASSWORD) -> Response:
    return await client.post("/api/v1/auth/register", json={"email": email, "password": password})


async def test_login_success_returns_token_and_sets_cookie(client: AsyncClient) -> None:
    await _register(client)

    response = await client.post("/api/v1/auth/login", json={"email": _EMAIL, "password": _PASSWORD})
    assert response.status_code == 200
    body = response.json()
    assert body["token_type"] == "bearer"
    assert body["access_token"]
    assert body["expires_in"] > 0
    assert body["user"]["email"] == _EMAIL

    assert "atlas_access_token" in response.cookies
    set_cookie_header = response.headers.get("set-cookie", "")
    assert "HttpOnly" in set_cookie_header


async def test_login_token_decodes_to_correct_user_id(client: AsyncClient) -> None:
    register_response = await _register(client)
    user_id = register_response.json()["user"]["id"]

    login_response = await client.post(
        "/api/v1/auth/login", json={"email": _EMAIL, "password": _PASSWORD}
    )
    token = login_response.json()["access_token"]
    assert str(decode_access_token(token)) == user_id


async def test_login_succeeds_even_when_unverified(client: AsyncClient) -> None:
    await _register(client)
    response = await client.post("/api/v1/auth/login", json={"email": _EMAIL, "password": _PASSWORD})
    assert response.status_code == 200
    assert response.json()["user"]["is_verified"] is False


async def test_login_wrong_password_returns_401(client: AsyncClient) -> None:
    await _register(client)
    response = await client.post(
        "/api/v1/auth/login", json={"email": _EMAIL, "password": "wrongpassword"}
    )
    assert response.status_code == 401


async def test_login_nonexistent_email_returns_401(client: AsyncClient) -> None:
    response = await client.post(
        "/api/v1/auth/login", json={"email": "nobody@example.com", "password": "whatever12"}
    )
    assert response.status_code == 401


async def test_login_wrong_password_and_nonexistent_user_give_identical_error(
    client: AsyncClient,
) -> None:
    await _register(client)
    wrong_password = await client.post(
        "/api/v1/auth/login", json={"email": _EMAIL, "password": "wrongpassword"}
    )
    nonexistent = await client.post(
        "/api/v1/auth/login", json={"email": "nobody@example.com", "password": "whatever12"}
    )
    assert wrong_password.status_code == nonexistent.status_code == 401
    assert wrong_password.json()["detail"] == nonexistent.json()["detail"]


async def test_login_email_case_insensitive(client: AsyncClient) -> None:
    await _register(client)
    response = await client.post(
        "/api/v1/auth/login", json={"email": "LOGIN-USER@EXAMPLE.COM", "password": _PASSWORD}
    )
    assert response.status_code == 200


async def test_login_rejects_missing_password(client: AsyncClient) -> None:
    response = await client.post("/api/v1/auth/login", json={"email": _EMAIL})
    assert response.status_code == 422


async def test_login_rate_limit_enforced(client: AsyncClient) -> None:
    # Default limit is 10/15min per IP (Settings.rate_limit_login_max).
    for _ in range(10):
        response = await client.post(
            "/api/v1/auth/login", json={"email": "nobody@example.com", "password": "whatever12"}
        )
        assert response.status_code == 401

    eleventh = await client.post(
        "/api/v1/auth/login", json={"email": "nobody@example.com", "password": "whatever12"}
    )
    assert eleventh.status_code == 429
