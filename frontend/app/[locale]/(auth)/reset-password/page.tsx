import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { ResetPasswordContent } from "@/components/auth/reset-password-content";

/**
 * ADDED — ATLAS-P1-AUTH-06. Mirrors verify-email/page.tsx's
 * generateMetadata + Suspense pattern. Suspense boundary is required
 * by Next.js around any component using useSearchParams
 * (ResetPasswordContent) — without it, `next build` fails (confirmed
 * empirically by AUTH-04's own session, re-verified here).
 */
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Auth.resetPassword");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  );
}
