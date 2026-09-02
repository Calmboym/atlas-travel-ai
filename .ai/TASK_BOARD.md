# TASK_BOARD.md

**Last updated:** 2026-08-29 (LAND-01 through LAND-03)
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

**Verification status (DESIGNSYS-03, 2026-08-15 — actually executed, not asserted):** typecheck clean · lint 0 errors/0 warnings (2 real `react-hooks/set-state-in-effect` violations found and fixed at the root, not suppressed) · 129/129 tests passing across 20/20 files (98 pre-existing + 31 new) · production build succeeds, including the two new orphan route-group layouts with zero pages under them yet · RTL confirmed correct for en/fa/de via live HTTP requests against the real standalone server, with header/footer/nav landmarks confirmed present in the actual rendered HTML · `/en/register` (AUTH-01) confirmed still working, untouched.

**Verification status (DESIGNSYS-04, 2026-08-16 — actually executed, not asserted):** typecheck clean · lint 0 errors/0 warnings · 155/155 tests passing across 24/24 files (129 pre-existing + 26 new) · production build succeeds · RTL confirmed correct for en/fa/de via live HTTP requests against the real standalone server, with the new `atlas-noise` BackgroundSystem layer confirmed present in the actual rendered HTML · `/en/register` and DESIGNSYS-03's nav/layout shell confirmed still working, untouched. One real bug found and fixed mid-session (not asserted away): Framer Motion 11.18.2's own exported `useReducedMotion()` hook does not actually re-render on a live OS preference change despite its docstring claiming it does (confirmed by reading the installed library source) — `MotionProvider` was built on `useSyncExternalStore` instead, mirroring `ThemeProvider`'s already-proven pattern for the equivalent `prefers-color-scheme` case, and is covered by a test that verifies live updates, not just initial-mount reads.

