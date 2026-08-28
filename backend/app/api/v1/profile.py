"""User Profile Service endpoints: fetch and update the authenticated
user's traveler profile.

ADDED — ATLAS-P1-PROF-02.

No dedicated rate limiter is attached: MASTER_RULES.md §10 and
GUIDELINES.md §11 both scope mandatory rate limiting to "authentication,
AI, and expensive endpoints" — these two endpoints are none of the
three (they require an already-authenticated session, unlike
login/register, which is what makes those two attractive pre-auth
abuse targets in the first place). Not omitted by oversight; flagged
here per this task's own scope boundary rather than silently added or
silently skipped.

Kept thin — all business logic lives in app/services/profile_service.py,
mirroring app/api/v1/auth.py's own split.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.profile import TravelerProfileResponse, TravelerProfileUpdate
from app.services.profile_service import get_or_create_profile, update_profile

router = APIRouter(prefix="/profile", tags=["profile"])


@router.get("/me", response_model=TravelerProfileResponse)
async def read_my_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> TravelerProfileResponse:
    """Return the current user's traveler profile, creating an empty one
    on first access (see get_or_create_profile's own docstring)."""

    profile = await get_or_create_profile(db, current_user.id)
    return TravelerProfileResponse.model_validate(profile)


@router.patch("/me", response_model=TravelerProfileResponse)
async def update_my_profile(
    payload: TravelerProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> TravelerProfileResponse:
    """Partially update the current user's traveler profile.

    Omitted fields are left unchanged; a field explicitly sent as
    `null` clears it. See TravelerProfileUpdate's own docstring.
    """

    profile = await update_profile(db, current_user.id, payload)
    return TravelerProfileResponse.model_validate(profile)
