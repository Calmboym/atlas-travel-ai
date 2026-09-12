"""Base Agent contract — ATLAS-P2-AGENTS-02.

ADDED — ATLAS-P2-AGENTS-02. Implements `ARCHITECTURE.md` §8's "Agent
Structure" ("Each agent contains: Mission, Responsibilities, Allowed
tools, Input schema, Output schema, Reasoning rules, System prompt")
and `MASTER_BUILD_PROMPT.md` §8 ("Every agent must have: Clear
responsibility. Defined input schema. Defined output schema. Tool
permissions. Error handling. Evaluation criteria. Separate prompt
file.") — the fields below are named exactly per ARCHITECTURE.md §8's
own 7-item list, per `WORK_BREAKDOWN_STRUCTURE.md`'s explicit
instruction for this task ("the exact 7 fields ARCHITECTURE.md §8
requires").

Deliberately does NOT itself define any concrete Core Agent — no
Traveler Profile / Destination / Budget / Itinerary / Recommendation
agent exists yet (those are `AGENTS-04` through `AGENTS-08`). This
module ships only the enforced contract every one of them will
implement, matching `ATLAS-P2-AGENTS-01`'s own precedent of shipping a
mechanism without anticipating a later task's content ("AGENTS-01
deliberately did not invent this 7-field contract itself, to avoid
anticipating this task's own scope").

Structurally satisfies `ai.orchestrator.types.AgentHandler` (`name`,
`intents`, `handle()`, `stream_handle()`) without importing from, or
modifying, `ai/orchestrator/` at all — see `Agent.__init__`'s own
docstring for why `name`/`intents` are constructor attributes rather
than `@property`s like the other 7 fields.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from collections.abc import AsyncIterator

from pydantic import BaseModel

from ai.providers.base import LLMMessage, LLMProvider
from ai.schemas.base import AgentOutputBase


class Agent(ABC):
    """The base contract every Core Agent (`AGENTS-04` onward) implements.

    Every abstract member below is a required field per `ARCHITECTURE.md`
    §8. Python's own `ABC` mechanism is the enforcement: a subclass that
    skips any one of them cannot be instantiated at all — it fails with
    `TypeError: Can't instantiate abstract class ... with abstract
    method(s) ...` the moment `SomeAgent(provider)` is called, not
    silently at runtime deep inside a request — satisfying this task's
    acceptance criterion directly (see `backend/tests/test_agent_base.py`
    for a test proving exactly this).

    A concrete agent is constructed with the `LLMProvider` it will use
    (`ai/providers/base.py` — never a provider SDK directly,
    `ARCHITECTURE.md` §2), plus its own `name` and `intents`. The
    Orchestrator's own `dispatch()`/`stream_dispatch()` call
    `handler.handle(messages)` / `handler.stream_handle(messages)` with
    no `provider` argument (`ai/orchestrator/orchestrator.py`) — each
    registered agent must therefore already hold the provider it needs,
    which is exactly what this constructor arranges.

    `name` and `intents` are constructor-provided instance attributes,
    not `@property`-based like the 7 fields below — deliberately.
    `ai.orchestrator.types.AgentHandler` (the Protocol
    `AgentRegistry.register()` requires) declares both as plain,
    settable attributes; mypy's structural check for `Protocol`
    members requires an implementing class's attribute to be settable
    to match one declared that way, and a read-only `@property` does
    not satisfy it (confirmed empirically: `mypy` flagged exactly this
    mismatch during this task's own verification). This task's own
    acceptance criteria require `Agent` to satisfy `AgentHandler`
    "without modifying `ai/orchestrator/` at all" — so the fix is here,
    not there. Requiring both as required keyword-only constructor
    arguments still gives the same "fails at construction time, not
    silently at runtime" guarantee as the abstract properties below: a
    subclass that forgets to pass either one gets an immediate
    `TypeError: missing ... required keyword-only argument`.
    """

    def __init__(self, provider: LLMProvider, *, name: str, intents: tuple[str, ...]) -> None:
        self._provider = provider
        self.name = name
        self.intents = intents

    # ------------------------------------------------------------------
    # The 7 required fields, ARCHITECTURE.md §8 (exact names)
    # ------------------------------------------------------------------

    @property
    @abstractmethod
    def mission(self) -> str:
        """One-sentence statement of what this agent exists to do."""
        raise NotImplementedError

    @property
    @abstractmethod
    def responsibilities(self) -> tuple[str, ...]:
        """The concrete things this agent is responsible for."""
        raise NotImplementedError

    @property
    @abstractmethod
    def allowed_tools(self) -> tuple[str, ...]:
        """Tool identifiers this agent may invoke.

        Consumed by `ai.tools.registry.ToolRegistry` (`AGENTS-03`) to
        enforce `GUIDELINES.md` §9 ("Agents must use approved tools
        only") and `MASTER_BUILD_PROMPT.md` §8 ("Agents must NOT:
        Access unauthorized tools"). Declared here, not imported from
        `ai/tools/` — that package does not exist until `AGENTS-03`,
        and this field is a plain tuple of string identifiers, not a
        reference to any tool object.
        """
        raise NotImplementedError

    @property
    @abstractmethod
    def input_schema(self) -> type[BaseModel]:
        """The Pydantic model describing this agent's structured input,
        beyond the raw `list[LLMMessage]` conversation history."""
        raise NotImplementedError

    @property
    @abstractmethod
    def output_schema(self) -> type[BaseModel]:
        """The Pydantic model `reason()` must return an instance of.

        Expected (not mechanically enforced by this base class beyond
        the `isinstance` check in `handle()` below) to subclass
        `ai.schemas.base.AgentOutputBase` — see that class's own
        docstring for why every Core Agent's output should carry
        `summary` / `reasoning` / `confidence` / `assumptions` /
        `uncertainty_notes`.
        """
        raise NotImplementedError

    @property
    @abstractmethod
    def reasoning_rules(self) -> tuple[str, ...]:
        """Human-readable constraints this agent's reasoning must
        follow (e.g. "Never state a specific price as fact" —
        `GUIDELINES.md` §8). Exposed for introspection, prompt
        construction, and testing; not machine-enforced by this base
        class, since enforcement depends on each agent's own domain
        logic.
        """
        raise NotImplementedError

    @property
    @abstractmethod
    def system_prompt(self) -> str:
        """This agent's system prompt.

        By convention (`GUIDELINES.md` §7 "Prompt Management": "System
        prompts must NOT be hardcoded inside application logic. Prompts
        must be stored separately"), concrete subclasses should return
        a constant imported from its own module under `ai/prompts/`
        (mirroring `ai/prompts/atlas_conversation_prompt.py`'s
        `ATLAS_SYSTEM_PROMPT` pattern) — never a string literal written
        inline inside this property or elsewhere in `ai/agents/`. This
        base class cannot mechanically enforce *where* the string was
        defined; the convention is documented here and demonstrated in
        `backend/tests/test_agent_base.py`.
        """
        raise NotImplementedError

    # ------------------------------------------------------------------
    # AgentHandler Protocol shape (ai/orchestrator/types.py)
    # ------------------------------------------------------------------
    #
    # `name` and `intents` are set in `__init__` above, not declared as
    # abstract properties here — see `__init__`'s own docstring for why.

    # ------------------------------------------------------------------
    # Domain reasoning — what each Core Agent actually implements
    # ------------------------------------------------------------------

    @abstractmethod
    async def reason(self, messages: list[LLMMessage]) -> BaseModel:
        """Produce a validated `self.output_schema` instance for this
        request.

        This is the one method each Core Agent (`AGENTS-04` onward)
        must implement — everything else on `Agent` (the 7 fields plus
        `handle()`/`stream_handle()` below) is shared machinery. How a
        subclass calls `self._provider` (structured/JSON mode, a
        parsing step, tool calls via `AGENTS-03`'s `ToolService`, RAG
        retrieval) is entirely up to that subclass; this base class
        makes no assumption about it, matching `AGENTS-01`'s own
        precedent of not anticipating a later task's scope.
        """
        raise NotImplementedError

    # ------------------------------------------------------------------
    # Shared machinery every subclass gets for free
    # ------------------------------------------------------------------

    def _with_system_prompt(self, messages: list[LLMMessage]) -> list[LLMMessage]:
        """Prepend this agent's own `system_prompt`.

        Mirrors `ai.agents.conversation_manager._with_system_prompt`'s
        exact pattern (prepend, never append or interpolate) rather
        than inventing a second convention — the only difference is
        which prompt is prepended (this agent's own, not Atlas's
        generic Phase 1 one). A concrete `reason()` implementation is
        expected to call this before sending messages to
        `self._provider`.
        """
        return [LLMMessage(role="system", content=self.system_prompt), *messages]

    def render_output(self, output: BaseModel) -> str:
        """Default structured-output-to-text rendering.

        If `output` is an `AgentOutputBase` (the expected, documented
        shape — see `output_schema`'s docstring), renders it as a short
        plain-text reply following `AI_EXPERIENCE.md` §AI Response
        Structure ("Direct answer -> Supporting explanation ->
        Recommendations -> Suggested next action"): the `summary` first,
        then `reasoning`, then any `uncertainty_notes` — each on its own
        line, never silently dropped. Any other `BaseModel` subclass
        falls back to a JSON dump, since this base class cannot know
        how to summarize an arbitrary schema in prose. Concrete agents
        are free to override this with a more tailored renderer once
        real UX requirements exist (`AGENTS-04` onward); this default
        keeps every Core Agent usable end-to-end (`AgentHandler.handle`
        must return `str`) even before one does.
        """
        if isinstance(output, AgentOutputBase):
            lines = [output.summary, output.reasoning]
            lines.extend(f"Note: {note}" for note in output.uncertainty_notes)
            return "\n\n".join(lines)
        return output.model_dump_json(indent=2)

    async def handle(self, messages: list[LLMMessage]) -> str:
        """Satisfies `ai.orchestrator.types.AgentHandler.handle`
        structurally — `Orchestrator.dispatch()` calls this with no
        `provider` argument, relying on the one passed to `__init__`.
        """
        output = await self.reason(messages)
        if not isinstance(output, self.output_schema):
            raise TypeError(
                f"{type(self).__name__}.reason() must return an instance of "
                f"{self.output_schema.__name__}, got {type(output).__name__}."
            )
        return self.render_output(output)

    async def stream_handle(self, messages: list[LLMMessage]) -> AsyncIterator[str]:
        """Satisfies `ai.orchestrator.types.AgentHandler.stream_handle`
        structurally.

        Default implementation: run `handle()` to completion and yield
        its result as a single chunk. Structured-output reasoning does
        not naturally decompose into meaningful partial-text chunks the
        way a raw text completion does (`conversation_manager.
        stream_reply`'s own contract) — a future Core Agent may
        override this for genuine incremental streaming once it has a
        concrete reason to (e.g. streaming a long itinerary section by
        section); no such agent exists yet, so this task does not
        invent that shape speculatively.
        """
        yield await self.handle(messages)
