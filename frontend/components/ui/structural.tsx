"use client";

import { type HTMLAttributes, type ReactNode, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils/cn";

/**
 * AppShell — the outermost structural wrapper (COMPONENT_INVENTORY.md
 * §Layout). Distinct from the four named page-level layouts
 * (MarketingLayout/ApplicationLayout/FocusLayout/AuthLayout, all
 * DESIGNSYS-03) — this is the generic "full-height flex column" shape
 * those layouts are built from, not a layout itself. No visual styling
 * beyond structure; token-driven background comes from `body` in
 * globals.css already.
 */
export function AppShell({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex min-h-screen flex-col", className)} {...props}>
      {children}
    </div>
  );
}

/**
 * Section — semantic <section> with RESPONSIVE_SYSTEM.md's Section
 * Padding token values: 64px desktop / 48px tablet / 32px mobile.
 */
export function Section({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLElement>) {
  return (
    <section
      className={cn("px-4 py-8 md:px-6 md:py-12 lg:px-8 lg:py-16", className)}
      {...props}
    >
      {children}
    </section>
  );
}

/**
 * StickyArea — RESPONSIVE_SYSTEM.md/APPLICATION_LAYOUT_GUIDE.md's
 * "Sticky Elements: Navigation, Sidebar, Timeline, Composer, AI
 * Assistant." `offset` accounts for a fixed header a sticky child
 * should sit below rather than under.
 */
export function StickyArea({
  offset = 0,
  className,
  style,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { offset?: number }) {
  return (
    <div
      className={cn("sticky z-sticky", className)}
      style={{ top: offset, ...style }}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * FloatingLayer — fixed-position wrapper for floating UI (FAB, Quick
 * Actions) that must escape normal document flow and sit above page
 * content but below overlay-tier surfaces (Dialog/Sheet/Toast), per
 * DESIGN_TOKENS.md's documented Layer Hierarchy ("...Interactive
 * Controls → Floating Actions → Dialogs → Notifications → System
 * Overlay").
 */
export interface FloatingLayerProps extends HTMLAttributes<HTMLDivElement> {
  position?: "bottom-right" | "bottom-left" | "bottom-center";
  offset?: number;
}

const floatingPositionMap = {
  "bottom-right": "right-6 bottom-6",
  "bottom-left": "left-6 bottom-6",
  "bottom-center": "left-1/2 bottom-6 -translate-x-1/2",
} as const;

export function FloatingLayer({
  position = "bottom-right",
  offset,
  className,
  style,
  children,
  ...props
}: FloatingLayerProps) {
  return (
    <div
      className={cn(
        "fixed z-fixed",
        floatingPositionMap[position],
        className,
      )}
      style={offset ? { marginBottom: offset, ...style } : style}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Portal — renders children into document.body, outside the normal DOM
 * tree (COMPONENT_INVENTORY.md §Layout). The overlay components above
 * (Dialog/Sheet/Popover/Tooltip/Toast) already portal via their own
 * Radix primitives and don't need this; it exists for the cases
 * something needs portal behavior without a full Radix primitive behind
 * it. SSR-safe: renders nothing until mounted client-side.
 */
function subscribeNoop() {
  return () => {};
}
function getClientSnapshot() {
  return true;
}
function getServerSnapshot() {
  return false;
}

export function Portal({ children }: { children: ReactNode }) {
  // Same fix as components/providers/theme-provider.tsx: React
  // guarantees getServerSnapshot() during SSR/hydration and transparently
  // re-syncs to the real client value right after, with no manual
  // effect+setState (which triggered a real react-hooks/set-state-in-effect
  // violation the first time this was written).
  const isClient = useSyncExternalStore(
    subscribeNoop,
    getClientSnapshot,
    getServerSnapshot,
  );
  if (!isClient) return null;
  return createPortal(children, document.body);
}
