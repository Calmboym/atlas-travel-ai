"""Shared pytest fixtures for the backend test suite.

ADDED — ATLAS-P1-AUTH-02. First real backend test suite — backend/app/
had no application code, and no tests, before this task.

Runs against a real local PostgreSQL 16 + Redis 7 (matching
docker-compose.yml's own pinned versions) rather than mocks. No Docker
daemon is available in this sandbox, but Postgres/Redis install
directly via apt for genuine, non-asserted verification — see this
session's handoff notes. CI (.github/workflows/ci.yml) still marks the
backend test job `continue-on-error: true` since GitHub Actions itself
has no live Postgres/Redis/Qdrant (a pre-existing, documented
constraint, unchanged by this task).
"""

import hashlib
import os
from collections.abc import AsyncGenerator

os.environ.setdefault(
    "DATABASE_URL", "postgresql+asyncpg://atlas:atlas_dev_password@localhost:5432/atlas"
)
os.environ.setdefault("REDIS_URL", "redis://localhost:6379")
os.environ.setdefault("SECRET_KEY", "test-secret-key-for-pytest-only-not-for-production-use")
os.environ.setdefault("APP_ENV", "development")

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.redis import get_redis_client
from app.db.session import AsyncSessionLocal, engine
from app.main import app


def hash_raw_token(raw_token: str) -> str:
    """Test helper mirroring app.services.auth_service._hash_token."""
    return hashlib.sha256(raw_token.encode("utf-8")).hexdigest()


@pytest.fixture(autouse=True)
async def _clean_database_and_redis() -> AsyncGenerator[None, None]:
    """Truncate auth tables and flush Redis before every test.

    Keeps tests independent of execution order and prevents one test's
    rate-limit counters (or leftover rows) from affecting the next.
    """
    async with engine.begin() as connection:
        await connection.execute(
            text("TRUNCATE TABLE email_verification_tokens, users RESTART IDENTITY CASCADE")
        )
    redis_client = get_redis_client()
    await redis_client.flushdb()
    yield


@pytest.fixture
async def client() -> AsyncGenerator[AsyncClient, None]:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as async_client:
        yield async_client


@pytest.fixture
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session
