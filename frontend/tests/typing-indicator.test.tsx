import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/tests/layout-test-utils";
import { TypingIndicator } from "@/components/chat/typing-indicator";

describe("TypingIndicator", () => {
  it("announces a status role with the thinking label", () => {
    renderWithProviders(<TypingIndicator />);
    const status = screen.getByRole("status");
    expect(status).toHaveAccessibleName("Thinking…");
  });

  it("shows the contextual status text visibly, not just to screen readers", () => {
    renderWithProviders(<TypingIndicator />);
    expect(screen.getByText("Thinking…")).toBeInTheDocument();
  });

  it("hides its decorative dots from assistive technology", () => {
    const { container } = renderWithProviders(<TypingIndicator />);
    const dotsWrapper = container.querySelector('[aria-hidden="true"]');
    expect(dotsWrapper).toBeInTheDocument();
    expect(dotsWrapper?.querySelectorAll("span")).toHaveLength(3);
  });
});
