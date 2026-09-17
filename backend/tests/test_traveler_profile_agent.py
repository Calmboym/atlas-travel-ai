"""Tests for the Traveler Profile Agent — ATLAS-P2-AGENTS-04.

Runs against real Postgres (via the `db_session`/`client` fixtures
already established by `AUTH-02`'s `conftest.py`), not a mocked
database — matching every prior backend session's "real infrastructure,
not mocks" standard. A real `User` row is created through the real
`/api/v1/auth/register` endpoint (satisfying the foreign-key
constraint `TravelerProfile`/`UserMemory` both have on `users.id`);
`TravelerProfile`/`UserMemory` rows are then inserted directly through
`db_session` for full control over exact field values, including
enums.
"""

from __future__ import annotations

import uuid
from collections.abc import AsyncIterator

from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ai.agents.traveler_profile_agent import TravelerProfileAgent, TravelerProfileQuery
from ai.orchestrator import AgentRegistry, Orchestrator
from ai.providers.base import LLMMessage, LLMProvider
from ai.schemas.base import ConfidenceLevel
from ai.schemas.traveler_profile import TravelerProfileSummary
from app.models.traveler_profile import (
    AccommodationPreference,
    BudgetLevel,
    FoodPreference,
    TransportationPreference,
    TravelerProfile,
    TravelPreference,
)
from app.models.user_memory import UserMemory

_EMAIL = "traveler-profile-agent-user@example.com"
_PASSWORD = "longenough1"
_FAKE_REPLY = "You're a budget-conscious solo traveler who prefers hostels."


class FakeLLMProvider(LLMProvider):
    """Test double — never touches the network. Mirrors every other
    Phase 2 test file's own `FakeLLMProvider`."""

    def __init__(self, reply: str = _FAKE_REPLY) -> None:
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


async def _register_user(client: AsyncClient) -> uuid.UUID:
    response = await client.post(
        "/api/v1/auth/register", json={"email": _EMAIL, "password": _PASSWORD}
    )
    assert response.status_code == 201, response.text
    return uuid.UUID(response.json()["user"]["id"])


def _user_messages(*texts: str) -> list[LLMMessage]:
    return [LLMMessage(role="user", content=text) for text in texts]


# ---------------------------------------------------------------------------
# The 7 ARCHITECTURE.md §8 fields + AgentHandler shape
# ---------------------------------------------------------------------------


async def test_agent_declares_no_allowed_tools(
    client: AsyncClient, db_session: AsyncSession
) -> None:
    user_id = await _register_user(client)
    agent = TravelerProfileAgent(FakeLLMProvider(), db_session, user_id)
    assert agent.allowed_tools == ()


async def test_agent_schemas_are_the_expected_types(
    client: AsyncClient, db_session: AsyncSession
) -> None:
    user_id = await _register_user(client)
    agent = TravelerProfileAgent(FakeLLMProvider(), db_session, user_id)
    assert agent.input_schema is TravelerProfileQuery
    assert agent.output_schema is TravelerProfileSummary
    assert agent.name == "traveler-profile-agent"
    assert "my profile" in agent.intents


# ---------------------------------------------------------------------------
# No profile, no memory — the empty case
# ---------------------------------------------------------------------------


async def test_reason_with_nothing_recorded_returns_low_confidence(
    client: AsyncClient, db_session: AsyncSession
) -> None:
    user_id = await _register_user(client)
    provider = FakeLLMProvider()
    agent = TravelerProfileAgent(provider, db_session, user_id)

    result = await agent.reason(_user_messages("what do you know about me?"))

    assert isinstance(result, TravelerProfileSummary)
    assert result.confidence == ConfidenceLevel.LOW
    assert result.uncertainty_notes == ("No traveler profile has been saved yet.",)
    assert result.travel_preference is None
    assert result.budget_level is None
    assert result.food_preferences == ()
    assert result.memory_notes == ()
    assert result.summary == _FAKE_REPLY  # LLM output, passed through
    # `reasoning` is a fixed provenance string, never LLM output.
    assert "Derived directly from the traveler's saved profile" in result.reasoning


async def test_reason_never_creates_a_profile_or_memory_row(
    client: AsyncClient, db_session: AsyncSession
) -> None:
    """The core `read-only` acceptance criterion, checked mechanically:
    calling `reason()` when neither row exists must not create either
    one — unlike `get_or_create_profile`/`get_or_create_memory`."""
    user_id = await _register_user(client)
    agent = TravelerProfileAgent(FakeLLMProvider(), db_session, user_id)

    await agent.reason(_user_messages("what do you know about me?"))

    profile_result = await db_session.execute(
        select(TravelerProfile).where(TravelerProfile.user_id == user_id)
    )
    memory_result = await db_session.execute(select(UserMemory).where(UserMemory.user_id == user_id))
    assert profile_result.scalar_one_or_none() is None
    assert memory_result.scalar_one_or_none() is None


