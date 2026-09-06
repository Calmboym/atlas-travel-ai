"""Basic-tier Memory Service business logic.

ADDED — ATLAS-P1-MEM-02.

Kept separate from the route handlers in app/api/v1/memory.py, mirroring
app/services/profile_service.py's own split (HTTP layer stays thin).
"""

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user_memory import UserMemory
from app.schemas.memory import MemoryUpdate


async def get_or_create_memory(db: AsyncSession, user_id: uuid.UUID) -> UserMemory:
    """Return the user's memory store, creating an empty row on first
    access — same get-or-create rationale as
    profile_service.get_or_create_profile: a brand-new account should
    never see a confusing 404 the first time anything touches this
    endpoint.
    """

    result = await db.execute(select(UserMemory).where(UserMemory.user_id == user_id))
    memory = result.scalar_one_or_none()
    if memory is not None:
        return memory

    memory = UserMemory(user_id=user_id, data={})
    db.add(memory)
    await db.commit()
    await db.refresh(memory)
    return memory


async def update_memory(
    db: AsyncSession, user_id: uuid.UUID, update: MemoryUpdate
) -> UserMemory:
    """Shallow-merge `update.data` into the existing stored entries.

    Builds a brand-new dict and assigns it to `memory.data` (rather than
    mutating the existing dict in place) — required for SQLAlchemy to
    detect the change on a plain JSONB column; see UserMemory's own
    docstring.
    """

    memory = await get_or_create_memory(db, user_id)
    memory.data = {**memory.data, **update.data}
    await db.commit()
    await db.refresh(memory)
    return memory


async def delete_memory_key(db: AsyncSession, user_id: uuid.UUID, key: str) -> UserMemory:
    """Remove a single key. Idempotent — deleting a key that was never
    set (or already removed) is a no-op, not an error, matching
    PROF-02's own "PATCH with nothing to change is a no-op" convention
    (app/tests/test_profile.py's test_patch_empty_body_is_a_no_op).
    """

    memory = await get_or_create_memory(db, user_id)
    if key in memory.data:
        remaining = dict(memory.data)
        del remaining[key]
        memory.data = remaining
        await db.commit()
        await db.refresh(memory)
    return memory
