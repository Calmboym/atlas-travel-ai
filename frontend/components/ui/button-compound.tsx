"use client";

import { forwardRef, type ReactNode } from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { ChevronDown } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { FloatingLayer, type FloatingLayerProps } from "@/components/ui/structural";
import { cn } from "@/lib/utils/cn";

/**
 * FloatingActionButton — RESPONSIVE_SYSTEM.md §Floating Action Button:
 * "Allowed only where it improves usability. Never use more than one
 * FAB per screen." (a usage rule for callers, not something a single
 * component instance can enforce). Reuses Button's own `icon` size —
 * COMPONENT_INVENTORY.md lists FloatingActionButton and IconButton
 * separately, but the actual documented shape (48×48, radius full) is
 * identical; the only real difference is *position* (floating vs.
 * inline), which FloatingLayer already owns.
 */
export function FloatingActionButton({
  position = "bottom-right",
  ...buttonProps
}: ButtonProps & { position?: FloatingLayerProps["position"] }) {
  return (
    <FloatingLayer position={position}>
      <Button size="icon" className="shadow-lg" {...buttonProps} />
    </FloatingLayer>
  );
}

export interface MenuAction {
  label: string;
  onSelect: () => void;
  disabled?: boolean;
}

/**
 * Shared dropdown-menu content (roving tabindex, arrow-key nav, Escape
 * — all from Radix) — Dropdown Contract numbers (DESIGN_TOKENS.md Part
 * 6): radius 16px, padding 12px, item height 44px, shadow-md, Glass
 * Level 2. Same contract Select's dropdown already uses.
 */
function MenuContent({ actions }: { actions: MenuAction[] }) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        align="end"
        sideOffset={4}
        className="atlas-glass-2 z-popover min-w-[180px] rounded-2xl p-3 shadow-md"
      >
        {actions.map((action) => (
          <DropdownMenuPrimitive.Item
            key={action.label}
            disabled={action.disabled}
            onSelect={action.onSelect}
            className={cn(
              "flex h-11 cursor-pointer select-none items-center rounded-lg px-3 text-base text-text-primary outline-none",
              "data-[highlighted]:bg-surface-secondary",
              "data-[disabled]:pointer-events-none data-[disabled]:opacity-60",
            )}
          >
            {action.label}
          </DropdownMenuPrimitive.Item>
        ))}
      </DropdownMenuPrimitive.Content>
    </DropdownMenuPrimitive.Portal>
  );
}

/**
 * SplitButton — COMPONENT_INVENTORY.md §Buttons. A primary action
 * (plain Button, fires immediately) plus an attached chevron trigger
 * for secondary actions — two independently-focusable controls, not
 * one, so a screen reader user can reach the primary action without
 * first opening the menu (matching how native split buttons, e.g. in
 * desktop office suites, behave).
 */
export const SplitButton = forwardRef<
  HTMLButtonElement,
  ButtonProps & { actions: MenuAction[]; menuLabel?: string }
>(({ actions, menuLabel = "More options", children, className, variant, ...props }, ref) => {
  return (
    <div className={cn("inline-flex", className)}>
      <Button
        ref={ref}
        variant={variant}
        className="rounded-r-none"
        {...props}
      >
        {children}
      </Button>
      <DropdownMenuPrimitive.Root>
        <DropdownMenuPrimitive.Trigger asChild>
          <Button
            type="button"
            variant={variant}
            size="icon"
            aria-label={menuLabel}
            className="h-12 w-11 min-w-0 rounded-l-none border-l border-l-surface"
          >
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          </Button>
        </DropdownMenuPrimitive.Trigger>
        <MenuContent actions={actions} />
      </DropdownMenuPrimitive.Root>
    </div>
  );
});
SplitButton.displayName = "SplitButton";

/**
 * DropdownButton — COMPONENT_INVENTORY.md §Buttons. Unlike SplitButton,
 * this is one control: the whole button opens the menu, there's no
 * separate primary action.
 */
export function DropdownButton({
  actions,
  children,
  ...props
}: ButtonProps & { actions: MenuAction[]; children: ReactNode }) {
  return (
    <DropdownMenuPrimitive.Root>
      <DropdownMenuPrimitive.Trigger asChild>
        <Button type="button" {...props}>
          {children}
          <ChevronDown className="h-4 w-4" aria-hidden="true" />
        </Button>
      </DropdownMenuPrimitive.Trigger>
      <MenuContent actions={actions} />
    </DropdownMenuPrimitive.Root>
  );
}
