"""Async SQLAlchemy engine/session setup.

ADDED — ATLAS-P1-AUTH-02. First real database wiring (GUIDELINES.md
§10 PostgreSQL rules: "Use migrations. Never manually modify
production database.").
"""

from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import get_settings

settings = get_settings()

engine = create_async_engine(settings.database_url, pool_pre_ping=True)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency yielding a request-scoped async DB session."""
    async with AsyncSessionLocal() as session:
        yield session
