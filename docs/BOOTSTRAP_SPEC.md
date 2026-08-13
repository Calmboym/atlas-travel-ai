# BOOTSTRAP_SPEC.md

Source documents used: `PRD.md`, `ARCHITECTURE.md`, `GUIDELINES.md`, `ROADMAP.md`, `DEBUG_LOG.md`, `WORKFLOW.md`, `MASTER_BUILD_PROMPT.md`, `DESIGN_TOKENS.md` (§40 Approved Libraries), `GUIDELINES.md` §7 (AI folder structure). `DEBUG_LOG.md`'s M0 record is the primary source, since it is the actual completion record for Phase 0, not just the target spec.

Confidence scale used throughout: **Documented** (stated explicitly) · **Reconstructed — framework-necessary** (not independently decided in Atlas docs, but mechanically required by a documented technology choice) · **Reconstructed — inferred** (a reasonable inference from related documented facts, not stated directly).

---

### File: `docker-compose.yml`
**Reason:** DEBUG_LOG.md confirms this file was delivered in M0.
**Documentation references:** DEBUG_LOG.md — "Docker: docker-compose.yml (5 services, healthchecks, volumes)"; ARCHITECTURE.md §9-10 (Postgres, Redis, Qdrant).
**Confidence:** File count/existence — Documented. Service count (5) — Reconstructed, inferred (matches the 5 confirmed infra components: postgres, redis, qdrant, backend, frontend). Healthchecks/volumes presence — Documented. Exact image tags, ports, credentials — Reconstructed, inferred (not given anywhere).
**Missing information:** exact 5 service names, image tags, port numbers, credential values.

### File: `backend/Dockerfile.backend`
**Reason:** DEBUG_LOG.md confirms this file was delivered in M0.
**Documentation references:** DEBUG_LOG.md — "Dockerfile.backend (uv-based, multi-stage)".
**Confidence:** uv package manager, multi-stage build — Documented. Base image tag, Python version, stage structure, entrypoint module path — Reconstructed, inferred.
**Missing information:** Python version; exact backend entrypoint filename/module path (assumed `app.main:app`, not confirmed).

### File: `frontend/Dockerfile.frontend`
**Reason:** DEBUG_LOG.md confirms this file was delivered in M0.
**Documentation references:** DEBUG_LOG.md — "Dockerfile.frontend (pnpm, standalone output, multi-stage)"; DEBUG_LOG.md Known Issues — "pnpm 11 build scripts blocked on Windows" (confirms pnpm major version 11) and "Build succeeds via `next build` directly" (confirms the build command).
**Confidence:** pnpm (v11), standalone output, multi-stage, `next build` command — Documented. Base image tag, Node.js version, exact stage layout — Reconstructed, framework-necessary (standalone output's runtime file layout follows Next.js's own documented mechanism, not an Atlas decision).
**Missing information:** Node.js version.

### File: `backend/pyproject.toml`
**Reason:** confirmed package manager is uv (DEBUG_LOG.md), which conventionally uses pyproject.toml; file itself not independently named.
**Documentation references:** DEBUG_LOG.md M0 record (fastapi, sqlalchemy async, alembic, redis, qdrant, structlog, pydantic-settings all named) and Known Issues (mypy strict + --ignore-missing-imports).
**Confidence:** Dependency *choices* (fastapi, sqlalchemy, alembic, redis, qdrant-client, structlog, pydantic-settings) — Documented. mypy config — Documented. asyncpg, uvicorn, openai, pytest, build-system — Reconstructed, framework-necessary (required for the documented stack to actually run/build/test, but not named verbatim).
**Missing information:** all package version numbers; whether pytest is actually the adopted test framework (GUIDELINES.md §14 requires backend unit/integration tests but does not name a framework).

