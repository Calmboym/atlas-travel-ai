"""Authentication business logic.

ADDED — ATLAS-P1-AUTH-02 (register_user, get_user_by_email),
ATLAS-P1-AUTH-04 (verify_email, resend_verification_token),
ATLAS-P1-AUTH-05 (authenticate_user).

Kept separate from the route handlers in app/api/v1/auth.py so the
HTTP layer stays thin — mirrors the frontend rule in MASTER_RULES.md
§6 ("business logic lives in hooks/services — never in ... pages")
applied to the backend's own route/service split.
"""

import hashlib
import secrets
from datetime import datetime, timedelta, timezone

import structlog
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.security import hash_password, timing_safety_dummy_hash, verify_password
from app.models.email_verification_token import EmailVerificationToken
from app.models.user import User

logger = structlog.get_logger(__name__)


class EmailAlreadyRegisteredError(Exception):
    """Raised when attempting to register an email that already exists."""


class InvalidCredentialsError(Exception):
    """Raised when login credentials don't match a known, active user.

    Deliberately used for both "no such user" and "wrong password" —
    the route handler must never let a caller distinguish the two
    (anti-enumeration).
    """


class InvalidVerificationTokenError(Exception):
    """Raised when a verification token is missing, expired, or already used."""


def _hash_token(raw_token: str) -> str:
    return hashlib.sha256(raw_token.encode("utf-8")).hexdigest()


async def get_user_by_email(db: AsyncSession, email: str) -> User | None:
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()


async def _create_verification_token(db: AsyncSession, user: User) -> str:
    settings = get_settings()
    raw_token = secrets.token_urlsafe(32)
    db.add(
        EmailVerificationToken(
            user_id=user.id,
            token_hash=_hash_token(raw_token),
            expires_at=datetime.now(timezone.utc)
            + timedelta(hours=settings.email_verification_token_expire_hours),
        )
    )
    return raw_token


def _log_verification_email_stub(user: User, raw_token: str) -> None:
    # Email delivery is stubbed: no SMTP/email provider is documented
    # anywhere in ARCHITECTURE.md's External Providers list. Logging
    # the link server-side (dev-visible only) rather than inventing a
    # provider integration — flagged to the project owner before
    # implementation, see .ai/PROJECT_STATE.md.
    logger.info(
        "verification_email_stub",
        user_id=str(user.id),
        verification_link=f"/verify-email?token={raw_token}",
    )


async def register_user(db: AsyncSession, email: str, password: str) -> tuple[User, str]:
    """Create a new user with a hashed password and a pending verification token.

    Returns (user, raw_verification_token). The raw token exists only
    in memory for this one call — only its hash is ever persisted.
    """
    existing = await get_user_by_email(db, email)
    if existing is not None:
        raise EmailAlreadyRegisteredError(email)

    user = User(email=email, hashed_password=hash_password(password))
    db.add(user)
    await db.flush()  # populate user.id before the FK-dependent token row

    raw_token = await _create_verification_token(db, user)

    await db.commit()
    await db.refresh(user)

    logger.info("user_registered", user_id=str(user.id))
    _log_verification_email_stub(user, raw_token)

    return user, raw_token


async def authenticate_user(db: AsyncSession, email: str, password: str) -> User:
    user = await get_user_by_email(db, email)

    if user is None or not user.is_active:
        # Burn comparable bcrypt CPU time even when there's no user to
        # compare against, so response latency can't be used to probe
        # which emails are registered.
        verify_password(password, timing_safety_dummy_hash())
        raise InvalidCredentialsError()

    if not verify_password(password, user.hashed_password):
        raise InvalidCredentialsError()

    return user


async def verify_email(db: AsyncSession, raw_token: str) -> User:
    token_hash = _hash_token(raw_token)
    result = await db.execute(
        select(EmailVerificationToken).where(EmailVerificationToken.token_hash == token_hash)
    )
    token_row = result.scalar_one_or_none()

    now = datetime.now(timezone.utc)
    if token_row is None or token_row.used_at is not None or token_row.expires_at < now:
        raise InvalidVerificationTokenError()

    user = await db.get(User, token_row.user_id)
    if user is None:
        raise InvalidVerificationTokenError()

    user.is_verified = True
    token_row.used_at = now
    await db.commit()
    await db.refresh(user)

    logger.info("user_email_verified", user_id=str(user.id))
    return user


async def resend_verification_token(db: AsyncSession, email: str) -> str | None:
    """Issue a fresh verification token if a matching, unverified user exists.

    Returns the raw token (for tests / dev visibility) or None. Route
    handlers must return an identical response either way — never
    reveal via the API whether the email exists.
    """
    user = await get_user_by_email(db, email)
    if user is None or user.is_verified:
        return None

    raw_token = await _create_verification_token(db, user)
    await db.commit()

    _log_verification_email_stub(user, raw_token)
    return raw_token
