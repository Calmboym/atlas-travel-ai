"""AI Orchestrator — public exports.

ADDED — ATLAS-P2-AGENTS-01. Implements `ARCHITECTURE.md` §7's "AI
Orchestration Service" and the agent-registry/dispatch scope of
`WORK_BREAKDOWN_STRUCTURE.md`'s `ATLAS-P2-AGENTS-01`.

EXTENDED — ATLAS-P2-AGENTS-09. `build_agent_registry` (see
`ai/orchestrator/agent_wiring.py`) is the wiring into
`backend/app/services/chat_service.py` this docstring previously named
as still pending.
"""

from ai.orchestrator.agent_wiring import build_agent_registry
from ai.orchestrator.orchestrator import Orchestrator
from ai.orchestrator.registry import AgentRegistry, DuplicateAgentError
from ai.orchestrator.types import AgentHandler, DispatchDecision, OrchestratorResult

__all__ = [
    "AgentHandler",
    "AgentRegistry",
    "DispatchDecision",
    "DuplicateAgentError",
    "Orchestrator",
    "OrchestratorResult",
    "build_agent_registry",
]
