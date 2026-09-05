import { describe, expect, it, beforeEach, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useChatSession } from "@/lib/chat/use-chat-session";
import { streamAssistantReply } from "@/lib/chat/stream-assistant-reply";
import type { StreamAssistantReplyOptions } from "@/lib/chat/stream-assistant-reply";

/**
 * EXTENDED — ATLAS-P1-CHAT-04. Mocks lib/chat/stream-assistant-reply.ts
 * (a real fetch()-based network client) instead of driving the
 * retired lib/chat/simulate-assistant-reply.ts stub with fake timers —
 * each test captures the `options` passed to the mocked function and
 * invokes onChunk/onDone/onError itself, exactly mirroring what a real
 * network response eventually does.
 */

vi.mock("@/lib/chat/stream-assistant-reply", () => ({
  streamAssistantReply: vi.fn(),
}));

const mockedStreamAssistantReply = vi.mocked(streamAssistantReply);
const ERROR_MESSAGE = "Something interrupted this response. Please try again.";

function setup() {
  return renderHook(() => useChatSession({ errorMessage: ERROR_MESSAGE }));
}

/** The options object passed to the most recent streamAssistantReply call. */
function lastCallOptions(): StreamAssistantReplyOptions {
  const call = mockedStreamAssistantReply.mock.calls.at(-1);
  if (!call) throw new Error("streamAssistantReply was never called");
  return call[0];
}

