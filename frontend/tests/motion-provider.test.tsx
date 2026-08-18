import { describe, expect, it, vi } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";
import {
  MotionProvider,
  useMotionPreference,
} from "@/components/providers/motion-provider";

/**
 * Mirrors tests/theme-provider.test.tsx's own mockMatchMedia helper —
 * same class of problem (a live-subscribed matchMedia preference),
 * same fix: one stable `mql` object whose `matches` value and
 * registered "change" listeners this helper controls directly, rather
 * than reassigning `window.matchMedia` to a disconnected object per
 * test (which would not be observed by an already-mounted
 * subscription).
 */
function mockReducedMotionMedia(initialMatches: boolean) {
  const listeners: Array<(e: { matches: boolean }) => void> = [];
  const mql = {
    matches: initialMatches,
    media: "(prefers-reduced-motion: reduce)",
    addEventListener: (
      _: string,
      cb: (e: { matches: boolean }) => void,
    ) => {
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
    fireChange: (nextMatches: boolean) => {
      mql.matches = nextMatches;
      listeners.forEach((cb) => cb({ matches: nextMatches }));
    },
  };
}

function Probe() {
  const { prefersReducedMotion } = useMotionPreference();
  return <span data-testid="preference">{String(prefersReducedMotion)}</span>;
}

describe("MotionProvider", () => {
  it("reads the OS reduced-motion preference on mount", () => {
    mockReducedMotionMedia(true);
    render(
      <MotionProvider>
        <Probe />
      </MotionProvider>,
    );
    expect(screen.getByTestId("preference")).toHaveTextContent("true");
  });

  it("defaults to false when the OS has no preference set", () => {
    mockReducedMotionMedia(false);
    render(
      <MotionProvider>
        <Probe />
      </MotionProvider>,
    );
    expect(screen.getByTestId("preference")).toHaveTextContent("false");
  });

  it("updates live when the OS preference changes while mounted", async () => {
    const { fireChange } = mockReducedMotionMedia(false);
    render(
      <MotionProvider>
        <Probe />
      </MotionProvider>,
    );
    expect(screen.getByTestId("preference")).toHaveTextContent("false");

    act(() => fireChange(true));
    await waitFor(() =>
      expect(screen.getByTestId("preference")).toHaveTextContent("true"),
    );

    act(() => fireChange(false));
    await waitFor(() =>
      expect(screen.getByTestId("preference")).toHaveTextContent("false"),
    );
  });

  it("useMotionPreference() outside a provider defaults to false rather than throwing", () => {
    render(<Probe />);
    expect(screen.getByTestId("preference")).toHaveTextContent("false");
  });

  it("renders its children", () => {
    mockReducedMotionMedia(false);
    render(
      <MotionProvider>
        <div data-testid="child">content</div>
      </MotionProvider>,
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });
});
