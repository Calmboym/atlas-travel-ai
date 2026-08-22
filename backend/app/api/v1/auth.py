"""Authentication endpoints: register, login, email verification.

ADDED — ATLAS-P1-AUTH-02 (register), ATLAS-P1-AUTH-04 (verify-email,
resend-verification), ATLAS-P1-AUTH-05 (login). Kept thin — all
business logic lives in app/services/auth_service.py.
"""

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.rate_limit import RateLimiter
from app.core.security import create_access_token
from app.db.session import get_db
from app.schemas.auth import (
    LoginRequest,
    RegisterRequest,
    RegisterResponse,
    ResendVerificationRequest,
    TokenResponse,
    UserResponse,
    VerifyEmailRequest,
    VerifyEmailResponse,
)
from app.services.auth_service import (
    EmailAlreadyRegisteredError,
    InvalidCredentialsError,
    InvalidVerificationTokenError,
    authenticate_user,
    register_user,
    resend_verification_token,
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

    access_token = create_access_token(user.id)
    expires_in = settings.access_token_expire_minutes * 60

    # httpOnly cookie so the token isn't reachable from JS (mitigates
    # the "Sensitive local storage" risk FRONTEND_IMPLEMENTATION_
    # GUIDELINES.md §Security calls out). Full session lifecycle
    # (revocation, refresh, Redis-backed store) is AUTH-07's scope —
    # this is the minimal, stateless credential AUTH-05 needs to
    # represent "login succeeded."
    response.set_cookie(
        key="atlas_access_token",
        value=access_token,
        max_age=expires_in,
        httponly=True,
        samesite="lax",
        secure=settings.app_env != "development",
    )

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
