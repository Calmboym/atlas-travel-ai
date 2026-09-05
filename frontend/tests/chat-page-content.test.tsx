import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { act, screen, fireEvent, within } from "@testing-library/react";
import { useSearchParams } from "next/navigation";
import { renderWithProviders } from "@/tests/layout-test-utils";
import { ChatPageContent } from "@/components/chat/chat-page-content";
import { streamAssistantReply } from "@/lib/chat/stream-assistant-reply";
import type { StreamAssistantReplyOptions } from "@/lib/chat/stream-assistant-reply";

/**
 * ATLAS-P1-CHAT-01/02 integration coverage.
 * EXTENDED — ATLAS-P1-CHAT-04: lib/chat/stream-assistant-reply.ts (a
 * real fetch()-based network client) replaces the retired
 * lib/chat/simulate-assistant-reply.ts stub, so this suite now mocks
 * that module directly instead of driving a fixed setTimeout sequence
 * with fake timers — completeCurrentTurn() below invokes the captured
 * onDone callback exactly as the real network client eventually would,
 * once a response actually arrives. Fake timers remain in use only for
 * an unrelated reason — see the last test in this file, which settles
 * SheetContent's own CSS closing transition.
 */

vi.mock("@/lib/chat/stream-assistant-reply", () => ({
  streamAssistantReply: vi.fn(),
}));

const mockedStreamAssistantReply = vi.mocked(streamAssistantReply);

function mockSearchParams(query: string): void {
  vi.mocked(useSearchParams).mockReturnValue(
    new URLSearchParams(query) as ReturnType<typeof useSearchParams>,
  );
}

beforeEach(() => {
  vi.useFakeTimers();
  mockSearchParams("");
  mockedStreamAssistantReply.mockReset();
  mockedStreamAssistantReply.mockReturnValue({ stop: vi.fn() });
});

afterEach(() => {
  vi.useRealTimers();
  mockSearchParams("");
});

/** Resolves the most recently started turn — mirrors what a real
 *  network response eventually does, without needing jsdom to
 *  understand a real streamed fetch() body. */
function completeCurrentTurn(text = "Here's a plan for your trip."): void {
  const lastCall = mockedStreamAssistantReply.mock.calls.at(-1);
  if (!lastCall) throw new Error("streamAssistantReply was never called");
  const options = lastCall[0] as StreamAssistantReplyOptions;
  act(() => {
    options.onDone(text);
  });
}

