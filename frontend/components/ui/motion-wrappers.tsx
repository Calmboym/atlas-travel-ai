"use client";

import * as AspectRatioPrimitive from "@radix-ui/react-aspect-ratio";
import { motion, useReducedMotion, type Transition } from "framer-motion";
import type { ReactNode } from "react";
import { DURATION } from "@/lib/tokens/motion";

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
