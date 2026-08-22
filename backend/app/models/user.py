"""User ORM model.

ADDED — ATLAS-P1-AUTH-02. Scoped to email/password auth only
(email, hashed_password, is_active, is_verified). No OAuth linkage
columns are added here — ATLAS-P1-AUTH-03's OAuth handshake is
explicitly stubbed in this task group (no provider credentials exist
anywhere in this repository), so no real OAuth-created user rows will
ever exist yet; adding unused nullable columns now would be inventing
schema ahead of a real need. A future OAuth-completion task adds them
via its own migration when it actually needs them.
"""

import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, server_default="true")
    is_verified: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="false")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
