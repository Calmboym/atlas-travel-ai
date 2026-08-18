/**
 * ACCESSIBILITY.md §Skip Links: "Every page includes: Skip to Main
 * Content. Visible on keyboard focus." Sighted mouse users never see
 * this — it's positioned off-screen until it receives keyboard focus,
 * then becomes the first visibly focusable element on the page, ahead
 * of the Navbar's own links.
 *
 * Targets `#main-content`, which every one of the three DESIGNSYS-03
 * layouts (Marketing/Application/Focus) renders on its `<main>`. Uses a
 * plain anchor rather than the locale-aware `Link` from i18n/navigation
 * deliberately — this is an in-document fragment jump, not a route
 * change, so locale-prefixing logic doesn't apply and would be wrong.
 */
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only rounded-lg bg-surface px-4 py-3 text-sm font-semibold text-text-primary shadow-md focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-toast focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      Skip to main content
    </a>
  );
}
