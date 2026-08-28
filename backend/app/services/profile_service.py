"""User Profile Service business logic.

ADDED — ATLAS-P1-PROF-02.

Kept separate from the route handlers in app/api/v1/profile.py, mirroring
app/services/auth_service.py's own split (HTTP layer stays thin).
"""

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.traveler_profile import TravelerProfile
from app.schemas.profile import TravelerProfileUpdate


async def get_or_create_profile(db: AsyncSession, user_id: uuid.UUID) -> TravelerProfile:
    """Return the user's profile, creating an empty row on first access.

    Every authenticated user has exactly one TravelerProfile row from
    the moment they first touch a profile endpoint — not from the
    moment they register. This avoids a confusing "404 profile not
    found" on a brand-new account (nothing in PRD.md or
    ONBOARDING_EXPERIENCE.md documents a 404-then-create UX; progressive
    collection implies a profile that starts empty and fills in over
    time, not one that doesn't exist yet), and gives PROF-01's wizard
    and PROF-03's page shell the same simple "GET always returns a
    profile" contract to build against.
    """

    result = await db.execute(select(TravelerProfile).where(TravelerProfile.user_id == user_id))
    profile = result.scalar_one_or_none()
    if profile is not None:
        return profile

    profile = TravelerProfile(user_id=user_id)
    db.add(profile)
    await db.commit()
    await db.refresh(profile)
    return profile


async def update_profile(
    db: AsyncSession, user_id: uuid.UUID, update: TravelerProfileUpdate
) -> TravelerProfile:
    """Apply a partial update, leaving omitted fields untouched.

    Uses `model_fields_set` (the set of field names the caller actually
    included in the request body) rather than `.model_dump()` — a
    plain dump can't distinguish "the client omitted this field" from
    "the client explicitly sent null to clear it," since both collapse
    to Python `None`. PROF-02's own acceptance criterion of supporting
    incremental, progressive edits over multiple visits depends on that
    distinction holding.
    """

    profile = await get_or_create_profile(db, user_id)

    update_data = update.model_dump(include=update.model_fields_set)
    for field_name, value in update_data.items():
        setattr(profile, field_name, value)

    await db.commit()
    await db.refresh(profile)
    return profile
