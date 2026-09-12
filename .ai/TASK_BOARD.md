# TASK_BOARD.md

**Last updated:** 2026-09-12 (`ATLAS-P2-AGENTS-02` and `ATLAS-P2-AGENTS-03` — Agent base contract + structured-output schemas, and Tool Service + RAG over a real local Qdrant server — complete, executed as one task group; moved from Todo to Done; `AGENTS-04` now Definition-of-Ready). Prior: 2026-09-10 (`ATLAS-P2-AGENTS-01` — AI Orchestrator core — complete; the first Phase 2 implementation task, moved from Todo to a new "Done (Phase 2)" table; `AGENTS-02` now Definition-of-Ready). Prior: 2026-09-09 (Phase 2 — AI Agent System elaborated to Task level, `Module: AGENTS`, 9 tasks added to Todo — documentation-only, Q1–Q4 approved; see `DESIGN_BIBLE_AMENDMENTS.md` Amendment 010); 2026-09-08 (`DASH-01` complete — Phase 1 fully closed); 2026-09-06 (MEM-01 through MEM-02 — the MEM module is closed).
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
| ATLAS-P1-AUTH-07 | Session/token handling + rate limiting | High | INDEX.md §AUTH, `INFRASTRUCTURE_BASELINE.md` §8 | 2026-08-24 |
| ATLAS-P1-AUTH-06 | Forgot-password flow | Medium | INDEX.md §AUTH, `COMPONENT_OWNERSHIP_MATRIX.md` | 2026-08-24 |
| ATLAS-P1-AUTH-08 | Route guards (frontend) + RBAC scaffold (backend) — **no protected page exists yet to guard; see verification note** | Medium | INDEX.md §AUTH, `ARCHITECTURE.md` §12 | 2026-08-24 |
| ATLAS-P1-PROF-02 | User Profile Service (backend CRUD) | Medium | INDEX.md §PROF, `APPLICATION_LAYOUT_GUIDE.md` §Profile Sections | 2026-08-25 |
| ATLAS-P1-PROF-01 | Progressive profile-collection UI (Profile Wizard) | Medium | INDEX.md §PROF, `USER_FLOWS.md` Flow 03, `ONBOARDING_EXPERIENCE.md` §Progressive Profile Collection, `COMPONENT_OWNERSHIP_MATRIX.md` | 2026-08-25 |
| ATLAS-P1-PROF-03 | Profile page shell (Cover/Avatar/Personal Info/Preferences) — **avatar upload UI is real; storage persistence stubbed, see verification note** | Low | INDEX.md §PROF, `APPLICATION_LAYOUT_GUIDE.md` §Profile Page, `COMPONENT_OWNERSHIP_MATRIX.md` | 2026-08-25 |
| ATLAS-P1-LAND-01 | Marketing layout shell (Header/Hero/CTA/Footer) | High | INDEX.md §LAND, `01_BRAND_GUIDELINES.md`, `02_PRODUCT_VISION.md`, `26_APPLICATION_LAYOUT_GUIDE.md` §Marketing Layout | 2026-08-29 |
| ATLAS-P1-LAND-02 | AI search box + rotating example prompts | Medium | INDEX.md §LAND, `19_TRIP_PLANNING_EXPERIENCE.md` §Step 1 (Dream) | 2026-08-29 |
| ATLAS-P1-LAND-03 | "Continue as Guest" entry wiring | Medium | INDEX.md §LAND, `16_ONBOARDING_EXPERIENCE.md` §Guest Experience, `USER_FLOWS.md` Flow 02 | 2026-08-29 |
| ATLAS-P1-MEM-01 | Guest session memory (client-side, cleared on browser close) | Medium | INDEX.md §MEM, `17_AI_EXPERIENCE.md` §Memory | 2026-09-06 |
| ATLAS-P1-MEM-02 | Authenticated preference storage (basic tier) | Medium | INDEX.md §MEM, `17_AI_EXPERIENCE.md` §Memory, `PRD.md` §7.13, `ARCHITECTURE.md` §7 | 2026-09-06 |
| ATLAS-P1-DASH-01 | Dashboard shell (opens to last conversation / Welcome) — fills Navbar's/ApplicationLayout's `userSlot`/`notificationsSlot` with real `ProfileMenu`/`NotificationCenter` | Medium | INDEX.md §DASH, `COMPONENT_OWNERSHIP_MATRIX.md` §4, `INFRASTRUCTURE_BASELINE.md` §1/§3 | 2026-09-08 |

