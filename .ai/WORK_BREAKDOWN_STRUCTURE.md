# WORK_BREAKDOWN_STRUCTURE.md

**Project:** Atlas — AI Travel Platform
**Date:** 2026-07-22
**Document tier:** Living — Phase 1 is fully elaborated now; Phases 2–7 are elaborated to Task level in their own bootstrap pass, just before each starts (rolling wave — see below). This is the approved 2026-07-22 baseline; changes only via `MASTER_RULES.md` §21.
**Status note:** Q1–Q4 approved 2026-07-22 — see `PROJECT_STATE.md` and `DESIGN_BIBLE_AMENDMENTS.md`. **Phase 1 implementation is authorized and underway** — `ATLAS-P1-AUTH-01`, `ATLAS-P1-AUTH-02`, `ATLAS-P1-AUTH-03`, `ATLAS-P1-AUTH-04`, `ATLAS-P1-AUTH-05`, `ATLAS-P1-DESIGNSYS-01`, `ATLAS-P1-DESIGNSYS-02`, `ATLAS-P1-DESIGNSYS-03`, and `ATLAS-P1-DESIGNSYS-04` are done; see `.ai/PROJECT_STATE.md` → "Implementation Status." Updated 2026-08-22 (AUTH-02 through AUTH-05 session) to record those four tasks' completion — first real `backend/app/` code in the repository; see that session's entry in `.ai/PROJECT_STATE.md` for the backend-scaffolding-as-byproduct note, mirroring how AUTH-01 pre-built Foundation components DESIGNSYS-02 later reconciled with.
**Hierarchy:** Project → Phase → Milestone → Module → Feature → Epic → Task → Subtask

## PHASE −1 — Bootstrap — ✅ DONE (2026-07-22)

Not a ROADMAP.md phase (it precedes Phase 0 in effort, not in the product roadmap) — the one-time documentation analysis, audit, dependency graph, WBS, roadmap, conversation strategy, execution plan, and `.ai/` memory-system creation, followed by Q1–Q4 review and approval. Full record: `REPOSITORY_ANALYSIS_REPORT.md` through `DEVELOPMENT_EXECUTION_PLAN.md`, and this file itself.

**Planning approach — rolling wave:** Phase 0 is recorded at Module level (it's done — full detail lives in `TASK_BOARD.md`'s Done column). Phase 1 is broken down to full Task level because it's the active phase. Phases 2–7 are broken down to Module/Feature level only; each gets elaborated to Task level in its own bootstrap pass shortly before it starts, so detailed plans don't go stale waiting for phases that are months away. This is a deliberate choice, not an omission — see `DEVELOPMENT_EXECUTION_PLAN.md` §4.

**Universal Definition of Ready / Definition of Done:** every Task below inherits the universal DoR/DoD from `MASTER_RULES.md` §18 automatically. Only *task-specific* Acceptance Criteria are listed per task, to avoid repeating the same 10 lines dozens of times.

**Task ID scheme:** `ATLAS-P{phase}-{MODULE}-{seq}`

---

# PROJECT: Atlas

## PHASE 0 — Foundation Setup — ✅ DONE (2026-07-13)

Recorded at Module level only; already delivered, per `DEBUG_LOG.md`.

- Module INFRA: repo structure, Docker Compose, CI/CD — Done
- Module BE-CORE: FastAPI + async SQLAlchemy + Alembic + Redis + Qdrant + health endpoint + logging + security scaffold — Done
- Module FE-CORE: Next.js 16 + TypeScript + Tailwind v4 + shadcn/ui + i18n (EN/FA/DE) — Done
- Module AI-CORE: LLMProvider interface + OpenAIProvider + model tiering + token logging — Done
- Module INTEG-CORE: base adapter pattern + Maps/Weather/Currency contracts + Flights/Hotels reserved — Done

Full itemization: `TASK_BOARD.md` → Done column.

---

## PHASE 1 — Core Platform MVP — ▶ ACTIVE (Milestone M1)

**Milestone M1 objective:** a user can register, log in, converse with the AI assistant with a real streamed response, and maintain a basic profile. Guest mode works with zero registration friction.

