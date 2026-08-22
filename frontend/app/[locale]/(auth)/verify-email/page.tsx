import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { VerifyEmailContent } from "@/components/auth/verify-email-content";

/**
 * ADDED — ATLAS-P1-AUTH-04. Mirrors register/page.tsx's
 * generateMetadata pattern. Suspense boundary is required by Next.js
 * around any component using useSearchParams (VerifyEmailContent) —
 * without it, `next build` fails, confirmed by actually running it.
 */
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Auth.verifyEmail");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  );
}
