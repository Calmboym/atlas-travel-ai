"""Recommendation Agent — ATLAS-P2-AGENTS-08.

ADDED — ATLAS-P2-AGENTS-08. `ARCHITECTURE.md` §8's "Recommendation
Agent — Purpose: Personalized ranking" / `PRD.md` §7.14's
"Recommendation Engine Agent."

## Composition, not independent generation

This task's own scope is explicit: "personalized ranking, consuming
Traveler Profile (`AGENTS-04`) and Destination Intelligence
(`AGENTS-05`) output." `RecommendationAgent` is therefore constructed
with **actual instances** of `TravelerProfileAgent` and
`DestinationIntelligenceAgent` and calls their own `reason()` methods
directly during its own `reason()` — the same real agent-to-agent
composition `AGENTS-07`'s `ItineraryPlannerAgent` established, applied
here to a different pair of agents. `Recommendation.destination`
(`ai/schemas/recommendation.py`) holds the literal `DestinationOption`
object `AGENTS-05`'s own call returns, unmodified.

## "Personalized ranking" without inventing a fit assessment

`PSYCHOLOGY_GUIDELINES.md` §13 (Decision Fatigue) is explicit: "Instead
of 100 hotels Recommend Top 5. Explain why." — and every recommendation
must explain its own relevance (`AI_EXPERIENCE.md` §Explainability,
§Recommendations: "explain why they are relevant... Avoid generic
suggestions"). With no live pricing, availability, or semantic
place-matching infrastructure (Phase 3+ scope), this agent cannot
honestly claim a destination genuinely *suits* a traveler's stated
style — asserting that would be exactly the kind of invented fact
`GUIDELINES.md` §8 forbids, extended from "never invent availability"
to "never invent a fit assessment this agent has no way to verify."

The mechanism chosen instead is deliberately narrow and mechanical:
`_find_matched_preference` checks whether the traveler's own saved
preference value (e.g. `"adventure"`, from `TravelerProfileSummary`,
itself a direct, unmodified pass-through of the traveler's saved row
per `AGENTS-04`'s own docstring) appears as a literal, case-insensitive
**substring** of a candidate destination's own retrieved description.
This is a real, verifiable textual overlap — not an inferred semantic
judgment — and is disclosed as exactly that in both
`Recommendation.matched_preference`/`.relevance_reasoning` and this
agent's own system prompt ("never claim a recommendation matches...
unless the message explicitly says so"). Ranking combines this
bounded, fixed boost (`_PREFERENCE_MATCH_BOOST`) with `AGENTS-05`'s own
grounded retrieval `relevance_score`; a stable sort means that when no
preference data exists at all, the result is exactly the destination
agent's own retrieval order, unchanged — this agent never claims
personalization it cannot support.

Note this real, current limitation, stated rather than left implicit:
of the six destinations in `AGENTS-05`'s own curated reference set
(`CURATED_DESTINATIONS`), only Queenstown's own description contains
the literal word "adventure" — the one `TravelPreference` enum value
(`app.models.traveler_profile.TravelPreference`) that happens to
appear verbatim in this small, illustrative set's text today. This is
not a special case hardcoded for that destination; it is the same
generic, mechanical check applied to every candidate and every
structured preference field — it simply has few opportunities to fire
against six short, hand-written descriptions. A larger destination
reference set (Phase 3+) would surface more genuine matches without
any change to this mechanism.

## Curated, never exhaustive

`_MAX_RECOMMENDATIONS = 5` — chosen to match `PSYCHOLOGY_GUIDELINES.md`
§13's own wording ("Recommend Top 5") exactly, not an arbitrary round
number. `AGENTS-05`'s own retrieval already returns at most 3
candidates (its own `top_k=3`), so this ceiling does not currently
bind — but it is a real, mechanical guarantee this agent enforces
itself (`_score_and_rank` slices to it), not merely a limit that
happens to never be exceeded by an upstream default. This mirrors
`AGENTS-06`'s own precedent of Pydantic/code-enforcing a hard
acceptance gate rather than relying on another agent's current
behavior alone.

## The rest of the design, briefly

Only the free-text `summary` is LLM-authored, given a *fixed*,
already-ranked list of facts — exactly matching every other Phase 2
agent's established split between deterministic facts and bounded
prose synthesis. `reasoning` is a fixed, deterministic provenance
string, never model output.
"""

from __future__ import annotations

from pydantic import BaseModel

from ai.agents.base import Agent
from ai.agents.destination_intelligence_agent import DestinationIntelligenceAgent
from ai.agents.traveler_profile_agent import TravelerProfileAgent
from ai.prompts.recommendation_prompt import RECOMMENDATION_SYSTEM_PROMPT
from ai.providers.base import LLMMessage, LLMProvider
from ai.schemas.base import ConfidenceLevel
from ai.schemas.destination import DestinationOption, DestinationRecommendation
from ai.schemas.recommendation import Recommendation, RecommendationList
from ai.schemas.traveler_profile import TravelerProfileSummary

