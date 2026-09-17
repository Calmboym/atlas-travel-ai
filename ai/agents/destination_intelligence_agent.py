"""Destination Intelligence Agent — ATLAS-P2-AGENTS-05.

ADDED — ATLAS-P2-AGENTS-05. `ARCHITECTURE.md` §8's "Destination
Intelligence Agent — Purpose: Destination discovery and ranking" /
`PRD.md` §7.2's "Destination Recommendation Engine."

## A scope decision made and flagged prominently, not silently assumed

This task's own acceptance criterion requires every recommendation to
be "grounded in the retrieved static/curated set — no fabricated
destinations, weather, or facts." `AGENTS-03`'s existing curated
knowledge base (`ai/rag/knowledge_base.py`'s `CURATED_DOCUMENTS`)
contains **zero destination-specific content by design** — it was
deliberately scoped to general, evergreen travel-*preparation* guidance
(packing, documents, safety) specifically to avoid the fabrication risk
of asserting facts about particular places (`AGENTS-03`'s own
Verification Results explain this choice). Retrieving only from that
existing set would mean this agent could never actually name a
destination — a materially non-functional "Destination Intelligence
Agent."

Resolution: this task adds a **second, separate, small, explicitly
curated reference set of well-known, real destinations** — general,
durable, widely-documented characteristics only (what a place is
generally known for; a general climate pattern), **never** a specific
price, a specific current weather figure, a specific safety alert, or a
specific visa/entry rule (`GUIDELINES.md` §8's own forbidden
categories, unchanged). This reuses `AGENTS-03`'s own generic,
already-built RAG primitives exactly as designed to be reused —
`ai.rag.vector_store.QdrantKnowledgeStore`, `ai.rag.knowledge_base.
CuratedDocument`, `ai.rag.embeddings.EmbeddingProvider`, and
`ai.rag.schemas.RAGQuery`/`RAGSearchResult` are all generic,
not hardcoded to `AGENTS-03`'s own one collection — against a **new,
separate Qdrant collection** (`_DESTINATION_COLLECTION_NAME` below),
never touching `AGENTS-03`'s own `atlas_knowledge_base` collection or
any file under `ai/rag/`/`ai/tools/` (both outside this task's own
declared Allowed-files-to-modify). The `destination_search` tool
defined below intentionally duplicates `ai.tools.knowledge_tools.
build_knowledge_search_tool`'s small shape rather than importing and
parameterizing it, since that file is likewise outside this task's
scope to modify.

Every destination named anywhere in this file is real and well-known;
every characteristic given is a general, durable, widely-documented
fact (e.g. "Kyoto has many historic temples"), never a specific,
time-sensitive claim. This is the same standard `AGENTS-03`'s own
curated set held itself to, applied to a different content domain.

## The rest of the design, briefly

Only the free-text `summary` is LLM-authored, exactly matching
`AGENTS-04`'s own established pattern: the model is given a *fixed*
list of already-retrieved candidates and asked only to discuss them —
never asked to add a destination. `DestinationOption`s are built
entirely from retrieval results in Python, never parsed out of the
model's own text, so a hallucinated destination name in the model's
prose can never make it into the structured `destinations` field
returned to a caller.
"""

from __future__ import annotations

from pydantic import BaseModel
from qdrant_client import AsyncQdrantClient

from ai.agents.base import Agent
from ai.prompts.destination_intelligence_prompt import DESTINATION_INTELLIGENCE_SYSTEM_PROMPT
from ai.providers.base import LLMMessage, LLMProvider
from ai.rag.embeddings import EmbeddingProvider, HashingEmbeddingProvider
from ai.rag.knowledge_base import CuratedDocument
from ai.rag.schemas import RAGQuery, RAGSearchResult
from ai.rag.vector_store import QdrantKnowledgeStore
from ai.schemas.base import ConfidenceLevel
from ai.schemas.destination import DestinationOption, DestinationRecommendation
from ai.tools.service import ToolService
from ai.tools.types import Tool

