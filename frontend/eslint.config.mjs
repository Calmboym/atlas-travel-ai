// eslint.config.mjs
//
// PARTIALLY DOCUMENTED: DEBUG_LOG.md confirms a "frontend lint" CI
// step exists ("CI/CD: GitHub Actions (backend lint+test, frontend
// lint+build, Docker build)"). It does NOT name the specific linting
// tool.
//
// RECONSTRUCTED: ESLint + eslint-config-next below are used because
// they are Next.js's own documented default tooling — a convention of
// the Next.js framework itself, not an independent Atlas decision.
// No Atlas-specific lint rules are documented anywhere, so none are
// added beyond the Next.js base preset.
//
// VALIDATION NOTE: the original version of this file used the legacy
// `@eslint/eslintrc` FlatCompat bridge (`.extends("next/core-web-vitals", ...)`).
// That was empirically found, during this bootstrap's validation
// pass, to crash with "TypeError: Converting circular structure to
// JSON" under both ESLint 9 and 10 with the installed
// eslint-config-next (16.2.11) — an upstream compatibility issue, not
// an Atlas-specific bug. `eslint-config-next` 16.2.11 ships native
// flat-config exports that bypass the buggy bridge entirely.
//
// RECONCILIATION NOTE: this file previously imported the
// `eslint-config-next/typescript` subpath specifically. That import
// does NOT bundle eslint-plugin-jsx-a11y — confirmed by inspecting
// the installed package's dist/typescript.js, which has no jsx-a11y
// reference at all; only the plain default export (dist/index.js)
// requires eslint-plugin-jsx-a11y, alongside typescript-eslint,
// eslint-plugin-react, eslint-plugin-react-hooks, and
// eslint-plugin-import. That gap silently broke every jsx-a11y
// eslint-disable comment in the codebase (ESLint reports "Definition
// for rule 'jsx-a11y/...' was not found" for a disable comment
// referencing a rule from a plugin that was never loaded), including
// the deliberately-justified Window Splitter suppression in
// components/ui/resizable-panel.tsx. Importing the default export
// restores jsx-a11y while keeping typescript-eslint/react/react-hooks
// — all bundled in the same modern flat-config style, so the original
// FlatCompat fix still holds; that crash was specific to the legacy
// `.extends()` bridge, not to this export style.

import nextConfig from "eslint-config-next";

const eslintConfig = [
  ...nextConfig,
  {
    ignores: ["node_modules/**", ".next/**"],
  },
  {
    // Test fixtures render throwaway <img> elements as test content;
    // @next/next/no-img-element is a production LCP/bandwidth rule
    // that has no meaning inside jsdom test files. Every other rule
    // (jsx-a11y included) still applies to tests.
    files: ["tests/**/*.{ts,tsx}"],
    rules: {
      "@next/next/no-img-element": "off",
    },
  },
];

export default eslintConfig;
