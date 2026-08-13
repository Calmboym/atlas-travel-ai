"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { THEME_STORAGE_KEY } from "@/lib/theme/theme-script";

/** The user's stored preference. "system" follows the OS setting. */
export type ThemeSetting = "light" | "dark" | "system";

/** What's actually applied to the page right now — never "system". */
export type ResolvedTheme = "light" | "dark";

interface ThemeContextValue {
  /** The user's chosen setting (DESIGN_SYSTEM.md §8: Light / Dark / System). */
  theme: ThemeSetting;
  /** "system" resolved to a concrete value via prefers-color-scheme. */
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemeSetting) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const VALID_SETTINGS: readonly ThemeSetting[] = ["light", "dark", "system"];

/**
 * Same-tab change signal. The native `storage` event only fires in OTHER
 * tabs/windows, never the one that made the write — this event is
 * dispatched manually by setTheme() so this tab's own store subscribers
 * also re-check their snapshot.
 */
const LOCAL_CHANGE_EVENT = "atlas-theme-local-change";

function getStoredSetting(): ThemeSetting {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return stored && VALID_SETTINGS.includes(stored as ThemeSetting)
      ? (stored as ThemeSetting)
      : "system";
  } catch {
    return "system";
  }
}

function getServerSetting(): ThemeSetting {
  return "system";
}

function subscribeSetting(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(LOCAL_CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(LOCAL_CHANGE_EVENT, callback);
  };
}

function getSystemPrefersDark(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function getServerSystemPrefersDark(): boolean {
  return false;
}

function subscribeSystemPreference(callback: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

/**
 * Wrap the app in this once, in the root layout, alongside the blocking
 * script from theme-script.ts. Provides useTheme() to any descendant.
 *
 * Built on useSyncExternalStore rather than useState+useEffect: this is
 * React's own designed-for-this-exact-case primitive for reading browser
 * state (localStorage, matchMedia) that the server can't know about —
 * it uses `getServerSnapshot` during SSR/hydration and transparently
 * re-syncs to the real value right after, with no manual effect/setState
 * dance and no risk of the "cascading renders" antipattern
 * react-hooks/set-state-in-effect exists to catch.
 *
 * Transition handling: DESIGN_TOKENS.md Part 5 requires theme switches to
 * complete in "<150ms perceived transition" with no flash/layout shift.
 * The `atlas-theme-transition` class (globals.css) is added only for the
 * brief window around a change that happens AFTER mount — never on the
 * very first render, which would itself look like an unwanted animation.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(
    subscribeSetting,
    getStoredSetting,
    getServerSetting,
  );
  const systemPrefersDark = useSyncExternalStore(
    subscribeSystemPreference,
    getSystemPrefersDark,
    getServerSystemPrefersDark,
  );
  const resolvedTheme: ResolvedTheme =
    theme === "system" ? (systemPrefersDark ? "dark" : "light") : theme;

  const isFirstRender = useRef(true);
  const transitionTimeout = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  // Sync the resolved theme onto the DOM attribute (the blocking script
  // in theme-script.ts already did this before hydration for the
  // no-flash first paint; this keeps it correct for every change after
  // that). This is exactly the "update external systems with the latest
  // state from React" case effects are meant for — no setState here.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", resolvedTheme);

    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const root = document.documentElement;
    root.classList.add("atlas-theme-transition");
    if (transitionTimeout.current) clearTimeout(transitionTimeout.current);
    // DESIGN_TOKENS.md duration-fast = 120ms; small buffer so the
    // transition is never cut off mid-flight.
    transitionTimeout.current = setTimeout(() => {
      root.classList.remove("atlas-theme-transition");
    }, 160);

    return () => {
      if (transitionTimeout.current) clearTimeout(transitionTimeout.current);
    };
  }, [resolvedTheme]);

  const setTheme = useCallback((next: ThemeSetting) => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Storage can throw (private browsing, quota). The dispatch below
      // still updates this tab's UI for the current session even if
      // persistence failed.
    }
    window.dispatchEvent(new Event(LOCAL_CHANGE_EVENT));
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within <ThemeProvider>");
  }
  return ctx;
}
