"use client";

import {
  createContext,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { MotionConfig } from "framer-motion";

/**
 * App-wide reduced-motion provider. ACCESSIBILITY.md §Motion
 * Accessibility: "Respect prefers-reduced-motion. When enabled: Remove
 * large transitions, Disable parallax, Disable floating animations,
 * Disable decorative GSAP timelines, Disable Three.js camera motion.
 * Maintain usability." MOTION_SYSTEM.md §18/§22: "Reduced Motion
 * Compatible... Retain usability."
 *
 * Wraps children in Framer Motion's own <MotionConfig
 * reducedMotion="user">, which is the correct, live mechanism for
 * suppressing `motion.*` animation values app-wide — this part *is*
 * genuinely reactive to a live OS preference change, per Framer
 * Motion's own animation engine (distinct from the hook noted below).
 *
 * `useMotionPreference()` additionally exposes the resolved boolean
 * directly, for the cases MotionConfig alone can't cover: deciding
 * whether to attach a scroll/parallax listener or mount a decorative
 * effect at all, rather than merely animating it without motion.
 *
 * DELIBERATELY NOT built on framer-motion's own exported
 * `useReducedMotion()` hook. Reading that hook's actual installed
 * source (framer-motion@11.18.2, dist/es/utils/reduced-motion/
 * use-reduced-motion.mjs) shows it calls
 * `const [shouldReduceMotion] = useState(prefersReducedMotion.current)`
 * — the setter is destructured away and never used, so despite the
 * hook's own JSDoc claiming "It will actively respond to changes and
 * re-render your components," an already-mounted component's return
 * value is frozen at first-mount and never updates again (the
 * library's own source even carries a TODO: "See if people miss
 * automatically updating shouldReduceMotion setting"). Confirmed
 * empirically via tests/motion-provider.test.tsx before this was
 * rewritten to use React's own useSyncExternalStore instead — the
 * exact same primitive, and the exact same
 * getSnapshot/getServerSnapshot/subscribe shape, ThemeProvider already
 * uses for the equivalent prefers-color-scheme case (see
 * components/providers/theme-provider.tsx's getSystemPrefersDark /
 * subscribeSystemPreference). This is a real, verified live
 * subscription, not an assumption carried over from the library's
 * docstring.
 */
interface MotionPreferenceContextValue {
  /** True when the OS currently prefers reduced motion. Updates live
   *  if the OS setting changes while the app is open. */
  prefersReducedMotion: boolean;
}

const MotionPreferenceContext = createContext<MotionPreferenceContextValue>({
  prefersReducedMotion: false,
});

export function useMotionPreference(): MotionPreferenceContextValue {
  return useContext(MotionPreferenceContext);
}

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function getPrefersReducedMotion(): boolean {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function getServerPrefersReducedMotion(): boolean {
  return false;
}

function subscribePrefersReducedMotion(callback: () => void) {
  const media = window.matchMedia(REDUCED_MOTION_QUERY);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

export function MotionProvider({ children }: { children: ReactNode }) {
  const prefersReducedMotion = useSyncExternalStore(
    subscribePrefersReducedMotion,
    getPrefersReducedMotion,
    getServerPrefersReducedMotion,
  );

  return (
    <MotionPreferenceContext.Provider value={{ prefersReducedMotion }}>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </MotionPreferenceContext.Provider>
  );
}
