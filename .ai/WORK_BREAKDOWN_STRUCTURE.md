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

**Status note:** Elaborated to Task level 2026-09-09, per the project owner's explicit approval of Q1–Q4 (formal record: `DESIGN_BIBLE_AMENDMENTS.md` Amendment 010). **`ATLAS-P2-AGENTS-01` (AI Orchestrator core) is done (2026-09-10)**; **`ATLAS-P2-AGENTS-02` (Agent base contract + structured-output schemas) and `ATLAS-P2-AGENTS-03` (Tool Service + RAG over Qdrant) are done (2026-09-12)**; **`ATLAS-P2-AGENTS-04` (Traveler Profile Agent — the first concrete Core Agent) is done (2026-09-13)**; **`ATLAS-P2-AGENTS-05` (Destination Intelligence Agent — the first agent to consume `AGENTS-03`'s RAG/Tool infrastructure, adding a second curated content domain) is done (2026-09-14)**; **`ATLAS-P2-AGENTS-06` (Budget Agent — estimate-only, never invents a price) is done (2026-09-15)**; **`ATLAS-P2-AGENTS-07` (Itinerary Planner Agent — the first task requiring genuine agent-to-agent composition) is done (2026-09-16)**; **`ATLAS-P2-AGENTS-08` (Recommendation Agent — personalized ranking via literal preference overlap only) and `ATLAS-P2-AGENTS-09` (Multi-agent integration — `chat_service.py`/`chat.py` now route through the Orchestrator) are both done (2026-09-17), executed as one task group** — see their task entries below and `PROJECT_STATE.md`. **Phase 2 — AI Agent System is now fully closed: 9 of 9 `AGENTS` tasks Done.**

**Milestone M2 objective:** Atlas reasons using five specialized Core Agents (Traveler Profile, Destination Intelligence, Budget, Itinerary Planner, Recommendation) dispatched by a real AI Orchestrator, replacing Phase 1's single-model passthrough — while never fabricating prices, availability, or facts it can't ground in retrieval (`GUIDELINES.md` §8, `MASTER_BUILD_PROMPT.md` §10).

**Consolidation note (resolves a naming conflict — see `PROJECT_STATE.md`'s Findings for this session and `DESIGN_BIBLE_AMENDMENTS.md` Amendment 010):** this WBS previously sketched Phase 2 as four separate modules (`ORCH`, `AGENTSVC`, `CORE-AGENTS`, `STRUCT-OUT`, matching `CONVERSATION_STRATEGY.md` §2's own placeholder example). Per the project owner's explicit approval of the 9-task structure below, Phase 2 is elaborated as **one consolidated module, `AGENTS`**, with flat `ATLAS-P2-AGENTS-01..09` task IDs — not four separately-numbered modules. `CONVERSATION_STRATEGY.md` §2 is updated to match (see that document).

### Module: AGENTS (AI Agent System)

