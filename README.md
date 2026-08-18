# Atlas — AI Travel Platform

Atlas is an AI travel companion — not a booking engine, not an OTA, and
not a general-purpose chatbot (`docs/PRODUCT_VISION.md` §1; `docs/PRD.md`,
Product Description). It assists travelers across the full trip
lifecycle: Dream → Research → Plan → Book → Prepare → Travel → Explore →
Return → Reflect → Remember → Improve (`docs/PRODUCT_VISION.md` §11).

## Status

**Phase 1 — Core Platform MVP, underway.** Phase 0 (Foundation) is
complete (`docs/DEBUG_LOG.md`, 2026-07-13). Since then:

- `ATLAS-P1-AUTH-01` (Registration UI) — done
- `ATLAS-P1-DESIGNSYS-01` (design token → CSS/Tailwind wiring, ThemeProvider) — done
- `ATLAS-P1-DESIGNSYS-02` (Foundation UI primitives — 27 components) — done
- `ATLAS-P1-DESIGNSYS-03` (layout shells + navigation) and `ATLAS-P1-DESIGNSYS-04`
  (Glass/Motion/Background systems) — defined, not started
- Backend — Phase 0 scaffold only (`backend/app/` has no application code yet)

Live project state, task tracking, and the full work-breakdown structure
live in `.ai/` — start with `.ai/PROJECT_STATE.md`.

**2026-08-13 Bootstrap Reconciliation:** this pass audited the repository
against its own documentation using real tooling (not assumed), found
and fixed several genuine infrastructure bugs — a missing `next-intl`
dependency that broke the production build, nested `<html>`/`<body>`
tags that silently broke RTL rendering, a missing ESLint plugin that
disabled accessibility linting, and a missing Vitest config that meant
none of the test suite's 98 tests could ever run — and created the `.ai/`
governance folder that every process document already assumed existed.
Full details: `.ai/ATLAS-BOOTSTRAP-IMPLEMENTATION-REPORT.md`.

## Stack

DOCUMENTED (`docs/ARCHITECTURE.md` §4, §6, §9-13; `docs/DEBUG_LOG.md` M0
record) as the target stack. Items marked *(not yet installed)* are
real architecture decisions not yet needed — e.g. Zustand/TanStack Query
manage business state (active trip, budget, reservations) that doesn't
exist until Phase 2's agents produce real data.

| Layer | Choice |
|---|---|
| Frontend | Next.js 16, TypeScript (strict, pinned `^5.7.2`\*), Tailwind CSS v4 |
| Frontend state | Zustand (client), TanStack Query (server) *(not yet installed)* |
| Forms | React Hook Form + Zod v4 |
| i18n | next-intl 4.13.6 — EN, FA (RTL), DE |
| Backend | FastAPI (Python 3.12), SQLAlchemy (async), Alembic |
| Database | PostgreSQL |
| Cache | Redis |
| Vector DB | Qdrant |
| AI | Provider-independent `LLMProvider` interface; OpenAI implementation live |
| Package managers | pnpm (frontend), uv (backend) |
| Containerization | Docker / Docker Compose |
| CI/CD | GitHub Actions |

\* `^5.7.2` is the declared floor; installs resolve to the latest
compatible 5.x (currently 5.9.3) — TypeScript 7.x is deliberately
excluded, see `.ai/MISSING_INFORMATION.md`.

## Structure

```
.ai/           Governance/process files — start here (PROJECT_STATE.md, TASK_BOARD.md,
               WORK_BREAKDOWN_STRUCTURE.md, MASTER_RULES.md, INDEX.md, SESSION_PROMPT.md,
               COMPONENT_OWNERSHIP_MATRIX.md, DESIGN_BIBLE_AMENDMENTS.md, and the
               Bootstrap Reconciliation's own provenance record)
docs/          Design Bible (26 documents) + core engineering docs (PRD, ARCHITECTURE,
               GUIDELINES, ROADMAP, DEBUG_LOG) + point-in-time audit/analysis reports
backend/       FastAPI application (backend/app/ — Phase 0 scaffold only, no code yet)
ai/            Provider-independent AI layer (prompts/, agents/, schemas/,
               evaluations/ — GUIDELINES.md §7; empty scaffold, Phase 2+)
frontend/      Next.js application — components/ui/* (27 Foundation primitives),
               tests/* (11 files, 98 tests), i18n/, app/[locale]/
```

## Development

Run from **inside `frontend/`**, not the repository root (no monorepo
workspace tooling is set up — see `.ai/MISSING_INFORMATION.md`):

```bash
cd frontend
pnpm install

# REQUIRED, not optional — pnpm blocks native build scripts
# (@swc/core, sharp, etc.) until approved.
pnpm approve-builds --all
pnpm install

pnpm dev              # or: pnpm build / pnpm run typecheck / pnpm run lint / pnpm run test
```

Backend:

```bash
cd backend && uv sync
```

Full environment variables: see `.env.example`.

## Documentation

`.ai/` for live project state and process. `docs/` for the Design
Bible and core engineering documents (PRD, Architecture, Guidelines,
Roadmap, Debug Log, Master Build Prompt).