async def test_facts_rendered_to_the_llm_say_nothing_is_recorded_when_empty(
    client: AsyncClient, db_session: AsyncSession
) -> None:
    user_id = await _register_user(client)
    provider = FakeLLMProvider()
    agent = TravelerProfileAgent(provider, db_session, user_id)

    await agent.reason(_user_messages("what do you know about me?"))

    assert provider.received_messages is not None
    assert provider.received_messages[0].role == "system"
    assert "No traveler facts are recorded yet" in provider.received_messages[1].content


# ---------------------------------------------------------------------------
# A fully populated profile + memory
# ---------------------------------------------------------------------------


async def _insert_full_profile(db_session: AsyncSession, user_id: uuid.UUID) -> None:
    db_session.add(
        TravelerProfile(
            user_id=user_id,
            travel_preference=TravelPreference.SOLO,
            budget_level=BudgetLevel.ECONOMY,
            accommodation_preference=AccommodationPreference.HOSTEL,
            transportation_preference=TransportationPreference.TRAIN,
            food_preferences=[FoodPreference.VEGETARIAN.value],
            preferred_travel_language="en",
        )
    )
    db_session.add(UserMemory(user_id=user_id, data={"prefers_window_seats": True, "pace": "slow"}))
    await db_session.commit()


async def test_reason_with_a_full_profile_passes_through_every_field_exactly(
    client: AsyncClient, db_session: AsyncSession
) -> None:
    user_id = await _register_user(client)
    await _insert_full_profile(db_session, user_id)
    agent = TravelerProfileAgent(FakeLLMProvider(), db_session, user_id)

    result = await agent.reason(_user_messages("what do you know about me?"))

    assert isinstance(result, TravelerProfileSummary)
    assert result.travel_preference == "solo"
    assert result.budget_level == "economy"
    assert result.accommodation_preference == "hostel"
    assert result.transportation_preference == "train"
    assert result.food_preferences == ("vegetarian",)
    assert result.preferred_travel_language == "en"
    assert result.memory_notes == ("pace: slow", "prefers_window_seats: True")
    assert result.confidence == ConfidenceLevel.HIGH
    assert result.uncertainty_notes == ()


async def test_facts_rendered_to_the_llm_reflect_the_full_profile(
    client: AsyncClient, db_session: AsyncSession
) -> None:
    user_id = await _register_user(client)
    await _insert_full_profile(db_session, user_id)
    provider = FakeLLMProvider()
    agent = TravelerProfileAgent(provider, db_session, user_id)

    await agent.reason(_user_messages("what do you know about me?"))

    assert provider.received_messages is not None
    facts_text = provider.received_messages[1].content
    assert "Travel style: solo" in facts_text
    assert "Budget level: economy" in facts_text
    assert "Memory note — pace: slow" in facts_text


# ---------------------------------------------------------------------------
# A partially populated profile
# ---------------------------------------------------------------------------


async def test_reason_with_a_partial_profile_returns_medium_confidence(
    client: AsyncClient, db_session: AsyncSession
) -> None:
    user_id = await _register_user(client)
    db_session.add(
        TravelerProfile(user_id=user_id, travel_preference=TravelPreference.FAMILY, budget_level=BudgetLevel.LUXURY)
    )
    await db_session.commit()
    agent = TravelerProfileAgent(FakeLLMProvider(), db_session, user_id)

    result = await agent.reason(_user_messages("what do you know about me?"))

    assert isinstance(result, TravelerProfileSummary)
    assert result.confidence == ConfidenceLevel.MEDIUM
    assert result.travel_preference == "family"
    assert result.accommodation_preference is None
    assert "accommodation preference" in result.uncertainty_notes[0]
    assert "food preferences" in result.uncertainty_notes[0]


# ---------------------------------------------------------------------------
# End-to-end through a real AgentRegistry/Orchestrator
# ---------------------------------------------------------------------------


async def test_agent_registers_and_dispatches_through_the_real_orchestrator(
    client: AsyncClient, db_session: AsyncSession
) -> None:
    user_id = await _register_user(client)
    await _insert_full_profile(db_session, user_id)

    registry = AgentRegistry()
    agent = TravelerProfileAgent(FakeLLMProvider(), db_session, user_id)
    registry.register(agent)
    orchestrator = Orchestrator(registry=registry)
    passthrough_provider = FakeLLMProvider(reply="should not be used")

    result = await orchestrator.dispatch(
        passthrough_provider, _user_messages("Can you tell me my profile?")
    )

    assert result.decision.selected_agent == "traveler-profile-agent"
    assert _FAKE_REPLY in result.content
    assert passthrough_provider.received_messages is None  # raw provider never called
