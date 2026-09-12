"""Tool Service — public exports.

ADDED — ATLAS-P2-AGENTS-03. Registry + permission enforcement +
response validation + monitoring hooks for every tool a Core Agent
(`AGENTS-04` onward) may call. `knowledge_tools.py`'s
`build_knowledge_search_tool` is the first, and so far only, concrete
`Tool` — wiring `ai/rag/`'s Qdrant-backed retrieval in.
"""

from ai.tools.registry import DuplicateToolError, ToolRegistry
from ai.tools.service import ToolService
from ai.tools.types import Tool, ToolError, ToolNotFoundError, ToolPermissionError, ToolValidationError

__all__ = [
    "DuplicateToolError",
    "Tool",
    "ToolError",
    "ToolNotFoundError",
    "ToolPermissionError",
    "ToolRegistry",
    "ToolService",
    "ToolValidationError",
]
