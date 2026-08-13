"use client";

import { forwardRef } from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils/cn";

/**
 * TooltipProvider must wrap the app once (like ThemeProvider) — Radix's
 * delayDuration is provider-level. DESIGN_TOKENS.md Part 6 §Tooltip:
 * "Delay 300ms," applied here.
 */
export const TooltipProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <TooltipPrimitive.Provider delayDuration={300}>
    {children}
  </TooltipPrimitive.Provider>
);

export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

/**
 * Tooltip Contract (DESIGN_TOKENS.md Part 6, verbatim): max-width
 * 260px, radius 12px, padding 12px, shadow-sm.
 */
export const TooltipContent = forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 6, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-tooltip max-w-[260px] rounded-xl bg-surface-elevated p-3 text-xs leading-snug text-text-primary shadow-sm",
        "data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in",
        "data-[state=closed]:animate-out data-[state=closed]:fade-out",
        className,
      )}
      {...props}
    />
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = "TooltipContent";
