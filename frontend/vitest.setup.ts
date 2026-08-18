import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

/**
 * @testing-library/react's automatic per-test DOM cleanup registers
 * itself by checking for a global `afterEach` on `globalThis`. This
 * project's vitest.config.ts does not set `test.globals: true`, so
 * `afterEach`/`describe`/`it` are never injected as true globals —
 * meaning RTL's auto-cleanup silently never registered, and every
 * test's rendered output accumulated in the DOM for the rest of the
 * file. Confirmed empirically: without this, a plain
 * `render(<Button>Go</Button>)` followed by
 * `screen.getByRole("button")` failed with "Found multiple elements
 * with the role button" — one from this test, one left over from the
 * previous one. Explicit registration here is the standard, documented
 * fix (testing-library.com's own Vitest setup guide) and doesn't
 * depend on any implicit global-injection config elsewhere.
 */
afterEach(() => {
  cleanup();
});

/**
 * JSDOM doesn't implement the Pointer Events capture API
 * (hasPointerCapture / setPointerCapture / releasePointerCapture) —
 * Radix UI's interactive primitives (Select, and others that will be
 * added later) call these internally for pointer-driven interactions.
 * This is a well-documented JSDOM gap, not a workaround for anything
 * broken in our own code — the standard fix, used across the Radix
 * ecosystem's own test suites, is a minimal polyfill here.
 */
if (typeof window !== "undefined") {
  if (!Element.prototype.hasPointerCapture) {
    Element.prototype.hasPointerCapture = () => false;
  }
  if (!Element.prototype.setPointerCapture) {
    Element.prototype.setPointerCapture = () => {};
  }
  if (!Element.prototype.releasePointerCapture) {
    Element.prototype.releasePointerCapture = () => {};
  }
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = () => {};
  }

  /**
   * JSDOM does not implement IntersectionObserver at all (a long-
   * standing, well-documented gap — https://github.com/jsdom/jsdom/
   * issues/2032, unresolved). Framer Motion's `whileInView` prop
   * (used by DESIGNSYS-04's FadeIn/SlideIn/ScaleIn/ScrollReveal in
   * components/ui/motion-wrappers.tsx) depends on it internally —
   * without this, `render()`-ing any of those four throws
   * "IntersectionObserver is not defined" before a single assertion
   * runs, confirmed empirically. This minimal polyfill reports every
   * observed element as immediately intersecting, which is the
   * standard approach for testing viewport-triggered animations
   * without real layout/scroll geometry in JSDOM — it makes
   * `whileInView` behave like `animate` for test purposes, which is
   * sufficient to verify the resulting DOM/attributes, not to verify
   * real scroll-triggering behavior (out of scope for a unit test).
   */
  if (!window.IntersectionObserver) {
    class MockIntersectionObserver implements IntersectionObserver {
      readonly root: Element | Document | null = null;
      readonly rootMargin: string = "";
      readonly thresholds: ReadonlyArray<number> = [];
      private callback: IntersectionObserverCallback;

      constructor(callback: IntersectionObserverCallback) {
        this.callback = callback;
      }

      observe(target: Element) {
        this.callback(
          [
            {
              isIntersecting: true,
              target,
              intersectionRatio: 1,
              boundingClientRect: target.getBoundingClientRect(),
              intersectionRect: target.getBoundingClientRect(),
              rootBounds: null,
              time: 0,
            } as IntersectionObserverEntry,
          ],
          this,
        );
      }

      unobserve() {}
      disconnect() {}
      takeRecords(): IntersectionObserverEntry[] {
        return [];
      }
    }

    window.IntersectionObserver =
      MockIntersectionObserver as unknown as typeof IntersectionObserver;
  }

  /**
   * JSDOM doesn't implement matchMedia at all. ThemeProvider (used by
   * every component in components/layout/ that calls useTheme, plus
   * ThemeProvider's own reduced-motion-adjacent consumers) calls it
   * unconditionally on mount — without this, any test that renders
   * ThemeProvider throws "window.matchMedia is not a function" before
   * a single assertion runs. This default always reports "no
   * preference" (matches: false) with working, no-op listener methods
   * so ThemeProvider's subscribe/unsubscribe cycle doesn't itself
   * throw. tests/theme-provider.test.tsx defines its own more
   * elaborate, controllable mock (needed to actually simulate a
   * system-preference change) — that file-scoped assignment still
   * takes precedence within its own test file, same as any other
   * per-file override.
   */
  if (!window.matchMedia) {
    window.matchMedia = ((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    })) as typeof window.matchMedia;
  }
}
