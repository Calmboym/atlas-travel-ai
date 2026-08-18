# INFRASTRUCTURE_BASELINE.md

**Project:** Atlas — AI Travel Platform
**Created:** 2026-08-16, Governance Reconciliation session
**Status:** CANONICAL — new document. Every fact below was verified against the actual supplied baseline this session (real commands run, real files opened), not inherited from an earlier draft. Supersedes the infrastructure sections (§2–§6) of `ATLAS-BOOTSTRAP-IMPLEMENTATION-REPORT.md` and `ATLAS-CONTINUATION-HANDOFF.md`, both now archival — see those files' own headers.
**Purpose:** answer, once, in one place: *"does this infrastructure already exist, and if so where?"* — so no future task re-discovers or recreates any of it. Referenced from `MASTER_RULES.md` §2 (Documentation Priority Order) and `INDEX.md`.

---

## How to use this document

Read this **after** the five mandatory files (`MASTER_RULES.md`, `PROJECT_STATE.md`, `TASK_BOARD.md`, `INDEX.md`, `WORK_BREAKDOWN_STRUCTURE.md`) and **before** writing any code, whenever your task might need routing, providers, test setup, CI, or backend scaffolding. If your task only touches UI components, `COMPONENT_OWNERSHIP_MATRIX.md` is the more relevant document — this one is about everything *around* the components.

---

## 1. Application routing (Next.js App Router)

All real routes live under `frontend/app/[locale]/`. Four route groups exist, each wired to exactly one of the four approved layout types (`APPLICATION_LAYOUT_GUIDE.md` §Layout Types):

| Route group | Layout | Real pages today | Owner |
|---|---|---|---|
| `app/[locale]/(marketing)/` | `MarketingLayout` | `page.tsx` — placeholder `<h1>` only, real content is `LAND-01`/`02` | `DESIGNSYS-03` (shell) |
| `app/[locale]/(auth)/` | `AuthLayout` | `register/page.tsx` — real, `AUTH-01` | `AUTH-01` |
| `app/[locale]/(app)/` | `ApplicationLayout` | none yet — layout-only, first `DASH-01`/`CHAT`/`PROF` page inherits it automatically | `DESIGNSYS-03` (shell) |
| `app/[locale]/(focus)/` | `FocusLayout` | none yet — layout-only, first Trip Planning page inherits it automatically | `DESIGNSYS-03` (shell) |

`app/[locale]/layout.tsx` is the single root layout (the only file rendering `<html>`/`<body>`) — see §3 below for what it mounts. **A future task adding a real page only needs to add `page.tsx` under the correct existing route group** — the layout, providers, and locale plumbing are already wired.

---

## 2. Internationalization (next-intl)

