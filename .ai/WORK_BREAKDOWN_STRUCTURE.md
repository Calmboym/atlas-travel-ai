# WORK_BREAKDOWN_STRUCTURE.md

**Project:** Atlas — AI Travel Platform
**Date:** 2026-07-22
**Document tier:** Living — Phase 1 and Phase 2 are fully elaborated to Task level now; Phases 3–7 remain at Module/Feature level and are elaborated to Task level in their own bootstrap pass, just before each starts (rolling wave — see below). This is the approved 2026-07-22 baseline; changes only via `MASTER_RULES.md` §21.
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

## PHASE 1 — Core Platform MVP — ✅ DONE (2026-09-08) (Milestone M1)

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
    - Status: **Done** (2026-09-08) — implements `18_DASHBOARD_EXPERIENCE.md` §Default Landing/§Empty Dashboard only; Travel Summary Hero, Travel Timeline, and every trip-data-backed widget are explicitly out of scope until Trip Service exists (Phase 2+, `DEPENDENCY_GRAPH.md` §4/§5) — building them now would mean fabricating trip data. "Last conversation" is read from `MEM-01`'s guest-session-store, since `CHAT-03`/`04`'s backend is deliberately stateless. Also fills `Navbar`/`ApplicationLayout`'s `userSlot`/`notificationsSlot` (`ProfileMenu`, `NotificationCenter` — `PROF-03` had explicitly deferred `ProfileMenu` to this task) and delivers `QuickActions`/`ConnectionStatus`/`RetryCard`, closing out every open Shared-component row this task was positioned to claim (`COMPONENT_OWNERSHIP_MATRIX.md` §4). This was the last remaining Phase 1 task — see the Phase 1 exit criteria below and `.ai/PROJECT_STATE.md`/`.ai/TASK_BOARD.md` for full verification detail.

**Phase 1 exit criteria:** Flow 03 (Register) and Flow 06 (Continue Chat) from USER_FLOWS.md complete end-to-end; registration under 2 minutes; zero dead ends per Flow 20/21; Design QA Checklist (24) passes on every screen shipped. **Met — Phase 1 is complete as of 2026-09-08.**

---

## PHASE 2 — AI Agent System — Task-level elaboration (2026-09-09); implementation started 2026-09-10

**Status note:** Elaborated to Task level 2026-09-09, per the project owner's explicit approval of Q1–Q4 (formal record: `DESIGN_BIBLE_AMENDMENTS.md` Amendment 010). **`ATLAS-P2-AGENTS-01` (AI Orchestrator core) is done (2026-09-10)**; **`ATLAS-P2-AGENTS-02` (Agent base contract + structured-output schemas) and `ATLAS-P2-AGENTS-03` (Tool Service + RAG over Qdrant) are done (2026-09-12), executed as one task group** — see their task entries below and `PROJECT_STATE.md`. `AGENTS-04` through `AGENTS-09` remain Todo; each still needs its own explicit `"Execute ATLAS-P2-AGENTS-NN"` instruction, per `SESSION_PROMPT.md` and `DEVELOPMENT_EXECUTION_PLAN.md` §3 — the Q1–Q4 elaboration sign-off does not itself authorize any of them.

**Milestone M2 objective:** Atlas reasons using five specialized Core Agents (Traveler Profile, Destination Intelligence, Budget, Itinerary Planner, Recommendation) dispatched by a real AI Orchestrator, replacing Phase 1's single-model passthrough — while never fabricating prices, availability, or facts it can't ground in retrieval (`GUIDELINES.md` §8, `MASTER_BUILD_PROMPT.md` §10).

**Consolidation note (resolves a naming conflict — see `PROJECT_STATE.md`'s Findings for this session and `DESIGN_BIBLE_AMENDMENTS.md` Amendment 010):** this WBS previously sketched Phase 2 as four separate modules (`ORCH`, `AGENTSVC`, `CORE-AGENTS`, `STRUCT-OUT`, matching `CONVERSATION_STRATEGY.md` §2's own placeholder example). Per the project owner's explicit approval of the 9-task structure below, Phase 2 is elaborated as **one consolidated module, `AGENTS`**, with flat `ATLAS-P2-AGENTS-01..09` task IDs — not four separately-numbered modules. `CONVERSATION_STRATEGY.md` §2 is updated to match (see that document).