Cross-references `ARCHITECTURE.md` §7–9, `PRD.md` §7.14, `GUIDELINES.md` §7–9, `MASTER_BUILD_PROMPT.md` §7–10. No numbered Design Bible document governs this module — it is backend/AI-layer only (confirmed: no task below creates or consumes a UI component; `COMPONENT_OWNERSHIP_MATRIX.md` is not touched by this elaboration, per `CONVERSATION_STRATEGY.md` §7's backend-only exception).

**Phase 1 infrastructure this module reuses (verified against the actual repository baseline this session, not assumed):**
- `ai/providers/base.py` (`LLMProvider` ABC, `LLMMessage`, `ProviderError` hierarchy) and `ai/providers/openai_provider.py` — every agent calls a model through this, never a provider SDK directly (`ARCHITECTURE.md` §2).
- `ai/agents/conversation_manager.py` (`generate_reply`/`stream_reply`) — **`AGENTS-01` extends/consumes this, does not rebuild it** (Q4, confirmed). Its existing system-prompt-injection defense (`_with_system_prompt`, the sole place a `"system"`-role message can enter a conversation) is preserved as-is.
- `ai/config.py` (`AIConfig`) and `backend/app/core/ai.py` (env → `AIConfig` → provider wiring) — unchanged; any new agent-specific configuration follows this same pattern, not a parallel one.
- `backend/app/services/chat_service.py` / `backend/app/api/v1/chat.py` (`CHAT-03`/`04`'s non-streaming and SSE routes) — **now route through the Orchestrator (`AGENTS-09`, done 2026-09-17)**, the one task that swapped `chat_service.py`'s direct `conversation_manager` calls for a call into the Orchestrator built in `AGENTS-01`. No earlier task in this module modified either file.
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
    - **Scope:** intent understanding, an agent registry (empty until `AGENTS-04..08` populate it), dispatch logic, output combination. Standalone and unit-testable at first — **wired into `chat_service.py`/`chat.py` by `AGENTS-09` (done 2026-09-17)**. When no specialized agent applies, the Orchestrator falls back to calling `conversation_manager.generate_reply`/`stream_reply` directly — this is the "extend, don't rebuild" relationship (Q4): the existing Phase 1 module becomes the Orchestrator's own default path, not a discarded predecessor.
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

- Task `ATLAS-P2-AGENTS-04` — Traveler Profile Agent — **✅ DONE (2026-09-13)**
    - **Scope:** reads `traveler_profile.py` (`PROF-02`) and `user_memory` (`MEM-02`); does not duplicate either table's fields. Produces a structured traveler-preference summary the other four Core Agents consume.
    - Dependencies: AGENTS-01 ✅, AGENTS-02 ✅, AGENTS-03 ✅
    - Required docs: `ARCHITECTURE.md` §8, `AI_EXPERIENCE.md` §Memory/§Context Awareness, `PRD.md` §7.13
    - Allowed files to modify: new `ai/agents/traveler_profile_agent.py`; new `ai/prompts/traveler_profile_prompt.py`; new `ai/schemas/traveler_profile.py`
    - Priority: High | Complexity: M | Context: M
    - Acceptance: zero field overlap with `traveler_profile.py`/`user_memory` (checked and stated explicitly in this task's handoff, the same check `MEM-02` performed against `PROF-02` before it was built); read-only against both tables — this agent never writes to `traveler_profile.py` (that remains `PROF-02`'s owned write path via `/api/v1/profile/me`)
    - **Delivered:** `ai/agents/traveler_profile_agent.py` (`TravelerProfileAgent` — the first concrete Core Agent, and the first subclass of `Agent`), `ai/prompts/traveler_profile_prompt.py`, `ai/schemas/traveler_profile.py` (`TravelerProfileSummary`, an `AgentOutputBase` subclass). **Read-only mechanically verified**, not just asserted: a dedicated test confirms `reason()` leaves both tables untouched when neither row exists yet, unlike `get_or_create_profile`/`get_or_create_memory`. **Zero field overlap confirmed**: `TravelerProfileSummary`'s preference fields are a read-time projection of the existing source of truth (constructed fresh on every call), never a second persisted copy — no migration, no new table. Only `summary` is LLM-authored; every structured value and `reasoning` are deterministic pass-throughs, making `GUIDELINES.md` §8's "never invent" rule structurally unbreakable for this agent's own data. **First `ai/` file to import FROM `backend/app/`** (its two ORM models) — flagged explicitly as this task's own named scope, not an accidental layering violation. 9 new tests; 203/203 suite passing; mypy strict clean. Full verification: `PROJECT_STATE.md` "Verification Results (2026-09-13, AGENTS-04)".

- Task `ATLAS-P2-AGENTS-05` — Destination Intelligence Agent — **✅ DONE (2026-09-14)**
    - **Scope:** discovery, ranking, and comparison via `AGENTS-03`'s RAG retrieval over static/curated sources only.
    - Dependencies: AGENTS-01 ✅ through AGENTS-04 ✅
    - Required docs: `ARCHITECTURE.md` §8, `PRD.md` §7.2, `AI_EXPERIENCE.md` §Explainability
    - Allowed files to modify: new `ai/agents/destination_intelligence_agent.py`; new `ai/prompts/destination_intelligence_prompt.py`; new `ai/schemas/destination.py`
    - Priority: High | Complexity: M | Context: M
    - Acceptance: every recommendation explains why it was selected (`AI_EXPERIENCE.md` §Explainability — "Why this? Why now? Why for me?"); never returns a destination not grounded in the retrieved static/curated set — no fabricated destinations, weather, or facts
    - **Delivered:** `ai/agents/destination_intelligence_agent.py` (`DestinationIntelligenceAgent`), `ai/prompts/destination_intelligence_prompt.py`, `ai/schemas/destination.py` (`DestinationOption`, `DestinationRecommendation`). **⚠ Significant scope decision, flagged prominently:** `AGENTS-03`'s existing curated set has zero destination-specific content by design, so this task adds a **second, separate 8-entry curated destination reference set** (real destinations; general/evergreen characteristics only — never a price, current weather figure, safety alert, or visa rule), indexed into a **new, separate Qdrant collection**, reusing `AGENTS-03`'s generic `QdrantKnowledgeStore`/`CuratedDocument`/`HashingEmbeddingProvider` unmodified — `AGENTS-03`'s own files and collection are untouched (confirmed by re-diff). Every returned destination's name/id is mechanically checked against the actual curated set in tests — a hallucinated destination in the model's own prose can never reach the structured output, since `destinations` is built entirely from retrieval results, never parsed from model text. A real retrieval-noise issue (a gibberish query scoring above a genuine one, from the hashing embedding's own known limitation) was found via testing and fixed with an empirically-derived relevance threshold inside this task's own file. 14 new tests; 217/217 suite passing; mypy strict clean. Full verification: `PROJECT_STATE.md` "Verification Results (2026-09-14, AGENTS-05)".

- Task `ATLAS-P2-AGENTS-06` — Budget Agent (estimate-only) — **✅ DONE (2026-09-15)**
    - **Scope:** cost **estimation** only — no real pricing exists until Phase 3's Flight/Hotel adapters (Q3, confirmed). Every response explicitly states it is an estimate.
    - Dependencies: AGENTS-01 ✅ through AGENTS-04 ✅
    - Required docs: `PRD.md` §7.9, `AI_EXPERIENCE.md` §Budget Assistance/§Uncertainty, `GUIDELINES.md` §8 ("Never invent prices")
    - Allowed files to modify: new `ai/agents/budget_agent.py`; new `ai/prompts/budget_prompt.py`; new `ai/schemas/budget.py`
    - Priority: Medium | Complexity: M | Context: M
    - Acceptance: **every output includes an explicit, unambiguous uncertainty/estimate disclosure** — a hard acceptance gate, not a style preference (Q3); no absolute price is ever presented as confirmed or booked
    - **Delivered:** `ai/agents/budget_agent.py` (`BudgetAgent`), `ai/prompts/budget_prompt.py`, `ai/schemas/budget.py` (`BudgetCategory`, `BudgetEstimate`). **Never invents a price**: the only concrete number this agent ever shows is the traveler's own stated total, parsed by a plain regex (zero LLM involvement, 8 parametrized test cases) and allocated across a fixed, general 30/20/20/20/10 spending split — a personal-finance-style heuristic, not destination pricing data; with no stated total, no amount is shown at all, only the percentage split. **Q3's hard gate is Pydantic-enforced**, not merely prompted: `BudgetEstimate.estimate_disclosure` is a required, non-empty field, proven to reject construction without it. The first Core Agent needing no external infrastructure at all (no DB, no Qdrant, no tools). 19 new tests; 236/236 suite passing; mypy strict clean. Full verification: `PROJECT_STATE.md` "Verification Results (2026-09-15, AGENTS-06)".

- Task `ATLAS-P2-AGENTS-07` — Itinerary Planner Agent — **✅ DONE (2026-09-16)**
    - **Scope:** daily schedules, consuming Destination Intelligence (`AGENTS-05`) and Budget (`AGENTS-06`) output.
    - Dependencies: AGENTS-05 ✅, AGENTS-06 ✅
    - Required docs: `ARCHITECTURE.md` §8, `AI_EXPERIENCE.md` §Itinerary Generation, `PRD.md` §7.3
    - Allowed files to modify: new `ai/agents/itinerary_planner_agent.py`; new `ai/prompts/itinerary_planner_prompt.py`; new `ai/schemas/itinerary.py`
    - Priority: High | Complexity: L | Context: L
    - Acceptance: every itinerary section (overview/daily schedule/transportation/accommodation/estimated costs/tips) is present per `AI_EXPERIENCE.md` §Itinerary Generation; budget figures carry Budget Agent's own estimate disclosure forward, never restated as confirmed
    - **Delivered:** `ai/agents/itinerary_planner_agent.py` (`ItineraryPlannerAgent`), `ai/prompts/itinerary_planner_prompt.py`, `ai/schemas/itinerary.py` (`ItineraryDay`, `ItineraryPlan`). **First genuine agent-to-agent composition**: constructed with actual `DestinationIntelligenceAgent`/`BudgetAgent` instances, calling their own `reason()` directly — `ItineraryPlan.destination`/`.budget` hold those calls' literal return objects, mechanically proven in tests (not merely documented) to carry `AGENTS-06`'s own exact disclosure and `AGENTS-05`'s own exact retrieved description forward unchanged. The day-by-day schedule is a general, honestly-labeled template (never a fabricated specific activity) except Day 1, which reuses the retrieved destination description verbatim. Tips reuse three of `AGENTS-03`'s own already-curated documents verbatim — no new content-curation surface opened. 20 new tests; 256/256 suite passing; mypy strict clean. Full verification: `PROJECT_STATE.md` "Verification Results (2026-09-16, AGENTS-07)".

- Task `ATLAS-P2-AGENTS-08` — Recommendation Agent — **✅ DONE (2026-09-17)**
    - **Scope:** personalized ranking, consuming Traveler Profile (`AGENTS-04`) and Destination Intelligence (`AGENTS-05`) output.
    - Dependencies: AGENTS-04 ✅, AGENTS-05 ✅
    - Required docs: `ARCHITECTURE.md` §8, `AI_EXPERIENCE.md` §Recommendations, `PSYCHOLOGY_GUIDELINES.md` §13 (Decision Fatigue), §15 (Explainable AI)
    - Allowed files to modify: new `ai/agents/recommendation_agent.py`; new `ai/prompts/recommendation_prompt.py`; new `ai/schemas/recommendation.py`
    - Priority: Medium | Complexity: M | Context: M
    - Acceptance: curated, ranked output, not an exhaustive list (`PSYCHOLOGY_GUIDELINES.md` §13 — "Never display 50 hotels at once"); every recommendation states its relevance reasoning, not a generic label
    - **Delivered:** `ai/agents/recommendation_agent.py` (`RecommendationAgent`, composing real `TravelerProfileAgent`/`DestinationIntelligenceAgent` instances), `ai/prompts/recommendation_prompt.py`, `ai/schemas/recommendation.py` (`Recommendation`, `RecommendationList`). Personalization is a literal, case-insensitive substring overlap between a saved preference and a destination's own retrieved description — never an inferred fit assessment. `_MAX_RECOMMENDATIONS = 5` (matching §13's own "Recommend Top 5" wording) is a real, code-enforced ceiling, proven with a synthetic input larger than the cap. 22 new tests; 278/278 suite passing; mypy strict clean. Full verification: `PROJECT_STATE.md` "Verification Results (2026-09-17, AGENTS-08)".

