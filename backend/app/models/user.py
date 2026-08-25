"""User ORM model.

ADDED — ATLAS-P1-AUTH-02. Scoped to email/password auth only
(email, hashed_password, is_active, is_verified). No OAuth linkage
columns are added here — ATLAS-P1-AUTH-03's OAuth handshake is
explicitly stubbed in this task group (no provider credentials exist
anywhere in this repository), so no real OAuth-created user rows will
ever exist yet; adding unused nullable columns now would be inventing
schema ahead of a real need. A future OAuth-completion task adds them
via its own migration when it actually needs them.

EXTENDED — ATLAS-P1-AUTH-08: added `role`. The three values are
ARCHITECTURE.md §12's own list verbatim ("Roles: User, Admin,
System") — this task doesn't invent a role taxonomy, it implements
the one already specified. A native Postgres enum (not a plain
String column) so the database itself rejects an invalid value,
consistent with this project's "reject at the boundary, don't just
hope application code always checks" posture elsewhere (e.g. Pydantic
schemas' own field validators).
"""

import enum
import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, String, func
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class UserRole(str, enum.Enum):
    """ARCHITECTURE.md §12 §Authorization: "Role-based access control.
    Roles: User, Admin, System." Values are lowercase to match this
    project's existing enum-like string conventions elsewhere (e.g.
    PasswordResetToken has none yet, but compare Settings.app_env's
    "development"/"production" lowercase convention).
    """

    USER = "user"
    ADMIN = "admin"
    SYSTEM = "system"


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, server_default="true")
    is_verified: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="false")
    role: Mapped[UserRole] = mapped_column(
        SQLEnum(
            UserRole,
            name="user_role",
            native_enum=True,
            # Without this, SQLAlchemy's default behavior stores each
            # Python enum member's .name ("USER") as the Postgres enum
            # label, not its .value ("user") — which would silently
            # conflict with server_default=UserRole.USER.value below
            # (a lowercase string that wouldn't even be a valid label
            # of the resulting DB enum type). Caught by actually
            # running the generated migration, not assumed — see this
            # task's handoff notes.
            values_callable=lambda enum_cls: [member.value for member in enum_cls],
        ),
        nullable=False,
        default=UserRole.USER,
        server_default=UserRole.USER.value,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
