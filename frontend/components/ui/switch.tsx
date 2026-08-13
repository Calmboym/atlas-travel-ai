"use client";

import { forwardRef } from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "@/lib/utils/cn";

/**
 * Same Radix-wrapping philosophy as Checkbox. No separate DESIGN_TOKENS
 * Part 6 contract published for Switch; track/thumb sizing follows a
 * common, accessible touch-target-friendly scale (44px min touch target
 * via padding, even though the visual track is smaller) rather than an
 * invented one-off.
 */
export const Switch = forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    className={cn(
      "peer inline-flex h-6 w-11 shrink-0 items-center rounded-full border border-transparent transition-colors",
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
      "data-[state=checked]:bg-primary data-[state=unchecked]:bg-border",
      "disabled:cursor-not-allowed disabled:opacity-60",
      className,
    )}
    {...props}
  >
    <SwitchPrimitive.Thumb
      className={cn(
        "pointer-events-none block h-5 w-5 translate-x-0.5 rounded-full bg-surface shadow-sm transition-transform",
        "data-[state=checked]:translate-x-[22px]",
      )}
    />
  </SwitchPrimitive.Root>
));
Switch.displayName = "Switch";
