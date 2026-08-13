# WORK_BREAKDOWN_STRUCTURE.md

**Project:** Atlas — AI Travel Platform
**Date:** 2026-07-22
**Document tier:** Living — Phase 1 is fully elaborated now; Phases 2–7 are elaborated to Task level in their own bootstrap pass, just before each starts (rolling wave — see below). This is the approved 2026-07-22 baseline; changes only via `MASTER_RULES.md` §21.
**Status note:** Q1–Q4 approved 2026-07-22 — see `PROJECT_STATE.md` and `DESIGN_BIBLE_AMENDMENTS.md`. None change the structure below. **Phase 1 is fully planned but not yet authorized to start** — see `PROJECT_STATE.md` → "Implementation Status."
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
  - Task `ATLAS-P1-AUTH-02` — Registration backend endpoint + secure password storage
    - Dependencies: none (parallel with AUTH-01)
    - Priority: High | Complexity: M | Context: M
    - Acceptance: passwords hashed per GUIDELINES §11; rate-limited per ARCHITECTURE §12
  - Task `ATLAS-P1-AUTH-03` — OAuth button scaffolding (Google, Apple)
    - Dependencies: AUTH-01
    - Priority: Medium | Complexity: S | Context: S
    - Acceptance: UI + routing only — full OAuth handshake may complete in this task or be stubbed if provider credentials aren't yet available; report which if stubbed
  - Task `ATLAS-P1-AUTH-04` — Email verification flow
    - Dependencies: AUTH-02
    - Priority: Medium | Complexity: S | Context: S

**Feature: Login**
  - Task `ATLAS-P1-AUTH-05` — Login UI + backend endpoint
    - Dependencies: AUTH-02
    - Priority: High | Complexity: M | Context: M
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
**LIVING — approved 2026-07-22 baseline. Future changes only via the governed End-of-Session Checklist in `MASTER_RULES.md` §21.**
