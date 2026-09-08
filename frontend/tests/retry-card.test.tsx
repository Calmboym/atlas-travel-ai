import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RetryCard } from "@/components/shared/retry-card";

describe("RetryCard", () => {
  it("renders as an alert with title, description, and calls onRetry when clicked", async () => {
    const onRetry = vi.fn();
    const user = userEvent.setup();
    render(
      <RetryCard
        title="We couldn't load this"
        description="Please check your connection and try again."
        retryLabel="Retry"
        onRetry={onRetry}
      />,
    );

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("We couldn't load this");
    expect(alert).toHaveTextContent("Please check your connection and try again.");

    await user.click(screen.getByRole("button", { name: "Retry" }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("disables the retry button and shows a busy state while isRetrying", () => {
    render(
      <RetryCard
        title="We couldn't load this"
        retryLabel="Retry"
        onRetry={vi.fn()}
        isRetrying
      />,
    );
    const button = screen.getByRole("button", { name: "Retry" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
  });
});
