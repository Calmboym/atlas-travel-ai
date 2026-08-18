"use client";

import { useCallback, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils/cn";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { APP_NAV_ITEMS } from "@/components/layout/nav-items";

const STORAGE_KEY = "atlas-sidebar-collapsed";
/** Same-tab change signal, same technique as theme-provider.tsx's own
 *  LOCAL_CHANGE_EVENT — the native `storage` event only fires in
 *  *other* tabs, never the one that made the write. */
const LOCAL_CHANGE_EVENT = "atlas-sidebar-local-change";

function getCollapsed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function getServerCollapsed(): boolean {
  return false;
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(LOCAL_CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(LOCAL_CHANGE_EVENT, callback);
  };
}

/**
 * DESIGN_TOKENS.md Part 6 §Sidebar Contract: Width 300px, Collapsed
 * Width 88px, Glass Level 2, Item Radius 16px, Section Gap space-8.
 *
 * APPLICATION_LAYOUT_GUIDE.md's own §Sidebar Behavior separately gives
 * 280px / 80px for the same two measurements — a real, documented
 * numeric conflict between two locked documents. Followed the Design
 * Tokens Part 6 component contract here (the doc DESIGN_TOKENS.md
 * itself identifies as the definitive per-component visual source,
 * and the more specific of the two), and logged this as a finding —
 * not silently reconciled, per MASTER_RULES.md's conflict-reporting
 * requirement. See the DESIGNSYS-03 report for the full note.
 */
const EXPANDED_WIDTH = "18.75rem"; // 300px
const COLLAPSED_WIDTH = "5.5rem"; // 88px

export function Sidebar() {
  const t = useTranslations("Navigation");
  const pathname = usePathname();

  // "Remembers state" (26 §Sidebar Behavior). useSyncExternalStore
  // rather than useState+useEffect — same reasoning and same pattern
  // as components/providers/theme-provider.tsx's own persisted
  // setting: this is browser-only state (localStorage) the server
  // can't know about, which is exactly the case this hook exists for.
  // It resolves the earlier useEffect+setState approach's
  // react-hooks/set-state-in-effect violation at the root rather than
  // suppressing the lint rule, and avoids a manual "hydrated" flag —
  // getServerSnapshot ("expanded") already IS the correct first-paint
  // value on both server and client, with no separate transition
  // needed once the real value syncs in.
  const collapsed = useSyncExternalStore(
    subscribe,
    getCollapsed,
    getServerCollapsed,
  );

  const toggle = useCallback(() => {
    const next = !collapsed;
    try {
      localStorage.setItem(STORAGE_KEY, String(next));
    } catch {
      // Storage can throw (private browsing, quota) — the dispatch
      // below still updates the UI for the current session even if
      // persistence failed.
    }
    window.dispatchEvent(new Event(LOCAL_CHANGE_EVENT));
  }, [collapsed]);

  return (
    <>
      <aside
        aria-label="Primary"
        style={{ width: collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH }}
        className="atlas-glass-2 sticky top-16 hidden h-[calc(100dvh-4rem)] flex-col gap-8 overflow-y-auto border-e p-4 transition-[width] duration-200 ease-out lg:flex lg:top-[72px] lg:h-[calc(100dvh-72px)]"
      >
        <nav
          aria-label="Sections"
          className="flex flex-1 flex-col gap-1"
        >
          {APP_NAV_ITEMS.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            const link = (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  collapsed && "justify-center px-0",
                  active
                    ? "bg-primary-tint text-primary"
                    : "text-text-secondary hover:bg-surface-secondary hover:text-text-primary",
                )}
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span className={cn(collapsed && "sr-only")}>
                  {t(item.labelKey)}
                </span>
              </Link>
            );

            if (!collapsed) return link;

            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>{link}</TooltipTrigger>
                {/* Radix's Popper `side` is physical (top/right/
                    bottom/left), not logical — it doesn't auto-flip
                    for RTL without a DirectionProvider, which isn't
                    wired up anywhere in the app. Fixed to "right"
                    (correct for the sidebar's collapse direction in
                    en/de). In fa, the tooltip will visually pop out
                    on the physically-wrong side of the collapsed
                    icon — a real, known, minor RTL cosmetic gap,
                    logged here rather than silently left unexplained.
                    Wiring @radix-ui/react-direction app-wide to fix
                    one tooltip's placement is disproportionate scope
                    for this task; noted for a future pass. */}
                <TooltipContent side="right">{t(item.labelKey)}</TooltipContent>
              </Tooltip>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={toggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={cn(
            "flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-secondary hover:text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            collapsed && "justify-center px-0",
          )}
        >
          {collapsed ? (
            <ChevronsRight className="h-5 w-5 shrink-0" aria-hidden="true" />
          ) : (
            <>
              <ChevronsLeft className="h-5 w-5 shrink-0" aria-hidden="true" />
              Collapse
            </>
          )}
        </button>
      </aside>
    </>
  );
}

// Sidebar is the first real consumer of Tooltip in a rendered page.
// DESIGNSYS-02 built Tooltip/TooltipProvider but never mounted the
// Provider anywhere in the app (confirmed: it previously only
// appeared inside its own isolated component test). Fixed by also
// mounting TooltipProvider once in the root layout
// (app/[locale]/layout.tsx) alongside ThemeProvider, matching that
// file's own "wrap the app once" convention — a real, pre-existing
// gap found and fixed, not new DESIGNSYS-03 scope.
