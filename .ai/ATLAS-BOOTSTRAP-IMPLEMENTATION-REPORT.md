# ATLAS — Bootstrap Reconciliation Implementation Report

> **⚠ ARCHIVAL / NON-CANONICAL (marked 2026-08-16, Governance Reconciliation, Amendment 009).** This is a historical record of the 2026-08-13 session, kept for provenance. It is **not** part of the mandatory or conditional reading set in `MASTER_RULES.md` §2 and must not be treated as authoritative by any future session. Its durable, still-relevant facts have been folded into `.ai/INFRASTRUCTURE_BASELINE.md` (infrastructure), `.ai/PROJECT_STATE.md` (state), and `.ai/DESIGN_BIBLE_AMENDMENTS.md` (Amendments 004–006). Where this document and any of those three disagree, **the canonical document wins.**

**Date:** 2026-08-13
**Session type:** Complete repository-level Bootstrap/Foundation reconciliation
**Status:** COMPLETE (as a historical record — see archival note above for current authority)

---

## 1. What Was Audited

Three sources, in the priority order specified for this session:

1. **The current GitHub repository** (`Calmboym/atlas-travel-ai`, `main`, cloned fresh) — treated as the primary source of truth throughout.
2. **The uploaded `atlas-phase0-reconstruction.zip`** — Phase-0-only, used only as reference/recovery material (e.g. to source `next-intl`'s original inclusion).
3. **Current project documentation** — the Design Bible, `.ai/`-tier governance files (at the time, sitting in `docs/`), and the uploaded `PROJECT_STATE.md`/`TASK_BOARD.md`/`WORK_BREAKDOWN_STRUCTURE.md`.

Every finding below was confirmed by actually running the relevant tool (`pnpm`, `tsc`, `eslint`, `vitest`, `next build`, a real HTTP request to a running server, `uv sync`, `mypy`) — not by reading code and inferring. Several genuine bugs were found this way that a read-only review would have missed or an unverified summary had already miscounted (see §3).

---

## 2. What Was Found: Repository State vs. Documentation Claims

| Claim (uploaded `PROJECT_STATE.md`, `TASK_BOARD.md` as committed in the repo, or Claude's own prior-session memory) | Actual state, verified |
|---|---|
| Chat-session memory: "DESIGNSYS-03 (Navbar, Sidebar with `useSyncExternalStore`, MobileBottomNav, footers, switchers, layouts) is complete" | **False.** No such files exist anywhere in the repository. The real `useSyncExternalStore` usage belongs to `ThemeProvider` (DESIGNSYS-01) — likely source of the false memory. Corrected in Claude's memory during the audit phase of this session. |
| Uploaded `PROJECT_STATE.md`: relevant files live at `apps/web/components/ui/*`, `apps/web/lib/...` | **False.** No `apps/` path exists anywhere in the repository. Real paths are flat under `frontend/`. Corrected in the rewritten `PROJECT_STATE.md`. |
| Uploaded `PROJECT_STATE.md`/`TASK_BOARD.md`: "98/98 tests... typecheck, lint, and production build all pass" | **False at the time this reconciliation began.** Verified by actually running the suite: the build failed outright (missing `next-intl`), lint failed (misconfigured accessibility plugin), and every one of the 11 test files failed at import time (missing Vitest config) — zero of the 98 tests could execute. All six root causes are fixed below; the claim is genuinely true now, re-verified. |
| Committed `docs/TASK_BOARD.md` (now `.ai/TASK_BOARD.md`): `AUTH-01` listed as Todo; `DESIGNSYS-01`–`04` not listed at all | **Stale.** The committed board was never updated past the 2026-07-22 lock pass despite `AUTH-01`, `DESIGNSYS-01`, and `DESIGNSYS-02` being real, built, working code. Corrected. |
| `.ai/WORK_BREAKDOWN_STRUCTURE.md`: no `Module: DESIGNSYS` section | **Confirmed gap.** `DESIGNSYS-01`–`04` were proposed as a WBS addition (`DESIGNSYS_FOUNDATION_AUDIT_AND_WBS_PROPOSAL.md`) but never actually merged into the WBS document itself. Added. |
| Uploaded `PROJECT_STATE.md`: "no separately-hosted repository is accessible from this environment" | **Superseded.** A real, accessible GitHub repository exists and was used as this session's primary source. |
| `PROJECT_STATE.md` file itself | **Never committed anywhere in the repository**, despite being the single most-referenced document in the whole `.ai/` system. Every prior version only ever existed as a chat upload/paste. Committed for the first time by this session. |
| `.ai/` folder | **Did not exist.** `TASK_BOARD.md` and `WORK_BREAKDOWN_STRUCTURE.md` were sitting inside `docs/`, mixed with the Design Bible; the other `.ai/`-tier files (`MASTER_RULES.md`, `INDEX.md`, `SESSION_PROMPT.md`, `COMPONENT_OWNERSHIP_MATRIX.md`, `DESIGN_BIBLE_AMENDMENTS.md`, `MISSING_INFORMATION.md`, `CONVERSATION_STRATEGY.md`, `BOOTSTRAP_SPEC.md`, `PROJECT_STRUCTURE.md`) were there too. Created `.ai/` and moved all eleven files there. |

None of the above is presented as blame — it's the factual record this report exists to provide.

---

## 3. Real Bugs Found and Fixed (all verified by actually running the tools)

### 3.1 `next-intl` missing from `frontend/package.json` (build-breaking)

Every i18n file (`i18n/routing.ts`, `i18n/request.ts`, `proxy.ts`, `app/[locale]/layout.tsx`, `app/[locale]/page.tsx`) imports from `next-intl`, but the package was entirely absent from `dependencies` — confirmed with `grep -n "next-intl" package.json` (zero matches) and a real `pnpm run build` failing with `Cannot find module 'next-intl'`. The Bootstrap zip's Phase-0 `package.json` had it (as `"latest"`); it must have been dropped when `package.json` was rewritten during `AUTH-01`/`DESIGNSYS-01`/`DESIGNSYS-02`.

**Fix:** restored `"next-intl": "^4.13.6"` — the real current registry version (not the zip's unpinned `"latest"`), confirmed via `npm view next-intl version` and its `peerDependencies` (`next ^16.0.0`, `react ^19.0.0` both satisfied).

### 3.2 Nested `<html>`/`<body>` tags silently breaking RTL (runtime bug)

`app/layout.tsx` (added during `DESIGNSYS-01` to carry `ThemeProvider`, font loading, and the no-flash theme script) and `app/[locale]/layout.tsx` (the original Phase-0 file, carrying `NextIntlClientProvider` and locale-aware `lang`/`dir`) **both** rendered a full document shell. Since every real route lives under `app/[locale]/...` (confirmed: no page exists outside it), Next.js unconditionally nested the second inside the first.

Confirmed by actually building, starting the production server, and curling `/en`: the served HTML contained two `<html>` elements and two `<body>` elements. The **outer, canonical** pair was permanently `<html lang="en">` with no `dir` attribute at all, regardless of locale — meaning `/fa` was silently not rendering as RTL at the level that actually matters (the outermost, browser-recognized `<html>` element).

**Fix:** merged `DESIGNSYS-01`'s theme/font additions into `app/[locale]/layout.tsx` (the correct, locale-aware place for them) and deleted the now-redundant `app/layout.tsx`. Re-verified with real HTTP requests: `/en` → `<html lang="en" dir="ltr">`, `/fa` → `<html lang="fa" dir="rtl">`, `/de` → `<html lang="de" dir="ltr">` — exactly one correct tag each.

### 3.3 ESLint silently missing accessibility linting

`eslint.config.mjs` imported the `eslint-config-next/typescript` subpath specifically. Inspecting the installed package directly (`dist/typescript.js` vs `dist/index.js`) confirmed: only the plain default export bundles `eslint-plugin-jsx-a11y` (alongside `typescript-eslint`, `eslint-plugin-react`, `eslint-plugin-react-hooks`); the `/typescript` subpath does not. This broke every `jsx-a11y` `eslint-disable` comment in the codebase — `pnpm run lint` failed with `Definition for rule 'jsx-a11y/...' was not found` — including a specifically-justified suppression in `components/ui/resizable-panel.tsx` for the WAI-ARIA Window Splitter pattern.

**Fix:** switched to the default `eslint-config-next` export (still avoids the original FlatCompat circular-JSON crash `BOOTSTRAP_SPEC.md` documented — that crash was specific to the legacy `.extends()` bridge, not to this export style). Once jsx-a11y actually loaded, the two previously-suppressed rules turned out **not** to fire on the installed version (6.10.2) at all — the disable directives were now flagged as unused. Removed them, keeping the ARIA-pattern rationale as a plain comment for future reference. Separately, restoring the plugin surfaced one genuine, previously-invisible warning (`@next/next/no-img-element` on the Avatar component's deliberate `<img>` usage) — added a proper justified suppression — and one in a test fixture, scoped off via a `files: ["tests/**"]` override rather than a blanket rule change.

### 3.4 `vitest.config.ts` did not exist

No Vitest/Vite config file existed anywhere in `frontend/`. Without it, Vitest had no `@/` path-alias resolution (TypeScript's `tsconfig.json` paths don't apply to Vite's own resolver), no `jsdom` environment, no React JSX transform, and never loaded the already-written `vitest.setup.ts`. Confirmed: `pnpm run test` failed immediately, all 11 test files erroring on `Cannot find package '@/...'` — zero of the claimed 98 tests could ever run.

**Fix:** created `vitest.config.ts` (alias resolution, `jsdom` environment, `setupFiles`, `@vitejs/plugin-react`).

### 3.5 Test cleanup between tests never registered

After fixing 3.4, tests ran but 34/98 failed — all with variants of "found multiple elements," e.g. `button.test.tsx`'s very first assertion failed because a **previous** test's rendered `<button>Save</button>` was still in the DOM. `@testing-library/react`'s automatic per-test cleanup registers by checking for a global `afterEach`; this project's Vitest config doesn't set `test.globals: true`, so `afterEach`/`describe`/`it` are never injected onto `globalThis`, and auto-cleanup silently never registered.

**Fix:** added explicit `afterEach(() => cleanup())` to `vitest.setup.ts` — the standard, documented fix (testing-library.com's own Vitest guide), not dependent on any implicit global-injection config. Re-ran: **98/98 tests passing, 11/11 files.**

### 3.6 Backend `uv sync` failed outright

`backend/app/` contains only `.gitkeep` (no application code yet — correctly matching the documented, deliberate Phase-0-only scope; writing real endpoint code would be business logic, explicitly out of scope for this pass). `uv sync` tried to build this project itself as an installable wheel via Hatchling and failed: `Unable to determine which files to ship inside the wheel` — Hatchling's default heuristics need a package directory matching the project name, which doesn't exist because there's no code yet.

**Fix:** added `[tool.uv] package = false` to `pyproject.toml` — the standard uv mechanism for "install dependencies into a venv, don't try to build this project as a package yet." No application code was invented. `Dockerfile.backend`'s `RUN uv sync --no-dev` step had the identical failure mode and is fixed by the same change.

---

## 4. Documentation Changes

- **Created `.ai/` folder**, moved 11 files out of `docs/`: `MASTER_RULES.md`, `TASK_BOARD.md`, `SESSION_PROMPT.md`, `INDEX.md`, `WORK_BREAKDOWN_STRUCTURE.md`, `COMPONENT_OWNERSHIP_MATRIX.md`, `DESIGN_BIBLE_AMENDMENTS.md`, `MISSING_INFORMATION.md`, `CONVERSATION_STRATEGY.md`, `BOOTSTRAP_SPEC.md`, `PROJECT_STRUCTURE.md`. `docs/` now holds only the Design Bible, core engineering docs (PRD/ARCHITECTURE/GUIDELINES/ROADMAP/DEBUG_LOG/MASTER_BUILD_PROMPT/WORKFLOW), and point-in-time audit/analysis reports.
- **Created `.ai/PROJECT_STATE.md`** for the first time — never previously committed.
- **Approved Design Bible Amendments 004 (Dark theme values) and 005 (Secondary/Teal → Accent)**, exactly as authorized, and added **Amendment 006** recording the governance-baseline approval (`MASTER_RULES.md` v1.2, `COMPONENT_OWNERSHIP_MATRIX.md`, `CONVERSATION_STRATEGY.md` §7, `SESSION_PROMPT.md` step 6). Removed "PROPOSED" framing from all of the above; `MASTER_RULES.md` bumped to v1.2 as its stated version.
- **Applied Amendment 004's actual values** to `frontend/app/globals.css`'s `[data-theme="dark"]` block, replacing the previous light-value placeholder. `color-accent` (dark) and `color-glass-highlight` (dark) were explicitly left unmapped, exactly as Amendment 004 itself scoped it — not silently resolved beyond what was approved.
- **Updated `.ai/INDEX.md`**: removed "PROPOSED" framing from the `DESIGNSYS` entry; corrected the `Related WBS` note to distinguish "defined" from "authorized to start."
- **Rewrote `README.md`**: previous version claimed Phase 0 was the entire delivered scope ("no business logic, no authentication implementation") — stale since `AUTH-01`/`DESIGNSYS-01`/`DESIGNSYS-02`. Now reflects actual current status and structure (including the new `.ai/` folder).
- **Added `Module: DESIGNSYS` to `.ai/WORK_BREAKDOWN_STRUCTURE.md`** — proposed 2026-07-29, never actually merged.
- **Rewrote `.ai/TASK_BOARD.md`**: moved `AUTH-01`, `DESIGNSYS-01`, `DESIGNSYS-02` from (incorrectly, in the committed version) Todo into Done; added `DESIGNSYS-03`/`04` to Todo (previously absent from the committed board entirely).
- **Fixed stale path references** in `DESIGN_BIBLE_AMENDMENTS.md` (`apps/web/app/globals.css` → `frontend/app/globals.css`).

---

## 5. What Was Preserved (not touched, not downgraded)

- `DESIGNSYS-01` and `DESIGNSYS-02`'s actual component code — all 27 Foundation primitives, all 11 test files' test content, the token/CSS architecture, `ThemeProvider`. Only infrastructure *around* them was fixed, never their logic.
- `AUTH-01`'s registration form, validation schema, and `AuthLayout`.
- The Bootstrap zip was used only as reference (confirming `next-intl`'s original presence); nothing from it was copied over newer code.
- `DESIGNSYS-03` and `DESIGNSYS-04` — **not implemented**. No layout shells, navigation components, Glass components, or motion wrappers were created. This was explicit, non-negotiable scope for this session.
- The Design Bible documents themselves (`docs/*`) — zero edits to any locked document's body; all corrections went through the amendment mechanism.

---

## 6. Dependency Changes

| Change | File | Reason |
|---|---|---|
| Added `next-intl@^4.13.6` | `frontend/package.json` | Missing entirely; build-breaking (§3.1) |
| Removed `@eslint/eslintrc@^3.3.6` | `frontend/package.json` | Confirmed unused — zero references anywhere in source; `eslint.config.mjs` uses the modern flat-config export, not the FlatCompat bridge that needed this package |
| Added `[tool.uv] package = false` | `backend/pyproject.toml` | Fixed `uv sync` failure (§3.6); no dependency versions changed |

No dependency was downgraded. No package manifest was blindly replaced — every change is a targeted addition, removal, or configuration fix with a verified reason.

---

## 7. Tests Performed (all actually executed, not asserted)

| Check | Command | Result |
|---|---|---|
| Frontend typecheck | `pnpm run typecheck` | ✅ clean |
| Frontend lint | `pnpm run lint` | ✅ 0 errors, 0 warnings |
| Frontend unit/component tests | `pnpm run test` | ✅ 98/98 passing, 11/11 files |
| Frontend production build | `pnpm run build` | ✅ succeeds |
| RTL/locale smoke test | real server + `curl` on `/en`, `/fa`, `/de` | ✅ exactly one correct `<html lang dir>` per locale |
| Backend dependency install | `uv sync` | ✅ clean |
| Backend static check | `uv run mypy app` | ✅ clean (no files yet — correctly reported, not an error) |
| Backend Docker build | — | **Not run** — no Docker daemon available in this sandboxed environment. The specific failure mode that would have broken it (`uv sync --no-dev` inside the Dockerfile) is fixed and verified outside Docker; the full containerized build remains unverified. |

---

## 8. Known Limitations / Unresolved Items

- **Docker build unverified** (no daemon available here) — see §7.
- **`color-accent` and `color-glass-highlight` have no approved dark-theme value** — Amendment 004 explicitly didn't cover them; kept at their light value, clearly commented, not silently resolved.
- **Overlay scrim color and Popover's visual contract** remain thin, undocumented inferences (unchanged from before this session) — flagged in code, not blocking.
- **No git commit was made** — this environment has read access to the repository (used for `git clone`) but no push credentials. All changes exist only in this session's working copy and the delivered ZIP; applying them to the real repository is a manual step for the project owner.
- **DESIGNSYS-03 and DESIGNSYS-04 remain fully unimplemented**, exactly as instructed. Nothing in this report should be read as authorization to begin either.

---

## 9. Documentation Consistency — Final Check

Cross-checked `TASK_BOARD.md`, `WORK_BREAKDOWN_STRUCTURE.md`, `PROJECT_STATE.md`, `DESIGN_BIBLE_AMENDMENTS.md`, `INDEX.md`, and this report against each other and against the actual repository state:

- Task IDs consistent across all three governance files.
- `DESIGNSYS-01`/`02` marked Done everywhere; `03`/`04` marked Todo, not started, everywhere.
- Amendment 004/005/006 status (APPROVED) consistent between `DESIGN_BIBLE_AMENDMENTS.md`, `MASTER_RULES.md`, `COMPONENT_OWNERSHIP_MATRIX.md`, `CONVERSATION_STRATEGY.md`, `SESSION_PROMPT.md`, and `INDEX.md`.
- No file claims work exists that doesn't; no file omits work that does (verified against the actual `frontend/`/`backend/` trees in the delivered ZIP, not against memory or prior claims).

---

**END OF REPORT**
