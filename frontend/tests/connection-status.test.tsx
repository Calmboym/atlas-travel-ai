import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ConnectionStatus } from "@/components/shared/connection-status";

describe("ConnectionStatus", () => {
  it("announces the given label via role=status regardless of state", () => {
    render(<ConnectionStatus state="reconnecting" label="Reconnecting…" />);
    expect(screen.getByRole("status")).toHaveTextContent("Reconnecting…");
  });

  it("never communicates state through color alone — the dot is decorative", () => {
    render(<ConnectionStatus state="offline" label="Offline" />);
    const status = screen.getByRole("status");
    // The colored dot must be aria-hidden — the real signal is the
    // (already-asserted) text label a screen reader announces.
    expect(status.querySelector("[aria-hidden='true']")).toBeInTheDocument();
  });
});
