"use client";

import { forwardRef } from "react";
import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";
import { DURATION, PRESS_SCALE } from "@/lib/tokens/motion";

/**
 * Button Contract (DESIGN_TOKENS.md Part 6).
 *
 * Fully specified there: primary, secondary, ghost, icon (as a size, not
 * a separate component — matches shadcn/ui's own Button+size="icon"
 * convention, and COMPONENT_INVENTORY's IconButton is treated as this
 * component at that size rather than a duplicate implementation).
 *
 * NOT given an explicit contract there (COMPONENT_INVENTORY names them;
 * DESIGN_TOKENS.md Part 6 doesn't detail them) — derived by extending
 * the same structural pattern as the variant they most resemble, noted
 * per-variant below: danger, success, outline, text.
 *
 * Deliberately not built here: SplitButton, DropdownButton — compound
 * components (button + attached menu trigger) with real complexity of
 * their own; better as a focused follow-up than a rushed addition here.
 */
/**
 * Exported (DESIGNSYS-03 addition) so components that render a link
 * styled as a button — e.g. Navbar's "Log in" / "Get started", which
 * must be a real <a>/next-intl <Link> for correct link semantics and
 * locale-prefixed hrefs, not a <button> — can reuse the exact same
 * token-driven classes instead of duplicating them. Button itself
 * intentionally still always renders a real <button> (motion.button):
 * it has no `href` prop and no `asChild`/Slot indirection, so it can
 * keep its native button semantics (type, disabled, form association)
 * simple and correct. Purely additive: the CVA config below, every
 * existing class, and Button's own behavior are unchanged.
 */
export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg text-base font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
  {
    variants: {
      variant: {
        // Primary — DESIGN_TOKENS.md Part 6 §Button Contract, verbatim.
        primary:
          "bg-primary text-on-primary shadow-sm hover:bg-primary-hover active:bg-primary-active",
        // Secondary — §Secondary Button, verbatim (surface bg, border,
        // text-primary, no shadow, surface-secondary on hover).
        secondary:
          "border border-border bg-surface text-text-primary hover:bg-surface-secondary",
        // Ghost — §Ghost Button, verbatim (transparent, no border,
        // surface-secondary on hover).
        ghost: "bg-transparent text-text-primary hover:bg-surface-secondary",
        // Outline — not separately specified; derived from Secondary by
        // dropping the filled surface background (border-only), same
        // hover treatment.
        outline:
          "border border-border bg-transparent text-text-primary hover:bg-surface-secondary",
        // Text — not separately specified; the minimal end of the same
        // family as Ghost, no border, no hover surface (a color/opacity
        // shift stands in for the missing documented hover treatment).
        text: "bg-transparent text-text-primary hover:opacity-70",
        // Danger — not separately specified; same structural pattern as
        // Primary (filled, on-color text, shadow, hover/active shade
        // shift) using the semantic error tokens instead of primary.
        danger:
          "bg-error text-on-primary shadow-sm hover:bg-error-strong active:bg-error-strong",
        // Success — same reasoning as Danger, using success tokens.
        // DESIGN_TOKENS.md only publishes a single success shade
        // (color-success → success-500); hover/active reuse it rather
        // than inventing success-hover/-active tokens that don't exist.
        success: "bg-success text-on-primary shadow-sm hover:opacity-90 active:opacity-80",
      },
      size: {
        default: "min-h-[48px] min-w-[44px] px-6 py-3",
        // Icon — DESIGN_TOKENS.md Part 6 §Icon Button: 48×48, radius
        // full, icon-sm (20px) content.
        icon: "h-12 w-12 min-h-[48px] min-w-[44px] rounded-full p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends Omit<HTMLMotionProps<"button">, "children">,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  children?: React.ReactNode;
}

/**
 * Press feedback (scale 98%, no bounce) and hover elevation follow
 * 21_PREMIUM_MICROINTERACTIONS.md "Button Interactions". Loading state
 * follows COMPONENT_INVENTORY.md's LoadingButton pattern: spinner +
 * aria-busy, label kept in the DOM for screen readers.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      isLoading,
      disabled,
      type = "submit",
      variant,
      size,
      ...props
    },
    ref,
  ) => {
    const prefersReducedMotion = useReducedMotion();
    const isDisabled = disabled || isLoading;

    return (
      <motion.button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={isLoading || undefined}
        whileTap={
          prefersReducedMotion || isDisabled ? undefined : { scale: PRESS_SCALE }
        }
        whileHover={
          prefersReducedMotion || isDisabled ? undefined : { y: -1 }
        }
        transition={{ duration: DURATION.fast }}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
        ) : null}
        {children}
      </motion.button>
    );
  },
);
Button.displayName = "Button";