**Verification status (DASH-01, 2026-09-08 — actually executed, not asserted):** typecheck clean · lint 0 errors/0 warnings · 385/385 tests passing across 63/63 files (361 pre-existing + 24 new) · production build succeeds, `/dashboard` listed as a real route · RTL confirmed correct for en/fa/de via a live standalone-server smoke test — including an *authenticated* pass (a dummy `atlas_access_token` cookie set directly, bypassing only the edge cookie-*presence* check per `proxy.ts`'s own documented scope, since no live backend exists in this session to issue a real one) confirming `/dashboard` itself actually renders (200, correct `<title>` per locale — "Dashboard — Atlas" / "داشبورد — اطلس" — correct `lang`/`dir`), not just the pre-login redirect. Unauthenticated requests to `/en/dashboard` and `/fa/dashboard` both correctly 307 to their locale's `/login?redirect=...`, confirming `AUTH-08`'s route guard is now actually protecting a real page for the first time since it shipped. Five new Shared components delivered per `COMPONENT_OWNERSHIP_MATRIX.md` §4's own outstanding rows: `ProfileMenu`, `NotificationCenter` (both `PROF-03` explicitly deferred — see that task's own docstring), `QuickActions`, `ConnectionStatus`, `RetryCard` (both unclaimed since `CHAT-01` — DASH-01 is "whichever ships first" per that row). `AIQuickAccess` remains the one Shared component still unclaimed in the matrix — genuinely optional per this task's own Acceptance Criteria, not silently dropped.

**Scope decisions, stated plainly:** (1) Travel Summary Hero, Travel Timeline, and every trip-data-backed widget (Budget/Weather/Checklist) are explicitly **not** built — `18_DASHBOARD_EXPERIENCE.md` itself scopes the Hero to "when an active trip exists," and Trip Service doesn't exist until Phase 2+ (`DEPENDENCY_GRAPH.md` §4/§5); building them now would mean fabricating trip data, which `BRAND_GUIDELINES.md` §13 forbids. The Phase-1-relevant parts of the same document (§Default Landing, §Empty Dashboard) are what's implemented instead. (2) "Last conversation" is read from `MEM-01`'s guest-session-store (sessionStorage; applies regardless of auth status per that task's own scope decision) — `CHAT-03`/`04`'s backend is deliberately stateless, so there is no other persisted conversation history to read in Phase 1; a new read-only `peekGuestSession()` export was added to that file (additive, no existing behavior changed) rather than duplicating its read/parse logic. (3) `ProfileMenu` fetches its own `GET /auth/me` + `GET /profile/me` independently of `DashboardPageContent`'s identical fetch — Navbar is a layout-level sibling of page content, not a parent with shared state, and no caching layer exists yet. `lib/api/client.ts`'s own prior comment already anticipated this exact moment ("TanStack Query is a reasonable addition whenever a future task actually needs query caching, e.g. Dashboard data fetching") — flagged here as a real, now-current architectural opportunity rather than silently added (a new dependency is outside one task's unilateral scope per `MASTER_RULES.md` §5) or silently ignored. (4) `logoutRequest()` added to `lib/api/auth.ts` and wired into `ProfileMenu` — the backend's `POST /auth/logout` endpoint has existed since `AUTH-07` but had no frontend caller anywhere in the app until now. (5) `DashboardPageContent`'s fetch-failure path checks for a 401 specifically and redirects to `/login?redirect=/dashboard`, fulfilling `proxy.ts`'s own documented expectation ("a page that receives a 401... is expected to redirect to /login itself once such a page exists") for the first time, since Dashboard is the first authenticated page in the app with a real client-side data fetch.

**Phase 1 — Core Platform MVP is now fully complete.** Every module in `MASTER_IMPLEMENTATION_ROADMAP.md`'s Phase 1 list (Landing/Guest Entry, Authentication, Basic Profile, AI Chat, Basic Memory, Dashboard shell) has shipped. See `PROJECT_STATE.md` for the full closing summary and the Phase 2 readiness note.

**Verification status (DESIGNSYS-03, 2026-08-15 — actually executed, not asserted):** typecheck clean · lint 0 errors/0 warnings (2 real `react-hooks/set-state-in-effect` violations found and fixed at the root, not suppressed) · 129/129 tests passing across 20/20 files (98 pre-existing + 31 new) · production build succeeds, including the two new orphan route-group layouts with zero pages under them yet · RTL confirmed correct for en/fa/de via live HTTP requests against the real standalone server, with header/footer/nav landmarks confirmed present in the actual rendered HTML · `/en/register` (AUTH-01) confirmed still working, untouched.

**Verification status (DESIGNSYS-04, 2026-08-16 — actually executed, not asserted):** typecheck clean · lint 0 errors/0 warnings · 155/155 tests passing across 24/24 files (129 pre-existing + 26 new) · production build succeeds · RTL confirmed correct for en/fa/de via live HTTP requests against the real standalone server, with the new `atlas-noise` BackgroundSystem layer confirmed present in the actual rendered HTML · `/en/register` and DESIGNSYS-03's nav/layout shell confirmed still working, untouched. One real bug found and fixed mid-session (not asserted away): Framer Motion 11.18.2's own exported `useReducedMotion()` hook does not actually re-render on a live OS preference change despite its docstring claiming it does (confirmed by reading the installed library source) — `MotionProvider` was built on `useSyncExternalStore` instead, mirroring `ThemeProvider`'s already-proven pattern for the equivalent `prefers-color-scheme` case, and is covered by a test that verifies live updates, not just initial-mount reads.

