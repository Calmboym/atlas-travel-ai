// i18n/request.ts
//
// WHY THIS EXISTS: next-intl requires a request-scoped config that
// resolves the active locale and loads its message file, per request.
// Without it, next-intl's plugin (wired in next.config.ts) has
// nothing to call, and the app cannot render translated content.
//
// DOCUMENTATION JUSTIFYING IT: the locale list it reads from
// (i18n/routing.ts) is DOCUMENTED (DEBUG_LOG.md — EN/FA/DE). This
// file's shape is RECONSTRUCTED, framework-necessary: it is
// next-intl's own required API (getRequestConfig), not an Atlas
// decision.
//
// STATUS: bootstrap infrastructure, not business logic — it contains
// no product content itself, only the mechanism for loading
// messages/*.json (which are themselves minimal boot placeholders,
// not real translated copy — see messages/ and MISSING_INFORMATION.md).
//
// EXPECTED TO CHANGE: expected to remain stable. Not tied to any
// single WBS task; every future task that adds user-facing copy in
// any module (LAND, AUTH, CHAT, PROF, DASH, ...) will add keys to
// messages/*.json that flow through this file unchanged.

import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
