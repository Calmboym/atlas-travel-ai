"""Conversation Manager service layer.

ADDED — ATLAS-P1-CHAT-03. Thin bridge between app/schemas/chat.py's
request/response shapes and ai/agents/conversation_manager.py — kept
this way so app/api/v1/chat.py's route handlers stay thin, mirroring
every other feature in this backend (see app/services/auth_service.py's
own docstring for the same rule, applied here for consistency).

Deliberately stateless: no database session, no conversation_id, no
persistence. WORK_BREAKDOWN_STRUCTURE.md's ATLAS-P1-CHAT-03 acceptance
criterion is "a direct passthrough to one model" only. Conversation
persistence for authenticated users is explicitly separate,
independently-scoped work — ATLAS-P1-MEM-02 ("authenticated preference
storage... does NOT implement long-term trip memory") — not folded in
here. This also keeps the endpoint usable by guest users with no
regression in capability, matching /chat's deliberately unguarded
status (INFORMATION_ARCHITECTURE.md; .ai/PROJECT_STATE.md's own note
that "/chat is deliberately NOT guarded — guest-mode AI Chat is locked
product scope").

Provider errors (ai.providers.base's ProviderError hierarchy) are
intentionally NOT re-wrapped here — they are already the correct
abstraction level (provider-independent, not OpenAI-specific) for
app/api/v1/chat.py to catch directly and translate into an HTTP
response, exactly as raised.

EXTENDED — ATLAS-P2-AGENTS-09. `complete_chat`/`stream_chat` now route
through `ai.orchestrator.Orchestrator` (via
`ai.orchestrator.build_agent_registry`) instead of calling
`ai.agents.conversation_manager` directly. Phase 1's passthrough
becomes the Orchestrator's own default path, not a discarded one —
`Orchestrator.dispatch()`/`stream_dispatch()` still call
`conversation_manager.generate_reply`/`stream_reply` whenever no
registered Core Agent's intent matches a message
(`ai/orchestrator/orchestrator.py`'s own docstring, Q4: "extends, does
not rebuild"), so an unrecognized message produces byte-for-byte the
same reply a guest already got before this task — a real,
mechanically-checked guarantee (every pre-existing test in
`tests/test_chat.py` passes unmodified against this file), not merely
a documentation promise. `db`/`user_id` are new, optional keyword-only
parameters: when both are given (an authenticated caller —
`app/api/v1/chat.py` resolves this without ever requiring it), the
registry additionally includes the Traveler Profile and Recommendation
Agents; a guest (either omitted) still gets the other three. See
`ai.orchestrator.agent_wiring.build_agent_registry`'s own docstring for
the full guest/authenticated split.

Status messages during generation (`TRIP_PLANNING_EXPERIENCE.md` §AI
Understanding Phase: "Animated reasoning messages rotate... No fake
percentages... show progress through meaningful actions") are new to
`stream_chat` only — `AI_EXPERIENCE.md` §Streaming is about the
streaming surface specifically, and a single synchronous
`complete_chat` reply has no stream to interleave one into. Sent as a
new, additive `ChatStreamEvent(type="status", ...)` — `chat.py`'s own
docstring covers exactly why this is safe against the existing,
unmodified CHAT-04 frontend consumer.
"""

from collections.abc import AsyncIterator
from dataclasses import dataclass
from typing import Literal
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from ai.orchestrator import Orchestrator, build_agent_registry
from ai.orchestrator.intent import classify_intent
from ai.providers.base import LLMMessage, LLMProvider

from app.schemas.chat import ChatCompletionResponse, ChatMessageIn

# Maps a registered Core Agent's own `name` (ai/agents/*.py's own
# `intents=`/`name=` constructor calls) to the one status line shown
# while it works — phrased in the style of TRIP_PLANNING_EXPERIENCE.md
# §AI Understanding Phase's own rotating-message examples ("Finding
# ideal destinations...", "Estimating budget...", "Building
# itinerary..."), never a fake percentage. An agent whose name is not
# a key here (should never happen — every registered agent has an
# entry) simply gets no status event, falling back to the pre-Phase-2
# experience of no interstitial message at all, not an error.
_STATUS_MESSAGES: dict[str, str] = {
    "traveler-profile-agent": "Checking your saved preferences...",
    "destination-intelligence-agent": "Finding destinations...",
    "budget-agent": "Estimating your budget...",
    "itinerary-planner-agent": "Building your itinerary...",
    "recommendation-agent": "Finding personalized recommendations...",
}


@dataclass(frozen=True)
class ChatStreamEvent:
    """One event `stream_chat` yields. ADDED — ATLAS-P2-AGENTS-09.

    Internal to the backend only — never a `app/schemas/chat.py`
    Pydantic model, since that file is outside this task's own
    Allowed-files-to-modify. `app/api/v1/chat.py` is the one place that
    turns this into the actual SSE wire frame the frontend receives;
    see that module's own docstring for the exact `data: {...}` shapes
    for each `type`.
    """

    type: Literal["status", "chunk"]
    content: str


def _to_llm_messages(messages: list[ChatMessageIn]) -> list[LLMMessage]:
    return [LLMMessage(role=message.role, content=message.content) for message in messages]


async def complete_chat(
    provider: LLMProvider,
    messages: list[ChatMessageIn],
    *,
    db: AsyncSession | None = None,
    user_id: UUID | None = None,
) -> ChatCompletionResponse:
    """Non-streaming turn.

    ADDED — ATLAS-P1-CHAT-03. EXTENDED — ATLAS-P2-AGENTS-09: routed
    through the Orchestrator — see this module's own docstring.
    """
    registry = await build_agent_registry(provider, db=db, user_id=user_id)
    orchestrator = Orchestrator(registry=registry)
    result = await orchestrator.dispatch(provider, _to_llm_messages(messages))
    return ChatCompletionResponse(content=result.content, model=provider.model_name)


async def stream_chat(
    provider: LLMProvider,
    messages: list[ChatMessageIn],
    *,
    db: AsyncSession | None = None,
    user_id: UUID | None = None,
) -> AsyncIterator[ChatStreamEvent]:
    """Streaming turn — yields status and incremental-reply events.

    ADDED — ATLAS-P1-CHAT-04. EXTENDED — ATLAS-P2-AGENTS-09: routed
    through the Orchestrator, and — only when a registered Core Agent's
    intent actually matches this message — yields exactly one leading
    `ChatStreamEvent(type="status", ...)` before any `"chunk"` event.
    `classify_intent` is called directly here (in addition to the
    identical, separate call `Orchestrator.stream_dispatch` makes
    internally) purely to learn *which* agent will handle the request
    before generation starts, so the right status line can be chosen —
    it is a pure, side-effect-free function of `(messages, registry)`
    (`ai/orchestrator/intent.py`'s own docstring), so calling it twice
    against the same, unchanged registry is redundant but never
    incorrect, and does not risk selecting a different agent than the
    one that actually runs.
    """
    llm_messages = _to_llm_messages(messages)
    registry = await build_agent_registry(provider, db=db, user_id=user_id)
    orchestrator = Orchestrator(registry=registry)

    _, decision = classify_intent(llm_messages, registry)
    if decision.selected_agent is not None:
        status_message = _STATUS_MESSAGES.get(decision.selected_agent)
        if status_message is not None:
            yield ChatStreamEvent(type="status", content=status_message)

    async for chunk in orchestrator.stream_dispatch(provider, llm_messages):
        yield ChatStreamEvent(type="chunk", content=chunk)
