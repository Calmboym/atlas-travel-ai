"""AI Orchestrator core — ATLAS-P2-AGENTS-01.

ADDED — ATLAS-P2-AGENTS-01. Implements the "AI Orchestration Service"
named in `ARCHITECTURE.md` §7 ("Receive user requests / Understand
intent / Select agents / Manage workflow / Combine outputs") and the
"Central orchestration" requirement in `MASTER_BUILD_PROMPT.md` §7.

Scope, per `WORK_BREAKDOWN_STRUCTURE.md` ATLAS-P2-AGENTS-01: intent
understanding, an agent registry (empty until `AGENTS-04..08` populate
it), dispatch logic, output combination. Standalone and unit-testable —
**not yet wired into `chat_service.py`/`chat.py`**; that is `AGENTS-09`.
When no specialized agent applies (true for every request today, since
the registry starts empty), the Orchestrator falls back to calling
`conversation_manager.generate_reply`/`stream_reply` directly — Phase
1's existing module becomes the Orchestrator's own default path, not a
discarded predecessor (Q4, "extends, does not rebuild").
"""

from __future__ import annotations

from collections.abc import AsyncIterator

import structlog

from ai.agents import conversation_manager
from ai.orchestrator.intent import classify_intent
from ai.orchestrator.registry import AgentRegistry
from ai.orchestrator.types import DispatchDecision, OrchestratorResult
from ai.providers.base import LLMMessage, LLMProvider

logger = structlog.get_logger(__name__)


class Orchestrator:
    """Routes a conversation to a registered agent, or falls back to
    Phase 1's single-model passthrough.

    Agents call the model however they need to once they exist
    (`AGENTS-02` onward); the Orchestrator's own passthrough path never
    bypasses `LLMProvider` — it always goes through
    `conversation_manager`, which calls `provider.complete`/
    `provider.stream_complete`, exactly as Phase 1 users already get
    (`WORK_BREAKDOWN_STRUCTURE.md` acceptance: "an unrecognized/
    ambiguous request produces the same passthrough behavior Phase 1
    users already get, not a regression").
    """

    def __init__(self, registry: AgentRegistry | None = None) -> None:
        self._registry = registry if registry is not None else AgentRegistry()

    @property
    def registry(self) -> AgentRegistry:
        """The agent registry this Orchestrator dispatches against."""
        return self._registry

    @staticmethod
    def _log_decision(decision: DispatchDecision) -> None:
        """Log every dispatch decision with its reasoning — never
        silent (`WORK_BREAKDOWN_STRUCTURE.md`, AGENTS-01 acceptance).

        Uses `structlog`, matching the event-name-plus-keyword-fields
        convention already established at the API boundary
        (`app/api/v1/chat.py`'s `logger.error("chat_provider_not_
        configured")`) rather than introducing a differently-styled
        logging call inside `ai/`.
        """
        logger.info(
            "orchestrator_dispatch_decision",
            selected_agent=decision.selected_agent,
            is_passthrough=decision.is_passthrough,
            reasoning=decision.reasoning,
            matched_intents=decision.matched_intents,
        )

    async def dispatch(
        self, provider: LLMProvider, messages: list[LLMMessage]
    ) -> OrchestratorResult:
        """Return the full assistant reply, routed through a matching
        agent if one exists, otherwise Phase 1's passthrough.

        The routing decision is always logged (`_log_decision`) and
        always returned attached to the result — "output combination"
        means every caller receives this one normalized shape
        regardless of which path actually produced the content.
        """
        handler, decision = classify_intent(messages, self._registry)
        self._log_decision(decision)

        if handler is not None:
            content = await handler.handle(messages)
        else:
            content = await conversation_manager.generate_reply(provider, messages)

        return OrchestratorResult(content=content, decision=decision)

    async def stream_dispatch(
        self, provider: LLMProvider, messages: list[LLMMessage]
    ) -> AsyncIterator[str]:
        """Yield incremental reply chunks, routed the same way as
        `dispatch()`.

        The `DispatchDecision` is still logged (never silent) before
        the first chunk is yielded. It is not itself yielded as a
        chunk, and is deliberately not exposed as mutable state on
        `self` either — an `Orchestrator` instance may be shared across
        concurrent requests (mirroring `app/core/ai.py`'s `@lru_cache`
        singleton `LLMProvider`), so a `self.last_decision`-style
        attribute would let one request's decision leak into another's.
        A caller that needs the decision synchronously should call
        `classify_intent` directly, or use `dispatch()` instead. This
        matches `conversation_manager.stream_reply`'s existing
        chunks-only contract that `chat_service.py` already consumes,
        which `AGENTS-09` must not break
        (`WORK_BREAKDOWN_STRUCTURE.md`: "the existing CHAT-04 SSE
        frontend consumer requires no changes").
        """
        handler, decision = classify_intent(messages, self._registry)
        self._log_decision(decision)

        if handler is not None:
            async for chunk in handler.stream_handle(messages):
                yield chunk
        else:
            async for chunk in conversation_manager.stream_reply(provider, messages):
                yield chunk
