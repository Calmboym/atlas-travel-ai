"""Tool contract — ATLAS-P2-AGENTS-03.

ADDED — ATLAS-P2-AGENTS-03. `ARCHITECTURE.md` §7's "Tool Service"
("External API calls / Validation / Caching / Monitoring") and
`GUIDELINES.md` §9's Tool Usage Rules.
"""

from __future__ import annotations

from collections.abc import Awaitable, Callable
from dataclasses import dataclass

from pydantic import BaseModel

ToolHandler = Callable[[BaseModel], Awaitable[BaseModel]]


@dataclass(frozen=True)
class Tool:
    """One callable capability a permitted `Agent` may invoke through
    `ai.tools.service.ToolService`.

    A plain `@dataclass`, not a `pydantic.BaseModel` — `handler` is a
    Python callable, not JSON-serializable request/response data (that
    is exactly what `input_schema`/`output_schema` are for).
    """

    name: str
    description: str
    input_schema: type[BaseModel]
    output_schema: type[BaseModel]
    handler: ToolHandler


class ToolError(Exception):
    """Base class for every error `ToolService` raises."""


class ToolNotFoundError(ToolError):
    """Raised when a tool name isn't registered in the `ToolRegistry`."""


class ToolPermissionError(ToolError):
    """Raised when an agent invokes a tool outside its own
    `allowed_tools` (`GUIDELINES.md` §9: "Agents must use approved
    tools only"; `MASTER_BUILD_PROMPT.md` §8: "Agents must NOT: Access
    unauthorized tools")."""


class ToolValidationError(ToolError):
    """Raised when a tool's input or output doesn't match its declared
    schema (`GUIDELINES.md` §9: "Validate tool responses... Never:
    Trust external responses without validation")."""
