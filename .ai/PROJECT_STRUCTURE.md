# PROJECT_STRUCTURE.md

Complete tree of everything this reconstruction generated. Every directory and file below actually exists in the delivered ZIP — none are aspirational. Folders containing only a `.gitkeep` are empty by design (see `.ai/BOOTSTRAP_SPEC.md` for why each one is empty rather than populated with invented content).

```
atlas/
├── .ai/
│   ├── BOOTSTRAP_SPEC.md
│   ├── MISSING_INFORMATION.md
│   └── PROJECT_STRUCTURE.md          (this file)
├── REPORT.md
└── bootstrap/
    ├── README.md
    ├── .gitignore
    ├── .env.example
    ├── docker-compose.yml
    ├── .github/
    │   └── workflows/
    │       └── ci.yml
    ├── backend/
    │   ├── Dockerfile.backend
    │   ├── pyproject.toml
    │   └── app/                       (empty — scaffold only)
    ├── ai/
    │   ├── prompts/                   (empty — scaffold only)
    │   ├── agents/                    (empty — scaffold only)
    │   ├── schemas/                   (empty — scaffold only)
    │   └── evaluations/               (empty — scaffold only)
    ├── docs/                          (empty — scaffold only)
    └── frontend/
        ├── package.json
        ├── pnpm-lock.yaml              (real, verified lockfile — see BOOTSTRAP_SPEC.md)
        ├── tsconfig.json
        ├── next.config.ts
        ├── postcss.config.mjs
        ├── eslint.config.mjs
        ├── proxy.ts
        ├── Dockerfile.frontend
        ├── i18n/
        │   ├── routing.ts
        │   └── request.ts
        ├── messages/
        │   ├── en.json
        │   ├── fa.json
        │   └── de.json
        ├── app/
        │   ├── globals.css
        │   └── [locale]/
        │       ├── layout.tsx
        │       └── page.tsx
        └── public/                    (empty — scaffold only, kept for Dockerfile.frontend's COPY step)
```

**Note on the root folder name:** shown above as `atlas/` for readability; the actual repository root name is not documented anywhere and this reconstruction does not assert one — see `.ai/MISSING_INFORMATION.md`. The ZIP itself is laid out exactly as shown starting from `.ai/`, `REPORT.md`, and `bootstrap/`.

---

## Per-top-level-folder reference

### `.ai/`
- **Purpose:** this bootstrap task's own working documents — provenance, gaps, and structure record. Not part of the Atlas application itself.
- **Owner:** whichever session/role runs documentation-bootstrap work (not a product engineering role).
- **When it changes:** only when a future bootstrap/reconstruction pass runs; not touched by normal feature implementation sessions.
- **WBS phases that modify it:** none — outside the Phase 0–7 product roadmap entirely (it's process tooling, tracked separately from `.ai/WORK_BREAKDOWN_STRUCTURE.md`, which is this project's *other*, pre-existing `.ai/` memory system from the earlier bootstrap session — see the note below).

### `bootstrap/README.md`, `.gitignore`, `.env.example`
- **Purpose:** repo-root documentation and environment/version-control conventions.
- **Owner:** DevOps/Infra (folder-structure, secrets policy) jointly with whoever last touches the stack list (Frontend/Backend Engineering, when a new dependency category is added).
- **When it changes:** rarely — `.env.example` changes when a new required environment variable is introduced by any module; `README.md` changes when the stack table or structure changes.
- **WBS phases that modify it:** `ATLAS-P0-*` (Foundation) originally; thereafter, touched incidentally by whichever task adds a new env var or infra piece (e.g. Phase 2's Agent Service, Phase 3's integration adapters) — no single owning task per `WORK_BREAKDOWN_STRUCTURE.md`.

### `bootstrap/docker-compose.yml`, `.github/workflows/ci.yml`
- **Purpose:** local multi-service orchestration and CI pipeline definition.
- **Owner:** DevOps/Infra.
- **When it changes:** when a new service is added (e.g. a real production-shaped booking adapter in Phase 6) or a CI job's tooling changes.
- **WBS phases that modify it:** `ATLAS-P0-DOCKER` / `ATLAS-P0-CI` (Foundation, done); revisited at each Phase boundary that adds new infrastructure (Phase 3 external integrations, Phase 6 booking/payments).

