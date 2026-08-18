import { cn } from "@/lib/utils/cn";

/**
 * DESIGN_TOKENS.md §Background Tint: "Glass never floats on a pure
 * white surface. Every glass panel inherits subtle background tint...
 * Never completely transparent." — already satisfied app-wide by
 * `body { background-color: var(--color-background) }` in
 * app/globals.css (DESIGNSYS-01). BackgroundSystem's own job is the
 * one piece of the Glass Design Language's background layer not yet
 * wired anywhere: the optional §Noise Texture ("Very subtle. Maximum
 * opacity 2%... Never visible as a pattern") that keeps large flat
 * surfaces from reading as digitally flat, per 13_ICONOGRAPHY_AND_
 * ILLUSTRATION.md §Texture ("Use minimal texture. Flat surfaces are
 * preferred. Noise effects should be extremely subtle.").
 *
 * Rendered once, globally, in app/[locale]/layout.tsx — the same
 * "genuinely global, layout-agnostic concern" treatment DESIGNSYS-03
 * gave SkipLink, so every layout (Marketing/Application/Focus/Auth)
 * gets it automatically. Sits at the literal bottom of DESIGN_TOKENS.md's
 * Layer Hierarchy ("Background ↓ Illustration ↓ Glass Panels ↓
 * Interactive Controls..."), beneath every `.atlas-glass-*` surface and
 * all real content — `fixed`, `-z-10`, `pointer-events-none`, and
 * `aria-hidden` so it can never sit above interactive UI, intercept a
 * click, or be announced to assistive technology (ACCESSIBILITY.md:
 * decorative-only visuals get an empty/absent accessible name).
 *
 * Static, not animated — MOTION_SYSTEM.md's reduced-motion rules don't
 * apply here (there's nothing moving to strip), so this does not
 * depend on MotionProvider.
 *
 * Landing-specific expressive backgrounds (3D globe, animated
 * gradients, floating illustrations — DESIGN_TOKENS.md §Landing Style,
 * "may be slightly more expressive... The Dashboard should be calmer")
 * are explicit LAND-01 Feature Component work, not part of this
 * Foundation layer — BackgroundSystem only ever renders the universal,
 * calm base every screen shares.
 */
export interface BackgroundSystemProps {
  /** Escape hatch for a screen that genuinely wants zero texture
   *  (none currently do — kept for parity with how other Foundation
   *  primitives expose an off-switch rather than requiring a
   *  conditional wrapper at every call site). Defaults to on. */
  noise?: boolean;
  className?: string;
}

export function BackgroundSystem({ noise = true, className }: BackgroundSystemProps) {
  if (!noise) return null;

  return (
    <div
      aria-hidden="true"
      className={cn(
        "atlas-noise pointer-events-none fixed inset-0 -z-10",
        className,
      )}
    />
  );
}