### File: `frontend/package.json`
**Reason:** required by the documented pnpm/Next.js frontend.
**Documentation references:** ARCHITECTURE.md §4 (Next.js, TypeScript, Tailwind, shadcn/ui, TanStack Query, Zustand, React Hook Form, Zod, next-intl); DESIGN_TOKENS.md/DESIGN_SYSTEM.md §40 Approved Libraries (Radix UI, Framer Motion, Lucide, Class Variance Authority, clsx); DEBUG_LOG.md (Next.js 16, Tailwind v4).
**Confidence:** Library *choices* listed — Documented (each cited above). Specific npm package names for those choices (e.g. `@tanstack/react-query`, `@radix-ui/react-slot`, `lucide-react`) — Reconstructed, inferred (the standard npm package for a documented library, not itself stated verbatim). All version numbers — Reconstructed, inferred, using only the two facts that are documented (Next.js major version 16, Tailwind major version 4); every other version is `"latest"`, explicitly not a real pin.
**Missing information:** all real version pins; whether shadcn/ui components were actually scaffolded in M0 (shadcn/ui is not a runtime npm dependency — it is a CLI that copies component source into the repo, so no shadcn package appears here; no evidence of which components, if any, were generated); GSAP, Three.js, and Howler.js are documented as *approved* (DESIGN_SYSTEM.md §40) but scoped to landing-page/storytelling use, and DEBUG_LOG.md's M0 record only describes a minimal smoke health page, not landing-page work — so these three are deliberately omitted rather than included on the strength of "approved" alone; see MISSING_INFORMATION.md.

### File: `frontend/tsconfig.json`
**Reason:** required by the documented TypeScript + Next.js frontend.
**Documentation references:** GUIDELINES.md §4 — "Strict TypeScript mode enabled".
**Confidence:** `"strict": true` — Documented. Every other compiler option — Reconstructed, framework-necessary (the minimum Next.js itself requires to build; a general Next.js mechanic, not an Atlas decision).
**Missing information:** none beyond what's noted inline in the file's own `_provenance` key.

