"""Tool Service — ATLAS-P2-AGENTS-03.

ADDED — ATLAS-P2-AGENTS-03. Registry + permission enforcement +
response validation + monitoring for every tool a Core Agent
(`AGENTS-04` onward) may call, per `GUIDELINES.md` §9's Tool Usage
Rules ("Agents must: Use approved tools only. Validate tool
responses... Never: ... Trust external responses without validation")
and `MASTER_BUILD_PROMPT.md` §8 ("Agents must NOT: Access unauthorized
tools").
"""

from __future__ import annotations

import structlog
from pydantic import BaseModel

from ai.agents.base import Agent
from ai.tools.registry import ToolRegistry
from ai.tools.types import ToolNotFoundError, ToolPermissionError, ToolValidationError

logger = structlog.get_logger(__name__)


class ToolService:
    """The one path through which an `Agent` invokes a `Tool`.

    `invoke()`'s own control flow is the enforcement mechanism for this
    task's acceptance criterion ("no tool call reaches Qdrant or any
    other resource without passing permission + validation first"): a
    permission check happens before the tool is even looked up, then
    input validation happens before `tool.handler` is ever called, then
    output validation happens before a result is ever returned to the
    caller. Every outcome — denied, not found, invalid, or successful —
    is logged (monitoring hooks), matching
    `ai.orchestrator.orchestrator.Orchestrator._log_decision`'s own
    `structlog` event-name-plus-keyword-fields convention rather than
    introducing a differently-styled logging call inside `ai/`.
    """

    def __init__(self, registry: ToolRegistry) -> None:
        self._registry = registry

    async def invoke(self, agent: Agent, tool_name: str, arguments: BaseModel) -> BaseModel:
        """Invoke `tool_name` on behalf of `agent` with `arguments`.

        Raises `ToolPermissionError`, `ToolNotFoundError`, or
        `ToolValidationError` — never silently returns a partial or
        unchecked result.
        """
        if tool_name not in agent.allowed_tools:
            logger.warning(
                "tool_invocation_denied",
                agent=agent.name,
                tool=tool_name,
                allowed_tools=agent.allowed_tools,
            )
            raise ToolPermissionError(
                f"Agent '{agent.name}' is not permitted to use tool '{tool_name}' "
                f"(allowed_tools={agent.allowed_tools})."
            )

        tool = self._registry.get(tool_name)
        if tool is None:
            logger.warning("tool_invocation_not_found", agent=agent.name, tool=tool_name)
            raise ToolNotFoundError(f"No tool named '{tool_name}' is registered.")

        if not isinstance(arguments, tool.input_schema):
            logger.warning(
                "tool_invocation_validation_failed",
                agent=agent.name,
                tool=tool_name,
                stage="input",
                expected=tool.input_schema.__name__,
                received=type(arguments).__name__,
            )
            raise ToolValidationError(
                f"Tool '{tool_name}' expects {tool.input_schema.__name__} input, "
                f"got {type(arguments).__name__}."
            )

        result = await tool.handler(arguments)

        if not isinstance(result, tool.output_schema):
            logger.warning(
                "tool_invocation_validation_failed",
                agent=agent.name,
                tool=tool_name,
                stage="output",
                expected=tool.output_schema.__name__,
                received=type(result).__name__,
            )
            raise ToolValidationError(
                f"Tool '{tool_name}' returned {type(result).__name__}, "
                f"expected {tool.output_schema.__name__}."
            )

        logger.info("tool_invocation_succeeded", agent=agent.name, tool=tool_name)
        return result
