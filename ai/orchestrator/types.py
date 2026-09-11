"""Shared types for the AI Orchestrator — ATLAS-P2-AGENTS-01.

ADDED — ATLAS-P2-AGENTS-01.
"""

from __future__ import annotations

from collections.abc import AsyncIterator
from dataclasses import dataclass, field
from typing import Protocol, runtime_checkable

from ai.providers.base import LLMMessage


@runtime_checkable
class AgentHandler(Protocol):
    """The minimum shape the Orchestrator's registry/dispatch logic needs
    to call an agent.

    Deliberately NOT the full 7-field Agent contract ARCHITECTURE.md §8
    requires (Mission / Responsibilities / Allowed tools / Input schema /
    Output schema / Reasoning rules / System prompt) — that base class is
    AGENTS-02's own scope ("the base Agent contract every Core Agent
    below implements"), and AGENTS-01 must not anticipate or invent it
    (WORK_BREAKDOWN_STRUCTURE.md: AGENTS-01's Allowed-files-to-modify is
    `ai/orchestrator/**` only). This Protocol names only what AGENTS-01's
    registry and dispatch logic themselves need: a stable `name`, the
    `intents` it claims to handle, and callables that produce a reply.

    Because `Protocol` is structural (duck-typed), AGENTS-02's real
    `Agent` base class — and every Core Agent AGENTS-04 through 08 build
    on top of it — is expected to satisfy this shape without importing
    from or depending on `ai/orchestrator/` at all. The registry stores
    "empty until AGENTS-04..08 populate it" (WORK_BREAKDOWN_STRUCTURE.md)
    — this task ships the mechanism, not any registration.
    """

    name: str
    intents: tuple[str, ...]

    async def handle(self, messages: list[LLMMessage]) -> str:
        """Return the full reply for this conversation."""
        ...

    def stream_handle(self, messages: list[LLMMessage]) -> AsyncIterator[str]:
        """Yield incremental reply chunks for this conversation."""
        ...


@dataclass(frozen=True)
class DispatchDecision:
    """Records which path the Orchestrator took for one request, and why.

    Exists so AGENTS-01's acceptance criterion — "every dispatch
    decision is logged with its reasoning..., never silent"
    (WORK_BREAKDOWN_STRUCTURE.md) — is a real, inspectable,
    unit-testable value, not something a test would need to parse out
    of a log line. `Orchestrator.dispatch()`/`stream_dispatch()` both
    log this (see orchestrator.py) and return/expose it, so callers —
    and tests — never have to guess why a particular path was taken.
    """

    selected_agent: str | None
    reasoning: str
    matched_intents: tuple[str, ...] = field(default_factory=tuple)

    @property
    def is_passthrough(self) -> bool:
        """True when no registered agent matched and Phase 1's
        `conversation_manager` passthrough was used instead (Q4)."""
        return self.selected_agent is None


@dataclass(frozen=True)
class OrchestratorResult:
    """The Orchestrator's combined, normalized non-streaming output.

    "Output combination" (WORK_BREAKDOWN_STRUCTURE.md, AGENTS-01 scope):
    regardless of whether the reply came from a registered agent or
    from Phase 1's `conversation_manager` passthrough, `dispatch()`
    callers always receive this one shape, with the routing decision
    attached rather than discarded. `AGENTS-09` is the task that makes
    `backend/app/services/chat_service.py` consume this instead of
    calling `conversation_manager` directly.
    """

    content: str
    decision: DispatchDecision
