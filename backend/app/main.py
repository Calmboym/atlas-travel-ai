"""FastAPI application entrypoint.

ADDED — ATLAS-P1-AUTH-02. First real backend/app/ content — the
repository had none before this task (confirmed empty except
.gitkeep; see .ai/INFRASTRUCTURE_BASELINE.md §8). Deliberately
minimal: mounts only the /api/v1 routers this task group needs. Does
NOT implement /api/v1/health — that is ATLAS-P0-HEALTH, a distinct
task ID (already, inaccurately, marked Done in TASK_BOARD.md's Phase 0
section despite no such code existing) — out of this group's scope,
see this session's handoff notes.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import get_settings

settings = get_settings()

app = FastAPI(title="Atlas API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)
