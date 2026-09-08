"use client";

import { useTranslations } from "next-intl";
import { Map, Scale, Wallet } from "lucide-react";
import { Heading, Paragraph } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";
import { ScrollReveal } from "@/components/ui/motion-wrappers";

/**
 * ATLAS-P1-DASH-01 — 18_DASHBOARD_EXPERIENCE.md §Empty Dashboard:
 * "First-time users see: ... AI capability overview." Three genuinely
 * documented capabilities (AI_EXPERIENCE.md §Itinerary Generation,
 * §Destination Comparison-adjacent recommendations, §Budget
 * Assistance) — no adjective from COPYWRITING_GUIDELINES.md's
 * Forbidden Language list, same restraint FeatureHighlights
 * (components/landing/feature-highlights.tsx) already established for
 * this exact kind of "what the product does" card grid.
 */
const CAPABILITY_ICONS = [Map, Scale, Wallet] as const;

export function DashboardCapabilities() {
  const t = useTranslations("Dashboard.capabilities");
  const items = t.raw("items") as { title: string; description: string }[];

  return (
    <section aria-label={t("title")}>
      <Heading as="h2" className="text-lg">
        {t("title")}
      </Heading>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {items.map((item, index) => {
          const Icon = CAPABILITY_ICONS[index] ?? CAPABILITY_ICONS[0];
          return (
            <ScrollReveal key={item.title} delay={index * 0.06}>
              <Card className="h-full">
                <div className="atlas-glass-1 flex h-11 w-11 items-center justify-center rounded-full">
                  <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                </div>
                <Heading as="h3" className="mt-4 text-base">
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
    </section>
  );
}
