"use client";

import { useTranslations } from "next-intl";
import { Bell } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { EmptyState } from "@/components/ui/state";

/**
 * ATLAS-P1-DASH-01 — NotificationCenter
 * (COMPONENT_OWNERSHIP_MATRIX.md §4: "NotificationCenter | DASH-01 |
 * DASH-01 | Global header, DASH"). Fills Navbar's `notificationsSlot`
 * (via app/[locale]/(app)/layout.tsx).
 *
 * No real notification data source exists yet — the NOTIF module
 * (23_NOTIFICATION_COMMUNICATION_EXPERIENCE.md) is Phase 3+ backlog,
 * since it needs real events (flight delays, weather) to notify on
 * (INDEX.md's own NOTIF entry: "needs real events to notify on").
 * Rather than fabricate sample notifications or leave the bell inert,
 * this ships the real, honest empty state the doc itself specifies —
 * 23 §Empty Notification Center: "Display: Illustration, Message:
 * 'You're all caught up.'" — ready for a future NOTIF task to feed
 * real items into the same panel without changing this shell.
 */
export function NotificationCenter() {
  const t = useTranslations("Shared.notificationCenter");

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={t("triggerLabel")}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-surface-secondary hover:text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <Bell className="h-5 w-5" aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80" aria-label={t("panelLabel")}>
        <EmptyState
          icon={<Bell className="h-8 w-8" aria-hidden="true" />}
          title={t("emptyTitle")}
          description={t("emptyDescription")}
          className="px-2 py-6"
        />
      </PopoverContent>
    </Popover>
  );
}
