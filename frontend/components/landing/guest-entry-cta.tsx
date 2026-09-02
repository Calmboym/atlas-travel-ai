"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils/cn";

/**
 * ATLAS-P1-LAND-03 — "Continue as Guest" flow wiring.
 *
 * Scope, stated plainly: this delivers the entry POINT — a real,
 * locale-aware link into guest mode, with copy that matches
 * ONBOARDING_EXPERIENCE.md's guarantee ("Guest never feels forced.
 * Registration is encouraged. Never required.") and
 * USER_FLOWS.md Flow 02. It does not implement the guest
 * session-memory mechanism itself: that is `ATLAS-P1-MEM-01`'s
 * explicitly separate scope (`WORK_BREAKDOWN_STRUCTURE.md`:
 * "Guest session memory (client-side, cleared on browser close)"),
 * which itself depends on `CHAT-02` (message components) — neither
 * exists yet. Wiring the entry now, ahead of the destination, matches
 * the established pattern documented for AUTH-08's route guards and
 * every `nav-items.ts` link to a not-yet-built page.
 *
 * `/chat` is confirmed guest-accessible today (absent from
 * `PROTECTED_PATH_SEGMENTS` in `lib/auth/protected-routes.ts` —
 * verified against the real file, not assumed), so this link never
 * silently redirects into a login wall once CHAT-01 ships.
 */
export function GuestEntryCta({ className }: { className?: string }) {
  const t = useTranslations("HomePage.hero");

  return (
    <div className={cn("flex flex-col items-center gap-1.5", className)}>
      <Link
        href="/chat"
        className={cn(
          "inline-flex min-h-[48px] min-w-[44px] items-center justify-center rounded-lg px-6 py-3 text-base font-semibold text-text-primary transition-colors",
          "hover:bg-surface-secondary",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        )}
      >
        {t("guestCta")}
      </Link>
      <p className="text-sm text-text-muted">{t("guestCtaHint")}</p>
    </div>
  );
}
