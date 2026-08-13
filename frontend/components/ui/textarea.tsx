"use client";

import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Same contract as Input's `invalid` — ACCESSIBILITY.md §Forms. */
  invalid?: boolean;
}

/**
 * Same visual contract as Input (DESIGN_TOKENS.md Part 6 doesn't publish
 * a separate Textarea entry) — padding, radius, border, focus ring, and
 * error/disabled treatment all match exactly. Height is intentionally
 * not fixed at Input's 52px (multi-line content needs room to grow);
 * `min-h-[104px]` (2x Input's height) is a reasonable default, resizable
 * vertically only so layout doesn't shift the surrounding page width.
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, invalid, disabled, rows = 4, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        rows={rows}
        disabled={disabled}
        aria-invalid={invalid ? true : undefined}
        className={cn(
          "min-h-[104px] w-full resize-y rounded-lg border bg-surface px-4 py-3 text-base text-text-primary",
          "placeholder:text-text-muted",
          "transition-colors duration-200 ease-out",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          invalid
            ? "border-error focus-visible:ring-error"
            : "border-border focus-visible:ring-primary",
          disabled &&
            "cursor-not-allowed resize-none bg-disabled-surface text-text-disabled",
          className,
        )}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";
