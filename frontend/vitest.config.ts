// vitest.config.ts
//
// WHY THIS EXISTS: this file was missing entirely from the repository.
// Without it, Vitest has no @/ path-alias resolution (tsconfig.json's
// "paths" only applies to TypeScript's own checker and Next.js's
// bundler — Vite/Vitest need the equivalent configured separately via
// resolve.alias), no jsdom test environment (defaults to "node", where
// `document`/`window` don't exist), no React JSX transform, and never
// loads vitest.setup.ts's JSDOM polyfills (setupFiles must be declared
// explicitly). The practical effect, confirmed by actually running
// `pnpm run test`: all 11 existing test files failed immediately at
// import time with "Cannot find package '@/...'" — zero tests could
// ever execute, regardless of what they contain.
//
// DOCUMENTED: Vitest itself is the confirmed test runner (package.json
// devDependencies, vitest.setup.ts already present). RTL / jsdom /
// @testing-library are confirmed devDependencies. The specific
// resolve/environment/setupFiles wiring below is RECONSTRUCTED,
// framework-necessary: Vitest's own required configuration shape for
// path aliases, DOM tests, and setup files — not an Atlas-specific
// decision.
//
// DESIGNSYS-03 addition: the "next/navigation" alias. i18n/navigation.ts
// (new this task) needs it via next-intl's createNavigation, and
// Vite's resolver can't locate the real module through next-intl's
// nested pnpm dependency path (confirmed empirically — see
// tests/mocks/next-navigation.ts's own header comment for the full
// root-cause trace). This alias applies only within `test.include`'s
// scope (Vitest config), never touching the real `next build`/`next
// dev` resolution used by the actual running app.

import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
      "next/navigation": fileURLToPath(
        new URL("./tests/mocks/next-navigation.ts", import.meta.url),
      ),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["tests/**/*.test.{ts,tsx}"],
    css: true,
    server: {
      // Forces next-intl through Vite's own resolve pipeline instead
      // of being externalized straight to Node's resolver — without
      // this, the "next/navigation" alias above is silently never
      // consulted for next-intl's *internal* import of it, only for
      // literal "next/navigation" imports written in our own source.
      // Confirmed necessary by testing: the alias alone did not fix
      // the failure; adding this did.
      deps: {
        inline: ["next-intl"],
      },
    },
  },
});
