"""Intent classification — ATLAS-P2-AGENTS-01.

ADDED — ATLAS-P2-AGENTS-01. Decides which registered agent, if any,
should handle a request. Matching is intentionally simple —
case-insensitive substring matching of each registered agent's declared
`intents` against the latest user message — since the registry is empty
for every real request until `AGENTS-04` registers the first Core Agent
(WORK_BREAKDOWN_STRUCTURE.md: "empty until AGENTS-04..08 populate it").
A more sophisticated classifier (embeddings, a dedicated intent model)
is a natural extension point for a later task, not invented
speculatively here — `AGENTS-01` is scoped to standalone,
unit-testable dispatch logic only (`WORK_BREAKDOWN_STRUCTURE.md`
Priority/Complexity/Context for this task; no RAG/embedding dependency
exists yet — that is `AGENTS-03`'s scope).
"""

from __future__ import annotations

from ai.orchestrator.registry import AgentRegistry
from ai.orchestrator.types import AgentHandler, DispatchDecision
from ai.providers.base import LLMMessage


def _latest_user_message(messages: list[LLMMessage]) -> str:
    """The most recent user-authored message content, or "" if none.

    Classification looks only at the latest user turn, not the full
    history — matching `conversation_manager`'s own scope (it sends the
    whole history to the model, but nothing in Phase 1 classifies
    intent from it) and keeping this function's behavior simple and
    predictable to unit test.
    """
    for message in reversed(messages):
        if message.role == "user":
            return message.content
    return ""


def classify_intent(
    messages: list[LLMMessage], registry: AgentRegistry
) -> tuple[AgentHandler | None, DispatchDecision]:
    """Classify a conversation against the registry's agents.

    Returns `(handler, decision)`. `handler` is `None` whenever no
    agent should handle the request — an empty registry, no user
    message to classify, or no agent's `intents` matched — which is
    exactly the fallback-to-passthrough signal
    `Orchestrator.dispatch()`/`stream_dispatch()` use to call
    `conversation_manager` directly (Q4,
    `WORK_BREAKDOWN_STRUCTURE.md`). `decision` is always populated with
    a human-readable `reasoning` string, satisfying "every dispatch
    decision is logged with its reasoning..., never silent" even on the
    passthrough path.
    """
    if not registry.agents:
        return None, DispatchDecision(
            selected_agent=None,
            reasoning="Agent registry is empty; falling back to passthrough.",
        )

    query = _latest_user_message(messages)
    if not query.strip():
        return None, DispatchDecision(
            selected_agent=None,
            reasoning="No user message found to classify; falling back to passthrough.",
        )

    lowered_query = query.lower()
    for handler in registry.agents:
        matched = tuple(
            intent for intent in handler.intents if intent.lower() in lowered_query
        )
        if matched:
            return handler, DispatchDecision(
                selected_agent=handler.name,
                reasoning=(
                    f"Matched intent keyword(s) {list(matched)!r} for "
                    f"agent '{handler.name}'."
                ),
                matched_intents=matched,
            )

    return None, DispatchDecision(
        selected_agent=None,
        reasoning=(
            "No registered agent's intents matched the request; "
            "falling back to passthrough."
        ),
    )
