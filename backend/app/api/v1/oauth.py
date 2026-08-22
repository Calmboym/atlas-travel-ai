"""OAuth redirect scaffolding (Google, Apple).

ADDED — ATLAS-P1-AUTH-03. STUBBED: no Google or Apple OAuth client ID
or secret exists anywhere in this repository's env files or
documentation (ARCHITECTURE.md's External Providers list names Maps /
Flight / Hotel / Weather / Currency / Translation providers — no
identity provider). Per this task's own acceptance criteria ("full
OAuth handshake may complete in this task or be stubbed if provider
credentials aren't yet available; report which if stubbed") — reported
here, plainly: stubbed.

A real implementation (authorization-code exchange, state/PKCE,
account linking) is left for a future task once real credentials
exist — building the handshake against nonexistent credentials would
be unverifiable and would invent an integration this repo has no way
to actually run.
"""

from fastapi import APIRouter, HTTPException, status

router = APIRouter(prefix="/auth/oauth", tags=["auth", "oauth"])

_SUPPORTED_PROVIDERS = {"google", "apple"}


@router.get("/{provider}")
async def oauth_redirect(provider: str) -> dict[str, str]:
    if provider not in _SUPPORTED_PROVIDERS:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Unknown OAuth provider.")

    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail=(
            f"{provider.capitalize()} sign-in isn't configured yet. "
            "Please continue with email and password for now."
        ),
    )
