import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import { renderWithProviders } from "./layout-test-utils";
import { AISearchBox } from "@/components/landing/ai-search-box";

function mockPush() {
  const push = vi.fn();
  vi.mocked(useRouter).mockReturnValue({
    push,
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  } as unknown as ReturnType<typeof useRouter>);
  return push;
}

describe("AISearchBox", () => {
  it("shows one of the eight documented example prompts as the initial placeholder", () => {
    renderWithProviders(<AISearchBox />);
    const input = screen.getByLabelText("Describe your trip");
    expect(input).toHaveAttribute(
      "placeholder",
      "A romantic weekend in Italy",
    );
  });

  it("disables submit until text is entered, then navigates to /chat with the prompt", async () => {
    const push = mockPush();
    const user = userEvent.setup();
    renderWithProviders(<AISearchBox />);

    const submit = screen.getByRole("button", { name: "Start planning" });
    expect(submit).toBeDisabled();

    const input = screen.getByLabelText("Describe your trip");
    await user.type(input, "10 days in Portugal");
    expect(submit).toBeEnabled();

    await user.click(submit);
    expect(push).toHaveBeenCalledWith(
      "/en/chat?prompt=10%20days%20in%20Portugal",
    );
  });

  it("submits immediately when an example chip is clicked", async () => {
    const push = mockPush();
    const user = userEvent.setup();
    renderWithProviders(<AISearchBox />);

    await user.click(
      screen.getByRole("button", { name: "Cheap trip from Germany" }),
    );

    expect(push).toHaveBeenCalledWith(
      "/en/chat?prompt=Cheap%20trip%20from%20Germany",
    );
  });

  it("never renders a filter control (INFORMATION_ARCHITECTURE.md: natural language only)", () => {
    renderWithProviders(<AISearchBox />);
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });
});
