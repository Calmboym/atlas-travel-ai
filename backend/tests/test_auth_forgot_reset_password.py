"""Tests for POST /api/v1/auth/forgot-password and /reset-password.

ADDED — ATLAS-P1-AUTH-06. Mirrors test_auth_verify_email.py's pattern
(same underlying token mechanics), plus AUTH-07 integration coverage:
a successful reset must revoke every existing session for that user.
"""

from datetime import datetime, timedelta, timezone

from httpx import AsyncClient
from sqlalchemy import update
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import AsyncSessionLocal
from app.models.password_reset_token import PasswordResetToken
from app.services.auth_service import register_user, request_password_reset
from tests.conftest import hash_raw_token

_EMAIL = "reset-me@example.com"
_OLD_PASSWORD = "longenough1"
_NEW_PASSWORD = "evenlongerpass2"


# --- POST /auth/forgot-password -----------------------------------------


async def test_forgot_password_existing_user_returns_202(client: AsyncClient) -> None:
    await client.post("/api/v1/auth/register", json={"email": _EMAIL, "password": _OLD_PASSWORD})
    response = await client.post("/api/v1/auth/forgot-password", json={"email": _EMAIL})
    assert response.status_code == 202


async def test_forgot_password_nonexistent_email_gives_identical_response(
    client: AsyncClient,
) -> None:
    real_user_response = await client.post(
        "/api/v1/auth/register", json={"email": "real-user-fp@example.com", "password": _OLD_PASSWORD}
    )
    assert real_user_response.status_code == 201

    existing = await client.post(
        "/api/v1/auth/forgot-password", json={"email": "real-user-fp@example.com"}
    )
    nonexistent = await client.post(
        "/api/v1/auth/forgot-password", json={"email": "does-not-exist-fp@example.com"}
    )
    assert existing.status_code == nonexistent.status_code == 202
    assert existing.json() == nonexistent.json()


async def test_forgot_password_rate_limit_enforced(client: AsyncClient) -> None:
    # Default limit is 5/hour per IP (Settings.rate_limit_forgot_password_max).
    for _ in range(5):
        response = await client.post(
            "/api/v1/auth/forgot-password", json={"email": "nobody-fp@example.com"}
        )
        assert response.status_code == 202

    sixth = await client.post("/api/v1/auth/forgot-password", json={"email": "nobody-fp@example.com"})
    assert sixth.status_code == 429


# --- POST /auth/reset-password ------------------------------------------


async def test_reset_password_with_valid_token(client: AsyncClient, db_session: AsyncSession) -> None:
    await register_user(db_session, _EMAIL, _OLD_PASSWORD)
    raw_token = await request_password_reset(db_session, _EMAIL)
    assert raw_token is not None

    response = await client.post(
        "/api/v1/auth/reset-password", json={"token": raw_token, "new_password": _NEW_PASSWORD}
    )
    assert response.status_code == 200
    assert response.json()["user"]["email"] == _EMAIL


async def test_reset_password_actually_changes_the_password(
    client: AsyncClient, db_session: AsyncSession
) -> None:
    await register_user(db_session, _EMAIL, _OLD_PASSWORD)
    raw_token = await request_password_reset(db_session, _EMAIL)
    assert raw_token is not None

    await client.post(
        "/api/v1/auth/reset-password", json={"token": raw_token, "new_password": _NEW_PASSWORD}
    )

    old_password_login = await client.post(
        "/api/v1/auth/login", json={"email": _EMAIL, "password": _OLD_PASSWORD}
    )
    assert old_password_login.status_code == 401

    new_password_login = await client.post(
        "/api/v1/auth/login", json={"email": _EMAIL, "password": _NEW_PASSWORD}
    )
    assert new_password_login.status_code == 200


async def test_reset_password_invalid_token_returns_400(client: AsyncClient) -> None:
    response = await client.post(
        "/api/v1/auth/reset-password", json={"token": "totally-made-up", "new_password": _NEW_PASSWORD}
    )
    assert response.status_code == 400


