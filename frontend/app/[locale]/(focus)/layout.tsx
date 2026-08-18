import type { ReactNode } from "react";
import { FocusLayout } from "@/components/layout/focus-layout";

/**
 * Wires FocusLayout to future routes under app/[locale]/(focus)/ —
 * 26_APPLICATION_LAYOUT_GUIDE.md §Focus Layout, used by New Trip /
 * Trip Planning (Phase 2, TRIPPLAN module — not yet elaborated to
 * Task level in WORK_BREAKDOWN_STRUCTURE.md).
 *
 * No page.tsx here for the same reason as (app)/layout.tsx: the real
 * Trip Planning workspace needs Phase 2's Core Agents to generate
 * anything genuine, so a placeholder page would be fake content, not
 * infrastructure. This file is the complete, real DESIGNSYS-03
 * deliverable: TRIPPLAN's first task inherits FocusLayout by simply
 * adding a page here.
 */
export default function FocusRouteLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <FocusLayout>{children}</FocusLayout>;
}
