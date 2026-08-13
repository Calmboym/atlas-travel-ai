# DESIGN_BIBLE_AMENDMENTS.md

**Status:** ACTIVE — new amendments are appended below; approved amendments are never edited or removed. A correction to an approved amendment is itself a new, separately-numbered amendment referencing it.
**Purpose:** the 26 Design Bible source documents are immutable (`WORKFLOW.md`). This file is the only sanctioned mechanism for correcting or extending them. It supersedes specific passages without touching the original files. Every future session treats "original document + any amendment referencing it" as the combined source of truth, per `DEVELOPMENT_EXECUTION_PLAN.md` §2.

> **PROPOSAL NOTE (2026-07-29):** Amendments 004 and 005 below are new. Both are **PROPOSED, not approved** — unlike 001–003, which were pure factual/organizational corrections (numbering, a cited-but-reversed dependency, a completion date), 004 in particular introduces genuinely new creative content (specific color values) that no one has actually decided yet. See each amendment's own status line; do not treat either as settled until the project owner approves it, the same way 001–003 required explicit sign-off before they took effect.

---

## Amendment 001 — Canonical Design Bible Numbering

**Status:** APPROVED
**Approved:** 2026-07-22, by project owner (Q1)
**Amends:** the numbering used across the 26 Design Bible documents' self-declared headers and cross-document "Dependencies" citations; supersedes the informal status note appended to `AI_EXPERIENCE.md`.
**Reference:** `DOCUMENTATION_AUDIT_REPORT.md`, Finding 2.

**Text of amendment:** the following numbering is canonical for all future references to the Design Bible, in documentation, code comments, and tooling:

```
01 Brand Guidelines                    14 Design Tokens
02 Product Vision                      15 Visual QA Guidelines
03 Design System                       16 Onboarding Experience
04 Component Inventory                 17 AI Experience
05 Information Architecture            18 Dashboard Experience
06 User Flows                          19 Trip Planning Experience
07 Psychology Guidelines               20 Trip Details Experience
08 Motion System                       21 Premium Microinteractions
09 Accessibility                       22 Travel Timeline Experience
10 Content Strategy                    23 Notification & Communication Experience
11 Copywriting Guidelines              24 Design QA Checklist
12 Responsive System                   25 Frontend Implementation Guidelines
13 Iconography & Illustration          26 Application Layout Guide
```

Specifically superseded wherever they appear in the original, unedited documents: the "03_DESIGN_PRINCIPLES.md" citations in `NOTIFICATION_COMMUNICATION_EXPERIENCE.md` and `TRIP_PLANNING_EXPERIENCE.md`; the "04_DESIGN_SYSTEM.md" citation in `PREMIUM_MICROINTERACTIONS.md`; the "07_COMPONENT_LIBRARY.md" citation in `TRAVEL_TIMELINE_EXPERIENCE.md`; the "08_CONTENT_STRATEGY.md" / "10_ACCESSIBILITY.md" swapped citations in `NOTIFICATION_COMMUNICATION_EXPERIENCE.md`; and the entire trailing status note in `AI_EXPERIENCE.md`. All are read as referring to the table above; original text is left untouched.

**Next available Design Bible slot:** 27.

---

## Amendment 002 — Trip Details ↔ Travel Timeline Dependency Correction

**Status:** APPROVED
**Approved:** 2026-07-22, by project owner (Q2)
**Amends:** the "Dependencies" header block of `TRAVEL_TIMELINE_EXPERIENCE.md` (Document 22).
**Reference:** `DOCUMENTATION_AUDIT_REPORT.md`, Finding 1; `DEPENDENCY_GRAPH.md` §3.

**Text of amendment:** Document 22's dependency on `20_TRIP_DETAILS_EXPERIENCE.md` is struck. The relationship is one-directional: **Document 20 depends on Document 22**, not the reverse — consistent with Document 20's own text ("The detailed behavior is defined in: 22_TRAVEL_TIMELINE_EXPERIENCE.md"). Document 22 may still be read alongside Document 20 as a related document, but no build, review, or planning process may treat Document 22 as blocked on Document 20.

---

## Amendment 003 — Design Bible Completion Supersession (Document 26)

**Status:** APPROVED
**Approved:** 2026-07-22, by project owner (Q3)
**Amends:** the closing statement of `FRONTEND_IMPLEMENTATION_GUIDELINES.md` (Document 25): *"With this document, the Atlas Design Bible (Documents 01–25) is considered complete and locked."*
**Reference:** `DOCUMENTATION_AUDIT_REPORT.md`, Finding 3.

**Text of amendment:** `APPLICATION_LAYOUT_GUIDE.md` (Document 26) is confirmed as a formally approved extension of the Design Bible. Document 25's closing statement is superseded: the Design Bible is 26 documents, complete and locked, as of this amendment. This does not retroactively fix Document 26's own missing Dependencies block or lock-status footer (see `DOCUMENTATION_AUDIT_REPORT.md`, Findings 4–5) — those gaps remain, noted, in the unedited original.

---

## Amendment 004 — Dark Theme Semantic Token Values (DRAFT PROPOSAL)

