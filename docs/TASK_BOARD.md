# TASK_BOARD.md

**Last updated:** 2026-07-22 (Q1–Q4 approval / lock pass)
**Document tier:** Living — updated every session via `MASTER_RULES.md` §21. This is the approved 2026-07-22 baseline, not a frozen snapshot.

Columns: Backlog → Todo → In Progress → Blocked → Review → Done. Every card cites its WBS ID and required documentation set so it can be picked up without re-deriving context.

---

## Bootstrap — ✅ COMPLETE (2026-07-22)

| Task ID | Title | Priority | Docs Used |
|---|---|---|---|
| ATLAS-BOOTSTRAP-01 | Full analysis of all 33 source documents; Documentation Audit, Dependency Graph, WBS, Roadmap, Conversation Strategy, Execution Plan | Critical | All 33 source documents |
| ATLAS-BOOTSTRAP-02 | `.ai/` memory system creation (6 files) | Critical | Bootstrap deliverables above |
| ATLAS-BOOTSTRAP-03 | Q1–Q4 review, approval, planning-document lock pass, `DESIGN_BIBLE_AMENDMENTS.md` | Critical | DOCUMENTATION_AUDIT_REPORT.md |

Implementation work (Phase 1 Todo, below) remains **NOT AUTHORIZED** — see `PROJECT_STATE.md`.

## Done (Phase 0 — Foundation)

| Task ID | Title | Priority | Docs Used |
|---|---|---|---|
| ATLAS-P0-REPO | Monorepo structure, .gitignore, .env.example, README | High | ARCHITECTURE §3–4 |
| ATLAS-P0-BE | FastAPI + async SQLAlchemy + Alembic + Redis + Qdrant | High | ARCHITECTURE §6–10 |
| ATLAS-P0-HEALTH | `/api/v1/health` endpoint (postgres+redis+qdrant checks) | High | ARCHITECTURE §6 |
| ATLAS-P0-LOG | Structured logging (structlog, request-id middleware) | Medium | GUIDELINES §18 |
| ATLAS-P0-SEC | Security scaffold (rate limit, validation, injection sanitizer) | High | GUIDELINES §11 |
| ATLAS-P0-FE | Next.js 16 + TypeScript strict + Tailwind v4 + shadcn/ui | High | ARCHITECTURE §4 |
| ATLAS-P0-I18N | i18n (next-intl) — EN, FA (RTL), DE | High | PRD §9 |
| ATLAS-P0-SMOKE | Frontend smoke health page → backend health | Medium | ARCHITECTURE §5 |
| ATLAS-P0-AI-IFACE | LLMProvider interface + OpenAIProvider + model tiering | High | ARCHITECTURE §2, §8 |
| ATLAS-P0-AI-LOG | Token usage logging for cost tracking | Medium | ARCHITECTURE §14 |
| ATLAS-P0-ADAPTERS | base_adapter.py (retry, timeout, cache, fallback, monitoring) | High | ARCHITECTURE §11 |
| ATLAS-P0-ADAPT-CONTRACTS | Maps/Weather/Currency contracts; Flights/Hotels reserved | Medium | ARCHITECTURE §11 |
| ATLAS-P0-DOCKER | Dockerfile.backend, Dockerfile.frontend, docker-compose.yml | High | ARCHITECTURE §13 |
| ATLAS-P0-CI | GitHub Actions (lint+test+build, all services) | Medium | GUIDELINES §14 |

*(All Done items sourced from `DEBUG_LOG.md` M0 record, completed 2026-07-13. Reconstructed as task cards for board continuity — no new work performed.)*

---

## Todo (Phase 1 — Core Platform MVP)

