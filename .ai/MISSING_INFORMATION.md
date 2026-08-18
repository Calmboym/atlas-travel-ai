# MISSING_INFORMATION.md

> **STATUS NOTE (2026-08-16, Governance Reconciliation):** this document originates from the original 2026-07-22 Bootstrap reconstruction, before `AUTH-01` or any `DESIGNSYS` work existed. Several items below have since been resolved by real implementation and are marked **RESOLVED** in place, with a pointer to what resolved them — not deleted, per `MASTER_RULES.md`'s "reconcile, don't erase" convention for historical documents. Everything not marked RESOLVED is still an open gap as of this reconciliation.

Items below are not present, or not fully present, in any of the source documents (`PRD.md`, `ARCHITECTURE.md`, `GUIDELINES.md`, `ROADMAP.md`, `DEBUG_LOG.md`, `WORKFLOW.md`, `MASTER_BUILD_PROMPT.md`, the Design Bible). Nothing here was guessed into the generated files without a corresponding "Reconstructed" label in `BOOTSTRAP_SPEC.md`.

## Version numbers
- No package version number, for any dependency, in either `frontend/package.json` or `backend/pyproject.toml`, is documented. Only two *major* versions are stated anywhere: Next.js 16 and Tailwind CSS v4 (both from `DEBUG_LOG.md`). Python version and Node.js version are not stated anywhere.

## Folder / path names
- The frontend application's top-level directory name is not documented. `DEBUG_LOG.md` names `backend/app/` and `ai/` explicitly but never gives an equivalent path for the frontend. This reconstruction uses `frontend/` as a placeholder label only.
- Whether `docs/` (confirmed to exist, holding "6 source-of-truth docs") contains exactly `PRD.md`, `ARCHITECTURE.md`, `GUIDELINES.md`, `ROADMAP.md`, `DEBUG_LOG.md`, and `MASTER_BUILD_PROMPT.md` (six documents by count) is an inference, not a confirmed list — `WORKFLOW.md` is a plausible seventh candidate that was not included in this count.
- Whether the repository uses pnpm *workspaces* (i.e., is a true multi-package JS monorepo) is not confirmed. "Monorepo" (`DEBUG_LOG.md`) is documented only at the level of "one repository containing backend, frontend, ai, and docs" — not confirmed to mean multiple JS packages under one pnpm workspace. No `pnpm-workspace.yaml` was generated as a result.
- No monorepo build-orchestration tool (Turborepo, Nx, or similar) is named anywhere. No `turbo.json` or equivalent was generated.

## Test tooling
- **RESOLVED (frontend) — 2026-08-13, Bootstrap Reconciliation.** Vitest is the confirmed, wired-in runner: `frontend/vitest.config.ts` + `vitest.setup.ts`, 155 tests across 24 files as of 2026-08-16 (`DESIGNSYS-04`). See `INFRASTRUCTURE_BASELINE.md` §5.
- **Still open (backend):** the backend test framework is not named. `GUIDELINES.md` §14 requires "unit tests, integration tests" but never says pytest (or anything else) by name. `pytest` appears in `backend/pyproject.toml` and the CI workflow as a flagged, clearly-labeled reconstruction, not a confirmed fact — unchanged, backend untouched since Phase 0.
- Playwright is described in `GUIDELINES.md` §14 as "Recommended" for E2E testing — a recommendation, not a confirmed adoption. No `playwright.config.ts` exists. Still open.

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
- **RESOLVED — 2026-08-13/15, Bootstrap Reconciliation + DESIGNSYS-03.** Full routing (`frontend/i18n/routing.ts`), request config (`i18n/request.ts`), and locale-aware navigation (`i18n/navigation.ts`) all exist and are wired into `proxy.ts` and `app/[locale]/layout.tsx`. See `INFRASTRUCTURE_BASELINE.md` §2.

## Root-level `pnpm install && pnpm dev`
- The verified, tested command is `cd frontend && pnpm install && pnpm dev` — **not** run from the repository root. No document confirms pnpm workspaces or any monorepo build tool (see "Folder / path names" above), so no root `package.json` or `pnpm-workspace.yaml` was generated to make root-level invocation work. Making `pnpm install && pnpm dev` work from the repo root requires an actual workspace-architecture decision (single-package vs. true multi-package workspace) that this task cannot make unilaterally without inventing unconfirmed structure.

## Conventional (but not boot-required) frontend folders
- `components/`, `lib/`, `hooks/`, `packages/` were requested but not generated. None are required for `pnpm dev`/`pnpm build` to succeed, and no document specifies what would go in them or how they'd be organized (e.g. a components/ui vs. components/features split). Creating them empty would add no verified boot-value while implying an unconfirmed code-organization decision.

## Real translations — still open (Q6, Governance Reconciliation, 2026-08-16: reconfirmed, no task created)
- `messages/fa.json` and `messages/de.json` still contain the same English placeholder strings as `messages/en.json`, not actual Persian/German translations — including the real `Navigation` labels DESIGNSYS-03 added (dashboard/trips/chat/saved/etc.), not just the original single placeholder string. No document provides translated UI copy for any string, in any locale. **Explicitly not creating a WBS task for this in this reconciliation, per instruction** — recorded here so it stays visible as a future implementation requirement whenever a session or the project owner decides to pick it up.

## Global Application Shell — RESOLVED 2026-08-15/16, DESIGNSYS-03/04
- `app/[locale]/layout.tsx` now mounts the real global shell: `ThemeProvider`, `MotionProvider`, `BackgroundSystem`, `TooltipProvider`, `SkipLink`, with `Navbar`/`Sidebar`/`Footer` delivered via the four layout types (`MarketingLayout`/`ApplicationLayout`/`FocusLayout`/`AuthLayout`) rather than the root layout directly. See `INFRASTRUCTURE_BASELINE.md` §§1, 3.

## Design token → CSS wiring — RESOLVED 2026-07-29, DESIGNSYS-01
- `app/globals.css` now wires the full `DESIGN_TOKENS.md` Part 5 CSS variable mapping, light and dark. See `INFRASTRUCTURE_BASELINE.md` §4. `color-accent`/`color-glass-highlight` (dark) remain a genuinely open, logged gap — see `PROJECT_STATE.md` findings — but the wiring mechanism itself is complete.

## Live npm-registry findings (not Atlas documentation, but relevant to anyone using this bootstrap)
- As of this task's validation pass (2026-07-26), `"typescript": "latest"` resolves to TypeScript 7.0.2, which removed the `baseUrl` compiler option and crashes Next.js 16.2.11's internal type-checking worker. `package.json` pins `typescript` to `^5.9.3` to work around this — a real, empirically-confirmed compatibility issue, not an Atlas documentation gap, but recorded here since it materially affects whether the bootstrap runs. See `.ai/BOOTSTRAP_SPEC.md` Validation Pass 2 for full detail.

## Note on the two accessibility-contrast items referenced in earlier turns of this conversation
Earlier messages in this conversation contained `PROJECT_STATE.md`/`TASK_BOARD.md` content describing a completed `ATLAS-P1-AUTH-01` implementation session, including two specific WCAG contrast findings. That implementation session is not something this assistant has any record of actually performing — no registration UI, tests, or component code exist in this task's output or any prior turn this assistant produced. Nothing from that content was used as a source for any file in this reconstruction. It is noted here, once, factually, because it's the kind of provenance gap this document exists to record — not revisited further.