**Verification status (AUTH-02 through AUTH-05, 2026-08-22 — actually executed against real infrastructure, not asserted):** `backend/app/` held zero application code before this session (confirmed: only `.gitkeep`) — first real backend implementation in the repository. No Docker daemon available, so PostgreSQL 16 and Redis 7 (matching `docker-compose.yml`'s own pinned versions) were installed and run directly via apt for genuine verification rather than mocks. Backend: mypy strict clean (32 files) · 45/45 pytest passing (register, login, verify-email/resend, security unit tests, rate-limiter unit tests, OAuth-stub tests) · a real `alembic downgrade base` → `upgrade head` roundtrip · a full live-server curl smoke test covering register/login/duplicate-email/wrong-password/nonexistent-user/weak-password/verify-email(valid+reused+expired)/resend(anti-enumeration)/OAuth-stub/rate-limiting-at-exactly-the-configured-threshold. Frontend: typecheck clean · lint 0 errors/0 warnings · 180/180 tests passing across 28/28 files (155 pre-existing + 25 new) · production build succeeds (14 static/dynamic routes, including new `/login` and `/verify-email`) · RTL confirmed correct for en/fa/de via a live standalone-server smoke test, with real German/Persian translations (not placeholder English) rendering for the new pages. Two real bugs found and fixed mid-session (not asserted away): (1) `pytest-asyncio`'s default function-scoped event loop invalidated the module-level-cached SQLAlchemy engine and Redis client between tests (`RuntimeError: Event loop is closed`) — fixed via `asyncio_default_fixture_loop_scope = "session"` / `asyncio_default_test_loop_scope = "session"`, matching how these singletons are actually used in the running app; (2) a real `react-hooks/set-state-in-effect` violation in `VerifyEmailContent` (calling `setState` synchronously for a value already known at render time) — fixed by making the "missing token" case a plain render-time branch instead of effect-driven state, not suppressed. Full detail, including the flagged Python file-naming convention gap (MASTER_RULES.md §15's "lowercase-with-hyphens" is not valid for importable Python modules — snake_case used instead, necessarily) and every other scope decision: `.ai/PROJECT_STATE.md`.

**Verification status (AUTH-06 through AUTH-08, 2026-08-24 — actually executed against real infrastructure, not asserted):** Execution order was AUTH-07 → AUTH-06 → AUTH-08 (WBS declares no dependency between 06 and 07; 07 was sequenced first so 06's password-reset could revoke sessions through 07's own store, and 08 needs 07 regardless). PostgreSQL 16 + Redis 7 installed and run directly via apt, same as the prior session. Backend: mypy strict clean (36 files) · 88/88 pytest passing (45 pre-existing + 24 session/refresh/logout/`/me` + 12 forgot/reset-password + 5 direct `require_role` unit tests, plus 2 default-role/`. /me`-exposure integration tests) · two real `alembic downgrade → upgrade head` roundtrips (one per new migration) · a full live-server curl smoke test covering the entire chain: register → login → `/me` (role visible) → forgot-password → reset-password with the real emailed token → **the pre-reset session cookie confirmed rejected (401) against the live server, not just in pytest** → old password rejected → new password accepted → new session's `/me` confirmed working. Frontend: typecheck clean · lint 0 errors/0 warnings · 241/241 tests passing across 35/35 files (214 pre-existing + 27 new, including a real integration test against `proxy.ts`'s actual middleware export using `next/server`'s `NextRequest`/`NextResponse` directly — confirmed working in this Vitest environment before relying on it, not assumed) · production build succeeds (20 static pages, `/forgot-password` and `/reset-password` both compiling, Proxy/Middleware recognized). Three real bugs found and fixed mid-session (not asserted away): (1) `sa.Enum(UserRole, ...)` without `values_callable` stores Python enum *member names* ("USER") as Postgres enum labels instead of `.value`s ("user"), which would have silently conflicted with `server_default=UserRole.USER.value` — caught by actually running the generated migration, not by reading the autogenerated file; (2) Alembic's `op.add_column` with a native Postgres enum does not auto-emit `CREATE TYPE` the way `op.create_table` does — the first `alembic upgrade head` attempt failed with `type "user_role" does not exist`, fixed with an explicit `postgresql.ENUM(...).create()`/`.drop()` pair; (3) a content bug, not a logic bug — `Auth.resetPassword.genericError` was mistakenly authored with token-specific text ("This reset link is invalid or has expired") instead of a generic retry message, which a network-failure test caught by asserting the *displayed* text, not just that an error appeared. **AUTH-08 scope note, stated plainly:** the backend RBAC scaffold (`role` column, `require_role`) is complete and directly tested, but no admin-only endpoint exists yet to protect (none is in scope anywhere in Phase 1) — `require_role` is exercised as a plain function in `test_rbac.py`, not wired onto a fabricated route. The frontend route guard (`proxy.ts` + `lib/auth/protected-routes.ts`) is real and verified against the actual middleware function, but guards paths (`/dashboard`, `/trips`, `/saved`, `/notifications`, `/profile`, `/settings`) that don't have real pages yet (DASH-01/PROF-03/etc. haven't shipped) — same category of honest limitation as AUTH-03's OAuth stub. `/chat` and `/help` are deliberately NOT guarded — `/chat` because guest-mode AI Chat is explicit, locked product scope (ONBOARDING_EXPERIENCE.md §Guest Experience), `/help` because it isn't in `INFORMATION_ARCHITECTURE.md`'s route table at all and Help/FAQ content being public is the safer default absent a stated requirement. Full detail: `.ai/PROJECT_STATE.md`.

**Verification status (PROF-01 through PROF-03, 2026-08-25 — actually executed against real infrastructure, not asserted):** Execution order was PROF-02 → PROF-01 → PROF-03 (WBS declares PROF-01/02 both depend only on AUTH-07 ✅, no dependency between them; PROF-03 depends on PROF-02. Backend sequenced first so the wizard could wire to a real endpoint immediately rather than stub-then-wire, unlike AUTH-01/02's split). PostgreSQL 16 + Redis 7 installed and run directly via apt, same as prior sessions; survived an environment restart mid-session with the database intact, re-verified after. Backend: mypy strict clean (33 files) · 102/102 pytest passing (88 pre-existing + 14 new: auth gate, get-or-create, partial-update semantics including explicit-null-clears-a-field, enum validation, food-preference multi-select validation/dedup, per-user isolation) · a real `alembic upgrade → downgrade → upgrade → downgrade → upgrade` roundtrip, doubled specifically because the first single roundtrip found a real bug (below) · a full live-server curl smoke test (register → login → auto-create empty profile → patch → persist → 401 unauthenticated → 422 invalid enum), plus a second live e2e pass with the frontend proving the authenticated `/profile` page returns 200 (not a redirect) using a real session cookie from the real backend. Frontend: typecheck clean · lint 0 errors/0 warnings · 277/277 tests passing across 39/39 files (241 pre-existing + 36 new: StepIndicator, ProfileWizard, RadioGroupItem's new `card` variant, FileUpload, ImageUpload, ProfilePageContent) · production build succeeds (both `/profile` and `/profile/wizard` compiling) · route guard confirmed both directions live (unauthenticated → redirect to login; authenticated → 200) · RTL confirmed still correct on `/fa/login`. Real, translated (not placeholder) EN/DE/FA copy added for both new `Profile.wizard` and `Profile.page` namespaces, matching the established per-namespace convention. Four real bugs found and fixed mid-session (not asserted away): (1) `op.create_table`'s implicitly-created Postgres enum types are *not* implicitly dropped by `op.drop_table` — a downgrade-then-upgrade failed with `DuplicateObjectError`; fixed with explicit `checkfirst=True` enum drops — the mirror-image of AUTH-06/07/08's own `op.add_column` enum-creation bug, this time on the *drop* side of a fresh `CREATE TABLE` migration; (2) a copy-paste error — a ternary meant only for `budget_level`'s "mid_range" option label leaked into the `travel_preference` Select loop, where that value can never occur; caught by the type checker itself (`TS2367`), no runtime testing needed; (3) `FileUpload`'s original draft used a `role="button"` wrapper around the real (visually hidden) `<input type="file">`, leaving two independently-focusable elements for one logical control; switched to a native `<label htmlFor>` association, which is both less code and correct; (4) that same hidden input's accessible name resolved to the full concatenated text of everything sharing its `<label>` (hint text, or in `ImageUpload`'s case the avatar's fallback-initials text) instead of just the intended label — fixed with an explicit `aria-label`. Fixing (4) also surfaced, via the same test suite, that `@testing-library/user-event` v14 correctly honors `accept="image/*"` when simulating uploads (real, browser-accurate behavior, not a bug) — the "reject a non-image file" test was rewritten to use drag-and-drop, the actual path that bypasses `accept` filtering in both real browsers and this test environment. **PROF-03 scope note, stated plainly:** avatar upload is a real, fully working picker + client-side preview (drag, click, type/size validation) — but no object-storage endpoint exists anywhere in this repository (`ARCHITECTURE.md` §11's External Provider list has no image/file storage entry), so the picked photo is never persisted; the UI says so plainly rather than pretending success, same category of honest limitation as AUTH-03's OAuth stub and AUTH-04's email stub. `ProfileMenu` was deliberately not built (see `COMPONENT_OWNERSHIP_MATRIX.md` §4) — it would need to link to `/trips`, `/saved`, `/dashboard`, none of which have real pages yet; `/profile` remains fully reachable via Sidebar/MobileBottomNav regardless. `preferred_ui_language`/`preferred_travel_language` offer only the app's 3 implemented locales (en/fa/de), not PRD.md §9's wider 8-language ambition, which is Phase 4+ per the already-approved Q4 scope decision. Full detail: `.ai/PROJECT_STATE.md`.