describe("ChatPageContent", () => {
  it("renders exactly one H1 for the page", () => {
    renderWithProviders(<ChatPageContent />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });

  it("shows the welcome empty state before any message is sent", () => {
    renderWithProviders(<ChatPageContent />);
    expect(screen.getByText("Start planning with Atlas")).toBeInTheDocument();
  });

  it("pre-fills the composer from a ?prompt= query param without auto-sending", () => {
    mockSearchParams("prompt=A+week+in+Portugal");
    renderWithProviders(<ChatPageContent />);

    expect(screen.getByLabelText("Message Atlas")).toHaveValue("A week in Portugal");
    // Not sent yet — still on the empty conversation state.
    expect(screen.getByText("Start planning with Atlas")).toBeInTheDocument();
  });

  it("sends an example prompt immediately when clicked", () => {
    renderWithProviders(<ChatPageContent />);
    fireEvent.click(screen.getByRole("button", { name: "Plan a 5-day trip to Lisbon" }));

    // Three legitimate occurrences: the mobile header row's title,
    // the sidebar's conversation label, and the actual message bubble.
    // jsdom doesn't evaluate the `lg:hidden` media query that keeps
    // the mobile header out of view in a real browser, so all three
    // are simultaneously queryable here.
    expect(screen.getAllByText("Plan a 5-day trip to Lisbon")).toHaveLength(3);
    expect(screen.queryByText("Start planning with Atlas")).not.toBeInTheDocument();
  });

  it("runs a full send → thinking → streaming → complete turn and clears the composer", () => {
    renderWithProviders(<ChatPageContent />);
    const textarea = screen.getByLabelText("Message Atlas");

    fireEvent.change(textarea, { target: { value: "Plan a trip to Kyoto" } });
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));

    expect(textarea).toHaveValue("");
    // Mobile header title + sidebar label + user bubble — see the
    // identical note on the example-prompt test above.
    expect(screen.getAllByText("Plan a trip to Kyoto")).toHaveLength(3);
    expect(screen.getByRole("status", { name: "Thinking…" })).toBeInTheDocument();

    completeCurrentTurn("Here's a plan for your trip.");

    expect(screen.queryByRole("status", { name: "Thinking…" })).not.toBeInTheDocument();
    expect(screen.getByText("Here's a plan for your trip.")).toBeInTheDocument();
  });

  it("sends the full message history, oldest first, to the network client", () => {
    renderWithProviders(<ChatPageContent />);
    fireEvent.change(screen.getByLabelText("Message Atlas"), {
      target: { value: "Plan a trip to Kyoto" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));

    expect(mockedStreamAssistantReply).toHaveBeenCalledTimes(1);
    const { messages } = mockedStreamAssistantReply.mock.calls[0][0];
    expect(messages).toEqual([{ role: "user", content: "Plan a trip to Kyoto" }]);
  });

  it("shows a calm, translated error and a working Retry after a failed turn", () => {
    renderWithProviders(<ChatPageContent />);
    fireEvent.change(screen.getByLabelText("Message Atlas"), {
      target: { value: "Plan a trip to Kyoto" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));

    const lastCall = mockedStreamAssistantReply.mock.calls.at(-1);
    const options = lastCall?.[0] as StreamAssistantReplyOptions;
    act(() => {
      options.onError();
    });

    expect(
      screen.getByText("Something interrupted this response. Please try again."),
    ).toBeInTheDocument();

    mockedStreamAssistantReply.mockClear();
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(mockedStreamAssistantReply).toHaveBeenCalledTimes(1);
  });

  it("updates the sidebar with the new conversation's title once a message is sent", () => {
    renderWithProviders(<ChatPageContent />);
    fireEvent.click(screen.getByRole("button", { name: "Plan a 5-day trip to Lisbon" }));
    completeCurrentTurn();

    const sidebar = screen.getByRole("list", { name: "Conversations" });
    expect(within(sidebar).getByRole("button", { name: "Plan a 5-day trip to Lisbon" })).toHaveAttribute(
      "aria-current",
      "true",
    );
  });

  it("Start new chat resets to the empty state", () => {
    renderWithProviders(<ChatPageContent />);
    fireEvent.click(screen.getByRole("button", { name: "Plan a 5-day trip to Lisbon" }));
    completeCurrentTurn();
    expect(screen.queryByText("Start planning with Atlas")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Start new chat" }));
    expect(screen.getByText("Start planning with Atlas")).toBeInTheDocument();
  });

  it("opens the mobile conversation drawer with the same conversation list", () => {
    renderWithProviders(<ChatPageContent />);
    fireEvent.click(screen.getByRole("button", { name: "Plan a 5-day trip to Lisbon" }));
    completeCurrentTurn();

    fireEvent.click(screen.getByRole("button", { name: "Open conversations" }));
    const dialog = screen.getByRole("dialog");
    expect(
      within(dialog).getByRole("button", { name: "Plan a 5-day trip to Lisbon" }),
    ).toBeInTheDocument();
  });

  it("selecting a conversation from the mobile drawer closes it", () => {
    renderWithProviders(<ChatPageContent />);
    fireEvent.click(screen.getByRole("button", { name: "Plan a 5-day trip to Lisbon" }));
    completeCurrentTurn();
    fireEvent.click(screen.getByRole("button", { name: "Start new chat" }));

    fireEvent.click(screen.getByRole("button", { name: "Open conversations" }));
    const dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Plan a 5-day trip to Lisbon" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    // Appears twice once settled: the sidebar's conversation label and
    // the actual message bubble showing that same sent text. Settled
    // via a fake-timer advance rather than waitFor's real-time polling
    // (which doesn't mix with vi.useFakeTimers(), active in this
    // file) — SheetContent's own closing transition can otherwise
    // leave a third, exiting instance briefly mounted.
    act(() => {
      vi.advanceTimersByTime(500);
    });
    // Mobile header title + sidebar label + user bubble, settled past
    // SheetContent's own closing transition.
    expect(screen.getAllByText("Plan a 5-day trip to Lisbon")).toHaveLength(3);
  });
});
