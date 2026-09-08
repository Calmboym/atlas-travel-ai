import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { DashboardPageContent } from "@/components/dashboard/dashboard-page-content";

/**
 * ADDED — ATLAS-P1-DASH-01. Route: /dashboard — nav-items.ts's
 * Sidebar/MobileBottomNav/APP_HEADER_NAV_ITEMS entries already point
 * here, and lib/auth/protected-routes.ts's guard (AUTH-08) already
 * covers it, both ahead of this page existing (the established
 * "wire the entry point, the destination catches up" pattern —
 * see nav-items.ts's own docstring).
 *
 * No wrapping container here (unlike profile/page.tsx's own
 * `max-w-3xl` div) — DashboardPageContent owns its own `Container
 * size="max"`, matching DESIGN_SYSTEM.md §13's "Dashboard Width:
 * 1440px" rather than Profile's narrower reading-width layout.
 */
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Dashboard.page");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default function DashboardPage() {
  return <DashboardPageContent />;
}
