import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

/**
 * ATLAS-P1-DASH-01 — Shared RetryCard
 * (COMPONENT_OWNERSHIP_MATRIX.md §4, same row/reasoning as
 * ConnectionStatus — see that component's own docstring). A
 * card-level counterpart to the Foundation `ErrorState`
 * (components/ui/state.tsx): ErrorState's `action` slot accepts any
 * ReactNode for a general-purpose recovery affordance, where this
 * component specifically wires up the "retry the same request, show
 * it's in flight" pattern COPYWRITING_GUIDELINES.md §Error Messages
 * and ACCESSIBILITY.md §Error Recovery both call for (Problem / Reason
 * / Recovery action; never a raw technical error).
 *
 * Copy-free like EmptyState/ErrorState/QuickActions — every string is
 * supplied by the caller.
 */
export interface RetryCardProps {
  title: string;
  description?: string;
  retryLabel: string;
  onRetry: () => void;
  /** True while a retry request is currently in flight — disables the
   *  button and shows Button's own built-in loading spinner. */
  isRetrying?: boolean;
  className?: string;
}

export function RetryCard({
  title,
  description,
  retryLabel,
  onRetry,
  isRetrying = false,
  className,
}: RetryCardProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center gap-3 rounded-2xl border border-error/20 bg-error-tint px-6 py-10 text-center",
        className,
      )}
    >
      <AlertCircle className="h-8 w-8 text-error-strong" aria-hidden="true" />
      <p className="text-lg font-semibold text-text-primary">{title}</p>
      {description ? (
        <p className="max-w-[420px] text-base leading-relaxed text-text-secondary">
          {description}
        </p>
      ) : null}
      <Button
        type="button"
        variant="secondary"
        isLoading={isRetrying}
        onClick={onRetry}
        className="mt-2"
      >
        {retryLabel}
      </Button>
    </div>
  );
}
