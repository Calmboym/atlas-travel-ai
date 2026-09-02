import { useTranslations } from "next-intl";
import { Lightbulb, UserRoundCog, ShieldCheck, HandHeart } from "lucide-react";
import { Heading, Paragraph } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";
import { ScrollReveal } from "@/components/ui/motion-wrappers";

/**
 * ATLAS-P1-LAND-01 — FeatureHighlights (nav target: #features).
 *
 * Four cards, each mapped directly to a documented product commitment
 * rather than a marketing claim: explainability (AI_EXPERIENCE.md
 * §Explainability), personalization with user control
 * (PSYCHOLOGY_GUIDELINES.md §21 "Always allow editing... deleting
 * memories"), honesty about uncertainty (BRAND_GUIDELINES.md §8 "Always
 * explain uncertainty"), and booking independence
 * (AI_EXPERIENCE.md §Booking Independence: "The AI never pressures
 * users into bookings"). No adjective here ("best," "unlimited," etc.)
 * from COPYWRITING_GUIDELINES.md's Forbidden Language list.
 */
const FEATURE_ICONS = [Lightbulb, UserRoundCog, ShieldCheck, HandHeart] as const;

export function FeatureHighlights() {
  const t = useTranslations("HomePage.features");
  const items = t.raw("items") as { title: string; description: string }[];

  return (
    <section id="features" className="px-4 py-16 md:px-6 md:py-20 lg:px-8">
      <div className="mx-auto max-w-[1440px]">
        <div className="mx-auto max-w-[640px] text-center">
          <Heading as="h2">{t("title")}</Heading>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, index) => {
            const Icon = FEATURE_ICONS[index] ?? FEATURE_ICONS[0];
            return (
              <ScrollReveal key={item.title} delay={index * 0.08}>
                <Card className="h-full">
                  <div className="atlas-glass-1 flex h-11 w-11 items-center justify-center rounded-full">
                    <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                  </div>
                  <Heading as="h3" className="mt-4 text-lg">
                    {item.title}
                  </Heading>
                  <Paragraph className="mt-2 text-sm text-text-secondary">
                    {item.description}
                  </Paragraph>
                </Card>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
