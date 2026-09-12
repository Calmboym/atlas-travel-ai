"""Tests for the base Agent contract and AgentOutputBase schema
(ATLAS-P2-AGENTS-02).

No concrete Core Agent exists yet (that's AGENTS-04 onward), so these
tests exercise `ai/agents/base.py` and `ai/schemas/base.py` directly
using a locally-defined `FakeCoreAgent` — matching `test_orchestrator.
py`'s own established pattern of a locally-defined fake rather than a
shared fixture module.

A `FakeIncompleteAgent` (a runtime_checkable Protocol-satisfying stub
missing required fields) is used only to prove `Agent`'s own
abstractness; it never runs any reasoning.
"""

from __future__ import annotations

from collections.abc import AsyncIterator

import pytest
from pydantic import BaseModel, ValidationError

from ai.agents.base import Agent
from ai.orchestrator import AgentRegistry
from ai.orchestrator.intent import classify_intent
from ai.orchestrator.types import AgentHandler
from ai.providers.base import LLMMessage, LLMProvider
from ai.schemas.base import AgentOutputBase, ConfidenceLevel


class FakeLLMProvider(LLMProvider):
    """Test double — never touches the network. Mirrors
    `test_orchestrator.py`'s `FakeLLMProvider`."""

    def __init__(self, reply: str = "unused by FakeCoreAgent") -> None:
        self._reply = reply
        self.received_messages: list[LLMMessage] | None = None

    @property
    def model_name(self) -> str:
        return "fake-model-for-tests"

    async def complete(self, messages: list[LLMMessage]) -> str:
        self.received_messages = messages
        return self._reply

    async def stream_complete(self, messages: list[LLMMessage]) -> AsyncIterator[str]:
        self.received_messages = messages
        yield self._reply


# Deliberately NOT built on AgentOutputBase — used to prove
# `render_output`'s non-AgentOutputBase JSON-dump fallback path.
class _PlainOutput(BaseModel):
    value: str


class FakeCoreAgent(Agent):
    """A complete, minimal concrete Agent — implements every one of
    the 7 ARCHITECTURE.md §8 fields plus `intents` and `reason()`."""

    FAKE_SYSTEM_PROMPT = "You are a fake agent used only in tests."

    def __init__(self, provider: LLMProvider, reply_output: BaseModel | None = None) -> None:
        super().__init__(provider, name="fake-core-agent", intents=("fake-intent",))
        self._reply_output = reply_output or AgentOutputBase(
            summary="Here is your answer.",
            reasoning="Because the test told me to say so.",
            confidence=ConfidenceLevel.HIGH,
        )

    @property
    def mission(self) -> str:
        return "Answer test questions predictably."

    @property
    def responsibilities(self) -> tuple[str, ...]:
        return ("Return a fixed, predictable output for tests.",)

    @property
    def allowed_tools(self) -> tuple[str, ...]:
        return ("fake-tool",)

    @property
    def input_schema(self) -> type[BaseModel]:
        return _PlainOutput

    @property
    def output_schema(self) -> type[BaseModel]:
        return type(self._reply_output)

    @property
    def reasoning_rules(self) -> tuple[str, ...]:
        return ("Never fabricate a price.",)

    @property
    def system_prompt(self) -> str:
        return self.FAKE_SYSTEM_PROMPT

    async def reason(self, messages: list[LLMMessage]) -> BaseModel:
        return self._reply_output


class FakeWrongReturnAgent(FakeCoreAgent):
    """Returns something that is NOT an instance of its own
    `output_schema` — proves `handle()`'s isinstance guard."""

    @property
    def output_schema(self) -> type[BaseModel]:
        return _PlainOutput  # declares _PlainOutput...

    async def reason(self, messages: list[LLMMessage]) -> BaseModel:
        # ...but returns an AgentOutputBase instead. Mismatch is
        # deliberate.
        return AgentOutputBase(summary="s", reasoning="r", confidence=ConfidenceLevel.LOW)


def _user_messages(*texts: str) -> list[LLMMessage]:
    return [LLMMessage(role="user", content=text) for text in texts]


# ---------------------------------------------------------------------------
# Agent — abstractness ("fails at import or instantiation time, not
# silently at runtime" — WORK_BREAKDOWN_STRUCTURE.md acceptance)
# ---------------------------------------------------------------------------


def test_agent_base_class_cannot_be_instantiated_directly() -> None:
    with pytest.raises(TypeError):
        Agent(FakeLLMProvider())  # type: ignore[abstract, call-arg]


def test_agent_subclass_missing_a_required_field_cannot_be_instantiated() -> None:
    """A Core Agent that skips a required field fails at instantiation
    time, not silently at runtime."""

    class IncompleteAgent(Agent):
        """Implements everything except `output_schema`."""

        @property
        def mission(self) -> str:
            return "x"

        @property
        def responsibilities(self) -> tuple[str, ...]:
            return ()

        @property
        def allowed_tools(self) -> tuple[str, ...]:
            return ()

        @property
        def input_schema(self) -> type[BaseModel]:
            return _PlainOutput

        # output_schema deliberately omitted

        @property
        def reasoning_rules(self) -> tuple[str, ...]:
            return ()

        @property
        def system_prompt(self) -> str:
            return "x"

        async def reason(self, messages: list[LLMMessage]) -> BaseModel:
            return _PlainOutput(value="unreachable")

    with pytest.raises(TypeError, match="output_schema"):
        IncompleteAgent(FakeLLMProvider(), name="incomplete", intents=())  # type: ignore[abstract]


