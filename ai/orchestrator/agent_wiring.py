"""Chat-route agent wiring — ATLAS-P2-AGENTS-09.

ADDED — ATLAS-P2-AGENTS-09. Builds the concrete `AgentRegistry` a real
`/chat` request dispatches against — the one piece `AGENTS-01`'s own
docstring named explicitly as *not* its scope ("an agent registry
(empty until `AGENTS-04..08` populate it)"). `AGENTS-04` through
`AGENTS-08` each tested their own agent standalone, or through a
registry/orchestrator built fresh, locally, inside their own test file
— this module is the first place that wiring happens for real HTTP
traffic (`backend/app/services/chat_service.py`).

## Two tiers: process-wide singletons vs. per-request agents

Three of the five Core Agents — Destination Intelligence, Budget,
Itinerary Planner — hold no per-request state on `self` (confirmed by
inspecting each one's own module: none stores a `db` session or a
`user_id`; each `reason()` call is pure with respect to the `messages`
it receives). These three, plus the Destination Intelligence Agent's
own live `AsyncQdrantClient`/`QdrantKnowledgeStore`/`destination_search`
tool wiring, are built **once per process**
(`_get_static_agents`, guarded by an `asyncio.Lock` so two concurrent
first requests can't both start indexing `CURATED_DESTINATIONS` at
once) and reused for every request — avoiding re-indexing the
reference set into Qdrant on every single chat message, which
`QdrantKnowledgeStore.index_documents`'s own idempotency would
tolerate correctly but needlessly re-does real network I/O for. This
mirrors `app/core/ai.py`'s own `@lru_cache` singleton
`get_llm_provider()` — a process-wide provider was already the
established pattern this reuses, not a new one invented here.

The other two — Traveler Profile, Recommendation — are genuinely
per-request: `TravelerProfileAgent`/`RecommendationAgent`'s own
constructors bind a specific `db: AsyncSession` and `user_id`. See
`build_agent_registry`'s own docstring for how a guest request (no
resolvable `user_id`) is handled.

## A deliberate, scoped configuration compromise

The Qdrant connection URL is read directly from the `QDRANT_URL`
environment variable (falling back to `.env.example`'s own documented
default, `http://localhost:6333`) rather than threaded through
`ai.config.AIConfig` / `app.core.config.Settings` the way
`app/core/ai.py` does for `OPENAI_API_KEY` — the "correct," fully
consistent way to add this would touch `ai/config.py`,
`app/core/ai.py`, and `app/core/config.py`, none of which are in this
task's own Allowed-files-to-modify
(`backend/app/services/chat_service.py`, `backend/app/api/v1/chat.py`,
`ai/orchestrator/**` only — `WORK_BREAKDOWN_STRUCTURE.md`). Flagged
here explicitly, not silently done, as a real follow-up worth a small
dedicated task rather than expanded into here.

## Registration order and intent disambiguation

Registered in this fixed order: Traveler Profile, Destination
Intelligence, Budget, Itinerary Planner, Recommendation (then, for a
guest, only the middle three). `ai.orchestrator.intent.classify_intent`
is first-match-wins over `registry.agents` in registration order
(`AGENTS-01`'s own "intentionally simple" substring classifier); a
message whose words happen to satisfy two different agents' intent
phrases resolves to whichever is registered first, per that
classifier's own documented behavior — not a new ambiguity introduced
here. Checked directly (`grep -n "intents=" ai/agents/*.py`): no two
of the five agents' own declared intent phrases are literal substrings
of each other, so this only matters for a message containing pieces
of more than one agent's phrasing at once — an acknowledged limitation
of `AGENTS-01`'s own classifier, not something this task's ordering
choice can or should paper over.
"""

from __future__ import annotations

import asyncio
import os
import uuid

from qdrant_client import AsyncQdrantClient
from sqlalchemy.ext.asyncio import AsyncSession