### `bootstrap/backend/`
- **Purpose:** FastAPI backend scaffold. Contains only `Dockerfile.backend` and `pyproject.toml` — `app/` is intentionally empty (see `.ai/BOOTSTRAP_SPEC.md`: writing backend application code is implementation, not scaffold).
- **Owner:** Backend Engineering.
- **When it changes:** every Phase 1+ backend task (`ATLAS-P1-AUTH-02`, `ATLAS-P1-AUTH-07`, `ATLAS-P1-PROF-02`, `ATLAS-P1-CHAT-03/04`, `ATLAS-P1-MEM-02`, and all of Phase 2's Agent Service work) adds real code under `app/`.
- **WBS phases that modify it:** Phase 1 (AUTH, PROF, CHAT, MEM backend tasks) onward through every later phase — this is one of the two most actively-modified top-level folders in the whole roadmap.

### `bootstrap/ai/`
- **Purpose:** the provider-independent AI layer (`prompts/`, `agents/`, `schemas/`, `evaluations/`), per `GUIDELINES.md` §7's recommended structure. Currently empty scaffold only.
- **Owner:** AI Systems Engineering.
- **When it changes:** essentially untouched until Phase 2 (AI Agent System), then heavily and continuously modified through Phase 2–4.
- **WBS phases that modify it:** Phase 2 (`ORCH`, `AGENTSVC`, `CORE-AGENTS` modules), Phase 3 (`DOMAIN-AGENTS`, `RAG`), Phase 4 (`PERSONALIZE`) — per `WORK_BREAKDOWN_STRUCTURE.md`.

### `bootstrap/docs/`
- **Purpose:** DEBUG_LOG.md-confirmed location for the project's source-of-truth documents. Empty here — this reconstruction does not duplicate the 33 already-provided documents into it (out of scope; they already exist as this Claude Project's own documents).
- **Owner:** whoever maintains project documentation (Technical Product Manager role, per this project's own established conventions).
- **When it changes:** whenever `PRD.md`, `ARCHITECTURE.md`, `GUIDELINES.md`, `ROADMAP.md`, `DEBUG_LOG.md`, or `MASTER_BUILD_PROMPT.md` are revised.
- **WBS phases that modify it:** none directly — documentation maintenance is orthogonal to the Phase 0–7 WBS.

### `bootstrap/frontend/`
- **Purpose:** the Next.js application — the one part of this reconstruction that is genuinely, verifiedly runnable (`pnpm install && pnpm dev`, run from inside this folder — see `.ai/MISSING_INFORMATION.md` on why not from the repo root).
- **Owner:** Frontend Engineering.
- **When it changes:** constantly, starting immediately at Phase 1 — this is the single most actively-modified top-level folder across the entire roadmap (every LAND/AUTH/PROF/CHAT/MEM/DASH frontend task through Phase 1, then every later phase's UI work).
- **WBS phases that modify it:** Phase 1 (`LAND`, `AUTH`, `PROF`, `CHAT`, `MEM`, `DASH` — frontend halves of each) through Phase 7. Specific near-term expectation: `app/[locale]/page.tsx` and `app/[locale]/layout.tsx` are explicitly meant to be replaced starting with `ATLAS-P1-LAND-01`/`02` — see their individual entries in `.ai/BOOTSTRAP_SPEC.md`.
  - `i18n/`, `messages/`, `proxy.ts`: expected to remain structurally stable (pure plumbing); `messages/*.json` *content* changes with every task that ships user-facing copy, in any module, indefinitely.
  - `public/`: stays empty until a task needs to serve a static asset — no current task requires one.

---

## Relationship to the existing `.ai/WORK_BREAKDOWN_STRUCTURE.md`

This project already has a `.ai/` memory system from the earlier bootstrap/planning session (`MASTER_RULES.md`, `PROJECT_STATE.md`, `TASK_BOARD.md`, `SESSION_PROMPT.md`, `INDEX.md`, `WORK_BREAKDOWN_STRUCTURE.md`, `DESIGN_BIBLE_AMENDMENTS.md`) — that is the authoritative WBS/task-tracking system referenced throughout this document and `.ai/BOOTSTRAP_SPEC.md`. This task's own `.ai/BOOTSTRAP_SPEC.md`, `.ai/MISSING_INFORMATION.md`, and this file are a **separate**, scaffold-reconstruction-specific record — they document *this reconstruction's* provenance, not project-wide task state. They should not be merged into or confused with the earlier `.ai/` system.
