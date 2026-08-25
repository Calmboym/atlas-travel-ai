"""Shared FastAPI dependencies for identifying and authorizing the
current user.

ADDED — ATLAS-P1-AUTH-07 (get_current_user).

get_current_user is intentionally stricter than "is this JWT signature
valid": a request is only authenticated if BOTH the JWT decodes/hasn't
expired AND its jti still has a live entry in Redis (app/core/
session_store.py) — the second check is what makes logout and
password-reset revocation actually work, rather than merely clearing a
cookie the old token would still satisfy until its own `exp`.

EXTENDED — ATLAS-P1-AUTH-08: require_role. RBAC scaffold per
ARCHITECTURE.md §12 — layers a role check on top of get_current_user
rather than duplicating its auth logic.
"""

from typing import Any, Callable, Coroutine

from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import ACCESS_TOKEN_COOKIE_NAME, decode_access_token
from app.core.session_store import get_session_user_id
from app.db.session import get_db
from app.models.user import User, UserRole

_NOT_AUTHENTICATED = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Not authenticated.",
    headers={"WWW-Authenticate": "Bearer"},
)
_SESSION_INVALID = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Your session has expired or was signed out. Please log in again.",
    headers={"WWW-Authenticate": "Bearer"},
)


def _extract_token(request: Request) -> str | None:
    cookie_token = request.cookies.get(ACCESS_TOKEN_COOKIE_NAME)
    if cookie_token:
        return cookie_token
    # Authorization: Bearer <token> — not used by the web frontend
    # (which relies on the httpOnly cookie), but ARCHITECTURE.md §15
    # names the Telegram Bot and Mobile Application as future
    # consumers of "the same backend APIs"; neither can send cookies
    # the way a browser does, so header-based auth is supported now
    # rather than becoming a breaking API change later.
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.lower().startswith("bearer "):
        return auth_header[7:].strip()
    return None


async def get_current_user(request: Request, db: AsyncSession = Depends(get_db)) -> User:
    token = _extract_token(request)
    if token is None:
        raise _NOT_AUTHENTICATED

    payload = decode_access_token(token)
    if payload is None:
        raise _NOT_AUTHENTICATED

    session_user_id = await get_session_user_id(payload.jti)
    if session_user_id is None or session_user_id != payload.user_id:
        raise _SESSION_INVALID

    user = await db.get(User, payload.user_id)
    if user is None or not user.is_active:
        raise _SESSION_INVALID

    return user


def require_role(*allowed_roles: UserRole) -> Callable[..., Coroutine[Any, Any, User]]:
    """Dependency factory: `Depends(require_role(UserRole.ADMIN))`.

    Deliberately layers on top of get_current_user via FastAPI's own
    Depends() chaining rather than duplicating any of its checks — a
    caller must already be authenticated (valid JWT + live Redis
    session) before role is even considered.

    No route in this task group actually uses this yet: no admin-only
    feature exists anywhere in the product yet to protect (Admin
    Dashboard is Phase 7 — PRODUCT_VISION.md §26 / ARCHITECTURE.md's
    "Future" list). Per this task's own "RBAC scaffold" framing, and
    consistent with MASTER_RULES.md's forbidding scope creep into
    inventing product features, this is exercised directly in
    tests/test_rbac.py rather than wired onto a fabricated protected
    endpoint. The next real admin-only route (whenever one is
    authorized) uses this unchanged.
    """

    async def _dependency(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to perform this action.",
            )
        return current_user

    return _dependency
