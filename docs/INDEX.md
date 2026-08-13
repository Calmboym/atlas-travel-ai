# INDEX.md

**Document tier:** Living — updated as new feature areas are elaborated. This is the approved 2026-07-22 baseline (post Q1–Q4), not a frozen snapshot; changes only via `MASTER_RULES.md` §21.

> **PROPOSAL NOTE (2026-07-29):** Updates the existing `DESIGNSYS` entry only (adds `COMPONENT_OWNERSHIP_MATRIX.md` to its Docs list and fills its previously-missing `Related WBS` field). No entry duplicated, no other entry touched. PROPOSED, pending project owner approval.

**Purpose:** for any feature area, this is the complete — and only necessary — documentation list. A session working on `AUTH` should never need to open `TIMELINE`'s documents, and vice versa. Context-size estimates are rough (S = 1–2 short docs/sections, M = 3–5, L = 6–10, XL = the full Design Bible) — treat them as planning guidance, not a hard token count.

Design Bible numbers below follow the canonical index approved 2026-07-22 (Q1) — see `DESIGN_BIBLE_AMENDMENTS.md`, Amendment 001, for the full reconciliation and what it supersedes.

---

## LAND — Landing Page / Guest Entry

- **Docs:** PRD §6 (Guest Access Mode), 01 Brand Guidelines, 02 Product Vision, 26 Application Layout Guide §Marketing Layout, 19 Trip Planning Experience §Step 1 (Dream), 16 Onboarding Experience §Guest Experience/§Landing CTA
- **Components:** `HeroSection`, `AnimatedBackground`, `DestinationCarousel`, `AIQuickAccess` (COMPONENT_INVENTORY §Landing Page)
- **Backend:** none (guest mode is frontend + existing chat endpoint)
- **Related WBS:** ATLAS-P1-LAND-01…03
- **Est. context:** S

## AUTH — Authentication

- **Docs:** PRD §6–7, §13.13, ARCHITECTURE §12, GUIDELINES §11, 26 Application Layout Guide §Authentication Layout, 09 Accessibility §Forms/§Authentication, 14 Design Tokens Part 6 (Input/Button contracts)
- **Backend:** Authentication Service (ARCHITECTURE §7)
- **Related WBS:** ATLAS-P1-AUTH-01…08
- **Est. context:** M

## PROF — Basic Profile

- **Docs:** USER_FLOWS Flow 03, 16 Onboarding Experience §Progressive Profile Collection, 26 Application Layout Guide §Profile Page/§Profile Sections
- **Backend:** User Profile Service (ARCHITECTURE §7)
- **Related WBS:** ATLAS-P1-PROF-01…03
- **Est. context:** S

## CHAT — AI Chat / Conversation (Phase 1: single-model; Phase 2: multi-agent)

- **Docs:** 17 AI Experience (Communication Style, Streaming, AI Response Structure sections only for Phase 1), 26 Application Layout Guide §AI Chat, 09 Accessibility §AI Chat Accessibility, 08 Motion System §15 (AI Chat Motion), COMPONENT_INVENTORY §AI Components
- **Backend:** Conversation Manager Agent (basic, non-orchestrated for Phase 1) — ARCHITECTURE §7–8
- **Related WBS:** ATLAS-P1-CHAT-01…04
- **Est. context:** M

## MEM — Memory (Phase 1: temporary/basic only — long-term Memory Service is Phase 4)

- **Docs:** 17 AI Experience §Memory, PRD §7.13
- **Backend:** Memory Service (basic tier only) — ARCHITECTURE §7
- **Related WBS:** ATLAS-P1-MEM-01…02
- **Est. context:** S

## DASH — Dashboard

- **Docs:** 18 Dashboard Experience (full document — no self-declared dependencies, see Audit Finding 5), 26 Application Layout Guide §Dashboard, 21 Premium Microinteractions §Card/Navigation Interactions
- **Related WBS:** ATLAS-P1-DASH-01
- **Est. context:** M

## ONBOARD — Onboarding

- **Docs:** 16 Onboarding Experience (full document)
- **Related WBS:** folded into LAND + AUTH for Phase 1; no standalone WBS items yet
- **Est. context:** S

## TRIPPLAN — Trip Planning (Phase 2+, requires Core Agents)

