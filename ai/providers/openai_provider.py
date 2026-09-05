"""OpenAI implementation of ai.providers.base.LLMProvider.

ADDED — ATLAS-P1-CHAT-03. The `openai` package was already listed in
backend/pyproject.toml (RECONSTRUCTED — "implied by DEBUG_LOG.md's
'OpenAIProvider implementation' and the documented OPENAI_API_KEY env
var") and installs cleanly (openai==3.0.0 at implementation time), but
was completely unused anywhere in the repository before this task —
confirmed by grepping the codebase, not assumed. OPENAI_API_KEY is
documented verbatim in .env.example (DEBUG_LOG.md Known Issues: "AI
smoke tests require OPENAI_API_KEY ... auto-skip when key is absent")
but was not wired into app/core/config.py's Settings until this task —
see that file's own change note.

OpenAI is the documented provider choice (the only one with a verbatim
env-var name and an already-approved dependency); this file does not
change that architecture decision, it implements it for the first
time. ARCHITECTURE.md §2's other listed future providers (Anthropic
Claude, Google Gemini, local models) remain available to add later as
sibling files implementing the same LLMProvider interface — nothing
here is Anthropic/Gemini-specific by construction.

VERIFICATION NOTE: this sandbox's network egress proxy blocks
api.openai.com (confirmed empirically: a direct request returns
`403 x-deny-reason: host_not_allowed`) — the same category of
limitation DEBUG_LOG.md's own Known Issues already anticipated for a
missing OPENAI_API_KEY, just at the network layer instead. This file's
logic is verified via a fake LLMProvider in backend/tests/ (dependency-
injected through app/core/ai.py's get_llm_provider) exercising
chat_service.py's real request/response/error-mapping code, and via a
live curl smoke test of the endpoint itself (auth-free access,
validation, rate limiting, and the graceful ProviderNotConfiguredError
-> 503 path) — not by a live call to the real OpenAI API, which cannot
happen from this environment. Real-provider verification is a project-
owner action once a reachable environment and a real key are both
available.
"""

from collections.abc import AsyncIterator
from typing import cast

from openai import (
    APIConnectionError,
    APITimeoutError,
    AsyncOpenAI,
    AsyncStream,
    AuthenticationError,
    OpenAIError,
    RateLimitError,
)
from openai.types.chat import ChatCompletionChunk

from ai.providers.base import (
    LLMMessage,
    LLMProvider,
    ProviderAuthenticationError,
    ProviderConnectionError,
    ProviderError,
    ProviderRateLimitError,
)


class OpenAIProvider(LLMProvider):
    """Chat-completion passthrough to one OpenAI model.

    No tool calling, no function calling, no structured output —
    CHAT-03's own acceptance criterion ("this is a direct passthrough
    to one model"). Those become relevant once Phase 2's Agent Service
    exists to make use of them.
    """

    def __init__(self, api_key: str, model: str) -> None:
        self._model = model
        self._client = AsyncOpenAI(api_key=api_key)

    @property
    def model_name(self) -> str:
        return self._model

    @staticmethod
    def _to_openai_messages(messages: list[LLMMessage]) -> list[dict[str, str]]:
        return [{"role": message.role, "content": message.content} for message in messages]

    async def complete(self, messages: list[LLMMessage]) -> str:
        try:
            response = await self._client.chat.completions.create(
                model=self._model,
                messages=self._to_openai_messages(messages),  # type: ignore[arg-type]
            )
        except AuthenticationError as exc:
            raise ProviderAuthenticationError(str(exc)) from exc
        except RateLimitError as exc:
            raise ProviderRateLimitError(str(exc)) from exc
        except (APIConnectionError, APITimeoutError) as exc:
            raise ProviderConnectionError(str(exc)) from exc
        except OpenAIError as exc:
            raise ProviderError(str(exc)) from exc

        choice = response.choices[0] if response.choices else None
        content = choice.message.content if choice and choice.message else None
        return content or ""

    async def stream_complete(self, messages: list[LLMMessage]) -> AsyncIterator[str]:
        try:
            raw_stream = await self._client.chat.completions.create(
                model=self._model,
                messages=self._to_openai_messages(messages),  # type: ignore[arg-type]
                stream=True,
            )
            # The SDK's overloads narrow this to AsyncStream[ChatCompletionChunk]
            # for stream=True, but the # type: ignore above on `messages`
            # already breaks that overload match for mypy — cast() makes the
            # already-guaranteed-at-runtime shape explicit instead of
            # silencing a second, unrelated error.
            stream = cast(AsyncStream[ChatCompletionChunk], raw_stream)
        except AuthenticationError as exc:
            raise ProviderAuthenticationError(str(exc)) from exc
        except RateLimitError as exc:
            raise ProviderRateLimitError(str(exc)) from exc
        except (APIConnectionError, APITimeoutError) as exc:
            raise ProviderConnectionError(str(exc)) from exc
        except OpenAIError as exc:
            raise ProviderError(str(exc)) from exc

        try:
            async for chunk in stream:
                if not chunk.choices:
                    continue
                delta = chunk.choices[0].delta.content
                if delta:
                    yield delta
        except AuthenticationError as exc:
            raise ProviderAuthenticationError(str(exc)) from exc
        except RateLimitError as exc:
            raise ProviderRateLimitError(str(exc)) from exc
        except (APIConnectionError, APITimeoutError) as exc:
            raise ProviderConnectionError(str(exc)) from exc
        except OpenAIError as exc:
            raise ProviderError(str(exc)) from exc
