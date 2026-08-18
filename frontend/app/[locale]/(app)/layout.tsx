import type { ReactNode } from "react";
import { ApplicationLayout } from "@/components/layout/application-layout";

/**
 * Wires the DESIGNSYS-03 Application shell (Navbar + Sidebar +
 * MobileBottomNav + minimal Footer) to every route placed under
 * app/[locale]/(app)/ — 26_APPLICATION_LAYOUT_GUIDE.md §Application
 * Layout, used by Dashboard/Trips/Chat/Profile/Settings.
 *
 * Deliberately no page.tsx exists in this route group yet: there is
 * no real authenticated session/user data to render a genuine
 * Dashboard, Trips list, etc., and building placeholder feature
 * content here would be exactly the "arbitrary placeholder UI" this
 * task is instructed to avoid, and would also cross into DASH-01/
 * CHAT-01/PROF-03's ownership. This file is real, complete DESIGNSYS-03
 * infrastructure on its own: the next task that adds a page here
 * (e.g. app/[locale]/(app)/dashboard/page.tsx) inherits the correct
 * layout automatically, with zero additional wiring.
 *
 * `isAuthenticated` intentionally stays at its default (`true`, i.e.
 * the shell renders "there is a signed-in user" chrome rather than
 * guest CTAs) — real session detection is AUTH-07's job. `userSlot`/
 * `notificationsSlot` are left unset: ProfileMenu/NotificationCenter
 * are owned by PROF-03/DASH-01 per COMPONENT_OWNERSHIP_MATRIX.md, not
 * DESIGNSYS-03 — see the DESIGNSYS-03 report for this exact scope
 * boundary.
 */
export default function AppRouteLayout({ children }: { children: ReactNode }) {
  return <ApplicationLayout>{children}</ApplicationLayout>;
}
