# PROJECT_STATE.md

**Baseline locked:** 2026-07-22 (Bootstrap session, post Q1–Q4 approval)
**Last updated:** 2026-09-05 (CHAT-03 through CHAT-04 session — Conversation Manager backend, AI provider abstraction, SSE streaming, frontend wiring)
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
`AUTH-02` through `AUTH-05` (2026-08-22), `AUTH-06` through
`AUTH-08` (2026-08-24), `PROF-02`, `PROF-01`, `PROF-03`
(2026-08-25, in that dependency order), `LAND-01`, `LAND-02`,
`LAND-03` (2026-08-29, in that dependency order), `CHAT-01`, `CHAT-02`
(2026-09-01), and `CHAT-03`, `CHAT-04` (2026-09-05, in that dependency
order) are done — genuinely verified as done, not just re-asserted (see
Verification Results below). **All eight AUTH tasks are complete and
the AUTH module is closed. The PROF module (all three tasks) is
complete and closed. The LAND module (all three tasks) is complete and
closed. The CHAT module (all four Phase 1 tasks) is now also complete
and closed — `/chat` calls a real, single-model Conversation Manager
over a genuine SSE stream; nothing in the frontend is simulated
anymore.**

---

**Current Phase:** Phase 1 — Core Platform MVP (underway)
**Current Milestone:** M1
**Current Module:** none active — `DESIGNSYS` (01–04), `AUTH` (01–08),
`PROF` (01–03), and `LAND` (01–03) are complete and closed
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

**AUTH-06 through AUTH-08 (2026-08-24, this session):** requested as a
task group; execution order resolved from `WORK_BREAKDOWN_STRUCTURE.md`
(not the listed order) as **AUTH-07 → AUTH-06 → AUTH-08**. AUTH-06 and
AUTH-07 declare no dependency on each other — either could have gone
first — but AUTH-07 was sequenced first so AUTH-06's password-reset
could revoke sessions through AUTH-07's own store rather than the
reverse (AUTH-06 building a revocation mechanism AUTH-07 would then
have to adopt). AUTH-08 depends on AUTH-07 regardless. Each kept its
own scope and file boundaries, not merged.

