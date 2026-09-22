"""Tests for the Recommendation Agent — ATLAS-P2-AGENTS-08.

Combines `test_traveler_profile_agent.py`'s real-Postgres fixture
pattern (a real registered `User` + `TravelerProfile` row) with
`test_itinerary_planner_agent.py`'s real-local-Qdrant `destination_agent`
fixture pattern — `RecommendationAgent` composes one real instance of
each.
"""

from __future__ import annotations

import uuid
from collections.abc import AsyncGenerator, AsyncIterator

import pytest
from httpx import AsyncClient
from qdrant_client import AsyncQdrantClient
from sqlalchemy.ext.asyncio import AsyncSession

from ai.agents.destination_intelligence_agent import (
    CURATED_DESTINATIONS,
    DestinationIntelligenceAgent,
    build_destination_search_tool,
)
from ai.agents.recommendation_agent import (
    RecommendationAgent,
    RecommendationQuery,
    _find_matched_preference,
    _score_and_rank,
    _traveler_preference_values,
)
from ai.agents.traveler_profile_agent import TravelerProfileAgent
from ai.orchestrator import AgentRegistry, Orchestrator
from ai.providers.base import LLMMessage, LLMProvider
from ai.rag.embeddings import HashingEmbeddingProvider
from ai.rag.vector_store import QdrantKnowledgeStore
from ai.schemas.base import ConfidenceLevel
from ai.schemas.destination import DestinationOption
from ai.schemas.recommendation import RecommendationList
from ai.schemas.traveler_profile import TravelerProfileSummary
from ai.tools.registry import ToolRegistry
from ai.tools.service import ToolService
from app.models.traveler_profile import TravelerProfile, TravelPreference

_TEST_COLLECTION_NAME = "atlas_destination_reference_recommendation_test"
_EMAIL = "recommendation-agent-user@example.com"
_PASSWORD = "longenough1"
_FAKE_REPLY = "Here are a few destinations worth considering."


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
    response = await client.post("/api/v1/auth/register", json={"email": _EMAIL, "password": _PASSWORD})
    assert response.status_code == 201, response.text
    return uuid.UUID(response.json()["user"]["id"])


def _user_messages(*texts: str) -> list[LLMMessage]:
    return [LLMMessage(role="user", content=text) for text in texts]


def _destination(
    name: str, description: str, relevance_score: float, source_document_id: str = "DOC_TEST"
) -> DestinationOption:
    return DestinationOption(
        name=name,
        description=description,
        source_document_id=source_document_id,
        relevance_score=relevance_score,
    )


@pytest.fixture
async def destination_agent() -> AsyncGenerator[DestinationIntelligenceAgent, None]:
    """A real `DestinationIntelligenceAgent`, backed by a real local
    Qdrant server, using a dedicated test collection dropped after
    every test — mirrors `test_itinerary_planner_agent.py`'s own
    `destination_agent` fixture exactly."""
    client = AsyncQdrantClient(host="localhost", port=6333)
    store = QdrantKnowledgeStore(
        client, HashingEmbeddingProvider(), collection_name=_TEST_COLLECTION_NAME
    )
    await store.index_documents(CURATED_DESTINATIONS)
    registry = ToolRegistry()
    registry.register(build_destination_search_tool(store))
    tool_service = ToolService(registry)
    try:
        yield DestinationIntelligenceAgent(FakeLLMProvider(reply="destination summary"), tool_service)
    finally:
        if await client.collection_exists(_TEST_COLLECTION_NAME):
            await client.delete_collection(_TEST_COLLECTION_NAME)
        await client.close()


def _build_recommendation_agent(
    destination_agent: DestinationIntelligenceAgent,
    db_session: AsyncSession,
    user_id: uuid.UUID,
    reply: str = _FAKE_REPLY,
) -> tuple[RecommendationAgent, FakeLLMProvider]:
    provider = FakeLLMProvider(reply=reply)
    profile_agent = TravelerProfileAgent(FakeLLMProvider(reply="profile summary"), db_session, user_id)
    return RecommendationAgent(provider, profile_agent, destination_agent), provider


# ---------------------------------------------------------------------------
# The 7 ARCHITECTURE.md §8 fields + AgentHandler shape
# ---------------------------------------------------------------------------


async def test_agent_declares_no_allowed_tools(
    client: AsyncClient, db_session: AsyncSession, destination_agent: DestinationIntelligenceAgent
) -> None:
    user_id = await _register_user(client)
    agent, _ = _build_recommendation_agent(destination_agent, db_session, user_id)
    assert agent.allowed_tools == ()


async def test_agent_schemas_are_the_expected_types(
    client: AsyncClient, db_session: AsyncSession, destination_agent: DestinationIntelligenceAgent
) -> None:
    user_id = await _register_user(client)
    agent, _ = _build_recommendation_agent(destination_agent, db_session, user_id)
    assert agent.input_schema is RecommendationQuery
    assert agent.output_schema is RecommendationList
    assert agent.name == "recommendation-agent"
    assert "recommend for me" in agent.intents


