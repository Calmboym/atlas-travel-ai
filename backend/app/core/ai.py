"""Wires app/core/config.py's Settings into the provider-independent
ai/ layer.

ADDED — ATLAS-P1-CHAT-03. The one place backend/app/ imports from the
sibling ai/ package — implements DEBUG_LOG.md's documented decision
("ai/config.py accepts settings from backend at startup... backend
populates on init") for the first time; nothing in ai/ imports
pydantic-settings or anything else from backend/app/.

Import wiring note: ai/ is a top-level package sibling to backend/, not
nested inside it (same reasoning as above). Running `uv run pytest` or
`uv run uvicorn app.main:app` from inside backend/ does not put the
repository root on sys.path by default, so `import ai...` would fail
without the insertion below. Mirrors the existing precedent in
alembic/env.py. Kept here too (idempotent, guarded) even though
app/main.py now does the same thing first — see that file's own
docstring for why main.py needed its own copy (app/api/v1/chat.py
imports directly from ai.providers.base, above its import of this
file, so this file's own insertion alone ran too late).
"""

import sys
from functools import lru_cache
from pathlib import Path

_REPO_ROOT = Path(__file__).resolve().parents[3]
if str(_REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(_REPO_ROOT))

from ai.config import AIConfig  # noqa: E402
from ai.providers import LLMProvider, OpenAIProvider  # noqa: E402

from app.core.config import get_settings  # noqa: E402


def _build_ai_config() -> AIConfig:
    settings = get_settings()
    return AIConfig(openai_api_key=settings.openai_api_key, openai_model=settings.openai_model)


@lru_cache
def get_llm_provider() -> LLMProvider | None:
    """FastAPI-dependency-compatible factory for the active LLMProvider.

    Cached (one provider instance per process, matching
    get_redis_client()'s @lru_cache convention in app/core/redis.py).

    Returns None rather than raising when unconfigured — deliberately.
    Found empirically (live curl smoke test, not caught by any test in
    tests/test_chat.py using dependency_overrides — those replace this
    function entirely and never hit the real "unconfigured" path):
    FastAPI resolves a route's Depends() dependencies as part of the
    same pass that validates the request body, and an exception raised
    *during* dependency resolution short-circuits that pass before
    FastAPI gets to report a body-validation failure — a malformed
    request (e.g. an empty messages list, which should be a 422) was
    coming back as this dependency's own 503 instead, hiding the real
    problem. Returning None instead lets FastAPI finish validating the
    body first; app/api/v1/chat.py's route handlers — which only run
    once the body has already validated successfully — check for None
    themselves and raise the 503 from there instead.
    """
    config = _build_ai_config()
    if not config.openai_api_key:
        return None
    return OpenAIProvider(api_key=config.openai_api_key, model=config.openai_model)
