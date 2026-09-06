"""UserMemory ORM model.

ADDED — ATLAS-P1-MEM-02.

One-to-one extension of User (same shape as TravelerProfile —
app/models/traveler_profile.py — a separate table rather than new
columns on `users`), but deliberately NOT the same table as
TravelerProfile: TravelerProfile already fully covers every *structured*
preference field named anywhere in 17_AI_EXPERIENCE.md §Memory or
PRD.md §7.13 (travel style, budget, accommodation, transportation, food,
languages) — see that model's own docstring for the verbatim source of
each. Duplicating those fields here would violate MASTER_RULES.md §19's
prohibition on duplicate business logic.

What's left, and what this table actually models, is the generic,
schema-less remainder ARCHITECTURE.md §7 calls out as its own backend
module — "Memory Service" ("Short-term memory, Long-term preferences,
...User-controlled memory") — distinct from "User Profile Service".
Concretely, this is the Phase-1 "basic tier" slice of that module:
freeform key/value AI-memory entries a user can set and later edit or
delete (USER_FLOWS.md Flow 19 — MEMORY: "User Says: 'I prefer trains.'
-> AI stores preference. -> ... -> User can edit or delete memory.").

Deliberately NOT modeled here (both explicitly out of MEM-02's own
acceptance criteria, per WORK_BREAKDOWN_STRUCTURE.md):
- Conversation context / recent itineraries — Phase 4's Long-term
  Memory Service ("does NOT implement long-term trip memory").
- Favorite destinations — PRD.md §7.13 also lists this under "Travel
  Profile System", but there is no destination entity to reference yet
  anywhere in this codebase; already tracked as its own
  "TBD — Phase 2+" row in COMPONENT_OWNERSHIP_MATRIX.md §4, not
  duplicated or pre-built here.

No AI agent reads or writes this table yet in Phase 1 (there is no
Traveler Profile Agent / Memory Agent until Phase 2's Agent System) —
this table exists as the storage surface those future agents will use,
per this module's own docstring intent; CHAT-03/04's single-model
passthrough chat does not consult it.

A single JSONB column (rather than one row per key, or a fixed set of
named columns) is used because no specific field list is documented
anywhere for this "basic tier" beyond "preferences" in general — a
generic store avoids inventing a field taxonomy that isn't specified,
and lets Phase 2+ agents write new keys without a schema migration for
each one.
"""

import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class UserMemory(Base):
    __tablename__ = "user_memory"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True, nullable=False
    )

    # Freeform key/value store. Always *replaced* with a new dict object
    # at the service layer (app/services/memory_service.py), never
    # mutated in place (`memory.data["k"] = v`) — a plain JSONB column
    # (no sqlalchemy.ext.mutable.MutableDict wrapper) only detects
    # whole-attribute assignment, not in-place dict mutation. See that
    # service's own docstring.
    data: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False, default=dict)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
