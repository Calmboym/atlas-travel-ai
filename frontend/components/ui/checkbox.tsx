"use client";

import { forwardRef } from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * "Radix provides behavior. Atlas provides appearance... Never style
 * directly inside Radix primitives. Always wrap primitives with Atlas
 * components." — FRONTEND_IMPLEMENTATION_GUIDELINES.md §Radix UI
 * Integration. Radix's Checkbox handles keyboard interaction (Space to
 * toggle), ARIA state (aria-checked, including "indeterminate"), and
 * focus management; this wrapper only supplies the token-driven visual
 * layer — no separate contract is published for Checkbox in
 * DESIGN_TOKENS.md Part 6, so sizing/radius follow the same 20px icon /
 * radius-sm scale already established for compact controls.
 */
export const Checkbox = forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer h-5 w-5 shrink-0 rounded-sm border border-border bg-surface transition-colors",
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
      "data-[state=checked]:border-primary data-[state=checked]:bg-primary",
      "disabled:cursor-not-allowed disabled:opacity-60",
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-on-primary")}
    >
      <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = "Checkbox";