**Verification status (AUTH-02 through AUTH-05, 2026-08-22 — actually executed against real infrastructure, not asserted):** `backend/app/` held zero application code before this session (confirmed: only `.gitkeep`) — first real backend implementation in the repository. No Docker daemon available, so PostgreSQL 16 and Redis 7 (matching `docker-compose.yml`'s own pinned versions) were installed and run directly via apt for genuine verification rather than mocks. Backend: mypy strict clean (32 files) · 45/45 pytest passing (register, login, verify-email/resend, security unit tests, rate-limiter unit tests, OAuth-stub tests) · a real `alembic downgrade base` → `upgrade head` roundtrip · a full live-server curl smoke test covering register/login/duplicate-email/wrong-password/nonexistent-user/weak-password/verify-email(valid+reused+expired)/resend(anti-enumeration)/OAuth-stub/rate-limiting-at-exactly-the-configured-threshold. Frontend: typecheck clean · lint 0 errors/0 warnings · 180/180 tests passing across 28/28 files (155 pre-existing + 25 new) · production build succeeds (14 static/dynamic routes, including new `/login` and `/verify-email`) · RTL confirmed correct for en/fa/de via a live standalone-server smoke test, with real German/Persian translations (not placeholder English) rendering for the new pages. Two real bugs found and fixed mid-session (not asserted away): (1) `pytest-asyncio`'s default function-scoped event loop invalidated the module-level-cached SQLAlchemy engine and Redis client between tests (`RuntimeError: Event loop is closed`) — fixed via `asyncio_default_fixture_loop_scope = "session"` / `asyncio_default_test_loop_scope = "session"`, matching how these singletons are actually used in the running app; (2) a real `react-hooks/set-state-in-effect` violation in `VerifyEmailContent` (calling `setState` synchronously for a value already known at render time) — fixed by making the "missing token" case a plain render-time branch instead of effect-driven state, not suppressed. Full detail, including the flagged Python file-naming convention gap (MASTER_RULES.md §15's "lowercase-with-hyphens" is not valid for importable Python modules — snake_case used instead, necessarily) and every other scope decision: `.ai/PROJECT_STATE.md`.

**Verification status (AUTH-06 through AUTH-08, 2026-08-24 — actually executed against real infrastructure, not asserted):** Execution order was AUTH-07 → AUTH-06 → AUTH-08 (WBS declares no dependency between 06 and 07; 07 was sequenced first so 06's password-reset could revoke sessions through 07's own store, and 08 needs 07 regardless). PostgreSQL 16 + Redis 7 installed and run directly via apt, same as the prior session. Backend: mypy strict clean (36 files) · 88/88 pytest passing (45 pre-existing + 24 session/refresh/logout/`/me` + 12 forgot/reset-password + 5 direct `require_role` unit tests, plus 2 default-role/`. /me`-exposure integration tests) · two real `alembic downgrade → upgrade head` roundtrips (one per new migration) · a full live-server curl smoke test covering the entire chain: register → login → `/me` (role visible) → forgot-password → reset-password with the real emailed token → **the pre-reset session cookie confirmed rejected (401) against the live server, not just in pytest** → old password rejected → new password accepted → new session's `/me` confirmed working. Frontend: typecheck clean · lint 0 errors/0 warnings · 241/241 tests passing across 35/35 files (214 pre-existing + 27 new, including a real integration test against `proxy.ts`'s actual middleware export using `next/server`'s `NextRequest`/`NextResponse` directly — confirmed working in this Vitest environment before relying on it, not assumed) · production build succeeds (20 static pages, `/forgot-password` and `/reset-password` both compiling, Proxy/Middleware recognized). Three real bugs found and fixed mid-session (not asserted away): (1) `sa.Enum(UserRole, ...)` without `values_callable` stores Python enum *member names* ("USER") as Postgres enum labels instead of `.value`s ("user"), which would have silently conflicted with `server_default=UserRole.USER.value` — caught by actually running the generated migration, not by reading the autogenerated file; (2) Alembic's `op.add_column` with a native Postgres enum does not auto-emit `CREATE TYPE` the way `op.create_table` does — the first `alembic upgrade head` attempt failed with `type "user_role" does not exist`, fixed with an explicit `postgresql.ENUM(...).create()`/`.drop()` pair; (3) a content bug, not a logic bug — `Auth.resetPassword.genericError` was mistakenly authored with token-specific text ("This reset link is invalid or has expired") instead of a generic retry message, which a network-failure test caught by asserting the *displayed* text, not just that an error appeared. **AUTH-08 scope note, stated plainly:** the backend RBAC scaffold (`role` column, `require_role`) is complete and directly tested, but no admin-only endpoint exists yet to protect (none is in scope anywhere in Phase 1) — `require_role` is exercised as a plain function in `test_rbac.py`, not wired onto a fabricated route. The frontend route guard (`proxy.ts` + `lib/auth/protected-routes.ts`) is real and verified against the actual middleware function, but guards paths (`/dashboard`, `/trips`, `/saved`, `/notifications`, `/profile`, `/settings`) that don't have real pages yet (DASH-01/PROF-03/etc. haven't shipped) — same category of honest limitation as AUTH-03's OAuth stub. `/chat` and `/help` are deliberately NOT guarded — `/chat` because guest-mode AI Chat is explicit, locked product scope (ONBOARDING_EXPERIENCE.md §Guest Experience), `/help` because it isn't in `INFORMATION_ARCHITECTURE.md`'s route table at all and Help/FAQ content being public is the safer default absent a stated requirement. Full detail: `.ai/PROJECT_STATE.md`.

**Verification status (PROF-01 through PROF-03, 2026-08-25 — actually executed against real infrastructure, not asserted):** Execution order was PROF-02 → PROF-01 → PROF-03 (WBS declares PROF-01/02 both depend only on AUTH-07 ✅, no dependency between them; PROF-03 depends on PROF-02. Backend sequenced first so the wizard could wire to a real endpoint immediately rather than stub-then-wire, unlike AUTH-01/02's split). PostgreSQL 16 + Redis 7 installed and run directly via apt, same as prior sessions; survived an environment restart mid-session with the database intact, re-verified after. Backend: mypy strict clean (33 files) · 102/102 pytest passing (88 pre-existing + 14 new: auth gate, get-or-create, partial-update semantics including explicit-null-clears-a-field, enum validation, food-preference multi-select validation/dedup, per-user isolation) · a real `alembic upgrade → downgrade → upgrade → downgrade → upgrade` roundtrip, doubled specifically because the first single roundtrip found a real bug (below) · a full live-server curl smoke test (register → login → auto-create empty profile → patch → persist → 401 unauthenticated → 422 invalid enum), plus a second live e2e pass with the frontend proving the authenticated `/profile` page returns 200 (not a redirect) using a real session cookie from the real backend. Frontend: typecheck clean · lint 0 errors/0 warnings · 277/277 tests passing across 39/39 files (241 pre-existing + 36 new: StepIndicator, ProfileWizard, RadioGroupItem's new `card` variant, FileUpload, ImageUpload, ProfilePageContent) · production build succeeds (both `/profile` and `/profile/wizard` compiling) · route guard confirmed both directions live (unauthenticated → redirect to login; authenticated → 200) · RTL confirmed still correct on `/fa/login`. Real, translated (not placeholder) EN/DE/FA copy added for both new `Profile.wizard` and `Profile.page` namespaces, matching the established per-namespace convention. Four real bugs found and fixed mid-session (not asserted away): (1) `op.create_table`'s implicitly-created Postgres enum types are *not* implicitly dropped by `op.drop_table` — a downgrade-then-upgrade failed with `DuplicateObjectError`; fixed with explicit `checkfirst=True` enum drops — the mirror-image of AUTH-06/07/08's own `op.add_column` enum-creation bug, this time on the *drop* side of a fresh `CREATE TABLE` migration; (2) a copy-paste error — a ternary meant only for `budget_level`'s "mid_range" option label leaked into the `travel_preference` Select loop, where that value can never occur; caught by the type checker itself (`TS2367`), no runtime testing needed; (3) `FileUpload`'s original draft used a `role="button"` wrapper around the real (visually hidden) `<input type="file">`, leaving two independently-focusable elements for one logical control; switched to a native `<label htmlFor>` association, which is both less code and correct; (4) that same hidden input's accessible name resolved to the full concatenated text of everything sharing its `<label>` (hint text, or in `ImageUpload`'s case the avatar's fallback-initials text) instead of just the intended label — fixed with an explicit `aria-label`. Fixing (4) also surfaced, via the same test suite, that `@testing-library/user-event` v14 correctly honors `accept="image/*"` when simulating uploads (real, browser-accurate behavior, not a bug) — the "reject a non-image file" test was rewritten to use drag-and-drop, the actual path that bypasses `accept` filtering in both real browsers and this test environment. **PROF-03 scope note, stated plainly:** avatar upload is a real, fully working picker + client-side preview (drag, click, type/size validation) — but no object-storage endpoint exists anywhere in this repository (`ARCHITECTURE.md` §11's External Provider list has no image/file storage entry), so the picked photo is never persisted; the UI says so plainly rather than pretending success, same category of honest limitation as AUTH-03's OAuth stub and AUTH-04's email stub. `ProfileMenu` was deliberately not built (see `COMPONENT_OWNERSHIP_MATRIX.md` §4) — it would need to link to `/trips`, `/saved`, `/dashboard`, none of which have real pages yet; `/profile` remains fully reachable via Sidebar/MobileBottomNav regardless. `preferred_ui_language`/`preferred_travel_language` offer only the app's 3 implemented locales (en/fa/de), not PRD.md §9's wider 8-language ambition, which is Phase 4+ per the already-approved Q4 scope decision. Full detail: `.ai/PROJECT_STATE.md`.

