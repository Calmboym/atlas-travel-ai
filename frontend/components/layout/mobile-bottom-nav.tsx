"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils/cn";
import { MOBILE_BOTTOM_NAV_ITEMS } from "@/components/layout/nav-items";

/**
 * DESIGN_TOKENS.md Part 6 gives an explicit contract for "Navigation
 * Bar" (Glass Level 1) and "Sidebar" (Glass Level 2) but no separate
 * entry for the mobile bottom bar specifically. Reuses Glass Level 1 —
 * the same persistent-chrome role as the top Navbar, just anchored to
 * the opposite edge — rather than inventing an undocumented fifth
 * treatment.
 */
export function MobileBottomNav() {
  const t = useTranslations("Navigation");
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className="atlas-glass-1 fixed inset-x-0 bottom-0 z-sticky flex items-stretch justify-around border-t pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      {MOBILE_BOTTOM_NAV_ITEMS.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-h-[56px] min-w-[44px] flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset",
              active ? "text-primary" : "text-text-muted hover:text-text-secondary",
            )}
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
            {t(item.labelKey)}
          </Link>
        );
      })}
    </nav>
  );
}