### Module: DESIGNSYS (Design System / Foundation Components)

Cross-cutting — every other Phase 1 module consumes this one. Full
component-level detail: `.ai/COMPONENT_OWNERSHIP_MATRIX.md`,
`docs/DESIGNSYS_ARCHITECTURE_SPECIFICATION.md`. This module section was
proposed 2026-07-29 and is merged into this WBS now, reflecting real,
built, and verified work rather than a pending proposal.

- Task `ATLAS-P1-DESIGNSYS-01` — Design Token → CSS/Tailwind wiring + ThemeProvider
    - Dependencies: none
    - Required docs: `docs/DESIGN_TOKENS.md` Parts 1–5, `docs/DESIGN_SYSTEM.md`
    - Priority: High | Complexity: M | Context: M
    - Status: **Done** (2026-07-29)
    - Acceptance: every semantic token resolves as a real CSS variable; Light/Dark/System switch with no layout shift, <150ms, per `DESIGN_TOKENS.md` Part 5 §Runtime Theme Switching
- Task `ATLAS-P1-DESIGNSYS-02` — Core UI primitives
    - Dependencies: DESIGNSYS-01
    - Required docs: `docs/COMPONENT_INVENTORY.md` (Foundation section), `docs/DESIGN_TOKENS.md` Part 6, `docs/ACCESSIBILITY.md`
    - Priority: High | Complexity: L | Context: L
    - Status: **Done** (2026-07-29)
    - Acceptance: reconciles with AUTH-01's existing Button/Input/Label/FormError rather than forking; every primitive typed, keyboard-operable, meets `MASTER_RULES.md` §12 contrast minimums
