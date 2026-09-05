"""FastAPI application entrypoint.

ADDED — ATLAS-P1-AUTH-02. First real backend/app/ content — the
repository had none before this task (confirmed empty except
.gitkeep; see .ai/INFRASTRUCTURE_BASELINE.md §8). Deliberately
minimal: mounts only the /api/v1 routers this task group needs. Does
NOT implement /api/v1/health — that is ATLAS-P0-HEALTH, a distinct
task ID (already, inaccurately, marked Done in TASK_BOARD.md's Phase 0
section despite no such code existing) — out of this group's scope,
see this session's handoff notes.

EXTENDED — ATLAS-P1-CHAT-03: the sys.path insertion below. Empirically
found via a live server smoke test (not caught by mypy or pytest —
pytest's own `pythonpath` ini option already puts the repo root on
sys.path unconditionally for the whole test session, masking this
exact failure): app/core/ai.py's own sys.path fix runs too late,
because app/api/v1/chat.py imports directly from `ai.providers.base`
(for its exception types) *above* its `from app.core.ai import
get_llm_provider` line, and Python resolves imports top-to-bottom.
Real failure reproduced: `ModuleNotFoundError: No module named 'ai'`
starting uvicorn. Fixing it here, first, guarantees it's set up before
any transitively-imported module (via api_router below) can need it —
app/core/ai.py keeps its own copy too (idempotent, guarded), for any
future entrypoint that imports it directly without going through this
file first.
"""

import sys
from pathlib import Path

_REPO_ROOT = Path(__file__).resolve().parents[2]
if str(_REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(_REPO_ROOT))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import get_settings
from app.core.exception_handlers import register_exception_handlers

settings = get_settings()

app = FastAPI(title="Atlas API", version="0.1.0")

register_exception_handlers(app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)
