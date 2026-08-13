"use client";

import { forwardRef } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;

/**
 * Modal Contract (DESIGN_TOKENS.md Part 6, verbatim): Glass Level 4,
 * radius 32px, padding 32px, max-width 720px, close button top-right,
 * Escape to close (Radix's default behavior — nothing extra needed).
 * Also serves COMPONENT_INVENTORY.md's separately-named "AlertDialog"
 * (same visual contract; that distinction is about confirm/cancel
 * button composition, which callers supply as children, not a separate
 * component).
 *
 * Overlay color: DESIGN_TOKENS.md lists "Overlay" as a semantic token
 * group but never publishes a value for it anywhere — inferred here as
 * a semi-transparent neutral-900 scrim (an already-approved primitive,
 * not an invented color), same reasoning as color-focus-ring/-selection
 * in DESIGNSYS-01. Flagged, not asserted as documented fact.
 */
export const DialogContent = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    /** ACCESSIBILITY.md §Dialogs: "Screen reader title required." */
    title: string;
    description?: string;
  }
>(({ className, children, title, description, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay
      className={cn(
        "fixed inset-0 z-overlay bg-[rgb(15,23,42,0.5)]",
        "data-[state=open]:animate-in data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out",
      )}
    />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "atlas-glass-4 fixed left-1/2 top-1/2 z-modal w-[calc(100vw-2rem)] max-w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-[32px] p-8 shadow-xl",
        "focus:outline-none",
        "data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95",
        className,
      )}
      {...props}
    >
      <DialogPrimitive.Title className="text-2xl font-bold text-text-primary">
        {title}
      </DialogPrimitive.Title>
      {description ? (
        <DialogPrimitive.Description className="mt-2 text-base text-text-secondary">
          {description}
        </DialogPrimitive.Description>
      ) : (
        // Radix requires a Description (or explicit aria-describedby
        // override) for its own a11y warning to stay silent; content
        // without one still needs a labelled, valid dialog.
        <DialogPrimitive.Description className="sr-only">
          {title}
        </DialogPrimitive.Description>
      )}
      <div className="mt-6">{children}</div>
      <DialogPrimitive.Close asChild>
        <button
          type="button"
          aria-label="Close"
          className={cn(
            "absolute right-6 top-6 rounded-full p-2 text-text-muted transition-colors hover:bg-surface-secondary hover:text-text-primary",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          )}
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
DialogContent.displayName = "DialogContent";
