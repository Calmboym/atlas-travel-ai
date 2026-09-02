import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils/cn";

/**
 * ATLAS-P1-CHAT-02 — AI Thinking State
 * (21_PREMIUM_MICROINTERACTIONS.md §AI Thinking State: "Animated dots,
 * gentle shimmer, contextual status text... Avoid fake percentages.")
 *
 * COMPONENT_INVENTORY.md §Feedback separately lists a `LoadingDots`
 * Foundation component, but COMPONENT_OWNERSHIP_MATRIX.md's Foundation
 * matrix confirms it was never actually built by DESIGNSYS-02 (absent
 * from all 33 delivered groups). Per MASTER_RULES.md §24, Foundation
 * Components are built only by DESIGNSYS tasks — not this one — so
 * the three dots below are implemented directly inside this
 * CHAT-owned component rather than introducing a new Foundation
 * primitive outside this task's authorization.
 *
 * Animation: `animate-pulse` (opacity fade), matching the existing
 * Skeleton precedent (components/ui/loading.tsx) — deliberately not
 * `animate-bounce`: MOTION_SYSTEM.md §6 Easing is explicit ("No
 * bounce. No elastic. No cartoon motion"), and Tailwind's bounce
 * utility is a literal vertical bounce. The per-dot stagger delay is
 * a small choreography offset, not a design-token value (color/
 * spacing/radius/duration), so it's set inline rather than reaching
 * for a Motion Token that doesn't model "offset between three
 * siblings" in the first place.
 */
export function TypingIndicator({ className }: { className?: string }) {
  const t = useTranslations("Chat.message");

  return (
    <div
      role="status"
      aria-label={t("thinking")}
      className={cn(
        "atlas-glass-1 inline-flex items-center gap-2 rounded-2xl px-4 py-3",
        className,
      )}
    >
      <span className="flex items-center gap-1" aria-hidden="true">
        {[0, 150, 300].map((delayMs) => (
          <span
            key={delayMs}
            className="h-1.5 w-1.5 animate-pulse rounded-full bg-text-muted"
            style={{ animationDelay: `${delayMs}ms` }}
          />
        ))}
      </span>
      <span className="text-sm text-text-secondary">{t("thinking")}</span>
    </div>
  );
}
