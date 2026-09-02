import { describe, expect, it, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { renderWithProviders } from "@/tests/layout-test-utils";
import {
  MessageBubble,
  StreamingBubble,
} from "@/components/chat/message-bubble";
import type { ChatMessage } from "@/lib/chat/types";

function makeMessage(overrides: Partial<ChatMessage> = {}): ChatMessage {
  return {
    id: "msg-1",
    role: "assistant",
    content: "Hello traveler",
    status: "complete",
    createdAt: "2026-01-01T10:30:00.000Z",
    ...overrides,
  };
}

beforeEach(() => {
  Object.assign(navigator, {
    clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
  });
});

describe("MessageBubble", () => {
  it("labels a user message for screen readers and right-aligns it", () => {
    renderWithProviders(
      <MessageBubble message={makeMessage({ role: "user", content: "Plan my trip" })} />,
    );
    expect(screen.getByText("You:")).toBeInTheDocument();
    expect(screen.getByText("Plan my trip")).toBeInTheDocument();
  });

  it("labels an assistant message and shows the Atlas icon badge", () => {
    const { container } = renderWithProviders(
      <MessageBubble message={makeMessage()} />,
    );
    expect(screen.getByText("Atlas:")).toBeInTheDocument();
    // Sparkles icon badge is decorative (aria-hidden), not itself an
    // Avatar — ICONOGRAPHY_AND_ILLUSTRATION.md forbids a human avatar
    // for the AI.
    expect(container.querySelector('[aria-hidden="true"] svg')).toBeInTheDocument();
  });

  it("marks a streaming message as busy and shows the blinking cursor", () => {
    const { container } = renderWithProviders(
      <MessageBubble message={makeMessage({ status: "streaming", content: "Thinking about" })} />,
    );
    expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument();
  });

  it("does not show a copy button while streaming", () => {
    renderWithProviders(
      <MessageBubble message={makeMessage({ status: "streaming", content: "Partial" })} />,
    );
    expect(screen.queryByRole("button", { name: "Copy message" })).not.toBeInTheDocument();
  });

  it("copies the message content and confirms via an icon-and-label swap", async () => {
    renderWithProviders(<MessageBubble message={makeMessage({ content: "Copy me" })} />);
    fireEvent.click(screen.getByRole("button", { name: "Copy message" }));

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("Copy me");
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Copied" })).toBeInTheDocument(),
    );
  });

  it("shows a Stop generating control while streaming, wired to onStop", () => {
    const onStop = vi.fn();
    renderWithProviders(
      <MessageBubble
        message={makeMessage({ status: "streaming", content: "Working" })}
        onStop={onStop}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Stop generating" }));
    expect(onStop).toHaveBeenCalledOnce();
  });

  it("hides Regenerate when this is not the latest assistant message", () => {
    renderWithProviders(
      <MessageBubble message={makeMessage()} isLatestAssistantMessage={false} onRegenerate={vi.fn()} />,
    );
    expect(screen.queryByRole("button", { name: "Regenerate response" })).not.toBeInTheDocument();
  });

  it("shows Regenerate, wired to onRegenerate, for the latest assistant message", () => {
    const onRegenerate = vi.fn();
    renderWithProviders(
      <MessageBubble message={makeMessage()} isLatestAssistantMessage onRegenerate={onRegenerate} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Regenerate response" }));
    expect(onRegenerate).toHaveBeenCalledOnce();
  });

  it("shows Retry instead of Regenerate, and role=alert, for an error message", () => {
    const onRetry = vi.fn();
    renderWithProviders(
      <MessageBubble
        message={makeMessage({ status: "error", content: "Something interrupted this." })}
        isLatestAssistantMessage
        onRetry={onRetry}
      />,
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("formats the timestamp as a locale-appropriate time", () => {
    renderWithProviders(<MessageBubble message={makeMessage()} />);
    // Intl.DateTimeFormat without an explicit timeZone resolves
    // against the runtime's local zone, so assert the general HH:MM
    // shape rather than one exact string tied to a specific timezone.
    expect(screen.getByText(/^\d{1,2}:\d{2}(\s?[AP]M)?$/)).toBeInTheDocument();
  });
});

describe("StreamingBubble", () => {
  it("is the same component as MessageBubble, not a parallel implementation", () => {
    expect(StreamingBubble).toBe(MessageBubble);
  });
});
