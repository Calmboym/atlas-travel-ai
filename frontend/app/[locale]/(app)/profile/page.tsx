import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ProfilePageContent } from "@/components/profile/profile-page-content";

/**
 * ADDED — ATLAS-P1-PROF-03. Route: /profile — the page nav-items.ts's
 * Sidebar and MobileBottomNav entries already point to, and the first
 * real page in the (app)/ApplicationLayout route group (previously
 * layout-only — see INFRASTRUCTURE_BASELINE.md §1). Already covered
 * by lib/auth/protected-routes.ts's guard (added by AUTH-08, ahead of
 * any Profile page existing).
 */
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Profile.page");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default function ProfilePage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:py-12">
      <ProfilePageContent />
    </div>
  );
}
