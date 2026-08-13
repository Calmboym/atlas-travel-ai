"use client";

import { forwardRef } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;

/**
 * Bottom Sheet Contract (DESIGN_TOKENS.md Part 6, verbatim): radius
 * 32px, padding 24px, handle mandatory, motion Spring Gentle. Built on
 * the same Radix Dialog primitive as Dialog/Modal (RESPONSIVE_SYSTEM.md
 * §Modals: "Mobile: Bottom sheet unless fullscreen is necessary" — same
 * underlying interaction pattern, different position/entrance) rather
 * than a second, separate primitive dependency.
 *
 * `side`: RESPONSIVE_SYSTEM.md's own examples are bottom-sheet-first
 * ("Preferred on mobile for: Filters, destination details..."), but
 * COMPONENT_INVENTORY also separately names "Drawer" — side="left"/
 * "right" covers that without a second component.
 *
 * Motion: DESIGN_TOKENS.md specifies "Spring Gentle" for Bottom Sheet.
 * Implemented as a CSS `cubic-bezier` approximation driven by Radix's
 * own `data-state` (Tailwind's `animate-in`/`animate-out`), not
 * `lib/tokens/motion.ts`'s actual `SPRING_GENTLE` physics — combining
 * Framer Motion's `AnimatePresence` with Radix's portal/unmount timing
 * correctly is real, separate complexity. Flagged as an approximation.
 *
 * Snap points: DESIGN_TOKENS.md says "Supported" with no interaction
 * detail given. Drag-to-snap gesture physics is separate, real
 * complexity (a gesture task, not a styling one) — not built here.
 */
export const SheetContent = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    title: string;
    description?: string;
    side?: "bottom" | "left" | "right";
  }
>(({ className, children, title, description, side = "bottom", ...props }, ref) => {
  const prefersReducedMotion = useReducedMotion();
  const sidePosition = {
    bottom:
      "inset-x-0 bottom-0 rounded-t-[32px] data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom",
    left: "inset-y-0 left-0 h-full w-full max-w-sm rounded-r-[32px] data-[state=open]:animate-in data-[state=open]:slide-in-from-left data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left",
    right:
      "inset-y-0 right-0 h-full w-full max-w-sm rounded-l-[32px] data-[state=open]:animate-in data-[state=open]:slide-in-from-right data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right",
  }[side];

  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-overlay bg-[rgb(15,23,42,0.5)]" />
      <DialogPrimitive.Content
        ref={ref}
        style={
          prefersReducedMotion
            ? { transitionDuration: "0ms", animationDuration: "0ms" }
            : { transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)" }
        }
        className={cn(
          "atlas-glass-3 fixed z-modal p-6 shadow-xl focus:outline-none",
          sidePosition,
          className,
        )}
        {...props}
      >
        {side === "bottom" ? (
          <div
            aria-hidden="true"
            className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-border"
          />
        ) : null}
        <DialogPrimitive.Title className="text-xl font-bold text-text-primary">
          {title}
        </DialogPrimitive.Title>
        {description ? (
          <DialogPrimitive.Description className="mt-1 text-sm text-text-secondary">
            {description}
          </DialogPrimitive.Description>
        ) : (
          <DialogPrimitive.Description className="sr-only">
            {title}
          </DialogPrimitive.Description>
        )}
        <div className="mt-4">{children}</div>
        <DialogPrimitive.Close asChild>
          <button
            type="button"
            aria-label="Close"
            className="absolute right-5 top-5 rounded-full p-2 text-text-muted transition-colors hover:bg-surface-secondary hover:text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
});
SheetContent.displayName = "SheetContent";
