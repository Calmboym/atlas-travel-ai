# TASK_BOARD.md

**Last updated:** 2026-08-22 (AUTH-02 through AUTH-05)
**Document tier:** Living — updated every session via `MASTER_RULES.md` §21.

Columns: Backlog → Todo → In Progress → Blocked → Review → Done. Every card cites its WBS ID and required documentation set so it can be picked up without re-deriving context. **Governance Sessions** (below) are a separate, non-WBS category — documentation/process work, not product implementation; see `MASTER_RULES.md` §3 Scope Control for why these never carry a WBS ID.

---

## Bootstrap — ✅ COMPLETE (2026-07-22)

| Task ID | Title | Priority | Docs Used |
|---|---|---|---|
| ATLAS-BOOTSTRAP-01 | Full analysis of all 33 source documents; Documentation Audit, Dependency Graph, WBS, Roadmap, Conversation Strategy, Execution Plan | Critical | All 33 source documents |
| ATLAS-BOOTSTRAP-02 | `.ai/` memory system creation (6 files) | Critical | Bootstrap deliverables above |
| ATLAS-BOOTSTRAP-03 | Q1–Q4 review, approval, planning-document lock pass, `DESIGN_BIBLE_AMENDMENTS.md` | Critical | DOCUMENTATION_AUDIT_REPORT.md |
| ATLAS-BOOTSTRAP-RECONCILE | Bootstrap Reconciliation: repo-level audit, 6 real infrastructure bugs fixed (all verified), real `.ai/` folder created, Amendments 004/005/006 approved | Critical | This session — see `.ai/ATLAS-BOOTSTRAP-IMPLEMENTATION-REPORT.md` |

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

*(All Done items sourced from `DEBUG_LOG.md` M0 record, completed 2026-07-13.)*

## Done (Phase 1 — Core Platform MVP)

| Task ID | Title | Priority | Docs Used | Completed |
|---|---|---|---|---|
| ATLAS-P1-AUTH-01 | Registration UI (form + validation) | High | INDEX.md §AUTH, PRD.md §6, `APPLICATION_LAYOUT_GUIDE.md` §Authentication Layout, `ACCESSIBILITY.md` §Forms, `DESIGN_TOKENS.md` Part 6 | 2026-07-24 |

**Audit note (2026-08-19, non-WBS — see Governance Sessions below):**
AUTH-01's own files were audited against the live repository and found
to have zero `next-intl` usage anywhere (every string hardcoded
English) plus a locale-dropping `next/link` and one physical-CSS RTL
bug in the required-field asterisk. All four fixed and verified live
across en/fa/de (see `PROJECT_STATE.md`, 2026-08-19 entry). AUTH-01's
own Status stays **Done** — this was a bug-fix pass on an already-
shipped deliverable, not new scope, and its original acceptance
criteria (real-time validation, accessible labels) were never in
question, only its localization.
| ATLAS-P1-DESIGNSYS-01 | Design Token → CSS/Tailwind wiring + ThemeProvider | High | `DESIGN_TOKENS.md` Parts 1–5, `DESIGN_SYSTEM.md` | 2026-07-29 |
| ATLAS-P1-DESIGNSYS-02 | Core UI primitives (27 components) | High | `COMPONENT_OWNERSHIP_MATRIX.md`, `COMPONENT_INVENTORY.md`, `DESIGN_TOKENS.md` Part 6, `ACCESSIBILITY.md` | 2026-07-29 |
| ATLAS-P1-DESIGNSYS-03 | Layout shells (MarketingLayout/ApplicationLayout/FocusLayout) + navigation shell (Navbar/Sidebar/MobileBottomNav/MobileNavDrawer/Footer/LanguageSwitcher/ThemeSwitcher/SkipLink) | High | `APPLICATION_LAYOUT_GUIDE.md`, `RESPONSIVE_SYSTEM.md`, `COMPONENT_OWNERSHIP_MATRIX.md` | 2026-08-15 |
| ATLAS-P1-DESIGNSYS-04 | Glass system (GlassSurface/GlassCard) + AnimationWrappers (FadeIn/SlideIn/ScaleIn/ScrollReveal) + MotionProvider + BackgroundSystem | Medium | `DESIGN_TOKENS.md` §Atlas Glass Design Language, `MOTION_SYSTEM.md`, `PREMIUM_MICROINTERACTIONS.md`, `ACCESSIBILITY.md` §Motion Accessibility | 2026-08-16 |
| ATLAS-P1-AUTH-02 | Registration backend endpoint + secure password storage | High | INDEX.md §AUTH, `ARCHITECTURE.md` §12, `GUIDELINES.md` §11, `INFRASTRUCTURE_BASELINE.md` §8 | 2026-08-22 |
| ATLAS-P1-AUTH-03 | OAuth button scaffolding (Google/Apple) — **stubbed handshake, reported per acceptance criteria** | Medium | INDEX.md §AUTH, `COMPONENT_OWNERSHIP_MATRIX.md` | 2026-08-22 |
| ATLAS-P1-AUTH-04 | Email verification flow — **email delivery stubbed** (no SMTP provider documented anywhere) | Medium | INDEX.md §AUTH | 2026-08-22 |
| ATLAS-P1-AUTH-05 | Login UI + backend endpoint | High | INDEX.md §AUTH, `COMPONENT_OWNERSHIP_MATRIX.md`, `ARCHITECTURE.md` §4 | 2026-08-22 |

