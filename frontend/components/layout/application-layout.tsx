import type { ReactNode } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { Footer } from "@/components/layout/footer";

export interface ApplicationLayoutProps {
  children: ReactNode;
  /**
   * 26 §Application Layout grid: "Panel 360px" — the AI Assistant
   * panel on Trip Details/Dashboard etc. (17_AI_EXPERIENCE.md §AI
   * Assistant Panel: "Desktop: Persistent side panel"). Optional
   * because not every Application-layout page has one; owned and
   * populated by whichever Feature task needs it (CHAT/DASH/TRIPDET),
   * not built here.
   */
  panel?: ReactNode;
  isAuthenticated?: boolean;
  userSlot?: ReactNode;
  notificationsSlot?: ReactNode;
}

/**
 * 26_APPLICATION_LAYOUT_GUIDE.md §Application Layout:
 *   Header ↓ Sidebar ↓ Main Content ↓ Optional Right Panel
 *   Grid: Sidebar 300px (DESIGN_TOKENS.md Part 6 contract — see
 *   sidebar.tsx's own note on the 280px/300px documentation conflict)
 *   / Main Flexible / Panel 360px
 *
 * Mobile: Sidebar and the desktop right panel both hide; MobileBottomNav
 * takes over as primary navigation (26 §Mobile Navigation), and content
 * gets bottom padding so the fixed bar never covers it.
 */
export function ApplicationLayout({
  children,
  panel,
  isAuthenticated = true,
  userSlot,
  notificationsSlot,
}: ApplicationLayoutProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <Navbar
        variant="app"
        isAuthenticated={isAuthenticated}
        userSlot={userSlot}
        notificationsSlot={notificationsSlot}
      />

      <div className="flex flex-1">
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <main
            id="main-content"
            className="flex-1 pb-20 lg:pb-0"
          >
            {children}
          </main>
          <div className="hidden lg:block">
            <Footer variant="minimal" />
          </div>
        </div>

        {panel ? (
          <aside
            aria-label="Assistant"
            className="atlas-glass-2 sticky top-[72px] hidden h-[calc(100dvh-72px)] w-[360px] shrink-0 overflow-y-auto border-s p-6 xl:block"
          >
            {panel}
          </aside>
        ) : null}
      </div>

      <MobileBottomNav />
    </div>
  );
}