# ---------------------------------------------------------------------------
# _find_matched_preference — deterministic, literal, case-insensitive
# ---------------------------------------------------------------------------


@pytest.mark.parametrize(
    ("description", "preference_values", "expected"),
    [
        ("Known for adventure activities.", ("adventure",), "adventure"),
        ("Known for ADVENTURE activities.", ("adventure",), "adventure"),
        ("Known for adventure activities.", ("ADVENTURE",), "ADVENTURE"),
        ("Quiet cafes and museums.", ("adventure",), None),
        ("Quiet cafes and museums.", (), None),
        ("Adventure and luxury resorts.", ("luxury", "adventure"), "luxury"),
    ],
)
def test_find_matched_preference(
    description: str, preference_values: tuple[str, ...], expected: str | None
) -> None:
    assert _find_matched_preference(description, preference_values) == expected


# ---------------------------------------------------------------------------
# _traveler_preference_values — every set field, nothing invented
# ---------------------------------------------------------------------------


def test_traveler_preference_values_collects_every_set_field() -> None:
    profile = TravelerProfileSummary(
        summary="s",
        reasoning="r",
        confidence=ConfidenceLevel.HIGH,
        travel_preference="adventure",
        budget_level="economy",
        accommodation_preference=None,
        transportation_preference="train",
        food_preferences=("vegetarian", "halal"),
        preferred_travel_language="en",
    )
    assert _traveler_preference_values(profile) == ("adventure", "economy", "train", "vegetarian", "halal")


def test_traveler_preference_values_is_empty_for_an_unset_profile() -> None:
    profile = TravelerProfileSummary(summary="s", reasoning="r", confidence=ConfidenceLevel.LOW)
    assert _traveler_preference_values(profile) == ()


# ---------------------------------------------------------------------------
# _score_and_rank — the core "personalized ranking" mechanism, in isolation
# ---------------------------------------------------------------------------


def test_score_and_rank_boosts_and_reorders_a_literal_preference_match() -> None:
    lower_score_match = _destination("Adventure City", "Known for extreme adventure activities.", 0.10)
    higher_score_no_match = _destination("Quiet Town", "Known for its quiet cafes.", 0.30)

    ranked = _score_and_rank((higher_score_no_match, lower_score_match), ("adventure",))

    assert [item.destination.name for item in ranked] == ["Adventure City", "Quiet Town"]
    assert ranked[0].rank == 1
    assert ranked[0].matched_preference == "adventure"
    assert "adventure" in ranked[0].relevance_reasoning.lower()
    assert ranked[1].rank == 2
    assert ranked[1].matched_preference is None


def test_score_and_rank_preserves_retrieval_order_when_no_preferences_are_saved() -> None:
    first = _destination("A", "A generic place.", 0.5, "DOC_A")
    second = _destination("B", "Another generic place.", 0.3, "DOC_B")

    ranked = _score_and_rank((first, second), ())

    assert [item.destination.name for item in ranked] == ["A", "B"]
    assert all(item.matched_preference is None for item in ranked)


def test_score_and_rank_caps_at_five_even_with_more_candidates() -> None:
    candidates = tuple(
        _destination(f"Place {i}", "Generic description.", float(i), f"DOC_{i}") for i in range(8)
    )

    ranked = _score_and_rank(candidates, ())

    assert len(ranked) == 5
    assert [item.destination.name for item in ranked] == [
        "Place 7",
        "Place 6",
        "Place 5",
        "Place 4",
        "Place 3",
    ]
    assert [item.rank for item in ranked] == [1, 2, 3, 4, 5]


def test_score_and_rank_with_no_destinations_returns_an_empty_tuple() -> None:
    assert _score_and_rank((), ("adventure",)) == ()


# ---------------------------------------------------------------------------
# Genuine composition — real TravelerProfileAgent + real DestinationIntelligenceAgent
# ---------------------------------------------------------------------------


async def test_reason_composes_real_profile_and_destination_agents(
    client: AsyncClient, db_session: AsyncSession, destination_agent: DestinationIntelligenceAgent
) -> None:
    """Queenstown's own curated description literally contains the word
    'adventure' — `TravelPreference.ADVENTURE`'s own `.value` — the one
    genuine, literal overlap in the current curated set (see
    `ai/agents/recommendation_agent.py`'s own docstring for why this is
    the deliberate mechanism, not a coincidence relied on silently)."""
    user_id = await _register_user(client)
    db_session.add(TravelerProfile(user_id=user_id, travel_preference=TravelPreference.ADVENTURE))
    await db_session.commit()
    agent, _ = _build_recommendation_agent(destination_agent, db_session, user_id)

    result = await agent.reason(_user_messages("Where should I go for adventure activities?"))

    assert isinstance(result, RecommendationList)
    assert len(result.recommendations) > 0
    assert all(
        item.destination.name in {document.title for document in CURATED_DESTINATIONS}
        for item in result.recommendations
    )
    top = result.recommendations[0]
    assert top.destination.name == "Queenstown, New Zealand"
    assert top.matched_preference == "adventure"
    assert top.rank == 1
    assert result.confidence == ConfidenceLevel.HIGH


