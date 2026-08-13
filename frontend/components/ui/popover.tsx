"use client";

import { forwardRef } from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "@/lib/utils/cn";

export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;
export const PopoverAnchor = PopoverPrimitive.Anchor;

/**
 * No dedicated Popover contract in DESIGN_TOKENS.md Part 6 (only
 * Dropdown and Tooltip are detailed); this borrows the Dropdown
 * Contract's numbers (radius 16px, padding 12px, shadow-md, Glass Level
 * 2) since a Popover is structurally the same "floating panel anchored
 * to a trigger" shape, just with arbitrary content instead of a list of
 * items — the same reasoning already used for Button's Danger/Success/
 * Outline/Text variants in this task.
 */
export const PopoverContent = forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 8, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "atlas-glass-2 z-popover w-72 rounded-2xl p-3 text-sm text-text-primary shadow-md outline-none",
        "data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:zoom-in-95",
        "data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95",
        className,
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
));
PopoverContent.displayName = "PopoverContent";
