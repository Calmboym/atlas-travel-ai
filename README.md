# Atlas — AI Travel Platform

> DOCUMENTED: this file's existence is confirmed by DEBUG_LOG.md M0
> record (".gitignore, .env.example, README.md" delivered). Its exact
> original wording is not preserved anywhere; the content below is
> reconstructed from PRODUCT_VISION.md, PRD.md, ARCHITECTURE.md, and
> DEBUG_LOG.md, with inline citations.

Atlas is an AI travel companion — not a booking engine, not an OTA, and
not a general-purpose chatbot (PRODUCT_VISION.md §1; PRD.md, Product
Description). It assists travelers across the full trip lifecycle:
Dream → Research → Plan → Book → Prepare → Travel → Explore → Return →
Reflect → Remember → Improve (PRODUCT_VISION.md §11).

## Status

Phase 0 (Foundation) is complete (DEBUG_LOG.md, dated 2026-07-13).
This `bootstrap/` reconstruction rebuilds the *scaffold/configuration*
layer of that phase from documentation only, since the original
repository is not accessible in this environment. It contains no
business logic, no authentication implementation, and no API
endpoints — see `.ai/BOOTSTRAP_SPEC.md` for what each file represents
and `.ai/MISSING_INFORMATION.md` for what could not be reconstructed.

## Stack

DOCUMENTED (ARCHITECTURE.md §4, §6, §9-13; DEBUG_LOG.md M0 record):

| Layer | Choice |
|---|---|
| Frontend | Next.js 16, TypeScript (strict), Tailwind CSS v4, shadcn/ui |
| Frontend state | Zustand (client), TanStack Query (server) |
| Forms | React Hook Form + Zod |
| i18n | next-intl — EN, FA (RTL), DE implemented in Phase 0 |
| Backend | FastAPI (Python), SQLAlchemy (async), Alembic |
| Database | PostgreSQL |
| Cache | Redis |
| Vector DB | Qdrant |
| AI | Provider-independent `LLMProvider` interface; OpenAI implementation live |
| Package managers | pnpm (frontend, v11), uv (backend) |
| Containerization | Docker / Docker Compose |
| CI/CD | GitHub Actions |

## Structure

```
backend/       FastAPI application (documented path: backend/app/)
ai/            Provider-independent AI layer (documented: prompts/, agents/,
               schemas/, evaluations/ — GUIDELINES.md §7)
frontend/      Next.js application (path not documented — see
               .ai/MISSING_INFORMATION.md)
docs/          Source-of-truth documentation
```

## Development

RECONSTRUCTED — exact commands are not given verbatim in any Atlas
document; the sequence below is the one actually verified to work in
a real test run (see `.ai/BOOTSTRAP_SPEC.md` Validation Pass 2), run
from **inside `frontend/`**, not the repository root (no monorepo
workspace tooling is documented — see `.ai/MISSING_INFORMATION.md`).

```bash
cd frontend
pnpm install

# REQUIRED, not optional — DEBUG_LOG.md's own documented Known Issue:
# pnpm 11 blocks native build scripts (@swc/core, sharp, etc.) until
# approved. Without this step, `pnpm run build`, `pnpm dev`, and every
# other script will fail with ERR_PNPM_IGNORED_BUILDS.
pnpm approve-builds --all
pnpm install

pnpm dev          # or: pnpm build / pnpm run typecheck / pnpm run lint
```

Backend:

```bash
cd backend && uv sync
```

Full environment variables: see `.env.example`.

## Documentation

See `docs/` for the project's source-of-truth documents (PRD,
Architecture, Guidelines, Roadmap, Debug Log, Master Build Prompt) and
the Design Bible referenced therein.
