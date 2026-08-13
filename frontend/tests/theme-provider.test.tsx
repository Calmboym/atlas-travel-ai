import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  ThemeProvider,
  useTheme,
  type ThemeSetting,
} from "@/components/providers/theme-provider";
import { THEME_STORAGE_KEY } from "@/lib/theme/theme-script";

/** Minimal, controllable matchMedia mock — same mql object every call,
 *  matching how getSystemPrefersDark()/subscribeSystemPreference() both
 *  call window.matchMedia() independently but must observe the same
 *  state and listener list. */
function mockMatchMedia(prefersDark: boolean) {
  const listeners: Array<(e: { matches: boolean }) => void> = [];
  const mql = {
    matches: prefersDark,
    media: "(prefers-color-scheme: dark)",
    addEventListener: (_: string, cb: (e: { matches: boolean }) => void) => {
      listeners.push(cb);
    },
    removeEventListener: (
      _: string,
      cb: (e: { matches: boolean }) => void,
    ) => {
      const i = listeners.indexOf(cb);
      if (i >= 0) listeners.splice(i, 1);
    },
  };
  window.matchMedia = vi.fn().mockReturnValue(mql);
  return {
    fireChange: (nextPrefersDark: boolean) => {
      mql.matches = nextPrefersDark;
      listeners.forEach((cb) => cb({ matches: nextPrefersDark }));
    },
  };
}

function Probe() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="resolved">{resolvedTheme}</span>
      <button onClick={() => setTheme("dark")}>dark</button>
      <button onClick={() => setTheme("light")}>light</button>
      <button onClick={() => setTheme("system")}>system</button>
    </div>
  );
}

describe("ThemeProvider", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.classList.remove("atlas-theme-transition");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("defaults to system, resolving to light when the OS prefers light", async () => {
    mockMatchMedia(false);
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );

    expect(screen.getByTestId("theme")).toHaveTextContent("system");
    await waitFor(() =>
      expect(screen.getByTestId("resolved")).toHaveTextContent("light"),
    );
  });

  it("defaults to system, resolving to dark when the OS prefers dark", async () => {
    mockMatchMedia(true);
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );

    await waitFor(() =>
      expect(screen.getByTestId("resolved")).toHaveTextContent("dark"),
    );
  });

  it("reads a previously stored explicit preference over the system default", async () => {
    mockMatchMedia(false);
    localStorage.setItem(THEME_STORAGE_KEY, "dark" satisfies ThemeSetting);

    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );

    await waitFor(() =>
      expect(screen.getByTestId("theme")).toHaveTextContent("dark"),
    );
    expect(screen.getByTestId("resolved")).toHaveTextContent("dark");
  });

  it("setTheme updates state, the data-theme attribute, and localStorage", async () => {
    mockMatchMedia(false);
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );

    await user.click(screen.getByRole("button", { name: "dark" }));

    await waitFor(() =>
      expect(screen.getByTestId("theme")).toHaveTextContent("dark"),
    );
    expect(screen.getByTestId("resolved")).toHaveTextContent("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
  });

  it("briefly applies the guarded transition class, then removes it", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mockMatchMedia(false);
    const user = userEvent.setup({ delay: null });
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );

    await user.click(screen.getByRole("button", { name: "dark" }));
    await vi.waitFor(() =>
      expect(
        document.documentElement.classList.contains(
          "atlas-theme-transition",
        ),
      ).toBe(true),
    );

    vi.advanceTimersByTime(200);
    expect(
      document.documentElement.classList.contains("atlas-theme-transition"),
    ).toBe(false);
    vi.useRealTimers();
  });

  it("live-updates resolvedTheme when the OS preference changes while set to system", async () => {
    const { fireChange } = mockMatchMedia(false);
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );
    await waitFor(() =>
      expect(screen.getByTestId("resolved")).toHaveTextContent("light"),
    );

    act(() => fireChange(true));

    await waitFor(() =>
      expect(screen.getByTestId("resolved")).toHaveTextContent("dark"),
    );
  });

  it("does not live-update from OS changes once an explicit preference is set", async () => {
    const { fireChange } = mockMatchMedia(false);
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );

    await user.click(screen.getByRole("button", { name: "light" }));
    await waitFor(() =>
      expect(screen.getByTestId("theme")).toHaveTextContent("light"),
    );

    act(() => fireChange(true)); // OS switches to dark, but user pinned "light"

    expect(screen.getByTestId("resolved")).toHaveTextContent("light");
  });

  it("useTheme throws when used outside a ThemeProvider", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    expect(() => render(<Probe />)).toThrow(
      "useTheme must be used within <ThemeProvider>",
    );
    consoleError.mockRestore();
  });
});
