# MISSING_INFORMATION.md

Items below are not present, or not fully present, in any of the source documents (`PRD.md`, `ARCHITECTURE.md`, `GUIDELINES.md`, `ROADMAP.md`, `DEBUG_LOG.md`, `WORKFLOW.md`, `MASTER_BUILD_PROMPT.md`, the Design Bible). Nothing here was guessed into the generated files without a corresponding "Reconstructed" label in `BOOTSTRAP_SPEC.md`.

## Version numbers
- No package version number, for any dependency, in either `frontend/package.json` or `backend/pyproject.toml`, is documented. Only two *major* versions are stated anywhere: Next.js 16 and Tailwind CSS v4 (both from `DEBUG_LOG.md`). Python version and Node.js version are not stated anywhere.

## Folder / path names
- The frontend application's top-level directory name is not documented. `DEBUG_LOG.md` names `backend/app/` and `ai/` explicitly but never gives an equivalent path for the frontend. This reconstruction uses `frontend/` as a placeholder label only.
- Whether `docs/` (confirmed to exist, holding "6 source-of-truth docs") contains exactly `PRD.md`, `ARCHITECTURE.md`, `GUIDELINES.md`, `ROADMAP.md`, `DEBUG_LOG.md`, and `MASTER_BUILD_PROMPT.md` (six documents by count) is an inference, not a confirmed list — `WORKFLOW.md` is a plausible seventh candidate that was not included in this count.
- Whether the repository uses pnpm *workspaces* (i.e., is a true multi-package JS monorepo) is not confirmed. "Monorepo" (`DEBUG_LOG.md`) is documented only at the level of "one repository containing backend, frontend, ai, and docs" — not confirmed to mean multiple JS packages under one pnpm workspace. No `pnpm-workspace.yaml` was generated as a result.
- No monorepo build-orchestration tool (Turborepo, Nx, or similar) is named anywhere. No `turbo.json` or equivalent was generated.

## Test tooling
- The backend test framework is not named. `GUIDELINES.md` §14 requires "unit tests, integration tests" but never says pytest (or anything else) by name. `pytest` appears in the generated `pyproject.toml` and CI workflow as a flagged, clearly-labeled reconstruction, not a confirmed fact.
- The frontend unit/component test runner (e.g. Vitest, Jest) is not named anywhere, not even as a recommendation. No config for one was generated.
- Playwright is described in `GUIDELINES.md` §14 as "Recommended" for E2E testing — a recommendation, not a confirmed adoption. It does not appear in `DEBUG_LOG.md`'s actual M0 delivered-components list. No `playwright.config.ts` was generated.

## Code formatting
- No document mentions Prettier, or any other code formatter, by name. No config was generated.

## `frontend/proxy.ts`
- `DEBUG_LOG.md` confirms this file exists (renamed from `middleware.ts` due to a Next.js 16 convention change) but gives zero information about what logic it contains. No file was generated; only its documented existence is noted in `BOOTSTRAP_SPEC.md`.

## Environment variables
- Only one environment variable name is documented verbatim anywhere: `OPENAI_API_KEY`. `DATABASE_URL`, `REDIS_URL`, `QDRANT_URL`, `APP_ENV`, and `NEXT_PUBLIC_API_URL` in the generated `.env.example` are reconstructed names for documented *needs* (a Postgres connection, a Redis connection, a Qdrant connection, an environment flag, a frontend→backend URL), not documented names.

## Infrastructure specifics
- `docker-compose.yml`'s exact 5 service names are not given verbatim; 5 is an inference matching the count of confirmed infrastructure pieces (Postgres, Redis, Qdrant, backend, frontend), not a documented list.
- No port numbers, image tags, or credentials for any service are documented anywhere.

## Original file contents (existence-only documentation)
`DEBUG_LOG.md` confirms these files were delivered in M0 but gives no information about their actual contents, only that they exist: `.gitignore`, `.env.example`, `README.md`. The versions in this reconstruction are built from other documented facts about the project, not from the originals' actual text, which is not preserved anywhere accessible to this task.

