"""Tests for app/core/deps.require_role and User.role.

ADDED — ATLAS-P1-AUTH-08. require_role has no real protected endpoint
to test through the HTTP layer yet (see its own docstring) — exercised
directly here instead, the same way test_security.py tests
create_access_token/decode_access_token as plain functions without an
HTTP layer. Integration coverage (default role on registration, role
exposed via /me) still goes through the real HTTP client.
"""

import uuid
from datetime import datetime, timezone

import pytest
from fastapi import HTTPException
from httpx import AsyncClient

from app.core.deps import require_role
from app.models.user import User, UserRole

_EMAIL = "rbac-user@example.com"
_PASSWORD = "longenough1"


def _make_user(role: UserRole) -> User:
    """A plain, unpersisted User — require_role never touches the
    database, only current_user.role, so a real DB row isn't needed.
    """
    return User(
        id=uuid.uuid4(),
        email="scaffold@example.com",
        hashed_password="irrelevant",
        is_active=True,
        is_verified=True,
        role=role,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )


# --- require_role, called directly (no HTTP layer, no FastAPI DI) -------


async def test_require_role_allows_a_matching_role() -> None:
    dependency = require_role(UserRole.ADMIN)
    admin_user = _make_user(UserRole.ADMIN)

    result = await dependency(current_user=admin_user)

    assert result is admin_user


async def test_require_role_rejects_a_non_matching_role_with_403() -> None:
    dependency = require_role(UserRole.ADMIN)
    regular_user = _make_user(UserRole.USER)

    with pytest.raises(HTTPException) as exc_info:
        await dependency(current_user=regular_user)

    assert exc_info.value.status_code == 403


async def test_require_role_accepts_any_of_multiple_allowed_roles() -> None:
    dependency = require_role(UserRole.ADMIN, UserRole.SYSTEM)

    admin_result = await dependency(current_user=_make_user(UserRole.ADMIN))
    system_result = await dependency(current_user=_make_user(UserRole.SYSTEM))

    assert admin_result.role == UserRole.ADMIN
    assert system_result.role == UserRole.SYSTEM


async def test_require_role_rejects_when_none_of_multiple_allowed_roles_match() -> None:
    dependency = require_role(UserRole.ADMIN, UserRole.SYSTEM)

    with pytest.raises(HTTPException) as exc_info:
        await dependency(current_user=_make_user(UserRole.USER))

    assert exc_info.value.status_code == 403


async def test_require_role_error_message_does_not_leak_which_roles_are_allowed() -> None:
    # The 403 message shouldn't hand an attacker a role enumeration —
    # matches COPYWRITING_GUIDELINES.md's general "never expose
    # internal system detail" posture applied to authorization errors.
    dependency = require_role(UserRole.SYSTEM)

    with pytest.raises(HTTPException) as exc_info:
        await dependency(current_user=_make_user(UserRole.ADMIN))

    assert "system" not in exc_info.value.detail.lower()


# --- Integration: default role + /me exposure ----------------------------


async def test_newly_registered_user_defaults_to_user_role(client: AsyncClient) -> None:
    response = await client.post(
        "/api/v1/auth/register", json={"email": _EMAIL, "password": _PASSWORD}
    )
    assert response.status_code == 201
    assert response.json()["user"]["role"] == "user"


async def test_me_response_includes_role(client: AsyncClient) -> None:
    await client.post("/api/v1/auth/register", json={"email": _EMAIL, "password": _PASSWORD})
    await client.post("/api/v1/auth/login", json={"email": _EMAIL, "password": _PASSWORD})

    response = await client.get("/api/v1/auth/me")

    assert response.status_code == 200
    assert response.json()["role"] == "user"
