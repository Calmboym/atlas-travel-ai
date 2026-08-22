"""Password hashing and JWT access-token helpers.

ADDED — ATLAS-P1-AUTH-02 (password hashing), ATLAS-P1-AUTH-05 (JWT
access tokens). GUIDELINES.md §11 requires "Secure password storage"
without naming an algorithm; bcrypt is used directly here (not the
`passlib` wrapper — passlib's bcrypt backend has known compatibility
gaps with recent bcrypt releases, flagged to the project owner before
implementation began, see .ai/PROJECT_STATE.md).
"""

from datetime import datetime, timedelta, timezone
from functools import lru_cache
from uuid import UUID

import bcrypt
import jwt

from app.core.config import get_settings

_BCRYPT_MAX_PASSWORD_BYTES = 72  # bcrypt's own hard limit; also enforced in RegisterRequest.


def hash_password(plain_password: str) -> str:
    """Hash a plaintext password with bcrypt. Returns a UTF-8 string for storage."""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(plain_password.encode("utf-8"), salt)
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plaintext password against a stored bcrypt hash.

    Returns False (never raises) for a malformed stored hash — a
    corrupt/foreign hash should never be treated as a match.
    """
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except ValueError:
        return False


@lru_cache
def timing_safety_dummy_hash() -> str:
    """A real bcrypt hash used only to burn equivalent CPU time on a
    login attempt against a non-existent email, so response latency
    doesn't leak whether an account exists (anti-enumeration).
    Computed once, cached — see auth_service.authenticate_user.
    """
    return hash_password("dummy-password-for-timing-safety")


def create_access_token(subject: UUID, expires_delta: timedelta | None = None) -> str:
    settings = get_settings()
    now = datetime.now(timezone.utc)
    expire = now + (expires_delta or timedelta(minutes=settings.access_token_expire_minutes))
    payload = {"sub": str(subject), "iat": now, "exp": expire}
    return jwt.encode(payload, settings.secret_key, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> UUID | None:
    """Returns the user id encoded in a valid, unexpired token, else None."""
    settings = get_settings()
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.jwt_algorithm])
        return UUID(payload["sub"])
    except (jwt.PyJWTError, KeyError, ValueError):
        return None
