import { cn } from "@/lib/utils/cn";

/**
 * ATLAS-P1-DASH-01 — Shared ConnectionStatus
 * (COMPONENT_OWNERSHIP_MATRIX.md §4: "ConnectionStatus, RetryCard |
 * Whichever of CHAT-01/DASH-01 ships first... once there's an actual
 * connection worth monitoring"). CHAT-01/02/03/04 never claimed it;
 * DASH-01 is the first task with a real one: the Dashboard's own
 * profile/user fetch (dashboard-page-content.tsx), specifically the
 * transient "retrying" state after the person presses Retry on
 * RetryCard below and the request is back in flight.
 *
 * ACCESSIBILITY.md §Color Independence: "Never communicate using
 * color alone." — the dot is decorative (aria-hidden); `label` is the
 * real, required, caller-translated status text a screen reader
 * announces via role="status".
 */
export type ConnectionState = "online" | "offline" | "reconnecting";

const DOT_COLOR: Record<ConnectionState, string> = {
  online: "bg-success",
  offline: "bg-error",
  reconnecting: "bg-warning",
};

export interface ConnectionStatusProps {
  state: ConnectionState;
  /** Caller-translated status text, e.g. t("reconnecting"). */
  label: string;
  className?: string;
}

export function ConnectionStatus({ state, label, className }: ConnectionStatusProps) {
  return (
    <span
      role="status"
      className={cn(
        "inline-flex items-center gap-2 rounded-full bg-surface-secondary px-3 py-1 text-xs font-medium text-text-secondary",
        className,
      )}
    >
      <span
        className={cn("h-2 w-2 shrink-0 rounded-full", DOT_COLOR[state])}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}
