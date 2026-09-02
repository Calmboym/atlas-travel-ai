import { useTranslations } from "next-intl";
import { MessageSquareText, Map, SlidersHorizontal } from "lucide-react";
import { Heading, Paragraph } from "@/components/ui/typography";
import { ScrollReveal } from "@/components/ui/motion-wrappers";

/**
 * ATLAS-P1-LAND-01 — HowItWorks.
 *
 * COMPONENT_INVENTORY.md §Landing Page names `HowItWorks` alongside
 * HeroSection/DestinationCarousel/AIShowcase — COMPONENT_OWNERSHIP_
 * MATRIX.md §5's LAND-01/02 row is explicitly "indicative, not
 * exhaustive," so building it stays within LAND-01's ownership rather
 * than needing a separate task. No dedicated `MARKETING_NAV_ITEMS`
 * anchor: it reads as a direct continuation of the Hero, not a
 * separately-navigable destination, so the existing four nav anchors
 * (discover/aiAssistant/features/faq, already localized by
 * DESIGNSYS-03) are left untouched rather than adding a fifth.
 *
 * Numbered 1/2/3 markers are appropriate here specifically because
 * the content genuinely is an ordered sequence (frontend-design
 * skill's own caution against numbering non-sequential content) —
 * TRIP_PLANNING_EXPERIENCE.md's own six-stage journey (Dream →
 * Understand → Design → Review → Refine → Start Trip) compressed to
 * the three steps a first-time visitor actually needs to understand
 * before typing anything.
 */
const STEP_ICONS = [MessageSquareText, Map, SlidersHorizontal] as const;

export function HowItWorks() {
  const t = useTranslations("HomePage.howItWorks");
  const steps = t.raw("steps") as { title: string; description: string }[];

  return (
    <section className="px-4 py-16 md:px-6 md:py-20 lg:px-8">
      <div className="mx-auto max-w-[1440px]">
        <Heading as="h2" className="text-center">
          {t("title")}
        </Heading>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = STEP_ICONS[index] ?? STEP_ICONS[0];
            return (
              <ScrollReveal key={step.title} delay={index * 0.1}>
                <div className="flex flex-col items-center text-center">
                  <div className="atlas-glass-1 flex h-14 w-14 items-center justify-center rounded-full">
                    <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
                  </div>
                  <BadgeNumber index={index} />
                  <Heading as="h3" className="mt-3">
                    {step.title}
                  </Heading>
                  <Paragraph className="mt-2 max-w-[280px] text-text-secondary">
                    {step.description}
                  </Paragraph>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function BadgeNumber({ index }: { index: number }) {
  return (
    <span className="mt-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
      {index + 1}
    </span>
  );
}
