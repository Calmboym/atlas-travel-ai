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
// for the documented EN/FA/DE locales.
//
// EXTENDED — ATLAS-P1-AUTH-08: route guard. Runs BEFORE next-intl's
// own middleware — a protected path with no access-token cookie is
// redirected to /login immediately, without ever reaching (or
// needing) locale resolution first. This is a presence-only check
// (does the cookie exist), not a validity check (is the session
// still live in Redis) — deliberately: doing the latter here would
// mean an Edge middleware network call to the backend on every single
// navigation, a much heavier architecture decision than "route
// guards" was scoped for. The backend's own get_current_user
// (app/core/deps.py) remains the authoritative check, applied
// whenever a page/component actually calls a protected API endpoint;
// a page that receives a 401 from that call is expected to redirect
// to /login itself once such a page exists (none does yet — see
// lib/auth/protected-routes.ts's own docstring).
//
// STATUS: bootstrap infrastructure + AUTH-08 route guard.
//
// EXPECTED TO CHANGE: the locale-routing half is expected to remain
// stable. The guard's PROTECTED_PATH_SEGMENTS list
// (lib/auth/protected-routes.ts) grows as DASH-01/PROF-03/etc. ship
// real pages under paths already reserved here.

import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { ACCESS_TOKEN_COOKIE_NAME, isProtectedPath } from "./lib/auth/protected-routes";

const intlMiddleware = createMiddleware(routing);

function resolveLocaleForRedirect(pathname: string): string {
  const [maybeLocale] = pathname.split("/").filter(Boolean);
  return (routing.locales as readonly string[]).includes(maybeLocale)
    ? maybeLocale
    : routing.defaultLocale;
}

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isProtectedPath(pathname) && !request.cookies.get(ACCESS_TOKEN_COOKIE_NAME)) {
    const locale = resolveLocaleForRedirect(pathname);
    const loginUrl = new URL(`/${locale}/login`, request.url);
    // Preserves where the user was headed so /login can send them
    // onward after a successful sign-in, once a page exists to read
    // this param (no page does yet — see protected-routes.ts).
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return intlMiddleware(request);
}

export const config = {
  // RECONSTRUCTED — next-intl's own documented recommended matcher,
  // excluding API routes, Next.js internals, and files with an
  // extension (static assets).
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
