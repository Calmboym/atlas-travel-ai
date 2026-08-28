import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ProfileWizard } from "@/components/profile/profile-wizard";

/**
 * ADDED — ATLAS-P1-PROF-01. Route: /profile/wizard.
 *
 * Lives under app/[locale]/(app)/, inheriting ApplicationLayout — see
 * COMPONENT_OWNERSHIP_MATRIX.md §3 (ApplicationLayout consumed by
 * "DASH, CHAT, PROF, Settings"). Guarded automatically:
 * lib/auth/protected-routes.ts matches by path-segment prefix, and
 * "profile" is already in PROTECTED_PATH_SEGMENTS (added by AUTH-08,
 * ahead of any Profile feature code existing) — /profile/wizard
 * inherits that guard without any change needed here.
 *
 * Mirrors register/page.tsx's generateMetadata pattern for consistency
 * with every other page.tsx in this repository.
 */
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Profile.wizard");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default function ProfileWizardPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 lg:py-16">
      <ProfileWizard />
    </div>
  );
}