**Verification status (LAND-01 through LAND-03, 2026-08-29 — actually executed, not asserted):** frontend-only, no backend changes. Execution order LAND-01 → LAND-02/LAND-03 (WBS declares both depend only on LAND-01, no dependency between them). Typecheck clean · lint 0 errors/0 warnings · 295/295 tests passing across 49/49 files (277 pre-existing + 18 new: one file per new Landing component plus new shared test infrastructure) · production build succeeds, confirmed via the actual `.next/server/app-paths-manifest.json` (not build success alone) that exactly one manifest entry now backs `/[locale]` · a live standalone-server smoke test across all three locales, plus an unrelated existing route (`/en/register`) re-confirmed unaffected · heading hierarchy (exactly one `<h1>`, no skipped levels) confirmed against the real rendered HTML. Three real bugs found and fixed, none caught by typecheck/lint/build alone: (1) a stray duplicate `app/[locale]/page.tsx` left over from DESIGNSYS-03's move to `(marketing)/page.tsx`, compiling into two separate manifest entries for the same route — found by inspecting the manifest directly, not assumed from a clean build; (2) `CTASection` calling `buttonVariants()` (exported from a `"use client"` file) directly from a Server Component — type-checks and builds cleanly, then crashes with a real 500 the moment the standalone server actually serves the page; caught only by starting it and requesting the page, fixed by marking the component `"use client"`, the same constraint `Navbar` already carries for the identical pattern; (3) `next-intl/server`'s `getTranslations` throws unconditionally under Vitest (jsdom triggers its "not supported in Client Components" guard regardless of the real component boundary) — tried the same async-Server-Component pattern AuthLayout uses for `Footer`, found it broke the pre-existing `tests/layouts.test.tsx` (which renders `MarketingLayout`/`ApplicationLayout` synchronously and cannot await a component nested inside them), built `tests/mocks/next-intl-server.ts` as a working alias-based mock either way (reusable for any future async Server Component test), but reverted `Footer` itself to a synchronous `"use client"` component using `useTranslations` since that has zero real cost here and avoids a recurring workaround for every future test touching a Footer-containing layout. Deliberate scope decisions, not oversights: no Testimonials/Statistics/PartnerLogos/Newsletter section (no real users, reviews, or partners exist yet to describe honestly — `BRAND_GUIDELINES.md` §8/§13); no GSAP or Three.js introduced as new dependencies (neither is currently installed; Framer Motion, already installed, covers this task's motion needs); `AIQuickAccess` (Shared) deliberately left unclaimed for `CHAT-01`, since it needs an actual chat surface to open that doesn't exist yet. Full detail: `.ai/PROJECT_STATE.md`.

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
| ATLAS-P1-CHAT-01 | Chat page layout (sidebar/conversation/composer) | High | none | INDEX.md §CHAT | M |
| ATLAS-P1-CHAT-02 | Message components (Bubble/Streaming/Typing) | High | CHAT-01 | INDEX.md §CHAT | M |
| ATLAS-P1-CHAT-03 | Conversation Manager (basic, single-model) backend | High | none | INDEX.md §CHAT | L |
| ATLAS-P1-CHAT-04 | Streaming endpoint (SSE) | High | CHAT-03 | INDEX.md §CHAT | M |
| ATLAS-P1-MEM-01 | Guest session memory (client-side, temporary) | Medium | CHAT-02 | INDEX.md §MEM | S |
| ATLAS-P1-MEM-02 | Authenticated preference storage (basic) | Medium | AUTH-07 ✅ | INDEX.md §MEM | S |
| ATLAS-P1-DASH-01 | Dashboard shell (opens to last conversation / Welcome) | Medium | CHAT-03, AUTH-07 ✅ | INDEX.md §DASH | M |

*(LAND-01/02/03 are now Done — see above; the real Landing page ships
with a working guest entry point. MEM-02 and DASH-01's AUTH-07
dependency is satisfied. DASH-01 also still needs CHAT-03. CHAT-01
and DASH-01 have a genuinely verified Foundation *and* layout/
navigation shell available — Card, Button, Container, Stack,
Typography, feedback shells, Overlays, MarketingLayout/
ApplicationLayout/FocusLayout, and the full nav shell are ready to
consume, plus PROF-01/03's new Shared components (StepIndicator,
FileUpload, ImageUpload), RadioGroupItem's `card` variant, and LAND's
own new `AISearchBox`/`GuestEntryCta` pattern (both already route to
`/chat?prompt=...`, waiting for CHAT-01 to give that a real
destination). `AIQuickAccess` (Shared, `COMPONENT_OWNERSHIP_MATRIX.md`
§4) is explicitly available for CHAT-01 to claim — LAND-01 deliberately
left it unbuilt, see LAND's verification note above. DASH-01 fills
`Navbar`'s and `ApplicationLayout`'s `userSlot`/`notificationsSlot`
props with its own ProfileMenu/NotificationCenter — PROF-03 explicitly
deferred ProfileMenu to DASH-01, see `COMPONENT_OWNERSHIP_MATRIX.md`
§4. Once DASH-01/CHAT-01 ship real pages under `/dashboard`, `/chat`,
AUTH-08's route guard — already live in `proxy.ts` — starts protecting
`/dashboard` with no further wiring needed; `/chat` is deliberately
excluded from that guard, see AUTH-08's verification note above.)*

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
**LIVING — approved 2026-07-22 baseline, updated 2026-07-24, 2026-07-29 (×2), 2026-08-13 (Bootstrap Reconciliation), 2026-08-15 (DESIGNSYS-03 complete), 2026-08-16 (DESIGNSYS-04 complete; Governance Reconciliation, same date, second session), 2026-08-19 (AUTH-01 Audit & Bug Fix — Localization/RTL), 2026-08-22 (AUTH-02 through AUTH-05 complete — first real backend/app/ code in the repository), 2026-08-24 (AUTH-06 through AUTH-08 complete — forgot-password, Redis-backed sessions, RBAC scaffold + frontend route guard). Future changes only via the governed End-of-Session Checklist in `MASTER_RULES.md` §21.**
