# PROJECT_STATE.md

**Baseline locked:** 2026-07-22 (Bootstrap session, post Q1–Q4 approval)
**Last updated:** 2026-08-22 (AUTH-02 through AUTH-05 session — first real `backend/app/` code)
**Document tier:** Living (Tier 3) — updated only via the End-of-Session Checklist in `MASTER_RULES.md` §21.

---

## PROVENANCE NOTE (read this first)

This file has never been committed to the repository before now,
despite being the single most-referenced document in the entire `.ai/`
governance system — every session's startup protocol (`SESSION_PROMPT.md`
step 2) assumes it exists. Earlier versions of this document's content
only ever existed as chat uploads/pastes between sessions, never as a
real file in version control. This reconciliation pass is what actually
commits it for the first time, into a real `.ai/` folder that also
didn't exist before now (`TASK_BOARD.md` and `WORK_BREAKDOWN_STRUCTURE.md`
were sitting in `docs/`, mixed with the Design Bible).

An uploaded version of this file, dated 2026-07-29, referenced file
paths (`apps/web/components/ui/*`, `apps/web/lib/...`) that do not and
never did exist anywhere in the actual repository — the real paths are
flat under `frontend/`. That has been corrected below; it's noted here
because it's exactly the kind of provenance gap this section exists to
record, not because it changes anything about what's actually built.

---

## Bootstrap Phase: ✅ COMPLETE (2026-07-22). Unchanged.

## Implementation Status: **AUTHORIZED — Phase 1 underway**

`AUTH-01` (2026-07-24), `DESIGNSYS-01` (2026-07-29), `DESIGNSYS-02`
(2026-07-29), `DESIGNSYS-03` (2026-08-15), `DESIGNSYS-04` (2026-08-16),
`AUTH-02`, `AUTH-03`, `AUTH-04`, and `AUTH-05` (all 2026-08-22) are
done — genuinely verified as done, not just re-asserted (see
Verification Results below).

---

**Current Phase:** Phase 1 — Core Platform MVP (underway)
**Current Milestone:** M1
**Current Module:** none active — `DESIGNSYS` (01–04) and `AUTH-02/03/04/05` are complete and closed
**Current WBS ID:** none active
**Current Task:** none — awaiting next task authorization

**Governance Reconciliation (2026-08-16, this session):** not a WBS task —
documentation/governance-only, per its own explicit scope. Audited the
supplied baseline against every `.ai/` file; found and corrected
`COMPONENT_OWNERSHIP_MATRIX.md`'s stale Foundation table (~24 rows
wrongly said "Not built" for real, shipped DESIGNSYS-02 components) and
`INDEX.md`'s stale DESIGNSYS status line; closed the Sidebar-width and
`/settings`-route conflicts via Amendments 007/008; added CI's missing
test step; added `INFRASTRUCTURE_BASELINE.md` as a new canonical
document; relabeled the two Bootstrap-era report files archival; added
the incremental-output/dependency-resolution/parallel-execution rules
to `MASTER_RULES.md` (§25–29), `SESSION_PROMPT.md`, and
`CONVERSATION_STRATEGY.md` (§8) — all via Amendment 009. See "Files
Modified This Session (Governance Reconciliation)" below for the full
file list.

**AUTH-01 Audit & Bug Fix — Localization/RTL (2026-08-19, this session):**
not a WBS task — an ad hoc audit-and-fix pass on AUTH-01's already-Done
deliverable, requested directly (not a `.ai/` governance edit like the
Governance Reconciliation above). Read AUTH-01's real files from the
supplied repository ZIP (not from memory — several sessions have
fabricated status before; ground truth only), ran the full verification
toolchain, and found five real bugs, one of them a severe, sitewide
regression:

1. **CRITICAL — `frontend/app/layout.tsx` had reappeared**, duplicating
   `app/[locale]/layout.tsx`. This is the exact nested-`<html>` bug the
   Bootstrap Reconciliation session already found, root-caused, and
   deleted (2026-08-13, `ATLAS-BOOTSTRAP-IMPLEMENTATION-REPORT.md` §3.2)
   — confirmed regressed via a real production build + live standalone
   server: `curl /fa/register` returned two `<html>` elements, with the
   outer, canonical one permanently `lang="en"` and no `dir` attribute
   at all. This silently broke RTL for every `/fa/*` route sitewide,
   not just AUTH-01's. Fixed by deleting the file again (nothing else
   depended on it — no route exists outside `app/[locale]/...`). This
   is outside AUTH-01's own file boundary (DESIGNSYS/root-layout
   territory); flagged here explicitly rather than folded silently into
   "AUTH-01 polish."
2. AuthLayout (`app/[locale]/(auth)/layout.tsx`) imported plain
   `next/link` instead of the locale-aware `Link` from
   `i18n/navigation.ts` — self-documented as a known, deferred issue in
   `i18n/navigation.ts`'s own header comment ("out of scope to change
   here since AuthLayout is AUTH-01's file"). Clicking the logo or
   Privacy/Terms from `/fa/register` dropped the user out of `fa` back
   to the default locale. Fixed.