**Verification status (DESIGNSYS-03, 2026-08-15 — actually executed, not asserted):** typecheck clean · lint 0 errors/0 warnings (2 real `react-hooks/set-state-in-effect` violations found and fixed at the root, not suppressed) · 129/129 tests passing across 20/20 files (98 pre-existing + 31 new) · production build succeeds, including the two new orphan route-group layouts with zero pages under them yet · RTL confirmed correct for en/fa/de via live HTTP requests against the real standalone server, with header/footer/nav landmarks confirmed present in the actual rendered HTML · `/en/register` (AUTH-01) confirmed still working, untouched.

**Verification status (DESIGNSYS-04, 2026-08-16 — actually executed, not asserted):** typecheck clean · lint 0 errors/0 warnings · 155/155 tests passing across 24/24 files (129 pre-existing + 26 new) · production build succeeds · RTL confirmed correct for en/fa/de via live HTTP requests against the real standalone server, with the new `atlas-noise` BackgroundSystem layer confirmed present in the actual rendered HTML · `/en/register` and DESIGNSYS-03's nav/layout shell confirmed still working, untouched. One real bug found and fixed mid-session (not asserted away): Framer Motion 11.18.2's own exported `useReducedMotion()` hook does not actually re-render on a live OS preference change despite its docstring claiming it does (confirmed by reading the installed library source) — `MotionProvider` was built on `useSyncExternalStore` instead, mirroring `ThemeProvider`'s already-proven pattern for the equivalent `prefers-color-scheme` case, and is covered by a test that verifies live updates, not just initial-mount reads.