**Verification status (LAND-01 through LAND-03, 2026-08-29 — actually executed, not asserted):** frontend-only, no backend changes. Execution order LAND-01 → LAND-02/LAND-03 (WBS declares both depend only on LAND-01, no dependency between them). Typecheck clean · lint 0 errors/0 warnings · 295/295 tests passing across 49/49 files (277 pre-existing + 18 new: one file per new Landing component plus new shared test infrastructure) · production build succeeds, confirmed via the actual `.next/server/app-paths-manifest.json` (not build success alone) that exactly one manifest entry now backs `/[locale]` · a live standalone-server smoke test across all three locales, plus an unrelated existing route (`/en/register`) re-confirmed unaffected · heading hierarchy (exactly one `<h1>`, no skipped levels) confirmed against the real rendered HTML. Three real bugs found and fixed, none caught by typecheck/lint/build alone: (1) a stray duplicate `app/[locale]/page.tsx` left over from DESIGNSYS-03's move to `(marketing)/page.tsx`, compiling into two separate manifest entries for the same route — found by inspecting the manifest directly, not assumed from a clean build; (2) `CTASection` calling `buttonVariants()` (exported from a `"use client"` file) directly from a Server Component — type-checks and builds cleanly, then crashes with a real 500 the moment the standalone server actually serves the page; caught only by starting it and requesting the page, fixed by marking the component `"use client"`, the same constraint `Navbar` already carries for the identical pattern; (3) `next-intl/server`'s `getTranslations` throws unconditionally under Vitest (jsdom triggers its "not supported in Client Components" guard regardless of the real component boundary) — tried the same async-Server-Component pattern AuthLayout uses for `Footer`, found it broke the pre-existing `tests/layouts.test.tsx` (which renders `MarketingLayout`/`ApplicationLayout` synchronously and cannot await a component nested inside them), built `tests/mocks/next-intl-server.ts` as a working alias-based mock either way (reusable for any future async Server Component test), but reverted `Footer` itself to a synchronous `"use client"` component using `useTranslations` since that has zero real cost here and avoids a recurring workaround for every future test touching a Footer-containing layout. Deliberate scope decisions, not oversights: no Testimonials/Statistics/PartnerLogos/Newsletter section (no real users, reviews, or partners exist yet to describe honestly — `BRAND_GUIDELINES.md` §8/§13); no GSAP or Three.js introduced as new dependencies (neither is currently installed; Framer Motion, already installed, covers this task's motion needs); `AIQuickAccess` (Shared) deliberately left unclaimed for `CHAT-01`, since it needs an actual chat surface to open that doesn't exist yet. Full detail: `.ai/PROJECT_STATE.md`.

| ATLAS-P1-CHAT-01 | Chat page layout (sidebar/conversation/composer) | High | INDEX.md §CHAT, `AI_EXPERIENCE.md` §Communication Style/§Streaming, `APPLICATION_LAYOUT_GUIDE.md` §AI Chat, `ACCESSIBILITY.md` §AI Chat Accessibility | 2026-09-01 |
| ATLAS-P1-CHAT-02 | Message components (MessageBubble/StreamingBubble/TypingIndicator) | High | Above, plus `PREMIUM_MICROINTERACTIONS.md` §AI Response Streaming/§AI Thinking State, `DESIGN_TOKENS.md` Part 6 §AI Chat Bubble | 2026-09-01 |
| ATLAS-P1-CHAT-03 | Conversation Manager (basic, single-model) backend | High | INDEX.md §CHAT, `ARCHITECTURE.md` §2/§7, `GUIDELINES.md` §7/§8/§9, `MASTER_BUILD_PROMPT.md` §10 | 2026-09-05 |
| ATLAS-P1-CHAT-04 | Streaming endpoint (SSE) | High | Above, plus `ARCHITECTURE.md` §7 | 2026-09-05 |

**Verification status (CHAT-01 through CHAT-02, 2026-09-01 — actually executed, not asserted):** frontend-only, no backend changes; execution order CHAT-01 → CHAT-02 as WBS declares (CHAT-02 depends on CHAT-01). File-level split: `lib/chat/*` (types, `use-chat-session.ts`, `simulate-assistant-reply.ts`) and `components/chat/message-bubble.tsx`/`typing-indicator.tsx` are CHAT-02's; `app/[locale]/(app)/chat/page.tsx` and `components/chat/chat-page-content.tsx`/`conversation-sidebar.tsx`/`chat-composer.tsx`/`conversation-panel.tsx` are CHAT-01's — ConversationPanel (CHAT-01) renders CHAT-02's message components, matching the declared dependency direction. Typecheck clean · lint 0 errors/0 warnings · 344/344 tests passing across 55/55 files (295 pre-existing + 49 new: `message-bubble`, `typing-indicator`, `use-chat-session`, `chat-composer`, `conversation-sidebar`, `chat-page-content`) · production build succeeds, `/[locale]/chat` compiling. Live verification (standalone server + Playwright, not just component tests): desktop and mobile (390px) viewports across en/fa/de; full send → thinking → streaming (progressive reveal + blinking cursor) → complete cycle observed via screenshots, not just asserted from code; Stop mid-stream correctly finalizes with the partial text already revealed; Regenerate correctly replaces (not duplicates) the last assistant turn; Copy correctly writes the exact message content to the clipboard and swaps its icon/label for ~2s; keyboard Tab order confirmed correct (the composer's Send button is natively skipped while disabled — empty input — and correctly receives focus once enabled, verified as the *cause*, not assumed, after an initial run appeared to skip it); `fa` confirmed rendering `dir="rtl"` with correct mirroring (sidebar/composer send button both flip sides) and correct bidi handling of the Latin `Enter`/`Shift` key names embedded in Persian sentences; mobile confirmed the composer never renders behind the fixed `MobileBottomNav` (see height note below). Two real bugs found and fixed, neither caught by typecheck/lint/tests alone: (1) `ConversationSidebar`'s own `<h2>` heading visibly duplicated `SheetContent`'s `title` prop inside the mobile drawer — found only by looking at the actual screenshot, fixed with a `showHeading` prop (default `true`, `false` inside the Sheet); (2) `regenerateLastResponse` mutated a plain closure variable from inside a `setConversations` updater and read it back immediately after — not reliably synchronous in React, and this hook's own unit test caught it failing before any UI test did (expected 2 messages, got 1: the regenerate silently no-op'd); fixed by reading `activeConversation.messages` directly instead of round-tripping through the updater. One test-only fix, not a product bug: `useSearchParams()`'s real Next.js return type (`ReadonlyURLSearchParams`) rejected the test's plain `URLSearchParams` mock under `tsc` — invisible to lint or to Vitest itself, which doesn't type-check — fixed using the identical `as ReturnType<typeof useSearchParams>` cast `reset-password-content.test.tsx` already established for this exact situation. **Scope notes, stated plainly:** CHAT-03/04 (the real Conversation Manager backend + SSE endpoint) are untouched; sending a message runs against `lib/chat/simulate-assistant-reply.ts`, a single, isolated, clearly-documented stub that reveals a fixed, honest "this is a preview" notice (never a fabricated travel answer — `BRAND_GUIDELINES.md` §13, `MASTER_RULES.md` §8) with a real progressive-reveal timing model; swapping in CHAT-03/04 later means replacing that one module's internals, not any component. `AIQuickAccess` and `ConnectionStatus`/`RetryCard` (Shared) remain unclaimed — CHAT-01 had a clear opportunity to take either and didn't: `AIQuickAccess` would mean modifying `Navbar` (DESIGNSYS-03 territory) beyond CHAT-01/02's own file boundaries, and `ConnectionStatus` has no live connection to report on without CHAT-03/04. Conversation state is in-memory/React-state only, lost on refresh — `MEM-01`'s explicitly separate, now-unblocked scope (declared dependency: CHAT-02 ✅), not something CHAT-01/02 should pre-build. Copy-to-clipboard is implemented inline inside `MessageBubble` rather than as a new Shared `CopyButton` — none existed yet to consume or duplicate. `ConversationList`/`ConversationCard` (`COMPONENT_INVENTORY.md` naming) ship as one cohesive `ConversationSidebar` component, not separate list/item components; `StreamingBubble` (same document) ships as a direct alias — `export const StreamingBubble = MessageBubble` — since `MessageBubble`'s own `status` field already fully covers the streaming visual and `aria-busy` treatment, not a second implementation to keep in sync. Real, meaning-preserving (not placeholder) EN/FA/DE translations added for the new `Chat` namespace, matching the established per-namespace convention; the pre-existing `Navigation.chat` label ("AI Chat", left untranslated in fa/de) was not changed to match — this task's own new copy is fully translated on its own terms rather than mirroring an ambiguous, unaudited precedent. Full detail: `.ai/PROJECT_STATE.md`.

