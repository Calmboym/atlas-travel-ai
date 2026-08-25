"""Password hashing and JWT access-token helpers.

ADDED — ATLAS-P1-AUTH-02 (password hashing), ATLAS-P1-AUTH-05 (JWT
access tokens). GUIDELINES.md §11 requires "Secure password storage"
without naming an algorithm; bcrypt is used directly here (not the
`passlib` wrapper — passlib's bcrypt backend has known compatibility
gaps with recent bcrypt releases, flagged to the project owner before
implementation began, see .ai/PROJECT_STATE.md).

EXTENDED — ATLAS-P1-AUTH-07. `create_access_token`/`decode_access_token`
now carry a `jti` (JWT ID) claim, which doubles as the Redis session
key in app/core/session_store.py. Before this task the JWT was purely
stateless (valid until its own `exp`, un-revocable); AUTH-05's own
docstring in app/api/v1/auth.py flagged this explicitly ("Full session
lifecycle (revocation, refresh, Redis-backed store) is AUTH-07's
scope"). `decode_access_token`'s return type changes from a bare UUID
to `AccessTokenPayload` (breaking change, all three callers — login,
the new get_current_user dependency, and test_security.py — updated
in this same task).
"""

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from functools import lru_cache
from uuid import UUID, uuid4

import bcrypt
import jwt

from app.core.config import get_settings

_BCRYPT_MAX_PASSWORD_BYTES = 72  # bcrypt's own hard limit; also enforced in RegisterRequest.

# ADDED — ATLAS-P1-AUTH-07. Previously an inline string literal only in
# app/api/v1/auth.py's login() function; extracted here so login
# (which sets the cookies) and app/core/deps.get_current_user (which
# reads them) share one source of truth instead of two literals that
# could silently drift apart.
ACCESS_TOKEN_COOKIE_NAME = "atlas_access_token"
REFRESH_TOKEN_COOKIE_NAME = "atlas_refresh_token"


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


@dataclass(frozen=True)
class AccessTokenPayload:
    """Decoded JWT contents. `jti` is the session id — see session_store.py."""

    user_id: UUID
    jti: UUID


def create_access_token(
    subject: UUID, jti: UUID | None = None, expires_delta: timedelta | None = None
) -> tuple[str, UUID]:
    """Issue a signed access token. Returns (token, jti).

    `jti` should normally be supplied by the caller — in the real login
    flow it comes from session_store.create_session, so the JWT's jti
    and the Redis session key are the same value from the start. Left
    optional (auto-generated with uuid4() if omitted) so this function
    stays independently testable and usable outside a full session
    (test_security.py exercises it directly, with no Redis involved).
    """
    settings = get_settings()
    now = datetime.now(timezone.utc)
    expire = now + (expires_delta or timedelta(minutes=settings.access_token_expire_minutes))
    token_jti = jti or uuid4()
    payload = {"sub": str(subject), "jti": str(token_jti), "iat": now, "exp": expire}
    token = jwt.encode(payload, settings.secret_key, algorithm=settings.jwt_algorithm)
    return token, token_jti


def decode_access_token(token: str) -> AccessTokenPayload | None:
    """Returns the decoded (user_id, jti) for a valid, unexpired token, else None.

    Signature/expiry validity only — this does NOT check whether the
    session has been revoked in Redis. That check is
    session_store.get_session_user_id, applied by the get_current_user
    dependency in app/core/deps.py. Keeping them separate means this
    function stays a pure, Redis-free unit (see test_security.py).
    """
    settings = get_settings()
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.jwt_algorithm])
        return AccessTokenPayload(user_id=UUID(payload["sub"]), jti=UUID(payload["jti"]))
    except (jwt.PyJWTError, KeyError, ValueError):
        return None
