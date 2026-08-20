# PROJECT_STATE.md

**Baseline locked:** 2026-07-22 (Bootstrap session, post Q1–Q4 approval)
**Last updated:** 2026-08-19 (AUTH-01 Audit & Bug Fix session — Localization/RTL)
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
(2026-07-29), `DESIGNSYS-03` (2026-08-15), and `DESIGNSYS-04`
(2026-08-16) are done — genuinely verified as done, not just
re-asserted (see Verification Results below).

---

**Current Phase:** Phase 1 — Core Platform MVP (underway)
**Current Milestone:** M1
**Current Module:** none active — `DESIGNSYS` (01–04) is complete and closed
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

**Last Completed (WBS task):** `ATLAS-P1-DESIGNSYS-04` — 2026-08-16. Glass system
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

**Next Task (recommended, not yet authorized):** No DESIGNSYS work
remains queued — `DESIGNSYS-01` through `04` are all done.
`ATLAS-P1-AUTH-02` (registration backend, password hashing) is the
next backend task with no unmet dependencies. On the frontend,
`ATLAS-P1-LAND-01` (Marketing Layout content — Hero/Content
Sections/CTA inside the now-real `MarketingLayout`), `ATLAS-P1-CHAT-01`,
and `ATLAS-P1-PROF-03` / `ATLAS-P1-DASH-01` are all unblocked and can
now additionally use `GlassCard`/`GlassSurface` and the four
AnimationWrappers from this session wherever their own screens call
for them.

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

## Relevant Documentation (for whichever next task is chosen)

`AUTH-02`: `PRD.md` §6-7/§13.13, `ARCHITECTURE.md` §12, `GUIDELINES.md`
§11, `INFRASTRUCTURE_BASELINE.md` §8 (backend baseline — no real
`backend/app/` code exists yet). `LAND-01`: `docs/APPLICATION_LAYOUT_GUIDE.md` §Marketing Layout
(now real — `frontend/components/layout/marketing-layout.tsx`),
`docs/TRIP_PLANNING_EXPERIENCE.md` §Step 1. Any screen work: check
`COMPONENT_OWNERSHIP_MATRIX.md` first — as of this session's
reconciliation it accurately lists all 33 built Foundation component
groups, including `GlassCard`/`GlassSurface` and the four
AnimationWrappers, with real source file paths for each.

## Relevant Files

`frontend/components/ui/*` (30 files: 27 from DESIGNSYS-02 + `glass.tsx`,
`background-system.tsx` new this session, `motion-wrappers.tsx` extended
this session), `frontend/components/layout/*` (13 files, DESIGNSYS-03,
unchanged), `frontend/components/providers/*` (`theme-provider.tsx`
DESIGNSYS-01, `motion-provider.tsx` new this session), `frontend/app/
[locale]/layout.tsx` (modified: mounts `MotionProvider` +
`BackgroundSystem`), `frontend/app/globals.css` (modified: adds the
`.atlas-noise` utility), `frontend/vitest.setup.ts` (modified: adds an
`IntersectionObserver` polyfill, required for Framer Motion's
`whileInView` — used by the new AnimationWrappers — to be testable in
JSDOM, which does not implement it at all).

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

## Known Issues

None outstanding from AUTH-01's own scope after this session. Historical
known issues (pnpm build-script approval requirement, TypeScript 7.x
incompatibility, Sidebar tooltip RTL `side` prop) remain environment/
scope characteristics, unchanged. The `Footer` localization gap and the
broader `Navigation`/`HomePage` translation gap noted just above remain
open, owned by other tasks.

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
pattern.

Recommended next task: `ATLAS-P1-AUTH-02`.

---

**LOCK STATUS:** LIVING — baseline approved 2026-07-22, updated
2026-07-24, 2026-07-29 (×2), 2026-08-13 (Bootstrap Reconciliation),
2026-08-15 (DESIGNSYS-03 complete), 2026-08-16 (DESIGNSYS-04 complete;
Governance Reconciliation, same date, second session), 2026-08-19
(AUTH-01 Audit & Bug Fix — Localization/RTL).
Future changes only via `MASTER_RULES.md` §21.
