"use client";

import { useLocale } from "next-intl";
import { Languages } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils/cn";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";

/**
 * DESIGN_BIBLE / 26 §Language Switcher: "Supports: English, فارسی,
 * Deutsch. Future-ready. RTL automatically applied." Names, never
 * flags — 13_ICONOGRAPHY_AND_ILLUSTRATION.md §Flags: "Avoid using
 * flags to represent languages. Use language names instead."
 *
 * Each language's own label is written in that language (native-name
 * convention — a Persian speaker recognizes "فارسی" faster than
 * "Persian"), matching how the doc itself writes the three names.
 */
const LOCALE_LABELS: Record<AppLocale, string> = {
  en: "English",
  fa: "فارسی",
  de: "Deutsch",
};

export function LanguageSwitcher() {
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();
  const router = useRouter();

  function switchTo(next: AppLocale) {
    if (next === locale) return;
    // Preserves the current path (USER_FLOWS.md Flow 15: "Switch
    // Language ↓ Stay On Same Page ↓ Preserve Context").
    router.replace(pathname, { locale: next });
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Language: ${LOCALE_LABELS[locale]}. Open language menu.`}
          className="inline-flex h-11 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-secondary hover:text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <Languages className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">{LOCALE_LABELS[locale]}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-40 !p-1.5"
        role="menu"
        aria-label="Language"
      >
        {routing.locales.map((code) => {
          const active = code === locale;
          return (
            <button
              key={code}
              type="button"
              role="menuitemradio"
              aria-checked={active}
              onClick={() => switchTo(code)}
              className={cn(
                "flex w-full items-center rounded-xl px-3 py-2.5 text-start text-sm font-medium transition-colors hover:bg-surface-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                active ? "text-primary" : "text-text-primary",
              )}
            >
              {LOCALE_LABELS[code]}
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}
