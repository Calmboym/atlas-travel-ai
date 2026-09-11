"""Tests for the AI Orchestrator core (ATLAS-P2-AGENTS-01).

Standalone unit tests — the Orchestrator is not wired into any FastAPI
route yet (that's AGENTS-09), so these tests exercise
`ai/orchestrator/` directly rather than going through `client`/HTTP,
unlike `test_chat.py`. They still live under `backend/tests/` (not a
new `ai/`-level test directory) because that's where `pyproject.toml`
points `pytest` (`testpaths = ["tests"]`, `pythonpath = [".."]`) and
where `conftest.py`'s autouse Postgres/Redis fixtures already live —
matching the one precedent for testing `ai/` code
(`test_chat.py`'s own `from ai.providers.base import ...`).

Uses a locally-defined `FakeLLMProvider`, matching `test_chat.py`'s own
established pattern (never touches the network) rather than extracting
a shared fixture module — no other test file shares one either.
"""

from collections.abc import AsyncIterator

import pytest
import structlog.testing

from ai.orchestrator import (
    AgentRegistry,
    DispatchDecision,
    DuplicateAgentError,
    Orchestrator,
)
from ai.orchestrator.intent import classify_intent
from ai.providers.base import LLMMessage, LLMProvider


class FakeLLMProvider(LLMProvider):
    """Test double — never touches the network. Mirrors
    `test_chat.py`'s `FakeLLMProvider` exactly."""

    def __init__(
        self,
        reply: str = "Rome is lovely in October — mild days, thinner crowds.",
        chunks: list[str] | None = None,
    ) -> None:
        self._reply = reply
        self._chunks = chunks if chunks is not None else []
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


class FakeAgent:
    """Test double satisfying the `AgentHandler` protocol structurally."""

    def __init__(
        self,
        name: str,
        intents: tuple[str, ...],
        reply: str = "handled by fake agent",
        chunks: list[str] | None = None,
    ) -> None:
        self.name = name
        self.intents = intents
        self._reply = reply
        self._chunks = chunks if chunks is not None else []
        self.received_messages: list[LLMMessage] | None = None

    async def handle(self, messages: list[LLMMessage]) -> str:
        self.received_messages = messages
        return self._reply

    async def stream_handle(self, messages: list[LLMMessage]) -> AsyncIterator[str]:
        self.received_messages = messages
        for chunk in self._chunks:
            yield chunk


def _user_messages(*texts: str) -> list[LLMMessage]:
    return [LLMMessage(role="user", content=text) for text in texts]


# ---------------------------------------------------------------------------
# AgentRegistry
# ---------------------------------------------------------------------------


def test_registry_starts_empty() -> None:
    registry = AgentRegistry()
    assert len(registry) == 0
    assert registry.agents == ()


def test_registry_register_and_get() -> None:
    registry = AgentRegistry()
    agent = FakeAgent(name="budget", intents=("budget", "cost"))

    registry.register(agent)

    assert len(registry) == 1
    assert registry.get("budget") is agent
    assert "budget" in registry
    assert registry.agents == (agent,)


def test_registry_rejects_duplicate_names() -> None:
    registry = AgentRegistry()
    registry.register(FakeAgent(name="budget", intents=("budget",)))

    with pytest.raises(DuplicateAgentError):
        registry.register(FakeAgent(name="budget", intents=("cost",)))


def test_registry_unregister_is_a_no_op_for_unknown_names() -> None:
    registry = AgentRegistry()
    registry.unregister("does-not-exist")  # must not raise
    assert len(registry) == 0


# ---------------------------------------------------------------------------
# classify_intent
# ---------------------------------------------------------------------------


def test_classify_intent_falls_back_when_registry_is_empty() -> None:
    handler, decision = classify_intent(_user_messages("Plan a trip to Japan"), AgentRegistry())

    assert handler is None
    assert decision.is_passthrough is True
    assert decision.selected_agent is None
    assert "empty" in decision.reasoning.lower()


def test_classify_intent_falls_back_when_no_user_message_present() -> None:
    registry = AgentRegistry()
    registry.register(FakeAgent(name="budget", intents=("budget",)))

    handler, decision = classify_intent(
        [LLMMessage(role="assistant", content="How can I help?")], registry
    )

    assert handler is None
    assert decision.is_passthrough is True
    assert "no user message" in decision.reasoning.lower()


def test_classify_intent_matches_a_registered_agent() -> None:
    registry = AgentRegistry()
    budget_agent = FakeAgent(name="budget", intents=("budget", "cost"))
    registry.register(budget_agent)

    handler, decision = classify_intent(
        _user_messages("What's my budget looking like for this trip?"), registry
    )

    assert handler is budget_agent
    assert decision.selected_agent == "budget"
    assert decision.is_passthrough is False
    assert decision.matched_intents == ("budget",)


def test_classify_intent_falls_back_when_nothing_matches() -> None:
    registry = AgentRegistry()
    registry.register(FakeAgent(name="budget", intents=("budget", "cost")))

    handler, decision = classify_intent(
        _user_messages("What's the weather like in Lisbon?"), registry
    )

    assert handler is None
    assert decision.is_passthrough is True
    assert "no registered agent" in decision.reasoning.lower()


def test_classify_intent_uses_only_the_latest_user_message() -> None:
    """An earlier user turn's keyword must not leak into a later,
    unrelated turn's classification."""
    registry = AgentRegistry()
    registry.register(FakeAgent(name="budget", intents=("budget",)))

    handler, decision = classify_intent(
        [
            LLMMessage(role="user", content="What's my budget for this trip?"),
            LLMMessage(role="assistant", content="Around €1,200 total."),
            LLMMessage(role="user", content="What's the weather like?"),
        ],
        registry,
    )

    assert handler is None
    assert decision.is_passthrough is True


