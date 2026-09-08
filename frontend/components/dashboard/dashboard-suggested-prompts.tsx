"use client";

import { useId } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Heading } from "@/components/ui/typography";

/**
 * ATLAS-P1-DASH-01 — 18_DASHBOARD_EXPERIENCE.md §Empty Dashboard:
 * "First-time users see: ... Example prompts ..." Only rendered
 * alongside the Welcome (no-conversation) hero state — once a real
 * conversation exists, "Continue conversation" is the relevant next
 * action, not a fresh set of starter prompts.
 *
 * Same `/chat?prompt=<text>` navigation contract LAND-02's AISearchBox
 * already established (components/landing/ai-search-box.tsx) — a
 * real, working link, not a stub. Prompt copy is Dashboard's own (this
 * task's Feature Component, per COMPONENT_OWNERSHIP_MATRIX.md §6 —
 * not imported from LAND's or CHAT's own example lists), drawn from
 * the same canonical example set TRIP_PLANNING_EXPERIENCE.md §Step 1
 * defines.
 */
export function DashboardSuggestedPrompts() {
  const t = useTranslations("Dashboard.suggestedPrompts");
  const headingId = useId();
  const prompts = t.raw("prompts") as string[];

  return (
    <section aria-labelledby={headingId}>
      <Heading as="h2" id={headingId} className="text-lg">
        {t("title")}
      </Heading>
      <ul className="mt-4 flex flex-wrap gap-2">
        {prompts.map((prompt) => (
          <li key={prompt}>
            <Link
              href={`/chat?prompt=${encodeURIComponent(prompt)}`}
              className="atlas-glass-1 inline-flex items-center rounded-full px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-surface-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {prompt}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
