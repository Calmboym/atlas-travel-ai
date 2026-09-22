"""End-to-end multi-agent chat routing tests — ATLAS-P2-AGENTS-09.

Exercises the real `POST /chat/completions` and
`POST /chat/completions/stream` routes with messages that trigger each
of the five Core Agents, for both guest and authenticated callers.
`tests/test_chat.py` is left entirely unmodified and continues to
cover the Phase 1 passthrough path, error handling, and rate limiting
— this file is additive, covering only what `AGENTS-09` adds.
"""

from __future__ import annotations

import json
import uuid
from collections.abc import AsyncGenerator, AsyncIterator

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from ai.orchestrator.agent_wiring import reset_for_tests
from ai.providers.base import LLMMessage, LLMProvider

from app.core.ai import get_llm_provider
from app.main import app
from app.models.traveler_profile import TravelerProfile, TravelPreference

_EMAIL = "multi-agent-chat-user@example.com"
_PASSWORD = "longenough1"


class FakeLLMProvider(LLMProvider):
    """Test double — never touches the network. Mirrors
    `tests/test_chat.py`'s own `FakeLLMProvider` shape exactly."""

    def __init__(self, reply: str = "fake reply", chunks: list[str] | None = None) -> None:
        self._reply = reply
        self._chunks = chunks if chunks is not None else [reply]
        self.received_messages: list[LLMMessage] | None = None

    @property
    def model_name(self) -> str:
        return "fake-model-for-tests"

    async def complete(self, messages: list[LLMMessage]) -> str:
        self.received_messages = messages
        return self._reply

    async def stream_complete(self, messages: list[LLMMessage]) -> AsyncIterator[str]:
        self.received_messages = messages
        for chunk in self._chunks:
            yield chunk


@pytest.fixture(autouse=True)
async def _reset_state() -> AsyncGenerator[None, None]:
    """Resets both the process-wide agent-wiring cache (see
    `test_agent_wiring.py`'s own fixture docstring) and the
    `get_llm_provider` dependency override, mirroring
    `test_chat.py`'s own `_clear_ai_provider_override` — a separate,
    unshared fixture since this is a separate test module."""
    await reset_for_tests()
    yield None
    await reset_for_tests()
    app.dependency_overrides.pop(get_llm_provider, None)


def _override_provider(provider: LLMProvider) -> None:
    app.dependency_overrides[get_llm_provider] = lambda: provider


async def _register_and_login(client: AsyncClient) -> uuid.UUID:
    response = await client.post("/api/v1/auth/register", json={"email": _EMAIL, "password": _PASSWORD})
    assert response.status_code == 201, response.text
    login_response = await client.post("/api/v1/auth/login", json={"email": _EMAIL, "password": _PASSWORD})
    assert login_response.status_code == 200, login_response.text
    return uuid.UUID(response.json()["user"]["id"])


def _parse_sse_events(body: str) -> list[dict[str, str]]:
    events = []
    for raw_event in body.split("\n\n"):
        for line in raw_event.splitlines():
            if line.startswith("data: "):
                events.append(json.loads(line.removeprefix("data: ")))
    return events


# ---------------------------------------------------------------------------
# Guest: the three static agents are reachable; profile-aware ones are not
# ---------------------------------------------------------------------------


async def test_guest_destination_message_routes_to_the_destination_agent(client: AsyncClient) -> None:
    fake = FakeLLMProvider(reply="Kyoto is calm in autumn.")
    _override_provider(fake)

    response = await client.post(
        "/api/v1/chat/completions",
        json={"messages": [{"role": "user", "content": "Where should I go? Give me destination ideas."}]},
    )

    assert response.status_code == 200
    assert "Kyoto is calm in autumn." in response.json()["content"]


async def test_guest_budget_message_routes_to_the_budget_agent(client: AsyncClient) -> None:
    fake = FakeLLMProvider(reply="Roughly EUR 900 for the week.")
    _override_provider(fake)

    response = await client.post(
        "/api/v1/chat/completions",
        json={"messages": [{"role": "user", "content": "Please estimate my budget for a week in Lisbon."}]},
    )

    assert response.status_code == 200
    assert "Roughly EUR 900 for the week." in response.json()["content"]


async def test_guest_itinerary_message_routes_to_the_itinerary_agent(client: AsyncClient) -> None:
    fake = FakeLLMProvider(reply="A relaxed week, mixing culture and rest.")
    _override_provider(fake)

    response = await client.post(
        "/api/v1/chat/completions",
        json={"messages": [{"role": "user", "content": "Please plan my itinerary for Kyoto."}]},
    )

    assert response.status_code == 200
    assert "A relaxed week, mixing culture and rest." in response.json()["content"]