# ---------------------------------------------------------------------------
# Orchestrator.dispatch — passthrough path (never bypasses LLMProvider)
# ---------------------------------------------------------------------------


async def test_dispatch_falls_back_to_conversation_manager_when_no_agent_matches() -> None:
    provider = FakeLLMProvider(reply="Around €80/night for a mid-range hotel in Lisbon.")
    orchestrator = Orchestrator()

    result = await orchestrator.dispatch(provider, _user_messages("Budget for a hotel?"))

    assert result.content == "Around €80/night for a mid-range hotel in Lisbon."
    assert result.decision.is_passthrough is True
    # Proves the passthrough path went through the real provider, not a
    # bypass — conversation_manager.generate_reply is the only thing
    # that sets received_messages on this fake.
    assert provider.received_messages is not None
    assert provider.received_messages[0].role == "system"


async def test_dispatch_same_behavior_as_phase_1_passthrough_for_ambiguous_request() -> None:
    """WORK_BREAKDOWN_STRUCTURE.md acceptance: 'an unrecognized/
    ambiguous request produces the same passthrough behavior Phase 1
    users already get.'"""
    from ai.agents import conversation_manager

    messages = _user_messages("Tell me something interesting.")
    provider_a = FakeLLMProvider(reply="same reply")
    provider_b = FakeLLMProvider(reply="same reply")

    orchestrator_result = await Orchestrator().dispatch(provider_a, messages)
    direct_result = await conversation_manager.generate_reply(provider_b, messages)

    assert orchestrator_result.content == direct_result
    assert provider_a.received_messages == provider_b.received_messages


# ---------------------------------------------------------------------------
# Orchestrator.dispatch — agent path
# ---------------------------------------------------------------------------


async def test_dispatch_routes_to_a_matching_registered_agent() -> None:
    registry = AgentRegistry()
    budget_agent = FakeAgent(
        name="budget", intents=("budget",), reply="Your budget looks healthy."
    )
    registry.register(budget_agent)
    orchestrator = Orchestrator(registry=registry)
    provider = FakeLLMProvider(reply="should not be used")

    result = await orchestrator.dispatch(
        provider, _user_messages("What's my budget for this trip?")
    )

    assert result.content == "Your budget looks healthy."
    assert result.decision.selected_agent == "budget"
    assert result.decision.is_passthrough is False
    # The agent handled it — the raw provider must never have been called.
    assert provider.received_messages is None
    assert budget_agent.received_messages is not None


# ---------------------------------------------------------------------------
# Orchestrator.stream_dispatch
# ---------------------------------------------------------------------------


async def test_stream_dispatch_passthrough_yields_provider_chunks() -> None:
    provider = FakeLLMProvider(chunks=["Ro", "me is ", "lovely."])
    orchestrator = Orchestrator()

    chunks = [
        chunk
        async for chunk in orchestrator.stream_dispatch(
            provider, _user_messages("Tell me about Rome.")
        )
    ]

    assert chunks == ["Ro", "me is ", "lovely."]


async def test_stream_dispatch_routes_to_a_matching_registered_agent() -> None:
    registry = AgentRegistry()
    budget_agent = FakeAgent(name="budget", intents=("budget",), chunks=["Your ", "budget."])
    registry.register(budget_agent)
    orchestrator = Orchestrator(registry=registry)
    provider = FakeLLMProvider(chunks=["should", "not", "appear"])

    chunks = [
        chunk
        async for chunk in orchestrator.stream_dispatch(
            provider, _user_messages("What's my budget?")
        )
    ]

    assert chunks == ["Your ", "budget."]
    assert provider.received_messages is None


# ---------------------------------------------------------------------------
# Logging — "every dispatch decision is logged with its reasoning,
# never silent" (WORK_BREAKDOWN_STRUCTURE.md acceptance)
# ---------------------------------------------------------------------------


async def test_dispatch_logs_the_decision_with_reasoning() -> None:
    provider = FakeLLMProvider()

    with structlog.testing.capture_logs() as captured:
        await Orchestrator().dispatch(provider, _user_messages("Plan my trip."))

    assert len(captured) == 1
    event = captured[0]
    assert event["event"] == "orchestrator_dispatch_decision"
    assert event["selected_agent"] is None
    assert event["is_passthrough"] is True
    assert isinstance(event["reasoning"], str) and event["reasoning"]


async def test_dispatch_logs_the_decision_even_when_an_agent_handles_it() -> None:
    registry = AgentRegistry()
    registry.register(FakeAgent(name="budget", intents=("budget",)))
    provider = FakeLLMProvider()

    with structlog.testing.capture_logs() as captured:
        await Orchestrator(registry=registry).dispatch(
            provider, _user_messages("What's my budget?")
        )

    assert len(captured) == 1
    assert captured[0]["selected_agent"] == "budget"
    assert captured[0]["is_passthrough"] is False


async def test_stream_dispatch_logs_the_decision_before_yielding() -> None:
    provider = FakeLLMProvider(chunks=["hi"])

    with structlog.testing.capture_logs() as captured:
        async for _ in Orchestrator().stream_dispatch(provider, _user_messages("Hello")):
            pass

    assert len(captured) == 1
    assert captured[0]["event"] == "orchestrator_dispatch_decision"


# ---------------------------------------------------------------------------
# DispatchDecision / OrchestratorResult value semantics
# ---------------------------------------------------------------------------


def test_dispatch_decision_is_passthrough_property() -> None:
    assert DispatchDecision(selected_agent=None, reasoning="x").is_passthrough is True
    assert DispatchDecision(selected_agent="budget", reasoning="x").is_passthrough is False