3. **Every user-facing string in AUTH-01 was hardcoded English** — zero
   `next-intl` usage anywhere in `RegisterForm`, `RegisterPageContent`,
   the Zod schema's validation messages, or the page's
   `<title>`/description metadata. `/fa/register` and `/de/register`
   showed a correctly-directioned (once #1 was fixed) but entirely
   English form. Fixed: added a real `Auth` namespace (not placeholder
   English) to `messages/{en,fa,de}.json`; converted the Zod schema to
   a `createRegisterSchema(messages)` factory so validation errors are
   locale-aware; wired `RegisterForm`/`RegisterPageContent` to
   `useTranslations`; converted the register page's static `metadata`
   export to `generateMetadata` + `getTranslations` (next-intl's
   documented per-locale metadata pattern).
4. `components/ui/label.tsx`'s required-field asterisk used physical
   `ml-0.5` instead of logical `ms-0.5` — RESPONSIVE_SYSTEM.md §RTL
   Support: "Spacing logic must use logical CSS properties whenever
   possible." Under `dir="rtl"` the asterisk sat on the wrong side of
   the label. Fixed.
5. (Adjacent, NOT fixed — out of AUTH-01's scope) `components/layout/
   footer.tsx` (DESIGNSYS-03, consumed only by `MarketingLayout`, not
   AuthLayout) has the identical hardcoded-English pattern for its own
   "Privacy"/"Terms" labels. Not touched — different owning task, flagged
   for whichever session next touches `Footer` or ships real LAND-01
   content.

All fixes empirically verified against a real production build and a
real standalone server (not `next start`, which this Next.js version's
own output warns is incompatible with `output: "standalone"` — used
`node .next/standalone/server.js`, matching how the project's own
Dockerfile actually runs it): `/en`, `/fa`, `/de` each now return
exactly one correct `<html lang dir>`; `/fa/register` and `/de/register`
render real Persian/German copy (title tag, labels, buttons, footer
text) with locale-preserving internal links (`href="/fa"`, not
`href="/"`). Full detail in this session's chat handoff (no new
standalone report file, per `MASTER_RULES.md` §14). See "Files Modified
This Session (AUTH-01 Audit)" below for the full file list.

**AUTH-02 through AUTH-05 (2026-08-22, this session):** the requested
task group's own execution order, resolved from `WORK_BREAKDOWN_
STRUCTURE.md`'s declared dependencies (not the listed order — AUTH-03
depends only on AUTH-01 ✅, not AUTH-02, so it could have run anytime;
AUTH-04 and AUTH-05 both genuinely need AUTH-02 first): **AUTH-02 →
AUTH-03 → AUTH-04 → AUTH-05**, each kept as its own scoped deliverable,
not merged.

`backend/app/` held zero application code before this session —
confirmed empty except `.gitkeep`, exactly as `INFRASTRUCTURE_
BASELINE.md` §8 and `MISSING_INFORMATION.md` already logged. `DEBUG_
LOG.md`'s M0 record describes a health endpoint and a rate-limit/
validation/injection-sanitizer scaffold as already delivered — that
description does not match the actual repository (a known, pre-existing
documentation-vs-reality gap from the original Phase 0 reconstruction,
not a new conflict this session found) and was treated as confirming,
not contradicting, `INFRASTRUCTURE_BASELINE.md`'s own note that real
backend code was "expected starting with AUTH-02." Everything under
`backend/app/` in this delivery is new.

**AUTH-02 — Registration backend endpoint + secure password storage.**
`POST /api/v1/auth/register`. First real FastAPI app (`app/main.py`),
async SQLAlchemy engine/session (`app/db/session.py`), `users` table +
Alembic migration (async template, `sys.path` inserted in `env.py` for
reliable `app...` imports, `DATABASE_URL` read from `Settings` — never
hardcoded), bcrypt password hashing, and a Redis-backed fixed-window
rate limiter (`RateLimiter`, INCR+EXPIRE — the exact mechanism `DEBUG_
LOG.md`'s own Architecture Decisions table described as the M0-era
intent, never previously built) — all necessarily delivered together as
a byproduct of being the first backend task, the same relationship
AUTH-01 had to DESIGNSYS-02's later Foundation components.
`[tool.uv] package = false` removed from `pyproject.toml` per
`INFRASTRUCTURE_BASELINE.md` §8's own instruction, replaced with
`[tool.hatch.build.targets.wheel] packages = ["app"]`.

**AUTH-03 — OAuth button scaffolding (Google, Apple).** **Stubbed, and
reported here per this task's own acceptance criteria**: no Google or
Apple OAuth client credentials exist anywhere in this repository's env
files or documentation — `ARCHITECTURE.md`'s External Providers list
names Maps/Weather/Currency/Flight/Hotel/Translation providers, no
identity provider. `GET /api/v1/auth/oauth/{provider}` is a real,
deployed route that returns `501 Not Implemented` with a clear message
rather than a fabricated handshake. `OAuthButtons` (new Feature
Component, `COMPONENT_OWNERSHIP_MATRIX.md` §5) is deliberately
text-only, no bespoke Google/Apple logo glyph — reproducing either
company's trademarked mark without their real, licensed brand assets
(unavailable in this environment) risked an inaccurate imitation,
which `ICONOGRAPHY_AND_ILLUSTRATION.md`'s licensing rule counsels
against. Consumed by both `RegisterPageContent` (AUTH-01 — modifying
that file is squarely within AUTH-03's own declared scope, "Dependencies:
AUTH-01") and the new `LoginPageContent` (AUTH-05).

**AUTH-04 — Email verification flow.** Token generation (`secrets.
token_urlsafe(32)`), single-use, expiring, and stored only as a SHA-256
hash (never the raw value — the same principle GUIDELINES.md §11
applies to passwords, extended here to bearer verification links: a DB
leak must not let an attacker verify arbitrary accounts). New
`/verify-email` page reads `?token=` and confirms it against the
backend. **Email delivery is stubbed** (logged server-side, not sent) —
no SMTP/email provider is documented anywhere in `ARCHITECTURE.md`, so
none was invented; flagged before implementation began, not discovered
after the fact.

**AUTH-05 — Login UI + backend endpoint.** Unlike Register (AUTH-01/02
deliberately split into a UI-only pass plus a separate backend task),
Login was scoped as ONE task, so it ships wired end-to-end: `LoginForm`
(mirrors `RegisterForm`'s structure exactly) calls the real
`POST /api/v1/auth/login`, which authenticates against the bcrypt hash
and issues a short-lived JWT (`PyJWT`, chosen over `python-jose` for
maintenance cadence) — returned in the JSON body and also set as an
httpOnly, `sameSite=lax` cookie (mitigates the "Sensitive local
storage" XSS risk `FRONTEND_IMPLEMENTATION_GUIDELINES.md` §Security
flags). Full Redis-backed session lifecycle (revocation, refresh) is
explicitly `AUTH-07`'s scope — not built here, a scope boundary stated
before implementation, not discovered as a gap afterward. This is the
repository's first frontend → backend network call (`lib/api/client.ts`,
`lib/api/auth.ts`): a plain `fetch` wrapper, not TanStack Query
(`ARCHITECTURE.md` §4 names it as the intended server-state layer, but
it isn't installed, and pulling it in for one mutation would be the
"unnecessary abstraction" `GUIDELINES.md` warns against — a reasonable
future addition once a task needs actual query caching, e.g. Dashboard
data). No redirect to a dashboard/authenticated area is attempted on
success: neither `DASH-01` nor route guards (`AUTH-08`) exist yet, so
there's nowhere real to send the user — the same "no dead ends"
reasoning `RegisterForm`'s own success state already follows.

**Anti-enumeration, applied consistently across all three new
endpoints:** login returns an identical 401 + message for "no such
user" and "wrong password" (with a real, cached dummy bcrypt hash
comparison burned even when no user exists, so response latency can't
leak which case it was); `resend-verification` returns an identical 202
+ message whether or not the email exists or is already verified.

**Real infrastructure, not mocks — the explicit instruction for this
session.** No Docker daemon is available in this sandbox, but
PostgreSQL 16 and Redis 7 (matching `docker-compose.yml`'s own pinned
versions) install and run directly via `apt` for genuine verification:
real `alembic upgrade head` against a real database, a full live-server
curl session (register → duplicate-email 409 → login → wrong-password
401 → nonexistent-user 401 identical-to-wrong-password → weak-password
422 → verify-email valid/reused/expired → resend anti-enumeration →
OAuth 501 stub → rate limiting tripping at exactly the configured
threshold), then a real 45-test pytest suite covering the same ground
repeatably. Two real bugs found and fixed mid-session, neither asserted
away:

1. **`pytest-asyncio`'s default per-test event loop invalidated
   module-level-cached async resources.** `app/db/session.py`'s engine
   and `app/core/redis.py`'s client are created once, at import — the
   same pattern the real running app uses. A fresh event loop per test
   function meant every test after the first threw `RuntimeError:
   Event loop is closed` trying to reuse connections bound to a now-dead
   loop. Fixed via `asyncio_default_fixture_loop_scope = "session"` /
   `asyncio_default_test_loop_scope = "session"` in `pyproject.toml`,
   not by ripping out the caching that mirrors production.
2. **A real `react-hooks/set-state-in-effect` violation** in
   `VerifyEmailContent`: the "missing token" case was originally set via
   `setState` synchronously at the top of a `useEffect` body, even
   though it's fully known at render time from `searchParams` — no
   async work needed. Fixed at the root (same standard `DESIGNSYS-03`
   already established for this exact rule): the missing-token case is
   now a plain conditional render branch; the effect only calls
   `setState` from inside the verification promise's own `.then()`/
   `.catch()` callbacks.

**Flagged, not silently resolved:** `MASTER_RULES.md` §15's file-naming
convention ("lowercase-with-hyphens", example given as
`destination-service.py`) is not valid for importable Python modules —
`import destination-service` is a syntax error; Python's own ecosystem
convention (PEP 8) is snake_case. Every new backend `.py` file in this
delivery uses snake_case (`rate_limit.py`, `auth_service.py`, etc.) of
necessity, not preference. No existing Python code existed to establish
precedent either way before this session.

Full verification detail: see "Verification Results" below. Full file
list: see "Files Modified This Session (2026-08-22, AUTH-02 through
AUTH-05)" below.

 Glass system
(`GlassSurface`/`GlassCard`, exactly 4 levels, formalizing the
pre-existing `.atlas-glass-N` CSS utilities into typed components
without replacing their existing usages in Navbar/Sidebar/Card),
`MotionProvider` (app-wide reduced-motion context + Framer Motion
`<MotionConfig reducedMotion="user">`), `BackgroundSystem` (the subtle
noise-texture layer from DESIGN_TOKENS.md's Glass Design Language), and
the four AnimationWrappers (`FadeIn`/`SlideIn`/`ScaleIn`/`ScrollReveal`,
added to the existing `motion-wrappers.tsx`) — all verified end to end
(typecheck, lint, full test suite including 26 new tests, real
production build, real-server smoke test across en/fa/de confirming
BackgroundSystem renders and DESIGNSYS-03's shell is unaffected). Full
writeup in this session's chat handoff (no new standalone report file
created, per `MASTER_RULES.md` §14).

**Last Completed (WBS task):** `ATLAS-P1-AUTH-05` — 2026-08-22 (last of
this session's four; see full narrative above). Chronologically prior
in this same session: `AUTH-02`, `AUTH-03`, `AUTH-04` (all 2026-08-22).
Before this session: `ATLAS-P1-DESIGNSYS-04` — 2026-08-16.

**Next Task (recommended, not yet authorized):** No DESIGNSYS or AUTH
registration/login work remains queued — `DESIGNSYS-01` through `04`
and `AUTH-01` through `05` are all done. `ATLAS-P1-AUTH-07`
(session/token handling, Redis-backed — the full lifecycle AUTH-05's
JWT deliberately left out) and `ATLAS-P1-AUTH-06` (forgot-password) are
both newly unblocked (`AUTH-02` and `AUTH-05` are now ✅). `AUTH-07` is
recommended first: `AUTH-08` (route guards/RBAC) depends on it, and
`PROF-01`/`PROF-02`/`MEM-02`/`DASH-01` all depend on it too — it's the
next real bottleneck in the dependency graph, same reasoning that put
Authentication ahead of Landing/Chat in the original sequencing
rationale (`MASTER_IMPLEMENTATION_ROADMAP.md`). On the frontend,
`ATLAS-P1-LAND-01`, `ATLAS-P1-CHAT-01`, and `ATLAS-P1-PROF-03` remain
independently unblocked and can use the full Foundation layer plus
`LoginForm`/`OAuthButtons` patterns as additional reference now
available.

---

## Verification Results (2026-08-16, DESIGNSYS-04 — actually run, not asserted)

| Check | Result |
|---|---|
| Frontend typecheck (`tsc --noEmit`) | ✅ clean |
| Frontend lint (`eslint .`) | ✅ 0 errors, 0 warnings |
| Frontend unit/component tests (`vitest run`) | ✅ 155/155 passing, 24/24 files (129 pre-existing + 26 new) |
| Frontend production build (`next build`) | ✅ succeeds |
| RTL smoke test (`/en`, `/fa`, `/de`, real standalone server, real HTTP requests) | ✅ exactly one correct `<html lang dir>` per locale; new `atlas-noise` BackgroundSystem layer confirmed present in the actual rendered HTML |
| `/en/register` (AUTH-01) and DESIGNSYS-03's nav/layout shell | ✅ still 200 / still rendering, untouched |
| Backend | Untouched this session |

**Independently re-verified, Governance Reconciliation session (2026-08-16, same day, separate pass):** all six rows above re-run from a clean `pnpm install` against the supplied baseline — identical results. This reconciliation session changed no application logic (only two doc-only source comments — see below — plus `ci.yml` and a replaced `docs/` image), so no functional re-verification beyond confirming nothing regressed was expected or needed.

---

## Verification Results (2026-08-19, AUTH-01 Audit & Bug Fix — actually run, not asserted)

| Check | Result |
|---|---|
| Frontend typecheck (`tsc --noEmit`) | ✅ clean (after clearing a stale `.next/` type-validator artifact left over from the pre-fix build, which referenced the just-deleted `app/layout.tsx`) |
| Frontend lint (`eslint .`) | ✅ 0 errors, 0 warnings |
| Frontend unit/component tests (`vitest run`) | ✅ 155/155 passing, 24/24 files — identical count to the DESIGNSYS-04 baseline; `tests/register-form.test.tsx` (10 tests) switched from plain RTL `render` to the project's existing `renderWithProviders` helper (aliased as `render`) since `RegisterForm` now calls `useTranslations`; `tests/auth-schema.test.ts` (6 tests) needed zero changes — `registerSchema`'s default English export stayed byte-identical |
| Frontend production build (`next build`) | ✅ succeeds |
| Real standalone-server smoke test (`node .next/standalone/server.js` — `next start` doesn't work with `output: "standalone"`, confirmed by this Next.js version's own runtime warning) | ✅ `/en`, `/fa`, `/de` each return exactly one `<html lang dir>` (previously `/fa` returned two, outer one wrongly `lang="en"` with no `dir`); `/fa/register` and `/de/register` `<title>` tags, form labels, buttons, and footer copy all render in real Persian/German; internal links on both pages resolve locale-prefixed (`href="/fa"` / `href="/de"`, not bare `/`) |
| Backend | Untouched this session |

**Root-cause bug independently confirmed via source inspection AND live HTTP, not asserted from either alone:** the nested-`<html>` regression (Finding #1) was first spotted by noticing `app/layout.tsx` existed at all (it shouldn't, per `app/[locale]/layout.tsx`'s own header comment describing its removal), then reproduced empirically via a real build + real server response before any fix was applied, then re-verified the same way after the fix.

**Bug found and fixed mid-session (not asserted away):** Framer
Motion 11.18.2's own exported `useReducedMotion()` hook does not
actually re-render a mounted component when the OS preference changes
live — its `useState(prefersReducedMotion.current)` call discards the
setter, so the hook is effectively read-once-at-mount despite its own
docstring claiming live reactivity (confirmed by reading the installed
library's source, `dist/es/utils/reduced-motion/use-reduced-motion.mjs`,
and by a failing test before the fix). `MotionProvider` was built on
`useSyncExternalStore` instead, mirroring `ThemeProvider`'s own proven
`prefers-color-scheme` subscription pattern exactly. Framer Motion's
`<MotionConfig reducedMotion="user">` — the mechanism that actually
suppresses `motion.*` animation values — is unaffected by this bug and
is still used as designed.

---

## Verification Results (2026-08-22, AUTH-02 through AUTH-05 — actually run against real infrastructure, not asserted)

**Backend (new this session — no prior baseline to compare against):**

| Check | Result |
|---|---|
| `mypy --ignore-missing-imports .` (strict mode, matching CI exactly) | ✅ clean, 32 source files |
| `pytest` (real PostgreSQL 16 + Redis 7, apt-installed locally — no Docker daemon available) | ✅ 45/45 passing |
| `alembic downgrade base` → `upgrade head` roundtrip | ✅ succeeds, `\dt` confirms both tables recreated correctly |
| Live server smoke test (`uvicorn`, real curl) | ✅ register/duplicate-409/login/wrong-password-401/nonexistent-401-identical/weak-password-422/verify-email(valid+reused-400+expired-400)/resend(anti-enumeration, byte-identical response)/OAuth-501-stub/OAuth-404-unknown-provider all confirmed |
| Rate limiting, live | ✅ exactly the 11th request in a 10-max/15-min window on `/login` returned 429 with a `Retry-After` header; register (5/hour) and resend-verification (10/hour) confirmed independently |

**Frontend:**

| Check | Result |
|---|---|
| `tsc --noEmit` | ✅ clean |
| `eslint .` | ✅ 0 errors, 0 warnings (1 real `react-hooks/set-state-in-effect` violation found and fixed at the root — see narrative above) |
| `vitest run` | ✅ 180/180 passing, 28/28 files (155 pre-existing + 25 new: `login-schema.test.ts`, `login-form.test.tsx`, `oauth-buttons.test.tsx`, `verify-email-content.test.tsx`) |
| `next build` | ✅ succeeds — 14 routes, including new `/login` and `/verify-email` |
| Live standalone-server smoke test (`node .next/standalone/server.js`, real HTTP, en/fa/de) | ✅ `/en/login`, `/fa/login` (`dir="rtl"` confirmed), `/de/login` (real "Willkommen zurück", not placeholder) all 200; `/en/verify-email` renders correctly; `/en/register` still 200 with both OAuth buttons now present, confirming AUTH-01 untouched |

**Real bugs found and fixed mid-session (not asserted away):** both described in full in the AUTH-02–05 narrative above — (1) `pytest-asyncio`'s default per-test event loop invalidating module-level-cached SQLAlchemy engine/Redis client, fixed via session-scoped event loop config; (2) the `VerifyEmailContent` `set-state-in-effect` violation, fixed by making the missing-token case a render-time branch.

**One test-only bug found and fixed (not a production bug):** an early draft of `test_resend_verification_already_verified_user_issues_no_usable_token` reused one `db_session` fixture across both a direct service call and an HTTP client call (which uses its own, separate request-scoped session) — the identity-mapped `User` object from the first call didn't reflect the second session's committed `is_verified` change. Fixed by opening a fresh session for the post-HTTP-call assertion, which also more accurately mirrors how every real request actually gets its own session in production.

---

## Relevant Documentation (for whichever next task is chosen)

`AUTH-07` (recommended next): `ARCHITECTURE.md` §12 (Rate Limiting,
already partially satisfied by AUTH-02's `RateLimiter` — AUTH-07 is
about session storage/revocation, not a second limiter), `GUIDELINES.md`
§11 ("Session protection"), `INFRASTRUCTURE_BASELINE.md` §8. The JWT
issued by AUTH-05's `POST /auth/login` (`app/core/security.py`
`create_access_token`/`decode_access_token`) is the starting point —
AUTH-07 adds the Redis-backed store around it, not a replacement
mechanism. `AUTH-06` (forgot-password): mirrors AUTH-04's token
pattern closely (`EmailVerificationToken`/`resend_verification_token`
in `app/services/auth_service.py` is the template to follow, with a
new `PasswordResetToken` model). Any screen work: check
`COMPONENT_OWNERSHIP_MATRIX.md` first — `Label`/`Input`/`Button`/
`FormError`/`AuthLayout` now have a second, real consumer (`LoginForm`)
confirming they generalize past Register.

## Relevant Files

`backend/app/**` (all new this session — `main.py`, `core/{config,
security,redis,rate_limit}.py`, `db/{base,session}.py`, `models/{user,
email_verification_token}.py`, `schemas/auth.py`, `services/
auth_service.py`, `api/v1/{router,auth,oauth}.py`), `backend/alembic/**`
(new — async template, one migration), `backend/tests/**` (new — 6
files, 45 tests), `backend/pyproject.toml` (modified — deps added,
`package = false` removed), `.env.example` (modified — `SECRET_KEY`/
`CORS_ALLOWED_ORIGINS` added), `frontend/lib/validation/login-schema.ts`
(new), `frontend/lib/api/{client,auth}.ts` (new — first frontend→backend
API layer), `frontend/components/auth/{login-form,login-page-content,
oauth-buttons,verify-email-content}.tsx` (new), `frontend/components/
auth/register-page-content.tsx` (modified — `OAuthButtons` added,
AUTH-03's own file boundary), `frontend/app/[locale]/(auth)/{login,
verify-email}/page.tsx` (new), `frontend/messages/{en,fa,de}.json`
(modified — `Auth.login`/`Auth.oauth`/`Auth.verifyEmail` namespaces
added, real translations not placeholders), `frontend/tests/{login-
schema,login-form,oauth-buttons,verify-email-content}.test.tsx` (new).

## Findings Requiring Project Owner Decision

**Resolved this session (Governance Reconciliation, 2026-08-16):**
- ~~Sidebar width/collapsed-width (300px vs 280px)~~ — closed via
  `DESIGN_BIBLE_AMENDMENTS.md` Amendment 007 (Q1). 300px/88px is now
  authoritative; no code change needed, it already shipped that way.
- **`/settings` route placement** (`INFORMATION_ARCHITECTURE.md`'s
  nested `/profile/settings` vs. `APPLICATION_LAYOUT_GUIDE.md`'s
  top-level `/settings`) — found logged inline in
  `components/layout/nav-items.ts` but never centrally tracked here.
  Closed via Amendment 008 (Q2): top-level `/settings` is authoritative,
  matching shipped `nav-items.ts`.

**Still open, carried forward, unchanged:**
`color-accent`/`color-glass-highlight` (dark theme) remain unmapped;
Overlay scrim/Popover contract remain thin inferences; Tooltip's `side`
prop is physical not logical (RTL gap, DESIGNSYS-03).

- **GlassCard vs. the existing DESIGNSYS-02 `Card`**: `Card`
  (`components/ui/card.tsx`) remains hardcoded to Glass Level 2 per its
  own Card Contract and was NOT touched or replaced. `GlassCard` is a
  separate, level-parameterized primitive for the *other*
  DESIGN_TOKENS.md Part 6 contracts that need a different level
  (Timeline Detail Card/Booking Summary = 3, Modal = 4). Both now
  exist; neither supersedes the other. Not blocking, but worth
  confirming this reading is the intended one before a Feature task
  picks one or the other for a new card-shaped component.
- **`useReducedMotion()` non-reactivity** (see Verification Results
  above): purely a Framer Motion library behavior, worked around
  entirely within `MotionProvider`; no Design Bible or architecture
  implication, noted here only for provenance.

**Resolved this session (AUTH-01 Audit, 2026-08-19):**
- ~~`app/layout.tsx` nested-`<html>` regression~~ — deleted again; see
  narrative above. Recommend a lightweight guard (e.g. a CI/lint check
  or a comment-level convention) so this specific file doesn't
  reappear a third time — not implemented here (would be new tooling
  outside this session's audit scope), flagged for the project owner.
- ~~AuthLayout's plain `next/link`~~ — switched to `i18n/navigation`'s
  locale-aware `Link`, closing the gap `i18n/navigation.ts`'s own
  header comment had been flagging since DESIGNSYS-03.
- ~~AUTH-01 had zero localization~~ — `RegisterForm`,
  `RegisterPageContent`, the Zod schema, and the register page's
  metadata all now use real `next-intl` translations (`Auth` namespace
  in `messages/{en,fa,de}.json`), not placeholder or hardcoded English.
- ~~Label required-asterisk physical `ml-0.5`~~ — now logical `ms-0.5`.

**Newly found this session, NOT fixed (outside AUTH-01's own file
boundary, flagged for the owning task):**
- `components/layout/footer.tsx` (DESIGNSYS-03, consumed by
  `MarketingLayout` only) has the same hardcoded-English pattern for
  its own "Privacy"/"Terms" `LEGAL_LINKS` labels that AuthLayout had.
  Whoever next touches `Footer` or ships real `LAND-01` content should
  localize it the same way this session localized AuthLayout's copy.
- The pre-existing `Navigation`/`HomePage` placeholder-English gap in
  `messages/fa.json`/`messages/de.json` (logged since the Bootstrap
  Reconciliation, `MISSING_INFORMATION.md`) is unchanged — deliberately
  not touched, since it belongs to DESIGNSYS-03/LAND-01, not AUTH-01.

**Resolved this session (AUTH-02 through AUTH-05, 2026-08-22):** none
of these were open "findings" before this session — they're new scope
decisions made and flagged during implementation, listed here for
visibility rather than under "Resolved":
- Password hashing library: `bcrypt` directly, not `passlib` (known
  compatibility gaps with recent bcrypt releases).
- AUTH-05's token: stateless JWT, not the full Redis session AUTH-07
  will add — see narrative above.
- AUTH-02 stayed backend-only; `register-page-content.tsx`'s stub
  `handleRegister` (AUTH-01's own documented decision) was not wired to
  the live endpoint, since that would cross AUTH-02's declared
  backend-only scope. Login, by contrast, WAS wired end-to-end, since
  AUTH-05 was scoped as one combined task from the start. **Open
  question for the project owner:** should a small follow-up task wire
  `register-page-content.tsx` to the now-real `POST /auth/register`
  endpoint? Not done here without direction, to avoid silently
  expanding AUTH-02's scope.
- `/api/v1/health` still does not exist. `ATLAS-P0-HEALTH` is marked
  Done in `TASK_BOARD.md`'s Phase 0 table despite no such code
  existing anywhere in the repository (same historical gap as the
  rate-limiter/security-scaffold claims in `DEBUG_LOG.md`'s M0 record —
  pre-existing, not newly introduced). `docker-compose.yml`'s backend
  healthcheck will report unhealthy until a task actually builds this.
  Not built here (different task ID, out of this group's declared
  scope) — flagged, not silently fixed or silently left unmentioned.
- Python file-naming convention gap (`MASTER_RULES.md` §15) — see the
  AUTH-02–05 narrative above for the full explanation; snake_case used
  of necessity for every new `.py` file.

## Known Issues

None outstanding from AUTH-01's own scope after this session. Historical
known issues (pnpm build-script approval requirement, TypeScript 7.x
incompatibility, Sidebar tooltip RTL `side` prop) remain environment/
scope characteristics, unchanged. The `Footer` localization gap and the
broader `Navigation`/`HomePage` translation gap noted just above remain
open, owned by other tasks. New from this session: `/api/v1/health`
still doesn't exist (see finding above); `register-page-content.tsx`'s
`handleRegister` remains an intentional stub pending a decision on
whether to wire it now that the endpoint is real; OAuth (`AUTH-03`) and
email delivery (`AUTH-04`) remain stubbed pending real provider
credentials — neither is a defect, both were explicitly permitted or
necessitated by their own task's scope.

## Files Modified This Session (2026-08-16, DESIGNSYS-04)

**New:** `frontend/components/providers/motion-provider.tsx`,
`frontend/components/ui/glass.tsx`, `frontend/components/ui/
background-system.tsx`, `frontend/tests/motion-provider.test.tsx`,
`frontend/tests/glass.test.tsx`, `frontend/tests/background-system.test.tsx`,
`frontend/tests/animation-wrappers.test.tsx` (7 files).
**Modified:** `frontend/app/[locale]/layout.tsx` (mounted
`MotionProvider` + `BackgroundSystem`), `frontend/app/globals.css`
(added `.atlas-noise` utility), `frontend/components/ui/
motion-wrappers.tsx` (added `FadeIn`/`SlideIn`/`ScaleIn`/`ScrollReveal`
alongside the existing `AspectRatio`/`PageTransition`),
`frontend/vitest.setup.ts` (added an `IntersectionObserver` polyfill)
(4 files).
**Deleted:** none.
**`.ai/` governance files also updated this session:**
`TASK_BOARD.md`, `WORK_BREAKDOWN_STRUCTURE.md`,
`COMPONENT_OWNERSHIP_MATRIX.md` (moved DESIGNSYS-04 to Done; corrected
one pre-existing, unrelated stale "Not built" status on `ThemeProvider`,
which has been built and in active use since DESIGNSYS-01).

## Files Modified This Session (2026-08-16, Governance Reconciliation)

**New (`.ai/`):** `INFRASTRUCTURE_BASELINE.md`.
**Modified (`.ai/`):** `COMPONENT_OWNERSHIP_MATRIX.md` (§3 Foundation table fully corrected — see that file's own note; Footer/SkipLink added, both previously untracked), `INDEX.md` (DESIGNSYS status corrected, INFRASTRUCTURE entry added), `MASTER_RULES.md` (v1.2 → v1.3, new §25–29), `SESSION_PROMPT.md` (dependency-resolution and task-group steps added, renumbered), `CONVERSATION_STRATEGY.md` (new §8, incremental-output line in §5), `DESIGN_BIBLE_AMENDMENTS.md` (Amendments 007, 008, 009 added), `PROJECT_STATE.md` (this file), `TASK_BOARD.md`, `ATLAS-BOOTSTRAP-IMPLEMENTATION-REPORT.md` and `ATLAS-CONTINUATION-HANDOFF.md` (archival banners added, no content removed), `MISSING_INFORMATION.md` (FA/DE gap re-confirmed, resolved items removed).
**Modified (outside `.ai/`, explicitly approved — Q3, Q5, and the "tiny infrastructure change" allowance):** `.github/workflows/ci.yml` (added the missing frontend `Test` step; job renamed `frontend-lint-test-build`), `frontend/app/[locale]/layout.tsx` (comment-only — corrected a stale header describing the app shell as unbuilt), `docs/ATLAS_MVP_VISUAL_REFERENCE.png` (new, replaces the removed unreferenced stray PNG — Q5).
**Deleted:** `docs/ChatGPT Image Jul 17, 2026, 10_58_23 AM.png` (unreferenced, replaced per Q5).
**No application logic, component behavior, route, or test was changed.**

## Files Modified This Session (2026-08-19, AUTH-01 Audit & Bug Fix)

**Deleted:** `frontend/app/layout.tsx` (Finding #1 — redundant duplicate
of `app/[locale]/layout.tsx`, reintroducing the already-fixed nested-
`<html>` regression; outside AUTH-01's own file boundary, see narrative
above).

**Modified (AUTH-01's own files):**
- `frontend/app/[locale]/(auth)/layout.tsx` — locale-aware `Link`
  (Finding #2); localized Privacy/Terms + logo `aria-label` (Finding
  #3); converted to `async` + `getTranslations` from `next-intl/server`
  to stay a Server Component (no existing precedent in this codebase
  used `getTranslations` — every prior `useTranslations` consumer was a
  Client Component — chosen over adding `"use client"` here since
  ARCHITECTURE.md §4 defaults to Server Components and this layout has
  no interactivity requiring a client boundary).
- `frontend/app/[locale]/(auth)/register/page.tsx` — static `metadata`
  export replaced with `generateMetadata` + `getTranslations` (Finding
  #3; the static export has no access to the request locale at all).
- `frontend/components/auth/register-form.tsx` — `useTranslations`
  wired for every label/button/success/error string; Zod schema now
  built live via `createRegisterSchema(...)` with translated messages
  (Finding #3).
- `frontend/components/auth/register-page-content.tsx` — locale-aware
  `Link` (Finding #2); localized heading/subtitle/login-link text
  (Finding #3).
- `frontend/components/ui/label.tsx` — `ml-0.5` → `ms-0.5`, logical
  property fix for the required-field asterisk under RTL (Finding #4).
- `frontend/lib/validation/auth-schema.ts` — `registerSchema` (a fixed
  const) refactored into `createRegisterSchema(messages)` (a factory)
  plus a `registerSchema = createRegisterSchema(DEFAULT_EN_MESSAGES)`
  default export kept byte-identical to the prior hardcoded English, so
  `tests/auth-schema.test.ts` needed zero changes. `REGISTER_FIELD_LABELS`
  removed (dead after the JSX switched to `t()` calls directly;
  confirmed unused elsewhere via repo-wide grep before removal).
- `frontend/messages/en.json`, `frontend/messages/fa.json`,
  `frontend/messages/de.json` — new `Auth` namespace (`layout`,
  `register`, `validation` keys) added to all three; English kept
  byte-identical to the strings the test suite already asserted on; fa/de
  are real, natural translations, not placeholder English (validated:
  JSON parses cleanly, real Persian/German text confirmed present in
  live server responses — see Verification Results above).
- `frontend/tests/register-form.test.tsx` — `render` import switched
  from `@testing-library/react` to the project's own
  `renderWithProviders` (aliased `as render`, so none of the 10
  individual call sites needed touching) — required once `RegisterForm`
  started calling `useTranslations`; the file's own test assertions
  and behavior are otherwise unchanged.

**Not modified, deliberately (see Findings above):**
`components/layout/footer.tsx` (adjacent bug, different owning task);
`components/ui/typography.tsx`'s generic `Link` (Foundation primitive,
ambiguous internal/external usage by design, not a bug);
`components/ui/button.tsx` (already RTL-safe via flexbox's automatic
row-reversal under `dir="rtl"`, confirmed by inspection, no fix needed).

## Files Modified This Session (2026-08-22, AUTH-02 through AUTH-05)

**New (backend, all of it — first real `backend/app/` code):**
`backend/app/main.py`, `backend/app/core/{config,security,redis,
rate_limit}.py`, `backend/app/db/{base,session}.py`, `backend/app/
models/{user,email_verification_token}.py`, `backend/app/schemas/
auth.py`, `backend/app/services/auth_service.py`, `backend/app/api/v1/
{router,auth,oauth}.py`, plus `__init__.py` in every new package
directory (9 files). `backend/alembic/` (full async-template scaffold:
`env.py` customized, `script.py.mako`, one migration under `versions/`).
`backend/tests/` (`conftest.py`, `test_auth_register.py`,
`test_auth_login.py`, `test_auth_verify_email.py`, `test_security.py`,
`test_rate_limit.py`, `test_oauth_stub.py`, `__init__.py` — 8 files, 45
tests).

**New (frontend):** `frontend/lib/validation/login-schema.ts`,
`frontend/lib/api/client.ts`, `frontend/lib/api/auth.ts`,
`frontend/components/auth/login-form.tsx`, `frontend/components/auth/
login-page-content.tsx`, `frontend/components/auth/oauth-buttons.tsx`,
`frontend/components/auth/verify-email-content.tsx`, `frontend/app/
[locale]/(auth)/login/page.tsx`, `frontend/app/[locale]/(auth)/
verify-email/page.tsx`, `frontend/tests/login-schema.test.ts`,
`frontend/tests/login-form.test.tsx`, `frontend/tests/
oauth-buttons.test.tsx`, `frontend/tests/verify-email-content.test.tsx`
(13 files).

**Modified:** `backend/pyproject.toml` (deps added: `bcrypt`, `pyjwt`,
`email-validator` + dev `pytest-asyncio`/`httpx`; `[tool.uv] package =
false` removed; `[tool.hatch.build.targets.wheel]`/`[tool.pytest.ini_
options]` added), `backend/alembic.ini` (placeholder URL comment only —
real URL set in `env.py` from `Settings`), `.env.example` (`SECRET_KEY`,
`CORS_ALLOWED_ORIGINS` added), `frontend/components/auth/
register-page-content.tsx` (`OAuthButtons` added — AUTH-03's own
declared scope; `RegisterForm`/`handleRegister` themselves untouched),
`frontend/messages/{en,fa,de}.json` (`Auth.login`/`Auth.oauth`/
`Auth.verifyEmail` namespaces added; fa/de are real translations, not
placeholder English).

**Deleted:** none.

**`.ai/` governance files also updated this session:**
`PROJECT_STATE.md` (this file), `TASK_BOARD.md` (AUTH-02–05 moved to
Done with verification note, removed from Todo, AUTH-06/07's
dependency notation updated to ✅), `WORK_BREAKDOWN_STRUCTURE.md`
(Status lines added to the four completed tasks' own entries, top
status note updated — scope/acceptance text of each task definition
left untouched, since nothing about their definitions changed),
`COMPONENT_OWNERSHIP_MATRIX.md` (§5 Feature Component Matrix extended
with `LoginForm`/`LoginPageContent`/`VerifyEmailContent`/`OAuthButtons`
— no Foundation or Shared row touched).

**Backend infrastructure used for verification (not part of the
repository — this sandbox's own environment, not committed):**
PostgreSQL 16 and Redis 7 installed via `apt` and run locally, since no
Docker daemon is available here. A real developer machine or CI runner
with Docker would instead use the existing `docker-compose.yml`
services — nothing about the application code assumes this session's
specific local-install verification method.

## Notes for Next Session

`DESIGNSYS-01` through `04` are complete, closed, and now *accurately*
reflected in `COMPONENT_OWNERSHIP_MATRIX.md` — the matrix previously
undercounted its own coverage by roughly 24 components. Check it before
building anything that looks like it might already exist; the honest
answer is now usually "it does." `INFRASTRUCTURE_BASELINE.md` is new —
read it before touching routing, providers, i18n, test setup, CI, or
backend scaffolding.

`AUTH-01` has now been through a real audit against the live repository
(not memory/documentation) and had five real bugs found, four fixed —
see the 2026-08-19 narrative above. Its own files
(`register-form.tsx`, `register-page-content.tsx`,
`app/[locale]/(auth)/layout.tsx`, `register/page.tsx`, `auth-schema.ts`,
`label.tsx`) are now genuinely locale-correct and RTL-correct, verified
against a real running server across en/fa/de — not just asserted.
`i18n/navigation.ts`'s header comment flagging AuthLayout's plain
`next/link` as a known, deferred issue can now be removed or updated
the next time that file is touched (not done in this session — it's a
comment inside a file this task didn't otherwise need to modify, and
touching an unrelated file for a comment-only change felt like
overreach beyond this audit's actual scope).

**If a future session works on AUTH-05 (Login UI)**: it will reuse this
session's now-localized `AuthLayout` — the `Auth.layout` message
namespace (`logoAriaLabel`/`privacy`/`terms`) is already there and
correct; only `Auth.login`-shaped keys need adding alongside the
existing `Auth.register`/`Auth.validation` ones, following the same
pattern. **Update, 2026-08-22: this happened this session — see the
AUTH-02–05 narrative above.** `Auth.login`/`Auth.oauth`/
`Auth.verifyEmail` are now real namespaces in all three locale files.

`AUTH-02` through `AUTH-05` are now done — `backend/app/` holds real,
tested code for the first time (register, login, email verification,
OAuth-stub). If a future session works on `AUTH-06` (forgot-password),
`app/services/auth_service.py`'s `EmailVerificationToken`/
`resend_verification_token` pattern (hash-only storage, single-use,
expiring, anti-enumeration on the response) is the direct template for
a new `PasswordResetToken`. If a future session works on `AUTH-07`
(session/token handling), `app/core/security.py`'s `create_access_
token`/`decode_access_token` and the httpOnly cookie `POST /auth/login`
already sets are the starting point, not something to redesign — AUTH-07
adds the Redis-backed store (revocation, refresh) around them.

Recommended next task: `ATLAS-P1-AUTH-07`.

---

**LOCK STATUS:** LIVING — baseline approved 2026-07-22, updated
2026-07-24, 2026-07-29 (×2), 2026-08-13 (Bootstrap Reconciliation),
2026-08-15 (DESIGNSYS-03 complete), 2026-08-16 (DESIGNSYS-04 complete;
Governance Reconciliation, same date, second session), 2026-08-19
(AUTH-01 Audit & Bug Fix — Localization/RTL), 2026-08-22 (AUTH-02
through AUTH-05 complete — first real `backend/app/` code).
Future changes only via `MASTER_RULES.md` §21.