- **Docs:** 19 Trip Planning Experience (full), 17 AI Experience §Itinerary Generation, 07 Psychology Guidelines §3/§6/§8/§13 (Hick's Law, Miller's Law, Progressive Disclosure, Decision Fatigue)
- **Backend:** Destination Intelligence Agent, Itinerary Planner Agent, Budget Agent (ARCHITECTURE §8)
- **Related WBS:** Phase 2 backlog
- **Est. context:** L

## TRIPDET — Trip Details

- **Docs:** 20 Trip Details Experience (full), 22 Travel Timeline Experience (dependency — see Audit Finding 1 for the cycle), 14 Design Tokens (Card/Timeline Detail Card contracts)
- **Related WBS:** Phase 2–3 backlog
- **Est. context:** L

## TIMELINE — Travel Timeline

- **Docs:** 22 Travel Timeline Experience (full), 05 Information Architecture, 06 User Flows, 04 Component Inventory §Trips, 14 Design Tokens (Timeline Component contract)
- **Related WBS:** Phase 2–3 backlog
- **Est. context:** L

## NOTIF — Notifications

- **Docs:** 23 Notification & Communication Experience (full), 11 Copywriting Guidelines, 10 Content Strategy
- **Related WBS:** Phase 3+ backlog (needs real events to notify on)
- **Est. context:** M

## AGENTS — AI Agent System (Phase 2)

- **Docs:** ARCHITECTURE §8, PRD §7.14, MASTER_BUILD_PROMPT §7–9, GUIDELINES §7–9
- **Related WBS:** Phase 2 backlog
- **Est. context:** L

## INTEG — External Integrations (Phase 3)

- **Docs:** ARCHITECTURE §11, ROADMAP Phase 3, GUIDELINES §13
- **Related WBS:** Phase 3 backlog
- **Est. context:** M per adapter

## DESIGNSYS — Design System / Tokens Implementation (cross-cutting, referenced by every module)

- **Docs:** 03 Design System, 14 Design Tokens (all 6 parts — but pull only the relevant Part per task, not the whole document; see Audit Finding 10), 04 Component Inventory, `COMPONENT_OWNERSHIP_MATRIX.md` (governance — **proposed**, pending approval)
- **Related WBS:** `ATLAS-P1-DESIGNSYS-01..04` (**proposed**, pending approval — see `DESIGNSYS_FOUNDATION_AUDIT_AND_WBS_PROPOSAL.md`, `DESIGNSYS_ARCHITECTURE_SPECIFICATION.md`). *Previously blank — this was the exact gap `MISSING_INFORMATION.md` flagged as "no single owning WBS task."*
- **Est. context:** M (if pulling one Part of Doc 14) / XL (if pulling the whole document — avoid)

## A11Y — Accessibility (cross-cutting)

- **Docs:** 09 Accessibility (full — it's short enough to read in full every time it's relevant)
- **Est. context:** S

## MOTION — Motion (cross-cutting)

- **Docs:** 08 Motion System, 21 Premium Microinteractions
- **Est. context:** S

---

## Cross-Reference: Feature Area → Design Bible Numbers Touched

| Feature Area | Bible docs |
|---|---|
| LAND | 01, 02, 16, 19, 26 |
| AUTH | 09, 14, 26 |
| PROF | 16, 26 |
| CHAT | 08, 09, 17, 26 |
| MEM | 17 |
| DASH | 18, 21, 26 |
| TRIPPLAN | 07, 17, 19 |
| TRIPDET | 14, 20, 22 |
| TIMELINE | 04, 05, 06, 14, 22 |
| NOTIF | 10, 11, 23 |

Any task touching more than one row above should still only load the specific docs listed for the rows it actually needs — not the union of everything ever associated with either area.

*(`COMPONENT_OWNERSHIP_MATRIX.md` is intentionally not added to this table — it's a `.ai/`-tier governance document, not a numbered Design Bible document, same tier as `MASTER_RULES.md` or `TASK_BOARD.md`.)*

---

**END OF DOCUMENT (this baseline)**

**LOCK STATUS:**
**LIVING — approved 2026-07-22 baseline. Future changes only via the governed End-of-Session Checklist in `MASTER_RULES.md` §21. The `DESIGNSYS` entry's `COMPONENT_OWNERSHIP_MATRIX.md` and `Related WBS` additions are PROPOSED (2026-07-29), pending project owner approval.**
