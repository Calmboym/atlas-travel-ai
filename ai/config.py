"""Framework-independent AI configuration.

ADDED — ATLAS-P1-CHAT-03. Implements DEBUG_LOG.md's own documented,
previously-unbuilt Architecture Decision: "ai/config.py accepts
settings from backend at startup | Decouples AI config from
pydantic-settings; backend populates on init." A plain dataclass, not
a pydantic-settings BaseSettings — `ai/` must stay importable and
testable without backend/app/'s dependencies (see
ai/providers/base.py's module docstring). backend/app/core/ai.py is
the one place that reads environment-derived Settings and builds this.
"""

from dataclasses import dataclass


@dataclass(frozen=True)
class AIConfig:
    openai_api_key: str
    openai_model: str
