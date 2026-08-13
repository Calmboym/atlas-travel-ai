import { type HTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * MOTION_SYSTEM.md §16 "Loading: Prefer Skeleton, Streaming, Progressive
 * Rendering. Avoid Global Spinner, Blank Page." Shimmer, not a flat
 * pulse — PREMIUM_MICROINTERACTIONS.md §Loading States "Skeleton shimmer
 * remains subtle." Radius is a prop, not hardcoded, since a skeleton
 * must match the shape of whatever real content it's standing in for
 * (ACCESSIBILITY.md §Loading States requires aria-busy + a loading
 * message on the container that uses these, not on each skeleton).
 */
export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  radius?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
}

const radiusMap = {
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
  full: "rounded-full",
} as const;

export function Skeleton({
  radius = "md",
  className,
  ...props
}: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "animate-pulse bg-surface-secondary",
        radiusMap[radius],
        className,
      )}
      {...props}
    />
  );
}

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  size?: "sm" | "md" | "lg";
  /** Accessible label — a bare spinning icon conveys nothing to screen
   * readers without one. Defaults to a generic, still-meaningful value;
   * callers doing something specific should override it. */
  label?: string;
}

const spinnerSizeMap = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-8 w-8",
} as const;

export function Spinner({
  size = "md",
  label = "Loading",
  className,
  ...props
}: SpinnerProps) {
  return (
    <span role="status" className={cn("inline-flex", className)} {...props}>
      <Loader2
        className={cn("animate-spin text-text-muted", spinnerSizeMap[size])}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}
