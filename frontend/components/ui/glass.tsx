import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Atlas Glass Design Language (DESIGN_TOKENS.md, LOCKED) defines
 * exactly four Glass Levels — no fifth without a Design Bible
 * amendment (COMPONENT_OWNERSHIP_MATRIX.md: "Exactly 4 Glass Levels —
 * no 5th without amendment"). `GlassSurface` formalizes the four
 * `.atlas-glass-N` CSS utilities (app/globals.css) — already consumed
 * directly by class name in Navbar [level 1], Sidebar [level 2], and
 * the DESIGNSYS-02 `Card` [level 2] — into a typed, reusable
 * primitive, so any future component that needs a *different* level
 * (Dialog/Timeline Detail Card/Booking Summary = 3; Modal = 4, per
 * DESIGN_TOKENS.md Part 6's individual component contracts) has one to
 * build on instead of re-hardcoding a class name. Existing `.atlas-
 * glass-N` usages are left untouched — this wraps them, it doesn't
 * replace them (MASTER_RULES.md §19: no silent downgrade of working
 * code).
 */
export type GlassLevel = 1 | 2 | 3 | 4;

const GLASS_LEVEL_CLASS: Record<GlassLevel, string> = {
  1: "atlas-glass-1",
  2: "atlas-glass-2",
  3: "atlas-glass-3",
  4: "atlas-glass-4",
};

export interface GlassSurfaceProps extends HTMLAttributes<HTMLDivElement> {
  /** Which of the four approved Glass Levels to render at. */
  level: GlassLevel;
}

/**
 * The bare glass treatment — background tint, border, backdrop blur —
 * with no assumptions about radius, padding, or shadow. Use `GlassCard`
 * below for the common "padded, radius'd container" case; reach for
 * `GlassSurface` directly when a component's own contract in
 * DESIGN_TOKENS.md Part 6 specifies different geometry (e.g. Toast:
 * radius-xl / max-width 420px; Dropdown: radius-lg / 12px padding —
 * neither matches GlassCard's defaults, so they'd compose GlassSurface
 * with their own layout instead).
 */
export const GlassSurface = forwardRef<HTMLDivElement, GlassSurfaceProps>(
  ({ level, className, ...props }, ref) => (
    <div ref={ref} className={cn(GLASS_LEVEL_CLASS[level], className)} {...props} />
  ),
);
GlassSurface.displayName = "GlassSurface";

export interface GlassCardProps extends GlassSurfaceProps {
  /**
   * DESIGN_TOKENS.md Part 6 radius per contract: Card/Dashboard
   * Widget/Toast = radius-2xl (24px, the default here); Timeline
   * Detail Card/Modal = radius-3xl (32px). `xl` (20px) is included for
   * contracts closer to Navigation/Sidebar geometry. Does not include
   * `radius-lg` (Dropdown's 16px) — that contract's 12px padding and
   * 44px item-height rows don't fit this card shape anyway; Dropdown
   * should compose `GlassSurface` directly.
   */
  radius?: "xl" | "2xl" | "3xl";
  /** Hover lift/shadow, matching the DESIGNSYS-02 `Card`'s own
   *  `interactive` prop for API consistency. Off by default — cards
   *  that aren't themselves the interactive element should leave this
   *  false and wrap an interactive child instead. */
  interactive?: boolean;
}

const RADIUS_CLASS: Record<NonNullable<GlassCardProps["radius"]>, string> = {
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
  "3xl": "rounded-3xl",
};

/**
 * A card-shaped `GlassSurface` for the Part 6 contracts that need a
 * Glass Level *other than* the default Card's hardcoded Level 2 (e.g.
 * a future Timeline Detail Card at Level 3, or a Modal surface at
 * Level 4). For the plain, default case, keep using the existing
 * DESIGNSYS-02 `Card` (components/ui/card.tsx) — this does not
 * replace it, and duplicating its Level-2-only behavior here would
 * violate COMPONENT_OWNERSHIP_MATRIX.md's "must never be recreated"
 * rule in the other direction.
 */
export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  (
    { level, radius = "2xl", interactive = false, className, children, ...props },
    ref,
  ) => (
    <GlassSurface
      ref={ref}
      level={level}
      className={cn(
        RADIUS_CLASS[radius],
        "p-6 shadow-sm",
        interactive && "transition-shadow duration-200 ease-out hover:shadow-md",
        className,
      )}
      {...props}
    >
      {children}
    </GlassSurface>
  ),
);
GlassCard.displayName = "GlassCard";
