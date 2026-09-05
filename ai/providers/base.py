"""Provider-independent LLM abstraction.

ADDED — ATLAS-P1-CHAT-03. `ai/` held no application code before this
task (confirmed: `.gitkeep` only in prompts/, agents/, schemas/,
evaluations/) — despite DEBUG_LOG.md's M0 record claiming an
"LLMProvider interface (provider-independent)" and "OpenAIProvider
implementation" were already delivered. Neither exists in the actual
repository; this is the first real implementation of that documented
intent, not a rebuild. Same category of documentation-vs-reality gap
already logged for `/api/v1/health` (see .ai/PROJECT_STATE.md).

Exists to satisfy ARCHITECTURE.md §2 "AI Provider Independence" ("The
system must not be locked to one AI provider... Supported future
providers: OpenAI, Anthropic Claude, Google Gemini, Local AI models")
and GUIDELINES.md §13's "External services must be accessed through
abstraction layers" — callers (app/services/chat_service.py,
ai/agents/conversation_manager.py) depend only on LLMProvider and the
exceptions below, never on any provider SDK's own types directly. This
is exactly the "Hotel Service -> Booking Adapter -> Expedia Adapter"
pattern ARCHITECTURE.md §2 illustrates, applied to the AI provider
instead of a travel-data provider.
"""

from abc import ABC, abstractmethod
from collections.abc import AsyncIterator
from dataclasses import dataclass
from typing import Literal

LLMMessageRole = Literal["system", "user", "assistant"]


@dataclass(frozen=True)
class LLMMessage:
    """A single provider-agnostic chat message.

    Deliberately its own type rather than reusing
    `app.schemas.chat.ChatMessageIn` directly — `ai/` must stay
    importable without `backend/app/`'s dependencies (pydantic-settings,
    FastAPI, SQLAlchemy) per DEBUG_LOG.md's own documented Architecture
    Decision ("ai/ package independent from backend/app/ ... Keeps AI
    layer reusable, provider-independent"). `role` includes "system"
    here (unlike the client-facing schema, which never accepts it from
    a request body — see chat_service.py) because the Conversation
    Manager itself is what prepends the system prompt.
    """

    role: LLMMessageRole
    content: str


class ProviderError(Exception):
    """Base class for every error this abstraction layer raises.

    Callers (chat_service.py) catch only these — never an
    openai.* exception type directly — so swapping providers never
    means rewriting error-handling call sites.
    """


class ProviderNotConfiguredError(ProviderError):
    """No credentials/configuration exist for this provider yet.

    Raised without ever attempting a network call — e.g. an empty
    OPENAI_API_KEY. Distinct from ProviderAuthenticationError (a call
    was attempted and the provider itself rejected the credentials).
    """


class ProviderAuthenticationError(ProviderError):
    """The provider rejected the configured credentials."""


class ProviderRateLimitError(ProviderError):
    """The upstream provider itself is rate-limiting this application.

    Distinct from app.core.rate_limit.RateLimiter, which limits our own
    users against our own API — this is Atlas, as a whole, hitting a
    limit the provider imposes on us.
    """


class ProviderConnectionError(ProviderError):
    """Timeout, DNS failure, or other network-level failure reaching the provider."""


class LLMProvider(ABC):
    """Provider-independent chat-completion interface.

    Exactly two operations, matching CHAT-03's "direct passthrough to
    one model" acceptance criterion (WORK_BREAKDOWN_STRUCTURE.md) — no
    tool calling, no function calling, no agent routing. Phase 2's
    AI Orchestrator / Agent Service (ARCHITECTURE.md §7-8) build on top
    of this later; this interface does not anticipate or invent that
    shape now.
    """

    @property
    @abstractmethod
    def model_name(self) -> str:
        """The specific model this provider instance is configured to call.

        Public on the interface (not a private attribute reached into
        from outside) so callers like app/services/chat_service.py can
        report which model actually answered without depending on any
        provider's internal field names.
        """
        raise NotImplementedError

    @abstractmethod
    async def complete(self, messages: list[LLMMessage]) -> str:
        """Return the full assistant reply for the given message history."""
        raise NotImplementedError

    @abstractmethod
    def stream_complete(self, messages: list[LLMMessage]) -> AsyncIterator[str]:
        """Yield incremental text chunks for the assistant reply.

        ADDED (interface) — ATLAS-P1-CHAT-04. Each yielded value is the
        chunk of new text since the previous yield (not the accumulated
        total) — app/services/chat_service.py accumulates, matching
        frontend/lib/chat's own onChunk(partial) convention of the
        caller owning accumulation, not the source.
        """
        raise NotImplementedError
