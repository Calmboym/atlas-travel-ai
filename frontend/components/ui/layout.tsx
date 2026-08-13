import { type HTMLAttributes, type ElementType } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Container widths from DESIGN_TOKENS.md's Container Width Tokens
 * (--atlas-container-*, globals.css), not re-declared here — this
 * component is the one place those plain custom properties get
 * consumed, as DESIGNSYS-01's own delivery notes anticipated.
 */
export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "max" | "reading";
}

const containerSizeVar: Record<NonNullable<ContainerProps["size"]>, string> = {
  sm: "var(--atlas-container-sm)",
  md: "var(--atlas-container-md)",
  lg: "var(--atlas-container-lg)",
  xl: "var(--atlas-container-xl)",
  "2xl": "var(--atlas-container-2xl)",
  max: "var(--atlas-container-max)",
  reading: "var(--atlas-container-reading)",
};

export function Container({
  size = "max",
  className,
  style,
  children,
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn("mx-auto w-full px-4 md:px-6 lg:px-8", className)}
      style={{ maxWidth: containerSizeVar[size], ...style }}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Vertical/horizontal flex stack with token-driven gaps only —
 * FRONTEND_IMPLEMENTATION_GUIDELINES.md "Whitespace must follow spacing
 * tokens." `gap` maps 1:1 to Atlas's space-* scale via Tailwind's
 * already-matching default spacing utilities (space-4 = gap-4 = 16px).
 */
export interface StackProps extends HTMLAttributes<HTMLDivElement> {
  direction?: "row" | "column";
  gap?: 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20 | 24 | 32;
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "center" | "end" | "between";
  wrap?: boolean;
  as?: ElementType;
}

const alignMap = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
};
const justifyMap = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
};
// Explicit map, not a template literal (`gap-${gap}`) — Tailwind's JIT
// scanner only generates CSS for class names it can find as complete,
// literal strings in the source; a dynamically-built string would
// silently produce no styles in production. Every value needs its own
// literal entry here.
const gapMap = {
  1: "gap-1",
  2: "gap-2",
  3: "gap-3",
  4: "gap-4",
  5: "gap-5",
  6: "gap-6",
  8: "gap-8",
  10: "gap-10",
  12: "gap-12",
  16: "gap-16",
  20: "gap-20",
  24: "gap-24",
  32: "gap-32",
} as const;

export function Stack({
  direction = "column",
  gap = 4,
  align = "stretch",
  justify = "start",
  wrap = false,
  as: Tag = "div",
  className,
  children,
  ...props
}: StackProps) {
  return (
    <Tag
      className={cn(
        "flex",
        direction === "row" ? "flex-row" : "flex-col",
        gapMap[gap],
        alignMap[align],
        justifyMap[justify],
        wrap && "flex-wrap",
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}

export interface DividerProps extends HTMLAttributes<HTMLHRElement> {
  orientation?: "horizontal" | "vertical";
}

export function Divider({
  orientation = "horizontal",
  className,
  ...props
}: DividerProps) {
  return (
    <hr
      role={orientation === "vertical" ? "separator" : undefined}
      aria-orientation={orientation === "vertical" ? "vertical" : undefined}
      className={cn(
        "border-divider",
        orientation === "vertical" ? "h-full w-px border-l" : "w-full border-t",
        className,
      )}
      {...props}
    />
  );
}

/**
 * Grid — DESIGN_TOKENS.md's Grid Tokens: Desktop 12 columns, Tablet 8,
 * Mobile 4, gap 24px (space-6). `columns` sets the desktop column
 * count; RESPONSIVE_SYSTEM.md's own breakpoint-scaling (12→8→4) is
 * mobile-first CSS by default here rather than a separate prop per
 * breakpoint, matching FRONTEND_IMPLEMENTATION_GUIDELINES.md's "Mobile-
 * first implementation is mandatory."
 */
export interface GridProps extends HTMLAttributes<HTMLDivElement> {
  columns?: 12 | 8 | 4;
}

const gridColsMap = {
  12: "grid-cols-4 md:grid-cols-8 lg:grid-cols-12",
  8: "grid-cols-4 md:grid-cols-8",
  4: "grid-cols-4",
} as const;

export function Grid({
  columns = 12,
  className,
  children,
  ...props
}: GridProps) {
  return (
    <div
      className={cn("grid gap-6", gridColsMap[columns], className)}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Spacer — a flexible or fixed gap between siblings, for the cases a
 * Stack's uniform `gap` isn't the right shape (e.g. one specific larger
 * gap in an otherwise-tight row, or pushing a trailing item to the far
 * edge of a flex row). `size` omitted -> flex-grow spacer; given ->
 * fixed size from the space-* scale, same token set as Stack's `gap`.
 */
export interface SpacerProps extends HTMLAttributes<HTMLDivElement> {
  size?: 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20 | 24 | 32;
  axis?: "horizontal" | "vertical";
}

const spacerSizeMap = {
  horizontal: {
    1: "w-1", 2: "w-2", 3: "w-3", 4: "w-4", 5: "w-5", 6: "w-6",
    8: "w-8", 10: "w-10", 12: "w-12", 16: "w-16", 20: "w-20",
    24: "w-24", 32: "w-32",
  },
  vertical: {
    1: "h-1", 2: "h-2", 3: "h-3", 4: "h-4", 5: "h-5", 6: "h-6",
    8: "h-8", 10: "h-10", 12: "h-12", 16: "h-16", 20: "h-20",
    24: "h-24", 32: "h-32",
  },
} as const;

export function Spacer({
  size,
  axis = "horizontal",
  className,
  ...props
}: SpacerProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        size ? spacerSizeMap[axis][size] : "flex-1",
        className,
      )}
      {...props}
    />
  );
}