- **Locales:** `en`, `fa` (RTL), `de` — configured in `frontend/i18n/routing.ts`. Adding a locale means editing this one file plus adding a `messages/{locale}.json`.
- **Request config:** `frontend/i18n/request.ts` — resolves the active locale's messages per request.
- **Locale-aware navigation:** `frontend/i18n/navigation.ts` — exports `Link`/`useRouter`/`usePathname` wrappers (via next-intl's `createNavigation`) that preserve the current locale on click. **Any new internal link must use these, not plain `next/link`** — `AuthLayout`'s existing plain-`next/link` usage predates this file and is a known, logged exception, not a pattern to copy.
- **RTL:** resolved once, centrally, in `app/[locale]/layout.tsx` (`dir={locale === "fa" ? "rtl" : "ltr"}` on the outer `<html>`). No other file needs to think about RTL direction switching.
- **Message files:** `frontend/messages/{en,fa,de}.json`. **`fa.json` and `de.json` are still byte-for-byte English placeholders** — real translation is an open gap, not owned by any task (`MISSING_INFORMATION.md`).

---

## 3. Global providers and app shell

All mounted once, in this exact nesting order, in `app/[locale]/layout.tsx`:

```
<html lang dir>
  <ThemeProvider>
    <MotionProvider>
      <NextIntlClientProvider>
        <BackgroundSystem />
        <TooltipProvider>
          <SkipLink />
          {children}
        </TooltipProvider>
      </NextIntlClientProvider>
    </MotionProvider>
  </ThemeProvider>
```

| Provider / global element | File | Built by | What it does |
|---|---|---|---|
| `ThemeProvider` | `components/providers/theme-provider.tsx` | DESIGNSYS-01 | Light/Dark/System, `useSyncExternalStore`-based, no-flash via inline `<script>` (`lib/theme/theme-script.ts`) |
| `MotionProvider` | `components/providers/motion-provider.tsx` | DESIGNSYS-04 | Live `prefers-reduced-motion` context via `useSyncExternalStore` (not Framer Motion's own hook — see `COMPONENT_OWNERSHIP_MATRIX.md`) |
| `BackgroundSystem` | `components/ui/background-system.tsx` | DESIGNSYS-04 | Fixed, inert `.atlas-noise` texture layer, `aria-hidden`, `pointer-events-none` |
| `TooltipProvider` | `components/ui/tooltip.tsx` | DESIGNSYS-02 (built) / DESIGNSYS-03 (mounted) | Radix Tooltip root — existed unmounted for one full task cycle before DESIGNSYS-03 wired it in; if a future gap like this is found, fix and log it, don't rebuild |
| `SkipLink` | `components/layout/skip-link.tsx` | DESIGNSYS-03 | `ACCESSIBILITY.md` §Skip Links, global not per-layout |

**A future task never needs to touch this nesting.** It's complete for all four layout types. Adding a new global concern (e.g. a future analytics provider) is the one legitimate reason to edit `app/[locale]/layout.tsx` directly — everything else is page/layout content underneath it.

---

## 4. Design tokens → CSS

- **Source of truth:** `DESIGN_TOKENS.md` (all 6 parts).
- **Wired implementation:** `frontend/app/globals.css` — `:root` (light) and `:root[data-theme="dark"]` blocks, one CSS custom property per semantic token (`--color-*`, `--space-*`, `--radius-*`, `--shadow-*`, etc.), consumed via Tailwind v4's CSS-first `@theme` mechanism. Glass levels 1–4 exist as `.atlas-glass-1`..`.atlas-glass-4` utility classes (consumed by class name in Navbar/Sidebar/Card even before `GlassSurface`/`GlassCard` components existed — both paths are valid, the components don't replace the utility classes).
- **Dark theme:** DESIGNSYS-04 delivered Amendment 004's approved values for most tokens; `color-accent` and `color-glass-highlight` remain intentionally at their light-theme value pending further design review — this is a real, logged gap, not an oversight (see `PROJECT_STATE.md` findings).
- **Rule for all future tasks:** never add a hardcoded color/spacing/radius value anywhere in `frontend/`. If a token you need doesn't exist yet in `globals.css`, that is itself a finding to log, not something to invent inline.

---

## 5. Test infrastructure

- **Runner:** Vitest (`frontend/vitest.config.ts`) — did not exist before the Bootstrap Reconciliation; without it, zero tests could execute (path aliases and jsdom environment weren't configured at all). Now wired: `@/` alias, `jsdom` environment, `next/navigation` aliased to `tests/mocks/next-navigation.ts` for Vitest's own resolution (does not affect the real `next build`/`next dev` path).
- **Setup / polyfills:** `frontend/vitest.setup.ts` — registers RTL's `afterEach(cleanup)` (not automatic without `test.globals: true`), and polyfills JSDOM gaps: `hasPointerCapture`/`setPointerCapture`/`releasePointerCapture`/`scrollIntoView` (Radix primitives), `IntersectionObserver` (Framer Motion's `whileInView`, used by the DESIGNSYS-04 entrance wrappers), `matchMedia` (`ThemeProvider`).
- **Scripts:** `pnpm test` = `vitest run` (CI-safe, non-watch — now actually wired into CI, see §7). `pnpm test:watch` = `vitest` (local dev only).
- **Current count:** 155 tests across 24 files, independently verified passing this session (`pnpm test` — 2026-08-16).
- **A future task adding tests needs none of the above wiring** — write `tests/*.test.tsx`, it already has jsdom, the polyfills, and RTL cleanup available.

---

## 6. Linting & typing

- **ESLint:** `frontend/eslint.config.mjs` — flat config, `eslint-config-next`'s native flat-config exports (`eslint-config-next/typescript`, `eslint-config-next/core-web-vitals`), plus `eslint-plugin-jsx-a11y`. Originally used a legacy `FlatCompat` bridge that crashed with a circular-JSON error under this Next.js version — fixed by switching to the native exports; don't reintroduce the bridge pattern.
- **TypeScript:** strict mode, pinned to `^5.9.3` — **this is a deliberate, documented exception** to "don't pin versions arbitrarily." TypeScript 7.x removed the `baseUrl` compiler option and crashes Next.js 16.2.11's internal type-checker; 5.9.3 is the newest version confirmed compatible. Do not "helpfully" bump this without re-confirming compatibility first.
- **Path aliases:** `@/*` → `./*`, via `tsconfig.json`'s `paths` only (no `baseUrl` — see above).

---

## 7. CI (`.github/workflows/ci.yml`)

Three jobs: `backend-lint-test` (uv sync, mypy strict, pytest with `continue-on-error: true` since backend tests need live Postgres/Redis/Qdrant not available in CI), `frontend-lint-test-build` (pnpm install, lint, typecheck, **test — added 2026-08-16, Q3**, build), `docker-build` (both Dockerfiles, depends on the other two jobs passing). **Before this reconciliation, the frontend job never ran `pnpm test`** — a green CI run did not mean the 155 tests passed, only that they existed. Fixed; do not remove the Test step.

---

## 8. Backend baseline (unchanged since Phase 0, not touched by DESIGNSYS-01–04)

FastAPI + async SQLAlchemy/Alembic, Redis, Qdrant, `structlog`, `pydantic-settings`, OpenAI provider — dependencies declared in `backend/pyproject.toml`, but **`backend/app/` contains no real application code yet** (`.gitkeep` only — confirmed this session). `package = false` is set in `pyproject.toml`'s `[tool.uv]` specifically because there's no installable package content yet; remove that line once real backend code exists (expected starting with `AUTH-02`). Backend test framework is `pytest` but this is a reconstructed default per `MISSING_INFORMATION.md`, not independently confirmed anywhere in the Design Bible — a future backend task should treat this as still-open, not settled.

---

## 9. What does NOT exist yet (do not assume otherwise)

- No real page content for Dashboard, Chat, Profile, Trip Planning, Trip Details, or any destination/hotel/flight page — only their layout shells (§1).
- No `NotificationCenter`, `ProfileMenu`, `SearchOverlay`, or any other Shared component beyond `LanguageSwitcher`/`ThemeSwitcher` — see `COMPONENT_OWNERSHIP_MATRIX.md` §4.
- No backend API routes, no database migrations, no auth session/token handling (`AUTH-01` is UI-only — see `PROJECT_STATE.md`).
- No real FA/DE translations (§2).
- No AI agents, orchestration, or RAG/vector-search wiring beyond the Phase 0 provider abstraction.

---

## 10. Provenance

Compiled from direct inspection of the supplied 2026-08-16 baseline: `pnpm install && pnpm typecheck && pnpm lint && pnpm test && pnpm build` all run and independently verified this session, plus a live production server queried for `/en`, `/fa`, `/de`, and `/en/register`. Where prior session artifacts (`ATLAS-BOOTSTRAP-IMPLEMENTATION-REPORT.md`, `ATLAS-CONTINUATION-HANDOFF.md`) described infrastructure, those claims were re-verified here rather than copied — this document should be trusted over those two archival files if they ever disagree.
