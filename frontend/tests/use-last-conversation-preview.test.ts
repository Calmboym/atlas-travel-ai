import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import {
  useLastConversationPreview,
  __resetLastConversationPreviewCacheForTests,
} from "@/lib/dashboard/use-last-conversation-preview";
import {
  __resetGuestSessionStoreForTests,
  type GuestSession,
} from "@/lib/chat/guest-session-store";
import { useChatSession } from "@/lib/chat/use-chat-session";
import { streamAssistantReply } from "@/lib/chat/stream-assistant-reply";

const STORAGE_KEY = "atlas-chat-guest-session";

vi.mock("@/lib/chat/stream-assistant-reply", () => ({
  streamAssistantReply: vi.fn(),
}));

beforeEach(() => {
  __resetGuestSessionStoreForTests();
  __resetLastConversationPreviewCacheForTests();
  vi.mocked(streamAssistantReply).mockReturnValue({ stop: vi.fn() });
});

describe("useLastConversationPreview", () => {
  it("reports no conversation when nothing is persisted", () => {
    const { result } = renderHook(() => useLastConversationPreview());
    expect(result.current).toEqual({
      hasConversation: false,
      title: null,
      lastMessagePreview: null,
    });
  });

  it("reports the persisted conversation's title and last message", () => {
    const persisted: GuestSession = {
      conversations: [
        {
          id: "conv-restored",
          title: "Rome trip",
          createdAt: "2026-01-01T00:00:00.000Z",
          messages: [
            {
              id: "msg-1",
              role: "user",
              content: "Plan a trip to Rome",
              status: "complete",
              createdAt: "2026-01-01T00:00:00.000Z",
            },
            {
              id: "msg-2",
              role: "assistant",
              content: "Here is a draft itinerary for Rome.",
              status: "complete",
              createdAt: "2026-01-01T00:01:00.000Z",
            },
          ],
        },
      ],
      activeConversationId: "conv-restored",
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));

    const { result } = renderHook(() => useLastConversationPreview());

    expect(result.current.hasConversation).toBe(true);
    expect(result.current.title).toBe("Rome trip");
    expect(result.current.lastMessagePreview).toBe(
      "Here is a draft itinerary for Rome.",
    );
  });

  it("does not count a conversation with zero messages as one to continue", () => {
    const persisted: GuestSession = {
      conversations: [
        {
          id: "conv-empty",
          title: null,
          createdAt: "2026-01-01T00:00:00.000Z",
          messages: [],
        },
      ],
      activeConversationId: "conv-empty",
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));

    const { result } = renderHook(() => useLastConversationPreview());
    expect(result.current.hasConversation).toBe(false);
  });

  it("falls back to no conversation when sessionStorage holds corrupted JSON", () => {
    sessionStorage.setItem(STORAGE_KEY, "{not valid json");
    const { result } = renderHook(() => useLastConversationPreview());
    expect(result.current.hasConversation).toBe(false);
  });

  it("updates once a real conversation is started elsewhere via useChatSession", () => {
    const { result: preview } = renderHook(() => useLastConversationPreview());
    expect(preview.current.hasConversation).toBe(false);

    const { result: chat } = renderHook(() =>
      useChatSession({ errorMessage: "Something went wrong." }),
    );
    act(() => chat.current.sendMessage("Plan a trip to Kyoto"));

    expect(preview.current.hasConversation).toBe(true);
    expect(preview.current.title).toBe("Plan a trip to Kyoto");
    expect(preview.current.lastMessagePreview).toBe("Plan a trip to Kyoto");
  });

  it("truncates a very long last message to a short preview", () => {
    const longMessage = "a".repeat(500);
    const persisted: GuestSession = {
      conversations: [
        {
          id: "conv-long",
          title: "Long message",
          createdAt: "2026-01-01T00:00:00.000Z",
          messages: [
            {
              id: "msg-1",
              role: "user",
              content: longMessage,
              status: "complete",
              createdAt: "2026-01-01T00:00:00.000Z",
            },
          ],
        },
      ],
      activeConversationId: "conv-long",
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));

    const { result } = renderHook(() => useLastConversationPreview());
    expect(result.current.lastMessagePreview).toHaveLength(140);
  });
});