async def test_guest_profile_message_falls_back_to_the_phase_1_passthrough(client: AsyncClient) -> None:
    """Traveler Profile is unavailable for a guest — 'my preferences'
    must NOT reach TravelerProfileAgent; it must reach exactly the same
    Phase 1 passthrough behavior a guest already had before this task."""
    fake = FakeLLMProvider(reply="I don't have anything saved about you yet.")
    _override_provider(fake)

    response = await client.post(
        "/api/v1/chat/completions",
        json={"messages": [{"role": "user", "content": "What are my preferences?"}]},
    )

    assert response.status_code == 200
    assert response.json()["content"] == "I don't have anything saved about you yet."
    assert fake.received_messages is not None
    assert fake.received_messages[0].role == "system"
    assert "Atlas" in fake.received_messages[0].content


async def test_guest_recommendation_message_falls_back_to_the_phase_1_passthrough(
    client: AsyncClient,
) -> None:
    fake = FakeLLMProvider(reply="Happy to help — tell me more about what you're looking for.")
    _override_provider(fake)

    response = await client.post(
        "/api/v1/chat/completions",
        json={"messages": [{"role": "user", "content": "Please recommend for me"}]},
    )

    assert response.status_code == 200
    assert response.json()["content"] == "Happy to help — tell me more about what you're looking for."


# ---------------------------------------------------------------------------
# Authenticated: all five agents reachable
# ---------------------------------------------------------------------------


async def test_authenticated_profile_message_routes_to_the_profile_agent(client: AsyncClient) -> None:
    await _register_and_login(client)
    fake = FakeLLMProvider(reply="Noted, thanks for sharing.")
    _override_provider(fake)

    response = await client.post(
        "/api/v1/chat/completions",
        json={"messages": [{"role": "user", "content": "What are my preferences?"}]},
    )

    assert response.status_code == 200
    assert "Noted, thanks for sharing." in response.json()["content"]


async def test_authenticated_recommendation_message_routes_to_the_recommendation_agent(
    client: AsyncClient, db_session: AsyncSession
) -> None:
    """Queenstown's own curated description literally contains the word
    'adventure' — see `ai/agents/recommendation_agent.py`'s own
    docstring; the same grounded overlap `test_recommendation_agent.py`
    already exercises directly, now proven reachable through the real
    `/chat` route for a real authenticated user."""
    user_id = await _register_and_login(client)
    db_session.add(TravelerProfile(user_id=user_id, travel_preference=TravelPreference.ADVENTURE))
    await db_session.commit()
    fake = FakeLLMProvider(reply="Queenstown looks like a great match.")
    _override_provider(fake)

    response = await client.post(
        "/api/v1/chat/completions",
        json={"messages": [{"role": "user", "content": "Please recommend for me somewhere adventurous"}]},
    )

    assert response.status_code == 200
    body = response.json()["content"]
    assert "Queenstown looks like a great match." in body
    assert "AGENTS-05's own retrieved destinations" in body


# ---------------------------------------------------------------------------
# Streaming: the new, additive "status" SSE frame
# ---------------------------------------------------------------------------


async def test_guest_stream_agent_message_includes_a_leading_status_event(client: AsyncClient) -> None:
    fake = FakeLLMProvider(reply="Kyoto is calm in autumn.")
    _override_provider(fake)

    response = await client.post(
        "/api/v1/chat/completions/stream",
        json={"messages": [{"role": "user", "content": "Where should I go? Give me destination ideas."}]},
    )

    assert response.status_code == 200
    events = _parse_sse_events(response.text)
    assert events[0] == {"type": "status", "message": "Finding destinations..."}
    assert events[-1] == {"type": "done"}
    chunk_events = [event for event in events if event["type"] == "chunk"]
    assert len(chunk_events) == 1
    assert "Kyoto is calm in autumn." in chunk_events[0]["content"]


async def test_guest_stream_passthrough_message_has_no_status_event(client: AsyncClient) -> None:
    """Regression-confirming: a plain, non-agent message still produces
    exactly the Phase 1 shape — chunk(s) then done, no leading status —
    doubly confirming what `test_chat.py`'s own unmodified
    `test_stream_emits_chunks_then_a_done_event` already covers."""
    fake = FakeLLMProvider(chunks=["Hi", " there!"])
    _override_provider(fake)

    response = await client.post(
        "/api/v1/chat/completions/stream",
        json={"messages": [{"role": "user", "content": "Hi"}]},
    )

    assert response.status_code == 200
    events = _parse_sse_events(response.text)
    assert [event["type"] for event in events] == ["chunk", "chunk", "done"]


async def test_authenticated_stream_profile_message_includes_the_profile_status_event(
    client: AsyncClient,
) -> None:
    await _register_and_login(client)
    fake = FakeLLMProvider(reply="Noted, thanks for sharing.")
    _override_provider(fake)

    response = await client.post(
        "/api/v1/chat/completions/stream",
        json={"messages": [{"role": "user", "content": "What are my preferences?"}]},
    )

    assert response.status_code == 200
    events = _parse_sse_events(response.text)
    assert events[0] == {"type": "status", "message": "Checking your saved preferences..."}
