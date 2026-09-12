"""Static, curated knowledge base — ATLAS-P2-AGENTS-03.

ADDED — ATLAS-P2-AGENTS-03. The "static/curated knowledge sources"
`WORK_BREAKDOWN_STRUCTURE.md` scopes this task to (Q1 — "no live
external API calls"; this task's own acceptance: "no fabricated or
invented 'knowledge base' content — `BRAND_GUIDELINES.md` §13").

What is, and is not, curated here — stated plainly per this task's own
handoff obligation ("cited in this task's own handoff"):

- Every document below is **general, evergreen travel-preparation
  guidance** (packing, document safety, staying reachable, staying
  informed) of the kind found in any general travel guide — never a
  specific, falsifiable claim about a particular country, price,
  date, or current policy.
- None of it states a visa rule, an entry requirement, a price, an
  opening hour, or an availability claim — `GUIDELINES.md` §8 forbids
  fabricating exactly those categories, so this knowledge base simply
  does not contain them. Where a document touches a topic that DOES
  vary by destination and time (visas, vaccinations, entry rules), its
  own text explicitly tells the reader to verify with an official
  source rather than asserting a rule itself — see `DOC_VISA_CHECK`
  and `DOC_HEALTH_CHECK` below.
- Authored directly for this task, grounded in `PRD.md` §7.7's own
  instruction ("Visa information must rely on trusted sources. The AI
  must never invent immigration rules") and `AI_EXPERIENCE.md`'s own
  itinerary-generation checklist (`Travel tips`, `Potential risks`,
  `Packing`) — not sourced from, or attributed to, any specific
  external provider, which would misrepresent where it came from.
- `source_note` on every document says exactly this: general Atlas
  guidance, not a live or authoritative source, verify specifics
  independently.
"""

from __future__ import annotations

from pydantic import BaseModel, Field

_GENERAL_GUIDANCE_SOURCE_NOTE = (
    "General Atlas travel-preparation guidance, not sourced from any live "
    "or authoritative provider. For anything destination- or date-specific "
    "(prices, visas, availability), verify with an official source."
)


class CuratedDocument(BaseModel):
    """One entry in the static knowledge base."""

    id: str = Field(..., min_length=1)
    title: str = Field(..., min_length=1)
    text: str = Field(..., min_length=1)
    source_note: str = Field(..., min_length=1)


CURATED_DOCUMENTS: tuple[CuratedDocument, ...] = (
    CuratedDocument(
        id="DOC_PASSPORT_COPY",
        title="Keep a copy of your passport separate from the original",
        text=(
            "Photograph or photocopy the identification pages of your passport "
            "and store the copy separately from the original — in a different "
            "bag, or saved securely online. If the original is lost or stolen, "
            "a copy makes replacing it at an embassy or consulate considerably "
            "faster."
        ),
        source_note=_GENERAL_GUIDANCE_SOURCE_NOTE,
    ),
    CuratedDocument(
        id="DOC_POWER_ADAPTER",
        title="Bring the right power adapter for your destination",
        text=(
            "Plug shapes and standard voltage differ by country. A universal "
            "travel adapter covers most destinations; check whether your "
            "electronics also need a voltage converter, since an adapter alone "
            "only changes the plug shape, not the voltage."
        ),
        source_note=_GENERAL_GUIDANCE_SOURCE_NOTE,
    ),
    CuratedDocument(
        id="DOC_TRAVEL_INSURANCE",
        title="Consider travel insurance before you go",
        text=(
            "Travel insurance can cover trip cancellation, lost luggage, and "
            "medical emergencies abroad, which your regular health insurance "
            "may not cover once you leave your home country. Compare policies "
            "for what they actually include before relying on one."
        ),
        source_note=_GENERAL_GUIDANCE_SOURCE_NOTE,
    ),
    CuratedDocument(
        id="DOC_EMBASSY_REGISTRATION",
        title="Register your trip with your embassy",
        text=(
            "Many countries let citizens register an upcoming trip abroad with "
            "their embassy or consulate. Registering makes it easier for them "
            "to reach you in an emergency, a natural disaster, or a political "
            "disturbance at your destination."
        ),
        source_note=_GENERAL_GUIDANCE_SOURCE_NOTE,
    ),
    CuratedDocument(
        id="DOC_PACKING_BASICS",
        title="Pack for the weather and activities you actually have planned",
        text=(
            "Check the expected weather for your travel dates and pack "
            "layerable clothing rather than guessing. Bring any prescription "
            "medication in its original, labeled packaging, with enough "
            "supply to cover delays."
        ),
        source_note=_GENERAL_GUIDANCE_SOURCE_NOTE,
    ),
    CuratedDocument(
        id="DOC_CURRENCY_CASH",
        title="Carry a small amount of local cash and notify your bank",
        text=(
            "Not every business accepts cards, especially outside major "
            "cities, so carrying a small amount of local currency helps. "
            "Notify your bank or card issuer of your travel dates and "
            "destinations beforehand so a foreign transaction isn't flagged "
            "and blocked."
        ),
        source_note=_GENERAL_GUIDANCE_SOURCE_NOTE,
    ),
    CuratedDocument(
        id="DOC_VISA_CHECK",
        title="Always verify visa and entry requirements with an official source",
        text=(
            "Visa and entry requirements vary by nationality, destination, and "
            "purpose of travel, and they change over time. Before booking, "
            "verify current requirements directly with the destination "
            "country's official government or consular website — never rely "
            "on an assumption, a forum post, or an unverified summary."
        ),
        source_note=_GENERAL_GUIDANCE_SOURCE_NOTE,
    ),
    CuratedDocument(
        id="DOC_HEALTH_CHECK",
        title="Check destination-specific health guidance before you travel",
        text=(
            "Recommended or required vaccinations and health precautions vary "
            "by destination and change over time. Check with a travel health "
            "clinic or your country's official public-health travel advisories "
            "well before departure, rather than assuming no preparation is "
            "needed."
        ),
        source_note=_GENERAL_GUIDANCE_SOURCE_NOTE,
    ),
    CuratedDocument(
        id="DOC_CONNECTIVITY",
        title="Plan how you'll stay connected before you land",
        text=(
            "Decide in advance whether you'll use international roaming, a "
            "local SIM card, or an eSIM, and note that setting one up is "
            "usually easier before you depart than after you arrive with no "
            "signal."
        ),
        source_note=_GENERAL_GUIDANCE_SOURCE_NOTE,
    ),
    CuratedDocument(
        id="DOC_EMERGENCY_NUMBERS",
        title="Learn how to reach local emergency services after you arrive",
        text=(
            "Emergency phone numbers differ by country. After arriving, take "
            "a moment to note the local emergency number and the address and "
            "phone number of your accommodation, so you have them ready if "
            "you ever need them."
        ),
        source_note=_GENERAL_GUIDANCE_SOURCE_NOTE,
    ),
)