DESTINATION_SEARCH_TOOL_NAME = "destination_search"

# A separate collection from AGENTS-03's own `DEFAULT_COLLECTION_NAME`
# ("atlas_knowledge_base") — this task never reads from or writes to
# that one.
_DESTINATION_COLLECTION_NAME = "atlas_destination_reference"

_NO_MATCHES_MESSAGE = (
    "No candidate destinations were found. Say in one short sentence that no "
    "good match was found in the current reference set, and suggest the "
    "traveler describe what they're looking for a little differently. Do not "
    "name any destination."
)

_PROVENANCE_REASONING = (
    "Selected from Atlas's curated destination reference set via retrieval; "
    "nothing beyond what was retrieved was added."
)

_VERIFY_SPECIFICS_NOTE = (
    "General descriptions only — current weather, prices, and entry "
    "requirements are not verified here and should be checked with official "
    "sources before booking."
)

# A minimum retrieval score below which a match is treated as noise, not a
# genuine candidate. Empirically derived (this task's own verification):
# `HashingEmbeddingProvider`'s crude token-overlap scoring occasionally
# produces small positive scores for queries sharing only common English
# words with a curated document's text, while genuinely relevant queries
# scored 0.12-0.47 against this reference set during testing. This is a
# real, documented limitation of a non-semantic embedding
# (`ai/rag/embeddings.py`'s own docstring), not something this agent can
# fully eliminate — filtering below this floor is a deliberate, honest
# mitigation, not a claim of perfect relevance detection.
_MIN_RELEVANCE_SCORE = 0.05

# General, durable, widely-documented characteristics of real, well-known
# destinations — never a specific price, current weather figure, safety
# alert, or visa rule. See this module's own docstring for why this
# curated set exists and how it was scoped.
CURATED_DESTINATIONS: tuple[CuratedDocument, ...] = (
    CuratedDocument(
        id="DEST_KYOTO_JAPAN",
        title="Kyoto, Japan",
        text=(
            "Kyoto is known for its many historic temples and shrines, traditional "
            "gardens, and preserved wooden machiya districts. It has four distinct "
            "seasons, with mild winters, hot and humid summers, and a well-known "
            "cherry blossom season in spring."
        ),
        source_note="General illustrative destination reference — see module docstring.",
    ),
    CuratedDocument(
        id="DEST_LISBON_PORTUGAL",
        title="Lisbon, Portugal",
        text=(
            "Lisbon is known for its hilltop viewpoints, historic yellow trams, "
            "coastal proximity, and Fado music tradition. It has a mild climate "
            "with warm, dry summers and generally mild winters."
        ),
        source_note="General illustrative destination reference — see module docstring.",
    ),
    CuratedDocument(
        id="DEST_REYKJAVIK_ICELAND",
        title="Reykjavik, Iceland",
        text=(
            "Reykjavik is known as a gateway to geothermal hot springs, dramatic "
            "natural landscapes, and northern lights viewing during winter months. "
            "It has a cool climate year-round with mild summers and cold, dark "
            "winters."
        ),
        source_note="General illustrative destination reference — see module docstring.",
    ),
    CuratedDocument(
        id="DEST_MARRAKECH_MOROCCO",
        title="Marrakech, Morocco",
        text=(
            "Marrakech is known for its historic medina and souks, traditional "
            "riads, and proximity to the Atlas Mountains. It has hot, dry summers "
            "and mild winters."
        ),
        source_note="General illustrative destination reference — see module docstring.",
    ),
    CuratedDocument(
        id="DEST_QUEENSTOWN_NEW_ZEALAND",
        title="Queenstown, New Zealand",
        text=(
            "Queenstown is known for adventure activities such as bungee jumping "
            "and skiing, alpine lake and mountain scenery, and nearby wine "
            "regions. Its seasons are opposite to the Northern Hemisphere, with "
            "warm summers and cold, often snowy winters."
        ),
        source_note="General illustrative destination reference — see module docstring.",
    ),
    CuratedDocument(
        id="DEST_CHIANG_MAI_THAILAND",
        title="Chiang Mai, Thailand",
        text=(
            "Chiang Mai is known for its historic Buddhist temples, surrounding "
            "mountain scenery, and a slower pace compared to Bangkok. It has a "
            "tropical climate with a distinct cooler season, a hot season, and a "
            "rainy season."
        ),
        source_note="General illustrative destination reference — see module docstring.",
    ),
    CuratedDocument(
        id="DEST_VANCOUVER_CANADA",
        title="Vancouver, Canada",
        text=(
            "Vancouver is known for its proximity to both mountains and ocean, "
            "outdoor recreation, and a diverse food scene. It has a mild "
            "temperate climate with wetter winters and drier summers."
        ),
        source_note="General illustrative destination reference — see module docstring.",
    ),
    CuratedDocument(
        id="DEST_CUSCO_PERU",
        title="Cusco, Peru",
        text=(
            "Cusco is known as a gateway to Machu Picchu, a blend of Incan and "
            "colonial architecture, and its high-altitude Andean setting. It has "
            "a dry season and a wet season, with cool temperatures due to "
            "elevation."
        ),
        source_note="General illustrative destination reference — see module docstring.",
    ),
)