- Task `ATLAS-P2-AGENTS-09` — Multi-agent integration — **✅ DONE (2026-09-17)**
    - **Scope:** wires all five Core Agents into the Orchestrator's real dispatch (`AGENTS-01`), and — the one task in this module that touches them — **replaces `chat_service.py`'s direct `conversation_manager` calls with a call into the Orchestrator**, adds status messages during generation (`"Finding destinations..."` / `"Building your itinerary..."` per `TRIP_PLANNING_EXPERIENCE.md` §AI Understanding Phase — no fake percentages), and confirms the existing SSE stream (`CHAT-04`'s wire format) carries them without a breaking change to the frontend contract.
    - Dependencies: AGENTS-01 through AGENTS-08 (the only task in this module depending on more than two prior tasks)
    - Required docs: `TRIP_PLANNING_EXPERIENCE.md` §AI Understanding Phase, `ARCHITECTURE.md` §7, `AI_EXPERIENCE.md` §Streaming
    - Allowed files to modify: `backend/app/services/chat_service.py`, `backend/app/api/v1/chat.py` (both — for the first time since `CHAT-04`); new orchestrator-dispatch wiring under `ai/orchestrator/**`
    - Priority: High | Complexity: L | Context: L
    - Acceptance: the existing `CHAT-04` SSE frontend consumer (`frontend/lib/chat/stream-assistant-reply.ts`) requires **no changes** — the wire format is preserved exactly, only the backend's internal generation path changes; a live end-to-end smoke test (dependency-injected fake or real provider, matching every prior Phase 1 session's verification standard) confirms `/chat` still works for a guest user with zero regression before this task is considered done
    - **Delivered:** `ai/orchestrator/agent_wiring.py` (`build_agent_registry` — process-wide singleton for the three agents needing no traveler identity, per-request for Traveler Profile/Recommendation), extended `ai/orchestrator/__init__.py`, extended `backend/app/services/chat_service.py`/`backend/app/api/v1/chat.py`. Guest gets 3 of 5 Core Agents; an authenticated caller (resolved by a deliberately never-raising helper, `/chat` staying unguarded throughout) gets all 5. Zero SSE contract change mechanically proven — every pre-existing `tests/test_chat.py` assertion passes unmodified; the new, purely additive `"status"` frame verified inert against `frontend/lib/chat/stream-assistant-reply.ts`'s own unmodified parse logic. 17 new tests across two new files; 295/295 suite passing; mypy strict clean. Full verification: `PROJECT_STATE.md` "Verification Results (2026-09-17, AGENTS-09)".

