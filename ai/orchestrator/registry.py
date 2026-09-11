"""Agent registry — ATLAS-P2-AGENTS-01.

ADDED — ATLAS-P2-AGENTS-01.
"""

from __future__ import annotations

from ai.orchestrator.types import AgentHandler


class DuplicateAgentError(ValueError):
    """Raised when two agents register under the same `name`."""


class AgentRegistry:
    """Holds the set of agents the Orchestrator can dispatch to.

    Empty by construction — "an agent registry (empty until AGENTS-04..08
    populate it)" (WORK_BREAKDOWN_STRUCTURE.md, AGENTS-01 scope).
    AGENTS-01 ships this mechanism; it does not itself register any
    agent, since none exist yet (AGENTS-02 defines the base `Agent`
    contract; AGENTS-04 is the first task to register a real one).
    """

    def __init__(self) -> None:
        self._agents: dict[str, AgentHandler] = {}

    def register(self, handler: AgentHandler) -> None:
        """Add an agent to the registry.

        Raises `DuplicateAgentError` rather than silently overwriting —
        two agents accidentally sharing a `name` is a configuration bug
        that should fail loudly, not one silently shadowing the other.
        """
        if handler.name in self._agents:
            raise DuplicateAgentError(
                f"An agent named '{handler.name}' is already registered."
            )
        self._agents[handler.name] = handler

    def unregister(self, name: str) -> None:
        """Remove an agent by name. A no-op if it isn't registered."""
        self._agents.pop(name, None)

    def get(self, name: str) -> AgentHandler | None:
        """Look up a registered agent by name, or None if not found."""
        return self._agents.get(name)

    @property
    def agents(self) -> tuple[AgentHandler, ...]:
        """All currently registered agents, in registration order."""
        return tuple(self._agents.values())

    def __len__(self) -> int:
        return len(self._agents)

    def __contains__(self, name: object) -> bool:
        return name in self._agents
