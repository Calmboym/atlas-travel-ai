"""Maps ai.providers.base's ProviderError hierarchy to calm HTTP responses.

ADDED — ATLAS-P1-CHAT-03. Registered globally (app/main.py) rather than
caught with a try/except inside app/api/v1/chat.py's route handler —
found empirically via a live server smoke test, not by mypy or pytest:
app/core/ai.py's get_llm_provider() is a FastAPI dependency
(`Depends(get_llm_provider)`), and when it raises
ProviderNotConfiguredError, that happens during FastAPI's own
dependency-resolution phase — *before* the route handler's function
body (and its try/except) ever runs. A handler-local try/except can
only catch errors raised once the handler body is executing (which
does correctly cover errors from an actual provider.complete() call —
verified by the parametrized tests in tests/test_chat.py) — it
structurally cannot catch an exception raised while resolving the
handler's own arguments. The unhandled ProviderNotConfiguredError
surfaced as a generic 500 with no detail — confirmed live
(`curl -i` against a running server; `tests/test_chat.py`'s dependency-
override strategy could not have caught this, since overriding
get_llm_provider entirely replaces it, never exercising get_llm_provider's
own error path).

A global exception handler is Starlette/FastAPI's standard mechanism
for "map this exception type to this response, regardless of where in
the request lifecycle it's raised" — not a novel technique. Registered
here (not inline in app/main.py) purely for file size; app/main.py
calls register_exception_handlers(app).

NOTE for ATLAS-P1-CHAT-04: this only works before a response has begun
sending — once a StreamingResponse's body has started (status code and
headers already sent), an error can no longer change the status code.
The streaming route must catch ProviderError itself, inside its
generator, and communicate failure through an SSE event instead — see
app/api/v1/chat.py's streaming endpoint for that separate handling.
"""

import structlog
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from ai.providers.base import (
    ProviderAuthenticationError,
    ProviderConnectionError,
    ProviderError,
    ProviderNotConfiguredError,
    ProviderRateLimitError,
)

logger = structlog.get_logger(__name__)

# AI_EXPERIENCE.md "Error Recovery": explain why, never expose raw
# system errors. The real exception message is logged server-side
# only (see each handler below) — never included in the response body.
_MESSAGES: dict[type[Exception], str] = {
    ProviderNotConfiguredError: "Atlas's AI backend isn't configured in this environment yet.",
    ProviderAuthenticationError: "Atlas couldn't authenticate with its AI backend right now.",
    ProviderRateLimitError: "Atlas's AI backend is busy right now. Please try again shortly.",
    ProviderConnectionError: "Atlas couldn't reach its AI backend. Please try again.",
}
_DEFAULT_MESSAGE = "Something interrupted this response. Please try again."


def describe_provider_error(exc: Exception) -> str:
    """The one place a ProviderError subtype maps to user-facing text.

    Shared by the global handler below (errors raised before a response
    has begun) and app/api/v1/chat.py's streaming route (errors raised
    mid-stream, which — per this module's own docstring — can no longer
    change the HTTP status code and must be communicated as an SSE
    event instead).
    """
    return _MESSAGES.get(type(exc), _DEFAULT_MESSAGE)


async def _handle_provider_error(request: Request, exc: Exception) -> JSONResponse:
    logger.error("chat_provider_error", error_type=type(exc).__name__, path=request.url.path)
    return JSONResponse(status_code=503, content={"detail": describe_provider_error(exc)})


def register_exception_handlers(app: FastAPI) -> None:
    # Registered from most-specific to least — Starlette dispatches on
    # exact exception type first, then walks the MRO, so order here
    # does not itself change behavior, but keeps this file readable in
    # the same specific-to-general order chat.py used before this fix.
    app.add_exception_handler(ProviderNotConfiguredError, _handle_provider_error)
    app.add_exception_handler(ProviderAuthenticationError, _handle_provider_error)
    app.add_exception_handler(ProviderRateLimitError, _handle_provider_error)
    app.add_exception_handler(ProviderConnectionError, _handle_provider_error)
    app.add_exception_handler(ProviderError, _handle_provider_error)
