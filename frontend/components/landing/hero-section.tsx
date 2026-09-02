import { useTranslations } from "next-intl";
import { HeroText, Paragraph, BadgeText } from "@/components/ui/typography";
import { AnimatedBackground } from "@/components/landing/animated-background";
import { AISearchBox } from "@/components/landing/ai-search-box";
import { GuestEntryCta } from "@/components/landing/guest-entry-cta";

/**
 * ATLAS-P1-LAND-01 — HeroSection.
 *
 * Structure and sizing follow DESIGN_TOKENS.md Part 6 §Hero Section
 * (Maximum Width 1440px, Headline Width 700px, Very Spacious spacing)
 * and APPLICATION_LAYOUT_GUIDE.md §Marketing Layout ("Header ↓ Hero ↓
 * Content Sections..."). No GSAP/Three.js dependency is introduced —
 * both are nominally "Approved Libraries" (DESIGN_SYSTEM.md §40) but
 * neither is an installed dependency of this repository today, and
 * Framer Motion (already installed, and DESIGN_TOKENS.md Part 5's own
 * "default interaction library") already delivers the required
 * storytelling motion at this scope; introducing a new runtime
 * dependency for one section is a call this task doesn't make
 * unilaterally (MASTER_RULES.md §5).
 *
 * Composition, not new scope: `AISearchBox` (LAND-02) and
 * `GuestEntryCta` (LAND-03) are each that task's own Feature
 * Component, rendered here the same way MarketingLayout composes
 * Navbar/Footer — this file owns Hero's headline, layout, and
 * decorative background only.
 */
export function HeroSection() {
  const t = useTranslations("HomePage.hero");

  return (
    <section className="relative overflow-hidden px-4 pb-20 pt-20 text-center md:px-6 md:pb-28 md:pt-28 lg:px-8 lg:pt-32">
      <AnimatedBackground />

      <div className="mx-auto flex max-w-[1440px] flex-col items-center">
        <BadgeText className="rounded-full border border-border bg-surface px-4 py-1.5 text-primary">
          {t("eyebrow")}
        </BadgeText>

        <HeroText as="h1" className="mt-6 max-w-[700px] text-balance">
          {t("headline")}
        </HeroText>

        <Paragraph
          size="lg"
          className="mt-6 max-w-[560px] text-text-secondary"
        >
          {t("subheadline")}
        </Paragraph>

        <div id="ai-search" className="mt-10 w-full scroll-mt-24">
          <AISearchBox />
        </div>

        <GuestEntryCta className="mt-6" />
      </div>
    </section>
  );
}
