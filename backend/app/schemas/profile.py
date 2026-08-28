"""Pydantic request/response schemas for the User Profile Service.

ADDED — ATLAS-P1-PROF-02.
"""

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.models.traveler_profile import (
    AccommodationPreference,
    BudgetLevel,
    FoodPreference,
    TransportationPreference,
    TravelPreference,
)

_ALLOWED_FOOD_PREFERENCES = {member.value for member in FoodPreference}


def _validate_food_preferences(value: list[str] | None) -> list[str] | None:
    """Shared by TravelerProfileResponse and TravelerProfileUpdate.

    food_preferences is stored as a plain Postgres text array (see
    TravelerProfile's own docstring for why), so nothing at the
    database layer rejects an invalid entry — this is where that
    happens instead, consistent with this project's "reject at the
    boundary" posture (see app/models/user.py's docstring on the same
    principle applied to `role`).
    """

    if value is None:
        return value
    invalid = [item for item in value if item not in _ALLOWED_FOOD_PREFERENCES]
    if invalid:
        allowed = ", ".join(sorted(_ALLOWED_FOOD_PREFERENCES))
        raise ValueError(f"Invalid food preference(s): {', '.join(invalid)}. Allowed: {allowed}.")
    # De-duplicate while preserving first-seen order — a caller
    # resubmitting the same list twice (e.g. a slightly stale client
    # state) shouldn't produce stored duplicates.
    seen: set[str] = set()
    deduped: list[str] = []
    for item in value:
        if item not in seen:
            seen.add(item)
            deduped.append(item)
    return deduped


class TravelerProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    full_name: str | None
    phone: str | None
    country: str | None
    timezone: str | None
    avatar_url: str | None
    travel_preference: TravelPreference | None
    budget_level: BudgetLevel | None
    accommodation_preference: AccommodationPreference | None
    transportation_preference: TransportationPreference | None
    food_preferences: list[str] | None
    preferred_ui_language: str | None
    preferred_travel_language: str | None
    created_at: datetime
    updated_at: datetime


class TravelerProfileUpdate(BaseModel):
    """PATCH body — every field optional and independently nullable.

    A field simply omitted from the request body leaves the stored
    value unchanged (partial update); a field explicitly sent as
    `null` clears it. Distinguishing the two requires
    `model_fields_set` at the service layer (see
    app/services/profile_service.py) rather than a plain
    `.model_dump()`, since Pydantic can't otherwise tell "omitted" from
    "sent as null" once both collapse to the same Python `None`.
    """

    full_name: str | None = Field(default=None, max_length=255)
    phone: str | None = Field(default=None, max_length=32)
    country: str | None = Field(default=None, max_length=120)
    timezone: str | None = Field(default=None, max_length=64)
    avatar_url: str | None = Field(default=None, max_length=2048)
    travel_preference: TravelPreference | None = None
    budget_level: BudgetLevel | None = None
    accommodation_preference: AccommodationPreference | None = None
    transportation_preference: TransportationPreference | None = None
    food_preferences: list[str] | None = None
    preferred_ui_language: str | None = Field(default=None, max_length=8)
    preferred_travel_language: str | None = Field(default=None, max_length=8)

    @field_validator("food_preferences")
    @classmethod
    def validate_food_preferences(cls, value: list[str] | None) -> list[str] | None:
        return _validate_food_preferences(value)

    @field_validator("full_name", "phone", "country", "timezone", "preferred_ui_language", "preferred_travel_language")
    @classmethod
    def strip_whitespace(cls, value: str | None) -> str | None:
        if value is None:
            return value
        stripped = value.strip()
        return stripped or None
