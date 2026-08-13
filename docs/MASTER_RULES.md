# MASTER_RULES.md

**Project:** Atlas — AI Travel Platform
**Version:** 1.1
**Created:** 2026-07-22
**Status:** LOCKED (baseline) — Tier 2. Changed only via the Amendment History process in §23, never by freeform edit.
**Change frequency:** This file should almost never change. Amendments require your explicit approval and a version bump, logged in §23.

> **PROPOSAL NOTE (2026-07-29):** This version adds §24 and touches §2, §18, §19, §23 to register `COMPONENT_OWNERSHIP_MATRIX.md` as governing UI component ownership. Marked changes are **PROPOSED, not yet approved** — see §23. Everything else below is reproduced verbatim, unchanged, from the current locked baseline.

This is the permanent engineering constitution for every future Atlas implementation conversation. It synthesizes your Permanent Project Instructions, `GUIDELINES.md`, `ARCHITECTURE.md` §17, `DESIGN_SYSTEM.md`, and `FRONTEND_IMPLEMENTATION_GUIDELINES.md` into one file so no session has to reconstruct it from scratch.

---

## 1. Core Principle

Never make assumptions. If documentation exists, follow it. If documentation is missing, explicitly report what is missing instead of inventing new architecture. Never redesign completed systems. Never replace previously approved engineering decisions. Documentation is always the source of truth — conversation history is not project memory; this file and its four companions are.

---

## 2. Documentation Priority Order

1. `MASTER_RULES.md` (this file)
2. `PROJECT_STATE.md`
3. `TASK_BOARD.md`
4. `INDEX.md`
5. `WORK_BREAKDOWN_STRUCTURE.md`
6. **[PROPOSED]** `COMPONENT_OWNERSHIP_MATRIX.md` — for any task creating, modifying, or consuming a UI component
7. Relevant Design Bible documents (numbered per the canonical index in `DESIGN_BIBLE_AMENDMENTS.md`, Amendment 001 — approved 2026-07-22)
8. Relevant Architecture documents (`ARCHITECTURE.md`)
9. Relevant PRD sections (`PRD.md`)
10. Relevant API specifications
11. Relevant implementation guides (`GUIDELINES.md`, `FRONTEND_IMPLEMENTATION_GUIDELINES.md`)

If two documents conflict, **stop and report the conflict**. Do not choose one yourself — escalate per `DEVELOPMENT_EXECUTION_PLAN.md` §3.

---

## 3. Scope Control

Work ONLY on the assigned WBS Task. Never continue with future tasks automatically. Never modify unrelated modules. Never redesign architecture while implementing a feature. Never refactor code outside the requested scope, even if you spot a real problem — report it in the handoff instead.

---

## 4. Context Optimization

Read ONLY: `PROJECT_STATE.md`, `TASK_BOARD.md`, `INDEX.md`, `WORK_BREAKDOWN_STRUCTURE.md`, `MASTER_RULES.md`, documents referenced by `PROJECT_STATE.md`, and files required for the assigned WBS Task. Never scan unrelated documentation or source code. Minimize context usage at all times.

