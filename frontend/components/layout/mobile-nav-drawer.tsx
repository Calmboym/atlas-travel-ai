"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils/cn";
import { buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  APP_NAV_ITEMS,
  MARKETING_NAV_ITEMS,
} from "@/components/layout/nav-items";

export interface MobileNavDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant: "marketing" | "app";
  isAuthenticated?: boolean;
}

/**
 * The collapsible-menu half of mobile navigation (26 §Mobile
 * Navigation: "Bottom Navigation + Collapsible Menu"). MobileBottomNav
 * covers the persistent 5-item bar; this covers the fuller item list
 * (mirrors Sidebar's set on app pages, or the marketing nav on guest
 * pages) plus guest sign-in/register, in a Sheet triggered from
 * Navbar's hamburger button.
 */
export function MobileNavDrawer({
  open,
  onOpenChange,
  variant,
  isAuthenticated = false,
}: MobileNavDrawerProps) {
  const t = useTranslations("Navigation");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        title="Menu"
        className="max-h-[85dvh] overflow-y-auto lg:hidden"
      >
        {variant === "app" ? (
          <nav aria-label="Main" className="grid grid-cols-2 gap-2">
            {APP_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col items-start gap-2 rounded-2xl border border-border p-4 text-sm font-medium text-text-primary transition-colors hover:bg-surface-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <Icon className="h-5 w-5 text-text-secondary" aria-hidden="true" />
                  {t(item.labelKey)}
                </Link>
              );
            })}
          </nav>
        ) : (
          <nav aria-label="Main" className="flex flex-col gap-1">
            {MARKETING_NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-2xl px-4 py-3 text-base font-medium text-text-primary transition-colors hover:bg-surface-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {t(item.labelKey)}
              </a>
            ))}
          </nav>
        )}

        {variant === "marketing" && !isAuthenticated && (
          <div className="mt-6 flex flex-col gap-2 border-t border-border pt-6">
            <Link
              href="/login"
              className={cn(buttonVariants({ variant: "secondary" }), "w-full")}
            >
              {t("logIn")}
            </Link>
            <Link
              href="/register"
              className={cn(buttonVariants({ variant: "primary" }), "w-full")}
            >
              {t("getStarted")}
            </Link>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
