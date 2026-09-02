import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import { Heading, Paragraph } from "@/components/ui/typography";

/**
 * ATLAS-P1-LAND-01 — FAQSection (nav target: #faq).
 *
 * Native `<details>/<summary>` rather than a new
 * `@radix-ui/react-accordion` dependency (confirmed not currently
 * installed — `package.json` has every other Radix primitive this
 * codebase uses, but not that one): natively keyboard-operable, native
 * focus management, and no bundle/dependency-approval cost for a
 * four-item disclosure list. Consistent with this session's other
 * deliberate no-new-dependency calls (AnimatedBackground/HeroSection).
 *
 * Every answer is a plain, checkable statement of current product
 * scope (guest mode, the three implemented locales, memory control,
 * and MVP's explicit non-goal of direct booking — PRD.md §12) rather
 * than a promotional claim, so nothing here needs to be revisited as
 * "marketing copy that overpromises" once later phases ship.
 */
export function FAQSection() {
  const t = useTranslations("HomePage.faq");
  const items = t.raw("items") as { question: string; answer: string }[];

  return (
    <section id="faq" className="px-4 py-16 md:px-6 md:py-20 lg:px-8">
      <div className="mx-auto max-w-[720px]">
        <Heading as="h2" className="text-center">
          {t("title")}
        </Heading>

        <div className="mt-10 divide-y divide-divider border-y border-divider">
          {items.map((item) => (
            <details key={item.question} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-start font-semibold text-text-primary marker:content-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm">
                {item.question}
                <ChevronDown
                  className="h-5 w-5 shrink-0 text-text-muted transition-transform duration-200 group-open:rotate-180"
                  aria-hidden="true"
                />
              </summary>
              <Paragraph className="mt-3 text-text-secondary">
                {item.answer}
              </Paragraph>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
