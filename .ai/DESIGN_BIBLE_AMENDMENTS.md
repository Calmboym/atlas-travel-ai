# DESIGN_BIBLE_AMENDMENTS.md

**Status:** ACTIVE — new amendments are appended below; approved amendments are never edited or removed. A correction to an approved amendment is itself a new, separately-numbered amendment referencing it.
**Purpose:** the 26 Design Bible source documents are immutable (`WORKFLOW.md`). This file is the only sanctioned mechanism for correcting or extending them. It supersedes specific passages without touching the original files. Every future session treats "original document + any amendment referencing it" as the combined source of truth, per `DEVELOPMENT_EXECUTION_PLAN.md` §2.

> **UPDATE (2026-08-13):** Amendments 004 and 005 below are now APPROVED by the project owner, as part of the Bootstrap Reconciliation pass — see each amendment's own status line and the Log table at the end of this document.

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

## Amendment 004 — Dark Theme Semantic Token Values

**Status:** APPROVED
**Approved:** 2026-08-13, by project owner, as part of the Bootstrap Reconciliation pass.
**Amends:** `DESIGN_TOKENS.md` §"Semantic Color Mapping (Light Theme)" — which, despite its own claim that "every semantic token supports... Dark Theme," never actually published one. The values below are now that dark theme mapping.
**Reference:** `ATLAS-P1-DESIGNSYS-01` implementation session, 2026-07-29 (`HANDOFF_SUMMARY.md`, Finding 3) — Dark theme was implemented as a mechanism with Light-theme values as an explicit, flagged placeholder, precisely because no approved values existed to use instead. That placeholder status is now resolved by this approval; the implementation (`app/globals.css`, `[data-theme="dark"]` block) is updated to use the values below as final, not placeholder, values as part of this same reconciliation pass.

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

**Applied on approval:** the values above are now live in `frontend/app/globals.css`'s `[data-theme="dark"]` block, applied as part of the same Bootstrap Reconciliation pass that carried this approval (2026-08-13) — no longer Light-value placeholders.

---

## Amendment 005 — Secondary/Teal Superseded by Accent

**Status:** APPROVED
**Approved:** 2026-08-13, by project owner, as part of the Bootstrap Reconciliation pass.
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
| 004 | Dark Theme Semantic Token Values | Approved | 2026-08-13 |
| 005 | Secondary/Teal Superseded by Accent | Approved | 2026-08-13 |

**Next amendment number:** 006.

---

## Amendment 006 — Governance Baseline Approval (MASTER_RULES.md v1.2 et al.)

**Status:** APPROVED
**Approved:** 2026-08-13, by project owner, as part of the Bootstrap Reconciliation pass.
**Amends:** the PROPOSED status of `MASTER_RULES.md` v1.2 (§24 UI Component Ownership Governance, and the related §2/§18/§19 touches), `COMPONENT_OWNERSHIP_MATRIX.md` (in full, as a new canonical governance document), `CONVERSATION_STRATEGY.md` §7 (UI Component Governance Requirement), and `SESSION_PROMPT.md` step 6 (COMPONENT_OWNERSHIP_MATRIX.md read requirement) — all originally proposed 2026-07-29.

**Text of amendment:** all four documents above are now part of the approved governance baseline, exactly as drafted on 2026-07-29 — no content changes beyond removing "PROPOSED" framing and this amendment's own cross-reference. This reflects existing practice: `TASK_BOARD.md` had already been citing `COMPONENT_OWNERSHIP_MATRIX.md` as "Docs Used" for `DESIGNSYS-02` before this formal approval closed the gap between practice and documented status.

---

**LOG UPDATE**

| # | Title | Status | Date |
|---|---|---|---|
| 006 | Governance Baseline Approval (MASTER_RULES.md v1.2 et al.) | Approved | 2026-08-13 |

---

## Amendment 007 — Sidebar Width

**Status:** APPROVED
**Approved:** 2026-08-16, by project owner, Governance Reconciliation session (Q1).
**Amends:** `APPLICATION_LAYOUT_GUIDE.md` §Sidebar ("Collapsed width: 80px" implied 280px expanded via its own §Sidebar Behavior text), which conflicts with `DESIGN_TOKENS.md` Part 6 §Sidebar Contract ("Width: 300px").
**Reference:** `DESIGNSYS-03` implementation (`components/layout/sidebar.tsx`), which shipped 2026-08-15 using 300px/88px with the conflict logged inline per `MASTER_RULES.md`'s conflict-reporting rule, pending formal closure.

