import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { ThemeSwitcher } from "@/components/layout/theme-switcher";
import { LanguageSwitcher } from "@/components/layout/language-switcher";

export interface FocusLayoutProps {
  children: ReactNode;
  /** 26 §Focus Layout: "AI Panel" — the planning conversation, kept
   *  visible alongside the workspace rather than in a separate route
   *  (19_TRIP_PLANNING_EXPERIENCE.md: "AI remains visible"). */
  aiPanel?: ReactNode;
  /** Where the header's exit action returns to — TRIPPLAN's own page
   *  decides this (e.g. back to Dashboard); defaults to Dashboard. */
  exitHref?: string;
  /** e.g. "Saving…" / "Saved" (19_TRIP_PLANNING_EXPERIENCE.md
   *  §Saving Plans: "Status indicator: Saving... / Saved ..."). */
  statusSlot?: ReactNode;
}

/**
 * 26_APPLICATION_LAYOUT_GUIDE.md §Focus Layout:
 *   Header ↓ Planning Workspace ↓ AI Panel
 *   Purpose: Remove distractions.
 *
 * Deliberately excludes: Sidebar, the full app Navbar, Footer — this
 * is the one layout explicitly meant to have less chrome than
 * ApplicationLayout, not a variant of it. Theme/Language remain
 * (removing distraction is not the same as removing basic controls),
 * but there is no primary-nav link set at all.
 */
export function FocusLayout({
  children,
  aiPanel,
  exitHref = "/dashboard",
  statusSlot,
}: FocusLayoutProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="flex h-16 items-center justify-between border-b border-border px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <Link
            href={exitHref}
            aria-label="Exit and return to Dashboard"
            className="rounded-lg text-lg font-bold tracking-tight text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Atlas
          </Link>
          {statusSlot ? (
            <span className="text-sm text-text-muted">{statusSlot}</span>
          ) : null}
        </div>

        <div className="flex items-center gap-1">
          <LanguageSwitcher />
          <ThemeSwitcher />
        </div>
      </header>

      <div className="flex flex-1 flex-col lg:flex-row">
        <main id="main-content" className="min-w-0 flex-1 overflow-y-auto">
          {children}
        </main>

        {aiPanel ? (
          <aside
            aria-label="Assistant"
            className="atlas-glass-2 flex h-[50dvh] w-full flex-col overflow-y-auto border-t p-6 lg:h-[calc(100dvh-4rem)] lg:w-[420px] lg:border-s lg:border-t-0"
          >
            {aiPanel}
          </aside>
        ) : null}
      </div>
    </div>
  );
}
