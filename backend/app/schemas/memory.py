"""Pydantic request/response schemas for the basic-tier Memory Service.

ADDED — ATLAS-P1-MEM-02.
"""

import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class MemoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    data: dict[str, Any]
    created_at: datetime
    updated_at: datetime


class MemoryUpdate(BaseModel):
    """PATCH body — shallow-merged into the existing stored entries.

    Unlike TravelerProfileUpdate (app/schemas/profile.py), there is no
    "omitted vs. explicit null" distinction to make here: `data` itself
    is always required and is a full replacement of the *set of keys it
    contains* (each key in the payload overwrites that key's stored
    value; keys not mentioned in the payload are left untouched). To
    clear a single key entirely, use DELETE /memory/me/{key} instead of
    PATCHing that key to `null` — this store has no per-key concept of
    "explicitly set to null" vs. "not present" once persisted, so an
    explicit delete is the only unambiguous way to remove one.
    """

    data: dict[str, Any] = Field(default_factory=dict)
