// proxy.ts
//
// WHY THIS EXISTS, AND WHY THIS FILENAME: without request-level
// locale routing, visiting "/" cannot resolve to a locale segment
// (e.g. "/en") and the app returns 404s for every route — this is
// what actually makes the [locale] segment structure under app/
// work at request time.
//
// DOCUMENTATION JUSTIFYING IT: the filename itself is DOCUMENTED —
// DEBUG_LOG.md Architecture Decisions: "Frontend renamed
// middleware.ts → proxy.ts | Next.js 16 deprecated middleware
// convention." This is why this file is named proxy.ts and not
// middleware.ts, unlike most other next-intl examples you may see
// elsewhere. The locale-routing BEHAVIOR inside it is RECONSTRUCTED,
// framework-necessary: next-intl's own required middleware wiring
// for the documented EN/FA/DE locales — not Atlas-specific business
// logic (no auth checks, redirects, or feature logic of any kind are
// included here, deliberately).
//
// STATUS: bootstrap infrastructure.
//
// EXPECTED TO CHANGE: expected to remain stable as pure i18n routing
// plumbing. If Phase 1's AUTH-08 (route guards) is later implemented,
// that task may need to compose additional logic alongside this file
// — but per MASTER_RULES.md scope-control, that composition is
// AUTH-08's job, not this bootstrap's.

import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // RECONSTRUCTED — next-intl's own documented recommended matcher,
  // excluding API routes, Next.js internals, and files with an
  // extension (static assets).
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
