"""Password reset token model.

ADDED — ATLAS-P1-AUTH-06. Structurally identical to
EmailVerificationToken (AUTH-04) — same hash-only-storage rationale
applies unchanged: only a SHA-256 hash is ever persisted, never the
raw token, so a database leak alone can't be used to reset arbitrary
accounts. Kept as its own table/model rather than reusing
EmailVerificationToken's — the two serve different security contexts
(email ownership proof vs. credential-reset authorization) with
different expiry policies (24h vs. 1h, see Settings), and conflating
them would make a future change to one's semantics silently affect
the other.
"""

import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    token_hash: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    used_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
