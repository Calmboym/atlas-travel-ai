"""Tests for POST /api/v1/auth/verify-email and /resend-verification.

ADDED — ATLAS-P1-AUTH-04.
"""

from datetime import datetime, timedelta, timezone

from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import update

from app.models.email_verification_token import EmailVerificationToken
from app.db.session import AsyncSessionLocal
from app.services.auth_service import register_user, resend_verification_token
from tests.conftest import hash_raw_token


async def test_verify_email_with_valid_token(client: AsyncClient, db_session: AsyncSession) -> None:
    _user, raw_token = await register_user(db_session, "direct-verify@example.com", "longenough1")

    response = await client.post("/api/v1/auth/verify-email", json={"token": raw_token})
    assert response.status_code == 200
    assert response.json()["user"]["is_verified"] is True


async def test_verify_email_invalid_token_returns_400(client: AsyncClient) -> None:
    response = await client.post("/api/v1/auth/verify-email", json={"token": "totally-made-up"})
    assert response.status_code == 400


async def test_verify_email_token_is_single_use(client: AsyncClient, db_session: AsyncSession) -> None:
    _user, raw_token = await register_user(db_session, "single-use@example.com", "longenough1")

    first = await client.post("/api/v1/auth/verify-email", json={"token": raw_token})
    assert first.status_code == 200

    second = await client.post("/api/v1/auth/verify-email", json={"token": raw_token})
    assert second.status_code == 400


async def test_verify_email_expired_token_returns_400(client: AsyncClient, db_session: AsyncSession) -> None:
    _user, raw_token = await register_user(db_session, "expired@example.com", "longenough1")

    await db_session.execute(
        update(EmailVerificationToken)
        .where(EmailVerificationToken.token_hash == hash_raw_token(raw_token))
        .values(expires_at=datetime.now(timezone.utc) - timedelta(hours=1))
    )
    await db_session.commit()

    response = await client.post("/api/v1/auth/verify-email", json={"token": raw_token})
    assert response.status_code == 400


async def test_verify_email_missing_token_returns_422(client: AsyncClient) -> None:
    response = await client.post("/api/v1/auth/verify-email", json={"token": ""})
    assert response.status_code == 422


async def test_resend_verification_existing_unverified_user(client: AsyncClient) -> None:
    await client.post(
        "/api/v1/auth/register", json={"email": "resend-me@example.com", "password": "longenough1"}
    )
    response = await client.post(
        "/api/v1/auth/resend-verification", json={"email": "resend-me@example.com"}
    )
    assert response.status_code == 202


async def test_resend_verification_nonexistent_email_gives_identical_response(
    client: AsyncClient,
) -> None:
    real_user_response = await client.post(
        "/api/v1/auth/register", json={"email": "real-user@example.com", "password": "longenough1"}
    )
    assert real_user_response.status_code == 201

    existing = await client.post(
        "/api/v1/auth/resend-verification", json={"email": "real-user@example.com"}
    )
    nonexistent = await client.post(
        "/api/v1/auth/resend-verification", json={"email": "does-not-exist@example.com"}
    )
    assert existing.status_code == nonexistent.status_code == 202
    assert existing.json() == nonexistent.json()


async def test_resend_verification_already_verified_user_issues_no_usable_token(
    client: AsyncClient, db_session: AsyncSession
) -> None:
    _user, raw_token = await register_user(db_session, "already-verified@example.com", "longenough1")
    await client.post("/api/v1/auth/verify-email", json={"token": raw_token})

    # A fresh session here, not the one above — `client`'s HTTP call
    # committed the is_verified change through its own request-scoped
    # session (get_db), and db_session's identity map from before that
    # commit would otherwise return a stale, pre-verification User
    # object. Every real request gets its own fresh session in
    # production (see app/db/session.py get_db); this mirrors that.
    async with AsyncSessionLocal() as fresh_session:
        new_token = await resend_verification_token(fresh_session, "already-verified@example.com")
    assert new_token is None


async def test_resend_verification_new_token_is_usable(client: AsyncClient, db_session: AsyncSession) -> None:
    await register_user(db_session, "resend-flow@example.com", "longenough1")

    new_token = await resend_verification_token(db_session, "resend-flow@example.com")
    assert new_token is not None

    response = await client.post("/api/v1/auth/verify-email", json={"token": new_token})
    assert response.status_code == 200


async def test_resend_verification_rate_limit_enforced(client: AsyncClient) -> None:
    # Default limit is 10/hour per IP (Settings.rate_limit_verify_max).
    for _ in range(10):
        response = await client.post(
            "/api/v1/auth/resend-verification", json={"email": "nobody@example.com"}
        )
        assert response.status_code == 202

    eleventh = await client.post(
        "/api/v1/auth/resend-verification", json={"email": "nobody@example.com"}
    )
    assert eleventh.status_code == 429