async def build_destination_knowledge_store(
    client: AsyncQdrantClient, embedding_provider: EmbeddingProvider | None = None
) -> QdrantKnowledgeStore:
    """Build and populate the destination reference `QdrantKnowledgeStore`.

    Reuses `ai.rag.vector_store.QdrantKnowledgeStore` unmodified, bound
    to `_DESTINATION_COLLECTION_NAME` — a collection distinct from
    `AGENTS-03`'s own. Indexing is idempotent (`QdrantKnowledgeStore.
    index_documents`'s own docstring), so calling this more than once
    updates the same points rather than duplicating them.
    """
    store = QdrantKnowledgeStore(
        client,
        embedding_provider or HashingEmbeddingProvider(),
        collection_name=_DESTINATION_COLLECTION_NAME,
    )
    await store.index_documents(CURATED_DESTINATIONS)
    return store


def build_destination_search_tool(store: QdrantKnowledgeStore) -> Tool:
    """Build the `destination_search` `Tool`, bound to a given
    destination-reference `QdrantKnowledgeStore`.

    Deliberately mirrors `ai.tools.knowledge_tools.
    build_knowledge_search_tool`'s shape rather than importing and
    parameterizing it — `ai/tools/knowledge_tools.py` is outside this
    task's own declared scope to modify (see this module's own
    docstring).
    """

    async def _handle(arguments: BaseModel) -> BaseModel:
        assert isinstance(arguments, RAGQuery)
        passages = await store.search(arguments.query, top_k=arguments.top_k)
        return RAGSearchResult(query=arguments.query, passages=tuple(passages))

    return Tool(
        name=DESTINATION_SEARCH_TOOL_NAME,
        description=(
            "Search Atlas's curated destination reference set (a small, "
            "illustrative list of well-known destinations and their general "
            "characteristics). Does not know current prices, weather, "
            "availability, or visa rules."
        ),
        input_schema=RAGQuery,
        output_schema=RAGSearchResult,
        handler=_handle,
    )


def _latest_user_message(messages: list[LLMMessage]) -> str:
    """Mirrors `ai.orchestrator.intent._latest_user_message`'s own
    logic exactly (that function is private to its module, so this is
    a small, deliberate, documented duplication rather than an import
    of a private name)."""
    for message in reversed(messages):
        if message.role == "user":
            return message.content
    return ""


