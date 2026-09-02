"use client";

import { useTranslations } from "next-intl";
import { Heading, Paragraph } from "@/components/ui/typography";
import { GlassCard } from "@/components/ui/glass";
import { buttonVariants } from "@/components/ui/button";
import { GuestEntryCta } from "@/components/landing/guest-entry-cta";
import { cn } from "@/lib/utils/cn";

/**
 * ATLAS-P1-LAND-01 — CTASection.
 *
 * APPLICATION_LAYOUT_GUIDE.md §Marketing Layout: "...Content Sections
 * ↓ CTA ↓ Footer" — the dedicated closing call-to-action slot, distinct
 * from Hero's opening one but pointing at the same action
 * (COPYWRITING_GUIDELINES.md consistency rule: reuse the same verb/
 * label for the same action everywhere, never a synonym). The primary
 * action is a real same-page anchor (`href="#ai-search"`, `<a>` styled
 * with `Button`'s own `buttonVariants` — Button itself never renders
 * as a link, per its own file comment) rather than a JS-only handler,
 * so it still works with JavaScript disabled.
 *
 * "use client" is required here, confirmed the hard way: `button.tsx`
 * is itself a "use client" module (`Button` calls
 * `useReducedMotion()`), and Next.js's RSC boundary forbids a Server
 * Component from *calling* any export of a "use client" file as a
 * plain function — `buttonVariants()` typechecks and even survives
 * `next build`, but crashes with a real 500 at request time ("Attempted
 * to call buttonVariants() from the server"), caught only by actually
 * starting the standalone server and requesting the page, not by
 * typecheck/lint/build. `Navbar` (also "use client") already carries
 * this exact same constraint for its own Login/Get Started links.
 * `GuestEntryCta` (LAND-03) is reused rather than re-implemented — the
 * same low-pressure guest path offered in the Hero.
 */
export function CTASection() {
  const t = useTranslations("HomePage.cta");

  return (
    <section className="px-4 py-16 md:px-6 md:py-20 lg:px-8">
      <div className="mx-auto max-w-[1440px]">
        <GlassCard
          level={4}
          radius="3xl"
          className="flex flex-col items-center gap-6 px-6 py-14 text-center md:px-12"
        >
          <Heading as="h2">{t("title")}</Heading>
          <Paragraph size="lg" className="max-w-[520px] text-text-secondary">
            {t("subtitle")}
          </Paragraph>

          <a
            href="#ai-search"
            className={cn(buttonVariants({ variant: "primary" }), "mt-2")}
          >
            {t("primaryCta")}
          </a>

          <GuestEntryCta />
        </GlassCard>
      </div>
    </section>
  );
}
