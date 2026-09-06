"""Basic-tier Memory Service endpoints: read, merge-update, and delete a
single key from the authenticated user's AI memory store.

ADDED — ATLAS-P1-MEM-02.

No dedicated rate limiter is attached — same rationale as
app/api/v1/profile.py's own docstring: MASTER_RULES.md §10 and
GUIDELINES.md §11 scope mandatory rate limiting to "authentication, AI,
and expensive endpoints"; these three all require an already-
authenticated session and are none of the three.

Kept thin — all business logic lives in
app/services/memory_service.py, mirroring app/api/v1/profile.py's own
split.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.memory import MemoryResponse, MemoryUpdate
from app.services.memory_service import (
    delete_memory_key,
    get_or_create_memory,
    update_memory,
)

router = APIRouter(prefix="/memory", tags=["memory"])


@router.get("/me", response_model=MemoryResponse)
async def read_my_memory(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> MemoryResponse:
    """Return the current user's stored memory entries, creating an
    empty store on first access (see get_or_create_memory's own
    docstring)."""

    memory = await get_or_create_memory(db, current_user.id)
    return MemoryResponse.model_validate(memory)


@router.patch("/me", response_model=MemoryResponse)
async def update_my_memory(
    payload: MemoryUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> MemoryResponse:
    """Shallow-merge new entries into the current user's memory store.
    See MemoryUpdate's own docstring for exactly what "merge" means
    here."""

    memory = await update_memory(db, current_user.id, payload)
    return MemoryResponse.model_validate(memory)


@router.delete("/me/{key}", response_model=MemoryResponse)
async def delete_my_memory_key(
    key: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> MemoryResponse:
    """Remove a single stored key. Idempotent — see
    delete_memory_key's own docstring."""

    memory = await delete_memory_key(db, current_user.id, key)
    return MemoryResponse.model_validate(memory)