### Module: AGENTS (AI Agent System)

Cross-references `ARCHITECTURE.md` §7–9, `PRD.md` §7.14, `GUIDELINES.md` §7–9, `MASTER_BUILD_PROMPT.md` §7–10. No numbered Design Bible document governs this module — it is backend/AI-layer only (confirmed: no task below creates or consumes a UI component; `COMPONENT_OWNERSHIP_MATRIX.md` is not touched by this elaboration, per `CONVERSATION_STRATEGY.md` §7's backend-only exception).

**Phase 1 infrastructure this module reuses (verified against the actual repository baseline this session, not assumed):**
- `ai/providers/base.py` (`LLMProvider` ABC, `LLMMessage`, `ProviderError` hierarchy) and `ai/providers/openai_provider.py` — every agent calls a model through this, never a provider SDK directly (`ARCHITECTURE.md` §2).
- `ai/agents/conversation_manager.py` (`generate_reply`/`stream_reply`) — **`AGENTS-01` extends/consumes this, does not rebuild it** (Q4, confirmed). Its existing system-prompt-injection defense (`_with_system_prompt`, the sole place a `"system"`-role message can enter a conversation) is preserved as-is.
- `ai/config.py` (`AIConfig`) and `backend/app/core/ai.py` (env → `AIConfig` → provider wiring) — unchanged; any new agent-specific configuration follows this same pattern, not a parallel one.
- `backend/app/services/chat_service.py` / `backend/app/api/v1/chat.py` (`CHAT-03`/`04`'s non-streaming and SSE routes) — **left untouched until `AGENTS-09`**, the one task that swaps `chat_service.py`'s direct `conversation_manager` calls for a call into the new Orchestrator. No earlier task in this module modifies either file.
- `backend/app/services/memory_service.py` / the `user_memory` JSONB table (`MEM-02`) — the storage surface `AGENTS-04` (Traveler Profile Agent) reads/writes, exactly as `PROJECT_STATE.md`'s 2026-09-06 entry anticipated ("intended as the storage surface a future Phase 2+ Memory/Traveler-Profile Agent will read and write into").
- `backend/app/models/traveler_profile.py` (`PROF-02`) — the structured-preference table `AGENTS-04` reads (travel style, budget, accommodation, transportation, food, languages); `AGENTS-04` does not duplicate any of these fields.
- `ai/schemas/` and `ai/evaluations/` — both still empty (`.gitkeep` only, verified against the actual repo this session). `AGENTS-02` is the first task to add real content to either.
- `qdrant-client` (`backend/pyproject.toml`) and the `qdrant` service (`docker-compose.yml`) — both declared/provisioned since Phase 0, but **zero client-instantiation code exists anywhere in the repository today** (verified this session: no `QdrantClient(...)` call anywhere in `ai/` or `backend/app/`). `AGENTS-03` is the first task that actually wires a Qdrant client — new work, not a reconciliation of something already built.

**Approved scope decisions this elaboration incorporates (Q1–Q4, confirmed by the project owner; formal record: `DESIGN_BIBLE_AMENDMENTS.md` Amendment 010):**
- **Q1 — RAG scope:** `AGENTS-03`'s Tool Service includes RAG retrieval over **static, curated** knowledge sources only, via Qdrant. Nothing in this module calls a live external API (Maps/Weather/Currency/Flights/Hotels) — that remains `INTEG-*`/`DOMAIN-AGENTS`, Phase 3.
- **Q2 — TRIPPLAN independence:** the Trip Planning frontend (Design Bible Doc 19, `INDEX.md` §TRIPPLAN) is explicitly **out of scope** for this module and for this elaboration pass. `AGENTS` is backend-only; `TRIPPLAN` remains at Module/Feature level, to be elaborated to Task level in its own separate future pass once these agents exist for it to consume.
- **Q3 — Budget Agent honesty framing:** `AGENTS-06`'s output is **estimate-only** and must explicitly state its uncertainty in every response, per `AI_EXPERIENCE.md` §Uncertainty ("If Atlas is uncertain... State the uncertainty clearly") — a permanent characteristic of Phase 2's Budget Agent until real pricing adapters exist in Phase 3, not a placeholder.
- **Q4 — `AGENTS-01` extends, does not rebuild, `CHAT-03`'s Conversation Manager** — see the infrastructure-reuse note above.

**Task ID scheme:** `ATLAS-P2-AGENTS-{seq}` (flat, per the Consolidation note above).

- Task `ATLAS-P2-AGENTS-01` — AI Orchestrator core — **✅ DONE (2026-09-10)**
    - **Scope:** intent understanding, an agent registry (empty until `AGENTS-04..08` populate it), dispatch logic, output combination. Standalone and unit-testable — **not yet wired into `chat_service.py`/`chat.py`** (that's `AGENTS-09`). When no specialized agent applies, the Orchestrator falls back to calling `conversation_manager.generate_reply`/`stream_reply` directly — this is the "extend, don't rebuild" relationship (Q4): the existing Phase 1 module becomes the Orchestrator's own default path, not a discarded predecessor.
    - Dependencies: none (Phase 1 `CHAT-03`/`CHAT-04` already Done)
    - Required docs: `ARCHITECTURE.md` §7–8, `GUIDELINES.md` §7, `MASTER_BUILD_PROMPT.md` §7
    - Allowed files to modify: new `ai/orchestrator/**`; extends (does not rewrite) `ai/agents/conversation_manager.py` only if a genuine shared-helper extraction is needed — report before doing so if it is
    - Priority: High | Complexity: L | Context: L
    - Acceptance: never bypasses `LLMProvider` (`ARCHITECTURE.md` §2); an unrecognized/ambiguous request produces the same passthrough behavior Phase 1 users already get, not a regression; every dispatch decision is logged with its reasoning (`GUIDELINES.md` §16 — cited as-is; the closer match by substance is actually §18 "Logging Rules", a minor citation note not a blocking conflict, see `PROJECT_STATE.md`), never silent; unit tests cover intent-classification and fallback-to-passthrough paths using a dependency-injected fake provider, matching `CHAT-03`/`04`'s own established testing pattern (no live model call required for these tests)
    - **Delivered:** `ai/orchestrator/{__init__,types,registry,intent,orchestrator}.py`; 18 new tests in `backend/tests/test_orchestrator.py`; 155/155 suite passing; mypy strict clean. `ai/agents/conversation_manager.py` unchanged (extended/consumed only, per Q4). Full verification: `PROJECT_STATE.md` "Verification Results (2026-09-10, AGENTS-01)".

- Task `ATLAS-P2-AGENTS-02` — Agent framework: base contract + structured-output schemas — **✅ DONE (2026-09-12)**
    - **Scope:** the base `Agent` contract every Core Agent below implements (Mission/Responsibilities/Allowed tools/Input schema/Output schema/Reasoning rules/System prompt — the exact 7 fields `ARCHITECTURE.md` §8 requires), Pydantic structured-output schemas, and the prompt-file loading convention wired to `ai/prompts/`/`ai/agents/`/`ai/schemas/` (`GUIDELINES.md` §7's directory structure — already scaffolded, not yet populated beyond `conversation_manager`'s own prompt). **Note for whoever picks this up:** the base `Agent` class is expected to structurally satisfy `ai/orchestrator/types.py`'s `AgentHandler` Protocol (`name`, `intents`, `handle()`, `stream_handle()`) so `AGENTS-04` can register real agents into `Orchestrator().registry` without any change to `ai/orchestrator/` itself — `AGENTS-01` deliberately did not invent this 7-field contract itself, to avoid anticipating this task's own scope.
    - Dependencies: AGENTS-01 ✅
    - Required docs: `ARCHITECTURE.md` §8, `GUIDELINES.md` §7 (Prompt Management), `MASTER_BUILD_PROMPT.md` §8–9
    - Allowed files to modify: new `ai/agents/base.py`; new files under `ai/schemas/` (first real content — currently `.gitkeep` only)
    - Priority: High | Complexity: M | Context: M
    - Acceptance: every schema is a real Pydantic model (no `dict[str, Any]` escape hatches); the base contract is abstract/enforced (a Core Agent that skips a required field fails at import or instantiation time, not silently at runtime); system prompts live in `ai/prompts/`, never inline in agent logic (`GUIDELINES.md` §7)
    - **Delivered:** `ai/agents/base.py` (`Agent` ABC — the 7 `ARCHITECTURE.md` §8 fields as abstract properties; `reason()` abstract; `handle()`/`stream_handle()`/`render_output()`/`_with_system_prompt()` concrete); `ai/schemas/{base,__init__}.py` (`AgentOutputBase`, `ConfidenceLevel`). **One real scope adjustment, made and flagged, not silently absorbed:** `name`/`intents` ended up as required constructor attributes rather than abstract `@property`s — `mypy` correctly rejected the property form as incompatible with `AgentHandler`'s plain-attribute Protocol members, and this task's own acceptance requires satisfying that Protocol "without modifying `ai/orchestrator/` at all," so the fix is here. Still fails at construction time if omitted, still Protocol-compatible — verified by registering a real `Agent` subclass into a real `AgentRegistry`/`Orchestrator` in `test_agent_base.py`. 17 new tests; 194/194 suite passing (with `AGENTS-03`, same session); mypy strict clean. Full verification: `PROJECT_STATE.md` "Verification Results (2026-09-12, AGENTS-02 through AGENTS-03)".

- Task `ATLAS-P2-AGENTS-03` — Tool Service: registry, permissions, validation, RAG (static/curated + Qdrant) — **✅ DONE (2026-09-12)**
    - **Scope:** tool registry, per-agent permission enforcement (`GUIDELINES.md` §9 — "Agents must use approved tools only"), response validation, monitoring hooks; the **first real Qdrant client wiring in this repository** (verified: none exists today), retrieving from static/curated knowledge sources only (Q1 — no live external APIs; those are Phase 3 `INTEG-*` adapters). The embedding layer is provider-independent, matching `ARCHITECTURE.md` §9, not hardcoded to one embedding provider.
    - Dependencies: AGENTS-02 ✅
    - Required docs: `ARCHITECTURE.md` §9–10, `GUIDELINES.md` §9, `INFRASTRUCTURE_BASELINE.md` §8 (backend baseline — confirms no prior Qdrant client code to reconcile against)
    - Allowed files to modify: new `ai/tools/**`; new `ai/rag/**`; `backend/pyproject.toml` only if a new supporting library is genuinely needed beyond the already-declared `qdrant-client` (report before adding)
    - Priority: High | Complexity: M | Context: M
    - Acceptance: no tool call reaches Qdrant or any other resource without passing permission + validation first; retrieval sources are static/curated and cited in this task's own handoff (no fabricated or invented "knowledge base" content — `BRAND_GUIDELINES.md` §13); verified against a real local Qdrant instance (matching every prior Phase 1 session's "real infrastructure, not mocks" standard), not a mocked client
    - **Delivered:** `ai/tools/{types,registry,service,knowledge_tools,__init__}.py` (`ToolRegistry`, `ToolService.invoke()` — permission → lookup → input validation → output validation, in that order, `structlog` monitoring on every outcome); `ai/rag/{embeddings,schemas,knowledge_base,vector_store,__init__}.py` (`HashingEmbeddingProvider` — real, deterministic, offline, no external API call per Q1; 10 curated travel-preparation documents, no fabricated prices/visas/availability per `GUIDELINES.md` §8; `QdrantKnowledgeStore`). No `pyproject.toml` change needed — `qdrant-client` already declared. **Verified against a real local Qdrant 1.19.1 server** (release binary downloaded and run as its own process, not the embedded/in-memory client mode) — collection creation, indexing, keyword-overlap search relevance, and re-index-updates-not-duplicates all confirmed against the live server. 22 new tests; 194/194 suite passing (with `AGENTS-02`, same session); mypy strict clean. Full verification: `PROJECT_STATE.md` "Verification Results (2026-09-12, AGENTS-02 through AGENTS-03)".

- Task `ATLAS-P2-AGENTS-04` — Traveler Profile Agent — **Definition-of-Ready** (`AGENTS-01` ✅, `AGENTS-02` ✅, `AGENTS-03` ✅ all Done)
    - **Scope:** reads `traveler_profile.py` (`PROF-02`) and `user_memory` (`MEM-02`); does not duplicate either table's fields. Produces a structured traveler-preference summary the other four Core Agents consume.
    - Dependencies: AGENTS-01 ✅, AGENTS-02 ✅, AGENTS-03 ✅
    - Required docs: `ARCHITECTURE.md` §8, `AI_EXPERIENCE.md` §Memory/§Context Awareness, `PRD.md` §7.13
    - Allowed files to modify: new `ai/agents/traveler_profile_agent.py`; new `ai/prompts/traveler_profile_prompt.py`; new `ai/schemas/traveler_profile.py`
    - Priority: High | Complexity: M | Context: M
    - Acceptance: zero field overlap with `traveler_profile.py`/`user_memory` (checked and stated explicitly in this task's handoff, the same check `MEM-02` performed against `PROF-02` before it was built); read-only against both tables — this agent never writes to `traveler_profile.py` (that remains `PROF-02`'s owned write path via `/api/v1/profile/me`)

- Task `ATLAS-P2-AGENTS-05` — Destination Intelligence Agent
    - **Scope:** discovery, ranking, and comparison via `AGENTS-03`'s RAG retrieval over static/curated sources only.
    - Dependencies: AGENTS-01 through AGENTS-04
    - Required docs: `ARCHITECTURE.md` §8, `PRD.md` §7.2, `AI_EXPERIENCE.md` §Explainability
    - Allowed files to modify: new `ai/agents/destination_intelligence_agent.py`; new `ai/prompts/destination_intelligence_prompt.py`; new `ai/schemas/destination.py`
    - Priority: High | Complexity: M | Context: M
    - Acceptance: every recommendation explains why it was selected (`AI_EXPERIENCE.md` §Explainability — "Why this? Why now? Why for me?"); never returns a destination not grounded in the retrieved static/curated set — no fabricated destinations, weather, or facts

- Task `ATLAS-P2-AGENTS-06` — Budget Agent (estimate-only)
    - **Scope:** cost **estimation** only — no real pricing exists until Phase 3's Flight/Hotel adapters (Q3, confirmed). Every response explicitly states it is an estimate.
    - Dependencies: AGENTS-01 through AGENTS-04
    - Required docs: `PRD.md` §7.9, `AI_EXPERIENCE.md` §Budget Assistance/§Uncertainty, `GUIDELINES.md` §8 ("Never invent prices")
    - Allowed files to modify: new `ai/agents/budget_agent.py`; new `ai/prompts/budget_prompt.py`; new `ai/schemas/budget.py`
    - Priority: Medium | Complexity: M | Context: M
    - Acceptance: **every output includes an explicit, unambiguous uncertainty/estimate disclosure** — a hard acceptance gate, not a style preference (Q3); no absolute price is ever presented as confirmed or booked

- Task `ATLAS-P2-AGENTS-07` — Itinerary Planner Agent
    - **Scope:** daily schedules, consuming Destination Intelligence (`AGENTS-05`) and Budget (`AGENTS-06`) output.
    - Dependencies: AGENTS-05, AGENTS-06
    - Required docs: `ARCHITECTURE.md` §8, `AI_EXPERIENCE.md` §Itinerary Generation, `PRD.md` §7.3
    - Allowed files to modify: new `ai/agents/itinerary_planner_agent.py`; new `ai/prompts/itinerary_planner_prompt.py`; new `ai/schemas/itinerary.py`
    - Priority: High | Complexity: L | Context: L
    - Acceptance: every itinerary section (overview/daily schedule/transportation/accommodation/estimated costs/tips) is present per `AI_EXPERIENCE.md` §Itinerary Generation; budget figures carry Budget Agent's own estimate disclosure forward, never restated as confirmed

- Task `ATLAS-P2-AGENTS-08` — Recommendation Agent
    - **Scope:** personalized ranking, consuming Traveler Profile (`AGENTS-04`) and Destination Intelligence (`AGENTS-05`) output.
    - Dependencies: AGENTS-04, AGENTS-05
    - Required docs: `ARCHITECTURE.md` §8, `AI_EXPERIENCE.md` §Recommendations, `PSYCHOLOGY_GUIDELINES.md` §13 (Decision Fatigue), §15 (Explainable AI)
    - Allowed files to modify: new `ai/agents/recommendation_agent.py`; new `ai/prompts/recommendation_prompt.py`; new `ai/schemas/recommendation.py`
    - Priority: Medium | Complexity: M | Context: M
    - Acceptance: curated, ranked output, not an exhaustive list (`PSYCHOLOGY_GUIDELINES.md` §13 — "Never display 50 hotels at once"); every recommendation states its relevance reasoning, not a generic label

- Task `ATLAS-P2-AGENTS-09` — Multi-agent integration
    - **Scope:** wires all five Core Agents into the Orchestrator's real dispatch (`AGENTS-01`), and — the one task in this module that touches them — **replaces `chat_service.py`'s direct `conversation_manager` calls with a call into the Orchestrator**, adds status messages during generation (`"Finding destinations..."` / `"Building your itinerary..."` per `TRIP_PLANNING_EXPERIENCE.md` §AI Understanding Phase — no fake percentages), and confirms the existing SSE stream (`CHAT-04`'s wire format) carries them without a breaking change to the frontend contract.
    - Dependencies: AGENTS-01 through AGENTS-08 (the only task in this module depending on more than two prior tasks)
    - Required docs: `TRIP_PLANNING_EXPERIENCE.md` §AI Understanding Phase, `ARCHITECTURE.md` §7, `AI_EXPERIENCE.md` §Streaming
    - Allowed files to modify: `backend/app/services/chat_service.py`, `backend/app/api/v1/chat.py` (both — for the first time since `CHAT-04`); new orchestrator-dispatch wiring under `ai/orchestrator/**`
    - Priority: High | Complexity: L | Context: L
    - Acceptance: the existing `CHAT-04` SSE frontend consumer (`frontend/lib/chat/stream-assistant-reply.ts`) requires **no changes** — the wire format is preserved exactly, only the backend's internal generation path changes; a live end-to-end smoke test (dependency-injected fake or real provider, matching every prior Phase 1 session's verification standard) confirms `/chat` still works for a guest user with zero regression before this task is considered done

**Parallelization (per `CONVERSATION_STRATEGY.md` §8 — neither task's declared Dependencies names the other, and their Allowed Files to Modify don't overlap):**
- `AGENTS-05` (Destination) and `AGENTS-06` (Budget) may run in parallel once `AGENTS-01`–`04` are Done — neither depends on the other and they touch disjoint new files.
- `AGENTS-07` (Itinerary) and `AGENTS-08` (Recommendation) touch disjoint new files (`itinerary_planner_agent.py` vs `recommendation_agent.py`) and neither's Dependencies names the other, so they may run in parallel once their own respective dependencies are satisfied (`AGENTS-05`+`06` for `07`; `AGENTS-04`+`05` for `08`).
- `AGENTS-09` is a hard serialization point — it is the only task in this module whose Dependencies field names more than two prior tasks, and every other `AGENTS` task must be Done before it starts.
- No task in this module may run in parallel with any Phase 1 task (none remain — Phase 1 is closed) or with any Phase 3–7 task (none of those phases is elaborated to Task level yet).

**Phase 2 exit criteria:** all nine `AGENTS` tasks Done; `/chat` is served by real multi-agent dispatch (not the Phase 1 single-model passthrough) with zero regression to the existing guest-mode streaming contract; every Core Agent's output is grounded (RAG-retrieved or profile-derived), never fabricated (`BRAND_GUIDELINES.md` §13, `GUIDELINES.md` §8); Budget Agent's estimate-only framing is present in 100% of its outputs (Q3); `TRIPPLAN` frontend elaboration (Q2) can begin as its own separate, future Task-level pass, since real agent output now exists for it to consume.

Unlocks: `TRIPPLAN` (once separately elaborated — Q2) and, partially, `TIMELINE`/`TRIPDET` become buildable against real (if estimate-flagged) data.

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

**Phase 2 (AGENTS) integrity check, 2026-09-09:** no duplicated work against Phase 1 (`AGENTS-01` explicitly extends, not duplicates, `CHAT-03`'s Conversation Manager); no circular dependencies (`AGENTS-09` is the only convergence point, and it depends strictly forward on `01`–`08`, none of which depends back on it); no Task rated XL (highest is L, matching Phase 1's own ceiling); the one real naming inconsistency found (four sketched modules vs. one consolidated `AGENTS` module) is resolved and recorded, not silently carried forward — see the Consolidation note above and `DESIGN_BIBLE_AMENDMENTS.md` Amendment 010.

**Phase 2 (AGENTS) integrity check update, 2026-09-10 (`AGENTS-01`):** delivered scope matches the planned scope exactly — no Task boundary crossed (`ai/orchestrator/**` only; `ai/agents/conversation_manager.py` read and called, not modified); no dependency violated (`AGENTS-01` declared none, and none were introduced during implementation); `AGENTS-02`'s Dependencies field (`AGENTS-01`) is now genuinely satisfied, not just declared. No integrity issue found.

**Phase 2 (AGENTS) integrity check update, 2026-09-12 (`AGENTS-02` and `AGENTS-03`, executed as one task group):** delivered scope matches the planned scope for both tasks — `AGENTS-02` stayed within `ai/agents/base.py` (new) and new files under `ai/schemas/`; `AGENTS-03` stayed within `ai/tools/**` and `ai/rag/**` (new), no `pyproject.toml` change needed. No dependency violated: `AGENTS-02`'s declared dependency (`AGENTS-01`) was already Done at session start; `AGENTS-03`'s declared dependency (`AGENTS-02`) was satisfied within this same session, in that order, before `AGENTS-03` began, per `SESSION_PROMPT.md`'s task-group handling. `AGENTS-04`'s Dependencies field (`AGENTS-01`, `AGENTS-02`, `AGENTS-03`) is now genuinely satisfied in full, not just declared. One real integration issue was found and fixed within `AGENTS-02`'s own scope — not a Task-boundary violation, since the fix (constructor attributes instead of abstract properties for `name`/`intents`) lives entirely inside `ai/agents/base.py`, the exact file `AGENTS-02` owns — see `PROJECT_STATE.md` for the full mypy-surfaced conflict and resolution. No integrity issue found.

---

**END OF DOCUMENT (this baseline)**

**LOCK STATUS:**
**LIVING — approved 2026-07-22 baseline, updated 2026-08-13 (Bootstrap Reconciliation — added Module: DESIGNSYS), updated 2026-09-08 (Phase 1 — Core Platform MVP complete), updated 2026-09-09 (Phase 2 — AI Agent System elaborated to Task level, Module: AGENTS added, documentation-only, Q1–Q4 approved — see `DESIGN_BIBLE_AMENDMENTS.md` Amendment 010; no Phase 2 task authorized for implementation by this update), updated 2026-09-10 (`ATLAS-P2-AGENTS-01` — AI Orchestrator core — done, the first Phase 2 task implemented; `AGENTS-02` is now Definition-of-Ready), updated 2026-09-12 (`ATLAS-P2-AGENTS-02` and `ATLAS-P2-AGENTS-03` — done, executed as one task group; `AGENTS-04` is now Definition-of-Ready). Future changes only via the governed End-of-Session Checklist in `MASTER_RULES.md` §21.**
