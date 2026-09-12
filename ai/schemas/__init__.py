"""Structured-output Pydantic schemas for Core Agents.

ADDED — ATLAS-P2-AGENTS-02. First real content under `ai/schemas/`
(previously `.gitkeep` only, per `GUIDELINES.md` §7's directory
structure). `AgentOutputBase`/`ConfidenceLevel` are the shared contract
every Core Agent's own `output_schema` (each in its own file, e.g. a
future `ai/schemas/traveler_profile.py` — `AGENTS-04`) is expected to
build on.
"""

from ai.schemas.base import AgentOutputBase, ConfidenceLevel

__all__ = ["AgentOutputBase", "ConfidenceLevel"]
