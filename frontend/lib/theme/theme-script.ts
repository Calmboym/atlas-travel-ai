/**
 * Blocking, pre-hydration theme script.
 *
 * DESIGN_TOKENS.md Part 5 "Runtime Theme Switching": theme switching must
 * complete "without: Layout Shift, Flash, Re-render Storm, Animation
 * interruption." A flash of the wrong theme on first paint is exactly
 * that "Flash" — it can only be avoided by setting the `data-theme`
 * attribute on <html> synchronously, before React hydrates and before
 * first paint. This string is injected via a plain <script> tag (not a
 * React component) in the root layout's <head>, ahead of any styled
 * content — the one place in the app an inline script is justified.
 *
 * Storage key and resolution order match ThemeProvider exactly:
 * 1. localStorage["atlas-theme"] if present and valid ("light" | "dark").
 * 2. Otherwise system preference via prefers-color-scheme.
 * 3. Otherwise "light" (DESIGN_SYSTEM.md §8: "System theme is default",
 *    and light is the only fully-documented palette — see globals.css
 *    dark-theme placeholder note).
 *
 * Wrapped in try/catch: localStorage can throw in some privacy modes,
 * and this script must never break page load if it does.
 */
export const THEME_STORAGE_KEY = "atlas-theme";

export function getThemeScript(): string {
  return `(function(){try{var k="${THEME_STORAGE_KEY}";var s=localStorage.getItem(k);var t=(s==="light"||s==="dark")?s:(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.setAttribute("data-theme",t);}catch(e){document.documentElement.setAttribute("data-theme","light");}})();`;
}
