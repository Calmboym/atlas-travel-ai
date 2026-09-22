"""Conversation Manager HTTP endpoints.

ADDED — ATLAS-P1-CHAT-03: POST /completions (non-streaming).
EXTENDED — ATLAS-P1-CHAT-04: POST /completions/stream (SSE).

No authentication *dependency* on either route, by design — /chat is
deliberately unguarded (guest-mode AI Chat is locked product scope;
see chat_service.py's own docstring) and Phase 1 added no persistence
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

EXTENDED — ATLAS-P2-AGENTS-09. Both routes now also resolve a DB
session and a best-effort, *optional* current-user id, passed through
to chat_service so its profile-aware Core Agents (Traveler Profile,
Recommendation) are available whenever the caller happens to be signed
in — never required. `_optional_current_user_id` deliberately
duplicates a small slice of `app/core/deps.py`'s own token-extraction
logic (`_extract_token`/`get_current_user`) rather than importing it:
`get_current_user` always raises when unauthenticated (exactly the
behavior every *other* protected route wants), which is the opposite
of what /chat needs — a missing, expired, or invalid token here must
silently mean "guest," never a 401. `app/core/deps.py` is also outside
this task's own Allowed-files-to-modify
(`backend/app/services/chat_service.py`, `backend/app/api/v1/chat.py`,
`ai/orchestrator/**` only — `WORK_BREAKDOWN_STRUCTURE.md`), so adding
an optional variant there was not an option for this task regardless.

The streaming route's SSE wire format gains one new, purely additive
frame shape: `data: {"type": "status", "message": "..."}`, sent at
most once, before any `"chunk"` frame, only when a registered Core
Agent's intent actually matched this message
(`chat_service.stream_chat`'s own docstring). The three pre-existing
frame shapes (`"chunk"`, `"done"`, `"error"`) are byte-for-byte
unchanged. This task's own acceptance criterion — "the existing
CHAT-04 SSE frontend consumer
(frontend/lib/chat/stream-assistant-reply.ts) requires NO changes" —
was verified directly by reading that file: its `parseServerEvent`
recognizes exactly `"chunk"`/`"done"`/`"error"`, and the `if/else if`
chain that dispatches on `event.type` has no `else` branch, so an
unrecognized `"status"` event is parsed successfully and then simply
matches none of the three branches — inert today, and available for a
future frontend task to render, without this backend task needing to
touch that file at all.
"""

import json
import uuid
from collections.abc import AsyncIterator

import structlog
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from ai.providers.base import LLMProvider, ProviderError, ProviderNotConfiguredError

from app.core.ai import get_llm_provider
from app.core.config import get_settings
from app.core.exception_handlers import describe_provider_error
from app.core.rate_limit import RateLimiter
from app.core.security import ACCESS_TOKEN_COOKIE_NAME, decode_access_token
from app.core.session_store import get_session_user_id
from app.db.session import get_db
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


def _extract_access_token(request: Request) -> str | None:
    """Mirrors app/core/deps._extract_token exactly — see this
    module's own docstring for why that function isn't imported/reused
    directly."""
    cookie_token = request.cookies.get(ACCESS_TOKEN_COOKIE_NAME)
    if cookie_token:
        return cookie_token
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.lower().startswith("bearer "):
        return auth_header[7:].strip()
    return None


async def _optional_current_user_id(request: Request) -> uuid.UUID | None:
    """Best-effort current-user id for chat's profile-aware Core
    Agents. Deliberately NEVER raises — /chat stays fully guest-usable
    regardless of a missing, expired, or invalid token; see this
    module's own docstring."""
    token = _extract_access_token(request)
    if token is None:
        return None
    payload = decode_access_token(token)
    if payload is None:
        return None
    session_user_id = await get_session_user_id(payload.jti)
    if session_user_id is None or session_user_id != payload.user_id:
        return None
    return payload.user_id


@router.post(
    "/completions",
    response_model=ChatCompletionResponse,
    dependencies=[Depends(_chat_rate_limiter)],
)
async def create_chat_completion(
    payload: ChatCompletionRequest,
    provider: LLMProvider | None = Depends(get_llm_provider),
    db: AsyncSession = Depends(get_db),
    user_id: uuid.UUID | None = Depends(_optional_current_user_id),
) -> ChatCompletionResponse:
    return await chat_service.complete_chat(
        _require_provider(provider), payload.messages, db=db, user_id=user_id
    )


@router.post(
    "/completions/stream",
    dependencies=[Depends(_chat_rate_limiter)],
)
async def create_chat_completion_stream(
    payload: ChatCompletionRequest,
    provider: LLMProvider | None = Depends(get_llm_provider),
    db: AsyncSession = Depends(get_db),
    user_id: uuid.UUID | None = Depends(_optional_current_user_id),
) -> StreamingResponse:
    resolved_provider = _require_provider(provider)

    async def event_source() -> AsyncIterator[str]:
        try:
            async for event in chat_service.stream_chat(
                resolved_provider, payload.messages, db=db, user_id=user_id
            ):
                if event.type == "status":
                    frame = {"type": "status", "message": event.content}
                else:
                    frame = {"type": "chunk", "content": event.content}
                yield f"data: {json.dumps(frame)}\n\n"
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