*(Deliberately left unconditional and unchanged — `COMPONENT_OWNERSHIP_MATRIX.md`'s read requirement is conditional on the task involving UI, per §2 item 6 and `SESSION_PROMPT.md`, not universal like the five files above. Forcing it into this unconditional list would make purely backend tasks read a file they gain nothing from.)*

---

## 5. Architecture Rules

Architecture is immutable unless you explicitly approve changes. Never change folder structure, rename modules, move features, replace frameworks, replace libraries, or introduce new technologies without explicit approval. Agents never bypass the AI Orchestrator; agents never access unauthorized tools or modify memory directly (`ARCHITECTURE.md` §8, `MASTER_BUILD_PROMPT.md` §8).

---

## 6. Backend & Frontend Engineering Standards

**Backend:** Python, FastAPI, type hints required, async where beneficial, modular services, proper error handling, migrations only (never manual production DB edits).
**Frontend:** TypeScript strict mode, no unnecessary `any`, reusable components, one clear responsibility per component, business logic lives in hooks/services — never in UI components or pages (`COMPONENT_INVENTORY.md` §Dependency Rule).
**Both:** production-quality code, readability and maintainability over cleverness, no duplicated logic, no temporary hacks, no hidden assumptions, follow existing project conventions.

---

## 7. UI / UX & Design System Rules

Always follow the Design System, Design Tokens, Accessibility documentation, and Motion documentation. Consistency outranks creativity. Never redesign an approved interface. Never invent a new visual style. No hardcoded colors, spacing, radius, shadows, durations, or z-index values — token references only (`DESIGN_TOKENS.md`, Part 5–6). No arbitrary Tailwind values except documented edge cases.

---

## 8. AI Rules

AI providers must remain provider-independent — never hardcode provider-specific logic. Every AI component must be replaceable. Agents communicate only through the Orchestrator. The system must never fabricate prices, availability, visa rules, or schedules; when uncertain, it says so.

---

## 9. External AI Tools & Skills Policy

When implementing frontend, UI, UX, design systems, animations, layouts, components, or user interactions, proactively determine whether available external AI tools, skills, or component libraries would improve quality.

Whenever appropriate, prefer leveraging: 21st.dev component generation, 21st.dev MCP, official Claude Skills, design-oriented Skills, frontend engineering Skills, UI/UX Skills, animation Skills, accessibility Skills.

Use them only when they improve quality, maintainability, consistency, or development speed. Never use external skills blindly — evaluate whether they benefit the current task. If a Skill would significantly improve the implementation, use it automatically, without requiring additional user instructions.

Generated code must always conform to: Atlas Design System, Design Tokens, Brand Guidelines, Accessibility Rules, Motion System, Performance Budgets, Engineering Standards. Never sacrifice consistency for generated components. If an external component conflicts with project standards, adapt it — don't replace project conventions.

---

## 10. Security Rules

Secure password storage, token expiration, OAuth security, session protection. Redis-based rate limiting on authentication, AI, and expensive endpoints. Every user input validated and sanitized. Prompt-injection detection on anything reaching an LLM. No secrets in code — environment variables only, never shared across environments. Never log passwords, tokens, passport numbers, or payment details.

---

## 11. Performance Rules

Targets (`DESIGN_SYSTEM.md` §37, `FRONTEND_IMPLEMENTATION_GUIDELINES.md` §Performance Budget):

| Metric | Target |
|---|---|
| First Contentful Paint | < 1.8s |
| Largest Contentful Paint | < 2.5s |
| Interaction to Next Paint | < 200ms |
| Cumulative Layout Shift | < 0.1 |
| Scrolling | 60 FPS, no dropped frames |

GPU-friendly animation properties only (`transform`, `opacity`). Lazy-load Three.js and heavy widgets. Virtualize long lists and long timelines.

---

## 12. Accessibility Rules

WCAG 2.2 AA minimum, mandatory, not optional. Every component: keyboard operable, screen-reader compatible, visible focus (never removed, never color-alone), 4.5:1 text contrast (3:1 large text/interactive), 44×44px minimum touch targets, `prefers-reduced-motion` respected, RTL/LTR compatible. Full detail: `ACCESSIBILITY.md` (09).

---

## 13. Testing Rules

Backend: unit + integration tests. Frontend: component + end-to-end tests (Playwright recommended). AI: agent-selection tests, output-quality tests, hallucination/regression tests. No feature is done without its tests.

---

## 14. Documentation Rules

- Never modify a previous (locked) document's body — corrections go through the amendment process in `DEVELOPMENT_EXECUTION_PLAN.md` §2, recorded in `DESIGN_BIBLE_AMENDMENTS.md`.
- New Design Bible documents continue the approved canonical numbering — next slot is **27** (per `DESIGN_BIBLE_AMENDMENTS.md`, Amendment 001).
- Every implementation session ends by updating `PROJECT_STATE.md` and `TASK_BOARD.md` — no exceptions.

---

## 15. Naming Conventions

Files: `lowercase-with-hyphens` (e.g. `destination-service.py`, `travel-profile.ts`). Functions: descriptive, verb-first (`calculate_trip_budget()`, not `calc()`). Classes: `PascalCase` (`TravelRecommendationService`). Components: descriptive, domain-driven (`TripTimeline`, `BudgetCard`) — never `Box1`, `Widget`, `ComponentX` (`FRONTEND_IMPLEMENTATION_GUIDELINES.md` §Naming Conventions).

---

## 16. Folder Structure Rules

Inherited from the Phase 0 delivered structure (`DEBUG_LOG.md` M0 record): monorepo with separate backend (`ai/`, `app/`) and frontend apps, `ai/{prompts,agents,schemas,evaluations}` for the AI layer, Docker Compose at the root. No further folder-structure decisions are made here — the first Phase 1 session that needs a new top-level directory reports it rather than inventing one silently.

---

## 17. Git Workflow

`main → development → feature branches`. Commit messages are descriptive (`add destination recommendation service`, not `update`).

---

## 18. Quality Gates — Universal Definition of Ready

A WBS Task may begin only when: its dependencies (per `WORK_BREAKDOWN_STRUCTURE.md`) are marked Done, the required documentation is confirmed available (not "probably somewhere"), the task fits in one conversation per `CONVERSATION_STRATEGY.md`, and no open Q-item in `PROJECT_STATE.md` blocks it.

## Quality Gates — Universal Definition of Done

A WBS Task is done only when: code is implemented and matches the Design Bible exactly (no reinterpretation), Design Tokens are used exclusively, the interface is fully responsive and accessible (WCAG 2.2 AA), performance budgets in §11 are met, error/loading/empty states are implemented, unit/component tests exist and pass, no TODOs or placeholders remain, `PROJECT_STATE.md` and `TASK_BOARD.md` are updated, **[PROPOSED]** `COMPONENT_OWNERSHIP_MATRIX.md` is updated for any task that created or modified a Shared or Feature Component (§24), and a complete handoff summary is produced.

Individual WBS Tasks may add task-specific Acceptance Criteria on top of this — they never replace it.

---

## 19. Forbidden Actions

Hardcoded secrets. Hardcoded API responses. Duplicate business logic. Unvalidated user input. Direct database access from the UI. Direct external API calls from agents or frontend. Ignoring errors. Skipping tests. Silent scope expansion. Editing a locked document. Silently resolving a cross-document conflict. Continuing to the next task without an explicit go-ahead. **[PROPOSED]** Recreating an existing Foundation or Shared Component instead of extending it, per `COMPONENT_OWNERSHIP_MATRIX.md`.

---

## 20. Conversation Rules

One conversation = one WBS Task (or a small tightly-coupled group of Subtasks). If requested work is too large, split it into smaller WBS Tasks before implementation, not mid-session.

---

## 21. End-of-Session Checklist

Update `PROJECT_STATE.md`. Update `TASK_BOARD.md`. Update `WORK_BREAKDOWN_STRUCTURE.md` if scope genuinely changed. List every modified, created, and deleted file. Produce a complete implementation summary and handoff summary. Name the next recommended WBS Task. **Do not continue automatically — wait for approval.**

---

## 22. Output Rules

Unless explicitly requested: no explanations of basic concepts, no unnecessary text, be precise and deterministic, no placeholders, no TODO comments, no unfinished implementations.

---

## 23. Amendment History

| Version | Date | Change | Approved by |
|---|---|---|---|
| 1.0 | 2026-07-22 | Initial creation, synthesized from Permanent Project Instructions + GUIDELINES.md + ARCHITECTURE.md §17 + DESIGN_SYSTEM.md + FRONTEND_IMPLEMENTATION_GUIDELINES.md | Project owner — 2026-07-22 |
| 1.1 | 2026-07-22 | Q1–Q4 resolved and referenced throughout (§2, §14); file locked as baseline (Tier 2); fixed internal cross-reference error (§Change frequency previously pointed to §16 instead of §23) | Project owner — 2026-07-22 |
| 1.2 (proposed) | 2026-07-29 | Registered `COMPONENT_OWNERSHIP_MATRIX.md` in §2 (item 6, conditional); added new §24 UI Component Ownership Governance; extended §18 DoD and §19 Forbidden Actions to reference it. §4 deliberately left untouched (see note there). No existing section renumbered — §24 appended after §23 to avoid breaking external cross-references to §12/§18/§20/§21 used elsewhere in the project. | **PROPOSED — awaiting project owner approval, not yet in effect** |

---

## 24. UI Component Ownership Governance *(PROPOSED)*

Established alongside `COMPONENT_OWNERSHIP_MATRIX.md`, the authoritative source for UI component ownership, lifecycle, and consumption across the project.

- Reusable components must never be recreated. Check `COMPONENT_OWNERSHIP_MATRIX.md` before writing any new UI component.
- Foundation Components are implemented only by `DESIGNSYS` tasks.
- Shared Components are implemented only by their owning WBS Task — the task that first needs them.
- Feature Components are implemented only by their owning WBS Task.
- No task may create another task's Feature Components.
- Feature Components must be created just-in-time, during their owning WBS Task — never earlier, never pre-built "while in the area."
- `DESIGNSYS` tasks are forbidden from implementing Feature Components.
- Feature Components must consume existing Foundation and Shared Components whenever available, rather than duplicating their styling or logic.

---

**END OF DOCUMENT**

**LOCK STATUS:**
**IMMUTABLE (baseline) — approved 2026-07-22. Changed only via the Amendment History process (§23), never by freeform edit. This version's §24/§2/§18/§19 changes are PROPOSED per the 1.2 row in §23 and are not yet part of the locked baseline.**
