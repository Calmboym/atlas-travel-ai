"""AI Orchestrator — public exports.

ADDED — ATLAS-P2-AGENTS-01. Implements `ARCHITECTURE.md` §7's "AI
Orchestration Service" and the agent-registry/dispatch scope of
`WORK_BREAKDOWN_STRUCTURE.md`'s `ATLAS-P2-AGENTS-01`. Not yet wired
into `backend/app/services/chat_service.py` — that is `AGENTS-09`.
"""

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
]
