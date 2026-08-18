import type { ReactElement } from "react";
import { render } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import enMessages from "@/messages/en.json";

/**
 * Renders `ui` wrapped exactly the way app/[locale]/layout.tsx wraps
 * every real page: ThemeProvider > NextIntlClientProvider >
 * TooltipProvider. Components under test that call
 * useTranslations/useLocale/useTheme, or that render a Tooltip
 * (Sidebar's collapsed-state labels), need this rather than plain RTL
 * `render`.
 */
export function renderWithProviders(
  ui: ReactElement,
  { locale = "en" }: { locale?: string } = {},
) {
  return render(
    <ThemeProvider>
      <NextIntlClientProvider locale={locale} messages={enMessages}>
        <TooltipProvider>{ui}</TooltipProvider>
      </NextIntlClientProvider>
    </ThemeProvider>,
  );
}