beforeEach(() => {
  mockedStreamAssistantReply.mockReset();
  mockedStreamAssistantReply.mockReturnValue({ stop: vi.fn() });
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
    expect(mockedStreamAssistantReply).not.toHaveBeenCalled();
  });

  it("sends only role/content for every prior message, ending with the new user turn", () => {
    const { result } = setup();
    act(() => result.current.sendMessage("Hi"));
    act(() => lastCallOptions().onDone("Hello! Where would you like to go?"));

    act(() => result.current.sendMessage("Somewhere warm in December"));

    expect(mockedStreamAssistantReply).toHaveBeenCalledTimes(2);
    expect(lastCallOptions().messages).toEqual([
      { role: "user", content: "Hi" },
      { role: "assistant", content: "Hello! Where would you like to go?" },
      { role: "user", content: "Somewhere warm in December" },
    ]);
  });

  it("starts the assistant turn as an empty streaming message immediately", () => {
    const { result } = setup();
    act(() => result.current.sendMessage("Hi"));

    expect(result.current.activeConversation.messages[1]).toMatchObject({
      role: "assistant",
      status: "streaming",
      content: "",
    });
    expect(result.current.isStreaming).toBe(true);
    expect(mockedStreamAssistantReply).toHaveBeenCalledTimes(1);
  });

  it("reflects each onChunk call, then completes on onDone", () => {
    const { result } = setup();
    act(() => result.current.sendMessage("Hi"));

    act(() => lastCallOptions().onChunk("Rome"));
    expect(result.current.activeConversation.messages[1].content).toBe("Rome");
    expect(result.current.isStreaming).toBe(true);

    act(() => lastCallOptions().onChunk("Rome is lovely in"));
    expect(result.current.activeConversation.messages[1].content).toBe("Rome is lovely in");

    act(() => lastCallOptions().onDone("Rome is lovely in October."));
    expect(result.current.activeConversation.messages[1]).toMatchObject({
      status: "complete",
      content: "Rome is lovely in October.",
    });
    expect(result.current.isStreaming).toBe(false);
  });

  it("marks the turn as a translated, calm error on failure", () => {
    const { result } = setup();
    act(() => result.current.sendMessage("Hi"));
    act(() => lastCallOptions().onChunk("Ro"));

    act(() => lastCallOptions().onError());

    expect(result.current.activeConversation.messages[1]).toMatchObject({
      status: "error",
      content: ERROR_MESSAGE,
    });
    expect(result.current.isStreaming).toBe(false);
  });

  it("does not resend a failed turn's error text as conversation history", () => {
    const { result } = setup();
    act(() => result.current.sendMessage("Hi"));
    act(() => lastCallOptions().onError());

    act(() => result.current.retryLastMessage());

    expect(lastCallOptions().messages).toEqual([{ role: "user", content: "Hi" }]);
  });

  it("does not start a second turn while one is already streaming", () => {
    const { result } = setup();
    act(() => result.current.sendMessage("First"));
    act(() => result.current.sendMessage("Second while streaming"));
    expect(result.current.activeConversation.messages).toHaveLength(2);
    expect(mockedStreamAssistantReply).toHaveBeenCalledTimes(1);
  });

  it("stopGenerating finalizes the message with whatever content had streamed so far, and calls the handle's own stop()", () => {
    const stop = vi.fn();
    mockedStreamAssistantReply.mockReturnValue({ stop });
    const { result } = setup();
    act(() => result.current.sendMessage("Hi"));
    act(() => lastCallOptions().onChunk("Rome is"));

    act(() => result.current.stopGenerating());

    expect(stop).toHaveBeenCalledTimes(1);
    expect(result.current.activeConversation.messages[1]).toMatchObject({
      status: "complete",
      content: "Rome is",
    });
    expect(result.current.isStreaming).toBe(false);

    // A late onChunk from an aborted network call must not resurrect it.
    act(() => lastCallOptions().onChunk("Rome is lovely"));
    expect(result.current.activeConversation.messages[1].content).toBe("Rome is");
  });

  it("regenerateLastResponse drops the old assistant turn and starts a fresh one", () => {
    const { result } = setup();
    act(() => result.current.sendMessage("Hi"));
    act(() => lastCallOptions().onDone("First reply."));
    expect(result.current.activeConversation.messages).toHaveLength(2);

    act(() => result.current.regenerateLastResponse());
    // Old assistant message removed, new streaming one appended — still
    // exactly [user, assistant], not accumulating a third message.
    expect(result.current.activeConversation.messages).toHaveLength(2);
    expect(result.current.activeConversation.messages[1].status).toBe("streaming");
    expect(mockedStreamAssistantReply).toHaveBeenCalledTimes(2);

    act(() => lastCallOptions().onDone("Second reply."));
    expect(result.current.activeConversation.messages[1]).toMatchObject({
      status: "complete",
      content: "Second reply.",
    });
  });

  it("retryLastMessage is the same function as regenerateLastResponse", () => {
    const { result } = setup();
    expect(result.current.retryLastMessage).toBe(result.current.regenerateLastResponse);
  });

  it("startNewConversation prepends and activates a fresh conversation, stopping any in-flight stream", () => {
    const stop = vi.fn();
    mockedStreamAssistantReply.mockReturnValue({ stop });
    const { result } = setup();
    act(() => result.current.sendMessage("First conversation"));
    const firstId = result.current.activeConversationId;

    act(() => result.current.startNewConversation());

    expect(stop).toHaveBeenCalledTimes(1);
    expect(result.current.conversations).toHaveLength(2);
    expect(result.current.activeConversationId).not.toBe(firstId);
    expect(result.current.activeConversation.messages).toHaveLength(0);
    // Prepended: newest conversation listed first.
    expect(result.current.conversations[0].id).toBe(result.current.activeConversationId);
  });

  it("selectConversation switches the active conversation without losing the other's history", () => {
    const { result } = setup();
    act(() => result.current.sendMessage("Conversation one"));
    act(() => lastCallOptions().onDone("Reply one."));
    const firstId = result.current.activeConversationId;

    act(() => result.current.startNewConversation());
    act(() => result.current.sendMessage("Conversation two"));
    act(() => lastCallOptions().onDone("Reply two."));

    act(() => result.current.selectConversation(firstId));
    expect(result.current.activeConversation.messages[0].content).toBe("Conversation one");
  });
});
