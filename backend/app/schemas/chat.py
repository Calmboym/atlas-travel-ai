"""Request/response schemas for the Conversation Manager endpoints.

ADDED — ATLAS-P1-CHAT-03. Field names are plain snake_case (matching
every other schema in this package — e.g. app/schemas/auth.py's
access_token/expires_in — no camelCase alias generator is used
anywhere in this project; the frontend API client mirrors these names
by hand, per frontend/lib/api/auth.ts's own documented convention).

Deliberately slimmer than frontend/lib/chat/types.ts's ChatMessage —
this schema carries only what the model needs (role, content). id,
status, and createdAt are UI-owned concerns the frontend already
generates itself (frontend/lib/chat/use-chat-session.ts) and are not
part of the wire contract in either direction.
"""

from typing import Literal

from pydantic import BaseModel, Field, field_validator

# A client-supplied message may only ever be "user" or "assistant" —
# "system" is never accepted from a request body. This is the primary
# defense against GUIDELINES.md §11's "Attempts to override AI rules":
# a client literally cannot inject a fake system message over the
# wire. Atlas's own system prompt is prepended server-side only — see
# ai/agents/conversation_manager.py.
ChatRole = Literal["user", "assistant"]


class ChatMessageIn(BaseModel):
    role: ChatRole
    content: str = Field(min_length=1, max_length=4000)


class ChatCompletionRequest(BaseModel):
    """Full conversation history, oldest first, ending with the new
    user turn.

    Stateless by design — no conversation_id, no persistence. The
    frontend already holds the full message history client-side
    (frontend/lib/chat/use-chat-session.ts); the backend does not
    duplicate that storage. Conversation persistence for authenticated
    users is MEM-02's separate, independently-scoped task — see
    .ai/COMPONENT_OWNERSHIP_MATRIX.md / WORK_BREAKDOWN_STRUCTURE.md.
    """

    messages: list[ChatMessageIn] = Field(min_length=1, max_length=40)

    @field_validator("messages")
    @classmethod
    def _last_message_must_be_from_user(
        cls, messages: list[ChatMessageIn]
    ) -> list[ChatMessageIn]:
        if messages[-1].role != "user":
            raise ValueError("The last message in the conversation must be from the user.")
        return messages


class ChatCompletionResponse(BaseModel):
    content: str
    model: str
