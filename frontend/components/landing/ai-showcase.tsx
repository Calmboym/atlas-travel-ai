import { useTranslations } from "next-intl";
import { Sparkles } from "lucide-react";
import { Heading, Paragraph, Caption } from "@/components/ui/typography";
import { GlassCard } from "@/components/ui/glass";
import { ScaleIn } from "@/components/ui/motion-wrappers";

/**
 * ATLAS-P1-LAND-01 — AIShowcase (nav target: #ai-assistant).
 *
 * A single illustrative exchange, explicitly labeled as an example
 * (`t("exampleLabel")`) rather than presented as a real captured
 * session or user testimonial — BRAND_GUIDELINES.md §13: "Never
 * fabricates reviews." This isn't a review; it's a worked example of
 * the response shape AI_EXPERIENCE.md §AI Response Structure requires
 * ("Direct answer ↓ Supporting explanation ↓ ...Suggested next
 * action"), the same way a docs site shows example output without
 * claiming it's a real user's data.
 *
 * The two bubble-style `div`s here are local, presentational-only
 * markup for this one static example — not a preview of, substitute
 * for, or early implementation of the real `MessageBubble`/
 * `UserBubble`/`AssistantBubble` Feature Components, which belong to
 * CHAT-01/02 and must not be pre-built here
 * (COMPONENT_OWNERSHIP_MATRIX.md §6: "Feature Components must not
 * exist before their owning WBS Task starts").
 */
export function AIShowcase() {
  const t = useTranslations("HomePage.aiShowcase");

  return (
    <section
      id="ai-assistant"
      className="bg-surface-secondary px-4 py-16 md:px-6 md:py-20 lg:px-8"
    >
      <div className="mx-auto grid max-w-[1440px] items-center gap-10 lg:grid-cols-2">
        <div className="mx-auto max-w-[480px] text-center lg:mx-0 lg:text-start">
          <Heading as="h2">{t("title")}</Heading>
          <Paragraph className="mt-3 text-text-secondary">
            {t("subtitle")}
          </Paragraph>
        </div>

        <ScaleIn className="mx-auto w-full max-w-[480px]">
          <GlassCard level={3} radius="3xl" className="flex flex-col gap-4">
            <Caption className="text-start">{t("exampleLabel")}</Caption>

            <div className="ms-auto max-w-[85%] rounded-2xl bg-primary px-4 py-3 text-start text-sm text-on-primary">
              {t("exampleQuestion")}
            </div>

            <div className="flex max-w-[85%] items-start gap-2 text-start">
              <div className="atlas-glass-1 mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full">
                <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              </div>
              <div className="rounded-2xl bg-surface px-4 py-3 text-sm text-text-primary">
                {t("exampleAnswer")}
              </div>
            </div>
          </GlassCard>
        </ScaleIn>
      </div>
    </section>
  );
}