- Task `ATLAS-P1-DESIGNSYS-03` — Layout shells + navigation shell
    - Dependencies: DESIGNSYS-01 ✅, DESIGNSYS-02 ✅
    - Required docs: `docs/APPLICATION_LAYOUT_GUIDE.md`, `docs/RESPONSIVE_SYSTEM.md`
    - Priority: High | Complexity: L | Context: L
    - Status: **Done** (2026-08-15)
    - Acceptance: exactly the 4 approved layout types (MarketingLayout/ApplicationLayout/FocusLayout, plus AUTH-01's existing AuthLayout — no 5th introduced), each consumed via a route-group layout nested under `app/[locale]/layout.tsx` (the root layout itself extended to mount `TooltipProvider` + `SkipLink`, its theme/i18n machinery untouched); Navbar/Sidebar/MobileBottomNav/MobileNavDrawer/Footer/LanguageSwitcher/ThemeSwitcher built and consuming Design Tokens/Foundation components exclusively; verified via real typecheck, lint, 129/129 tests, production build, and a real-server RTL smoke test across en/fa/de — not asserted
- Task `ATLAS-P1-DESIGNSYS-04` — Glass system + motion wrappers + BackgroundSystem
    - Dependencies: DESIGNSYS-01 ✅
    - Required docs: `docs/DESIGN_TOKENS.md` §Atlas Glass Design Language, `docs/MOTION_SYSTEM.md`, `docs/PREMIUM_MICROINTERACTIONS.md`
    - Priority: Medium | Complexity: M | Context: M
    - Status: **Done** (2026-08-16)
    - Acceptance: exactly the 4 Glass Levels, no 5th (`GlassSurface`/`GlassCard` in `components/ui/glass.tsx`, level: 1|2|3|4, formalizing the pre-existing `.atlas-glass-N` utilities rather than replacing them); reduced-motion strips parallax/decorative motion but keeps state transitions, per `ACCESSIBILITY.md` §Motion Accessibility (`MotionProvider` wraps the app in Framer Motion's `<MotionConfig reducedMotion="user">` and exposes a genuinely live `useMotionPreference()` boolean via `useSyncExternalStore`); verified via real typecheck, lint, 155/155 tests (129 pre-existing + 26 new), production build, and a real-server smoke test across en/fa/de confirming the new BackgroundSystem noise layer renders and DESIGNSYS-03's shell is unaffected — not asserted

### Module: LAND (Landing Page / Guest Entry)

**Feature: Landing Shell**
- Epic: Marketing Layout
  - Task `ATLAS-P1-LAND-01` — Build Marketing Layout (Header/Hero/Content Sections/CTA/Footer)
    - Dependencies: none
    - Required docs: INDEX.md §LAND
    - Priority: High | Complexity: M | Context: S
    - Acceptance: matches 26 §Marketing Layout structure; max width 1440px per 26 §Marketing Layout
  - Task `ATLAS-P1-LAND-02` — AI search box + rotating example prompts
    - Dependencies: LAND-01
    - Priority: Medium | Complexity: S | Context: S
    - Acceptance: prompts rotate per 19 §Step 1 Dream list; no filters, no forms

**Feature: Guest Mode Entry**
  - Task `ATLAS-P1-LAND-03` — "Continue as Guest" flow wiring (session-only memory)
    - Dependencies: LAND-01
    - Priority: Medium | Complexity: S | Context: S
    - Acceptance: matches USER_FLOWS Flow 02; no registration wall before first AI response

### Module: AUTH (Authentication)

**Feature: Registration**
  - Task `ATLAS-P1-AUTH-01` — Registration UI (form + validation)
    - Dependencies: none
    - Required docs: INDEX.md §AUTH
    - Priority: High | Complexity: M | Context: M
    - Acceptance: real-time validation, accessible labels (no placeholder-only), per 09 §Forms
    - Status: **Done** (2026-07-24); **audited 2026-08-19** (non-WBS session `ATLAS-AUTH01-AUDIT-RTL-01`) — found and fixed zero-localization + RTL bugs across every AUTH-01 file, plus a regressed sitewide `app/layout.tsx` nested-`<html>` bug outside AUTH-01's own boundary. Acceptance criteria above were never in question (validation/labels were already correct); only localization was gap. Full detail: `.ai/PROJECT_STATE.md`, `.ai/TASK_BOARD.md`.
  - Task `ATLAS-P1-AUTH-02` — Registration backend endpoint + secure password storage
    - Dependencies: none (parallel with AUTH-01)
    - Priority: High | Complexity: M | Context: M
    - Acceptance: passwords hashed per GUIDELINES §11; rate-limited per ARCHITECTURE §12
    - Status: **Done** (2026-08-22) — `backend/app/` had zero application code before this task (confirmed empty except `.gitkeep`; `INFRASTRUCTURE_BASELINE.md` §8 had named this exact task as where that would end); first real FastAPI app, async SQLAlchemy engine, `users` table + Alembic migration, bcrypt hashing, Redis-backed rate limiter all delivered here as an unavoidable byproduct of being the first backend task. Verified against real local PostgreSQL 16 + Redis 7 (apt-installed in-session, matching `docker-compose.yml`'s pinned versions — no Docker daemon available), not mocks: 45/45 pytest passing, mypy strict clean, live curl smoke test, and a real `alembic downgrade base` → `upgrade head` roundtrip. Full detail: `.ai/PROJECT_STATE.md`.
  - Task `ATLAS-P1-AUTH-03` — OAuth button scaffolding (Google, Apple)
    - Dependencies: AUTH-01
    - Priority: Medium | Complexity: S | Context: S
    - Acceptance: UI + routing only — full OAuth handshake may complete in this task or be stubbed if provider credentials aren't yet available; report which if stubbed
    - Status: **Done** (2026-08-22) — **stubbed, as reported below per this task's own acceptance criteria**: no Google or Apple OAuth client credentials exist anywhere in this repository's env files or documentation, so the handshake itself (`GET /api/v1/auth/oauth/{provider}`) returns `501 Not Implemented` with a clear message rather than a fabricated integration. UI buttons ship real, wired to that real (stubbed) endpoint — not fake client-only buttons. `OAuthButtons` is a new Feature Component (owned by this task, see `COMPONENT_OWNERSHIP_MATRIX.md` §5), consumed by both `RegisterPageContent` (AUTH-01) and `LoginPageContent` (AUTH-05).
  - Task `ATLAS-P1-AUTH-04` — Email verification flow
    - Dependencies: AUTH-02
    - Priority: Medium | Complexity: S | Context: S
    - Status: **Done** (2026-08-22) — token generation/hashing/single-use/expiry and the `/verify-email` confirmation page all real and tested; email **delivery** is stubbed (logged server-side) since no SMTP/email provider is named anywhere in `ARCHITECTURE.md`'s External Providers list — flagged to the project owner before implementation, not silently invented.

**Feature: Login**
  - Task `ATLAS-P1-AUTH-05` — Login UI + backend endpoint
    - Dependencies: AUTH-02
    - Priority: High | Complexity: M | Context: M
    - Status: **Done** (2026-08-22) — unlike Register (AUTH-01/02 deliberately split UI-only + backend), Login was scoped as one task and shipped wired end-to-end: `LoginForm` calls the real `POST /api/v1/auth/login`, which issues a short-lived JWT (also set as an httpOnly cookie). Full Redis-backed session lifecycle (revocation, refresh) is explicitly AUTH-07's scope, not built here — flagged as a scope boundary, not silently expanded. First frontend→backend network call in the repository; introduced a minimal `lib/api/` fetch wrapper rather than TanStack Query (declared in ARCHITECTURE.md §4 but not yet installed) for a single mutation — see `.ai/PROJECT_STATE.md` for the full rationale.
  - Task `ATLAS-P1-AUTH-06` — Forgot-password flow (UI + backend)
    - Dependencies: AUTH-05
    - Priority: Medium | Complexity: S | Context: S

**Feature: Session & Route Protection**
  - Task `ATLAS-P1-AUTH-07` — Session/token handling
    - Dependencies: AUTH-02, AUTH-05
    - Priority: High | Complexity: M | Context: M
    - Acceptance: Redis-backed, rate-limited per GUIDELINES §11
  - Task `ATLAS-P1-AUTH-08` — Frontend route guards + backend RBAC scaffold (User/Admin/System)
    - Dependencies: AUTH-07
    - Priority: Medium | Complexity: M | Context: M

### Module: PROF (Basic Profile)

**Feature: Profile Wizard**
  - Task `ATLAS-P1-PROF-01` — Progressive profile-collection UI
    - Dependencies: AUTH-07
    - Priority: Medium | Complexity: M | Context: M
    - Acceptance: max one concept per screen per 16 §Progressive Profile Collection / 10 §Onboarding Copy; every field editable later
  - Task `ATLAS-P1-PROF-02` — User Profile Service backend CRUD
    - Dependencies: AUTH-07
    - Priority: Medium | Complexity: S | Context: S

**Feature: Profile Page**
  - Task `ATLAS-P1-PROF-03` — Profile page shell (Cover/Avatar/Personal Info/Preferences)
    - Dependencies: PROF-02
    - Priority: Low | Complexity: S | Context: S

### Module: CHAT (AI Chat — single-model for Phase 1)

**Feature: Chat Layout**
  - Task `ATLAS-P1-CHAT-01` — Chat page layout (sidebar/conversation/composer)
    - Dependencies: none
    - Priority: High | Complexity: M | Context: M
  - Task `ATLAS-P1-CHAT-02` — Message components (MessageBubble/StreamingBubble/TypingIndicator)
    - Dependencies: CHAT-01
    - Priority: High | Complexity: M | Context: M
    - Acceptance: streaming feels conversational per 21 §AI Response Streaming; reduced-motion respected

**Feature: Conversation Backend**
  - Task `ATLAS-P1-CHAT-03` — Conversation Manager (single-model, no orchestration yet)
    - Dependencies: none
    - Priority: High | Complexity: L | Context: L
    - Acceptance: does NOT implement agent routing — that's Phase 2 (`AGENTS` module); this is a direct passthrough to one model
  - Task `ATLAS-P1-CHAT-04` — Streaming endpoint (SSE)
    - Dependencies: CHAT-03
    - Priority: High | Complexity: M | Context: M

### Module: MEM (Basic Memory)

  - Task `ATLAS-P1-MEM-01` — Guest session memory (client-side, cleared on browser close)
    - Dependencies: CHAT-02
    - Priority: Medium | Complexity: S | Context: S
  - Task `ATLAS-P1-MEM-02` — Authenticated preference storage (basic tier)
    - Dependencies: AUTH-07
    - Priority: Medium | Complexity: S | Context: S
    - Acceptance: does NOT implement long-term "trip memory" — that's Phase 4

### Module: DASH (Dashboard Shell)

  - Task `ATLAS-P1-DASH-01` — Dashboard shell (opens to last conversation, or Welcome Dashboard)
    - Dependencies: CHAT-03, AUTH-07
    - Priority: Medium | Complexity: M | Context: M
    - Acceptance: never an empty page, per 18 §Default Landing

**Phase 1 exit criteria:** Flow 03 (Register) and Flow 06 (Continue Chat) from USER_FLOWS.md complete end-to-end; registration under 2 minutes; zero dead ends per Flow 20/21; Design QA Checklist (24) passes on every screen shipped.

---

## PHASE 2 — AI Agent System (Module/Feature level)

- Module ORCH: AI Orchestrator — intent understanding, agent selection, workflow management, output combination
- Module AGENTSVC: Agent Service — execution, communication (via Orchestrator only), permissions
- Module CORE-AGENTS: Destination Intelligence, Itinerary Planner, Recommendation, Budget, Traveler Profile
- Module STRUCT-OUT: Structured output schemas per agent (input/output schema, tool permissions, error handling, eval criteria — per MASTER_BUILD_PROMPT §8)

Unlocks: `TRIPPLAN` and (partially) `TIMELINE`/`TRIPDET` feature areas become buildable against real data.

## PHASE 3 — External Data Integration (Module/Feature level)

- Module INTEG-MAPS, INTEG-WEATHER, INTEG-CURRENCY, INTEG-EVENTS — each: adapter + error handling + caching + rate limiting
- Module DOMAIN-AGENTS: Flight, Hotel, Visa, Transportation, Restaurant, Culture, Event, Translation, Safety, Currency, Packing (12 agents)
- Module RAG: Qdrant-backed knowledge retrieval, embedding layer, curated knowledge sources

Unlocks: `TRIPDET`, `NOTIF` become real (live reservations, real weather-triggered alerts).

## PHASE 4 — Personalized Travel Intelligence (Module/Feature level)

- Module MEMSVC: long-term Memory Service (trip memory, user-controlled edit/delete)
- Module PROFILE-FULL: complete traveler profile, travel history
- Module PERSONALIZE: preference learning, personalized ranking feeding into Recommendation Agent

## PHASE 5 — MVP Beta Release (Module/Feature level — hardening, not features)

- Module SEC-REVIEW, PERF-TEST, AI-EVAL, USER-TEST, QA-FULL-PASS (Design QA Checklist 24 against every shipped screen)

## PHASE 6 — Advanced Travel Platform (Module/Feature level)

- Module BOOKING: flight/hotel/activity booking + payment integration
- Module TELEGRAM, MOBILE: same backend APIs, new clients
- Module VOICE: voice assistant interface layer
- Module AUTONOMY: autonomous planning, real-time monitoring, smart notifications

## PHASE 7 — Global Scale (Module/Feature level)

- Module MARKETPLACE, PARTNERS, LOCAL-GUIDES, CORPORATE, COMMUNITY, PREMIUM-TIER

---

## WBS Integrity Check (Phase 9 self-review, per Master Build Prompt)

- No duplicated work found across modules.
- No circular dependencies at Task, Module, or Phase level (the one cycle found is documentation-only — see `DEPENDENCY_GRAPH.md`).
- No missing milestones: every ROADMAP.md phase has a corresponding WBS Phase.
- No oversized Tasks: every Phase 1 Task above is scoped to fit the Context estimates in `CONVERSATION_STRATEGY.md`'s S/M/L/XL scale (none rated XL).
- No contradictory architecture introduced: every Task references existing ARCHITECTURE.md modules, none invents new ones.


---

**END OF DOCUMENT (this baseline)**

**LOCK STATUS:**
**LIVING — approved 2026-07-22 baseline, updated 2026-08-13 (Bootstrap Reconciliation — added Module: DESIGNSYS). Future changes only via the governed End-of-Session Checklist in `MASTER_RULES.md` §21.**