**Status:** PROPOSED — **not approved.** This is qualitatively different from Amendments 001–003: those corrected demonstrable factual/organizational errors; this one introduces new creative content (specific colors) nobody has decided yet. Presented as a technically-grounded starting point for Design/Accessibility/Product review, not as a fact about the product.
**Amends:** `DESIGN_TOKENS.md` §"Semantic Color Mapping (Light Theme)" — which, despite its own claim that "every semantic token supports... Dark Theme," never actually publishes one.
**Reference:** `ATLAS-P1-DESIGNSYS-01` implementation session, 2026-07-29 (`HANDOFF_SUMMARY.md`, Finding 3) — Dark theme was implemented as a mechanism with Light-theme values as an explicit, flagged placeholder, precisely because no real values existed to use instead.

**Derivation method (so this is reviewable and correctable, not a black box):** reuses only *already-approved* primitive values from `DESIGN_TOKENS.md`'s own palettes — no new hex codes anywhere. Backgrounds/surfaces map to the darkest neutrals; text inverts to the lightest; primary shifts lighter (400/300/200 instead of 500/600/700) with dark text on it, specifically to *avoid* repeating the still-open, borderline-failing 4.4988:1 white-on-primary-500 contrast from AUTH-01's own Finding 1 rather than carrying that same problem into a second theme. Every pair below was checked with the real relative-luminance formula, not estimated.

```
color-background        → neutral-950  (#020617)
color-surface            → neutral-900  (#0F172A)
color-surface-secondary  → neutral-800  (#1E293B)
color-surface-elevated   → neutral-800  (#1E293B)
color-text-primary       → neutral-50   (#F8FAFC)   19.28:1 vs background
color-text-secondary     → neutral-300  (#CBD5E1)   13.59:1 vs background
color-text-muted         → neutral-400  (#94A3B8)    7.87:1 vs background
color-text-disabled      → neutral-600  (#475569)   (intentionally low — disabled state)
color-border             → neutral-500  (#64748B)    3.75:1 vs surface (3:1 min)
color-divider             → neutral-700  (#334155)   (decorative, no minimum)
color-primary             → primary-400  (#5A97FF)
color-primary-hover       → primary-300  (#86B5FF)
color-primary-active      → primary-200  (#B8D3FF)
color-primary-tint        → primary-900  (#112A6F)
color-on-primary          → neutral-950  (#020617)    7.02:1 vs primary-400
color-success              → success-500 (#22C55E)    8.85:1 vs background
color-warning              → warning-500 (#F59E0B)    9.39:1 vs background
color-error                → error-500   (#EF4444)    5.36:1 vs background
color-error-strong         → error-400   (#F87171)    7.29:1 vs background
color-info                  → info-500    (#3B82F6)    5.48:1 vs background
color-focus-ring            → primary-400 (#5A97FF)   (aliases color-primary, same as Light)
color-selection              → primary-900 (#112A6F)
color-glass                  → rgb(15 23 42 / 65%)   (dark-tinted, not white — see note)
color-glass-border            → rgb(255 255 255 / 12%)
```

**Explicitly still open, not covered by this draft:** `color-accent` (dark) and `color-glass-highlight` (dark) weren't verified here — same open status as Light theme's own thin inferences (see `COMPONENT_OWNERSHIP_MATRIX.md`). Glass in dark mode needs its own real design pass — a white-tinted translucency (Light theme's approach) reads as a glow/haze over a dark background; the value above is a directionally-reasonable placeholder (dark-tinted instead of white-tinted, same 65% opacity), not a verified one.

**What happens on approval:** if approved as-is or with adjustments, a follow-up implementation task applies the final values to `apps/web/app/globals.css`'s `[data-theme="dark"]` block (currently Light-value placeholders per `ATLAS-P1-DESIGNSYS-01`'s own flagged gap) — not done automatically by this amendment itself.

---

## Amendment 005 — Secondary/Teal Superseded by Accent

**Status:** PROPOSED — evidence-based, no new values invented; still requires project-owner sign-off before treated as settled, consistent with how 001–003 worked.
**Amends:** `DESIGN_SYSTEM.md` §6, which names *"Secondary — Teal — Purpose: Discovery, Travel, Exploration"* as a brand color with no corresponding definition anywhere in `DESIGN_TOKENS.md`.
**Reference:** `ATLAS-P1-DESIGNSYS-01` implementation session, 2026-07-29 (`HANDOFF_SUMMARY.md`, Finding 4).

**Text of amendment:** `DESIGN_TOKENS.md`'s Accent Palette (`accent-50` through `accent-900`, anchored at `accent-500 = #12C48F`) already *is* a teal/emerald hue — and its documented purpose ("moments of delight... never the primary identity... under 10% of any screen") functionally overlaps with `DESIGN_SYSTEM.md` §6's description of Secondary/Teal almost exactly ("Discovery... Exploration," never primary). No second palette is needed. `DESIGN_SYSTEM.md` §6's "Secondary" row is superseded: Accent is the implemented realization of that brand intent. `color-secondary` does not exist and should not be added — anything that would have used it uses `color-accent` instead.

This is a naming/mapping correction using values that were already approved (Accent's palette, locked since `DESIGN_TOKENS.md`'s original approval) — unlike Amendment 004, nothing new is being invented here.

---

## Log

| # | Title | Status | Date |
|---|---|---|---|
| 001 | Canonical Design Bible Numbering | Approved | 2026-07-22 |
| 002 | Trip Details ↔ Travel Timeline Dependency Correction | Approved | 2026-07-22 |
| 003 | Design Bible Completion Supersession (Document 26) | Approved | 2026-07-22 |
| 004 | Dark Theme Semantic Token Values | **Proposed — draft, needs design review** | 2026-07-29 |
| 005 | Secondary/Teal Superseded by Accent | Proposed | 2026-07-29 |

**Next amendment number:** 006.
