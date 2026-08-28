"""TravelerProfile ORM model.

ADDED — ATLAS-P1-PROF-02. One-to-one extension of User, modeled as a
separate table (not new columns on `users`) so profile data — optional,
edited far more often than auth fields, and growing over time via
progressive collection — stays decoupled from the authentication-critical
`users` table. This mirrors ARCHITECTURE.md §7's own module split:
"Authentication Service" and "User Profile Service" are two distinct
backend modules, not one.

Every enumerated field below is taken verbatim from a documented,
closed option list — nothing invented:
- full_name, phone, country, timezone:
  APPLICATION_LAYOUT_GUIDE.md §Profile Sections §Personal Information.
- travel_preference: §Travel Preferences list verbatim
  (Solo / Family / Couple / Business / Adventure / Luxury / Budget).
- budget_level: §Budget list verbatim
  (Economy / Mid-range / Premium / Luxury).
- accommodation_preference: §Accommodation list verbatim
  (Hotel / Apartment / Hostel / Resort).
- transportation_preference: §Transportation list verbatim
  (Flight / Train / Car / Walking).
- food_preferences: §Food Preferences list verbatim
  (Vegetarian / Vegan / Halal / Kosher / Allergies) — multi-select
  (a traveler can be both Vegetarian and list Allergies), stored as a
  Postgres text array rather than a single enum column.
- preferred_ui_language / preferred_travel_language: §Languages.
- avatar_url: COMPONENT_OWNERSHIP_MATRIX.md's own citation of PROF-03
  as FileUpload/ImageUpload's first consumer, "(avatar)". Accepts a
  URL string; no binary-upload/object-storage endpoint exists in this
  repository (no provider is documented anywhere in ARCHITECTURE.md
  §11's External Provider list) — see PROF-03's own handoff notes for
  the same stubbing rationale ATLAS-P1-AUTH-04 used for email delivery.

Deliberately NOT modeled here, despite also appearing under
APPLICATION_LAYOUT_GUIDE.md §Profile Sections: Saved Destinations
(tracked as its own "TBD — Phase 2+" row in
COMPONENT_OWNERSHIP_MATRIX.md §4), and Privacy / Danger Zone (account
deletion and session-wipe are account-management territory overlapping
AUTH's domain, not Profile CRUD). None of PROF-01/02/03's declared WBS
scope mentions any of the three — out of scope for this task group,
not silently dropped.

All fields are nullable: progressive collection (ONBOARDING_EXPERIENCE.md
§Progressive Profile Collection) means a profile is valid and useful long
before every field is filled in, and "every field editable later"
(ATLAS-P1-PROF-01's own acceptance criterion) presumes partial states are
normal, not exceptional.
"""

import enum
import uuid
from datetime import datetime

from sqlalchemy import ARRAY, DateTime, ForeignKey, String, func
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class TravelPreference(str, enum.Enum):
    """APPLICATION_LAYOUT_GUIDE.md §Profile Sections §Travel Preferences,
    values verbatim."""

    SOLO = "solo"
    FAMILY = "family"
    COUPLE = "couple"
    BUSINESS = "business"
    ADVENTURE = "adventure"
    LUXURY = "luxury"
    BUDGET = "budget"


class BudgetLevel(str, enum.Enum):
    """APPLICATION_LAYOUT_GUIDE.md §Profile Sections §Budget, values
    verbatim."""

    ECONOMY = "economy"
    MID_RANGE = "mid_range"
    PREMIUM = "premium"
    LUXURY = "luxury"


class AccommodationPreference(str, enum.Enum):
    """APPLICATION_LAYOUT_GUIDE.md §Profile Sections §Accommodation,
    values verbatim."""

    HOTEL = "hotel"
    APARTMENT = "apartment"
    HOSTEL = "hostel"
    RESORT = "resort"


class TransportationPreference(str, enum.Enum):
    """APPLICATION_LAYOUT_GUIDE.md §Profile Sections §Transportation,
    values verbatim."""

    FLIGHT = "flight"
    TRAIN = "train"
    CAR = "car"
    WALKING = "walking"


class FoodPreference(str, enum.Enum):
    """APPLICATION_LAYOUT_GUIDE.md §Profile Sections §Food Preferences,
    values verbatim. Multi-select — see food_preferences column below."""

    VEGETARIAN = "vegetarian"
    VEGAN = "vegan"
    HALAL = "halal"
    KOSHER = "kosher"
    ALLERGIES = "allergies"


class TravelerProfile(Base):
    __tablename__ = "traveler_profiles"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True, nullable=False
    )

    # Personal Information
    full_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(32), nullable=True)
    country: Mapped[str | None] = mapped_column(String(120), nullable=True)
    timezone: Mapped[str | None] = mapped_column(String(64), nullable=True)

    # Avatar — see module docstring: URL only, no upload endpoint exists.
    avatar_url: Mapped[str | None] = mapped_column(String(2048), nullable=True)

    # Preferences
    travel_preference: Mapped[TravelPreference | None] = mapped_column(
        SQLEnum(
            TravelPreference,
            name="travel_preference",
            native_enum=True,
            # Same rationale as User.role (app/models/user.py): store
            # .value ("solo"), not .name ("SOLO"), as the Postgres enum
            # label.
            values_callable=lambda enum_cls: [member.value for member in enum_cls],
        ),
        nullable=True,
    )
    budget_level: Mapped[BudgetLevel | None] = mapped_column(
        SQLEnum(
            BudgetLevel,
            name="budget_level",
            native_enum=True,
            values_callable=lambda enum_cls: [member.value for member in enum_cls],
        ),
        nullable=True,
    )
    accommodation_preference: Mapped[AccommodationPreference | None] = mapped_column(
        SQLEnum(
            AccommodationPreference,
            name="accommodation_preference",
            native_enum=True,
            values_callable=lambda enum_cls: [member.value for member in enum_cls],
        ),
        nullable=True,
    )
    transportation_preference: Mapped[TransportationPreference | None] = mapped_column(
        SQLEnum(
            TransportationPreference,
            name="transportation_preference",
            native_enum=True,
            values_callable=lambda enum_cls: [member.value for member in enum_cls],
        ),
        nullable=True,
    )
    # Multi-select — Postgres text array, validated against
    # FoodPreference's values at the Pydantic schema boundary
    # (app/schemas/profile.py) rather than as a DB-level array-of-enum,
    # which SQLAlchemy/Postgres support far less cleanly.
    food_preferences: Mapped[list[str] | None] = mapped_column(ARRAY(String(32)), nullable=True)

    preferred_ui_language: Mapped[str | None] = mapped_column(String(8), nullable=True)
    preferred_travel_language: Mapped[str | None] = mapped_column(String(8), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
