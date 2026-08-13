import "@testing-library/jest-dom/vitest";

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
}
