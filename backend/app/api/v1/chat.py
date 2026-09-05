"""Conversation Manager HTTP endpoints.

ADDED — ATLAS-P1-CHAT-03: POST /completions (non-streaming).
EXTENDED — ATLAS-P1-CHAT-04: POST /completions/stream (SSE).

No authentication dependency on either route, by design — /chat is
deliberately unguarded (guest-mode AI Chat is locked product scope;
see chat_service.py's own docstring) and this task adds no persistence
that would need a user to attach to. Both routes are rate-limited by
client IP instead (app/core/rate_limit.py's RateLimiter, same as every
other public-facing endpoint in this API), sharing one counter so a
caller can't bypass the limit by alternating between them.

Provider errors are not caught with a route-local try/except — see
app/core/exception_handlers.py's module docstring for why (a real,
empirically-found bug: get_llm_provider raising during FastAPI's own
dependency resolution bypasses a handler-local except entirely). The
streaming route is the one exception: once its response has begun,
the status code can no longer change, so it catches ProviderError
itself and reports failure as an SSE event instead.
"""

import json
from collections.abc import AsyncIterator

import structlog
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse

from ai.providers.base import LLMProvider, ProviderError, ProviderNotConfiguredError

from app.core.ai import get_llm_provider
from app.core.config import get_settings
from app.core.exception_handlers import describe_provider_error
from app.core.rate_limit import RateLimiter
from app.schemas.chat import ChatCompletionRequest, ChatCompletionResponse
from app.services import chat_service

logger = structlog.get_logger(__name__)
settings = get_settings()

router = APIRouter(prefix="/chat", tags=["chat"])

_chat_rate_limiter = RateLimiter(
    "chat", settings.rate_limit_chat_max, settings.rate_limit_chat_window_seconds
)

# One shared message, reusing describe_provider_error's own text so the
# "not configured" wording lives in exactly one place — see that
# function's docstring. Raised here (inside each route's own body,
# which only executes once the request body has already validated
# successfully) rather than from get_llm_provider itself — see that
# function's docstring for the FastAPI dependency-ordering bug this
# avoids.
_NOT_CONFIGURED_DETAIL = describe_provider_error(ProviderNotConfiguredError())


def _require_provider(provider: LLMProvider | None) -> LLMProvider:
    if provider is None:
        logger.error("chat_provider_not_configured")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=_NOT_CONFIGURED_DETAIL
        )
    return provider


@router.post(
    "/completions",
    response_model=ChatCompletionResponse,
    dependencies=[Depends(_chat_rate_limiter)],
)
async def create_chat_completion(
    payload: ChatCompletionRequest,
    provider: LLMProvider | None = Depends(get_llm_provider),
) -> ChatCompletionResponse:
    return await chat_service.complete_chat(_require_provider(provider), payload.messages)


@router.post(
    "/completions/stream",
    dependencies=[Depends(_chat_rate_limiter)],
)
async def create_chat_completion_stream(
    payload: ChatCompletionRequest,
    provider: LLMProvider | None = Depends(get_llm_provider),
) -> StreamingResponse:
    resolved_provider = _require_provider(provider)

    async def event_source() -> AsyncIterator[str]:
        try:
            async for chunk in chat_service.stream_chat(resolved_provider, payload.messages):
                yield f"data: {json.dumps({'type': 'chunk', 'content': chunk})}\n\n"
            yield f"data: {json.dumps({'type': 'done'})}\n\n"
        except ProviderError as exc:
            logger.error("chat_stream_provider_error", error_type=type(exc).__name__)
            payload_json = json.dumps({"type": "error", "message": describe_provider_error(exc)})
            yield f"data: {payload_json}\n\n"

    return StreamingResponse(
        event_source(),
        media_type="text/event-stream",
        headers={
            # Standard "disable buffering" pairing for SSE behind
            # common reverse proxies — Cache-Control alone is enough
            # for most clients/dev servers; X-Accel-Buffering is a
            # no-op unless an nginx-family proxy is in front, added
            # defensively since the real production topology isn't
            # documented anywhere.
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )
