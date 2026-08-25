"""Redis-backed session store.

ADDED — ATLAS-P1-AUTH-07. Gives the previously-stateless JWT (AUTH-05)
a server-side record that can be revoked before the token's own `exp`
— required for real logout and for password-reset-triggered
"sign out everywhere" (ATLAS-P1-AUTH-06 calls revoke_all_sessions_for_user
on a successful reset). Mirrors this project's existing hash-before-store
principle for bearer secrets (see EmailVerificationToken's docstring):
the refresh token is stored as a SHA-256 hash, never in raw form.

Redis key scheme:
    session:{jti}            -> user_id (str), TTL = refresh_token_expire_days
    refresh:{sha256(token)}  -> jti (str),      TTL = refresh_token_expire_days
    user_sessions:{user_id}  -> SET of jti (str), no TTL (pruned explicitly
                                 on revoke; stale members are harmless — a
                                 revoke-all walks the set and deletes each
                                 session:{jti}, whether or not it already expired)

A "session" is identified by `jti`, which is also the JWT's own `jti`
claim (app/core/security.py). One session may have many access tokens
issued for it over time (each refresh re-signs a new short-lived JWT
carrying the SAME jti) but exactly one refresh token.
"""

import hashlib
import secrets
from uuid import UUID, uuid4

from app.core.config import get_settings
from app.core.redis import get_redis_client

_SESSION_KEY_PREFIX = "session"
_REFRESH_KEY_PREFIX = "refresh"
_USER_SESSIONS_KEY_PREFIX = "user_sessions"


def _hash_refresh_token(raw_token: str) -> str:
    return hashlib.sha256(raw_token.encode("utf-8")).hexdigest()


def _decode(value: bytes | str) -> str:
    """Normalize a Redis response to str.

    `decode_responses=True` (app/core/redis.py) means this is always
    already a str at runtime — the installed redis-py version's type
    stubs don't reflect that (Redis isn't declared Generic here, so
    mypy sees `bytes | str` regardless), so this narrows explicitly
    rather than silencing the checker with a blanket `# type: ignore`.
    """
    return value.decode("utf-8") if isinstance(value, bytes) else value


def _session_key(jti: UUID) -> str:
    return f"{_SESSION_KEY_PREFIX}:{jti}"


def _refresh_key(raw_token: str) -> str:
    return f"{_REFRESH_KEY_PREFIX}:{_hash_refresh_token(raw_token)}"


def _user_sessions_key(user_id: UUID) -> str:
    return f"{_USER_SESSIONS_KEY_PREFIX}:{user_id}"


async def create_session(user_id: UUID) -> tuple[UUID, str]:
    """Register a new session. Returns (jti, raw_refresh_token).

    Called once per login (app/api/v1/auth.py). The caller embeds the
    returned jti into the access-token JWT and sets the raw refresh
    token as an httpOnly cookie — the raw value is never persisted
    anywhere, mirroring EmailVerificationToken/PasswordResetToken.
    """
    settings = get_settings()
    redis_client = get_redis_client()
    jti = uuid4()
    raw_refresh_token = secrets.token_urlsafe(32)
    ttl_seconds = settings.refresh_token_expire_days * 24 * 60 * 60

    async with redis_client.pipeline(transaction=True) as pipe:
        pipe.set(_session_key(jti), str(user_id), ex=ttl_seconds)
        pipe.set(_refresh_key(raw_refresh_token), str(jti), ex=ttl_seconds)
        pipe.sadd(_user_sessions_key(user_id), str(jti))
        await pipe.execute()

    return jti, raw_refresh_token


async def get_session_user_id(jti: UUID) -> UUID | None:
    """Returns the owning user_id if this session is still active, else None."""
    redis_client = get_redis_client()
    value = await redis_client.get(_session_key(jti))
    return UUID(_decode(value)) if value else None


async def resolve_refresh_token(raw_token: str) -> UUID | None:
    """Returns the jti a refresh token belongs to, if it's still valid."""
    redis_client = get_redis_client()
    value = await redis_client.get(_refresh_key(raw_token))
    return UUID(_decode(value)) if value else None


async def touch_session(jti: UUID, raw_refresh_token: str) -> None:
    """Slide both the session and its refresh token's TTL forward.

    Called on every successful refresh — an actively-used session
    should keep extending, not silently expire out from under a user
    who is still using the product (sliding-expiration session,
    consistent with "reduce friction" — ONBOARDING_EXPERIENCE.md — and
    the project's general anti-surprise posture toward the user).
    """
    settings = get_settings()
    redis_client = get_redis_client()
    ttl_seconds = settings.refresh_token_expire_days * 24 * 60 * 60
    async with redis_client.pipeline(transaction=True) as pipe:
        pipe.expire(_session_key(jti), ttl_seconds)
        pipe.expire(_refresh_key(raw_refresh_token), ttl_seconds)
        await pipe.execute()


async def revoke_session(jti: UUID, user_id: UUID) -> None:
    """Revoke one session (used by logout)."""
    redis_client = get_redis_client()
    async with redis_client.pipeline(transaction=True) as pipe:
        pipe.delete(_session_key(jti))
        pipe.srem(_user_sessions_key(user_id), str(jti))
        await pipe.execute()


async def revoke_refresh_token(raw_token: str) -> None:
    """Delete a refresh token's own Redis entry (used by logout)."""
    redis_client = get_redis_client()
    await redis_client.delete(_refresh_key(raw_token))


async def revoke_all_sessions_for_user(user_id: UUID) -> None:
    """Revoke every active session for a user.

    Used by ATLAS-P1-AUTH-06 on a successful password reset — a
    changed password should immediately invalidate any session created
    with the old one, everywhere the user was signed in. Leftover
    refresh:{hash} entries for the revoked sessions are not individually
    deleted here (their raw tokens aren't known at this point without
    an extra reverse index) but become inert immediately: resolve_refresh_token
    still finds the jti, but get_session_user_id then returns None for
    it, so app/core/deps.get_current_user and POST /auth/refresh both
    reject it as if it never existed. They self-expire via their own TTL.
    """
    redis_client = get_redis_client()
    sessions_key = _user_sessions_key(user_id)
    jtis = await redis_client.smembers(sessions_key)
    if not jtis:
        return
    async with redis_client.pipeline(transaction=True) as pipe:
        for raw_jti in jtis:
            pipe.delete(_session_key(UUID(_decode(raw_jti))))
        pipe.delete(sessions_key)
        await pipe.execute()