### File: `frontend/next.config.ts`
**Reason:** required by the documented Next.js + next-intl + standalone-output choices.
**Documentation references:** DEBUG_LOG.md — "standalone output"; ARCHITECTURE.md §4 / DEBUG_LOG.md — next-intl.
**Confidence:** `output: "standalone"` — Documented. next-intl plugin wrapper — Reconstructed, framework-necessary (a mechanic of the next-intl library, included because next-intl's adoption is documented).
**Missing information:** none beyond `output` and the next-intl wrapper — no other Atlas-specific Next.js config options are documented anywhere.

### File: `frontend/postcss.config.mjs`
**Reason:** required by the documented Tailwind v4 choice.
**Documentation references:** DEBUG_LOG.md — "Tailwind v4".
**Confidence:** Reconstructed, framework-necessary in full (Tailwind v4 requires this integration package to function at all; not an independent Atlas decision, but a direct consequence of the documented Tailwind v4 choice).
**Missing information:** none — this file has no meaningful alternative given the documented Tailwind version.

### File: `frontend/eslint.config.mjs`
**Reason:** a "frontend lint" CI step is confirmed to exist.
**Documentation references:** DEBUG_LOG.md — "CI/CD: GitHub Actions (backend lint+test, frontend lint+build, Docker build)".
**Confidence:** *That* a lint step exists — Documented. *That the tool is ESLint* and *that the Next.js preset is used* — Reconstructed, inferred (Next.js's own documented default; not independently named as "ESLint" anywhere in Atlas documentation).
**Missing information:** the linting tool's name; any Atlas-specific lint rules (none are documented).

### File: `.env.example`
**Reason:** DEBUG_LOG.md confirms this file was delivered in M0.
**Documentation references:** DEBUG_LOG.md M0 record (file existence); DEBUG_LOG.md Known Issues — `OPENAI_API_KEY` named verbatim; GUIDELINES.md §17 (Dev/Test/Prod environments, secrets never shared).
**Confidence:** File existence, and the `OPENAI_API_KEY` variable name — Documented. All other variable names (`DATABASE_URL`, `REDIS_URL`, `QDRANT_URL`, `APP_ENV`, `NEXT_PUBLIC_API_URL`) — Reconstructed, inferred (the underlying services/needs are documented; the exact variable names are not).
**Missing information:** every variable name except `OPENAI_API_KEY`; actual required vs. optional status of each.

### File: `.gitignore`
**Reason:** DEBUG_LOG.md confirms this file was delivered in M0.
**Documentation references:** DEBUG_LOG.md M0 record (file existence); stack facts as cited per entry inline in the file.
**Confidence:** File existence — Documented. All entries — Reconstructed, framework-necessary (standard ignore patterns for the documented Next.js/pnpm/Python/uv/Docker stack).
**Missing information:** the original file's actual exact contents (only its existence, not its content, is documented).

### File: `README.md`
**Reason:** DEBUG_LOG.md confirms this file was delivered in M0.
**Documentation references:** DEBUG_LOG.md M0 record (file existence); PRODUCT_VISION.md §1/§11, PRD.md (Product Description), ARCHITECTURE.md §4/§6/§9-13 (stack table), DEBUG_LOG.md (stack table, structure).
**Confidence:** File existence — Documented. Stack table content — Documented (each row cited). Project description — Documented (paraphrased, not the original file's actual wording, which is not preserved anywhere). Structure section, dev commands — Reconstructed, inferred/framework-necessary.
**Missing information:** the original file's actual wording/structure (only its existence and general subject matter are documented).

### File: `.github/workflows/ci.yml`
**Reason:** DEBUG_LOG.md confirms GitHub Actions CI with three job categories.
**Documentation references:** DEBUG_LOG.md — "CI/CD: GitHub Actions (backend lint+test, frontend lint+build, Docker build)"; Known Issues — mypy strict + `--ignore-missing-imports`, backend tests "continue-on-error" due to needing live Postgres/Redis/Qdrant, `next build` as the confirmed frontend build command.
**Confidence:** Platform (GitHub Actions), 3 job categories, mypy step + flags, continue-on-error on backend tests, `next build` command — Documented. Trigger conditions, exact step names, third-party action versions, backend test command/framework — Reconstructed, inferred.
**Missing information:** exact trigger branches/events; backend test framework/command.

### File: `frontend/i18n/routing.ts`
**Reason:** next-intl's App Router integration requires a routing definition before any locale-aware route can resolve — without it, nothing boots.
**Documentation references:** DEBUG_LOG.md — "i18n (next-intl) with EN, FA (RTL), DE locales" (the locale list).
**Confidence:** Locale list (en, fa, de) — Documented. The `defineRouting` API shape — Reconstructed, framework-necessary (next-intl's own required API). `defaultLocale: "en"` — Reconstructed, inferred (not stated anywhere; English used since it's the documentation's own working language, not a documented default).
**Stability:** expected to remain stable through Phase 1–3 (matches the approved Q4 language scope exactly). Will need one edit when Phase 4+ adds the remaining PRD-scoped languages — no WBS task currently owns that; see MISSING_INFORMATION.md.

### File: `frontend/i18n/request.ts`
**Reason:** next-intl requires a request-scoped config to resolve the active locale and load its messages per request.
**Documentation references:** same as `i18n/routing.ts` (locale list documented; wiring is next-intl's own API).
**Confidence:** Reconstructed, framework-necessary throughout — pure plumbing, no product content.
**Stability:** expected to remain stable; unrelated to any single WBS task.

### File: `frontend/proxy.ts`
**Reason:** next-intl requires request-level middleware to resolve `/` → `/{locale}`; without it every route 404s.
**Documentation references:** the **filename** is DOCUMENTED verbatim — DEBUG_LOG.md Architecture Decisions: "Frontend renamed middleware.ts → proxy.ts | Next.js 16 deprecated middleware convention." The locale-routing behavior inside it is Reconstructed, framework-necessary (next-intl's own required middleware).
**Confidence:** Filename — Documented. Contents — Reconstructed, framework-necessary, deliberately free of any business logic (no auth checks, no redirects beyond locale detection).
**Stability:** expected to remain stable as pure i18n plumbing. If `ATLAS-P1-AUTH-08` (route guards) is later implemented, that task composes additional logic here — not this bootstrap's job.
**Note on the previous reconstruction attempt:** an earlier pass of this task deliberately did NOT generate this file's contents, reasoning that "no logic is documented." Given the new explicit requirement that the bootstrap must actually boot, and given next-intl's routing behavior is a framework mechanic (not invented business logic), generating the minimal routing-only contents is now judged consistent with "smallest safe placeholder... strictly necessary to boot" — a narrower bar than "any logic at all."

### File: `frontend/app/[locale]/layout.tsx`
**Reason:** Next.js App Router requires a root layout for `pnpm dev`/`pnpm build` to serve any page at all.
**Documentation references:** RTL for `fa` — DEBUG_LOG.md ("FA (RTL)"). `NextIntlClientProvider` wiring — next-intl's own required App Router pattern (Reconstructed, framework-necessary).
**Confidence:** RTL-for-fa logic — Documented. Everything else (metadata, provider wiring, `generateStaticParams`) — Reconstructed, framework-necessary.
**Missing information:** the real Application Layout (Global Header, Navigation, Footer, Search, Language/Theme Switcher — APPLICATION_LAYOUT_GUIDE.md §Global Header) is NOT built here; building it would be implementing product UI. See MISSING_INFORMATION.md.
**Stability:** expected to be substantially rewritten by whichever task implements the global shell — no single WBS task currently owns that (gap recorded in MISSING_INFORMATION.md).

### File: `frontend/app/[locale]/page.tsx`
**Reason:** at least one page is required for a servable route to exist.
**Documentation references:** none, deliberately — this is NOT the documented Landing Page (Hero, AI search box, rotating example prompts — ONBOARDING_EXPERIENCE.md, TRIP_PLANNING_EXPERIENCE.md §Step 1, APPLICATION_LAYOUT_GUIDE.md §Marketing Layout).
**Confidence:** Reconstructed in full, deliberately minimal — reads one placeholder string purely to prove the i18n pipeline resolves end-to-end.
**Stability:** expected to be entirely replaced by `ATLAS-P1-LAND-01` and `ATLAS-P1-LAND-02` (WORK_BREAKDOWN_STRUCTURE.md §Module: LAND) — should not survive Phase 1.

### File: `frontend/app/globals.css`
**Reason:** Tailwind v4 requires a CSS entry point that imports it.
**Documentation references:** Tailwind v4 — DEBUG_LOG.md.
**Confidence:** Reconstructed, framework-necessary in full (Tailwind v4's CSS-first import mechanic).
**Missing information:** none of DESIGN_TOKENS.md's actual token values (palette, spacing, radius, Glass Design Language) are wired in — real design-system implementation, out of scope for boot-only scaffolding.
**Stability:** expected to be substantially extended by whichever task implements DESIGN_TOKENS.md as real CSS — the "DESIGNSYS" cross-cutting area in INDEX.md, which has no single dedicated WBS task ID (gap recorded in MISSING_INFORMATION.md).

### Files: `frontend/messages/en.json`, `frontend/messages/fa.json`, `frontend/messages/de.json`
**Reason:** next-intl requires a valid message file per configured locale to load at all.
**Documentation references:** the three locales — DEBUG_LOG.md.
**Confidence:** Locale existence — Documented. String content — Reconstructed, deliberately minimal and NOT a real translation: `fa.json` and `de.json` intentionally contain the identical English placeholder string as `en.json`, rather than an invented Persian/German translation, since producing one would mean asserting localized product content no document specifies.
**Missing information:** real translations for `fa`/`de`; no WBS task currently owns translation work at all (gap recorded in MISSING_INFORMATION.md).
**Stability:** every future task that adds user-facing copy in any module adds keys here; the mechanism (this file's existence and shape) stays stable even as content changes constantly.

### File: `frontend/public/.gitkeep`
**Reason:** `frontend/Dockerfile.frontend` (generated in the previous pass) already does `COPY --from=builder /app/public ./public` — an empty-but-real `public/` directory is required for that COPY to succeed, independent of whether Next.js itself requires the folder to exist.
**Documentation references:** none directly; this is internal consistency with this task's own already-generated Dockerfile, not a new Atlas-sourced fact.
**Confidence:** Reconstructed, framework-necessary (Docker COPY requires the source path to exist).


**Reason:** paths and structure explicitly named in source documentation.
**Documentation references:** DEBUG_LOG.md Architecture Decisions — "ai/ package independent from backend/app/" (confirms both `ai/` and `backend/app/` as paths); GUIDELINES.md §7 — "Recommended structure: ai/ ├── prompts/ ├── agents/ ├── schemas/ └── evaluations/"; DEBUG_LOG.md — "6 source-of-truth docs in docs/" (confirms a `docs/` folder).
**Confidence:** `backend/app/` and `ai/` as sibling top-level-ish paths — Documented. The four `ai/` subfolders — Documented (verbatim from GUIDELINES.md §7, presented there as "recommended," not mandated — treated here as adopted since DEBUG_LOG.md's M0 record describes exactly this AI-layer structure as delivered). `docs/` — Documented to exist; which exact 6 documents live in it is Reconstructed, inferred (see MISSING_INFORMATION.md). Folders are created empty (`.gitkeep` only) — no code or content is placed inside any of them, since actual file contents for `ai/config.py`, `backend/app/main.py`, etc. are not specified by documentation and would constitute invented implementation, out of scope for a scaffold reconstruction.

### UPDATE — `frontend/proxy.ts` status changed in this pass
An earlier pass of this task listed `frontend/proxy.ts` under "Not generated," reasoning that no logic was documented for it. Under the current, explicit "must actually boot" requirement, this was revisited: next-intl's locale-routing behavior is a framework mechanic (not invented business logic), and without it every route 404s. The file is now generated — see its full entry above, including the explicit note on why this differs from the earlier decision.

### Not generated: `pnpm-workspace.yaml`, `turbo.json`, root-level `package.json`
**Reason for omission — reaffirmed under the new "must actually boot" requirement:** "monorepo" is documented generically (DEBUG_LOG.md: "Repository structure (monorepo)"), but no document states pnpm *workspaces* (multiple JS packages) are in use, and no monorepo build tool (Turborepo, Nx, etc.) is named anywhere. Only one frontend JS package is described anywhere (`frontend/`). Inventing workspace/root tooling to make `pnpm install && pnpm dev` runnable *from the repository root* would assert a multi-package architecture that isn't confirmed. **Practical consequence, stated plainly so it isn't missed:** the verified, tested command is `cd frontend && pnpm install && pnpm dev` (or `pnpm build`) — not from the repo root. This is called out in `README.md` and `REPORT.md`. If the real team wants root-level `pnpm install && pnpm dev` to work, that requires a workspace-architecture decision this bootstrap cannot make unilaterally — recorded in `MISSING_INFORMATION.md`.

### Not generated: `components/`, `lib/`, `hooks/`, `packages/`
**Reason for omission:** none of these are required for `pnpm dev`/`pnpm build` to succeed — Next.js does not error if they don't exist, and (unlike `public/`, which this task's own `Dockerfile.frontend` references via `COPY`) nothing generated here references them. Their intended contents are not specified by any document. `packages/` specifically would assert the same unconfirmed multi-package monorepo architecture addressed above. Creating them empty would add zero boot-value while implying a specific code organization that isn't confirmed anywhere. Recorded in `MISSING_INFORMATION.md`.

### Not generated: `playwright.config.ts`, `vitest.config.ts` / `jest.config.ts`
**Reason for omission:** GUIDELINES.md §14 "recommends" Playwright for E2E but does not confirm it was adopted (it is absent from DEBUG_LOG.md's actual M0 delivered-components list). No frontend unit-test runner is named anywhere, even as a recommendation. Neither is required for `pnpm dev`/`pnpm build` to succeed. Recorded in `MISSING_INFORMATION.md`.

### Not generated: `prettier` config (any filename)
**Reason for omission:** no document mentions Prettier, or any code-formatting tool, by name. Recorded in `MISSING_INFORMATION.md`.

---

## Verification Table

| File | Documentation Source | Confidence |
|---|---|---|
| `docker-compose.yml` | DEBUG_LOG.md | Documented (existence, count, healthchecks, volumes) / Reconstructed (contents) |
| `backend/Dockerfile.backend` | DEBUG_LOG.md | Documented (uv, multi-stage) / Reconstructed (contents) |
| `frontend/Dockerfile.frontend` | DEBUG_LOG.md | Documented (pnpm v11, standalone, multi-stage, build cmd) / Reconstructed (contents) |
| `backend/pyproject.toml` | DEBUG_LOG.md | Documented (dependency choices, mypy config) / Reconstructed (versions, some deps) |
| `frontend/package.json` | ARCHITECTURE.md §4, DESIGN_SYSTEM.md §40, DEBUG_LOG.md | Documented (library choices, 2 major versions) / Reconstructed (package names, all versions) |
| `frontend/tsconfig.json` | GUIDELINES.md §4 | Documented (strict mode) / Reconstructed (rest) |
| `frontend/next.config.ts` | DEBUG_LOG.md, ARCHITECTURE.md §4 | Documented (standalone output, next-intl adoption) / Reconstructed (wiring) |
| `frontend/postcss.config.mjs` | DEBUG_LOG.md | Reconstructed, framework-necessary |
| `frontend/eslint.config.mjs` | DEBUG_LOG.md | Documented (lint step exists) / Reconstructed (tool identity) |
| `.env.example` | DEBUG_LOG.md | Documented (existence, `OPENAI_API_KEY`) / Reconstructed (other names) |
| `.gitignore` | DEBUG_LOG.md | Documented (existence) / Reconstructed (contents) |
| `README.md` | DEBUG_LOG.md, PRODUCT_VISION.md, PRD.md, ARCHITECTURE.md | Documented (existence, stack facts) / Reconstructed (wording) |
| `.github/workflows/ci.yml` | DEBUG_LOG.md | Documented (platform, 3 jobs, mypy flags, continue-on-error, build cmd) / Reconstructed (rest) |
| `frontend/i18n/routing.ts` | DEBUG_LOG.md | Documented (locale list) / Reconstructed (API shape, default locale) |
| `frontend/i18n/request.ts` | DEBUG_LOG.md | Reconstructed, framework-necessary (next-intl's own required API) |
| `frontend/proxy.ts` | DEBUG_LOG.md | Documented (filename) / Reconstructed (routing plumbing) — verified working via live HTTP test |
| `frontend/app/[locale]/layout.tsx` | DEBUG_LOG.md | Documented (RTL for fa) / Reconstructed (rest) — verified working |
| `frontend/app/[locale]/page.tsx` | none | Reconstructed, deliberately minimal — verified working |
| `frontend/app/globals.css` | DEBUG_LOG.md | Reconstructed, framework-necessary (Tailwind v4 CSS-first import) |
| `frontend/messages/{en,fa,de}.json` | DEBUG_LOG.md | Documented (locale existence) / Reconstructed (content, deliberately non-translated placeholder) |
| `frontend/public/.gitkeep` | none | Reconstructed — required for this task's own `Dockerfile.frontend` COPY step to succeed |
| Folder scaffolding (`backend/app/`, `ai/*/`, `docs/`) | DEBUG_LOG.md, GUIDELINES.md §7 | Documented |

Every file above traces to at least one cited document, or — for the small number with "none" in the Documentation Source column — is explicitly labeled boot-necessity plumbing with zero product content, per Validation Pass 2.

Every file above traces to at least one cited document. No file was generated from unstated assumptions about "typical" project setups beyond what is explicitly labeled "Reconstructed — framework-necessary" (i.e., a mechanical requirement of a *documented* technology choice, not a stylistic preference).

---

## Validation Pass (post-generation, cross-file consistency)

Run after initial generation, before this file was finalized. Checked: do scripts/imports in one generated file reference something that actually exists in another; are lockfile/ignore conventions internally consistent; do documented facts (pnpm 11, `next build` directly, mypy flags) actually appear correctly wired through.

**Found and fixed:**
1. `frontend/eslint.config.mjs` imports `FlatCompat` from `@eslint/eslintrc`, but that package was missing from `frontend/package.json`'s `devDependencies` — added.
2. `.gitignore` listed `uv.lock` as ignored, which contradicts standard lockfile-commit practice (lockfiles are tracked for reproducible builds — `pnpm-lock.yaml` was correctly left untracked-by-gitignore already; `uv.lock` was inconsistent with that same principle) — removed, with a note left in the file explaining the correction.

**Checked and confirmed consistent, no change needed:** `docker-compose.yml` build contexts correctly resolve to the actual `backend/Dockerfile.backend` and `frontend/Dockerfile.frontend` paths; `next.config.ts`'s `next-intl/plugin` import matches `next-intl` being present in `package.json`; `postcss.config.mjs`'s `@tailwindcss/postcss` matches the same package in `package.json`; CI workflow's `uv sync` / `mypy --ignore-missing-imports` / `next build` invocations match `pyproject.toml` and the documented Known Issues workaround exactly.

**Noted but intentionally not expanded:** a complete next-intl integration conventionally also needs locale-routing/message-loading config beyond the `next.config.ts` plugin wrapper generated here. Adding that would mean inventing locale file structure and routing logic not specified by any Atlas document — implementation, not scaffold — so it is left out and recorded in `MISSING_INFORMATION.md` rather than guessed.

---

## Validation Pass 2 — actual execution (`pnpm install`, `pnpm build`, `pnpm dev`)

Unlike Validation Pass 1 (static cross-file consistency review), this pass actually ran the generated bootstrap in a sandboxed environment with real network access to the npm registry — `pnpm install`, `next build` (both Turbopack and webpack), `tsc --noEmit`, `eslint .`, and `next dev` with real HTTP requests against all three documented locales. This section records exactly what that found, because every fix below was discovered empirically, not guessed.

**Real dependency versions confirmed to exist** (useful confirmation the documented major versions are real): `next` resolved to `16.2.11` and `tailwindcss` to `4.3.3` — both consistent with DEBUG_LOG.md's "Next.js 16" / "Tailwind v4."

**Bug 1 — `ERR_PNPM_IGNORED_BUILDS` reproduced live.** The very first `pnpm install` produced the exact warning DEBUG_LOG.md's Known Issues table already documents ("pnpm 11 build scripts blocked... approve-builds resolves it interactively"). Running `pnpm approve-builds --all` (the documented remedy's non-interactive form) resolved it. This is not a bug in the generated files — it's the documented known issue, reproduced, confirming the reconstruction's fidelity to the real M0 behavior.

**Bug 2 — `next build` crashed with a cryptic, unrelated-looking error: "The 'id' argument must be of type string. Received undefined."** This reproduced identically even in a bare-minimum Next.js app with no next-intl, no `[locale]` routing, and no custom `next.config.ts` — proving it wasn't caused by anything in this reconstruction's own code. Isolated via `next build --webpack` (which surfaced a real, separate, actionable error instead — see Bug 3) and via raw `tsc --noEmit`, which reported: `error TS5102: Option 'baseUrl' has been removed.` **Root cause:** `"typescript": "latest"` resolves to TypeScript **7.0.2**, which removed the `baseUrl` compiler option entirely (a real, very recent TypeScript breaking change, discovered live — not documented anywhere, and not something this task could have known without actually installing it). Next.js 16.2.11's own internal TypeScript-checking worker crashes ungracefully when it encounters this, instead of reporting the real diagnostic. **Fix:** `typescript` is pinned to `^5.9.3` in `package.json` — the one deliberate, fully-documented exception to this task's "no invented versions" rule, made only after confirming empirically that (a) `latest` breaks the build and (b) the code has zero real type errors under either TS version. See `package.json`'s own `_provenance` field.

**Bug 3 — path alias resolution.** Surfaced via the webpack build path while isolating Bug 2: `Module not found: Can't resolve '@/i18n/routing'`. `frontend/tsconfig.json` was missing `baseUrl` before Bug 2's fix; adding it initially seemed correct, but per Bug 2's finding that `baseUrl` is invalid under TypeScript 7, the actual fix was to remove `baseUrl` entirely and rely on `"paths": {"@/*": ["./*"]}` alone, which TypeScript 5.9 and Next.js 16.2.11 both resolve correctly without it. Confirmed working end-to-end after the fix (the `@/i18n/routing` import compiles and the full app renders).

**Bug 4 — `eslint .` crashed: "TypeError: Converting circular structure to JSON."** Reproduced under both ESLint 9 and ESLint 10 with the installed `eslint-config-next@16.2.11`, tracing into `@eslint/eslintrc`'s `FlatCompat` config-validator. **Root cause:** the original `eslint.config.mjs` used the legacy `FlatCompat().extends("next/core-web-vitals", "next/typescript")` bridge pattern (written for pre-flat-config shareable configs). `eslint-config-next@16.2.11` actually ships **native flat-config exports** (`eslint-config-next/typescript`, `eslint-config-next/core-web-vitals`) that don't need this bridge at all. **Fix:** `eslint.config.mjs` rewritten to `import nextConfig from "eslint-config-next/typescript"` and spread it directly — the modern, correct pattern for this Next.js version. This also let `@eslint/eslintrc` be removed from `package.json` entirely (it's genuinely unused now, confirmed by `pnpm run lint` passing with `"eslint": "latest"`, i.e. ESLint 10, once the bridge was removed — no ESLint version pin was needed after all, only the config pattern itself was wrong).

**Bug 5 (minor, no functional impact) — the `_provenance` documentation key in `messages/en.json` was leaking into the client-side JS bundle** (visible in the server-rendered HTML payload during the dev-server check), since next-intl passes the entire messages object to the client. Fixed by removing `_provenance` from the message JSON files; that documentation now lives only in this file.

**Final, complete verification (all green):**
```
cd frontend
pnpm install                  # resolves cleanly, typescript pins to 5.9.3
pnpm approve-builds --all     # documented remedy for the documented known issue
pnpm run build                # ✓ Compiled, ✓ TypeScript, ✓ 5/5 static pages, Proxy (Middleware) recognized
pnpm run typecheck             # exits 0
pnpm run lint                  # exits 0
pnpm dev                       # ✓ Ready; GET / → 307 redirect to /en (next-intl locale detection)
                                # GET /en  → <html lang="en" dir="ltr">  ...renders placeholder title
                                # GET /fa  → <html lang="fa" dir="rtl">  (documented RTL requirement confirmed)
                                # GET /de  → <html lang="de" dir="ltr">
```

No error in the final state is masked, suppressed, or worked around with `ignoreBuildErrors`-style escape hatches — every fix above corrects the actual root cause.