**Verification status (AUTH-02 through AUTH-05, 2026-08-22 — actually executed against real infrastructure, not asserted):** `backend/app/` held zero application code before this session (confirmed: only `.gitkeep`) — first real backend implementation in the repository. No Docker daemon available, so PostgreSQL 16 and Redis 7 (matching `docker-compose.yml`'s own pinned versions) were installed and run directly via apt for genuine verification rather than mocks. Backend: mypy strict clean (32 files) · 45/45 pytest passing (register, login, verify-email/resend, security unit tests, rate-limiter unit tests, OAuth-stub tests) · a real `alembic downgrade base` → `upgrade head` roundtrip · a full live-server curl smoke test covering register/login/duplicate-email/wrong-password/nonexistent-user/weak-password/verify-email(valid+reused+expired)/resend(anti-enumeration)/OAuth-stub/rate-limiting-at-exactly-the-configured-threshold. Frontend: typecheck clean · lint 0 errors/0 warnings · 180/180 tests passing across 28/28 files (155 pre-existing + 25 new) · production build succeeds (14 static/dynamic routes, including new `/login` and `/verify-email`) · RTL confirmed correct for en/fa/de via a live standalone-server smoke test, with real German/Persian translations (not placeholder English) rendering for the new pages. Two real bugs found and fixed mid-session (not asserted away): (1) `pytest-asyncio`'s default function-scoped event loop invalidated the module-level-cached SQLAlchemy engine and Redis client between tests (`RuntimeError: Event loop is closed`) — fixed via `asyncio_default_fixture_loop_scope = "session"` / `asyncio_default_test_loop_scope = "session"`, matching how these singletons are actually used in the running app; (2) a real `react-hooks/set-state-in-effect` violation in `VerifyEmailContent` (calling `setState` synchronously for a value already known at render time) — fixed by making the "missing token" case a plain render-time branch instead of effect-driven state, not suppressed. Full detail, including the flagged Python file-naming convention gap (MASTER_RULES.md §15's "lowercase-with-hyphens" is not valid for importable Python modules — snake_case used instead, necessarily) and every other scope decision: `.ai/PROJECT_STATE.md`.

---

## Governance Sessions (non-WBS)

| Session ID | Title | Docs Used | Completed |
|---|---|---|---|
| ATLAS-BOOTSTRAP-RECONCILE | Bootstrap Reconciliation: repo-level audit, 6 real infrastructure bugs fixed (all verified), real `.ai/` folder created, Amendments 004/005/006 approved | This session — see `.ai/ATLAS-BOOTSTRAP-IMPLEMENTATION-REPORT.md` (archival) | 2026-08-13 |
| ATLAS-GOVERNANCE-RECONCILE-02 | Governance Reconciliation: `COMPONENT_OWNERSHIP_MATRIX.md` Foundation table fully corrected (~24 stale rows), `INDEX.md` DESIGNSYS status corrected, `INFRASTRUCTURE_BASELINE.md` created, Sidebar-width and `/settings`-route conflicts closed (Amendments 007/008), CI test step added, incremental-output/dependency-resolution/parallel-execution governance added (Amendment 009), two Bootstrap-era report files relabeled archival | This session — see `.ai/PROJECT_STATE.md` "Files Modified This Session (Governance Reconciliation)" | 2026-08-16 |
| ATLAS-AUTH01-AUDIT-RTL-01 | AUTH-01 Audit & Bug Fix (Localization/RTL): found and fixed a regressed sitewide nested-`<html>` bug (`app/layout.tsx`), a locale-dropping `next/link` in AuthLayout, zero `next-intl` usage across all of AUTH-01's UI/validation/metadata, and one physical-CSS RTL bug in `Label`'s required asterisk. Verified end-to-end (typecheck, lint, 155/155 tests, production build, live standalone-server smoke test across en/fa/de) | This session — see `.ai/PROJECT_STATE.md` "Files Modified This Session (2026-08-19, AUTH-01 Audit & Bug Fix)" | 2026-08-19 |

---

## Todo (Phase 1 — Core Platform MVP)

| Task ID | Title | Priority | Dependencies | Docs Required | Est. Context |
|---|---|---|---|---|---|
| ATLAS-P1-AUTH-06 | Forgot-password flow | Medium | AUTH-05 ✅ | INDEX.md §AUTH | S |
| ATLAS-P1-AUTH-07 | Session/token handling + rate limiting | High | AUTH-02 ✅, AUTH-05 ✅ | INDEX.md §AUTH | M |
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

*(LAND-01, CHAT-01, DASH-01, PROF-03 now have a genuinely verified Foundation *and* layout/navigation shell available — Card, Button, Container, Stack, Typography, feedback shells, Overlays, MarketingLayout/ApplicationLayout/FocusLayout, and the full nav shell are ready to consume. LAND-01 in particular now has a real `MarketingLayout` to build its Hero/Content Sections/CTA inside, at `frontend/app/[locale]/(marketing)/page.tsx`. DASH-01/PROF-03 fill `Navbar`'s and `ApplicationLayout`'s `userSlot`/`notificationsSlot` props with their own ProfileMenu/NotificationCenter — those are their components to build, not DESIGNSYS-03's.)*

---

## In Progress

*(empty — no session has started)*

## Blocked

*(empty)*

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

**END OF DOCUMENT**

**LOCK STATUS:**
**LIVING — approved 2026-07-22 baseline, updated 2026-07-24, 2026-07-29 (×2), 2026-08-13 (Bootstrap Reconciliation), 2026-08-15 (DESIGNSYS-03 complete), 2026-08-16 (DESIGNSYS-04 complete; Governance Reconciliation, same date, second session), 2026-08-19 (AUTH-01 Audit & Bug Fix — Localization/RTL), 2026-08-22 (AUTH-02 through AUTH-05 complete — first real backend/app/ code in the repository). Future changes only via the governed End-of-Session Checklist in `MASTER_RULES.md` §21.**
