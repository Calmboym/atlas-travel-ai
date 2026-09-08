import type { ReactNode } from "react";
import { Heading } from "@/components/ui/typography";
import { EmptyState } from "@/components/ui/state";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";

/**
 * ATLAS-P1-DASH-01 — thin Dashboard-owned wrapper around the
 * Foundation EmptyState for sections that are honestly empty in
 * Phase 1 (Recent Trips, Recommendations — both require Trip Service
 * / Recommendation Agent data that doesn't exist until Phase 2+).
 * CONTENT_STRATEGY.md §Empty States: "Never dead ends" — `actionHref`
 * is optional because not every empty section has a meaningful next
 * step of its own (Recommendations genuinely has none yet; Trips'
 * is "go start one," the same /chat entry point used everywhere
 * else on this page).
 */
export interface DashboardEmptySectionProps {
  title: string;
  icon?: ReactNode;
  emptyTitle: string;
  emptyDescription: string;
  actionHref?: string;
  actionLabel?: string;
}

export function DashboardEmptySection({
  title,
  icon,
  emptyTitle,
  emptyDescription,
  actionHref,
  actionLabel,
}: DashboardEmptySectionProps) {
  const action =
    actionHref && actionLabel ? (
      <Link href={actionHref} className={buttonVariants({ variant: "secondary" })}>
        {actionLabel}
      </Link>
    ) : undefined;

  return (
    <section aria-label={title}>
      <Heading as="h2" className="text-lg">
        {title}
      </Heading>
      <div className="atlas-glass-1 mt-4 rounded-2xl">
        <EmptyState
          icon={icon}
          title={emptyTitle}
          description={emptyDescription}
          action={action}
        />
      </div>
    </section>
  );
}
