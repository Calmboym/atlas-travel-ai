import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Card Contract (DESIGN_TOKENS.md Part 6, verbatim): Glass Level 2,
 * radius-2xl, padding space-6, glass-border, shadow-sm, hover shadow-md
 * with a 4px lift, duration-normal. This is the base every other
 * *Card variant (COMPONENT_INVENTORY §Trips/§Destinations/§Hotels/etc.)
 * extends — those are Feature Components, built by their own tasks, not
 * here (COMPONENT_OWNERSHIP_MATRIX.md §6).
 */
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Hover lift/shadow — off for cards that aren't themselves
   * interactive (e.g. wrap an interactive child instead). */
  interactive?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, interactive = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "atlas-glass-2 rounded-2xl p-6 shadow-sm",
          interactive &&
            "transition-shadow duration-200 ease-out hover:shadow-md",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);
Card.displayName = "Card";
