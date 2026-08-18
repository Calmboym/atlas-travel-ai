"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Menu, Sparkles } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils/cn";
import { buttonVariants } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/layout/theme-switcher";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { MobileNavDrawer } from "@/components/layout/mobile-nav-drawer";
import {
  APP_HEADER_NAV_ITEMS,
  MARKETING_NAV_ITEMS,
} from "@/components/layout/nav-items";

export interface NavbarProps {
  /**
   * "marketing" = guest-facing header (26 §Header Navigation: Home,
   * Discover, AI Assistant, Features, FAQ; transparent-on-hero, solid
   * after scroll). "app" = authenticated header (Dashboard, Trips, AI
   * Chat, Saved; always solid — 26 §Header Behavior: "Application
   * pages: Always solid.").
   */
  variant: "marketing" | "app";
  /**
   * Whether a signed-in user is present. Guest state shows Log in /
   * Get started. Authenticated state shows an avatar slot for
   * ProfileMenu — that component itself is owned by PROF-03/DASH-01
   * per COMPONENT_OWNERSHIP_MATRIX.md, not built here; `userSlot` lets
   * whichever task builds it drop it in without editing this file.
   */
  isAuthenticated?: boolean;
  userSlot?: React.ReactNode;
  notificationsSlot?: React.ReactNode;
}

/** 26 §Header Behavior: "Height: 80px / Mobile: 64px" is Layout Guide's
 *  own generic header note; the component-level contract in
 *  DESIGN_TOKENS.md Part 6 §Navigation Bar gives 72px specifically for
 *  the app/marketing Navbar. Both docs are locked — this follows the
 *  more specific, component-contract-level source (Design Tokens Part
 *  6), consistent with how DESIGNSYS-01 already resolved the same kind
 *  of two-source conflict for Sidebar width (see sidebar.tsx). Logged
 *  as a documentation finding, not silently reconciled. */
const HEADER_HEIGHT = "h-16 lg:h-[72px]";

export function Navbar({
  variant,
  isAuthenticated = false,
  userSlot,
  notificationsSlot,
}: NavbarProps) {
  const t = useTranslations("Navigation");
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Close the mobile drawer automatically on route change so it never
  // stays open behind a new page — a common, easy-to-miss drawer bug.
  // Deliberately NOT a useEffect: setState synchronously inside an
  // effect for "reset state when a value changes" causes an extra
  // render pass (react-hooks/set-state-in-effect). This is React's
  // own documented alternative for exactly this case — comparing
  // against the previous render's value and adjusting state during
  // render itself (react.dev "You Might Not Need An Effect" →
  // "Adjusting state based on a prop change").
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setMobileOpen(false);
  }

  // Marketing-only: transparent over the hero, solid glass once the
  // user scrolls past it (26 §Header Behavior). App headers are
  // always solid, so this effect is a no-op there.
  useEffect(() => {
    if (variant !== "marketing") return;
    function onScroll() {
      setScrolled(window.scrollY > 24);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [variant]);

  // Close the mobile drawer automatically on route change so it never
  // stays open behind a new page (a common, easy-to-miss drawer bug).

  const isSolid = variant === "app" || scrolled;
  const headerNavItems =
    variant === "app" ? APP_HEADER_NAV_ITEMS : undefined;

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-sticky flex items-center justify-between px-4 transition-colors duration-200 sm:px-6 lg:px-8",
          HEADER_HEIGHT,
          isSolid
            ? "atlas-glass-1 border-b"
            : "border-b border-transparent bg-transparent",
        )}
      >
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="rounded-lg text-lg font-bold tracking-tight text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Atlas
          </Link>

          {variant === "marketing" ? (
            <nav
              aria-label="Main"
              className="hidden items-center gap-6 lg:flex"
            >
              {MARKETING_NAV_ITEMS.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="rounded-lg text-sm font-medium text-text-secondary transition-colors hover:text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  {t(item.labelKey)}
                </a>
              ))}
            </nav>
          ) : (
            <nav
              aria-label="Main"
              className="hidden items-center gap-6 lg:flex"
            >
              {headerNavItems?.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-lg text-sm font-medium text-text-secondary transition-colors hover:text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  {t(item.labelKey)}
                </Link>
              ))}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <LanguageSwitcher />
          <ThemeSwitcher />
          {notificationsSlot}

          {variant === "marketing" && !isAuthenticated && (
            <div className="ms-2 hidden items-center gap-2 sm:flex">
              <Link href="/login" className={buttonVariants({ variant: "ghost" })}>
                {t("logIn")}
              </Link>
              <Link
                href="/register"
                className={buttonVariants({ variant: "primary" })}
              >
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                {t("getStarted")}
              </Link>
            </div>
          )}

          {isAuthenticated && userSlot}

          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-text-secondary hover:bg-surface-secondary hover:text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 lg:hidden"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </header>

      <MobileNavDrawer
        open={mobileOpen}
        onOpenChange={setMobileOpen}
        variant={variant}
        isAuthenticated={isAuthenticated}
      />
    </>
  );
}
