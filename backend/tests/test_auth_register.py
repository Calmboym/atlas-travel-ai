"""Tests for POST /api/v1/auth/register.

ADDED — ATLAS-P1-AUTH-02.
"""

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.user import User


async def test_register_success(client: AsyncClient) -> None:
    response = await client.post(
        "/api/v1/auth/register",
        json={"email": "new-user@example.com", "password": "longenough1"},
    )
    assert response.status_code == 201
    body = response.json()
    assert body["user"]["email"] == "new-user@example.com"
    assert body["user"]["is_verified"] is False
    assert "id" in body["user"]
    assert "message" in body


async def test_register_normalizes_email_casing_and_whitespace(client: AsyncClient) -> None:
    response = await client.post(
        "/api/v1/auth/register",
        json={"email": "  Mixed.Case@EXAMPLE.com  ", "password": "longenough1"},
    )
    assert response.status_code == 201
    assert response.json()["user"]["email"] == "mixed.case@example.com"


async def test_register_never_returns_password_or_hash(client: AsyncClient) -> None:
    response = await client.post(
        "/api/v1/auth/register",
        json={"email": "secret@example.com", "password": "longenough1"},
    )
    assert "longenough1" not in response.text
    assert "hashed_password" not in response.text
    assert "password" not in response.json()["user"]


async def test_register_duplicate_email_returns_409(client: AsyncClient) -> None:
    payload = {"email": "dupe@example.com", "password": "longenough1"}
    first = await client.post("/api/v1/auth/register", json=payload)
    assert first.status_code == 201

    second = await client.post("/api/v1/auth/register", json=payload)
    assert second.status_code == 409


async def test_register_duplicate_email_case_insensitive(client: AsyncClient) -> None:
    await client.post(
        "/api/v1/auth/register", json={"email": "case@example.com", "password": "longenough1"}
    )
    second = await client.post(
        "/api/v1/auth/register", json={"email": "CASE@EXAMPLE.COM", "password": "longenough1"}
    )
    assert second.status_code == 409


@pytest.mark.parametrize("password", ["short1", "1234567", ""])
async def test_register_rejects_short_password(client: AsyncClient, password: str) -> None:
    response = await client.post(
        "/api/v1/auth/register", json={"email": "shortpw@example.com", "password": password}
    )
    assert response.status_code == 422


async def test_register_rejects_invalid_email(client: AsyncClient) -> None:
    response = await client.post(
        "/api/v1/auth/register", json={"email": "not-an-email", "password": "longenough1"}
    )
    assert response.status_code == 422


async def test_register_rejects_password_over_72_bytes(client: AsyncClient) -> None:
    response = await client.post(
        "/api/v1/auth/register",
        json={"email": "toolong@example.com", "password": "a" * 73},
    )
    assert response.status_code == 422


async def test_register_password_is_hashed_in_storage(
    client: AsyncClient, db_session: AsyncSession
) -> None:
    await client.post(
        "/api/v1/auth/register",
        json={"email": "hashcheck@example.com", "password": "longenough1"},
    )
    result = await db_session.execute(select(User).where(User.email == "hashcheck@example.com"))
    user = result.scalar_one()
    assert user.hashed_password != "longenough1"
    assert user.hashed_password.startswith("$2b$")


async def test_register_rate_limit_enforced(client: AsyncClient) -> None:
    # Default limit is 5/hour per IP (Settings.rate_limit_register_max).
    for i in range(5):
        response = await client.post(
            "/api/v1/auth/register",
            json={"email": f"rl-{i}@example.com", "password": "longenough1"},
        )
        assert response.status_code == 201

    sixth = await client.post(
        "/api/v1/auth/register", json={"email": "rl-6@example.com", "password": "longenough1"}
    )
    assert sixth.status_code == 429
    assert "retry-after" in {k.lower() for k in sixth.headers.keys()}
