"""Tests for the stubbed OAuth redirect routes.

ADDED — ATLAS-P1-AUTH-03. The handshake itself is stubbed (no Google
or Apple OAuth credentials exist anywhere in this repository) — see
app/api/v1/oauth.py's own docstring and this session's handoff notes.
These tests confirm the stub behaves predictably, not that a real
handshake works.
"""

from httpx import AsyncClient


async def test_oauth_google_returns_not_implemented(client: AsyncClient) -> None:
    response = await client.get("/api/v1/auth/oauth/google")
    assert response.status_code == 501


async def test_oauth_apple_returns_not_implemented(client: AsyncClient) -> None:
    response = await client.get("/api/v1/auth/oauth/apple")
    assert response.status_code == 501


async def test_oauth_unknown_provider_returns_404(client: AsyncClient) -> None:
    response = await client.get("/api/v1/auth/oauth/facebook")
    assert response.status_code == 404