async def test_reset_password_token_is_single_use(
    client: AsyncClient, db_session: AsyncSession
) -> None:
    await register_user(db_session, _EMAIL, _OLD_PASSWORD)
    raw_token = await request_password_reset(db_session, _EMAIL)
    assert raw_token is not None

    first = await client.post(
        "/api/v1/auth/reset-password", json={"token": raw_token, "new_password": _NEW_PASSWORD}
    )
    assert first.status_code == 200

    second = await client.post(
        "/api/v1/auth/reset-password", json={"token": raw_token, "new_password": "yetanotherpass3"}
    )
    assert second.status_code == 400


async def test_reset_password_expired_token_returns_400(
    client: AsyncClient, db_session: AsyncSession
) -> None:
    await register_user(db_session, _EMAIL, _OLD_PASSWORD)
    raw_token = await request_password_reset(db_session, _EMAIL)
    assert raw_token is not None

    await db_session.execute(
        update(PasswordResetToken)
        .where(PasswordResetToken.token_hash == hash_raw_token(raw_token))
        .values(expires_at=datetime.now(timezone.utc) - timedelta(hours=1))
    )
    await db_session.commit()

    response = await client.post(
        "/api/v1/auth/reset-password", json={"token": raw_token, "new_password": _NEW_PASSWORD}
    )
    assert response.status_code == 400


async def test_reset_password_missing_fields_returns_422(client: AsyncClient) -> None:
    response = await client.post("/api/v1/auth/reset-password", json={"token": ""})
    assert response.status_code == 422


async def test_reset_password_too_short_returns_422(
    client: AsyncClient, db_session: AsyncSession
) -> None:
    await register_user(db_session, _EMAIL, _OLD_PASSWORD)
    raw_token = await request_password_reset(db_session, _EMAIL)
    assert raw_token is not None

    response = await client.post(
        "/api/v1/auth/reset-password", json={"token": raw_token, "new_password": "short"}
    )
    assert response.status_code == 422


async def test_reset_password_rate_limit_enforced(client: AsyncClient) -> None:
    # Default limit is 10/hour per IP (Settings.rate_limit_reset_password_max).
    for _ in range(10):
        response = await client.post(
            "/api/v1/auth/reset-password", json={"token": "bogus", "new_password": _NEW_PASSWORD}
        )
        assert response.status_code == 400

    eleventh = await client.post(
        "/api/v1/auth/reset-password", json={"token": "bogus", "new_password": _NEW_PASSWORD}
    )
    assert eleventh.status_code == 429


# --- AUTH-07 integration: reset must revoke every existing session ------


async def test_reset_password_revokes_all_existing_sessions(client: AsyncClient) -> None:
    """The core reason AUTH-06 was sequenced after AUTH-07 in this
    session: a changed password must immediately sign the user out
    everywhere it was used with the old one.
    """
    await client.post("/api/v1/auth/register", json={"email": _EMAIL, "password": _OLD_PASSWORD})
    login_response = await client.post(
        "/api/v1/auth/login", json={"email": _EMAIL, "password": _OLD_PASSWORD}
    )
    assert login_response.status_code == 200

    # Confirm the session is live before reset.
    me_before = await client.get("/api/v1/auth/me")
    assert me_before.status_code == 200

    async with AsyncSessionLocal() as fresh_session:
        raw_token = await request_password_reset(fresh_session, _EMAIL)
    assert raw_token is not None

    reset_response = await client.post(
        "/api/v1/auth/reset-password", json={"token": raw_token, "new_password": _NEW_PASSWORD}
    )
    assert reset_response.status_code == 200

    # The access-token cookie from the OLD session is still sitting in
    # the client's cookie jar (reset-password doesn't touch cookies —
    # only logout/refresh do) — proving the *session*, not just a
    # cookie, was invalidated.
    me_after = await client.get("/api/v1/auth/me")
    assert me_after.status_code == 401
