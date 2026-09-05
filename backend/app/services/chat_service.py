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
"""

from collections.abc import AsyncIterator

from ai.agents.conversation_manager import generate_reply, stream_reply
from ai.providers.base import LLMMessage, LLMProvider

from app.schemas.chat import ChatCompletionResponse, ChatMessageIn


def _to_llm_messages(messages: list[ChatMessageIn]) -> list[LLMMessage]:
    return [LLMMessage(role=message.role, content=message.content) for message in messages]


async def complete_chat(
    provider: LLMProvider, messages: list[ChatMessageIn]
) -> ChatCompletionResponse:
    """Non-streaming turn. ADDED — ATLAS-P1-CHAT-03."""
    content = await generate_reply(provider, _to_llm_messages(messages))
    return ChatCompletionResponse(content=content, model=provider.model_name)


async def stream_chat(
    provider: LLMProvider, messages: list[ChatMessageIn]
) -> AsyncIterator[str]:
    """Streaming turn — yields incremental text chunks.

    ADDED — ATLAS-P1-CHAT-04.
    """
    async for chunk in stream_reply(provider, _to_llm_messages(messages)):
        yield chunk
