"""Authentication endpoints: register, login, email verification, sessions,
password reset.

ADDED — ATLAS-P1-AUTH-02 (register), ATLAS-P1-AUTH-04 (verify-email,
resend-verification), ATLAS-P1-AUTH-05 (login).

EXTENDED — ATLAS-P1-AUTH-07: login now registers a Redis-backed
session (app/core/session_store.py) instead of issuing a bare
stateless JWT, and sets a second httpOnly refresh-token cookie
alongside the existing access-token one. Added refresh/logout/me.

EXTENDED — ATLAS-P1-AUTH-06: added forgot-password/reset-password,
mirroring verify-email/resend-verification's pattern exactly.

Kept thin — all business logic lives in app/services/auth_service.py
(session_store calls are the one exception: they're infrastructure,
not business logic, in the same sense app/db/session.py's get_db
isn't "business logic" either).
"""

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.deps import get_current_user
from app.core.rate_limit import RateLimiter
from app.core.security import (
    ACCESS_TOKEN_COOKIE_NAME,
    REFRESH_TOKEN_COOKIE_NAME,
    create_access_token,
    decode_access_token,
)
from app.core.session_store import (
    create_session,
    get_session_user_id,
    resolve_refresh_token,
    revoke_refresh_token,
    revoke_session,
    touch_session,
)
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import (
    ForgotPasswordRequest,
    LoginRequest,
    RefreshResponse,
    RegisterRequest,
    RegisterResponse,
    ResendVerificationRequest,
    ResetPasswordRequest,
    ResetPasswordResponse,
    TokenResponse,
    UserResponse,
    VerifyEmailRequest,
    VerifyEmailResponse,
)
from app.services.auth_service import (
    EmailAlreadyRegisteredError,
    InvalidCredentialsError,
    InvalidPasswordResetTokenError,
    InvalidVerificationTokenError,
    authenticate_user,
    register_user,
    request_password_reset,
    resend_verification_token,
    reset_password,
    verify_email,
)

router = APIRouter(prefix="/auth", tags=["auth"])
settings = get_settings()

register_rate_limit = RateLimiter(
    "register", settings.rate_limit_register_max, settings.rate_limit_register_window_seconds
)
login_rate_limit = RateLimiter(
    "login", settings.rate_limit_login_max, settings.rate_limit_login_window_seconds
)
verify_rate_limit = RateLimiter(
    "verify-email", settings.rate_limit_verify_max, settings.rate_limit_verify_window_seconds
)
refresh_rate_limit = RateLimiter(
    "refresh", settings.rate_limit_refresh_max, settings.rate_limit_refresh_window_seconds
)
logout_rate_limit = RateLimiter(
    "logout", settings.rate_limit_logout_max, settings.rate_limit_logout_window_seconds
)
me_rate_limit = RateLimiter("me", settings.rate_limit_me_max, settings.rate_limit_me_window_seconds)
forgot_password_rate_limit = RateLimiter(
    "forgot-password",
    settings.rate_limit_forgot_password_max,
    settings.rate_limit_forgot_password_window_seconds,
)
reset_password_rate_limit = RateLimiter(
    "reset-password",
    settings.rate_limit_reset_password_max,
    settings.rate_limit_reset_password_window_seconds,
)


def _set_session_cookies(response: Response, access_token: str, refresh_token: str) -> None:
    is_production = settings.app_env != "development"
    response.set_cookie(
        key=ACCESS_TOKEN_COOKIE_NAME,
        value=access_token,
        max_age=settings.access_token_expire_minutes * 60,
        httponly=True,
        samesite="lax",
        secure=is_production,
    )
    response.set_cookie(
        key=REFRESH_TOKEN_COOKIE_NAME,
        value=refresh_token,
        max_age=settings.refresh_token_expire_days * 24 * 60 * 60,
        httponly=True,
        samesite="lax",
        secure=is_production,
        path="/api/v1/auth",  # only sent back to auth endpoints — narrower blast radius than access token
    )


def _clear_session_cookies(response: Response) -> None:
    is_production = settings.app_env != "development"
    response.delete_cookie(
        key=ACCESS_TOKEN_COOKIE_NAME, httponly=True, samesite="lax", secure=is_production
    )
    response.delete_cookie(
        key=REFRESH_TOKEN_COOKIE_NAME,
        httponly=True,
        samesite="lax",
        secure=is_production,
        path="/api/v1/auth",
    )


@router.post(
    "/register",
    response_model=RegisterResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(register_rate_limit)],
)
async def register(payload: RegisterRequest, db: AsyncSession = Depends(get_db)) -> RegisterResponse:
    try:
        user, _raw_token = await register_user(db, payload.email, payload.password)
    except EmailAlreadyRegisteredError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="That email is already registered.",
        ) from exc

    return RegisterResponse(user=UserResponse.model_validate(user))


@router.post(
    "/login",
    response_model=TokenResponse,
    dependencies=[Depends(login_rate_limit)],
)
async def login(
    payload: LoginRequest, response: Response, db: AsyncSession = Depends(get_db)
) -> TokenResponse:
    try:
        user = await authenticate_user(db, payload.email, payload.password)
    except InvalidCredentialsError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
        ) from exc

    jti, raw_refresh_token = await create_session(user.id)
    access_token, _jti = create_access_token(user.id, jti=jti)
    expires_in = settings.access_token_expire_minutes * 60

    # httpOnly cookies so neither token is reachable from JS (mitigates
    # the "Sensitive local storage" risk FRONTEND_IMPLEMENTATION_
    # GUIDELINES.md §Security calls out). The access token is a short-
    # lived, stateless-looking JWT whose jti is now backed by a real
    # Redis session record (app/core/session_store.py) — this is what
    # makes POST /auth/logout and AUTH-06's password-reset revocation
    # actually work, rather than merely deleting a cookie the old,
    # still-valid token would satisfy until its own `exp`.
    _set_session_cookies(response, access_token, raw_refresh_token)

    return TokenResponse(
        access_token=access_token,
        expires_in=expires_in,
        user=UserResponse.model_validate(user),
    )