# PSYCHOLOGY_GUIDELINES.md §13's own wording: "Recommend Top 5." See
# this module's own docstring, "Curated, never exhaustive", for why
# this is a real enforced ceiling, not a documentation-only promise.
_MAX_RECOMMENDATIONS = 5

# A small, fixed, bounded boost — large enough to outrank a purely
# retrieval-based score difference within this reference set's own
# observed range (AGENTS-05's own docstring: "scored 0.12-0.47"), but
# never exposed to the traveler as a fabricated "match percentage" —
# it exists only to order `_score_and_rank`'s own internal sort.
_PREFERENCE_MATCH_BOOST = 0.5

_NO_CANDIDATES_MESSAGE = (
    "No candidate destinations were found to recommend. Say in one short sentence that "
    "no recommendations are available yet, and suggest the traveler describe what "
    "they're looking for. Do not name any destination."
)

_PROVENANCE_REASONING = (
    "Ranked from AGENTS-05's own retrieved destinations using AGENTS-04's own saved "
    "traveler preferences; any preference match is a literal, verifiable overlap with a "
    "destination's own description, never an inferred fit assessment."
)

_NO_PROFILE_UNCERTAINTY_NOTE = (
    "No saved travel preferences were found, so these recommendations are not yet "
    "personalized — save your travel preferences for more tailored results."
)


def _traveler_preference_values(profile: TravelerProfileSummary) -> tuple[str, ...]:
    """Every structured preference value the traveler has actually
    saved, as plain strings.

    Never inferred — a direct pass-through of `TravelerProfileSummary`'s
    own fields, which are themselves direct, unmodified pass-throughs
    of the traveler's saved `traveler_profiles` row (`AGENTS-04`'s own
    docstring). `memory_notes`/`preferred_travel_language` are
    deliberately excluded — free-text and language codes are not
    "travel style" characteristics a destination's own description
    would plausibly echo verbatim, unlike the four/five values below.
    """
    values: list[str] = []
    for value in (
        profile.travel_preference,
        profile.budget_level,
        profile.accommodation_preference,
        profile.transportation_preference,
    ):
        if value:
            values.append(value)
    values.extend(profile.food_preferences)
    return tuple(values)


def _find_matched_preference(description: str, preference_values: tuple[str, ...]) -> str | None:
    """The first traveler preference value that appears as a literal,
    case-insensitive substring of this destination's own description —
    or None.

    Deterministic and mechanical, and honest about exactly what it
    checks: a verifiable textual overlap, never a semantic "fit"
    judgment this agent has no data to actually make (see this
    module's own docstring, "'Personalized ranking' without inventing
    a fit assessment"). `preference_values` order (from
    `_traveler_preference_values`) determines which value wins if a
    description happens to contain more than one — a documented,
    deterministic tie-break, not an unspecified one.
    """
    lowered_description = description.lower()
    for value in preference_values:
        if value.lower() in lowered_description:
            return value
    return None


def _build_relevance_reasoning(destination: DestinationOption, matched_preference: str | None) -> str:
    """This item's own specific explanation — never a generic label
    (`PSYCHOLOGY_GUIDELINES.md` §15) — combining `AGENTS-05`'s own
    grounded retrieval score ("why this") with, only when genuinely
    found, a disclosed literal preference overlap ("why for me")."""
    reasoning = f"Retrieved as a relevant match for your request (relevance {destination.relevance_score:.2f})."
    if matched_preference is not None:
        reasoning += (
            f" Also mentions your saved preference for '{matched_preference}' directly in "
            f"its own description."
        )
    return reasoning


def _score_and_rank(
    destinations: tuple[DestinationOption, ...], preference_values: tuple[str, ...]
) -> tuple[Recommendation, ...]:
    """Curate and rank a short list of recommendations.

    Ranking combines each destination's own retrieval `relevance_score`
    (`AGENTS-05`'s own grounded score, unmodified) with
    `_PREFERENCE_MATCH_BOOST` for a real, literal preference match
    (never an inferred one). Python's `list.sort` is stable even with
    `reverse=True` (ties keep their original relative order), so when
    `preference_values == ()` — no traveler data at all — the result is
    exactly `AGENTS-05`'s own retrieval order, unchanged: this agent
    never manufactures a re-ranking it has no data to justify.

    Capped at `_MAX_RECOMMENDATIONS` — see this module's own docstring,
    "Curated, never exhaustive", for why this is a real ceiling this
    function enforces itself.
    """
    scored: list[tuple[float, DestinationOption, str, str | None]] = []
    for destination in destinations:
        matched_preference = _find_matched_preference(destination.description, preference_values)
        score = destination.relevance_score + (
            _PREFERENCE_MATCH_BOOST if matched_preference is not None else 0.0
        )
        reasoning = _build_relevance_reasoning(destination, matched_preference)
        scored.append((score, destination, reasoning, matched_preference))

    scored.sort(key=lambda item: item[0], reverse=True)

    return tuple(
        Recommendation(
            rank=rank,
            destination=destination,
            relevance_reasoning=reasoning,
            matched_preference=matched_preference,
        )
        for rank, (_, destination, reasoning, matched_preference) in enumerate(
            scored[:_MAX_RECOMMENDATIONS], start=1
        )
    )