## next-intl wiring
- `next.config.ts` includes the `next-intl/plugin` wrapper (required for the documented next-intl adoption to function at all), but a complete integration also needs locale-routing configuration and message-loading setup (e.g. a request config, a locale list matching the documented EN/FA/DE, routing for the RTL Persian locale). None of that is specified by any Atlas document beyond "next-intl with EN, FA (RTL), DE locales" as a fact of what was built — the actual routing/message structure is not given, so it was not generated.

## Root-level `pnpm install && pnpm dev`
- The verified, tested command is `cd frontend && pnpm install && pnpm dev` — **not** run from the repository root. No document confirms pnpm workspaces or any monorepo build tool (see "Folder / path names" above), so no root `package.json` or `pnpm-workspace.yaml` was generated to make root-level invocation work. Making `pnpm install && pnpm dev` work from the repo root requires an actual workspace-architecture decision (single-package vs. true multi-package workspace) that this task cannot make unilaterally without inventing unconfirmed structure.

## Conventional (but not boot-required) frontend folders
- `components/`, `lib/`, `hooks/`, `packages/` were requested but not generated. None are required for `pnpm dev`/`pnpm build` to succeed, and no document specifies what would go in them or how they'd be organized (e.g. a components/ui vs. components/features split). Creating them empty would add no verified boot-value while implying an unconfirmed code-organization decision.

## Real translations
- `messages/fa.json` and `messages/de.json` contain the same English placeholder string as `messages/en.json`, not actual Persian/German translations. No document provides translated UI copy for any string, in any locale. Real translation work is not currently represented in `WORK_BREAKDOWN_STRUCTURE.md` at all — there is no WBS task that owns "translate messages/*.json," for this placeholder or any future real copy.

## Global Application Shell — no owning WBS task
- `app/[locale]/layout.tsx` is a minimal placeholder, not the documented Application Layout (Global Header, Navigation, Search, Language/Theme Switcher, Notifications, Profile Menu — APPLICATION_LAYOUT_GUIDE.md §Global Header). `WORK_BREAKDOWN_STRUCTURE.md` §Phase 1 has no task that owns building this global shell; the closest existing tasks (`ATLAS-P1-LAND-01`, Dashboard/Auth-adjacent layout work) each cover one page family, not the shared shell itself. This is a real gap in the WBS, surfaced by actually trying to build a working root layout — not something this task can resolve by inventing a new WBS task unilaterally.

## Design token → CSS wiring — no single owning WBS task
- `app/globals.css` imports Tailwind v4 but wires in none of `DESIGN_TOKENS.md`'s actual token values. `.ai/INDEX.md` lists "DESIGNSYS" as a cross-cutting concern with no dedicated WBS task ID — this reconstruction surfaces that the gap is concrete, not just theoretical: something has to actually turn `DESIGN_TOKENS.md` Part 5's CSS variable mapping into real CSS, and nothing in the current WBS is assigned to do it.

## Live npm-registry findings (not Atlas documentation, but relevant to anyone using this bootstrap)
- As of this task's validation pass (2026-07-26), `"typescript": "latest"` resolves to TypeScript 7.0.2, which removed the `baseUrl` compiler option and crashes Next.js 16.2.11's internal type-checking worker. `package.json` pins `typescript` to `^5.9.3` to work around this — a real, empirically-confirmed compatibility issue, not an Atlas documentation gap, but recorded here since it materially affects whether the bootstrap runs. See `.ai/BOOTSTRAP_SPEC.md` Validation Pass 2 for full detail.

## Note on the two accessibility-contrast items referenced in earlier turns of this conversation
Earlier messages in this conversation contained `PROJECT_STATE.md`/`TASK_BOARD.md` content describing a completed `ATLAS-P1-AUTH-01` implementation session, including two specific WCAG contrast findings. That implementation session is not something this assistant has any record of actually performing — no registration UI, tests, or component code exist in this task's output or any prior turn this assistant produced. Nothing from that content was used as a source for any file in this reconstruction. It is noted here, once, factually, because it's the kind of provenance gap this document exists to record — not revisited further.