@router.post("/verify-email", response_model=VerifyEmailResponse)
async def verify_email_endpoint(
    payload: VerifyEmailRequest, db: AsyncSession = Depends(get_db)
) -> VerifyEmailResponse:
    try:
        user = await verify_email(db, payload.token)
    except InvalidVerificationTokenError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This verification link is invalid or has expired.",
        ) from exc

    return VerifyEmailResponse(
        message="Your email has been verified.",
        user=UserResponse.model_validate(user),
    )


@router.post(
    "/resend-verification",
    status_code=status.HTTP_202_ACCEPTED,
    dependencies=[Depends(verify_rate_limit)],
)
async def resend_verification(
    payload: ResendVerificationRequest, db: AsyncSession = Depends(get_db)
) -> dict[str, str]:
    await resend_verification_token(db, payload.email)
    # Identical response regardless of whether the email exists —
    # anti-enumeration (see InvalidCredentialsError's own docstring
    # for the same principle applied to login).
    return {
        "message": (
            "If an account with that email exists and isn't verified yet, "
            "a new verification link has been sent."
        )
    }


@router.post(
    "/refresh",
    response_model=RefreshResponse,
    dependencies=[Depends(refresh_rate_limit)],
)
async def refresh(
    request: Request, response: Response, db: AsyncSession = Depends(get_db)
) -> RefreshResponse:
    """Exchange a still-valid refresh-token cookie for a new access token.

    Re-signs a NEW short-lived JWT carrying the SAME jti (session
    identity is unchanged) and slides both the session's and the
    refresh token's Redis TTL forward — an actively-used session keeps
    extending rather than silently expiring under a user who is still
    using the product.
    """
    raw_refresh_token = request.cookies.get(REFRESH_TOKEN_COOKIE_NAME)
    if raw_refresh_token is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")

    jti = await resolve_refresh_token(raw_refresh_token)
    if jti is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Your session has expired or was signed out. Please log in again.",
        )

    user_id = await get_session_user_id(jti)
    if user_id is None:
        # Session was explicitly revoked (logout / password reset)
        # since this refresh token was last used, even though the
        # refresh token entry itself hasn't hit its own TTL yet.
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Your session has expired or was signed out. Please log in again.",
        )

    user = await db.get(User, user_id)
    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Your session has expired or was signed out. Please log in again.",
        )

    await touch_session(jti, raw_refresh_token)
    access_token, _jti = create_access_token(user.id, jti=jti)
    expires_in = settings.access_token_expire_minutes * 60

    response.set_cookie(
        key=ACCESS_TOKEN_COOKIE_NAME,
        value=access_token,
        max_age=expires_in,
        httponly=True,
        samesite="lax",
        secure=settings.app_env != "development",
    )

    return RefreshResponse(access_token=access_token, expires_in=expires_in)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(logout_rate_limit)])
async def logout(request: Request, response: Response) -> None:
    """Sign out the current session. Idempotent — always clears cookies
    and always returns 204, whether or not a session actually existed
    (a client calling logout twice, or with an already-expired cookie,
    shouldn't see an error for something that isn't really a failure).
    """
    access_token = request.cookies.get(ACCESS_TOKEN_COOKIE_NAME)
    refresh_token = request.cookies.get(REFRESH_TOKEN_COOKIE_NAME)

    if access_token is not None:
        payload = decode_access_token(access_token)
        if payload is not None:
            await revoke_session(payload.jti, payload.user_id)

    if refresh_token is not None:
        await revoke_refresh_token(refresh_token)

    _clear_session_cookies(response)


@router.get("/me", response_model=UserResponse, dependencies=[Depends(me_rate_limit)])
async def me(current_user: User = Depends(get_current_user)) -> UserResponse:
    """Return the currently authenticated user.

    Used by the frontend to check "am I logged in" without duplicating
    JWT logic client-side, and doubles as this task group's one real,
    protected endpoint (exercises get_current_user end-to-end rather
    than only in isolated unit tests).
    """
    return UserResponse.model_validate(current_user)


@router.post(
    "/forgot-password",
    status_code=status.HTTP_202_ACCEPTED,
    dependencies=[Depends(forgot_password_rate_limit)],
)
async def forgot_password(
    payload: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)
) -> dict[str, str]:
    await request_password_reset(db, payload.email)
    # Identical response regardless of whether the email exists —
    # same anti-enumeration principle as /resend-verification.
    return {
        "message": (
            "If an account with that email exists, we've sent a link to reset your password."
        )
    }


@router.post(
    "/reset-password",
    response_model=ResetPasswordResponse,
    dependencies=[Depends(reset_password_rate_limit)],
)
async def reset_password_endpoint(
    payload: ResetPasswordRequest, db: AsyncSession = Depends(get_db)
) -> ResetPasswordResponse:
    try:
        user = await reset_password(db, payload.token, payload.new_password)
    except InvalidPasswordResetTokenError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This password reset link is invalid or has expired.",
        ) from exc

    return ResetPasswordResponse(
        message="Your password has been changed. Please log in again.",
        user=UserResponse.model_validate(user),
    )
