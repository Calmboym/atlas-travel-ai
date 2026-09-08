import type { LucideIcon } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

/**
 * ATLAS-P1-DASH-01 — Shared QuickActions
 * (COMPONENT_OWNERSHIP_MATRIX.md §4: "QuickActions | DASH-01 | DASH,
 * any page with a FAB"). 18_DASHBOARD_EXPERIENCE.md §Quick Actions:
 * "Floating Quick Actions may include: New Trip, Continue Chat, Open
 * Timeline, Documents, Settings. Actions remain minimal." Rendered
 * here as an inline action row rather than a floating action button —
 * FloatingActionButton is a separate Foundation primitive
 * (DESIGNSYS-02) a future task can wrap this list with if a floating
 * placement is wanted elsewhere; this component only owns the list of
 * actions and their rendering, not their container.
 *
 * Deliberately data-driven and copy-free: every label, href, and icon
 * is supplied by the caller (same pattern as EmptyState/ErrorState —
 * see components/ui/state.tsx — neither of which import
 * useTranslations themselves). Keeps this genuinely reusable — a
 * future consumer isn't tied to Dashboard's own translation
 * namespace or action set.
 */
export interface QuickAction {
  key: string;
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface QuickActionsProps {
  /** Accessible label for the containing <nav> — describes the group,
   *  not any single action. */
  label: string;
  actions: readonly QuickAction[];
  className?: string;
}

export function QuickActions({ label, actions, className }: QuickActionsProps) {
  if (actions.length === 0) return null;

  return (
    <nav aria-label={label} className={cn("flex flex-wrap gap-3", className)}>
      {actions.map((action) => (
        <Link
          key={action.key}
          href={action.href}
          className={cn(buttonVariants({ variant: "secondary" }), "gap-2")}
        >
          <action.icon className="h-4 w-4" aria-hidden="true" />
          {action.label}
        </Link>
      ))}
    </nav>
  );
}
