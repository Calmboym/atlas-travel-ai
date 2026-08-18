# ATLAS — Continuation / Project-State Handoff

> **⚠ ARCHIVAL / NON-CANONICAL (marked 2026-08-16, Governance Reconciliation, Amendment 009).** This is a historical record of the 2026-08-13 session, kept for provenance. It is **not** part of the mandatory or conditional reading set in `MASTER_RULES.md` §2 — use `.ai/SESSION_PROMPT.md` for the current startup protocol, not the "Start Here" section below. This document's snapshot of project state is superseded by the live `.ai/PROJECT_STATE.md`, `.ai/TASK_BOARD.md`, and `.ai/COMPONENT_OWNERSHIP_MATRIX.md` — where any disagree with this file, **the canonical document wins.**

**Written:** 2026-08-13, at the end of the Bootstrap Reconciliation session.
**Audience:** historical — see archival note above. Do not use this file's own "Start Here" instructions; use `.ai/SESSION_PROMPT.md`.

---

## 1. Start Here

1. Read `.ai/MASTER_RULES.md`, `.ai/PROJECT_STATE.md`, `.ai/TASK_BOARD.md`, `.ai/INDEX.md`, `.ai/WORK_BREAKDOWN_STRUCTURE.md` — in that order, per `.ai/SESSION_PROMPT.md`.
2. If your task touches any UI component, also read `.ai/COMPONENT_OWNERSHIP_MATRIX.md`.
3. Everything below is context to accelerate that reading, not a replacement for it.

---

## 2. Current Project Architecture (as it actually exists right now)

```
.ai/           Governance/process — MASTER_RULES.md, PROJECT_STATE.md, TASK_BOARD.md,
               WORK_BREAKDOWN_STRUCTURE.md, INDEX.md, SESSION_PROMPT.md,
               COMPONENT_OWNERSHIP_MATRIX.md, DESIGN_BIBLE_AMENDMENTS.md,
               MISSING_INFORMATION.md, CONVERSATION_STRATEGY.md, BOOTSTRAP_SPEC.md,
               PROJECT_STRUCTURE.md, and this session's two reports.
               DID NOT EXIST before 2026-08-13 — created this session.
docs/          Design Bible (26 numbered docs) + PRD/ARCHITECTURE/GUIDELINES/ROADMAP/
               DEBUG_LOG/MASTER_BUILD_PROMPT/WORKFLOW + point-in-time audit reports.
backend/       FastAPI scaffold. app/ has NO application code yet (just .gitkeep) —
               this is correct, deliberate Phase-0-only status, not a bug.
frontend/      Next.js 16 app. Flat structure — NOT apps/web/, despite what an
               earlier, never-committed PROJECT_STATE.md draft claimed.
ai/            Provider-independent AI layer scaffold (prompts/, agents/, schemas/,
               evaluations/) — all empty, Phase 2+.
```

No monorepo workspace tooling (no `pnpm-workspace.yaml`, no root `package.json`). Run everything from inside `frontend/` or `backend/` directly, not the repo root.

---

## 3. Frontend Foundation — Current State

- **Next.js 16.2.11, TypeScript strict** (declared floor `^5.7.2`, resolves to `5.9.3`; TypeScript 7.x is deliberately excluded — see `.ai/MISSING_INFORMATION.md`).
- **`app/[locale]/layout.tsx` is the single root layout.** It owns `<html>`/`<body>`, sets locale-aware `lang`/`dir`, wraps `ThemeProvider` and `NextIntlClientProvider`, loads fonts (`@fontsource/plus-jakarta-sans`, not `next/font/google` — blocked in this sandboxed environment), and injects the no-flash theme script. **There is no longer a separate `app/layout.tsx`** — it was deleted this session because having both caused invalid nested `<html>` tags that silently broke RTL. If you ever see a reason to reintroduce a top-level `app/layout.tsx`, read `.ai/ATLAS-BOOTSTRAP-IMPLEMENTATION-REPORT.md` §3.2 first.
- **Design tokens are fully wired**: `frontend/app/globals.css` has the complete primitive + semantic token layer, Light theme, and now a real (not placeholder) Dark theme per `DESIGN_BIBLE_AMENDMENTS.md` Amendment 004. Two tokens remain unmapped for dark (`color-accent`, `color-glass-highlight`) — deliberately, per that amendment's own scope, not an oversight.
- **27 Foundation components** exist in `frontend/components/ui/*` (Button, Card, Dialog, Sheet, Select, Toast, Typography, Structural primitives, etc.) — this is `DESIGNSYS-02`'s actual delivered scope. Don't recreate any of these; check `.ai/COMPONENT_OWNERSHIP_MATRIX.md` first.
- **Testing**: Vitest, 11 test files, 98 tests, all passing. `vitest.config.ts` and the `afterEach(cleanup)` registration in `vitest.setup.ts` **did not exist before this session** — both are now real and required; don't remove them.
- **Linting**: `eslint.config.mjs` uses the **default** `eslint-config-next` export (not `/typescript`) — this is required for `eslint-plugin-jsx-a11y` to load at all. Don't switch it back to the `/typescript` subpath.

---

## 4. Backend Foundation — Current State