**Text of amendment:** `DESIGN_TOKENS.md` Part 6's values are authoritative: **expanded 300px (`18.75rem`), collapsed 88px (`5.5rem`)**. `APPLICATION_LAYOUT_GUIDE.md`'s 280px/80px figures are superseded. Rationale for resolving in favor of Design Tokens rather than the Layout Guide: Design Tokens is the more specific, component-contract-level source (`DESIGN_TOKENS.md` Part 6 exists specifically to be the single numeric source components implement against), and the shipped, tested implementation already uses it — reverting to 280px would mean discarding working, verified code to match the less specific document. No further action required in code; this amendment only formalizes what is already shipped.

---

## Amendment 008 — `/settings` Route Placement

**Status:** APPROVED
**Approved:** 2026-08-16, by project owner, Governance Reconciliation session (Q2).
**Amends:** `INFORMATION_ARCHITECTURE.md` (`/profile/settings` as a nested route under Profile), which conflicts with `APPLICATION_LAYOUT_GUIDE.md` §Application Sitemap (`Settings` listed as a top-level Dashboard sibling, not nested under Profile).
**Reference:** `DESIGNSYS-03` implementation (`components/layout/nav-items.ts`), which shipped 2026-08-15 using the top-level route with the conflict logged inline, pending formal closure.

**Text of amendment:** the top-level `/settings` route (`APPLICATION_LAYOUT_GUIDE.md`'s placement) is authoritative. `INFORMATION_ARCHITECTURE.md`'s `/profile/settings` nesting is superseded. Rationale: `APPLICATION_LAYOUT_GUIDE.md` is the more recent, implementation-adjacent document (Document 26, written after Document 05) and is the one `nav-items.ts` was built against; the shipped, tested navigation already uses the top-level route. No further action required in code; this amendment only formalizes what is already shipped.

---

## Amendment 009 — Task-Execution & Incremental-Delivery Governance

**Status:** APPROVED
**Approved:** 2026-08-16, by project owner, Governance Reconciliation session (§§8–25 of that session's instructions).
**Amends:** adds new governance surface area that did not exist before this session — not a correction to a prior document, but recorded here per the same log/approval mechanism Amendment 006 established for governance-baseline (not strictly Design-Bible) changes.

**Text of amendment:** the following are now part of the approved governance baseline:

1. **`.ai/INFRASTRUCTURE_BASELINE.md`** (new canonical document) — the verified infrastructure inventory for routing, i18n, providers, tokens→CSS, test setup, lint/typing, CI, and backend baseline after Bootstrap + DESIGNSYS-01–04.
2. **`COMPONENT_OWNERSHIP_MATRIX.md` §3 (Foundation Component Matrix), corrected** — ~24 of ~33 rows previously read "Not built" for components DESIGNSYS-02 had already shipped on 2026-07-29; every row is now verified against the actual source file, with a Source File column added. See that document's own note for detail. This is a factual correction, not a new approval of the document's authority (which Amendment 006 already granted).
3. **Incremental task-output model** (`MASTER_RULES.md` new §25) — a task's delivered ZIP contains only files it created or modified, plus mandatory state-file updates; not the full repository.
4. **Targeted-reading / dependency-resolution procedure** (`SESSION_PROMPT.md`, revised steps) — after the five mandatory files, a session resolves its assigned task's dependencies and consults `COMPONENT_OWNERSHIP_MATRIX.md` / `INFRASTRUCTURE_BASELINE.md` before reading anything else, and reads only what those two identify as relevant.
5. **Parallel-execution criteria** (`CONVERSATION_STRATEGY.md` §1, cross-referenced with `WORK_BREAKDOWN_STRUCTURE.md`'s dependency graph) — formalized as: two tasks may run in separate sessions when neither's declared dependencies include the other and their `Allowed Files to Modify` lists don't overlap.
6. **CI now runs the frontend test suite** (`.github/workflows/ci.yml`) — previously lint/typecheck/build only; 155 tests existed but never gated the pipeline.
7. **Archival-document handling** — `ATLAS-BOOTSTRAP-IMPLEMENTATION-REPORT.md` and `ATLAS-CONTINUATION-HANDOFF.md` are relabeled ARCHIVAL / NON-CANONICAL (their still-relevant facts folded into `INFRASTRUCTURE_BASELINE.md`, `PROJECT_STATE.md`, and this file); `MASTER_RULES.md` §14's "no standalone report files" rule is unchanged and now has these two grandfathered exceptions explicitly marked, not silently ignored.
8. **DESIGNSYS-01 through DESIGNSYS-04 are formally declared complete** — a closed Foundation layer; future feature tasks consume it and must not re-implement any part of it (`MASTER_RULES.md` new §20 cross-reference).

---

**LOG UPDATE**

| # | Title | Status | Date |
|---|---|---|---|
| 007 | Sidebar Width | Approved | 2026-08-16 |
| 008 | `/settings` Route Placement | Approved | 2026-08-16 |
| 009 | Task-Execution & Incremental-Delivery Governance | Approved | 2026-08-16 |

**Next amendment number:** 010.