**Verification status (CHAT-03 through CHAT-04, 2026-09-05 — actually executed against real infrastructure, not asserted):** closes the CHAT module. Execution order CHAT-03 → CHAT-04 as WBS declares. Backend: `ai/` held zero application code before this session (confirmed `.gitkeep` only in `prompts/`/`agents/`/`schemas/`/`evaluations/`, despite `DEBUG_LOG.md`'s M0 record claiming an LLMProvider/OpenAIProvider were already delivered) — this session adds the real provider abstraction for the first time. Real Postgres 16 + Redis 7 (apt-installed, no Docker daemon here, same approach as every prior session) · mypy strict clean across `app/` (34 files), `ai/` (9 files, new CI step added), and the combined CI target (52 files) · 123/123 pytest passing (102 pre-existing + 21 new, `tests/test_chat.py`) · a real `alembic upgrade head` (unchanged — no new tables this session) · a live standalone-server curl smoke test of both endpoints, confirmed only after fixing two real bugs (see below). Frontend: typecheck clean · lint 0 errors/0 warnings · 356/356 tests passing across 56/56 files (344 pre-existing + 12 new/net) · production build succeeds, `/[locale]/chat` still compiling. **Three real bugs found and fixed, none asserted away:** (1) `ModuleNotFoundError: No module named 'ai'` starting the real server — masked by `pytest`'s own `pythonpath` config (added this session for the same `ai/`↔`backend/` boundary) putting the repo root on `sys.path` unconditionally for the whole test session; `app/api/v1/chat.py` imports `ai.providers.base` directly, above its own import of `app/core/ai.py` (the only file with a `sys.path` fix), so that fix ran too late — moved to the top of `app/main.py`, guaranteed-first, mirroring the existing `alembic/env.py` precedent; (2) a malformed request (empty `messages`, or a client-supplied `"system"`-role message) came back `503` instead of `422` whenever the provider was also unconfigured — found via live `curl`, not by any `dependency_overrides`-based test; root cause: FastAPI resolves `Depends()` dependencies as part of the same pass that validates the request body, and the original `get_llm_provider()` raised during that resolution, pre-empting the body-validation error entirely — fixed by having it return `None` instead, checked explicitly inside each route body (which only runs once the body has already validated), with two new regression tests that deliberately don't use `dependency_overrides`; (3) a "late" `onChunk`/`onDone`/`onError` after `stopGenerating()` could silently rewrite an already-finalized message (a real race: an aborted fetch doesn't necessarily silence an in-flight `reader.read()` that already resolved) — found by this session's own new frontend unit test before any manual check; fixed by guarding all three callbacks on `message.status === "streaming"`. **Scope decisions, stated plainly:** stateless by design, no conversation persistence (`MEM-01`/`MEM-02`'s separate territory); no authentication required on either chat endpoint (`/chat` is deliberately unguarded, matching `AUTH-08`'s own note); `CHAT-03`'s non-streaming endpoint deliberately left un-wired to the frontend (building against it then rewiring for `CHAT-04`'s SSE endpoint would have been throwaway work — the frontend swap happened once, onto the streaming endpoint); `prefersReducedMotion` removed entirely from `UseChatSessionOptions` (no real-network equivalent to the retired stub's artificial reveal-skipping); `lib/chat/simulate-assistant-reply.ts` deleted, per its own doc comment's stated intent; OpenAI remains the provider (matching existing `pyproject.toml`/`.env.example` precedent) despite this sandbox's egress proxy blocking `api.openai.com` (confirmed: `403 x-deny-reason: host_not_allowed`) — an environment limitation on live-verifying the real API call, not a reason to change an already-documented architecture decision; verified instead via a dependency-injected fake provider, a live curl smoke test up to the provider boundary, and a from-scratch SSE-parsing test using a real `ReadableStream`. Full detail: `.ai/PROJECT_STATE.md`.

**Verification status (MEM-01 through MEM-02, 2026-09-06 — actually executed against real infrastructure, not asserted):** closes the MEM module — every Phase 1 task is now done except `DASH-01`. Real Postgres 16 + Redis 7 (apt-installed, no Docker daemon here, same approach as every prior session) provisioned fresh this session. Backend: mypy strict clean (37 files) · new `user_memory` migration generated and roundtrip-verified (upgrade → downgrade → upgrade; no enum types involved, so `AUTH-06`'s documented drop-CASCADE gotcha doesn't apply) · 137/137 pytest passing (123 pre-existing + 14 new, `tests/test_memory.py`) · live app import + OpenAPI schema confirmed `/api/v1/memory/me` (GET, PATCH) and `/api/v1/memory/me/{key}` (DELETE) registered. Frontend: typecheck clean · lint 0 errors/0 warnings (including `react-hooks/set-state-in-effect`, the exact rule this task's chosen design was written to satisfy — see below) · 361/361 tests passing across 57/57 files (356 pre-existing + 5 new) · production build succeeds · live standalone-server smoke test on `/en/chat` and `/fa/chat` (correct `lang`/`dir`, no crash). **One real bug found and fixed, not asserted away:** moving `MEM-01`'s guest-session state from per-instance `useState` into a module-level store meant it now persisted across `renderHook`/`render` calls *within a test file* unless reset — `use-chat-session.test.ts` got that reset in the same commit that introduced the store, but the pre-existing `chat-page-content.test.tsx` (which also renders the hook, indirectly via `ChatPageContent`) did not, and started failing: later tests inherited an already-`"streaming"` conversation from an earlier test in the same file, silently no-opting every subsequent `sendMessage()`. Fixed by adding the identical store-reset call to that file's own `beforeEach`. **Scope decisions, stated plainly:** `MEM-01` uses `useSyncExternalStore`, not `useEffect`+`setState` — flagged to and confirmed by the project owner during pre-flight, since `components/layout/sidebar.tsx`'s own history already found the `useEffect`+`setState` version of this exact "hydrate from browser storage" problem violates `react-hooks/set-state-in-effect`; applies regardless of authentication status, since `useChatSession` has no auth concept and `MEM-01`'s only declared dependency is `CHAT-02`. `MEM-02` does **not** duplicate `TravelerProfile` — checked every field `17_AI_EXPERIENCE.md` §Memory and `PRD.md` §7.13 name against `PROF-02`'s model first (per the prior session's own flag): travel style/budget/accommodation/transportation/food/languages are already fully owned there, so `MEM-02` instead builds a generic, schema-less `user_memory` JSONB key/value store — the Phase-1 slice of `ARCHITECTURE.md` §7's "Memory Service" module, backend-only by design since no UI task currently consumes it (confirmed via `COMPONENT_OWNERSHIP_MATRIX.md` §4). Favorite destinations and conversation/itinerary memory remain explicitly unbuilt (Phase 2+/Phase 4, per that same document and `MEM-02`'s own acceptance criterion). `DELETE` is idempotent, matching `PROF-02`'s own established "no-op is not an error" convention. Full detail: `.ai/PROJECT_STATE.md`.

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
| *(none)* | | | | | |

*(Phase 1 is complete — see the closing note under Done above.
`ATLAS-P1-DASH-01` was the last remaining Phase 1 task; both its
dependencies were already satisfied before that session started. No
further Phase 1 tasks remain in this table. `AIQuickAccess` (Shared,
`COMPONENT_OWNERSHIP_MATRIX.md` §4) remains unclaimed — no task in
Phase 1 needed it; it becomes relevant again whenever a Phase 2+ task
first wants a persistent, cross-page AI entry point.)*

---

## Done (Phase 2 — AI Agent System)

| Task ID | Title | Priority | Docs Used | Completed |
|---|---|---|---|---|
| ATLAS-P2-AGENTS-01 | AI Orchestrator core (extends/consumes `CHAT-03`'s Conversation Manager — Q4) | High | `ARCHITECTURE.md` §7–8, `GUIDELINES.md` §7, `MASTER_BUILD_PROMPT.md` §7 | 2026-09-10 |
| ATLAS-P2-AGENTS-02 | Agent framework: base contract + structured-output schemas | High | `ARCHITECTURE.md` §8, `GUIDELINES.md` §7, `MASTER_BUILD_PROMPT.md` §8–9 | 2026-09-12 |
| ATLAS-P2-AGENTS-03 | Tool Service: registry, permissions, validation, RAG (static/curated + Qdrant only — Q1) | High | `ARCHITECTURE.md` §9–10, `GUIDELINES.md` §9, `INFRASTRUCTURE_BASELINE.md` §8 | 2026-09-12 |

**Verification status (AGENTS-01, 2026-09-10 — actually executed
against real infrastructure, not asserted):** first Phase 2
implementation task; no dependency to sequence against (none declared;
`CHAT-03`/`04` already Done). Real Postgres 16 + Redis 7 installed via
apt (no Docker daemon in this sandbox, matching every prior backend
session), confirmed clean baseline before any change: 137/137 pytest
passing, mypy strict clean. Delivered `ai/orchestrator/{__init__,types,
registry,intent,orchestrator}.py` — `Orchestrator`, `AgentRegistry`
(empty by construction, as scoped), `AgentHandler` (a minimal
structural `Protocol`, deliberately not `AGENTS-02`'s full 7-field
Agent contract), `classify_intent()`, `DispatchDecision`,
`OrchestratorResult`. `dispatch()`/`stream_dispatch()` fall back to
`ai.agents.conversation_manager` (extended/consumed, not modified —
Q4) whenever no agent matches, which is every request today since the
registry starts empty. Every dispatch decision logged via `structlog`
with its reasoning, verified with `structlog.testing.capture_logs()`,
never silent. 18 new tests in `backend/tests/test_orchestrator.py`
(registry, intent classification, dispatch/stream_dispatch for both
the passthrough and agent-routing paths — proving `LLMProvider` is
never bypassed on passthrough and never called at all when an agent
handles the request — and decision logging). Full suite: 155/155
passing (137 + 18 new). mypy strict clean: `uv run mypy
--ignore-missing-imports .` (59 files) and `uv run mypy
--ignore-missing-imports --explicit-package-bases ../ai` (14 files),
both the exact CI commands. **Not wired into `chat_service.py`/
`chat.py`** — that remains `AGENTS-09`'s scope; `Orchestrator` exists
but nothing calls it from an HTTP route yet. Full detail:
`.ai/PROJECT_STATE.md`.

**Verification status (AGENTS-02 and AGENTS-03, 2026-09-12 — executed
as one task group, against real infrastructure, not asserted):**
`AGENTS-02`'s sole dependency (`AGENTS-01`) and `AGENTS-03`'s sole
dependency (`AGENTS-02`) were both Done before each task started, in
that order, within this same session. Real Postgres 16 + Redis 7 (apt)
plus a **real local Qdrant 1.19.1 server** (downloaded release binary,
run as its own process on `localhost:6333` — not the embedded/in-memory
client mode) — confirmed clean baseline before any change: 155/155
pytest passing, mypy strict clean. Delivered `ai/agents/base.py`
(`Agent` ABC — the 7 `ARCHITECTURE.md` §8 fields, plus `name`/`intents`
as required constructor attributes rather than abstract properties, a
real Protocol-compatibility fix made without touching
`ai/orchestrator/` — see `.ai/PROJECT_STATE.md` for the full mypy-
surfaced conflict and its resolution) and `ai/schemas/base.py`
(`AgentOutputBase`/`ConfidenceLevel` — operationalizes
`AI_EXPERIENCE.md` §Explainability/§Uncertainty as real Pydantic
validation). Delivered `ai/tools/**` (`ToolRegistry`, `ToolService`
enforcing permission → lookup → input validation → output validation,
in that order, before any tool call reaches its resource; the
`knowledge_search` tool) and `ai/rag/**` (`HashingEmbeddingProvider` —
a real, deterministic, offline embedding, not a mock and not a live
external API call, per Q1; 10 curated travel-preparation documents
containing no fabricated prices/visas/availability, per
`GUIDELINES.md` §8; `QdrantKnowledgeStore`, verified end-to-end against
the real running Qdrant server including re-index-updates-not-
duplicates). 39 new tests (17 in `test_agent_base.py`, 22 in
`test_tools_rag.py`). Full suite: 194/194 passing. mypy strict clean:
61 backend files, 27 `ai/` files, both exact CI commands. **Neither
task is wired into `chat_service.py`/`chat.py`** — that remains
`AGENTS-09`'s scope. No concrete Core Agent exists yet — that's
`AGENTS-04` onward. Full detail: `.ai/PROJECT_STATE.md`.

---

## Todo (Phase 2 — AI Agent System)

Elaborated to Task level 2026-09-09 — documentation-only session.
`AGENTS-01` through `AGENTS-03` (above) are now Done. Every row below
is Definition-of-Ready per `MASTER_RULES.md` §18 once its own
dependencies are Done — `AGENTS-04` is Definition-of-Ready now that
`AGENTS-02`/`03` are Done — but **no row is authorized for
implementation by this table alone** — each still requires its own
explicit `"Execute ATLAS-P2-AGENTS-NN"` instruction, per
`SESSION_PROMPT.md` and `DEVELOPMENT_EXECUTION_PLAN.md` §3. Full
task-level detail (scope, allowed files, acceptance criteria):
`WORK_BREAKDOWN_STRUCTURE.md` §Phase 2 → Module: AGENTS.

| Task ID | Title | Priority | Dependencies | Docs Required | Est. Context |
|---|---|---|---|---|---|
| ATLAS-P2-AGENTS-04 | Traveler Profile Agent (reads `PROF-02`/`MEM-02`, no field duplication) | High | AGENTS-01 ✅, 02 ✅, 03 ✅ | `ARCHITECTURE.md` §8, `AI_EXPERIENCE.md` §Memory, `PRD.md` §7.13 | M |
| ATLAS-P2-AGENTS-05 | Destination Intelligence Agent | High | AGENTS-01 ✅ through 04 | `ARCHITECTURE.md` §8, `PRD.md` §7.2, `AI_EXPERIENCE.md` §Explainability | M |
| ATLAS-P2-AGENTS-06 | Budget Agent — **estimate-only, explicit uncertainty required (Q3)** | Medium | AGENTS-01 ✅ through 04 | `PRD.md` §7.9, `AI_EXPERIENCE.md` §Budget Assistance/§Uncertainty, `GUIDELINES.md` §8 | M |
| ATLAS-P2-AGENTS-07 | Itinerary Planner Agent | High | AGENTS-05, 06 | `ARCHITECTURE.md` §8, `AI_EXPERIENCE.md` §Itinerary Generation, `PRD.md` §7.3 | L |
| ATLAS-P2-AGENTS-08 | Recommendation Agent | Medium | AGENTS-04, 05 | `ARCHITECTURE.md` §8, `AI_EXPERIENCE.md` §Recommendations, `PSYCHOLOGY_GUIDELINES.md` §13/§15 | M |
| ATLAS-P2-AGENTS-09 | Multi-agent integration — wires `chat_service.py`/`chat.py` to the Orchestrator for the first time since CHAT-04; zero SSE contract change | High | AGENTS-01 ✅ through 08 | `TRIP_PLANNING_EXPERIENCE.md` §AI Understanding Phase, `ARCHITECTURE.md` §7, `AI_EXPERIENCE.md` §Streaming | L |

**Parallelizable pairs (per `CONVERSATION_STRATEGY.md` §8):** `AGENTS-05`
+ `AGENTS-06` (once 01–04 are Done); `AGENTS-07` + `AGENTS-08` (once
their own respective dependencies are Done). `AGENTS-09` is a hard
serialization point — every other row above must be Done first. See
`WORK_BREAKDOWN_STRUCTURE.md` for the full parallelization note.

**Recommended next task: `ATLAS-P2-AGENTS-04`.** Definition-of-Ready
(both dependencies, `AGENTS-02` and `AGENTS-03`, are Done), pending the
project owner's own explicit go-ahead to execute.

---

## In Progress

*(empty — no session has started)*

## Blocked

*(empty)*

## Review

*(empty)*

## Backlog (Phase 3–7, module/feature level only — see WORK_BREAKDOWN_STRUCTURE.md for detail)

**Phase 2 is elaborated to Task level as of 2026-09-09 — see "Todo
(Phase 2 — AI Agent System)" above, not this table.**

| Phase | Modules |
|---|---|
| Phase 3 | Maps/Weather/Currency/Events integration, Domain Agents (12) |
| Phase 4 | Long-term Memory Service, Personalized Recommendations |
| Phase 5 | Security review, performance testing, AI evaluation, Design QA pass |
| Phase 6 | Booking + payments, Telegram Bot, Mobile app, Voice assistant |
| Phase 7 | Marketplace, partner ecosystem, corporate travel |


---

**END OF DOCUMENT**

**LOCK STATUS:**
**LIVING — approved 2026-07-22 baseline, updated 2026-07-24, 2026-07-29 (×2), 2026-08-13 (Bootstrap Reconciliation), 2026-08-15 (DESIGNSYS-03 complete), 2026-08-16 (DESIGNSYS-04 complete; Governance Reconciliation, same date, second session), 2026-08-19 (AUTH-01 Audit & Bug Fix — Localization/RTL), 2026-08-22 (AUTH-02 through AUTH-05 complete — first real backend/app/ code in the repository), 2026-08-24 (AUTH-06 through AUTH-08 complete — forgot-password, Redis-backed sessions, RBAC scaffold + frontend route guard), 2026-08-25 (PROF-01 through PROF-03 complete), 2026-08-29 (LAND-01 through LAND-03 complete), 2026-09-01 (CHAT-01 through CHAT-02 complete), 2026-09-05 (CHAT-03 through CHAT-04 complete), 2026-09-06 (MEM-01 through MEM-02 complete), 2026-09-08 (DASH-01 complete — Phase 1 fully closed), 2026-09-09 (Phase 2 — AI Agent System elaborated to Task level, documentation-only, Q1–Q4 approved — Amendment 010; no Phase 2 task authorized for implementation), 2026-09-10 (AGENTS-01 complete — first Phase 2 implementation task), 2026-09-12 (AGENTS-02 and AGENTS-03 complete, executed as one task group — Agent base contract + structured-output schemas, and Tool Service + RAG over a real local Qdrant server; 3 of 9 AGENTS tasks done). Future changes only via the governed End-of-Session Checklist in `MASTER_RULES.md` §21.**
