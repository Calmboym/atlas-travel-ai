// app/[locale]/(marketing)/page.tsx
//
// ATLAS-P1-LAND-01/02/03 — the real Landing page, replacing the boot
// placeholder this file's own prior header comment (see git history)
// said was "expected to change entirely." Composes the Marketing
// Layout's Content Sections in the order APPLICATION_LAYOUT_GUIDE.md
// §Marketing Layout specifies: Header (MarketingLayout) ↓ Hero ↓
// Content Sections ↓ CTA ↓ Footer (MarketingLayout).
//
// generateMetadata pattern matches app/[locale]/(auth)/register/
// page.tsx exactly (AUTH-01 audit's own documented fix): per-locale
// title/description via next-intl's server API, since the static
// `Metadata` export has no access to the request's locale.

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { HeroSection } from "@/components/landing/hero-section";
import { HowItWorks } from "@/components/landing/how-it-works";
import { DestinationCarousel } from "@/components/landing/destination-carousel";
import { AIShowcase } from "@/components/landing/ai-showcase";
import { FeatureHighlights } from "@/components/landing/feature-highlights";
import { FAQSection } from "@/components/landing/faq-section";
import { CTASection } from "@/components/landing/cta-section";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("HomePage");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <HowItWorks />
      <DestinationCarousel />
      <AIShowcase />
      <FeatureHighlights />
      <FAQSection />
      <CTASection />
    </>
  );
}
