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
// flat-config exports (`eslint-config-next/typescript`,
// `eslint-config-next/core-web-vitals`) that bypass the buggy bridge
// entirely; this file uses that modern path instead, and was
// confirmed working end-to-end (`pnpm run lint` exits cleanly).

import nextConfig from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextConfig,
  {
    ignores: ["node_modules/**", ".next/**"],
  },
];

export default eslintConfig;
