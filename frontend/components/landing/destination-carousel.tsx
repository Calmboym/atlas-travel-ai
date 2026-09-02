import { useTranslations } from "next-intl";
import { Compass } from "lucide-react";
import { Heading, Paragraph, Caption } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";
import { FadeIn } from "@/components/ui/motion-wrappers";

/**
 * ATLAS-P1-LAND-01 — DestinationCarousel (nav target: #discover).
 *
 * BRAND_GUIDELINES.md §8 Core Value 1 (Trust): "Never invent facts...
 * never exaggerate." Atlas has no live Destination Intelligence Agent
 * yet (Phase 2) and no real user data to personalize or rank
 * destinations by, so this deliberately does NOT claim personalized
 * recommendations, ratings, or popularity statistics — only plain,
 * verifiable geographic/cultural description, sourced from general
 * knowledge rather than any invented metric. `messages/*.json`'s
 * `HomePage.discover.destinations` carries the six entries; no image
 * assets are used (ICONOGRAPHY_AND_ILLUSTRATION.md warns against
 * "stock-photo appearance") — each card is a token-driven glass
 * surface instead.
 *
 * Implemented as a horizontally-scrollable strip (native scroll, no
 * auto-advance) rather than an auto-rotating slider:
 * ACCESSIBILITY.md §Infinite Scroll — "Avoid when possible" — applies
 * in spirit to auto-advancing carousels too; a user-controlled
 * scrollable row keeps "DestinationCarousel"'s naming
 * (COMPONENT_OWNERSHIP_MATRIX.md §5) while staying keyboard- and
 * screen-reader-friendly.
 */
export function DestinationCarousel() {
  const t = useTranslations("HomePage.discover");
  const destinations = t.raw("destinations") as {
    name: string;
    region: string;
    description: string;
  }[];

  return (
    <section id="discover" className="px-4 py-16 md:px-6 md:py-20 lg:px-8">
      <div className="mx-auto max-w-[1440px]">
        <div className="mx-auto max-w-[640px] text-center">
          <Heading as="h2">{t("title")}</Heading>
          <Paragraph className="mt-3 text-text-secondary">
            {t("subtitle")}
          </Paragraph>
        </div>

        <div
          className="mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4"
          role="list"
          aria-label={t("title")}
        >
          {destinations.map((destination, index) => (
            <FadeIn
              key={destination.name}
              delay={index * 0.05}
              className="snap-start"
            >
              <Card
                interactive
                role="listitem"
                className="flex h-full w-64 shrink-0 flex-col gap-3"
              >
                <div className="atlas-glass-1 flex h-11 w-11 items-center justify-center rounded-full">
                  <Compass className="h-5 w-5 text-accent" aria-hidden="true" />
                </div>
                <div>
                  <Heading as="h3" className="text-lg">
                    {destination.name}
                  </Heading>
                  <Caption className="mt-0.5 block">
                    {destination.region}
                  </Caption>
                </div>
                <Paragraph className="text-sm text-text-secondary">
                  {destination.description}
                </Paragraph>
              </Card>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