class DestinationIntelligenceAgent(Agent):
    """Discovers, ranks, and compares destinations, grounded entirely
    in retrieval from `CURATED_DESTINATIONS` via the `destination_search`
    tool — never from the model's own unconstrained knowledge.

    Constructed with a `ToolService` whose registry already has
    `destination_search` registered (typically via
    `build_destination_search_tool` + `build_destination_knowledge_store`
    above) — this agent does not know or care whether that `ToolService`
    is shared with other agents or dedicated to it.
    """

    def __init__(self, provider: LLMProvider, tool_service: ToolService) -> None:
        super().__init__(
            provider,
            name="destination-intelligence-agent",
            intents=("recommend a destination", "where should i go", "destination ideas"),
        )
        self._tool_service = tool_service

    @property
    def mission(self) -> str:
        return "Discover, rank, and compare destinations grounded in Atlas's curated reference set."

    @property
    def responsibilities(self) -> tuple[str, ...]:
        return (
            "Retrieve candidate destinations relevant to the traveler's request.",
            "Explain why each candidate destination was selected.",
            "Never present a destination, weather fact, or other detail not present "
            "in the retrieved reference set.",
        )

    @property
    def allowed_tools(self) -> tuple[str, ...]:
        return (DESTINATION_SEARCH_TOOL_NAME,)

    @property
    def input_schema(self) -> type[BaseModel]:
        return DestinationIntelligenceQuery

    @property
    def output_schema(self) -> type[BaseModel]:
        return DestinationRecommendation

    @property
    def reasoning_rules(self) -> tuple[str, ...]:
        return (
            "Never recommend a destination absent from the curated reference set.",
            "Never state a specific price, exact current weather, or a visa/entry rule.",
            "Always explain why each destination was selected.",
        )

    @property
    def system_prompt(self) -> str:
        return DESTINATION_INTELLIGENCE_SYSTEM_PROMPT

    async def reason(self, messages: list[LLMMessage]) -> BaseModel:
        query_text = _latest_user_message(messages)

        search_result = await self._tool_service.invoke(
            self, DESTINATION_SEARCH_TOOL_NAME, RAGQuery(query=query_text or "destination ideas", top_k=3)
        )
        assert isinstance(search_result, RAGSearchResult)

        destinations = tuple(
            DestinationOption(
                name=passage.title,
                description=passage.text,
                source_document_id=passage.document_id,
                relevance_score=passage.score,
            )
            for passage in search_result.passages
            if passage.score >= _MIN_RELEVANCE_SCORE
        )

        facts_text = self._render_facts(destinations)
        llm_messages = self._with_system_prompt([LLMMessage(role="user", content=facts_text)])
        raw_summary = await self._provider.complete(llm_messages)

        return DestinationRecommendation(
            summary=raw_summary.strip()
            or "I couldn't find a good match in my current destination references.",
            reasoning=_PROVENANCE_REASONING,
            confidence=self._compute_confidence(destinations),
            assumptions=(),
            uncertainty_notes=self._compute_uncertainty_notes(destinations),
            destinations=destinations,
        )

    @staticmethod
    def _render_facts(destinations: tuple[DestinationOption, ...]) -> str:
        if not destinations:
            return _NO_MATCHES_MESSAGE
        lines = [f"- {option.name}: {option.description}" for option in destinations]
        return "Candidate destinations:\n" + "\n".join(lines)

    @staticmethod
    def _compute_confidence(destinations: tuple[DestinationOption, ...]) -> ConfidenceLevel:
        if not destinations:
            return ConfidenceLevel.LOW
        if len(destinations) == 1:
            return ConfidenceLevel.MEDIUM
        return ConfidenceLevel.HIGH

    @staticmethod
    def _compute_uncertainty_notes(destinations: tuple[DestinationOption, ...]) -> tuple[str, ...]:
        if not destinations:
            return (
                "No candidate destinations matched this request in the current "
                "reference set.",
                _VERIFY_SPECIFICS_NOTE,
            )
        return (_VERIFY_SPECIFICS_NOTE,)


class DestinationIntelligenceQuery(BaseModel):
    """This agent's real input is the conversation `messages` `reason()`
    receives (the latest user message is used as the search query) —
    no additional structured input is required, so this is deliberately
    a fieldless placeholder, matching `AGENTS-04`'s own established
    pattern for the same situation."""
