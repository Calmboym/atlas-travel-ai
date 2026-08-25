import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ForgotPasswordPageContent } from "@/components/auth/forgot-password-page-content";

/**
 * ADDED — ATLAS-P1-AUTH-06. Mirrors login/page.tsx's generateMetadata
 * pattern (per-locale metadata via next-intl/server).
 */
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Auth.forgotPassword");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordPageContent />;
}
