import { afterEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { AnimatedBackground } from "@/components/landing/animated-background";

/**
 * Mirrors tests/motion-provider.test.tsx's own mockReducedMotionMedia
 * helper: framer-motion's `useReducedMotion()` reads
 * `window.matchMedia("(prefers-reduced-motion: reduce)")` directly, so
 * driving that media query is how this codebase tests reduced-motion
 * branches — `vi.spyOn` on framer-motion's named export does not work
 * here (confirmed empirically: "Cannot spy on export... Module
 * namespace is not configurable in ESM").
 */
function mockReducedMotionMedia(matches: boolean) {
  window.matchMedia = vi.fn().mockReturnValue({
    matches,
    media: "(prefers-reduced-motion: reduce)",
    addEventListener: () => {},
    removeEventListener: () => {},
    // framer-motion's own `useReducedMotion()` (unlike MotionProvider's
    // custom useSyncExternalStore-based implementation, which uses the
    // modern API) calls the legacy `addListener`/`removeListener`
    // MediaQueryList methods directly — confirmed by an uncaught
    // "motionMediaQuery.addListener is not a function" exception when
    // this mock only implemented the modern pair.
    addListener: () => {},
    removeListener: () => {},
  });
}

describe("AnimatedBackground", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("is hidden from assistive technology and does not intercept pointer events", () => {
    mockReducedMotionMedia(false);
    const { container } = render(<AnimatedBackground />);
    const root = container.firstElementChild;
    expect(root).toHaveAttribute("aria-hidden", "true");
    expect(root).toHaveClass("pointer-events-none");
  });

  it("still renders the route path and waypoints when reduced motion is preferred", () => {
    mockReducedMotionMedia(true);
    const { container } = render(<AnimatedBackground />);
    expect(container.querySelector("path")).toBeInTheDocument();
    expect(container.querySelectorAll("circle")).toHaveLength(3);
  });
});