class RecommendationQuery(BaseModel):
    """This agent's real input is the conversation `messages` `reason()`
    receives, forwarded as-is to the two agents it composes — no
    additional structured input is required, so this is deliberately a
    fieldless placeholder, matching every other Phase 2 agent's
    established pattern for the same situation."""


class RecommendationAgent(Agent):
    """Composes `TravelerProfileAgent` and `DestinationIntelligenceAgent`'s
    own outputs into a short, curated, ranked, and explained list of
    recommendations — never generating a destination or a fit
    assessment of its own that the two composed agents did not
    already, verifiably support."""

    def __init__(
        self,
        provider: LLMProvider,
        profile_agent: TravelerProfileAgent,
        destination_agent: DestinationIntelligenceAgent,
    ) -> None:
        super().__init__(
            provider,
            name="recommendation-agent",
            intents=(
                "recommend for me",
                "personalized recommendation",
                "top picks for me",
                "what do you recommend for me",
            ),
        )
        self._profile_agent = profile_agent
        self._destination_agent = destination_agent

    @property
    def mission(self) -> str:
        return "Curate and explain a short, personalized, ranked list of destination recommendations."

    @property
    def responsibilities(self) -> tuple[str, ...]:
        return (
            "Retrieve candidate destinations via the Destination Intelligence Agent.",
            "Retrieve the traveler's saved preferences via the Traveler Profile Agent.",
            "Rank a short, curated list — never an exhaustive one.",
            "Explain each recommendation's own relevance — never a generic label.",
        )

    @property
    def allowed_tools(self) -> tuple[str, ...]:
        # This agent never calls a tool directly — its two composed
        # agents each manage their own tool use (or lack of it),
        # matching AGENTS-07's own established precedent for a
        # composing agent.
        return ()

    @property
    def input_schema(self) -> type[BaseModel]:
        return RecommendationQuery

    @property
    def output_schema(self) -> type[BaseModel]:
        return RecommendationList

    @property
    def reasoning_rules(self) -> tuple[str, ...]:
        return (
            "Never recommend a destination absent from the Destination Intelligence "
            "Agent's own retrieval.",
            "A preference match must be a literal, verifiable overlap with the "
            "destination's own description — never an inferred or fabricated fit "
            "assessment.",
            "Never display more than a short, curated list (PSYCHOLOGY_GUIDELINES.md §13).",
            "Every recommendation states its own relevance reasoning — never a generic label.",
        )

    @property
    def system_prompt(self) -> str:
        return RECOMMENDATION_SYSTEM_PROMPT

    async def reason(self, messages: list[LLMMessage]) -> BaseModel:
        profile_result = await self._profile_agent.reason(messages)
        assert isinstance(profile_result, TravelerProfileSummary)
        destination_result = await self._destination_agent.reason(messages)
        assert isinstance(destination_result, DestinationRecommendation)

        preference_values = _traveler_preference_values(profile_result)
        recommendations = _score_and_rank(destination_result.destinations, preference_values)

        facts_text = self._render_facts(recommendations, preference_values)
        llm_messages = self._with_system_prompt([LLMMessage(role="user", content=facts_text)])
        raw_summary = await self._provider.complete(llm_messages)

        return RecommendationList(
            summary=raw_summary.strip() or "I don't have any recommendations to share yet.",
            reasoning=_PROVENANCE_REASONING,
            confidence=self._compute_confidence(recommendations),
            assumptions=(),
            uncertainty_notes=self._compute_uncertainty_notes(
                preference_values, destination_result.uncertainty_notes
            ),
            recommendations=recommendations,
        )

    @staticmethod
    def _render_facts(
        recommendations: tuple[Recommendation, ...], preference_values: tuple[str, ...]
    ) -> str:
        if not recommendations:
            return _NO_CANDIDATES_MESSAGE
        lines: list[str] = []
        for item in recommendations:
            line = f"- {item.rank}. {item.destination.name}: {item.destination.description}"
            if item.matched_preference is not None:
                line += f" (matches your saved preference: {item.matched_preference})"
            lines.append(line)
        header = (
            "Ranked recommendations:"
            if preference_values
            else "Ranked recommendations (no saved preferences yet):"
        )
        return header + "\n" + "\n".join(lines)

    @staticmethod
    def _compute_confidence(recommendations: tuple[Recommendation, ...]) -> ConfidenceLevel:
        if not recommendations:
            return ConfidenceLevel.LOW
        if any(item.matched_preference is not None for item in recommendations):
            return ConfidenceLevel.HIGH
        return ConfidenceLevel.MEDIUM

    @staticmethod
    def _compute_uncertainty_notes(
        preference_values: tuple[str, ...], destination_uncertainty_notes: tuple[str, ...]
    ) -> tuple[str, ...]:
        notes = list(destination_uncertainty_notes)
        if not preference_values:
            notes.append(_NO_PROFILE_UNCERTAINTY_NOTE)
        return tuple(notes)
