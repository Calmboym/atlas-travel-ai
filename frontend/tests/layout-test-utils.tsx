import type { ReactElement } from "react";
import { render } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { MotionProvider } from "@/components/providers/motion-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import enMessages from "@/messages/en.json";

/**
 * Renders `ui` wrapped exactly the way app/[locale]/layout.tsx wraps
 * every real page: ThemeProvider > MotionProvider >
 * NextIntlClientProvider > TooltipProvider
 * (INFRASTRUCTURE_BASELINE.md §3's documented provider nesting order).
 * Components under test that call useTranslations/useLocale/useTheme,
 * that render a Tooltip (Sidebar's collapsed-state labels), or that
 * use the FadeIn/SlideIn/ScaleIn/ScrollReveal motion wrappers (which
 * read MotionProvider's reduced-motion context), need this rather than
 * plain RTL `render`.
 *
 * MotionProvider addition (ATLAS-P1-LAND-01): missing until this task
 * — confirmed by checking every existing consumer of this helper,
 * none of which render a motion-wrapper component, so the gap had
 * never surfaced as a failure. Purely additive: MotionProvider renders
 * no DOM of its own (just supplies context via MotionConfig), so this
 * cannot change any existing test's output.
 */
export function renderWithProviders(
  ui: ReactElement,
  { locale = "en" }: { locale?: string } = {},
) {
  return render(
    <ThemeProvider>
      <MotionProvider>
        <NextIntlClientProvider locale={locale} messages={enMessages}>
          <TooltipProvider>{ui}</TooltipProvider>
        </NextIntlClientProvider>
      </MotionProvider>
    </ThemeProvider>,
  );
}
