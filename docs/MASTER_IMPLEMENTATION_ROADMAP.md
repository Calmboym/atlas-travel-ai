# Master Implementation Roadmap

**Project:** Atlas — AI Travel Platform
**Date:** 2026-07-22
**Status:** LOCKED — approved baseline, 2026-07-22, following Q1–Q4 sign-off. Point-in-time phase-completion snapshot as of the lock date; live "what phase are we in right now" tracking lives in `.ai/PROJECT_STATE.md`, not here — this document does not get silently edited as work progresses.
**Canonical phase numbering:** `ROADMAP.md`'s 0–7 scheme (see Audit Finding 8 for why).
**Note:** Q1–Q4 are approved (see `.ai/PROJECT_STATE.md` and `.ai/DESIGN_BIBLE_AMENDMENTS.md`); none change this roadmap's sequencing. Implementation of Phase 1 remains **not authorized** — this roadmap describes the plan, not a green light to build.

## Phase Numbering Reconciliation

| Canonical (this doc, = ROADMAP.md) | MASTER_BUILD_PROMPT.md equivalent |
|---|---|
| Phase 0 — Foundation Setup | Phase 1 — Foundation |
| Phase 1 — Core Platform MVP | Phase 2 — Core Platform |
| Phase 2 — AI Agent System | Phase 3 — AI Architecture |
| Phase 3 — External Data Integration | Phase 4 — Core Agents *(partially)* / Phase 5 — External Integrations |
| Phase 4 — Personalized Travel Intelligence | *(not separately numbered in MASTER_BUILD_PROMPT)* |
| Phase 5 — MVP Beta Release | *(not separately numbered in MASTER_BUILD_PROMPT)* |
| Phase 6 — Advanced Travel Platform | *(not separately numbered in MASTER_BUILD_PROMPT)* |
| Phase 7 — Global Scale | *(not separately numbered in MASTER_BUILD_PROMPT)* |

From this point forward, all Atlas planning documents use the canonical Phase 0–7 numbering only.

---

## Phase 0 — Foundation Setup — ✅ COMPLETE (2026-07-13)

Per `DEBUG_LOG.md` M0 record. Delivered: monorepo, Docker Compose, FastAPI + async SQLAlchemy/Alembic/Redis/Qdrant backend with health checks and structured logging, Next.js 16 + TypeScript + Tailwind v4 + shadcn/ui frontend with EN/FA/DE i18n, AI provider abstraction (OpenAI live), integration adapter contracts, CI/CD. No further action required; see `.ai/WORK_BREAKDOWN_STRUCTURE.md` §Phase 0 for the itemized record.

---

## Phase 1 — Core Platform MVP — ▶ CURRENT (Milestone M1)

**Goal:** a user can register, log in, hold a real (streamed) conversation with the AI assistant, and maintain a basic profile.

**Modules, in dependency order** (see `DEPENDENCY_GRAPH.md` §4):

1. **Landing / Guest Entry** — marketing layout, AI search box entry point, guest chat with session-only memory. No registration wall.
2. **Authentication** — email/password registration, OAuth button scaffolding (Google/Apple), email verification, login, forgot-password, session/token handling, rate limiting on auth endpoints.
3. **Basic Profile** — progressive collection (never a 20-question form), profile page shell.
4. **AI Chat (single-model, non-agent)** — chat layout, streaming responses, conversation persistence, typing indicators. Full multi-agent orchestration is explicitly **Phase 2**, not Phase 1.
5. **Basic Memory** — guest session memory (client-side, cleared on browser close) and authenticated persistent preference storage. Long-term "trip memory" is explicitly **Phase 4**.
6. **Dashboard shell** — opens to last AI conversation, or the Welcome Dashboard for first-time users. Full widget set (budget, weather, checklist) is deferred to when Trip data exists (Phase 2+).

**Exit criteria:** a user can complete Flow 03 (Register) and Flow 06 (Continue Chat) from `USER_FLOWS.md` end-to-end, in under the PRD's 2-minute registration target, with no dead ends per `USER_FLOWS.md` Flow 20/21.

