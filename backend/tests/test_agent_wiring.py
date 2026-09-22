"""Tests for the chat-route agent wiring — ATLAS-P2-AGENTS-09.

Exercises `ai.orchestrator.agent_wiring.build_agent_registry` directly,
without going through the HTTP layer — `test_chat_multi_agent.py`
covers the real `/chat` routes end-to-end.
"""

from __future__ import annotations

import uuid
from collections.abc import AsyncGenerator, AsyncIterator

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from ai.agents.budget_agent import BudgetAgent
from ai.agents.destination_intelligence_agent import DestinationIntelligenceAgent
from ai.agents.itinerary_planner_agent import ItineraryPlannerAgent
from ai.agents.recommendation_agent import RecommendationAgent
from ai.agents.traveler_profile_agent import TravelerProfileAgent
from ai.orchestrator.agent_wiring import build_agent_registry, reset_for_tests
from ai.providers.base import LLMMessage, LLMProvider

_EMAIL = "agent-wiring-user@example.com"
_PASSWORD = "longenough1"


class FakeLLMProvider(LLMProvider):
    """Test double — never touches the network."""

    def __init__(self, reply: str = "fake reply") -> None:
        self._reply = reply
        self.received_messages: list[LLMMessage] | None = None

    @property
    def model_name(self) -> str:
        return "fake-model-for-tests"

    async def complete(self, messages: list[LLMMessage]) -> str:
        self.received_messages = messages
        return self._reply

    async def stream_complete(self, messages: list[LLMMessage]) -> AsyncIterator[str]:
        raise NotImplementedError("Not exercised by these tests.")
        yield  # pragma: no cover - unreachable, satisfies the AsyncIterator shape


@pytest.fixture(autouse=True)
async def _reset_agent_wiring_cache() -> AsyncGenerator[None, None]:
    """The static-agent cache binds one specific `LLMProvider` instance
    at first build (`ai/orchestrator/agent_wiring.py`'s own docstring)
    — reset before AND after every test in this file so each test's
    own `FakeLLMProvider` is what actually gets used, and so no cached
    Qdrant client/agent leaks into another test module's run."""
    await reset_for_tests()
    yield None
    await reset_for_tests()


async def _register_user(client: AsyncClient) -> uuid.UUID:
    response = await client.post("/api/v1/auth/register", json={"email": _EMAIL, "password": _PASSWORD})
    assert response.status_code == 201, response.text
    return uuid.UUID(response.json()["user"]["id"])


async def test_guest_registry_has_exactly_the_three_static_agents() -> None:
    provider = FakeLLMProvider()
    registry = await build_agent_registry(provider, db=None, user_id=None)

    assert len(registry) == 3
    assert {agent.name for agent in registry.agents} == {
        "destination-intelligence-agent",
        "budget-agent",
        "itinerary-planner-agent",
    }


async def test_authenticated_registry_has_all_five_agents(
    client: AsyncClient, db_session: AsyncSession
) -> None:
    user_id = await _register_user(client)
    provider = FakeLLMProvider()

    registry = await build_agent_registry(provider, db=db_session, user_id=user_id)

    assert len(registry) == 5
    assert {agent.name for agent in registry.agents} == {
        "traveler-profile-agent",
        "destination-intelligence-agent",
        "budget-agent",
        "itinerary-planner-agent",
        "recommendation-agent",
    }


async def test_registry_needs_both_db_and_user_id_for_profile_aware_agents(
    client: AsyncClient, db_session: AsyncSession
) -> None:
    """db without user_id, or user_id without db, both fall back to the
    guest-safe three-agent registry — neither alone is enough."""
    user_id = await _register_user(client)
    provider = FakeLLMProvider()

    only_db = await build_agent_registry(provider, db=db_session, user_id=None)
    only_user_id = await build_agent_registry(provider, db=None, user_id=user_id)

    assert len(only_db) == 3
    assert len(only_user_id) == 3


async def test_static_agents_are_the_expected_concrete_types() -> None:
    provider = FakeLLMProvider()
    registry = await build_agent_registry(provider, db=None, user_id=None)
    by_name = {agent.name: agent for agent in registry.agents}

    assert isinstance(by_name["destination-intelligence-agent"], DestinationIntelligenceAgent)
    assert isinstance(by_name["budget-agent"], BudgetAgent)
    assert isinstance(by_name["itinerary-planner-agent"], ItineraryPlannerAgent)


async def test_profile_aware_agents_are_the_expected_concrete_types(
    client: AsyncClient, db_session: AsyncSession
) -> None:
    user_id = await _register_user(client)
    provider = FakeLLMProvider()
    registry = await build_agent_registry(provider, db=db_session, user_id=user_id)
    by_name = {agent.name: agent for agent in registry.agents}

    assert isinstance(by_name["traveler-profile-agent"], TravelerProfileAgent)
    assert isinstance(by_name["recommendation-agent"], RecommendationAgent)


async def test_static_agents_are_cached_across_calls() -> None:
    """The process-wide singleton mechanism: two separate
    `build_agent_registry` calls (simulating two separate requests)
    return the SAME underlying `DestinationIntelligenceAgent` instance,
    not two freshly-built ones — see this module's own docstring for
    why that matters (avoiding re-indexing Qdrant on every request)."""
    provider = FakeLLMProvider()
    first = await build_agent_registry(provider, db=None, user_id=None)
    second = await build_agent_registry(provider, db=None, user_id=None)

    first_destination = next(a for a in first.agents if a.name == "destination-intelligence-agent")
    second_destination = next(a for a in second.agents if a.name == "destination-intelligence-agent")
    assert first_destination is second_destination


async def test_two_authenticated_requests_get_independent_profile_agents(
    client: AsyncClient, db_session: AsyncSession
) -> None:
    """Unlike the static three, TravelerProfileAgent/RecommendationAgent
    must be a fresh instance every call — each is bound to one specific
    user, and must never be shared/cached across different users."""
    user_id = await _register_user(client)
    provider = FakeLLMProvider()

    first = await build_agent_registry(provider, db=db_session, user_id=user_id)
    second = await build_agent_registry(provider, db=db_session, user_id=user_id)

    first_profile = next(a for a in first.agents if a.name == "traveler-profile-agent")
    second_profile = next(a for a in second.agents if a.name == "traveler-profile-agent")
    assert first_profile is not second_profile
