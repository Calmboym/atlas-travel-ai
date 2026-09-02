"use client";

import { motion, useReducedMotion } from "framer-motion";
import { DURATION } from "@/lib/tokens/motion";

/**
 * ATLAS-P1-LAND-01 — AnimatedBackground.
 *
 * DESIGN_SYSTEM.md §28/§29: scroll-storytelling visuals on Landing are
 * an *optional* enhancement — "Content must remain usable without
 * them" — and Three.js is reserved for cases that "improve
 * storytelling" specifically (Interactive Globe, Flight Path, Earth
 * Rotation), not a default decoration. Introducing Three.js here would
 * also be a new runtime dependency, which `MASTER_RULES.md` §5
 * requires explicit approval for. This uses only what's already in
 * the dependency tree (Framer Motion, CSS) to draw a restrained,
 * abstract "connected route" — three waypoints joined by a drawn path
 * — deliberately echoing the product's own Travel Timeline motif
 * (ICONOGRAPHY_AND_ILLUSTRATION.md §AI Visual Language: "Preferred
 * concepts: ...Path, Compass, Connection... Travel route." "Avoid:
 * Robot heads... talking robots.") rather than a generic gradient blob.
 *
 * Purely decorative: `aria-hidden`, `pointer-events-none`, positioned
 * behind Hero content. Reduced motion swaps the drawing animation for
 * an instantly-complete static state — the shape stays, only the
 * motion is removed, per ACCESSIBILITY.md §Motion Accessibility.
 */
export function AnimatedBackground() {
  const prefersReducedMotion = useReducedMotion();

  const pathTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: DURATION.slowest * 2.5, ease: "easeInOut" as const };

  const dotTransition = (delay: number) =>
    prefersReducedMotion
      ? { duration: 0 }
      : { duration: DURATION.slower, delay, ease: "easeOut" as const };

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      {/* Soft ambient glow — primary/accent at low opacity, never a
          solid fill (DESIGN_TOKENS.md: "Accent should occupy less
          than 10% of any screen"). */}
      <div className="absolute -top-24 start-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute top-32 end-0 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />

      <svg
        viewBox="0 0 800 400"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full opacity-60"
      >
        <motion.path
          d="M 80 320 C 220 220, 300 340, 420 200 S 620 80, 720 140"
          fill="none"
          strokeWidth={2}
          stroke="var(--color-primary)"
          strokeLinecap="round"
          initial={prefersReducedMotion ? undefined : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={pathTransition}
        />
        {[
          { cx: 80, cy: 320, delay: 0 },
          { cx: 420, cy: 200, delay: 0.6 },
          { cx: 720, cy: 140, delay: 1.2 },
        ].map((waypoint) => (
          <motion.circle
            key={`${waypoint.cx}-${waypoint.cy}`}
            cx={waypoint.cx}
            cy={waypoint.cy}
            r={6}
            fill="var(--color-accent)"
            initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={dotTransition(waypoint.delay)}
          />
        ))}
      </svg>
    </div>
  );
}
