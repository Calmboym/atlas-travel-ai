import type { ReactNode } from "react";
import { ApplicationLayout } from "@/components/layout/application-layout";
import { ProfileMenu } from "@/components/layout/profile-menu";
import { NotificationCenter } from "@/components/layout/notification-center";

/**
 * Wires the DESIGNSYS-03 Application shell (Navbar + Sidebar +
 * MobileBottomNav + minimal Footer) to every route placed under
 * app/[locale]/(app)/ — 26_APPLICATION_LAYOUT_GUIDE.md §Application
 * Layout, used by Dashboard/Trips/Chat/Profile/Settings.
 *
 * EXTENDED — ATLAS-P1-DASH-01: `userSlot`/`notificationsSlot` now
 * render real components. DESIGNSYS-03 deliberately left both unset
 * (see this file's own prior note, preserved in git history) because
 * ProfileMenu/NotificationCenter are owned by "PROF-03 or DASH-01,
 * whichever ships first" per COMPONENT_OWNERSHIP_MATRIX.md §4 —
 * PROF-03 explicitly declined (see profile-page-content.tsx's own
 * docstring: it would need to link to routes, like /dashboard, that
 * didn't exist yet), so DASH-01 is that "whichever." Every other
 * (app) page (Chat, Profile, and any future Trips/Settings page)
 * inherits the same filled header automatically, with zero additional
 * wiring, from this one shared layout — that's the whole point of
 * these props living on ApplicationLayout rather than on each page.
 *
 * `isAuthenticated` still stays at its default (`true`) — real
 * per-request session detection remains a separate, undone concern
 * (this file's own prior note on that point is unchanged).
 */
export default function AppRouteLayout({ children }: { children: ReactNode }) {
  return (
    <ApplicationLayout
      userSlot={<ProfileMenu />}
      notificationsSlot={<NotificationCenter />}
    >
      {children}
    </ApplicationLayout>
  );
}
