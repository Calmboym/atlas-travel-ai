import { vi } from "vitest";

/**
 * WHY THIS FILE EXISTS (root cause, confirmed empirically before
 * writing this — not assumed): i18n/navigation.ts (new in DESIGNSYS-03)
 * uses next-intl's `createNavigation`, which imports `next/navigation`
 * internally. Node's own CommonJS resolver finds the real file fine
 * (`require.resolve("next/navigation")` →
 * `.../node_modules/next/navigation.js`), but Vite/Vitest's resolver,
 * reached through next-intl's own pnpm-isolated nested copy of `next`,
 * fails with "Cannot find module '.../next/navigation' ... Did you
 * mean to import next/navigation.js?" — a resolver/pre-bundling
 * mismatch specific to this pnpm + Vite + next-intl combination, not
 * an application bug. A plain `vi.mock("next/navigation", ...)` inside
 * vitest.setup.ts does not fix it: the failure happens while Vite is
 * statically pre-processing next-intl's module graph, before the mock
 * registry is consulted. Aliasing the bare specifier directly to this
 * file (vitest.config.ts `resolve.alias`) intercepts it at the config
 * level instead, before Vite ever attempts to resolve the real
 * package — confirmed working by the test run this file was added
 * for.
 *
 * `usePathname` defaults to "/en"; tests that care about the actual
 * path override via `vi.mocked(usePathname).mockReturnValue(...)`.
 */
export const usePathname = vi.fn(() => "/en");

export const useRouter = vi.fn(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  prefetch: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
}));

export const useParams = vi.fn(() => ({ locale: "en" }));
export const useSearchParams = vi.fn(() => new URLSearchParams());
export const redirect = vi.fn();
export const notFound = vi.fn();
