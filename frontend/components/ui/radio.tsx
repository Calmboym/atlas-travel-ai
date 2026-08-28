"use client";

import { forwardRef } from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { cn } from "@/lib/utils/cn";

export const RadioGroup = forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => (
  <RadioGroupPrimitive.Root
    ref={ref}
    className={cn("flex flex-col gap-3", className)}
    {...props}
  />
));
RadioGroup.displayName = "RadioGroup";

/**
 * Same Radix-wrapping philosophy as Checkbox/Switch — behavior (roving
 * tabindex, arrow-key navigation between items, aria-checked) from
 * Radix; visual layer only from Atlas tokens. No separate DESIGN_TOKENS
 * Part 6 contract published; sized to match Checkbox's 20px scale for
 * visual consistency across the two "single small control" input types.
 *
 * EXTENDED — ATLAS-P1-PROF-01, added the `variant` prop ("circle",
 * unchanged default, vs. new "card"). Per COMPONENT_OWNERSHIP_MATRIX.md
 * §7's Lifecycle table ("Extended: New variant added, base contract
 * unchanged... normal owner"), not a fork: existing/future "circle"
 * consumers are byte-identical to before. "card" exists because the
 * Profile Wizard's option pickers (Travel Preference / Budget /
 * Accommodation / Transportation — all small, closed, single-select
 * option sets, APPLICATION_LAYOUT_GUIDE.md §Profile Sections) need a
 * full clickable card with icon + label content, not just a bare
 * circle — a shape DESIGN_TOKENS.md's own "Radix provides behavior,
 * Atlas provides appearance... wrap primitives with Atlas components"
 * principle anticipates, and one likely to recur for Phase 2 style
 * pickers (destinations, hotels), which is why it lives here rather
 * than as a one-off Profile-only component.
 */
export interface RadioGroupItemProps
  extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> {
  variant?: "circle" | "card";
}

export const RadioGroupItem = forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  RadioGroupItemProps
>(({ className, variant = "circle", children, ...props }, ref) => {
  if (variant === "card") {
    return (
      <RadioGroupPrimitive.Item
        ref={ref}
        className={cn(
          "atlas-glass-1 relative flex flex-col items-center gap-2 rounded-2xl border border-border p-4 text-center transition-colors",
          "hover:border-primary/60",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          "data-[state=checked]:border-primary data-[state=checked]:bg-primary-tint",
          "disabled:cursor-not-allowed disabled:opacity-60",
          className,
        )}
        {...props}
      >
        <span
          aria-hidden="true"
          className={cn(
            "absolute end-3 top-3 h-4 w-4 rounded-full border border-border transition-colors",
            "[[data-state=checked]_&]:border-primary [[data-state=checked]_&]:bg-primary",
          )}
        />
        {children}
      </RadioGroupPrimitive.Item>
    );
  }

  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        "h-5 w-5 shrink-0 rounded-full border border-border bg-surface transition-colors",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        "data-[state=checked]:border-primary",
        "disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <span className="h-2.5 w-2.5 rounded-full bg-primary" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
});
RadioGroupItem.displayName = "RadioGroupItem";