from ai.agents.budget_agent import BudgetAgent
from ai.agents.destination_intelligence_agent import (
    DestinationIntelligenceAgent,
    build_destination_knowledge_store,
    build_destination_search_tool,
)
from ai.agents.itinerary_planner_agent import ItineraryPlannerAgent
from ai.agents.recommendation_agent import RecommendationAgent
from ai.agents.traveler_profile_agent import TravelerProfileAgent
from ai.orchestrator.registry import AgentRegistry
from ai.providers.base import LLMProvider
from ai.tools.registry import ToolRegistry
from ai.tools.service import ToolService

# See this module's own docstring, "A deliberate, scoped configuration
# compromise".
_QDRANT_URL = os.environ.get("QDRANT_URL", "http://localhost:6333")

_StaticAgents = tuple[DestinationIntelligenceAgent, BudgetAgent, ItineraryPlannerAgent]

_qdrant_client: AsyncQdrantClient | None = None
_static_agents: _StaticAgents | None = None
_build_lock = asyncio.Lock()


async def _build_static_agents(provider: LLMProvider) -> _StaticAgents:
    global _qdrant_client
    _qdrant_client = AsyncQdrantClient(url=_QDRANT_URL)
    store = await build_destination_knowledge_store(_qdrant_client)
    tool_registry = ToolRegistry()
    tool_registry.register(build_destination_search_tool(store))
    destination_agent = DestinationIntelligenceAgent(provider, ToolService(tool_registry))
    budget_agent = BudgetAgent(provider)
    itinerary_agent = ItineraryPlannerAgent(provider, destination_agent, budget_agent)
    return destination_agent, budget_agent, itinerary_agent


async def _get_static_agents(provider: LLMProvider) -> _StaticAgents:
    """Build (once per process) or return the three Core Agents that
    hold no per-request state — see this module's own docstring."""
    global _static_agents
    if _static_agents is not None:
        return _static_agents

    async with _build_lock:
        if _static_agents is not None:  # re-checked inside the lock
            return _static_agents
        _static_agents = await _build_static_agents(provider)
        return _static_agents


async def build_agent_registry(
    provider: LLMProvider,
    *,
    db: AsyncSession | None = None,
    user_id: uuid.UUID | None = None,
) -> AgentRegistry:
    """Build the `AgentRegistry` for one `/chat` request.

    Always includes the three static agents (Destination Intelligence,
    Budget, Itinerary Planner) — none need a traveler identity.
    Additionally includes Traveler Profile and Recommendation **only
    when both `db` and `user_id` are given**, since both require a
    real, saved traveler to read. `/chat` is deliberately unguarded
    (guest-mode AI Chat is locked product scope —
    `chat_service.py`'s own docstring); a guest request therefore gets
    three of the five Core Agents, an honest reflection of what is
    actually usable for someone with no saved profile to read — not a
    workaround, and not a degraded experience relative to what a guest
    already had (neither `TravelerProfileAgent` nor
    `RecommendationAgent` was reachable from `/chat` for anyone, guest
    or authenticated, before this task).
    """
    destination_agent, budget_agent, itinerary_agent = await _get_static_agents(provider)

    registry = AgentRegistry()
    if db is not None and user_id is not None:
        profile_agent = TravelerProfileAgent(provider, db, user_id)
        registry.register(profile_agent)
        registry.register(destination_agent)
        registry.register(budget_agent)
        registry.register(itinerary_agent)
        registry.register(RecommendationAgent(provider, profile_agent, destination_agent))
    else:
        registry.register(destination_agent)
        registry.register(budget_agent)
        registry.register(itinerary_agent)

    return registry


async def reset_for_tests() -> None:
    """Test-only hook: clears the process-wide static-agent cache and
    closes the cached Qdrant client, if any.

    Needed because `_static_agents` binds a specific `LLMProvider`
    instance at first build — correct for real production use (where
    `app.core.ai.get_llm_provider` is itself a permanent, `@lru_cache`d
    per-process singleton already, so this introduces no *new*
    staleness), but a test that overrides the provider per-test (per
    `tests/test_chat.py`'s own `_override_provider` convention) needs a
    way to force a rebuild against its own fake instance. Never called
    from application code — only from test fixtures.
    """
    global _qdrant_client, _static_agents
    if _qdrant_client is not None:
        await _qdrant_client.close()
    _qdrant_client = None
    _static_agents = None
