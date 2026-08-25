import { routing } from "@/i18n/routing";

/**
 * Mirrors backend/app/core/security.py's ACCESS_TOKEN_COOKIE_NAME.
 * The cookie itself is httpOnly (the frontend's own fetch calls never
 * read or write it directly — see lib/api/client.ts's
 * `credentials: "include"`), but proxy.ts's Edge middleware runs
 * server-side and CAN read httpOnly cookies via NextRequest.cookies,
 * which is what the route guard below needs. No shared package exists
 * between this repo's Python and TypeScript halves, so, like the
 * backend's own cookie-name constant existing to prevent its two
 * internal call sites from drifting, this one is the frontend's
 * single point of truth — proxy.ts imports it rather than repeating
 * the literal.
 */
export const ACCESS_TOKEN_COOKIE_NAME = "atlas_access_token";

/**
 * Route-guard logic for ATLAS-P1-AUTH-08.
 *
 * Kept in its own module, separate from proxy.ts, specifically so it
 * can be unit tested as a plain function — proxy.ts's default export
 * runs in the Next.js Edge middleware runtime (NextRequest/
 * NextResponse), which isn't something this project's Vitest+jsdom
 * setup can exercise directly (INFRASTRUCTURE_BASELINE.md §5 covers
 * jsdom polyfills for component tests, not an Edge runtime shim).
 *
 * Route list provenance: matches components/layout/nav-items.ts's
 * APP_NAV_ITEMS (the single already-shipped source of truth for the
 * authenticated nav — DESIGNSYS-03), MINUS two deliberate exclusions:
 *
 * - "chat" — AI Chat is explicitly guest-accessible.
 *   ONBOARDING_EXPERIENCE.md §Guest Experience: "No registration wall
 *   appears before value is demonstrated... Guests may: ...Chat with
 *   AI." USER_FLOWS.md Flow 02 (Guest User) goes Landing → Continue as
 *   Guest → AI Chat directly, no login step. Guarding /chat would
 *   contradict a locked, explicit product requirement.
 * - "help" — Help Center is not in INFORMATION_ARCHITECTURE.md's
 *   route table at all (only appears in APPLICATION_LAYOUT_GUIDE.md's
 *   sitemap, nested under Dashboard, with no stated auth requirement).
 *   Help/FAQ content being public is the conventional default for
 *   this kind of page and the safer assumption absent a stated
 *   requirement to gate it — over-guarding a low-stakes content page
 *   is worse UX than under-guarding it.
 *
 * Every remaining item — dashboard, trips, saved, notifications,
 * profile, settings — has no guest-mode carve-out anywhere in the
 * Design Bible (DASHBOARD_EXPERIENCE.md's own scope line: "Applies
 * To: Authenticated Users"), so all six are guarded.
 */
export const PROTECTED_PATH_SEGMENTS = [
  "dashboard",
  "trips",
  "saved",
  "notifications",
  "profile",
  "settings",
] as const;

const LOCALES: readonly string[] = routing.locales;

/**
 * Strips a leading locale segment (e.g. "en" in "/en/dashboard") if
 * present, returning the remaining path segments. Works whether or
 * not next-intl has already resolved the locale prefix, since this
 * runs before that resolution in proxy.ts's own middleware chain.
 */
export function stripLocaleSegment(pathname: string): string[] {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length > 0 && LOCALES.includes(segments[0])) {
    return segments.slice(1);
  }
  return segments;
}

export function isProtectedPath(pathname: string): boolean {
  const [firstSegment] = stripLocaleSegment(pathname);
  return firstSegment !== undefined && (PROTECTED_PATH_SEGMENTS as readonly string[]).includes(firstSegment);
}
