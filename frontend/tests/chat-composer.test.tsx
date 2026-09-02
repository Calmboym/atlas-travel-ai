import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithProviders } from "@/tests/layout-test-utils";
import { ChatComposer } from "@/components/chat/chat-composer";

function Controlled({
  initial = "",
  disabled = false,
  onSend,
}: {
  initial?: string;
  disabled?: boolean;
  onSend: () => void;
}) {
  const [value, setValue] = useState(initial);
  return (
    <ChatComposer value={value} onChange={setValue} onSend={onSend} disabled={disabled} />
  );
}

describe("ChatComposer", () => {
  it("has a real, programmatic label — not just a placeholder", () => {
    renderWithProviders(<Controlled onSend={vi.fn()} />);
    expect(screen.getByLabelText("Message Atlas")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Ask Atlas about your trip…")).toBeInTheDocument();
  });

  it("disables Send while the composer is empty", () => {
    renderWithProviders(<Controlled onSend={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Send message" })).toBeDisabled();
  });

  it("enables Send once there is non-whitespace content", () => {
    renderWithProviders(<Controlled onSend={vi.fn()} />);
    fireEvent.change(screen.getByLabelText("Message Atlas"), {
      target: { value: "Plan a trip" },
    });
    expect(screen.getByRole("button", { name: "Send message" })).toBeEnabled();
  });

  it("stays disabled for whitespace-only content", () => {
    renderWithProviders(<Controlled onSend={vi.fn()} />);
    fireEvent.change(screen.getByLabelText("Message Atlas"), {
      target: { value: "   " },
    });
    expect(screen.getByRole("button", { name: "Send message" })).toBeDisabled();
  });

  it("sends on Enter and prevents the default newline", () => {
    const onSend = vi.fn();
    renderWithProviders(<Controlled initial="Ready to send" onSend={onSend} />);
    fireEvent.keyDown(screen.getByLabelText("Message Atlas"), {
      key: "Enter",
      shiftKey: false,
    });
    expect(onSend).toHaveBeenCalledOnce();
  });

  it("does not send on Shift+Enter, allowing a newline instead", () => {
    const onSend = vi.fn();
    renderWithProviders(<Controlled initial="Line one" onSend={onSend} />);
    fireEvent.keyDown(screen.getByLabelText("Message Atlas"), {
      key: "Enter",
      shiftKey: true,
    });
    expect(onSend).not.toHaveBeenCalled();
  });

  it("clicking Send calls onSend", () => {
    const onSend = vi.fn();
    renderWithProviders(<Controlled initial="Click to send" onSend={onSend} />);
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));
    expect(onSend).toHaveBeenCalledOnce();
  });

  it("disables the textarea and Send while a response is streaming", () => {
    renderWithProviders(<Controlled initial="Queued" disabled onSend={vi.fn()} />);
    expect(screen.getByLabelText("Message Atlas")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Send message" })).toBeDisabled();
  });

  it("shows the keyboard hint", () => {
    renderWithProviders(<Controlled onSend={vi.fn()} />);
    expect(
      screen.getByText("Press Enter to send. Use Shift + Enter for a new line."),
    ).toBeInTheDocument();
  });
});
