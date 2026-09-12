"""Tool registry — ATLAS-P2-AGENTS-03.

ADDED — ATLAS-P2-AGENTS-03. Mirrors
`ai.orchestrator.registry.AgentRegistry`'s established pattern
(dict-backed, a dedicated `Duplicate*Error` rather than a bare
`ValueError`, `get()` returns `None` rather than raising) instead of
inventing a second registry idiom in the same codebase.
"""

from __future__ import annotations

from ai.tools.types import Tool


class DuplicateToolError(ValueError):
    """Raised when two tools register under the same `name`."""


class ToolRegistry:
    """Holds every `Tool` available to be invoked via `ToolService`.

    Empty by construction — this task registers exactly one tool
    (`knowledge_search`, `ai/tools/knowledge_tools.py`) into an
    instance of this registry; it does not hardcode that tool as a
    special case here.
    """

    def __init__(self) -> None:
        self._tools: dict[str, Tool] = {}

    def register(self, tool: Tool) -> None:
        """Add a tool to the registry.

        Raises `DuplicateToolError` rather than silently overwriting —
        two tools accidentally sharing a `name` is a configuration bug
        that should fail loudly, not one silently shadowing the other.
        """
        if tool.name in self._tools:
            raise DuplicateToolError(f"A tool named '{tool.name}' is already registered.")
        self._tools[tool.name] = tool

    def get(self, name: str) -> Tool | None:
        """Look up a registered tool by name, or None if not found."""
        return self._tools.get(name)

    @property
    def tools(self) -> tuple[Tool, ...]:
        """All currently registered tools, in registration order."""
        return tuple(self._tools.values())

    def __len__(self) -> int:
        return len(self._tools)

    def __contains__(self, name: object) -> bool:
        return name in self._tools