**Key docs:** PRD §6–7, ARCHITECTURE §5/§7, GUIDELINES §11, ONBOARDING_EXPERIENCE (16), AI_EXPERIENCE (17) — conversation/streaming sections only, DASHBOARD_EXPERIENCE (18), APPLICATION_LAYOUT_GUIDE (26) — Authentication/Application Layout sections, ACCESSIBILITY (09) — forms section, DESIGN_TOKENS (14) — Button/Input contracts.

---

## Phase 2 — AI Agent System

**Goal:** move from a single AI assistant to the multi-agent architecture: AI Orchestrator, Agent Service, Core Agents (Destination Intelligence, Itinerary Planner, Recommendation, Budget, Traveler Profile), structured outputs, agent routing/communication.

**Depends on:** Phase 1's Conversation Management.
**Unlocks:** Trip Planning Experience (19), Travel Timeline Experience (22) can now be built against real generated itineraries rather than static mocks.

---

## Phase 3 — External Data Integration

**Goal:** connect agents to real-world data — Maps, Weather, Currency, Travel/Safety sources, Events — each behind an adapter with error handling, caching, and rate limiting (no exceptions, per `GUIDELINES.md` §13).

**Depends on:** Phase 2's Tool Service.
**Unlocks:** Trip Details Experience (20) reservation/weather sections become real; Notification & Communication Experience (23) can fire on real events (delays, weather) instead of mocked ones.

---

## Phase 4 — Personalized Travel Intelligence

**Goal:** complete traveler profile, travel history, preference learning, saved trips, long-term Memory Service (distinct from Phase 1's basic/temporary memory), user-controlled memory editing/deletion.

**Depends on:** Phase 1 basic Memory + Phase 3 verified data (personalization needs real trips to learn from).

---

## Phase 5 — MVP Beta Release

**Goal:** hardening, not new features — security review, performance testing, AI evaluation, user testing, full Design QA Checklist (24) pass on every shipped screen. Public beta gate.

---

## Phase 6 — Advanced Travel Platform

**Goal:** flight/hotel/activity booking + payment integration, Telegram Bot, mobile application (both against the *same* backend APIs per `ARCHITECTURE.md` §15), voice assistant, autonomous planning, real-time monitoring, smart notifications.

**Depends on:** Phase 3's adapter architecture (new booking adapters plug into the existing pattern; no new abstraction layer needed).

---

## Phase 7 — Global Scale

**Goal:** marketplace, partner ecosystem, local guides, corporate travel, communities, premium AI tier. Architecture-only readiness is required now; no build work until Phase 6 ships.

---

## Current Position Marker

*(snapshot as of 2026-07-22 — for live status, always defer to `.ai/PROJECT_STATE.md`)*

```
Bootstrap ██████████ 100% — DONE (2026-07-22), Q1–Q4 approved, all planning docs locked
Phase 0 ██████████ 100% — DONE (2026-07-13)
Phase 1 ░░░░░░░░░░   0% — READY, but NOT AUTHORIZED to start
Phase 2 ░░░░░░░░░░   0%
Phase 3 ░░░░░░░░░░   0%
Phase 4 ░░░░░░░░░░   0%
Phase 5 ░░░░░░░░░░   0%
Phase 6 ░░░░░░░░░░   0%
Phase 7 ░░░░░░░░░░   0%
```

**Recommended next WBS task, once implementation is authorized:** `ATLAS-P1-AUTH-01` (Authentication — Registration form + backend endpoint). See `.ai/WORK_BREAKDOWN_STRUCTURE.md` and `.ai/PROJECT_STATE.md` for the exact handoff. As of this document's lock date, that authorization has not been given.

**Sequencing rationale:** Landing/Guest-chat could technically start first (no auth dependency, per the Dependency Graph), but Authentication is sequenced first here because Profile, persistent Memory, and the Dashboard's "last conversation" behavior all require it, and because `MASTER_BUILD_PROMPT.md` Phase 2 (= canonical Phase 1) explicitly lists Authentication before Basic AI Chat. Guest-mode Chat and Landing can be picked up as parallel/concurrent WBS tasks by a second conversation without conflict — see `CONVERSATION_STRATEGY.md`.


---

**END OF DOCUMENT**

**LOCK STATUS:**
**IMMUTABLE — approved baseline, 2026-07-22, following Q1–Q4 sign-off.**
