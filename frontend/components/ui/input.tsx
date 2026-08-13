"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import clsx from "clsx";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Drives the error visual state (border/ring color) — pair with
   * aria-invalid + aria-describedby on the consuming field, per
   * ACCESSIBILITY.md §Forms / §Error Identification. */
  invalid?: boolean;
}

/**
 * Input Contract (DESIGN_TOKENS.md Part 6):
 * height 52px · padding space-4 · radius radius-lg · background surface
 * · border border-default · focus primary focus ring · placeholder
 * text-muted · error semantic error · disabled disabled surface.
 *
 * `h-[52px]` is an intentional documented-edge-case arbitrary value —
 * it reproduces the Input Contract's exact literal height token, which
 * does not fall on Tailwind's default spacing-derived height scale
 * (h-12=48px / h-14=56px). See FRONTEND_IMPLEMENTATION_GUIDELINES.md's
 * "no arbitrary Tailwind values except documented edge cases."
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, disabled, ...props }, ref) => {
    return (
      <input
        ref={ref}
        disabled={disabled}
        aria-invalid={invalid ? true : undefined}
        className={clsx(
          "h-[52px] w-full rounded-lg border bg-surface px-4 text-base text-text-primary",
          "placeholder:text-text-muted",
          "transition-colors duration-200 ease-out",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          invalid
            ? "border-error focus-visible:ring-error"
            : "border-border focus-visible:ring-primary",
          disabled &&
            "cursor-not-allowed bg-disabled-surface text-text-disabled",
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";