**AUTH-07 — Session/token handling.** AUTH-05's JWT was, by its own
stated design, purely stateless — valid until its own `exp`, with no
way to revoke it early. This task adds exactly that: `app/core/
security.py`'s `create_access_token`/`decode_access_token` now carry a
`jti` claim (a breaking return-shape change, `AccessTokenPayload`
instead of a bare `UUID` — all three call sites, including
`test_security.py`, updated together). A new `app/core/session_store.py`
is the actual Redis-backed store: `session:{jti} → user_id` (TTL =
refresh-token lifetime, not access-token lifetime, so a session
survives across many short-lived access-token refreshes), a parallel
`refresh:{sha256(token)} → jti` mapping (the refresh token itself is
never persisted raw — same hash-only principle `EmailVerificationToken`
already established), and `user_sessions:{user_id}` as a Redis SET
enabling `revoke_all_sessions_for_user` (AUTH-06's own integration
point). `app/core/deps.py` (new) provides `get_current_user` — checks
BOTH JWT validity AND live Redis session state, which is what makes
revocation actually work rather than merely clearing a cookie the old,
still-signature-valid token would satisfy. Three new endpoints:
`POST /refresh` (re-signs a new access token for the same session,
slides both TTLs forward — sliding-expiration, not fixed), `POST
/logout` (idempotent — always 204, always clears both cookies, revokes
server-side only if a real session was found), `GET /me` (the one real
protected endpoint this task group ships, also doubles as the
frontend's "am I logged in" check). Login itself was modified (in
scope — this is precisely what "adds the Redis-backed store around
[AUTH-05's mechanism]" means) to register a session and set a second,
narrowly-scoped (`Path=/api/v1/auth`) refresh-token cookie alongside
the existing access-token one.

**AUTH-06 — Forgot-password flow.** Backend mirrors AUTH-04's
`EmailVerificationToken` pattern exactly, as flagged as the direct
template in this file's own prior "Notes for Next Session": new
`PasswordResetToken` model (hash-only storage, single-use, expiring —
kept as its own table rather than reusing `EmailVerificationToken`,
since the two serve different security contexts with different expiry
policies and conflating them would let a future change to one silently
affect the other), `POST /forgot-password` (anti-enumeration — identical
202 response whether or not the email exists) and `POST /reset-password`.
A successful reset calls AUTH-07's `revoke_all_sessions_for_user` — the
concrete reason for this session's chosen task order. Email delivery is
stubbed (logged server-side), same precedent and same reason as AUTH-04
(no SMTP provider documented anywhere). Frontend: `ForgotPasswordForm`
mirrors `LoginForm`'s structure; `ResetPasswordContent` reads `?token=`
from the URL like `VerifyEmailContent` did, but — unlike verify-email,
which needs no user input — renders a form and waits for submission
rather than auto-submitting on mount, since a new password has to be
typed first. A "Forgot password?" link was added to `LoginPageContent`
(AUTH-05's file; in scope for AUTH-06 as the flow's natural entry
point, per `INFORMATION_ARCHITECTURE.md`'s documented `/forgot-password`
route).

**AUTH-08 — Route guards (frontend) + RBAC scaffold (backend).**
Backend: `role` column on `User` (native Postgres enum, values `user`/
`admin`/`system` — `ARCHITECTURE.md` §12's own list verbatim, not an
invented taxonomy), `require_role(*roles)` dependency factory layered
on `get_current_user` via FastAPI's own `Depends()` chaining. **No
protected endpoint exists to wire it onto** — no admin-only feature is
in scope anywhere in Phase 1 — so `require_role` is exercised directly
as a plain function in `tests/test_rbac.py` (the same "test the
function, don't fabricate a route" approach `test_security.py` already
used for `create_access_token`), not bolted onto a manufactured route
purely to have an integration test. Frontend: `proxy.ts` (next-intl's
own required middleware, previously pure locale-routing plumbing) now
also redirects an unauthenticated request for a protected path straight
to `/login?redirect=<path>`, before locale resolution runs. This is a
**presence-only check** (does the access-token cookie exist), not a
validity check (is the session still live in Redis) — deliberately:
the latter would mean an Edge-runtime network call to the backend on
every single navigation, a materially heavier architecture decision
than "route guards" was scoped for. `get_current_user` remains the
authoritative check, applied whenever a page actually calls a protected
API endpoint. The guarded path list
(`lib/auth/protected-routes.ts`) is derived from `components/layout/
nav-items.ts`'s already-shipped `APP_NAV_ITEMS` (DESIGNSYS-03) minus two
deliberate exclusions: `/chat`, because guest-mode AI Chat is explicit,
locked product scope (`ONBOARDING_EXPERIENCE.md` §Guest Experience,
`USER_FLOWS.md` Flow 02 — no registration wall before value is
demonstrated), and `/help`, because it isn't in `INFORMATION_
ARCHITECTURE.md`'s route table at all and public Help/FAQ content is
the safer default absent a stated requirement to gate it. **No real
protected page exists yet** to fully demonstrate the redirect against
(`DASH-01`/`PROF-03`/etc. haven't shipped) — verified instead against
`proxy.ts`'s actual exported function directly, using `next/server`'s
real `NextRequest`/`NextResponse` (confirmed working in this Vitest
environment empirically before relying on it, not assumed), which is a
genuine test of the real code path, just without a live page on the
other end of the redirect yet.

**Three real bugs found and fixed mid-session, none asserted away:**

1. **`sa.Enum(UserRole, ...)` without `values_callable` stores the
   Python enum's member *names* (`"USER"`) as the Postgres enum's
   labels, not its `.value`s (`"user"`)** — silently incompatible with
   `server_default=UserRole.USER.value` (a lowercase string that
   wouldn't even be a valid label of the resulting type). Caught by
   inspecting the autogenerated migration before applying it, not by
   assuming autogenerate got it right. Fixed with an explicit
   `values_callable=lambda enum_cls: [m.value for m in enum_cls]` on
   the model's `SQLEnum(...)`, then the migration was regenerated
   clean.
2. **Alembic's `op.add_column` with a native Postgres enum does not
   auto-emit `CREATE TYPE`** the way `op.create_table` does (which
   handles it as part of table DDL). The first real `alembic upgrade
   head` attempt failed with `type "user_role" does not exist` — this
   is a distinct bug from #1, only surfaced by actually running the
   migration against a real database, not by reading the generated
   file. Fixed with an explicit `postgresql.ENUM(...).create(op.get_bind(),
   checkfirst=True)` / `.drop(..., checkfirst=True)` pair in the
   migration itself.
3. **A content bug, not a logic bug:** `Auth.resetPassword.genericError`
   was mistakenly authored with token-specific text ("This reset link
   is invalid or has expired") instead of a generic retry message — the
   component code correctly fell back to this key for non-`ApiError`
   failures (e.g. a real network failure), but the key's own *value*
   was wrong, so a network-failure test asserting the literal displayed
   text caught it. This also surfaced a real (if minor) pre-existing
   pattern gap: `LoginForm`/`RegisterForm`'s `error instanceof Error ?
   error.message : t("genericError")` fallback would let a raw
   `TypeError("Failed to fetch")` reach the user verbatim on a network
   failure, violating `AI_EXPERIENCE.md` §Error Recovery's "Never
   display raw system errors." Not fixed in those two files (AUTH-01/
   AUTH-05's own files, out of this task group's scope) — flagged here
   for whoever next touches them — but `ForgotPasswordPageContent`/
   `ResetPasswordContent` (this session's own new files) were written
   to normalize *every* non-`ApiError` failure to a translated generic
   message before it ever reaches the form, matching `VerifyEmailContent`'s
   already-correct, safer pattern instead.

**Real infrastructure, not mocks — same standard as the prior session.**
PostgreSQL 16 + Redis 7 installed via `apt` (no Docker daemon available
here), a real `alembic downgrade base → upgrade head` roundtrip run
twice (once per new migration), and a full live-server curl session
tying AUTH-06 and AUTH-07 together end to end: register → login → `/me`
(role visible) → forgot-password → reset-password with the actual
emailed (stub-logged) token → **the pre-reset session cookie confirmed
rejected (401) against the live server** (not merely in pytest) → old
password rejected → new password accepted → new session's `/me`
confirmed working. Then a real 88-test pytest suite and a real 241-test
Vitest suite covering the same ground repeatably, plus a real
`pnpm run build` (20 static pages, `/forgot-password` and
`/reset-password` both compiling, Proxy/Middleware recognized).

Full verification detail: see "Verification Results" below. Full file
list: see "Files Modified This Session (2026-08-24, AUTH-06 through
AUTH-08)" below.

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

**Last Completed (WBS task):** `ATLAS-P1-AUTH-08` — 2026-08-24 (last of
this session's three; see full narrative above). Chronologically prior
in this same session: `AUTH-07`, `AUTH-06` (both 2026-08-24). Before
this session: `ATLAS-P1-AUTH-05` — 2026-08-22.

**Next Task (recommended, not yet authorized):** All eight AUTH tasks
are done — the AUTH module is closed. `ATLAS-P1-PROF-01` (progressive
profile-collection UI) and `ATLAS-P1-PROF-02` (User Profile Service
backend CRUD) are newly unblocked (`AUTH-07` ✅), same for
`ATLAS-P1-MEM-02` (authenticated preference storage) and half of
`ATLAS-P1-DASH-01` (Dashboard also still needs `CHAT-03`).
`ATLAS-P1-LAND-01`, `ATLAS-P1-CHAT-01`, and `ATLAS-P1-CHAT-03` remain
independently available with no dependencies at all, same as before
this session. No single task is a hard bottleneck the way `AUTH-07` was
for this session's own three — the next choice is a genuine product
sequencing decision (profile completion vs. landing page vs. chat
backend) rather than a dependency-graph necessity, so no single
recommendation is asserted here beyond naming the unblocked set.

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

## Verification Results (2026-08-24, AUTH-06 through AUTH-08 — actually run against real infrastructure, not asserted)

**Backend:**

| Check | Result |
|---|---|
| `mypy --ignore-missing-imports .` (strict mode, matching CI exactly) | ✅ clean, 36 source files |
| `pytest` (real PostgreSQL 16 + Redis 7, apt-installed locally — no Docker daemon available) | ✅ 88/88 passing (45 pre-existing + 43 new: 24 session/refresh/logout/`/me`, 12 forgot/reset-password, 5 direct `require_role` unit tests, 2 default-role/`/me`-role-exposure) |
| `alembic downgrade base` → `upgrade head` roundtrip, ×2 (once per new migration) | ✅ both succeed; enum type + column confirmed correctly created/dropped via `\d users` and a direct `pg_enum` label query |
| Live server smoke test (`uvicorn`, real curl) — AUTH-07 alone | ✅ login sets both cookies with correct `Path`/`Max-Age`; `/me`, `/refresh`, `/logout` all behave correctly; **a captured pre-logout refresh token replayed directly after logout returns 401** (proves server-side revocation, not just a cleared client cookie) — Redis confirmed empty (`KEYS session:*`/`refresh:*`/`user_sessions:*`) after logout |
| Live server smoke test — full AUTH-06 + AUTH-07 chain | ✅ register (role="user") → login → `/me` (role visible) → forgot-password → reset-password with the real stub-logged token → **pre-reset session cookie confirmed rejected (401) live** → old password rejected (401) → new password accepted (200) → new session's `/me` confirmed working |

**Frontend:**

| Check | Result |
|---|---|
| `tsc --noEmit` | ✅ clean |
| `eslint .` | ✅ 0 errors, 0 warnings |
| `vitest run` | ✅ 241/241 passing, 35/35 files (214 pre-existing + 27 new: `forgot-password-form.test.tsx`, `reset-password-form.test.tsx`, `reset-password-content.test.tsx`, `forgot-password-schema.test.ts`, `reset-password-schema.test.ts`, `protected-routes.test.ts`, `proxy.test.ts` — the last two including a real test of `proxy.ts`'s actual exported middleware function using `next/server`'s genuine `NextRequest`/`NextResponse`, confirmed working in this environment before relying on it rather than assumed) |
| `next build` | ✅ succeeds — 20 static pages, `/forgot-password` and `/reset-password` both compiling, Proxy (Middleware) recognized |

**Three real bugs found and fixed mid-session (not asserted away):** all three described in full in the AUTH-06–08 narrative above — (1) `sa.Enum` without `values_callable` storing Python enum member names instead of `.value`s as Postgres labels, silently incompatible with `server_default`; (2) `op.add_column` with a native enum not auto-creating the Postgres type the way `op.create_table` does; (3) `Auth.resetPassword.genericError` authored with the wrong (token-specific, not generic-retry) text, which also surfaced a real, un-fixed (out of scope) raw-error-leak pattern in `LoginForm`/`RegisterForm`.

---

## Verification Results (2026-08-25, PROF-01 through PROF-03 — actually run against real infrastructure, not asserted)

**Backend:**

| Check | Result |
|---|---|
| `mypy --ignore-missing-imports .` (strict mode) | ✅ clean, 33 source files |
| `pytest` (real PostgreSQL 16 + Redis 7, apt-installed) | ✅ 102/102 passing (88 pre-existing + 14 new in `test_profile.py`: auth gate, get-or-create-on-first-access, personal-info + enum-field updates, invalid-enum rejection (422), multi-select food-preference accept/reject/dedup, partial-update semantics — omitted-vs-explicit-null distinction — per-user profile isolation) |
| `alembic upgrade head` → `downgrade -1` → `upgrade head` → `downgrade -1` → `upgrade head`, doubled roundtrip | ✅ now stable; the *first* single roundtrip failed with `DuplicateObjectError` — see bug (1) below |
| Live server smoke test (`uvicorn`, real curl) | ✅ register → login → `GET /profile/me` (auto-creates empty profile) → `PATCH` (name + enums + food_preferences) → `GET` again (confirms persistence) → unauthenticated `GET` → 401 → invalid enum `PATCH` → 422 |
| Live e2e smoke test, backend + frontend together | ✅ real registration/login against the live backend, then the **same session cookie** presented to the live frontend server: authenticated `GET /en/profile` → 200 (real page, not a redirect) |

**Frontend:**

| Check | Result |
|---|---|
| `tsc --noEmit` | ✅ clean |
| `eslint .` | ✅ 0 errors, 0 warnings |
| `vitest run` | ✅ 277/277 passing, 39/39 files (241 pre-existing + 36 new: `step-indicator.test.tsx` (5), `profile-wizard.test.tsx` (10), `file-upload.test.tsx` (9), `profile-page-content.test.tsx` (10), plus 2 new cases added to the existing `form-controls.test.tsx` for `RadioGroupItem`'s `card` variant) |
| `next build` | ✅ succeeds — `/profile` and `/profile/wizard` both compiling under `(app)` |
| Route guard, both directions, live | ✅ unauthenticated `/en/profile` → redirects to `/en/login?redirect=%2Fen%2Fprofile`; unauthenticated `/en/profile/wizard` → 307; authenticated `/en/profile` (real cookie) → 200 |
| RTL, live | ✅ `/fa/login` still renders `<html lang="fa" dir="rtl">` with the new routes present |

**Four real bugs found and fixed mid-session (not asserted away):**

1. **Alembic — orphaned enum types on downgrade.** `op.create_table` correctly auto-creates the 4 new Postgres enum types as part of table DDL (as expected — this is the case `95eb9436f15e`'s own comment already documented working correctly), but `op.drop_table` does **not** drop them back. A downgrade → re-upgrade failed live with `DuplicateObjectError: type "travel_preference" already exists`. Fixed with explicit, `checkfirst=True` enum `.drop()` calls in `downgrade()` — the same fix *shape* AUTH-08 used, but for the opposite (drop, not create) side of a fresh-table migration rather than an added column.
2. **Copy-paste type error, caught by the compiler alone.** `PreferencesSection`'s `budget_level` dropdown needed a `"mid_range"` → `"midRange"` translation-key remap; that same ternary was copy-pasted into the `travel_preference` dropdown's loop, where `"mid_range"` can never occur. `tsc` correctly rejected it (`TS2367`, "no overlap") before any test ran.
3. **Nested focusable elements — a real accessibility bug.** `FileUpload`'s first draft wrapped the real, visually-hidden `<input type="file">` in a `role="button"` `<div>` with its own `tabIndex`/keydown handling, leaving two independently-focusable elements for one logical control. Rewritten to a native `<label htmlFor>` association — less code, and the browser owns all the activation/focus/keyboard semantics instead of a hand-rolled reimplementation of them.
4. **Accessible-name leak.** Even after fix (3), the hidden input's computed accessible name still resolved to the *entire* concatenated text content of its `<label>` — not just the intended label string, but also any hint text (`FileUpload`) or the avatar's fallback-initials text (`ImageUpload`) sharing that same label. Fixed with an explicit `aria-label={label}` on the input, which decouples the accessible name from whatever else visually shares the label. Fixing this also surfaced, via the test suite, that `@testing-library/user-event` v14 correctly honors `accept="image/*"` when simulating an upload (accurately mirroring real browser file-picker filtering, not a bug) — the "reject a non-image file" test was rewritten to use drag-and-drop instead, the actual path that bypasses `accept` filtering in both real browsers and this environment.

**Scope decisions made and flagged, not silently assumed (full rationale in each component's own docstring):**
- **Avatar upload has no storage backend.** `ImageUpload` is a real, fully working picker (drag/click, type/size validation, client-side preview) — but no object-storage endpoint exists anywhere in this repository (`ARCHITECTURE.md` §11's External Provider list has no image/file storage entry). The picked photo is previewed but never sent in a `PATCH /profile/me`; the UI says so plainly (`avatarStorageNotConnected` message) rather than pretending success. Same category of honest, documented gap as AUTH-03's OAuth stub and AUTH-04's email stub.
- **Flow 03's "Travel Style" step has no document-defined value list of its own.** Mapped to the two closed, documented lists that most plausibly cover "how someone likes to travel" — Accommodation and Transportation (`APPLICATION_LAYOUT_GUIDE.md` §Profile Sections) — both shown on the wizard's third screen. Full reasoning in `lib/validation/profile-schema.ts`'s module docstring.
- **`ProfileMenu` explicitly not built.** Per `COMPONENT_OWNERSHIP_MATRIX.md` §4, PROF-03 or DASH-01 could claim it; PROF-03 declined because it would need to link to `/trips`, `/saved`, `/dashboard` — none of which have real pages yet. `/profile` remains fully reachable via Sidebar/MobileBottomNav's existing entries regardless. See that document for the recorded deferral.
- **Country/timezone are free-text, not Select dropdowns.** No document anywhere provides a country list (~195 entries) or IANA timezone list (~400 entries) to build a Select from; inventing one would assert scope no document calls for.
- **`preferred_ui_language`/`preferred_travel_language` offer only en/fa/de** — the app's actual 3 implemented locales, not PRD.md §9's wider 8-language ambition (already Phase 4+ per the approved Q4 scope decision).
- **`GET /api/v1/auth/me` had no frontend wrapper before this session** (PROF-03 needs the user's email, which lives on `User`, not `TravelerProfile`) — added `getMeRequest()` to `lib/api/auth.ts`, a small, natural extension of AUTH's own API layer, not a new module.

---

## Verification Results (2026-08-29, LAND-01 through LAND-03 — actually run against real infrastructure, not asserted)

Frontend-only (`INDEX.md`'s own LAND entry: "Backend: none — guest mode
is frontend + existing chat endpoint"); no backend changes this
session.

| Check | Result |
|---|---|
| `tsc --noEmit` | ✅ clean |
| `eslint .` | ✅ 0 errors, 0 warnings |
| `vitest run` | ✅ 295/295 passing, 49/49 files (277 pre-existing + 18 new: one file per new Landing component, plus `tests/mocks/next-intl-server.ts` as new shared test infrastructure) |
| `next build` | ✅ succeeds — exactly one manifest entry for `/[locale]` (`app-paths-manifest.json` checked directly, not inferred from build success alone — see bug (1) below) |
| Live standalone-server smoke test, all 3 locales | ✅ `/en`, `/fa`, `/de` → HTTP 200, correct `<html lang dir>` each; `/fa` confirmed rendering real Persian hero copy, not English fallback |
| Live smoke test, unrelated existing route | ✅ `/en/register` still 200 (no regression from Footer's edits, which `AuthLayout`'s own footer does not use) |
| Heading hierarchy, live HTML | ✅ exactly one `<h1>`; every `<h2>`'s content sits under it with `<h3>`s beneath, no skipped levels (`ACCESSIBILITY.md` §Heading Structure) |

**Three real bugs found and fixed mid-session (not asserted away — none of the three were caught by typecheck, lint, or `next build` alone; each needed either a manifest inspection or an actual running server):**

1. **Duplicate route, silently ambiguous.** `app/[locale]/page.tsx` (the original Bootstrap placeholder) and `app/[locale]/(marketing)/page.tsx` (DESIGNSYS-03's real target) both existed and both compiled into separate `.next/server/app-paths-manifest.json` entries for the same effective path — a leftover from DESIGNSYS-03's move that copied rather than deleted the original. `next build` alone gives no warning for this; only inspecting the manifest directly surfaced it. Fixed by deleting the stray file.
2. **RSC boundary violation — real 500, invisible to typecheck/lint/build.** `CTASection` (a Server Component) called `buttonVariants()` — exported from `button.tsx`, a `"use client"` module — directly, to style a plain `<a>` as a button. This type-checks and survives `next build` (Turbopack's static analysis doesn't catch it), then crashes with a real `500` the moment the standalone server actually serves the page: `"Attempted to call buttonVariants() from the server."` Only caught by starting `node .next/standalone/server.js` and requesting the page — exactly the class of bug `INFRASTRUCTURE_BASELINE.md`'s own RSC-boundary caution (and `MASTER_RULES.md` §18's "standalone server smoke test" requirement) exists to catch. Fixed by marking `CTASection` `"use client"`, matching the identical, pre-existing constraint `Navbar` already carries for its own `buttonVariants`-styled links.
3. **`next-intl/server`'s `getTranslations` throws unconditionally under Vitest.** Tried the `getTranslations` + async-Server-Component pattern for `Footer` first, mirroring AuthLayout's own (AUTH-01-audit-documented) precedent. It builds and runs correctly in the real app, but breaks *every existing test that renders a layout containing Footer* — `tests/layouts.test.tsx`'s `MarketingLayout`/`ApplicationLayout` tests call plain synchronous `render()`, which cannot await a component nested arbitrarily deep in the tree. Root cause (confirmed via a throwaway repro, not assumed): `next-intl/server` resolves to a build that throws `"not supported in Client Components"` whenever a jsdom-like environment is detected, regardless of the calling component's real boundary. Built `tests/mocks/next-intl-server.ts` (aliased in `vitest.config.ts`, same mechanism as the pre-existing `next/navigation` alias) as a working stand-in — but, having built it, still chose to revert `Footer` itself to a synchronous `"use client"` component using `useTranslations` instead, since that's zero-cost here (Footer has no real interactivity either way) and avoids the *recurring* cost of every future test touching a Footer-containing layout needing the same await-first workaround. The mock is kept anyway: real, working, reusable infrastructure for the next async-Server-Component this codebase does need to test (AuthLayout, for instance, still has none).

**Scope decisions made and flagged, not silently assumed (full rationale inline in each component's own docstring):**
- **No Testimonials, StatisticsSection, PartnerLogos, or Newsletter section**, despite all four being named in `COMPONENT_INVENTORY.md` §Landing Page. Atlas has no real users, reviews, usage statistics, or partners yet — `BRAND_GUIDELINES.md` §8/§13 ("Never invent facts... Never fabricates reviews") rules out fabricating any of the four rather than leaving the section empty. `DestinationCarousel` uses only real, verifiable geography/culture (no ratings, review counts, or invented "best time to visit" specifics); `AIShowcase` uses one explicitly-labeled *example* exchange, not a claimed real transcript.
- **No GSAP, no Three.js**, despite both being nominally "Approved Libraries" (`DESIGN_SYSTEM.md` §40). Neither is an installed dependency of this repository today; `AnimatedBackground`'s abstract route/waypoint motif is built entirely with the already-installed Framer Motion (`DESIGN_TOKENS.md` Part 5's own "default interaction library"). Introducing either as a new runtime dependency for one decorative background is a call this task didn't make unilaterally (`MASTER_RULES.md` §5).
- **`AIQuickAccess` (Shared, `COMPONENT_OWNERSHIP_MATRIX.md` §4) intentionally not claimed**, even though LAND shipped first among its two candidate owners (LAND-01/CHAT-01). `LAND-02`'s own AI search box already serves as the Landing page's primary AI entry point; a persistent cross-page quick-access trigger would need somewhere to open *to* (an actual chat surface), which doesn't exist yet. Building it now would mean inventing UI for a destination that doesn't exist. Left for `CHAT-01` to claim once `/chat` is real.
- **`AISearchBox` submission and `GuestEntryCta`'s link both target `/chat`**, which has no real page yet (`CHAT-01` not started) — the same "wire the entry point, the destination catches up" pattern already established for `AUTH-08`'s route guards and every `nav-items.ts` link to a not-yet-built page. `AISearchBox` passes the typed prompt via `?prompt=` so `CHAT-01` can pre-fill the first message rather than discarding it.
- **`tests/layout-test-utils.tsx`'s `renderWithProviders` extended to wrap `MotionProvider`**, matching the real `app/[locale]/layout.tsx` provider order exactly (`INFRASTRUCTURE_BASELINE.md` §3) — missing until this task; no existing consumer of the helper had rendered a `FadeIn`/`SlideIn`/`ScaleIn`/`ScrollReveal` component before, so the gap had never surfaced. Purely additive (`MotionProvider` renders no DOM of its own), confirmed non-breaking by re-running the full pre-existing suite afterward.

## Verification Results (2026-09-01, CHAT-01 through CHAT-02 — actually run against real infrastructure, not asserted)

Frontend-only; no backend changes this session. `CHAT-03`/`04` (the
Conversation Manager backend + streaming endpoint) are untouched — see
scope notes below for how the send/streaming pipeline works without
them.

| Check | Result |
|---|---|
| `tsc --noEmit` | ✅ clean |
| `eslint .` | ✅ 0 errors, 0 warnings |
| `vitest run` | ✅ 344/344 passing, 55/55 files (295 pre-existing + 49 new: `message-bubble`, `typing-indicator`, `use-chat-session`, `chat-composer`, `conversation-sidebar`, `chat-page-content`) |
| `next build` | ✅ succeeds — `/[locale]/chat` compiles as a real route |
| Live standalone-server + Playwright, desktop (1440px) and mobile (390px), en/fa/de | ✅ empty state, example-prompt send, full thinking→streaming→complete cycle, Stop mid-stream, Regenerate, Copy, mobile drawer, and a 4-turn conversation with auto-scroll all observed via real screenshots, not inferred from code |
| Mobile composer vs. `MobileBottomNav` overlap | ✅ send button's bounding box confirmed fully inside the 844px viewport (`y + height = 711`) — the height math below actually checked, not just reasoned about |
| Keyboard Tab order from the composer | ✅ confirmed correct — see bug note below on why the first attempt looked wrong |
| `fa` locale | ✅ `dir="rtl"` confirmed; sidebar and composer send button both correctly mirror sides; Latin `Enter`/`Shift` key names inside Persian sentences render correctly, not reversed |

**Height reservation (`components/chat/chat-page-content.tsx`):** this
page's root claims `h-[calc(100dvh-9rem)] lg:h-[calc(100dvh-72px)]` —
Navbar's own height (`4rem`/`72px`, matching `Sidebar`'s identical
calc) plus, mobile-only, `MobileBottomNav`'s space (`ApplicationLayout`'s
`<main>` already reserves this generally via `pb-20`; this page
additionally subtracts it from its own height so the composer never
sits underneath the fixed bottom nav). Desktop does not reserve space
for the minimal `Footer` below `<main>` — it's still reachable by
scrolling the outer page slightly further (confirmed: Tab from an
empty composer correctly proceeds to Footer's Privacy/Terms links, not
trapped), a reasonable trade-off for a workspace-style view rather than
growing this page's height math to account for a footer it doesn't own.

**Two real bugs found and fixed (neither caught by typecheck/lint/tests alone), one apparent bug that turned out correct on inspection:**

1. **Duplicate heading, mobile drawer only.** `ConversationSidebar`'s own `<h2>Conversations</h2>` visibly duplicated `SheetContent`'s `title` prop (also "Conversations") once rendered inside the mobile drawer — invisible in the desktop `<aside>` usage, which has no other heading of its own. Found only by looking at the actual Playwright screenshot, not by any automated check. Fixed with a `showHeading` prop (default `true`; `chat-page-content.tsx` passes `false` for the Sheet usage).
2. **`regenerateLastResponse` — a real state-timing bug, caught by its own unit test before any UI test ran.** The original implementation set a plain closure variable (`hadAssistantMessage`) from inside the `setConversations` updater function, then read that variable back immediately after calling `patchConversation`, to decide whether to call `runAssistantTurn`. This isn't reliably synchronous in React — the updater's side effect isn't guaranteed to have run by the time the very next line executes. `tests/use-chat-session.test.ts`'s regenerate test failed with "expected length 2, got 1" (the assistant turn was trimmed but never regenerated — the flag read as `false`), which is what surfaced it. Fixed by reading `activeConversation.messages` directly (already-current React state, no round-trip through the updater) to decide whether to proceed, before making any state change.
3. **Not a bug — worth recording because it looked like one first.** An initial keyboard-Tab-order check found focus landing on a Footer link (`<a>`) instead of the composer's own Send button, which looked wrong. Root cause, confirmed by re-testing with the composer filled: the Send button is correctly `disabled` while the composer is empty (`!canSend`), and disabled form controls are natively excluded from Tab order — the browser was doing exactly the right thing. With text typed first, Tab correctly landed on Send. Recorded here specifically so a future session doesn't "fix" this non-bug.

**One test-only fix, not a product bug:** `useSearchParams()`'s real Next.js return type (`ReadonlyURLSearchParams`) rejected the test file's plain `URLSearchParams` mock under `tsc` (invisible to `eslint` or to `vitest run` itself, which doesn't type-check at all) — fixed with the identical `as ReturnType<typeof useSearchParams>` cast pattern `reset-password-content.test.tsx` already established for this exact situation, not a new workaround.

**Scope decisions made and flagged, not silently assumed:**
- **`CHAT-03`/`04` untouched, by design.** Sending a message runs entirely against `lib/chat/simulate-assistant-reply.ts` — a single, isolated, heavily-commented stub that times a "thinking" pause and a progressive text reveal, then delivers a fixed, transparent `Chat.previewNotice` string (translated in all three locales) explaining plainly that this is a preview and real recommendations will come from verified information once the backend connects. It never fabricates a travel answer to what the user actually asked (`BRAND_GUIDELINES.md` §13, `MASTER_RULES.md` §8). Every component in `components/chat/` only ever sees `ChatMessage`/`Conversation` (`lib/chat/types.ts`) and callback props — swapping this one module's internals for a real SSE client later shouldn't require touching any of them.
- **`AIQuickAccess` and `ConnectionStatus`/`RetryCard` (Shared) still unclaimed.** `CHAT-01` was a listed candidate owner for both and didn't take either: `AIQuickAccess` would mean adding a slot to `Navbar` (DESIGNSYS-03 territory) beyond this task's own file boundaries; `ConnectionStatus` has no live connection to report on without `CHAT-03`/`04`. Left for whichever task next has a concrete reason to add either.
- **Conversation state is React state only — no persistence.** Refreshing `/chat` currently loses the conversation. This is `MEM-01`'s explicitly separate, now-unblocked scope (declared dependency `CHAT-02`), not something to pre-build here.
- **Copy-to-clipboard built inline in `MessageBubble`, not as a new Shared `CopyButton`** — none existed yet to consume or duplicate (`COMPONENT_OWNERSHIP_MATRIX.md` §4 lists it `TBD`).
- **Naming vs. `COMPONENT_INVENTORY.md`:** `ConversationList`/`ConversationCard` ship as one `ConversationSidebar` component, not two; `StreamingBubble` ships as `export const StreamingBubble = MessageBubble` — a direct alias, not a parallel implementation, since `MessageBubble`'s own `status` field already fully covers the streaming visual and `aria-busy` treatment.
- **Real EN/FA/DE translations for the new `Chat` namespace** (not placeholder English), matching the established per-namespace convention — verified live via screenshots in all three locales, not just present in the JSON. The pre-existing `Navigation.chat` label ("AI Chat," left untranslated in `fa`/`de`) was deliberately not used as a precedent to imitate; this task's new copy is translated on its own terms rather than mirroring an ambiguous, previously-unaudited choice.

## Verification Results (2026-09-05, CHAT-03 through CHAT-04 — actually run against real infrastructure, not asserted)

Backend + frontend. Closes the CHAT module: `/chat` now calls a real,
single-model Conversation Manager over a genuine SSE stream — nothing
in the send/streaming pipeline is simulated anymore.

| Check | Result |
|---|---|
| `uv sync` | ✅ clean (`openai==3.0.0` resolves; was listed in `pyproject.toml` but genuinely unused anywhere before this session) |
| `mypy --strict` (`app/`) | ✅ 34 files, 0 issues |
| `mypy --strict` (`ai/`, `--explicit-package-bases`) | ✅ 9 files, 0 issues — new CI step added (`.github/workflows/ci.yml`), since `ai/` is a sibling package `backend/`'s own mypy target never reached |
| `mypy --strict` (combined, the exact CI command) | ✅ 52 files, 0 issues |
| Real Postgres 16 + Redis 7 (apt-installed, no Docker daemon here — same approach as every prior session), `alembic upgrade head` | ✅ 4 migrations, unchanged — this task added no new tables (see scope decisions below) |
| `pytest` | ✅ 123/123 passing (102 pre-existing + 21 new: `tests/test_chat.py`) |
| Live standalone server (`uv run uvicorn app.main:app`) + `curl`, both endpoints | ✅ confirmed after fixing two real bugs — see below |
| `pnpm install` + `approve-builds --all` | ✅ clean, documented known issue only |
| `tsc --noEmit` | ✅ clean |
| `eslint .` | ✅ 0 errors, 0 warnings |
| `vitest run` | ✅ 356/356 passing, 56/56 files (344 pre-existing + 12 new: 7 in the new `tests/stream-assistant-reply.test.ts`, 2 added to `chat-page-content.test.tsx`, and net +3 in a rewritten `use-chat-session.test.ts`; `previewNotice` and its one dedicated test are gone with the retired stub) |
| `next build` | ✅ succeeds, `/[locale]/chat` still compiles as the same dynamic route |

**Three real bugs found and fixed — all three only surfaced by actually
running something (a live server, or a test genuinely exercising the
real, non-mocked code path), exactly the pattern this project's own
prior sessions already established:**

1. **`ModuleNotFoundError: No module named 'ai'` starting the real server — never caught by `pytest`.** `pytest`'s own `pythonpath` ini option (added this session, alongside `mypy_path`, to let `backend/`'s tooling resolve the sibling `ai/` package — see `backend/pyproject.toml`) puts the repo root on `sys.path` unconditionally for the *entire test session*, which fully masked an import-order bug: `app/api/v1/chat.py` imports directly from `ai.providers.base` *above* its own `from app.core.ai import get_llm_provider` line, and `app/core/ai.py`'s own `sys.path` insertion (the only place that had one) therefore ran too late for that first import. Fixed by moving the same insertion technique (already precedented in `alembic/env.py`) to the very top of `app/main.py`, guaranteed to run before anything it transitively imports — `app/core/ai.py` keeps its own copy too (idempotent, guarded), for any future entrypoint that imports it directly.
2. **A malformed request came back `503` instead of `422` whenever the AI provider was also unconfigured — found via live `curl`, not by any test using `dependency_overrides` (which replaces `get_llm_provider` entirely and never exercises its own behavior).** FastAPI resolves a route's `Depends()` dependencies as part of the same pass that validates the request body; the original `get_llm_provider()` raised `ProviderNotConfiguredError` *during that resolution*, which pre-empted FastAPI ever reporting the body's own validation failure — an empty `messages` list or a client-supplied `"system"`-role message both came back as a truthful-but-wrong 503 ("try again later") instead of the more useful 422 ("fix your request"). Fixed by having `get_llm_provider()` return `None` instead of raising; `app/api/v1/chat.py`'s two routes check for `None` themselves, inside the function body — which only executes once the request body has already validated successfully. Two regression tests added (`test_invalid_request_returns_422_even_when_provider_is_unconfigured` and its streaming counterpart), both deliberately *not* using `dependency_overrides`, so they exercise the real dependency the way the live bug did.
3. **A "late" `onChunk`/`onDone`/`onError` after `stopGenerating()` could silently rewrite an already-finalized message — found by this session's own new frontend unit test, before any manual check.** `runAssistantTurn`'s callbacks updated the target message by id only, with no check that it was still `status: "streaming"` — a real, if narrow, race (the abort signal doesn't necessarily silence an in-flight `reader.read()` that already resolved with data at the same tick `stop()` fires). Fixed by guarding all three callbacks on `message.status === "streaming"` before applying an update.

**Scope decisions made and flagged, not silently assumed:**
- **`ai/` gets real content for the first time.** `prompts/`, `agents/`, `schemas/`, `evaluations/` existed only as `.gitkeep` scaffolding before this session — `DEBUG_LOG.md`'s M0 record claiming an "LLMProvider interface" and "OpenAIProvider implementation" were already delivered does not match the actual repository (confirmed empty; same category of gap already logged for `/api/v1/health`). This session adds `ai/providers/{base,openai_provider}.py`, `ai/config.py`, `ai/prompts/atlas_conversation_prompt.py`, and `ai/agents/conversation_manager.py` — `ai/schemas/` and `ai/evaluations/` remain empty, correctly (structured tool-call schemas and an eval harness are Phase 2/5 scope, not needed for a single-model passthrough).
- **Stateless by design — no conversation persistence added.** `ChatCompletionRequest` carries the full message history on every call; the backend holds nothing between requests. `MEM-01`/`MEM-02` (guest session memory, authenticated preference storage) are separate, independently-scoped tasks — folding persistence in here would have crossed into their declared territory.
- **No authentication required on either chat endpoint.** `/chat` is deliberately unguarded (guest-mode AI Chat is locked product scope) and this task added no persistence that would need a user attached — both endpoints are rate-limited by client IP instead, sharing one counter (verified: alternating between the streaming and non-streaming route does not extend the effective limit).
- **`CHAT-03` (non-streaming `POST /completions`) intentionally left un-wired to the frontend.** Building the frontend against a non-streaming endpoint first, then rewiring it again for `CHAT-04`'s SSE endpoint, would have been throwaway work — the frontend swap happened once, directly onto the streaming endpoint, in `CHAT-04`. The non-streaming endpoint is still real and independently tested (useful on its own merits — e.g. a future non-browser consumer per `ARCHITECTURE.md`'s Telegram Bot/API expansion list — not dead code).
- **`prefersReducedMotion` removed from `UseChatSessionOptions` entirely**, not left as an accepted-but-ignored option. It existed only to tell the retired stub whether to skip an artificial typewriter-style reveal — a real network stream has no equivalent to skip (chunks arrive whenever the backend actually sends them). `chat-page-content.tsx`'s own now-unused `useMotionPreference()` import/call was removed along with it; reduced-motion for chat's own *rendering* remains a `components/chat/*` concern via `conversation-panel.tsx`'s own, separate `useMotionPreference()` call, unaffected.
- **`lib/chat/simulate-assistant-reply.ts` deleted**, not left alongside the new real client — its own doc comment from `CHAT-01/02` explicitly named this exact swap as the moment it would be retired.
- **Provider choice: OpenAI, matching already-existing precedent** (`openai` in `pyproject.toml`, `OPENAI_API_KEY` in `.env.example` since Phase 0) — not changed to any other provider despite this sandbox being unable to reach `api.openai.com` (confirmed: `403 x-deny-reason: host_not_allowed`) but able to reach `api.anthropic.com`. Swapping the documented provider choice would itself have been an unauthorized architecture change (`MASTER_RULES.md` §5); the network restriction is an environment limitation on *verification*, not a reason to change the decision. Verified instead via a dependency-injected fake provider (`tests/test_chat.py`) exercising the real request/response/error-mapping code, a live `curl` smoke test of the full pipeline up to the provider boundary, and a from-scratch SSE-parsing test (`tests/stream-assistant-reply.test.ts`) using a real `ReadableStream`. A live call to the real OpenAI API has not happened and cannot happen from this environment — that remains a project-owner action once a reachable environment and a real key are both available.

## Relevant Documentation (for whichever next task is chosen)

The AUTH module (all eight tasks), the PROF module (all three tasks),
the LAND module (all three tasks), and now the CHAT module (all four
Phase 1 tasks) are closed — nothing further to read there unless
revisiting one of them. All three remaining Phase 1 candidates are now
unblocked (`CHAT-02`, `CHAT-03`, and `AUTH-07` — their only
dependencies — are all done):

`MEM-01`: `17_AI_EXPERIENCE.md` §Memory ("Guest users: Session memory
until browser close"), `lib/chat/use-chat-session.ts`'s own doc
comment (states plainly what is and isn't its job — it currently holds
no persistence at all, by design; this task is what's expected to wrap
or extend it). Should not need to touch any `components/chat/*` file,
since they only ever see plain data/callbacks from the hook.
`MEM-02`: `17_AI_EXPERIENCE.md` §Memory, `PRD.md` §7.13 — consumes
`get_current_user`; note `TravelerProfile` (PROF-02) already covers
durable *preference* fields — `MEM-02`'s own "basic authenticated
preference storage" scope should be checked against that table first
so the two don't overlap.
`DASH-01`: `18_DASHBOARD_EXPERIENCE.md` (full document),
`26_APPLICATION_LAYOUT_GUIDE.md` §Dashboard — now fully unblocked
(both `CHAT-03` and `AUTH-07` are done). Check
`COMPONENT_OWNERSHIP_MATRIX.md` §4 first — `ProfileMenu` and
`NotificationCenter` are both explicitly assigned to `DASH-01` now that
PROF-03 declined the former (see that document's own note on why).

Recommended: `MEM-01` first (smallest, Complexity S, and the most
natural continuation of this session's own work — see this session's
own Verification Results below for exactly what `use-chat-session.ts`
looks like now). `MEM-02` and `DASH-01` do not depend on `MEM-01` or on
each other and can run in separate, parallel sessions per
`CONVERSATION_STRATEGY.md` §8 — their `Allowed Files to Modify` lists
don't overlap with `MEM-01`'s (`lib/chat/**`) or with each other's
(`MEM-02`: backend preference storage; `DASH-01`: new dashboard-only
frontend files).

## Relevant Files

**AUTH infrastructure (unchanged since 2026-08-24):**
`backend/app/core/{security,session_store,deps,config}.py`,
`backend/app/models/{user,password_reset_token}.py`,
`backend/app/schemas/auth.py`, `backend/app/api/v1/auth.py`,
`backend/app/services/auth_service.py`.

**PROF infrastructure (unchanged since 2026-08-25):**
`backend/app/models/traveler_profile.py`,
`backend/app/schemas/profile.py`,
`backend/app/services/profile_service.py`,
`backend/app/api/v1/profile.py`, `backend/alembic/versions/
47035b9239e4_create_traveler_profiles_table.py`,
`frontend/lib/api/profile.ts`,
`frontend/lib/validation/profile-schema.ts`,
`frontend/components/profile/**`,
`frontend/components/ui/{step-indicator,file-upload,image-upload}.tsx`,
`frontend/components/ui/radio.tsx` (`card` variant),
`frontend/app/[locale]/(app)/profile/{page.tsx, wizard/page.tsx}`.

**LAND infrastructure (unchanged since 2026-08-29):**
`frontend/components/landing/**` (11 Feature Components: `hero-section`,
`ai-search-box`, `example-prompts`, `guest-entry-cta`,
`animated-background`, `how-it-works`, `destination-carousel`,
`ai-showcase`, `feature-highlights`, `faq-section`, `cta-section`),
`frontend/app/[locale]/(marketing)/page.tsx`,
`frontend/components/layout/footer.tsx`,
`frontend/tests/mocks/next-intl-server.ts`.

**CHAT infrastructure — module now fully closed (2026-09-05). The
pattern any future page/task that consumes this hook should follow:**
`ai/{config,providers/**,prompts/**,agents/conversation_manager}.py`
(CHAT-03 — the provider-independent AI layer; `ai/schemas/`,
`ai/evaluations/` remain empty scaffold, Phase 2/5 scope),
`backend/app/core/{ai,exception_handlers}.py`,
`backend/app/schemas/chat.py`, `backend/app/services/chat_service.py`,
`backend/app/api/v1/chat.py` (CHAT-03 non-streaming route + CHAT-04
streaming route), `frontend/lib/chat/{types,use-chat-session,
stream-assistant-reply}.ts` (CHAT-02/CHAT-04 — `simulate-assistant-reply.ts`
is retired/deleted; read `use-chat-session.ts`'s own doc comment before
treating anything here as available for persistence — it explicitly
isn't yet, that's `MEM-01`), `frontend/components/chat/
{message-bubble,typing-indicator}.tsx` (CHAT-02),
`frontend/app/[locale]/(app)/chat/page.tsx`,
`frontend/components/chat/{chat-page-content,conversation-sidebar,
chat-composer,conversation-panel}.tsx` (CHAT-01), `frontend/messages/
{en,fa,de}.json` (`Chat` namespace, real translations, not
placeholders). Full list with New/Modified split: "Files Modified This
Session (2026-09-05, CHAT-03 through CHAT-04)" below.

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

**Resolved this session (LAND-01 through LAND-03, 2026-08-29):**
- ~~`components/layout/footer.tsx` hardcoded-English `LEGAL_LINKS`~~ —
  flagged during the AUTH-01 audit (2026-08-19) as "whoever next
  touches Footer or ships real LAND-01 content should localize it."
  Now done: full `Footer` namespace (`tagline`/`product`/`company`/
  `legal`/`copyrightPrefix`/`copyrightFull`) in all three locale files,
  real translations not placeholders, plus a new Product column
  (`APPLICATION_LAYOUT_GUIDE.md` §Landing Footer Sections) linking to
  the four real sections this session builds.
- ~~`messages/fa.json`/`messages/de.json`'s `HomePage`/`Navigation`
  placeholder-English gap~~ — `HomePage` fully rewritten with real
  Persian/German content (hero, how-it-works, discover, AI showcase,
  features, FAQ, closing CTA); `Navigation`'s four marketing-anchor
  labels (`discover`/`aiAssistant`/`features`/`faq`) were already real
  as of DESIGNSYS-03 and are now genuinely load-bearing, reused
  directly by Footer's new Product column rather than duplicated.

**Newly found this session (LAND-01 through LAND-03, 2026-08-29), all
three fixed — see "Verification Results" above for the full root-cause
narrative on each:** the duplicate `app/[locale]/page.tsx` route, the
`CTASection` RSC-boundary 500, and `next-intl/server`'s Vitest
incompatibility (worked around with a new mock rather than left
broken).

**Still open, unresolved by this session (out of LAND's own scope, not
newly discovered):** `color-accent`/`color-glass-highlight` (dark
theme) remain unmapped; Overlay scrim/Popover contract remain thin
inferences; Tooltip's `side` prop is physical not logical (RTL gap);
`/api/v1/health` still doesn't exist; `register-page-content.tsx`'s
`handleRegister` stub; OAuth/email-delivery stubs — all unchanged,
carried forward from prior sessions.

Historical known issues (pnpm build-script approval requirement,
TypeScript 7.x incompatibility, Sidebar tooltip RTL `side` prop) remain
environment/scope characteristics, unchanged by this or any prior
session. `register-page-content.tsx`'s `handleRegister` remains an
intentional stub pending a decision on whether to wire it now that the
endpoint is real; OAuth (`AUTH-03`) and email delivery (`AUTH-04`)
remain stubbed pending real provider credentials — neither is a defect,
both were explicitly permitted or necessitated by their own task's
scope.

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

## Files Modified This Session (2026-08-24, AUTH-06 through AUTH-08)

**New (backend):** `backend/app/core/session_store.py`,
`backend/app/core/deps.py`, `backend/app/models/password_reset_token.py`,
`backend/alembic/versions/c1f834af0629_create_password_reset_tokens_table.py`,
`backend/alembic/versions/95eb9436f15e_add_role_column_to_users.py`,
`backend/tests/test_auth_session.py`,
`backend/tests/test_auth_forgot_reset_password.py`,
`backend/tests/test_rbac.py` (8 files, 43 new tests).

**New (frontend):** `frontend/lib/validation/forgot-password-schema.ts`,
`frontend/lib/validation/reset-password-schema.ts`,
`frontend/lib/auth/protected-routes.ts`,
`frontend/components/auth/forgot-password-form.tsx`,
`frontend/components/auth/forgot-password-page-content.tsx`,
`frontend/components/auth/reset-password-form.tsx`,
`frontend/components/auth/reset-password-content.tsx`,
`frontend/app/[locale]/(auth)/forgot-password/page.tsx`,
`frontend/app/[locale]/(auth)/reset-password/page.tsx`,
`frontend/tests/forgot-password-form.test.tsx`,
`frontend/tests/reset-password-form.test.tsx`,
`frontend/tests/reset-password-content.test.tsx`,
`frontend/tests/forgot-password-schema.test.ts`,
`frontend/tests/reset-password-schema.test.ts`,
`frontend/tests/protected-routes.test.ts`,
`frontend/tests/proxy.test.ts` (16 files, 27 new tests).

**Modified (backend):** `backend/app/core/security.py` (`jti` support,
`AccessTokenPayload`, extracted cookie-name constants),
`backend/app/core/config.py` (refresh-token lifetime, new rate-limit
settings), `backend/app/schemas/auth.py` (`RefreshResponse`,
`ForgotPasswordRequest`, `ResetPasswordRequest`, `ResetPasswordResponse`,
`UserResponse.role`), `backend/app/api/v1/auth.py` (login now registers
a session; added `/refresh`, `/logout`, `/me`, `/forgot-password`,
`/reset-password`), `backend/app/services/auth_service.py`
(`request_password_reset`, `reset_password`), `backend/app/models/user.py`
(`UserRole` enum, `role` column), `backend/alembic/env.py`
(`password_reset_token` added to the model-import list),
`backend/tests/test_security.py` (updated for the `AccessTokenPayload`
return-shape change), `backend/tests/test_auth_login.py` (updated for
the same change, plus new refresh-token-cookie coverage).
`backend/app/core/redis.py` was touched mid-session (an attempted
`Redis[str]` type parameterization, reverted once this redis-py
version's stubs turned out not to support it — see narrative above) but
its final content is byte-identical to the AUTH-02–05 baseline, so it
is not a net modification.

**Modified (frontend):** `frontend/lib/api/auth.ts`
(`forgotPasswordRequest`, `resetPasswordRequest`),
`frontend/components/auth/login-page-content.tsx` ("Forgot password?"
link), `frontend/proxy.ts` (route guard, wired before next-intl's own
middleware), `frontend/messages/{en,fa,de}.json`
(`Auth.forgotPassword`, `Auth.resetPassword`, `Auth.login.forgotPassword`
— fa/de are real translations, not placeholder English).

**Deleted:** none.

**`.ai/` governance files also updated this session:**
`PROJECT_STATE.md` (this file), `TASK_BOARD.md` (AUTH-06/07/08 moved
to Done with verification note, removed from Todo; PROF-01/PROF-02/
MEM-02/DASH-01's AUTH-07 dependency marked ✅), `COMPONENT_OWNERSHIP_
MATRIX.md` (§5 Feature Component Matrix extended with
`ForgotPasswordForm`/`ForgotPasswordPageContent`/`ResetPasswordForm`/
`ResetPasswordContent`; header metadata line extended — no Foundation
or Shared row touched; AUTH-07/AUTH-08 introduced no new UI components).
`WORK_BREAKDOWN_STRUCTURE.md` not touched — no task's own scope or
acceptance criteria changed from what was already defined there.

**Backend infrastructure used for verification (same method as the
prior session, not part of the repository):** PostgreSQL 16 and Redis 7
via `apt`, no Docker daemon available here.

## Files Modified This Session (2026-08-25, PROF-01 through PROF-03)

**New (backend):** `backend/app/models/traveler_profile.py`,
`backend/app/schemas/profile.py`,
`backend/app/services/profile_service.py`,
`backend/app/api/v1/profile.py`,
`backend/alembic/versions/47035b9239e4_create_traveler_profiles_table.py`,
`backend/tests/test_profile.py` (6 files, 14 new tests).

**New (frontend):** `frontend/lib/api/profile.ts`,
`frontend/lib/validation/profile-schema.ts`,
`frontend/components/ui/step-indicator.tsx`,
`frontend/components/ui/file-upload.tsx`,
`frontend/components/ui/image-upload.tsx`,
`frontend/components/profile/profile-wizard.tsx`,
`frontend/components/profile/profile-wizard-options.ts`,
`frontend/components/profile/profile-page-content.tsx`,
`frontend/components/profile/profile-personal-info-section.tsx`,
`frontend/components/profile/profile-preferences-section.tsx`,
`frontend/app/[locale]/(app)/profile/page.tsx`,
`frontend/app/[locale]/(app)/profile/wizard/page.tsx`,
`frontend/tests/step-indicator.test.tsx`,
`frontend/tests/profile-wizard.test.tsx`,
`frontend/tests/file-upload.test.tsx`,
`frontend/tests/profile-page-content.test.tsx` (16 files, 34 new test
cases, plus 2 more added to an existing file — see Modified below).

**Modified (backend):** `backend/alembic/env.py` (`traveler_profile`
added to the model-import list), `backend/app/api/v1/router.py`
(`profile_router` registered), `backend/tests/conftest.py`
(`traveler_profiles` added to the per-test `TRUNCATE` list — noted in
passing, not fixed: `password_reset_tokens` was already missing from
that same list before this session, pre-existing and out of scope).

**Modified (frontend):** `frontend/components/ui/radio.tsx`
(`RadioGroupItem` extended with a `variant="card"` prop — documented
Extension per `COMPONENT_OWNERSHIP_MATRIX.md` §7's Lifecycle table,
default `"circle"` behavior byte-identical to before),
`frontend/lib/api/auth.ts` (`getMeRequest()` added — PROF-03 needed the
user's email, which lives on `User`, not `TravelerProfile`),
`frontend/tests/form-controls.test.tsx` (2 new cases for
`RadioGroupItem`'s `card` variant, added to the existing `RadioGroup`
`describe` block rather than a new file),
`frontend/messages/{en,fa,de}.json` (`Profile.wizard`, `Profile.page`
— both new namespaces; fa/de are real translations, not placeholder
English, matching AUTH's own established convention).

**Deleted:** none.

**`.ai/` governance files also updated this session:**
`PROJECT_STATE.md` (this file), `TASK_BOARD.md` (PROF-01/02/03 moved
to Done with verification note, removed from Todo), `COMPONENT_
OWNERSHIP_MATRIX.md` (§3: `RadioGroupItem`'s extension noted in place;
§4: `StepIndicator`, `FileUpload`, `ImageUpload` marked Built;
`ProfileMenu`'s deferral to `DASH-01` recorded with rationale;
`Breadcrumb`/`Pagination`/`Tabs` split into their own row now that
`StepIndicator` shipped separately; §5: `ProfileWizard`/
`ProfilePageContent`/etc. added as new Feature Components; header
metadata line extended). `WORK_BREAKDOWN_STRUCTURE.md` not touched —
no task's own declared scope or acceptance criteria changed from what
was already defined there.

**Backend infrastructure used for verification:** PostgreSQL 16 and
Redis 7 via `apt` (same method as every prior session). The sandbox
environment restarted mid-session (Postgres/Redis processes stopped,
files on disk unaffected) — both services were restarted and the full
backend test suite (102/102) and the `traveler_profiles` table's
presence were both re-confirmed afterward before continuing, not
assumed to have survived.

## Files Modified This Session (2026-08-29, LAND-01 through LAND-03)

Frontend-only — no backend files touched.

**New (Feature Components, `frontend/components/landing/`):**
`hero-section.tsx`, `ai-search-box.tsx`, `example-prompts.ts`,
`guest-entry-cta.tsx`, `animated-background.tsx`, `how-it-works.tsx`,
`destination-carousel.tsx`, `ai-showcase.tsx`, `feature-highlights.tsx`,
`faq-section.tsx`, `cta-section.tsx` (11 files).

**New (tests):** one file per component above —
`frontend/tests/{hero-section,ai-search-box,guest-entry-cta,
animated-background,how-it-works,destination-carousel,ai-showcase,
feature-highlights,faq-section,cta-section}.test.tsx` (10 files, 20 new
test cases), plus `frontend/tests/mocks/next-intl-server.ts` (new
shared test infrastructure, not itself a test file).

**Modified:** `frontend/app/[locale]/(marketing)/page.tsx` (rewritten
— composes the 7 Content Section components above inside
`MarketingLayout`, replacing the Bootstrap placeholder; adds
per-locale `generateMetadata`, matching `register/page.tsx`'s
established pattern exactly), `frontend/components/layout/footer.tsx`
(localized in full — `useTranslations`, not the `getTranslations`
pattern first tried and then reverted, see Verification Results above
— new Product column), `frontend/messages/{en,fa,de}.json`
(`HomePage` fully rewritten from its one-line Bootstrap placeholder;
new `Footer` namespace; real Persian/German throughout, not
placeholder English), `frontend/tests/layout-test-utils.tsx`
(`renderWithProviders` now also wraps `MotionProvider`, matching the
real app's provider order — see Verification Results finding above),
`frontend/tests/footer.test.tsx` (updated for the new Product column
and full localized copy), `frontend/vitest.config.ts` (`next-intl/
server` aliased to the new mock, same mechanism as the pre-existing
`next/navigation` alias).

**Deleted:** `frontend/app/[locale]/page.tsx` — the stray duplicate of
`(marketing)/page.tsx` found this session (see Verification Results,
bug 1).

**`.ai/` governance files also updated this session:**
`PROJECT_STATE.md` (this file), `TASK_BOARD.md` (LAND-01/02/03 moved
to Done with verification note, removed from Todo), `COMPONENT_
OWNERSHIP_MATRIX.md` (§5: 11 new Landing Feature Components added;
§4: `AIQuickAccess` row annotated with this session's explicit
non-claim and why). `WORK_BREAKDOWN_STRUCTURE.md` not touched — no
task's own declared scope or acceptance criteria changed from what was
already defined there.

## Files Modified This Session (2026-09-01, CHAT-01 through CHAT-02)

Frontend-only — no backend files touched. File-by-file task ownership
noted inline; see Verification Results above for why the split runs
this way (ConversationPanel, CHAT-01, renders CHAT-02's message
components — matching the WBS's own declared dependency direction).

**New (`frontend/lib/chat/` — CHAT-02):** `types.ts`
(`ChatMessage`/`Conversation`/`MessageRole`/`MessageStatus`),
`simulate-assistant-reply.ts` (the documented CHAT-03/04 swap point),
`use-chat-session.ts` (conversation/message state hook — send, stream,
stop, regenerate/retry, new/select conversation; in-memory only, see
its own doc comment on why).

**New (`frontend/components/chat/` — CHAT-02):** `message-bubble.tsx`
(`MessageBubble` + the `StreamingBubble` alias), `typing-indicator.tsx`.

**New (`frontend/components/chat/` — CHAT-01):**
`chat-page-content.tsx` (orchestrator — reads `?prompt=`, wires
`useChatSession`, composes the responsive layout),
`conversation-sidebar.tsx` (reused inline on desktop and inside the
mobile `Sheet` drawer via its `showHeading` prop), `chat-composer.tsx`
(auto-growing textarea, Enter-to-send), `conversation-panel.tsx`
(scrollable message list, welcome/empty state, stick-to-bottom
auto-scroll).

**New (route — CHAT-01):** `frontend/app/[locale]/(app)/chat/page.tsx`
(`generateMetadata` + a real loading skeleton in the required
`useSearchParams` `Suspense` boundary, not `fallback={null}` — this
page's layout is heavier than `reset-password`'s/`verify-email`'s
small centered forms).

**New (tests, one file per component above unless noted):**
`frontend/tests/{message-bubble,typing-indicator}.test.tsx` (CHAT-02,
14 cases), `frontend/tests/use-chat-session.test.ts` (CHAT-02, hook
behavior via `renderHook` + fake timers, 12 cases),
`frontend/tests/{chat-composer,conversation-sidebar}.test.tsx`
(CHAT-01, 14 cases), `frontend/tests/chat-page-content.test.tsx`
(CHAT-01, integration-level — empty state, `?prompt=` prefill, example
prompts, full send/stream cycle, mobile drawer — 9 cases). 49 new tests
total across 6 files.

**Modified:** `frontend/messages/{en,fa,de}.json` (new `Chat`
namespace — real, meaning-preserving Persian and German throughout,
not placeholder English; see Verification Results above on why
`Navigation.chat`'s untranslated "AI Chat" wasn't used as a precedent
to copy).

**`.ai/` governance files also updated this session:**
`PROJECT_STATE.md` (this file), `TASK_BOARD.md` (CHAT-01/02 moved to
Done with verification note, removed from Todo; Todo section's own
explanatory note updated for the newly-unblocked set), `COMPONENT_
OWNERSHIP_MATRIX.md` (§4: `AIQuickAccess` and `ConnectionStatus`/
`RetryCard` rows annotated with this session's explicit non-claim and
why; §5: the `Chat-specific` Feature row updated from planned to
delivered, with real file paths and the `ConversationList`/
`StreamingBubble` naming notes). `WORK_BREAKDOWN_STRUCTURE.md` not
touched — no task's own declared scope or acceptance criteria changed
from what was already defined there.

## Files Modified This Session (2026-09-05, CHAT-03 through CHAT-04)

**New (`ai/` — first real content in this package; CHAT-03):**
`__init__.py`, `config.py` (`AIConfig` — plain dataclass, populated by
`backend/app/core/ai.py`, per `DEBUG_LOG.md`'s own documented but
previously-unbuilt decision), `providers/__init__.py`,
`providers/base.py` (`LLMProvider` ABC, `LLMMessage`, the
`ProviderError` hierarchy), `providers/openai_provider.py`
(`OpenAIProvider` — `complete()` + `stream_complete()`),
`prompts/__init__.py`, `prompts/atlas_conversation_prompt.py`
(versioned system prompt), `agents/__init__.py`,
`agents/conversation_manager.py` (`generate_reply()` +
`stream_reply()` — the actual "direct passthrough to one model").
`schemas/`, `evaluations/` remain empty scaffold — correctly, Phase
2/5 scope.

**New (`backend/app/` — CHAT-03/04):** `core/ai.py`
(`get_llm_provider()` factory + the `ai/` ↔ `backend/` `sys.path`
wiring), `core/exception_handlers.py` (`ProviderError` → calm HTTP
mapping, `describe_provider_error()`), `schemas/chat.py`
(`ChatMessageIn`/`ChatCompletionRequest`/`ChatCompletionResponse`),
`services/chat_service.py` (`complete_chat()`/`stream_chat()`),
`api/v1/chat.py` (`POST /completions` — CHAT-03; `POST
/completions/stream`, SSE — CHAT-04).

**New (tests):** `backend/tests/test_chat.py` (21 cases: success,
system-prompt prepending, guest access, validation, provider-error
mapping, rate limiting, streaming, and the two live-bug regression
tests — see Verification Results above).

**Modified (`backend/app/`):** `core/config.py` (`openai_api_key`,
`openai_model`, `rate_limit_chat_max`, `rate_limit_chat_window_seconds`),
`api/v1/router.py` (wired `chat_router`), `main.py` (the `sys.path`
fix for bug #1 above, `register_exception_handlers(app)` call).

**Modified (backend infra):** `pyproject.toml` (`pythonpath`/`mypy_path`
pointing at the repo root, for the `ai/` ↔ `backend/` package
boundary), `.github/workflows/ci.yml` (new "Type check ai/ layer"
step).

**New (`frontend/lib/chat/` — CHAT-04):** `stream-assistant-reply.ts`
(real `fetch()` + `ReadableStream` SSE client — the documented
`CHAT-03/04` swap point `simulate-assistant-reply.ts` itself named).

**Deleted:** `frontend/lib/chat/simulate-assistant-reply.ts` — retired,
per its own doc comment's stated intent, not left in place alongside
the real client.

**Modified (`frontend/lib/chat/`):** `use-chat-session.ts`
(`runAssistantTurn` now calls the real network client instead of the
stub, gained an `onError` path and a `status === "streaming"` guard on
all three callbacks — bug #3 above; `sendMessage`/`regenerateLastResponse`
now compute the outgoing message array synchronously, mirroring the
existing fix already applied to this same file for the identical React
state-timing pitfall; `prefersReducedMotion` removed entirely — see
Verification Results above), `types.ts` (doc-comment updates only, no
type changes — reflects `CHAT-03/04` now existing and `MessageStatus`
`"error"` now having a real producer).

**Modified (other frontend):** `lib/api/client.ts` (`API_BASE_URL`
exported, was module-private — reused by the new streaming client),
`components/chat/chat-page-content.tsx` (`errorMessage` replaces
`previewReply`; `useMotionPreference()` import/call removed, now
unused there).

**Modified:** `frontend/messages/{en,fa,de}.json` (`Chat.errors.generic`
replaces the retired `Chat.previewNotice` — real, meaning-preserving
Persian and German, not placeholder English, matching this module's
own established convention from `CHAT-01/02`).

**New/rewritten tests:** `frontend/tests/stream-assistant-reply.test.ts`
(new — 7 cases, a real `ReadableStream` through a mocked `fetch`,
covering buffering across reads, the `done`/`error` discriminator,
malformed-event resilience, and `stop()`), `frontend/tests/
use-chat-session.test.ts` (rewritten — mocks the module instead of
driving fake timers; 14 cases, net +2 versus before), `frontend/tests/
chat-page-content.test.tsx` (rewritten the same way; 11 cases, net +2,
including a new Retry-after-error case).

**`.ai/` governance files also updated this session:** `PROJECT_STATE.md`
(this file — also brought the top summary block and this section's own
predecessor current, which had drifted behind the dated
Verification/Files-Modified sections below it for the `PROF`/`LAND`/
`CHAT-01/02` sessions; noted, not silently normalized as if it had
always been current), `TASK_BOARD.md` (`CHAT-03`/`04` moved to Done,
CHAT module marked closed, Todo section's own note updated for the
newly-unblocked set). `WORK_BREAKDOWN_STRUCTURE.md` and
`COMPONENT_OWNERSHIP_MATRIX.md` not touched — no task's declared scope
or acceptance criteria changed from what was already defined, and no
UI component (Foundation, Shared, or Feature) was created or modified
this session (`lib/chat/*` is hook/data-layer code, not a component
per that document's own §2 definitions).

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
**Update, 2026-08-24: both of the above happened this session — see the
AUTH-06–08 narrative above.** `PasswordResetToken` and the Redis-backed
session store both exist and are tested.

**All eight AUTH tasks are now done — the module is closed.** Every
authenticated backend route now has `app/core/deps.get_current_user`
available as a dependency (checks live Redis session state, not just
JWT signature — see AUTH-07's narrative for why that distinction
matters), and `app/core/deps.require_role(*roles)` for anything that
needs to go further and restrict by role — no route uses the latter
yet, by design (no admin-only feature exists anywhere in Phase 1 scope
to protect). On the frontend, `proxy.ts` now guards `/dashboard`,
`/trips`, `/saved`, `/notifications`, `/profile`, `/settings` — a
future session shipping a real page under any of those paths (`DASH-01`,
`PROF-03`, etc.) gets the guard for free, no further wiring needed.
`/chat` is deliberately NOT guarded (guest-mode AI Chat is locked
product scope) — if a future task ever needs to gate some *part* of
Chat while keeping the rest guest-accessible, that's a page-level
decision (e.g. checking `get_current_user`'s result inside the chat
page itself for a specific authenticated-only feature), not something
to solve by adding `"chat"` to `PROTECTED_PATH_SEGMENTS`.

**One real, if minor, gap flagged but not fixed (out of this session's
scope):** `LoginForm`/`RegisterForm`'s error-handling fallback
(`error instanceof Error ? error.message : t("genericError")`) will let
a raw `TypeError` message (e.g. `"Failed to fetch"` on a real network
failure) reach the user verbatim, since the page-content wrapper around
each rethrows non-`ApiError` failures unchanged rather than normalizing
them first. `VerifyEmailContent`'s pattern (explicit `instanceof
ApiError` check, translated generic fallback for everything else) is
safer and is what this session's own new components
(`ForgotPasswordPageContent`, `ResetPasswordContent`) were written to
follow instead. Neither `LoginForm` nor `RegisterForm` was touched —
both are AUTH-01/AUTH-05's own files, outside this task group's
boundary — but whoever next touches either should apply the same fix.

**PROF-01 through PROF-03 are done — the PROF module is closed.**
`/profile` is the first real page in `(app)`/ApplicationLayout, and
`/profile/wizard` is the first genuinely wired multi-step form flow in
the product. Any future authenticated-settings-style feature
(Settings itself, once scoped) can follow `PersonalInfoSection`'s
autosave-on-blur / `PreferencesSection`'s autosave-on-change pattern
directly rather than re-deriving one. `TravelerProfile` now exists as
a real table — a future `MEM-02` session should check it before adding
a second, overlapping preference-storage mechanism (see "Relevant
Documentation" above). Three new Shared components exist for reuse:
`StepIndicator` (any future multi-step flow), `FileUpload`/
`ImageUpload` (any future file-picking UI, including Trip Details'
Documents feature — reuse `FileUpload` directly for that, not
`ImageUpload`, which assumes an image preview). `RadioGroupItem` now
has a `card` variant, useful for any future single-select-from-a-small-
set UI (Phase 2 destination/hotel style pickers are a plausible future
consumer).

**LAND-01 through LAND-03 are now done — the LAND module is closed.**
The real Landing page (`app/[locale]/(marketing)/page.tsx`) replaces
the Bootstrap placeholder for the first time — Hero, How It Works,
Discover, AI Showcase, Features, FAQ, and a closing CTA, all real,
localized (EN/FA/DE) content grounded in the Design Bible, none of it
fabricated. If a future session works on `CHAT-01`: `AISearchBox`
already sends visitors to `/chat?prompt=<encoded text>` on submit —
read that query param and pre-fill the first message rather than
discarding it; `AIQuickAccess` (Shared) is explicitly available for
`CHAT-01` to claim now that a real chat surface will exist for it to
open (see the finding above for why LAND-01 deliberately didn't build
it). Two small, genuinely reusable pieces of test infrastructure came
out of this session regardless of what a future task builds:
`tests/layout-test-utils.tsx`'s `renderWithProviders` now correctly
supports any component using the `FadeIn`/`SlideIn`/`ScaleIn`/
`ScrollReveal` motion wrappers, and `tests/mocks/next-intl-server.ts`
makes `getTranslations`-based async Server Components testable for the
first time in this codebase (not yet applied to `AuthLayout`, which
still has no test file — a reasonable pickup for whoever next touches
it, not done here as it's outside LAND's own file boundary).

Recommended next task (as of the LAND session): **`CHAT-01`** (streaming
AI Chat layout, guest mode) — High priority per
`MASTER_IMPLEMENTATION_ROADMAP.md`'s Phase 1 module list, no unmet
dependencies, and now the natural next step since both of Landing's
entry points (`AISearchBox`, `GuestEntryCta`) already route to `/chat`
and are waiting for a real destination. `MEM-02` and `DASH-01` remain
valid alternatives (`DASH-01` still blocked on `CHAT-03` specifically,
not `CHAT-01`) — this is a product-sequencing recommendation to
confirm, not a dependency-graph necessity or a decision already made on
the project owner's behalf.

**CHAT-01 through CHAT-02 are now done — the CHAT module's frontend
half is closed** (`CHAT-03`/`04`, the backend Conversation Manager + SSE
endpoint, remain open and untouched). `/chat`
(`app/[locale]/(app)/chat/page.tsx`) is the first real page inside
`(app)`/ApplicationLayout beyond `/profile`, and the first to read
`?prompt=` — `AISearchBox`'s handoff now has a real destination,
pre-filling (never auto-sending) the composer. If a future session
works on `CHAT-03`/`CHAT-04`: the entire send/streaming pipeline
already exists and is fully wired end-to-end against
`lib/chat/simulate-assistant-reply.ts`, a single, clearly-documented,
isolated stub — swap that one module's internals for a real
SSE-consuming client and every component in `components/chat/` should
work unchanged, since they only ever see `ChatMessage`/`Conversation`
(`lib/chat/types.ts`) and callback props, never the transport directly.
`AIQuickAccess` and `ConnectionStatus`/`RetryCard` (Shared) remain
unclaimed — `CHAT-01` had a clear opportunity to take either and
didn't, see this session's verification note in `.ai/TASK_BOARD.md` for
why. `MEM-01` (guest session memory) is now unblocked (declared
dependency `CHAT-02` ✅) — currently, refreshing `/chat` loses the
conversation entirely, which is correct, current, in-scope behavior for
CHAT-01/02, not a bug, and is exactly the gap `MEM-01` closes.

Recommended next task (current): three tasks are independently
available with no unmet dependencies and no single one is a hard
bottleneck — **`ATLAS-P1-MEM-01`** (guest session memory; the smallest,
fastest win, client-side only, directly fixes the refresh-loses-your-
conversation gap above), **`ATLAS-P1-CHAT-03`** (Conversation Manager
backend; the bigger unlock — it's what `CHAT-04` and, jointly with
`AUTH-07` ✅, `DASH-01` are both still waiting on), and
**`ATLAS-P1-MEM-02`** (authenticated preference storage — has been
available since the PROF session and hasn't been picked up yet, still
valid). As in every prior instance of this note, this names the
unblocked set rather than asserting a single choice on the project
owner's behalf.

**CHAT-03 through CHAT-04 are now done — the entire CHAT module is
closed.** `/chat` calls a real, single-model Conversation Manager over
a genuine SSE stream (`POST /api/v1/chat/completions/stream`);
`lib/chat/simulate-assistant-reply.ts` is deleted, not left in place.
Three real bugs were found and fixed this session (an `ai/` ↔
`backend/` import-order bug, a FastAPI dependency-resolution-vs-body-
validation ordering bug, and a frontend race between `stopGenerating()`
and a late network callback) — see Verification Results above for all
three; none were hypothetical, each was reproduced live or by a test
before being fixed. The backend cannot be live-verified against the
real OpenAI API from this sandbox (`api.openai.com` is blocked by the
egress proxy — confirmed, not assumed) — that remains a project-owner
action with a real key in a reachable environment; everything else
(request handling, validation, rate limiting, error mapping, the SSE
wire format on both ends) is genuinely tested, not asserted. If a
future session works on `MEM-01`: `lib/chat/use-chat-session.ts` is now
the file to wrap or extend for persistence — its own doc comment states
plainly, again, that it holds no persistence today. If a future session
works on `DASH-01`: it is now fully unblocked (`CHAT-03` ✅, `AUTH-07`
✅ already were) — no further backend prerequisite remains.

Recommended next task (current): **`ATLAS-P1-MEM-01`** (guest session
memory) — smallest remaining Phase 1 item (Complexity S), directly
closes the refresh-loses-your-conversation gap this session's own
Verification Results describe, and is the most natural continuation of
this session's own `lib/chat/` work. `ATLAS-P1-MEM-02` and
`ATLAS-P1-DASH-01` are both independently available (no unmet
dependencies) and can run in parallel with `MEM-01` or each other per
`CONVERSATION_STRATEGY.md` §8 — this names the unblocked set, not a
single choice already made on the project owner's behalf. Completing
any two of these three closes out every module `MASTER_IMPLEMENTATION_
ROADMAP.md`'s Phase 1 lists except whichever one is left.

---

**LOCK STATUS:** LIVING — baseline approved 2026-07-22, updated
2026-07-24, 2026-07-29 (×2), 2026-08-13 (Bootstrap Reconciliation),
2026-08-15 (DESIGNSYS-03 complete), 2026-08-16 (DESIGNSYS-04 complete;
Governance Reconciliation, same date, second session), 2026-08-19
(AUTH-01 Audit & Bug Fix — Localization/RTL), 2026-08-22 (AUTH-02
through AUTH-05 complete — first real `backend/app/` code), 2026-08-24
(AUTH-06 through AUTH-08 complete — the AUTH module is closed),
2026-08-25 (PROF-01 through PROF-03 complete — the PROF module is
closed), 2026-08-29 (LAND-01 through LAND-03 complete — the LAND
module is closed; the real Landing page ships for the first time),
2026-09-01 (CHAT-01 through CHAT-02 complete — the CHAT module's
frontend half is closed; `/chat` is a real, guest-accessible page for
the first time), 2026-09-05 (CHAT-03 through CHAT-04 complete — the
CHAT module is fully closed; `/chat` is backed by a real, streaming
Conversation Manager for the first time).
Future changes only via `MASTER_RULES.md` §21.
