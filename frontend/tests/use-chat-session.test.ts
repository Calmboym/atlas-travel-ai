import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useChatSession } from "@/lib/chat/use-chat-session";

const PREVIEW_REPLY = "This is the preview reply.";

function setup(prefersReducedMotion = false) {
  return renderHook(() =>
    useChatSession({ previewReply: PREVIEW_REPLY, prefersReducedMotion }),
  );
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useChatSession", () => {
  it("starts with a single empty conversation", () => {
    const { result } = setup();
    expect(result.current.conversations).toHaveLength(1);
    expect(result.current.activeConversation.messages).toHaveLength(0);
    expect(result.current.activeConversation.title).toBeNull();
    expect(result.current.isStreaming).toBe(false);
  });

  it("appends the user message immediately and titles the conversation from it", () => {
    const { result } = setup();
    act(() => result.current.sendMessage("Plan a trip to Rome"));

    expect(result.current.activeConversation.messages[0]).toMatchObject({
      role: "user",
      content: "Plan a trip to Rome",
      status: "complete",
    });
    expect(result.current.activeConversation.title).toBe("Plan a trip to Rome");
  });

  it("ignores blank input", () => {
    const { result } = setup();
    act(() => result.current.sendMessage("   "));
    expect(result.current.activeConversation.messages).toHaveLength(0);
  });

  it("streams the assistant reply progressively, then completes", () => {
    const { result } = setup();
    act(() => result.current.sendMessage("Hi"));

    // Assistant turn starts as an empty streaming message (renders as
    // TypingIndicator in ConversationPanel) before the thinking delay
    // elapses.
    expect(result.current.activeConversation.messages[1]).toMatchObject({
      role: "assistant",
      status: "streaming",
      content: "",
    });
    expect(result.current.isStreaming).toBe(true);

    act(() => {
      vi.advanceTimersByTime(500); // past the ~450ms thinking delay
    });
    const midStreamContent = result.current.activeConversation.messages[1].content;
    expect(midStreamContent.length).toBeGreaterThan(0);
    expect(midStreamContent.length).toBeLessThan(PREVIEW_REPLY.length);
    expect(result.current.isStreaming).toBe(true);

    act(() => {
      vi.advanceTimersByTime(10000); // comfortably past full reveal
    });
    expect(result.current.activeConversation.messages[1]).toMatchObject({
      status: "complete",
      content: PREVIEW_REPLY,
    });
    expect(result.current.isStreaming).toBe(false);
  });

  it("delivers the full reply instantly when reduced motion is preferred", () => {
    const { result } = setup(true);
    act(() => result.current.sendMessage("Hi"));
    expect(result.current.activeConversation.messages[1].status).toBe("streaming");

    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current.activeConversation.messages[1]).toMatchObject({
      status: "complete",
      content: PREVIEW_REPLY,
    });
  });

  it("does not start a second turn while one is already streaming", () => {
    const { result } = setup();
    act(() => result.current.sendMessage("First"));
    act(() => result.current.sendMessage("Second while streaming"));
    expect(result.current.activeConversation.messages).toHaveLength(2);
  });

  it("stopGenerating finalizes the message with whatever content had streamed so far", () => {
    const { result } = setup();
    act(() => result.current.sendMessage("Hi"));
    act(() => vi.advanceTimersByTime(500));
    const partial = result.current.activeConversation.messages[1].content;
    expect(partial.length).toBeGreaterThan(0);

    act(() => result.current.stopGenerating());

    expect(result.current.activeConversation.messages[1]).toMatchObject({
      status: "complete",
      content: partial,
    });
    expect(result.current.isStreaming).toBe(false);

    // Further timer advances must not resurrect the cancelled stream.
    act(() => vi.advanceTimersByTime(10000));
    expect(result.current.activeConversation.messages[1].content).toBe(partial);
  });

  it("regenerateLastResponse drops the old assistant turn and starts a fresh one", () => {
    const { result } = setup();
    act(() => result.current.sendMessage("Hi"));
    act(() => vi.advanceTimersByTime(10000));
    expect(result.current.activeConversation.messages).toHaveLength(2);

    act(() => result.current.regenerateLastResponse());
    // Old assistant message removed, new streaming one appended — still
    // exactly [user, assistant], not accumulating a third message.
    expect(result.current.activeConversation.messages).toHaveLength(2);
    expect(result.current.activeConversation.messages[1].status).toBe("streaming");

    act(() => vi.advanceTimersByTime(10000));
    expect(result.current.activeConversation.messages[1]).toMatchObject({
      status: "complete",
      content: PREVIEW_REPLY,
    });
  });

  it("retryLastMessage behaves the same as regenerateLastResponse (no distinct failure path in this stub)", () => {
    const { result } = setup();
    expect(result.current.retryLastMessage).toBe(result.current.regenerateLastResponse);
  });

  it("startNewConversation prepends and activates a fresh conversation", () => {
    const { result } = setup();
    act(() => result.current.sendMessage("First conversation"));
    const firstId = result.current.activeConversationId;

    act(() => result.current.startNewConversation());

    expect(result.current.conversations).toHaveLength(2);
    expect(result.current.activeConversationId).not.toBe(firstId);
    expect(result.current.activeConversation.messages).toHaveLength(0);
    // Prepended: newest conversation listed first.
    expect(result.current.conversations[0].id).toBe(result.current.activeConversationId);
  });

  it("selectConversation switches the active conversation without losing the other's history", () => {
    const { result } = setup();
    act(() => result.current.sendMessage("Conversation one"));
    act(() => vi.advanceTimersByTime(10000));
    const firstId = result.current.activeConversationId;

    act(() => result.current.startNewConversation());
    act(() => result.current.sendMessage("Conversation two"));
    act(() => vi.advanceTimersByTime(10000));

    act(() => result.current.selectConversation(firstId));
    expect(result.current.activeConversation.messages[0].content).toBe("Conversation one");
  });
});
