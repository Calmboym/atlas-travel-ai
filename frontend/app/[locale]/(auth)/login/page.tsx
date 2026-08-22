import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LoginPageContent } from "@/components/auth/login-page-content";

/**
 * ADDED — ATLAS-P1-AUTH-05. Mirrors register/page.tsx's
 * generateMetadata pattern (per-locale metadata via next-intl/server,
 * not a static Metadata export — see that file's own comment on why).
 */
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Auth.login");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default function LoginPage() {
  return <LoginPageContent />;
}
