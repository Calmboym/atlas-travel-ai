import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { RegisterPageContent } from "@/components/auth/register-page-content";

/**
 * Localization fix (AUTH-01 audit): metadata was a static, English-only
 * export, so the browser tab title/description stayed in English on
 * /fa and /de regardless of the page's own locale. `generateMetadata`
 * is next-intl's documented pattern for per-locale metadata in the App
 * Router (the static `Metadata` export has no access to the request's
 * locale at all).
 */
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Auth.register");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default function RegisterPage() {
  return <RegisterPageContent />;
}