**Parallelization (per `CONVERSATION_STRATEGY.md` §8 — neither task's declared Dependencies names the other, and their Allowed Files to Modify don't overlap) — historical record, module now fully sequential-complete:**
- `AGENTS-05` (Destination) and `AGENTS-06` (Budget) ran in parallel-eligible position once `AGENTS-01`–`04` were Done — neither depended on the other and they touched disjoint new files.
- `AGENTS-07` (Itinerary) and `AGENTS-08` (Recommendation) touched disjoint new files (`itinerary_planner_agent.py` vs `recommendation_agent.py`) and neither's Dependencies named the other — eligible to run in parallel, though this session executed them sequentially (`07` on 2026-09-16, `08` on 2026-09-17).
- `AGENTS-09` was a hard serialization point — the only task in this module whose Dependencies field named more than two prior tasks. Executed immediately after `AGENTS-08`, within the same session, once all eight prior tasks were confirmed Done.
- No task in this module ran in parallel with any Phase 1 task (none remained — Phase 1 was closed) or with any Phase 3–7 task (none of those phases is elaborated to Task level yet).

**Phase 2 exit criteria — ✅ ALL MET (2026-09-17):** all nine `AGENTS` tasks Done; `/chat` is served by real multi-agent dispatch (not the Phase 1 single-model passthrough) with zero regression to the existing guest-mode streaming contract (mechanically proven — every pre-existing `tests/test_chat.py` assertion passes unmodified); every Core Agent's output is grounded (RAG-retrieved or profile-derived), never fabricated (`BRAND_GUIDELINES.md` §13, `GUIDELINES.md` §8); Budget Agent's estimate-only framing is present in 100% of its outputs (Q3, Pydantic-enforced); `TRIPPLAN` frontend elaboration (Q2) can now begin as its own separate, future Task-level pass, since real agent output now exists for it to consume.

Unlocks: `TRIPPLAN` (once separately elaborated — Q2) and, partially, `TIMELINE`/`TRIPDET` become buildable against real (if estimate-flagged) data.

## PHASE 3 — External Data Integration — Wave 1 Task-level elaboration (2026-09-17); implementation not yet started

**Status note:** Wave 1 (the foundational adapter infrastructure plus the five `ROADMAP.md` Phase 3 integration categories) elaborated to Task level 2026-09-17, per the project owner's explicit approval of Q1–Q5 (formal record: `DESIGN_BIBLE_AMENDMENTS.md` Amendment 011). **`ATLAS-P3-INTEG-01` is done (2026-09-17)** — the module's real foundation; **`INTEG-02` through `INTEG-06` are now Definition-of-Ready.** Each still requires its own explicit `"Execute ATLAS-P3-INTEG-NN"` instruction before implementation begins.

**Wave 1 objective:** every one of `ROADMAP.md`'s five Phase 3 integration categories (Maps, Weather, Currency, Travel/Safety Sources, Events) has a real, provider-agnostic adapter — timeout, retry, provider-scoped rate limiting, caching, validation/error normalization, and monitoring hooks all real and tested — with live network verification performed only where a real credential exists (`GUIDELINES.md` §13; Q4). Flight and Hotel remain explicitly out of scope (Q1). Weather Agent, Currency Agent, Safety Agent, Events Agent, and every other Domain Agent that will eventually *consume* these adapters are explicitly **not** part of Wave 1 (Q5) — see "Wave 2", below.

**Consolidation note (resolves a naming conflict — see `PROJECT_STATE.md`'s Findings for this session and `DESIGN_BIBLE_AMENDMENTS.md` Amendment 011):** this WBS previously sketched Phase 3 as three separate module sketches (`INTEG-MAPS`/`INTEG-WEATHER`/`INTEG-CURRENCY`/`INTEG-EVENTS` as four adapter modules, `DOMAIN-AGENTS` as a twelve-agent module, and `RAG` — which was never actually Phase 3 scope; it shipped inside Phase 2's `AGENTS-03`). Per the project owner's explicit approval, Wave 1 is elaborated as **one consolidated module, `INTEG`**, with flat `ATLAS-P3-INTEG-01..06` task IDs — mirroring `AGENTS`'s own consolidation precedent exactly. `DOMAIN-AGENTS` is reserved as Wave 2's own future module name, not elaborated here. `CONVERSATION_STRATEGY.md` §2 is updated to match.

### Module: INTEG (External Data Integration, Wave 1)

