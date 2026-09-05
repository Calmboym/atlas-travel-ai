"""Application configuration.

ADDED — ATLAS-P1-AUTH-02. First real settings module; backend/app/ had
no application code before this task (confirmed empty except
.gitkeep — see .ai/INFRASTRUCTURE_BASELINE.md §8). Reads from
environment variables via pydantic-settings, per ARCHITECTURE.md §12
Secrets Management ("Never store secrets in code. Environment
variables only.") and GUIDELINES.md §17.
"""

from functools import lru_cache

import structlog
from pydantic_settings import BaseSettings, SettingsConfigDict

logger = structlog.get_logger(__name__)

_DEV_DEFAULT_SECRET_KEY = "dev-only-insecure-secret-change-me"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_env: str = "development"

    # --- Database / cache — RECONSTRUCTED names, matching .env.example ---
    database_url: str = "postgresql+asyncpg://atlas:changeme@localhost:5432/atlas"
    redis_url: str = "redis://localhost:6379"

    # --- JWT access token (ATLAS-P1-AUTH-05) ---
    # SECRET_KEY did not exist in .env.example before this task; added
    # alongside it. The default below is an explicit, clearly-named
    # development-only fallback (never used in production — see the
    # warning in get_settings()), not a hardcoded production secret.
    secret_key: str = _DEV_DEFAULT_SECRET_KEY
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    # --- CORS ---
    # The Next.js frontend calls this API directly from the browser
    # (ARCHITECTURE.md §3: Frontend -> Backend API Layer) and AUTH-05's
    # login sets a cookie, which requires explicit origins rather than
    # "*" per FRONTEND_IMPLEMENTATION_GUIDELINES.md §Security.
    cors_allowed_origins: str = "http://localhost:3000"

    # --- Rate limiting (GUIDELINES.md §11 / ARCHITECTURE.md §12 — ---
    # --- mandatory on auth endpoints; specific numbers are not     ---
    # --- documented anywhere, so these are implementation defaults.---
    rate_limit_register_max: int = 5
    rate_limit_register_window_seconds: int = 3600
    rate_limit_login_max: int = 10
    rate_limit_login_window_seconds: int = 900
    rate_limit_verify_max: int = 10
    rate_limit_verify_window_seconds: int = 3600
    # ADDED — ATLAS-P1-AUTH-07. Refresh is called far more often than
    # login across a session's life (silently, in the background), so
    # its limit is deliberately more generous than login's.
    rate_limit_refresh_max: int = 30
    rate_limit_refresh_window_seconds: int = 3600
    # Logout is low-risk (only clears the caller's own session) but
    # still rate-limited for consistency with GUIDELINES.md §11's
    # blanket "Protect: Authentication endpoints."
    rate_limit_logout_max: int = 30
    rate_limit_logout_window_seconds: int = 3600
    rate_limit_me_max: int = 60
    rate_limit_me_window_seconds: int = 3600
    # ADDED — ATLAS-P1-AUTH-06. Mirrors register's anti-abuse posture —
    # forgot-password also triggers an email send and is a classic
    # account-enumeration target.
    rate_limit_forgot_password_max: int = 5
    rate_limit_forgot_password_window_seconds: int = 3600
    rate_limit_reset_password_max: int = 10
    rate_limit_reset_password_window_seconds: int = 3600

    # --- Email verification (ATLAS-P1-AUTH-04) ---
    email_verification_token_expire_hours: int = 24

    # --- Password reset (ATLAS-P1-AUTH-05 → AUTH-06) ---
    password_reset_token_expire_hours: int = 1

    # --- Refresh token (ATLAS-P1-AUTH-07) ---
    # Deliberately longer-lived than the access token itself (30 min) —
    # it exists specifically so a user isn't forced to re-enter their
    # password every 30 minutes. Stored server-side (Redis) and only
    # ever handed to the browser as an httpOnly cookie, never in a JSON
    # response body — see POST /auth/login in app/api/v1/auth.py.
    refresh_token_expire_days: int = 30

    # --- AI / Conversation Manager (ATLAS-P1-CHAT-03) ---
    # OPENAI_API_KEY was already documented verbatim in .env.example
    # (DEBUG_LOG.md Known Issues) but was never wired into Settings —
    # confirmed empty here before this task. Left as "" by default
    # (not a fake key) so the app still starts cleanly without one;
    # app/core/ai.py raises a clear ProviderNotConfiguredError, mapped
    # to a calm 503, only when the chat endpoint is actually called —
    # see that module's own docstring for the reasoning.
    openai_api_key: str = ""
    # RECONSTRUCTED default — no model name is documented anywhere.
    # gpt-4o-mini chosen as a reasonable, cost-conscious default for a
    # single-model Phase 1 passthrough (WORK_BREAKDOWN_STRUCTURE.md
    # ATLAS-P1-CHAT-03); flagged here rather than silently assumed.
    openai_model: str = "gpt-4o-mini"
    # RECONSTRUCTED default, matching the reasoning already used for
    # every other rate limit above — no specific number is documented
    # anywhere for AI endpoints (GUIDELINES.md §11 only says "Mandatory.
    # Protect: ... AI chat endpoints"). A real conversation can easily
    # run 10+ turns, so this is deliberately more generous than
    # register/login while still bounding cost exposure per caller.
    rate_limit_chat_max: int = 30
    rate_limit_chat_window_seconds: int = 3600
    # Per-request message-count/length ceilings live as Field()
    # constraints on app/schemas/chat.py's ChatCompletionRequest, not
    # here — they're structural request validation (always-on, not a
    # tunable operational knob like the rate limits above), so one
    # source of truth in the schema is more honest than duplicating the
    # same numbers in two places that could silently drift apart.

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_allowed_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    settings = Settings()
    if settings.secret_key == _DEV_DEFAULT_SECRET_KEY and settings.app_env != "development":
        logger.warning(
            "insecure_default_secret_key_in_use",
            app_env=settings.app_env,
            hint="Set SECRET_KEY in the environment before running outside development.",
        )
    return settings