def test_complete_agent_subclass_can_be_instantiated() -> None:
    agent = FakeCoreAgent(FakeLLMProvider())
    assert agent.name == "fake-core-agent"
    assert agent.intents == ("fake-intent",)


# ---------------------------------------------------------------------------
# Agent structurally satisfies AgentHandler (ai/orchestrator/types.py)
# ---------------------------------------------------------------------------


def test_agent_satisfies_agent_handler_protocol() -> None:
    agent = FakeCoreAgent(FakeLLMProvider())
    assert isinstance(agent, AgentHandler)


async def test_agent_registers_and_dispatches_through_the_real_orchestrator() -> None:
    """End-to-end proof that AGENTS-02's Agent needs zero changes to
    AGENTS-01's ai/orchestrator/ to be registered and dispatched to."""
    from ai.orchestrator import Orchestrator

    registry = AgentRegistry()
    agent = FakeCoreAgent(FakeLLMProvider())
    registry.register(agent)  # would raise if the Protocol shape didn't match

    orchestrator = Orchestrator(registry=registry)
    provider = FakeLLMProvider(reply="should not be used")

    result = await orchestrator.dispatch(provider, _user_messages("fake-intent please"))

    assert result.decision.selected_agent == "fake-core-agent"
    assert result.decision.is_passthrough is False
    assert "Here is your answer." in result.content
    # The raw provider must never have been called — the agent handled it.
    assert provider.received_messages is None


def test_classify_intent_matches_a_real_agent_instance() -> None:
    registry = AgentRegistry()
    agent = FakeCoreAgent(FakeLLMProvider())
    registry.register(agent)

    handler, decision = classify_intent(_user_messages("this has fake-intent in it"), registry)

    assert handler is agent
    assert decision.matched_intents == ("fake-intent",)


# ---------------------------------------------------------------------------
# Agent.handle() / stream_handle()
# ---------------------------------------------------------------------------


async def test_handle_calls_reason_and_renders_the_output() -> None:
    agent = FakeCoreAgent(FakeLLMProvider())
    content = await agent.handle(_user_messages("anything"))
    assert "Here is your answer." in content
    assert "Because the test told me to say so." in content


async def test_handle_raises_when_reason_returns_the_wrong_type() -> None:
    agent = FakeWrongReturnAgent(FakeLLMProvider())
    with pytest.raises(TypeError, match="_PlainOutput"):
        await agent.handle(_user_messages("anything"))


async def test_stream_handle_default_yields_one_chunk() -> None:
    agent = FakeCoreAgent(FakeLLMProvider())
    chunks = [chunk async for chunk in agent.stream_handle(_user_messages("anything"))]
    assert len(chunks) == 1
    assert "Here is your answer." in chunks[0]


# ---------------------------------------------------------------------------
# Agent.render_output()
# ---------------------------------------------------------------------------


def test_render_output_renders_agent_output_base_as_readable_text() -> None:
    agent = FakeCoreAgent(FakeLLMProvider())
    output = AgentOutputBase(
        summary="Lisbon fits your budget.",
        reasoning="It matched your mid-range accommodation preference.",
        confidence=ConfidenceLevel.MEDIUM,
        uncertainty_notes=("Current flight prices could not be verified.",),
    )

    rendered = agent.render_output(output)

    assert "Lisbon fits your budget." in rendered
    assert "It matched your mid-range accommodation preference." in rendered
    assert "Note: Current flight prices could not be verified." in rendered


def test_render_output_falls_back_to_json_for_non_agent_output_base_schemas() -> None:
    agent = FakeCoreAgent(FakeLLMProvider())
    rendered = agent.render_output(_PlainOutput(value="raw"))
    assert '"value"' in rendered
    assert "raw" in rendered


# ---------------------------------------------------------------------------
# Agent._with_system_prompt()
# ---------------------------------------------------------------------------


def test_with_system_prompt_prepends_this_agents_own_prompt() -> None:
    agent = FakeCoreAgent(FakeLLMProvider())
    messages = _user_messages("hello")

    result = agent._with_system_prompt(messages)

    assert result[0].role == "system"
    assert result[0].content == FakeCoreAgent.FAKE_SYSTEM_PROMPT
    assert result[1:] == messages
    # Original list must not be mutated.
    assert messages[0].role == "user"


# ---------------------------------------------------------------------------
# AgentOutputBase / ConfidenceLevel — real Pydantic validation
# ---------------------------------------------------------------------------


def test_agent_output_base_rejects_empty_summary() -> None:
    with pytest.raises(ValidationError):
        AgentOutputBase(summary="", reasoning="x", confidence=ConfidenceLevel.HIGH)


def test_agent_output_base_rejects_empty_reasoning() -> None:
    with pytest.raises(ValidationError):
        AgentOutputBase(summary="x", reasoning="", confidence=ConfidenceLevel.HIGH)


def test_agent_output_base_rejects_an_invalid_confidence_value() -> None:
    with pytest.raises(ValidationError):
        AgentOutputBase(summary="x", reasoning="y", confidence="extremely-sure")  # type: ignore[arg-type]


def test_agent_output_base_defaults_assumptions_and_uncertainty_notes_to_empty() -> None:
    output = AgentOutputBase(summary="x", reasoning="y", confidence=ConfidenceLevel.LOW)
    assert output.assumptions == ()
    assert output.uncertainty_notes == ()


def test_confidence_level_has_exactly_three_values() -> None:
    assert {member.value for member in ConfidenceLevel} == {"high", "medium", "low"}
