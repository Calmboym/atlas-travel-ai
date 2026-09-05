"""Conversation Manager — Phase 1, single-model, non-orchestrated.

ADDED — ATLAS-P1-CHAT-03. Implements the "Conversation Manager Agent"
named in ARCHITECTURE.md §8's Platform Agents list, scoped exactly to
WORK_BREAKDOWN_STRUCTURE.md's ATLAS-P1-CHAT-03 acceptance criterion:
"does NOT implement agent routing — that's Phase 2 (AGENTS module);
this is a direct passthrough to one model." No tool calling, no agent
selection, no RAG, no memory read/write (MEM-01/02 are separate,
independently-scoped tasks — see backend/app/services/chat_service.py's
own module docstring for why this stays stateless).

EXTENDED — ATLAS-P1-CHAT-04: stream_reply().
"""

from collections.abc import AsyncIterator

from ai.prompts.atlas_conversation_prompt import ATLAS_SYSTEM_PROMPT
from ai.providers.base import LLMMessage, LLMProvider


def _with_system_prompt(messages: list[LLMMessage]) -> list[LLMMessage]:
    """Prepend Atlas's system prompt.

    The caller (chat_service.py) never accepts a "system"-role message
    from a client request — see app/schemas/chat.py's ChatMessageIn,
    whose `role` type is Literal["user", "assistant"] only. This
    function is the one and only place a system message enters the
    conversation, which is itself the main defense GUIDELINES.md §11
    "Prompt Injection Protection" calls for against "Attempts to
    override AI rules": a client-supplied message literally cannot
    claim the system role over the wire.
    """
    return [LLMMessage(role="system", content=ATLAS_SYSTEM_PROMPT), *messages]


async def generate_reply(provider: LLMProvider, messages: list[LLMMessage]) -> str:
    """Direct passthrough to one model. Returns the full reply text."""
    return await provider.complete(_with_system_prompt(messages))


async def stream_reply(
    provider: LLMProvider, messages: list[LLMMessage]
) -> AsyncIterator[str]:
    """Direct passthrough to one model, yielding incremental text chunks.

    ADDED — ATLAS-P1-CHAT-04.
    """
    async for chunk in provider.stream_complete(_with_system_prompt(messages)):
        yield chunk
