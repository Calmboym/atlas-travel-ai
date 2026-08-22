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

    # --- Email verification (ATLAS-P1-AUTH-04) ---
    email_verification_token_expire_hours: int = 24

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