Phase-0-only. `backend/app/` has no application code. `pyproject.toml` now has `[tool.uv] package = false` so `uv sync` actually works (it didn't before this session — see report §3.6). **Remove `package = false` once real application code exists** under `app/` (expected starting with `AUTH-02`) — it's a scaffold-stage accommodation, not a permanent setting.

---

## 5. i18n / RTL Infrastructure — Current State

Three locales: `en`, `fa` (RTL), `de`. `next-intl@^4.13.6` (this session restored it — it was **entirely missing** from `package.json`, which meant the app couldn't build at all; see report §3.1). Verified with real HTTP requests against the built app:

```
/en → <html lang="en" dir="ltr">
/fa → <html lang="fa" dir="rtl">
/de → <html lang="de" dir="ltr">
```

Each locale now renders exactly one `<html>` tag with correct attributes — this was NOT true before this session (§3.2).

---

## 6. Design System State

| Task | Status | Notes |
|---|---|---|
| `DESIGNSYS-01` | **Done**, verified | Token/CSS wiring, ThemeProvider, no-flash theme script |
| `DESIGNSYS-02` | **Done**, verified | 27 Foundation components, 11 test files |
| `DESIGNSYS-03` | **Not started** | Layout shells + navigation (Navbar, Sidebar, MobileBottomNav, footers, LanguageSwitcher, ThemeSwitcher, UserMenu, MarketingLayout, ApplicationLayout, FocusLayout). **A prior session's memory incorrectly claimed this was done — it is not. Do not trust that claim if you see it resurface.** |
| `DESIGNSYS-04` | **Not started** | Glass system components (`GlassCard`/`GlassSurface`), motion wrappers (`FadeIn`/`SlideIn`/`ScaleIn`/`ScrollReveal`), `BackgroundSystem` |

**Exact DESIGNSYS-03 scope** (per `.ai/WORK_BREAKDOWN_STRUCTURE.md`, `Module: DESIGNSYS`, and `docs/APPLICATION_LAYOUT_GUIDE.md`): build `MarketingLayout`, `ApplicationLayout`, `FocusLayout` (exactly these three plus the already-existing `AuthLayout` — no fifth layout type without an architecture amendment), plus the global `Navbar`/`Sidebar`/`MobileSidebar` nav shell. The natural integration point is `app/[locale]/layout.tsx` — currently a deliberately minimal placeholder (its own header comment says so); DESIGNSYS-03 is expected to substantially extend it, not replace the theme/i18n machinery this session just fixed there.

**Exact DESIGNSYS-04 scope**: the 4 official Glass Levels (`DESIGN_TOKENS.md` §Atlas Glass Design Language) as real components, `MotionProvider`/reduced-motion context, and the animation wrapper components. Exactly 4 Glass Levels — no 5th without an amendment.

---

## 7. What Must NOT Be Changed

- `DESIGNSYS-01`/`02`'s actual component logic — extend, don't fork or rewrite.
- The single-root-layout structure at `app/[locale]/layout.tsx` (don't reintroduce a competing `app/layout.tsx`).
- `eslint.config.mjs`'s use of the default `eslint-config-next` export.
- `vitest.config.ts` / the `afterEach(cleanup)` registration in `vitest.setup.ts`.
- `backend/pyproject.toml`'s `package = false` — until real app code exists.
- Any locked Design Bible document's body — corrections go through `.ai/DESIGN_BIBLE_AMENDMENTS.md` only.
- `DESIGNSYS-03`/`04` feature work — not authorized by this session or by completing it.

---

## 8. Unresolved / Deferred Items

- `color-accent` and `color-glass-highlight` have no approved dark-theme value (Amendment 004 explicitly didn't cover them).
- Overlay scrim color and Popover's visual contract are thin, undocumented inferences (pre-existing, unchanged this session).
- Docker build is unverified (no daemon in this sandbox) — the specific failure this session found and fixed (`uv sync` inside the Dockerfile) is fixed and verified outside Docker, but a full container build has never actually been run against the current state.
- No commit was made to the real repository — this session had read (clone) access only, no push credentials. Everything here exists in the delivered ZIP; applying it to `main` is a manual step.

---

## 9. Verification Status (2026-08-13, actually run)

Typecheck ✅ · Lint (0 errors/0 warnings) ✅ · Tests (98/98, 11/11 files) ✅ · Production build ✅ · RTL smoke test (real server, real HTTP requests, all 3 locales) ✅ · Backend `uv sync` ✅ · Backend `mypy` ✅ (no files yet — correct, not an error) · Backend Docker build — not run (no daemon available).

---

## 10. Known Technical Constraints (unchanged from before this session, still true)

- `next/font/google` is blocked at build time in this sandboxed environment — `@fontsource/plus-jakarta-sans` is the working substitute. Don't reintroduce `next/font/google`.
- TypeScript 7.x breaks Next.js 16.2.11's internal type-checking worker — stay on TypeScript 5.x.
- `pnpm approve-builds --all` is required after every fresh `pnpm install`, or native build scripts (`@swc/core`, `sharp`, etc.) stay blocked and every subsequent script fails with `ERR_PNPM_IGNORED_BUILDS`.
- No monorepo workspace tooling — run commands from inside `frontend/`/`backend/`, not the repo root.

---

## 11. Recommended Starting Point

`ATLAS-P1-DESIGNSYS-03` (layout shells + navigation) — it now has a genuinely verified, working Foundation layer to build on, and its natural integration point (`app/[locale]/layout.tsx`) is documented above. `ATLAS-P1-DESIGNSYS-04` is independently available (only depends on `DESIGNSYS-01`). `ATLAS-P1-AUTH-02`, `ATLAS-P1-LAND-01`, `ATLAS-P1-CHAT-01`, and `ATLAS-P1-CHAT-03` remain available in parallel per `.ai/PROJECT_STATE.md`.

**None of the above is authorized by this document.** Per `.ai/MASTER_RULES.md` §20 and `.ai/SESSION_PROMPT.md`, implementation begins only on the project owner's explicit go-ahead for a specific task.

---

**END OF HANDOFF**
