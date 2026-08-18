"use client";

import * as AspectRatioPrimitive from "@radix-ui/react-aspect-ratio";
import { motion, useReducedMotion, type Transition } from "framer-motion";
import type { ReactNode } from "react";
import { DURATION, EASE } from "@/lib/tokens/motion";

export const AspectRatio = AspectRatioPrimitive.Root;

/**
 * PageTransition — MOTION_SYSTEM.md §7 "Page Transitions: Allowed: Fade,
 * Slide, Scale (subtle). Not Allowed: Spin, Flip, Zoom Explosion,
 * Rotate. Target duration: 250-300ms." Wraps a route/page's content;
 * the caller's own route-change key (e.g. Next.js pathname) drives
 * remounting via AnimatePresence at the call site — this component
 * only supplies the token-compliant motion values, not routing logic.
 */
export function PageTransition({
  variant = "fade",
  children,
}: {
  variant?: "fade" | "slide" | "scale";
  children: ReactNode;
}) {
  const prefersReducedMotion = useReducedMotion();
  const transition: Transition = {
    duration: prefersReducedMotion ? 0 : DURATION.slow,
    ease: "easeOut",
  };

  const variants = {
    fade: { initial: { opacity: 0 }, animate: { opacity: 1 } },
    slide: {
      initial: { opacity: 0, y: 12 },
      animate: { opacity: 1, y: 0 },
    },
    scale: {
      initial: { opacity: 0, scale: 0.98 },
      animate: { opacity: 1, scale: 1 },
    },
  }[variant];

  return (
    <motion.div
      initial={prefersReducedMotion ? false : variants.initial}
      animate={variants.animate}
      transition={transition}
    >
      {children}
    </motion.div>
  );
}

/**
 * FadeIn / SlideIn / ScaleIn / ScrollReveal — COMPONENT_OWNERSHIP_
 * MATRIX.md's "AnimationWrappers" group (DESIGNSYS-04, "Depends on
 * MotionProvider"). MOTION_SYSTEM.md Motion Hierarchy Level 2
 * (Component Motion) for the first three; Level 4 (Storytelling —
 * "Heaviest: LAND. Light-touch: all" per the ownership matrix) for
 * ScrollReveal. None of the four re-implement reduced-motion branching
 * themselves — they rely on MotionProvider's app-wide
 * `<MotionConfig reducedMotion="user">` (components/providers/
 * motion-provider.tsx) to instantly resolve their animated values when
 * the OS preference is set, the same "automatic safety net" PageTransition
 * above still handles manually only because it predates MotionProvider.
 */

interface EntranceProps {
  children: ReactNode;
  className?: string;
  /** Seconds. DESIGN_TOKENS.md's Motion Tokens table has no "delay"
   *  entry — stagger delay is inherently per-usage, so this stays a
   *  plain number rather than a named token. */
  delay?: number;
}

/** MOTION_SYSTEM.md §5 "Medium: 200-300ms" — opacity only, no
 *  transform, for the plainest entrance case. Triggers once, the
 *  first time the element enters the viewport (`whileInView`), so it
 *  also works for content that's already visible on mount without a
 *  separate code path. */
export function FadeIn({ children, className, delay = 0 }: EntranceProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: DURATION.slow, delay, ease: EASE.standard }}
    >
      {children}
    </motion.div>
  );
}

export type SlideDirection = "up" | "down" | "left" | "right";

/**
 * Movement kept in the 4-8px+ "soft" range DESIGN_TOKENS.md specifies
 * for glass-panel motion ("Movement 4-8px"); 16px is used here for
 * entrance content (not a hover/glass state), matching the restrained
 * scale PageTransition's own "slide" variant already uses above
 * (`y: 12`).
 *
 * `left`/`right` are PHYSICAL, not logical — they do not auto-flip for
 * RTL. This is the same known, deliberately out-of-scope tradeoff
 * DESIGNSYS-03 documented for Sidebar's Tooltip `side` prop (no
 * app-wide RTL-aware Popper/animation-direction provider exists yet;
 * wiring one for this alone is disproportionate scope here). Prefer
 * `up`/`down` in components that render in both LTR and RTL locales.
 */
const SLIDE_OFFSET = 16;
const SLIDE_VECTOR: Record<SlideDirection, { x?: number; y?: number }> = {
  up: { y: SLIDE_OFFSET },
  down: { y: -SLIDE_OFFSET },
  left: { x: SLIDE_OFFSET },
  right: { x: -SLIDE_OFFSET },
};

export function SlideIn({
  children,
  className,
  delay = 0,
  direction = "up",
}: EntranceProps & { direction?: SlideDirection }) {
  const offset = SLIDE_VECTOR[direction];
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: DURATION.slow, delay, ease: EASE.standard }}
    >
      {children}
    </motion.div>
  );
}

/** 21_PREMIUM_MICROINTERACTIONS.md "Never: ...Dramatic zooms" — kept
 *  to the same restrained 0.98 scale delta PageTransition's own
 *  "scale" variant already uses in this file, not a fresh,
 *  undocumented value. */
export function ScaleIn({ children, className, delay = 0 }: EntranceProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.98 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: DURATION.slow, delay, ease: EASE.standard }}
    >
      {children}
    </motion.div>
  );
}

/**
 * ScrollReveal: MOTION_SYSTEM.md §8 Scroll Storytelling / §21
 * Storytelling Scenes ("Only Landing Page... Content always remains
 * readable"); COMPONENT_OWNERSHIP_MATRIX.md scopes it "Heaviest:
 * LAND. Light-touch: all" — usable anywhere, just used more sparingly
 * outside Landing. `viewport: { once: true }` per MOTION_SYSTEM.md
 * "Never create long unskippable animations" and 21_PREMIUM_
 * MICROINTERACTIONS.md's "why is everything moving?" failure mode —
 * content reveals a single time and never re-triggers on scrolling
 * back up past it.
 */
export function ScrollReveal({
  children,
  className,
  delay = 0,
  direction = "up",
}: EntranceProps & { direction?: SlideDirection }) {
  const offset = SLIDE_VECTOR[direction];
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: DURATION.slower, delay, ease: EASE.standard }}
    >
      {children}
    </motion.div>
  );
}