Cross-references `ARCHITECTURE.md` §11–12, `ROADMAP.md` Phase 3, `MASTER_IMPLEMENTATION_ROADMAP.md` Phase 3, `GUIDELINES.md` §13. No numbered Design Bible document governs this module — it is backend/AI-layer only, same as `AGENTS` (`COMPONENT_OWNERSHIP_MATRIX.md` not touched; `CONVERSATION_STRATEGY.md` §7's backend-only exception applies).

**Phase 1/2 infrastructure this module reuses (verified against the actual repository baseline this session, not assumed — full detail: `PHASE3_INTEG_WBS_PROPOSAL.md` Part 2):**
- `ai/tools/{types,registry,service}.py` (`AGENTS-03`) — `INTEG-01` **extends** this, does not rebuild it (mirroring `AGENTS-01`'s own "extend, don't rebuild" precedent for `conversation_manager`): `ToolService.invoke()` already owns permission-check + input/output validation + monitoring; `INTEG-01` adds the four capabilities that layer does not yet have (timeout, retry, provider-scoped rate limiting, caching), plus validation/error normalization and adapter-granularity monitoring hooks, as new plumbing `Tool`-compatible adapters call *through*, not a parallel tool system.
- `app/core/rate_limit.py`'s `RateLimiter` (`AUTH-02`) — Redis `INCR`+`EXPIRE`, but keyed **per-client-IP**, built for inbound HTTP requests. `INTEG-01` either finds a clean way to reuse it with a fixed, non-per-IP key for provider-scoped (not client-scoped) limiting, or builds a small sibling class if that reuse doesn't fit — `INTEG-01`'s own implementing session decides and reports which, per `MASTER_RULES.md` §5.
- `app/core/redis.py`'s `get_redis_client()` singleton (`AUTH-02`) — the one existing piece a new response cache builds on; no second Redis client is created.
- `ai.providers.base.LLMProvider` (`CHAT-03`) and `ai.rag.embeddings.EmbeddingProvider` (`AGENTS-03`) — **the provider-abstraction pattern every Wave 1 adapter's own provider-agnostic contract (Q2/Q3) is expected to follow**: an abstract interface the rest of the system depends on, with a swappable concrete implementation chosen inside the module that owns it, never exposed upward.
- No adapter, `base_adapter.py`, or `integrations/` module of any kind exists anywhere in the real repository today (confirmed this session by direct search — see `PHASE3_INTEG_WBS_PROPOSAL.md` Part 2). Earlier documentation (`DEBUG_LOG.md`'s M0 record) claiming otherwise traces to a since-superseded bootstrap-reconstruction attempt, not the current baseline — treated here as **not built**, matching this project's own established practice of verifying against the real repo rather than a stale claim.
- No credential, key, or URL for any Maps/Weather/Currency/Events/Safety-source provider exists anywhere (`.env.example`, read in full this session — only `OPENAI_API_KEY` is a real, live-provider key). See Q4 below.

**Approved scope decisions this elaboration incorporates (Q1–Q5, confirmed by the project owner; formal record: `DESIGN_BIBLE_AMENDMENTS.md` Amendment 011):**
- **Q1 — Flight/Hotel phase placement:** both stay **outside Phase 3**, deferred to Phase 6, per `ROADMAP.md`'s/`DEBUG_LOG.md`'s own more specific statements. The conflict against `ARCHITECTURE.md` §11 (which lists Flights/Hotels alongside Maps/Weather/Currency) is documented, permanently, in Amendment 011 — **not corrected**; `ARCHITECTURE.md`'s own body is not edited by this elaboration or by any Wave 1 task.
- **Q2/Q3 — Maps and Weather adapters must be provider-agnostic:** provider-specific code stays entirely inside the adapter's own implementation; no Domain Agent (Wave 2) may depend on, or know, which concrete backend an adapter uses. No specific concrete provider is selected by this elaboration — that choice belongs to `INTEG-03`'s/`INTEG-04`'s own implementing session, made *within* this provider-agnostic contract.
- **Q4 — No live integration and no fabricated credential without a real credential:** every `INTEG-02` through `06` task ships a real, working contract — provider-agnostic interface, real request/response validation, real error handling, real test fixtures (a fake/mock concrete provider, mirroring every Phase 2 agent's own `FakeLLMProvider` pattern) — verified by real tests. Live verification against an actual external endpoint happens only once a real credential is supplied for a provider that needs one; a genuinely keyless provider is not automatically exempted from this gate — whether to exercise a live call against one is each implementing session's own judgment, not pre-decided here.
- **Q5 — Wave 2 (`DOMAIN-AGENTS`) is not elaborated now:** no Domain Agent is designed, scoped, or given a task ID by this elaboration. A separate, later planning pass — after Wave 1 is built and independently verified — is required first.

**Task ID scheme:** `ATLAS-P3-INTEG-{seq}` (flat, per the Consolidation note above).

- Task `ATLAS-P3-INTEG-01` — Adapter foundation: timeout, retry, rate limiting, caching, validation/error normalization, monitoring hooks — **✅ DONE (2026-09-17)**
    - **Scope:** the module's real foundation — every capability below is explicit, named scope, not left implicit, per the project owner's own direction (Amendment 011, part 1): **timeout handling** (every external call bounded); **retry policy** (a documented, bounded number of attempts on a transient failure, never an unbounded loop); **provider-scoped rate limiting** (one shared counter per provider, distinct from `app/core/rate_limit.py`'s existing per-client-IP mechanism — see the infrastructure-reuse note above for how this relates to it); **response caching** (Redis-backed, new — nothing like it exists yet); **validation/error normalization** (every concrete provider's own raw response/error shape converted to one consistent internal type before it reaches any caller — the direct pairing to Q2/Q3's provider-agnostic principle: a Domain Agent, once Wave 2 exists, sees one normalized shape regardless of which concrete backend answered); and **monitoring hooks** (structured logging at adapter granularity — call attempted, cache hit, rate-limited, retried, succeeded, failed — a real addition beyond `ToolService`'s existing tool-level logging, not a duplicate of it).
    - Dependencies: `AGENTS-03` ✅ (Tool Service — this task extends it, per the infrastructure-reuse note above)
    - Required docs: `ARCHITECTURE.md` §11–12, `GUIDELINES.md` §13, §11 (Rate Limiting)
    - Allowed files to modify: new `ai/tools/{external_client,cache}.py` (exact naming TBD by the implementing session); extends (does not rewrite) `app/core/rate_limit.py`/`app/core/redis.py` only if a genuine reusable extension is needed — report before doing so if it is
    - Priority: High (blocks every other `INTEG` task) | Complexity: M | Context: M
    - Acceptance: a cache hit never re-issues the network call (mechanically tested); a call exceeding the configured rate limit is rejected with a clear, typed error before any network call is attempted; a timeout and a documented, bounded number of retries are enforced for every call made through this contract; every concrete provider's own error shape is normalized to one internal error type before it reaches a caller; a structured log event exists for each of: attempted, cache hit, rate-limited, retried, succeeded, failed; all of the above proven with fake/mock provider fixtures, per Q4 — no live network call is required for this task's own tests to pass
    - **Delivered:** `ai/tools/cache.py` (`ResponseCache`, wrapping the existing `app.core.redis.get_redis_client()` singleton — no second Redis connection) and `ai/tools/external_client.py` (`ExternalClient`, `ExternalCallConfig`, `ProviderRateLimiter`, and the three normalized exception types — `ExternalRateLimitedError`, `ExternalTimeoutError`, `ExternalProviderError`). `app/core/rate_limit.py`'s existing `RateLimiter` was found not cleanly reusable as-is (it's a `Request`-coupled, `HTTPException`-raising FastAPI dependency keyed per-client-IP) — `ProviderRateLimiter` is a new, small sibling class reusing the same underlying Redis `INCR`+`EXPIRE` mechanism with a provider-scoped key instead, reported per this task's own note rather than silently forking `RateLimiter`'s body. Neither `app/core/rate_limit.py` nor `app/core/redis.py` was modified. 17 new tests (`test_external_client.py`) — cache hit/miss/TTL-expiry, rate-limit allow/block/shared-across-instances, timeout-then-raise, retryable-then-succeeds, retryable-exhausted-still-raises, non-retryable-fails-immediately, unexpected-exception-normalized, failed-call-never-cached — all against real local Redis, zero live network calls, per Q4. 312/312 suite passing; mypy strict clean: 69 backend files, 45 `ai/` files. `INTEG-02` through `06` are now Definition-of-Ready.

- Task `ATLAS-P3-INTEG-02` — Currency adapter
    - **Scope:** exchange-rate lookups for budget calculations (`ROADMAP.md` Phase 3). Recommended first among the four provider-specific adapters — the one with the most immediate, already-flagged payoff: `AGENTS-06`'s Budget Agent is *permanently* estimate-only (Q3 of Amendment 010, Pydantic-enforced) until real pricing/currency data exists; wiring a real adapter into `BudgetAgent`'s own reasoning is Wave 2 scope (not this task), but this task is the real data source that eventually makes it possible.
    - Dependencies: `ATLAS-P3-INTEG-01`
    - Required docs: `ARCHITECTURE.md` §11 (Currency), `PRD.md` §7.9
    - Allowed files to modify: new `ai/tools/currency_adapter.py`, new schema file under `ai/schemas/` or `ai/tools/`
    - Priority: High | Complexity: M | Context: M
    - Acceptance: a real, working, provider-agnostic contract (Q2/Q3's pattern, applied here even though Q2/Q3 named only Maps/Weather explicitly — the same principle applies); real if a credential is supplied before this task starts, an honest typed "not configured" response otherwise (Q4) — never a fabricated rate; cached, rate-limited, retried, normalized per `INTEG-01`'s contract; does not itself modify `ai/agents/budget_agent.py`

- Task `ATLAS-P3-INTEG-03` — Weather adapter
    - **Scope:** forecast/seasonal data (`ROADMAP.md` Phase 3).
    - Dependencies: `ATLAS-P3-INTEG-01`
    - Required docs: `ARCHITECTURE.md` §11 (Weather — provider unnamed), `PRD.md` §7.8
    - Allowed files to modify: new `ai/tools/weather_adapter.py`, new schema file
    - Priority: Medium | Complexity: M | Context: M
    - Acceptance: same pattern as `INTEG-02`. Provider-agnostic per Q2/Q3 — no specific concrete provider is named by this elaboration; the implementing session selects one, real or stubbed per Q4.

- Task `ATLAS-P3-INTEG-04` — Maps adapter
    - **Scope:** distance/location/route lookups (`ROADMAP.md` Phase 3).
    - Dependencies: `ATLAS-P3-INTEG-01`
    - Required docs: `ARCHITECTURE.md` §11 (Maps: Google Maps API, fallback OpenStreetMap — Q2/Q3 supersedes the "primary provider" framing here: the *contract* must be provider-agnostic regardless of which concrete backend is chosen)
    - Allowed files to modify: new `ai/tools/maps_adapter.py`, new schema file
    - Priority: Medium | Complexity: M | Context: M
    - Acceptance: same pattern. Provider-agnostic per Q2/Q3; concrete provider choice is this task's own, per Q4.

- Task `ATLAS-P3-INTEG-05` — Events adapter
    - **Scope:** local activities/events discovery (`ROADMAP.md` Phase 3).
    - Dependencies: `ATLAS-P3-INTEG-01`
    - Required docs: `ARCHITECTURE.md` §2 (External Provider Independence, general principle — §11 names no specific Events category), `PRD.md` §7.11 (Local Experience Discovery)
    - Allowed files to modify: new `ai/tools/events_adapter.py`, new schema file
    - Priority: Low (no keyless option identified in this session's own research — `PHASE3_INTEG_WBS_PROPOSAL.md` Part 4; least immediately useful without a real key) | Complexity: M | Context: M
    - Acceptance: same pattern — most likely ships as a fully-built, honestly-stubbed contract per Q4, pending a real provider/credential.

- Task `ATLAS-P3-INTEG-06` — Travel/Safety source adapter
    - **Scope:** destination and safety information from an official source (`ROADMAP.md` Phase 3's "Travel Sources"; `PRD.md` §7.7: "Visa information must rely on trusted sources. The AI must never invent immigration rules.").
    - Dependencies: `ATLAS-P3-INTEG-01`
    - Required docs: `ARCHITECTURE.md` §11 (Visa: "Official government sources preferred"), `PRD.md` §7.7
    - Allowed files to modify: new `ai/tools/safety_source_adapter.py`, new schema file
    - Priority: Low (source selection needs real care, per `PRD.md` §7.7's own "official sources preferred" — not a quick pick) | Complexity: M | Context: M
    - Acceptance: same pattern — most likely ships as a fully-built, honestly-stubbed contract per Q4, pending a specific, approved official source.

**Parallelization:** `INTEG-02` through `INTEG-06` touch disjoint new files and none depends on any other — all five may run in parallel once `INTEG-01` is Done, mirroring `AGENTS-05`/`AGENTS-06`'s own established parallel-pair precedent, extended to five.

**Wave 1 exit criteria (1 of 6 tasks Done — `INTEG-01`; not yet met in full):** `INTEG-01` through `06` Done; every adapter meets `GUIDELINES.md` §13's four requirements (adapter layer, error handling, timeout, retry) plus caching and monitoring hooks, structurally, mechanically tested; every adapter is either genuinely live (a real credential was supplied and used) or an honest, clearly-labeled stub, per Q4 — never a fabricated response; zero regression to any existing Phase 1/2 test.

**Wave 2 — Module `DOMAIN-AGENTS` — explicitly NOT elaborated (Q5).** No task ID, scope, or design decision exists for Weather Agent, Currency Agent, Safety Agent, Events Agent, or any other Domain Agent. A separate, later planning pass — after Wave 1's adapters are built and independently verified — is required before this module has any Task-level content. Not started by this session, and not to be started by any future session without its own explicit go-ahead.

**Phase 3 (INTEG) integrity check, 2026-09-17 (elaboration session):** every task's `Allowed files to modify` list touches only new files, or extends (never rewrites) exactly the two existing files named in the infrastructure-reuse note (`app/core/rate_limit.py`, `app/core/redis.py`), and only if `INTEG-01`'s own implementing session finds a genuine need — reported, not assumed. No task depends on anything other than `INTEG-01` (or, for `INTEG-01` itself, `AGENTS-03`, already Done). No Domain Agent, Flight/Hotel adapter, or live credential was invented to fill a gap — every open question this elaboration could not answer on its own authority was surfaced as one of Q1–Q5 and resolved only by the project owner's own explicit decision (Amendment 011). No integrity issue found.

**Phase 3 (INTEG) integrity check update, 2026-09-17 (`INTEG-01`, implementation session):** delivered scope matches the planned scope exactly — `ai/tools/cache.py` and `ai/tools/external_client.py`, both new, both within the declared `ai/tools/{external_client,cache}.py` allowance. `app/core/rate_limit.py`/`app/core/redis.py` were consumed (the latter imported and used directly) but neither was modified — confirmed by re-diff against the `AGENTS-09` baseline; `ProviderRateLimiter` is a new, small sibling class rather than a `RateLimiter` fork, exactly as this task's own Allowed-files-to-modify note anticipated as one acceptable outcome. No dependency violated: `AGENTS-03` was already Done. All six of this task's own Acceptance Criteria bullets were mechanically tested (cache hit skips fetch and rate-limit budget; rate limit blocks before any fetch call; timeout retried then raises `ExternalTimeoutError`; a retryable `ExternalProviderError` is retried then can succeed or exhaust; a non-retryable one fails immediately; any unrecognized exception is normalized to a non-retryable `ExternalProviderError`; every successful call is cached with its configured TTL; a failed call is never cached) — no live network call anywhere in the test file, per Q4. `INTEG-02` through `06` are now Definition-of-Ready. No integrity issue found.

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

**Phase 2 (AGENTS) integrity check update, 2026-09-14 (`AGENTS-05`):** delivered scope stayed within `ai/agents/destination_intelligence_agent.py`, `ai/prompts/destination_intelligence_prompt.py`, and `ai/schemas/destination.py` (all new); no dependency violated (`AGENTS-01` through `04` were all already Done). One significant, prominently-flagged design decision (a second curated content domain, new Qdrant collection) was made and implemented entirely within this task's own three files — confirmed by re-diffing `ai/rag/**` and `ai/tools/**` against the `AGENTS-04` baseline: zero changes to either directory. `AGENTS-06`'s Dependencies field (`AGENTS-01` through `04`) was already satisfied before this session and remains so; `AGENTS-08`'s Dependencies field (`AGENTS-04`, `AGENTS-05`) is now genuinely satisfied in full for the first time. No integrity issue found.

**Phase 2 (AGENTS) integrity check update, 2026-09-15 (`AGENTS-06`):** delivered scope stayed within `ai/agents/budget_agent.py`, `ai/prompts/budget_prompt.py`, and `ai/schemas/budget.py` (all new); no dependency violated (`AGENTS-01` through `04` were all already Done; this task never depended on `AGENTS-05`). Confirmed by re-diff: zero changes to `ai/agents/base.py`, `ai/schemas/base.py`, `ai/orchestrator/**`, `ai/rag/**`, or `ai/tools/**` — this is also the first Core Agent needing no external infrastructure at all. `AGENTS-07`'s Dependencies field (`AGENTS-05`, `AGENTS-06`) is now genuinely satisfied in full for the first time. No integrity issue found.

**Phase 2 (AGENTS) integrity check update, 2026-09-16 (`AGENTS-07`):** delivered scope stayed within `ai/agents/itinerary_planner_agent.py`, `ai/prompts/itinerary_planner_prompt.py`, and `ai/schemas/itinerary.py` (all new); no dependency violated (`AGENTS-05` and `AGENTS-06` were both already Done). This task's own design decision — genuine agent-to-agent composition via direct construction with `DestinationIntelligenceAgent`/`BudgetAgent` instances — required importing (not modifying) both of those tasks' own agent modules; confirmed by re-diff: zero changes to `ai/agents/destination_intelligence_agent.py`, `ai/agents/budget_agent.py`, or any file under `ai/rag/`/`ai/tools/`. `AGENTS-09`'s Dependencies field (`AGENTS-01` through `AGENTS-08`) now has 7 of 8 prerequisites satisfied — only `AGENTS-08` remains. No integrity issue found.

**Phase 2 (AGENTS) integrity check update, 2026-09-17 (`AGENTS-08` and `AGENTS-09`, executed as one task group):** delivered scope matches the planned scope for both tasks — `AGENTS-08` stayed within `ai/agents/recommendation_agent.py`, `ai/prompts/recommendation_prompt.py`, `ai/schemas/recommendation.py` (all new); `AGENTS-09` stayed within `backend/app/services/chat_service.py`, `backend/app/api/v1/chat.py` (both modified, first time since `CHAT-04`) and new `ai/orchestrator/agent_wiring.py` plus an updated `ai/orchestrator/__init__.py` (both within the declared `ai/orchestrator/**` allowance). No dependency violated: `AGENTS-08`'s declared dependencies (`AGENTS-04`, `05`) were already Done at session start; `AGENTS-09`'s full dependency list (`AGENTS-01` through `08`) was satisfied within this same session, `08` completed immediately before `09` began, per `SESSION_PROMPT.md`'s task-group handling. Confirmed by re-diff: zero changes to any of the five agent files, `ai/orchestrator/{orchestrator,registry,intent,types}.py`, or any file under `ai/rag/`/`ai/tools/`; `app/core/deps.py`/`app/core/security.py`/`app/core/session_store.py`/`app/db/session.py`/`app/schemas/chat.py` were all consumed (imported, called) but not edited. One real, empirically-required fix mid-task, resolved entirely within `AGENTS-09`'s own new file (`ai/orchestrator/agent_wiring.py`'s `reset_for_tests()`) — not a Task-boundary violation, since process-wide agent caching (a design decision this task made itself) breaking per-test provider overrides is a consequence of this task's own new code, not a defect in any earlier task's deliverable. **`AGENTS-09` was the module's sole hard serialization point and is now Done — Phase 2's Dependencies graph has no remaining open edges.** No integrity issue found. **Phase 2 (AGENTS) is now fully closed: 9 of 9 tasks Done, zero open dependencies, zero Todo items remaining in this module.**

---

**END OF DOCUMENT (this baseline)**

**LOCK STATUS:**
**LIVING — approved 2026-07-22 baseline, updated 2026-08-13 (Bootstrap Reconciliation — added Module: DESIGNSYS), updated 2026-09-08 (Phase 1 — Core Platform MVP complete), updated 2026-09-09 (Phase 2 — AI Agent System elaborated to Task level, Module: AGENTS added, documentation-only, Q1–Q4 approved — see `DESIGN_BIBLE_AMENDMENTS.md` Amendment 010; no Phase 2 task authorized for implementation by this update), updated 2026-09-10 (`ATLAS-P2-AGENTS-01` — AI Orchestrator core — done, the first Phase 2 task implemented; `AGENTS-02` is now Definition-of-Ready), updated 2026-09-12 (`ATLAS-P2-AGENTS-02` and `ATLAS-P2-AGENTS-03` — done, executed as one task group; `AGENTS-04` is now Definition-of-Ready), updated 2026-09-13 (`ATLAS-P2-AGENTS-04` — done, the first concrete Core Agent; `AGENTS-05` and `AGENTS-06` are now both Definition-of-Ready), updated 2026-09-14 (`ATLAS-P2-AGENTS-05` — done, the first agent to consume `AGENTS-03`'s RAG/Tool infrastructure, adding a second curated content domain; `AGENTS-08` is now also Definition-of-Ready), updated 2026-09-15 (`ATLAS-P2-AGENTS-06` — done, Budget Agent, never invents a price, Q3's hard disclosure gate Pydantic-enforced; `AGENTS-07` is now Definition-of-Ready for the first time), updated 2026-09-16 (`ATLAS-P2-AGENTS-07` — done, the first task requiring genuine agent-to-agent composition, Itinerary Planner Agent; `AGENTS-08` remains the last task standing between the module and `AGENTS-09`'s own Definition-of-Ready), updated 2026-09-17 (`ATLAS-P2-AGENTS-08` and `ATLAS-P2-AGENTS-09` — done, executed as one task group — Recommendation Agent, personalized ranking via literal preference-overlap only; and the multi-agent integration wiring all five Core Agents into a real `/chat` request for the first time, zero SSE contract change mechanically proven. **Phase 2 — AI Agent System is now fully closed, 9 of 9 `AGENTS` tasks Done, Phase 3 elaboration is the recommended next step**), updated 2026-09-17 (Phase 3 — External Data Integration, Wave 1, elaborated to Task level — `Module: INTEG`, `ATLAS-P3-INTEG-01..06`, per the project owner's Q1–Q5 sign-off — `DESIGN_BIBLE_AMENDMENTS.md` Amendment 011; `INTEG-01`, the real adapter foundation (timeout, retry, provider-scoped rate limiting, caching, validation/error normalization, monitoring hooks), is Definition-of-Ready; no Phase 3 task authorized for implementation by this update; Wave 2 `Module: DOMAIN-AGENTS` explicitly deferred to its own future planning pass), updated 2026-09-17 (`ATLAS-P3-INTEG-01` — done, same day, third update — the module's real foundation: `ai/tools/cache.py`/`external_client.py`, `ProviderRateLimiter` a new sibling class rather than a `RateLimiter` fork, 17 new tests, zero live network calls per Q4; **`INTEG-02` through `06` are now Definition-of-Ready**). Future changes only via the governed End-of-Session Checklist in `MASTER_RULES.md` §21.**