| Task ID | Title | Priority | Dependencies | Docs Required | Est. Context |
|---|---|---|---|---|---|
| ATLAS-P1-AUTH-01 | Registration UI (form + validation) | High | none | INDEX.md §AUTH | M |
| ATLAS-P1-AUTH-02 | Registration backend endpoint + password hashing | High | none | INDEX.md §AUTH | M |
| ATLAS-P1-AUTH-03 | OAuth button scaffolding (Google/Apple) | Medium | AUTH-01 | INDEX.md §AUTH | S |
| ATLAS-P1-AUTH-04 | Email verification flow | Medium | AUTH-02 | INDEX.md §AUTH | S |
| ATLAS-P1-AUTH-05 | Login UI + backend endpoint | High | AUTH-02 | INDEX.md §AUTH | M |
| ATLAS-P1-AUTH-06 | Forgot-password flow | Medium | AUTH-05 | INDEX.md §AUTH | S |
| ATLAS-P1-AUTH-07 | Session/token handling + rate limiting | High | AUTH-02, AUTH-05 | INDEX.md §AUTH | M |
| ATLAS-P1-AUTH-08 | Route guards (frontend) + RBAC scaffold (backend) | Medium | AUTH-07 | INDEX.md §AUTH | M |
| ATLAS-P1-PROF-01 | Progressive profile-collection UI | Medium | AUTH-07 | INDEX.md §PROF | M |
| ATLAS-P1-PROF-02 | User Profile Service (backend CRUD) | Medium | AUTH-07 | INDEX.md §PROF | S |
| ATLAS-P1-PROF-03 | Profile page shell | Low | PROF-02 | INDEX.md §PROF | S |
| ATLAS-P1-LAND-01 | Marketing layout shell (Header/Hero/CTA/Footer) | High | none | INDEX.md §LAND | M |
| ATLAS-P1-LAND-02 | AI search box + rotating example prompts | Medium | LAND-01 | INDEX.md §LAND | S |
| ATLAS-P1-LAND-03 | "Continue as Guest" entry wiring | Medium | LAND-01 | INDEX.md §LAND | S |
| ATLAS-P1-CHAT-01 | Chat page layout (sidebar/conversation/composer) | High | none | INDEX.md §CHAT | M |
| ATLAS-P1-CHAT-02 | Message components (Bubble/Streaming/Typing) | High | CHAT-01 | INDEX.md §CHAT | M |
| ATLAS-P1-CHAT-03 | Conversation Manager (basic, single-model) backend | High | none | INDEX.md §CHAT | L |
| ATLAS-P1-CHAT-04 | Streaming endpoint (SSE) | High | CHAT-03 | INDEX.md §CHAT | M |
| ATLAS-P1-MEM-01 | Guest session memory (client-side, temporary) | Medium | CHAT-02 | INDEX.md §MEM | S |
| ATLAS-P1-MEM-02 | Authenticated preference storage (basic) | Medium | AUTH-07 | INDEX.md §MEM | S |
| ATLAS-P1-DASH-01 | Dashboard shell (opens to last conversation / Welcome) | Medium | CHAT-03, AUTH-07 | INDEX.md §DASH | M |

---

## In Progress

*(empty — no session has started)*

## Blocked

*(empty — none of the Phase 1 Todo items are blocked; Q1–Q4 in PROJECT_STATE.md are advisory, not blocking, per that file's note)*

## Review

*(empty)*

## Backlog (Phase 2–7, module/feature level only — see WORK_BREAKDOWN_STRUCTURE.md for detail)

| Phase | Modules |
|---|---|
| Phase 2 | AI Orchestrator, Agent Service, Core Agents (5) |
| Phase 3 | Maps/Weather/Currency/Events integration, Domain Agents (12) |
| Phase 4 | Long-term Memory Service, Personalized Recommendations |
| Phase 5 | Security review, performance testing, AI evaluation, Design QA pass |
| Phase 6 | Booking + payments, Telegram Bot, Mobile app, Voice assistant |
| Phase 7 | Marketplace, partner ecosystem, corporate travel |


---

**END OF DOCUMENT (this baseline)**

**LOCK STATUS:**
**LIVING — approved 2026-07-22 baseline. Future changes only via the governed End-of-Session Checklist in `MASTER_RULES.md` §21.**
