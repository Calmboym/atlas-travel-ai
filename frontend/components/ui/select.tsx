"use client";

import { forwardRef } from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export const Select = SelectPrimitive.Root;
export const SelectGroup = SelectPrimitive.Group;
export const SelectValue = SelectPrimitive.Value;

/**
 * Trigger uses the Input Contract (DESIGN_TOKENS.md Part 6) — same
 * height/radius/border/focus treatment as Input/Textarea, since a
 * closed Select reads visually as "a form field", not a button.
 */
export const SelectTrigger = forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> & {
    invalid?: boolean;
  }
>(({ className, invalid, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    aria-invalid={invalid ? true : undefined}
    className={cn(
      "flex h-[52px] w-full items-center justify-between rounded-lg border bg-surface px-4 text-base text-text-primary",
      "transition-colors duration-200 ease-out",
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
      "data-[placeholder]:text-text-muted",
      "disabled:cursor-not-allowed disabled:bg-disabled-surface disabled:text-text-disabled",
      invalid
        ? "border-error focus-visible:ring-error"
        : "border-border focus-visible:ring-primary",
      className,
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-5 w-5 shrink-0 text-text-muted" aria-hidden="true" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = "SelectTrigger";

/**
 * Dropdown Contract (DESIGN_TOKENS.md Part 6 §Dropdown): radius-16px,
 * padding 12px, item-height 44px, shadow-md, Glass Level 2.
 */
export const SelectContent = forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      position={position}
      sideOffset={4}
      className={cn(
        "atlas-glass-2 z-popover overflow-hidden rounded-2xl p-3 shadow-md",
        position === "popper" &&
          "min-w-[var(--radix-select-trigger-width)]",
        className,
      )}
      {...props}
    >
      <SelectPrimitive.Viewport
        className={cn(
          position === "popper" && "w-full",
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = "SelectContent";

export const SelectItem = forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex h-11 w-full cursor-pointer select-none items-center rounded-lg px-3 text-base text-text-primary outline-none",
      "data-[highlighted]:bg-surface-secondary",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-60",
      className,
    )}
    {...props}
  >
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    <SelectPrimitive.ItemIndicator className="ml-auto flex items-center">
      <Check className="h-4 w-4 text-primary" aria-hidden="true" />
    </SelectPrimitive.ItemIndicator>
  </SelectPrimitive.Item>
));
SelectItem.displayName = "SelectItem";
