/**
 * Motion tokens for Framer Motion usage.
 *
 * DESIGN_TOKENS.md "Motion Tokens" gives durations in ms and names two
 * spring curves (spring-soft, spring-gentle) without further numeric
 * spec — Framer Motion springs are defined by stiffness/damping, not
 * duration, so reasonable, restrained values are chosen here consistent
 * with 21_PREMIUM_MICROINTERACTIONS.md's instruction to avoid bounce/
 * overshoot ("Never: Bouncing, Overshooting, Elastic effects").
 *
 * Components MUST import from here rather than passing raw numbers to
 * Framer Motion `transition` props, so every animation traces back to
 * a named Atlas token.
 */

export const DURATION = {
  /** DESIGN_TOKENS.md: instant = 0ms */
  instant: 0,
  /** DESIGN_TOKENS.md: fast = 120ms */
  fast: 0.12,
  /** DESIGN_TOKENS.md: normal = 200ms */
  normal: 0.2,
  /** DESIGN_TOKENS.md: slow = 300ms */
  slow: 0.3,
  /** DESIGN_TOKENS.md: slower = 450ms */
  slower: 0.45,
  /** DESIGN_TOKENS.md: slowest = 700ms */
  slowest: 0.7,
} as const;

export const EASE = {
  /** Standard, natural deceleration — matches CSS `ease-out`. */
  standard: [0, 0, 0.2, 1] as const,
};

/**
 * "spring-gentle" — critically damped, no overshoot. Used for the
 * error-message reveal (21_PREMIUM_MICROINTERACTIONS.md "Error Feedback:
 * Small fade. No shaking. No flashing.") and card entrance.
 */
export const SPRING_GENTLE = {
  type: "spring",
  stiffness: 300,
  damping: 30,
  mass: 0.8,
} as const;

/**
 * "spring-soft" — the second named spring in DESIGN_TOKENS.md, softer /
 * slower settle than spring-gentle. Used for Bottom Sheet motion
 * (DESIGN_TOKENS.md Part 6 "Bottom Sheet > Motion: Spring Gentle" is the
 * documented exception — most other spring-soft usages are inferred from
 * "Glass panels animate softly... Movement 4-8px" rather than a specific
 * named component list). Still critically damped — no overshoot, per
 * PREMIUM_MICROINTERACTIONS.md's "never elastic" rule.
 */
export const SPRING_SOFT = {
  type: "spring",
  stiffness: 220,
  damping: 26,
  mass: 1,
} as const;

/**
 * Press feedback: PREMIUM_MICROINTERACTIONS.md "Button Interactions >
 * On press: Scale to 98%".
 */
export const PRESS_SCALE = 0.98;
