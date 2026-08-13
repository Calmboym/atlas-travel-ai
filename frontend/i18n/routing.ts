// i18n/routing.ts
//
// WHY THIS EXISTS: next-intl's App Router integration requires a
// routing definition (locale list + default) before any locale-aware
// route can resolve. Without it, `pnpm dev` cannot serve any page.
//
// DOCUMENTATION JUSTIFYING IT: locale list (en, fa, de) is DOCUMENTED
// — DEBUG_LOG.md M0 record: "i18n (next-intl) with EN, FA (RTL), DE
// locales". The `defineRouting` call shape itself is RECONSTRUCTED,
// framework-necessary: it is next-intl's own required API, not an
// Atlas-specific decision (see next-intl's own docs, not any Atlas
// document).
//
// STATUS: bootstrap infrastructure. `defaultLocale` ("en") is
// RECONSTRUCTED — not stated anywhere; English is used because it is
// the working language of the Atlas documentation itself, not because
// any document specifies a default locale.
//
// EXPECTED TO CHANGE: this file is expected to stay largely stable
// through Phase 1–3 (the approved Q4 language scope is exactly
// EN/FA/DE — see .ai/PROJECT_STATE.md). It will need one further
// edit when Phase 4+ adds AR/FR/ES/ZH/JA per Q4's deferred scope, but
// no WBS task for that expansion currently exists in
// WORK_BREAKDOWN_STRUCTURE.md — flagged in MISSING_INFORMATION.md.

import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "fa", "de"],
  defaultLocale: "en",
});

export type AppLocale = (typeof routing.locales)[number];