async def test_reason_with_no_saved_preferences_is_not_personalized(
    client: AsyncClient, db_session: AsyncSession, destination_agent: DestinationIntelligenceAgent
) -> None:
    user_id = await _register_user(client)
    agent, _ = _build_recommendation_agent(destination_agent, db_session, user_id)

    result = await agent.reason(_user_messages("temples and gardens"))

    assert isinstance(result, RecommendationList)
    assert len(result.recommendations) > 0
    assert all(item.matched_preference is None for item in result.recommendations)
    assert result.confidence == ConfidenceLevel.MEDIUM
    assert any("not yet personalized" in note for note in result.uncertainty_notes)


async def test_reason_with_no_destination_match_returns_empty_and_low_confidence(
    client: AsyncClient, db_session: AsyncSession, destination_agent: DestinationIntelligenceAgent
) -> None:
    user_id = await _register_user(client)
    agent, _ = _build_recommendation_agent(destination_agent, db_session, user_id)

    result = await agent.reason(_user_messages("zzqxv nonsense gibberish query xkjq"))

    assert isinstance(result, RecommendationList)
    assert result.recommendations == ()
    assert result.confidence == ConfidenceLevel.LOW


async def test_reasoning_is_fixed_provenance_string_not_llm_output(
    client: AsyncClient, db_session: AsyncSession, destination_agent: DestinationIntelligenceAgent
) -> None:
    user_id = await _register_user(client)
    agent, _ = _build_recommendation_agent(
        destination_agent, db_session, user_id, reply="anything the model might say"
    )

    result = await agent.reason(_user_messages("temples and gardens"))

    assert isinstance(result, RecommendationList)
    assert "AGENTS-05's own retrieved destinations" in result.reasoning
    assert result.summary == "anything the model might say"


async def test_uncertainty_notes_carry_forward_the_destination_agents_own_notes(
    client: AsyncClient, db_session: AsyncSession, destination_agent: DestinationIntelligenceAgent
) -> None:
    user_id = await _register_user(client)
    db_session.add(TravelerProfile(user_id=user_id, travel_preference=TravelPreference.ADVENTURE))
    await db_session.commit()
    agent, _ = _build_recommendation_agent(destination_agent, db_session, user_id)

    result = await agent.reason(_user_messages("temples and gardens"))

    assert isinstance(result, RecommendationList)
    assert any("General descriptions only" in note for note in result.uncertainty_notes)
    # Personalized in this test (a preference was saved) — the
    # "not yet personalized" note must NOT appear.
    assert not any("not yet personalized" in note for note in result.uncertainty_notes)


async def test_facts_rendered_to_the_llm_include_rank_and_matched_preference(
    client: AsyncClient, db_session: AsyncSession, destination_agent: DestinationIntelligenceAgent
) -> None:
    user_id = await _register_user(client)
    db_session.add(TravelerProfile(user_id=user_id, travel_preference=TravelPreference.ADVENTURE))
    await db_session.commit()
    agent, provider = _build_recommendation_agent(destination_agent, db_session, user_id)

    await agent.reason(_user_messages("Where should I go for adventure activities?"))

    assert provider.received_messages is not None
    assert provider.received_messages[0].role == "system"
    facts_text = provider.received_messages[1].content
    assert "Queenstown" in facts_text
    assert "matches your saved preference: adventure" in facts_text


async def test_facts_rendered_to_the_llm_forbid_inventing_when_no_match(
    client: AsyncClient, db_session: AsyncSession, destination_agent: DestinationIntelligenceAgent
) -> None:
    user_id = await _register_user(client)
    agent, provider = _build_recommendation_agent(destination_agent, db_session, user_id)

    await agent.reason(_user_messages("zzqxv nonsense gibberish query xkjq"))

    assert provider.received_messages is not None
    facts_text = provider.received_messages[1].content
    assert "Do not name any destination." in facts_text


# ---------------------------------------------------------------------------
# End-to-end through a real AgentRegistry/Orchestrator
# ---------------------------------------------------------------------------


async def test_agent_registers_and_dispatches_through_the_real_orchestrator(
    client: AsyncClient, db_session: AsyncSession, destination_agent: DestinationIntelligenceAgent
) -> None:
    user_id = await _register_user(client)
    db_session.add(TravelerProfile(user_id=user_id, travel_preference=TravelPreference.ADVENTURE))
    await db_session.commit()
    agent, _ = _build_recommendation_agent(destination_agent, db_session, user_id)
    registry = AgentRegistry()
    registry.register(agent)
    orchestrator = Orchestrator(registry=registry)
    passthrough_provider = FakeLLMProvider(reply="should not be used")

    result = await orchestrator.dispatch(passthrough_provider, _user_messages("Please recommend for me"))

    assert result.decision.selected_agent == "recommendation-agent"
    assert _FAKE_REPLY in result.content
    assert passthrough_provider.received_messages is None  # raw provider never called
