"use client";

import { useSyncExternalStore } from "react";
import {
  peekGuestSession,
  subscribeToGuestSession,
  type GuestSession,
} from "@/lib/chat/guest-session-store";

/**
 * ATLAS-P1-DASH-01 — read-only view of whether a real (non-empty)
 * guest conversation already exists, for the Dashboard's "Continue
 * conversation" vs. "Start planning" hero state (18_DASHBOARD_
 * EXPERIENCE.md §Default Landing: "After authentication Atlas opens:
 * Last AI Conversation. If no conversation exists: Open Welcome
 * Dashboard."). CHAT-03/04's backend is deliberately stateless (see
 * lib/chat/use-chat-session.ts's own docstring); the only persisted
 * "last conversation" available in Phase 1 is guest-session-store.ts's
 * sessionStorage-backed store, which — per MEM-01's own documented
 * scope decision — applies regardless of authentication status. A
 * conversation with zero messages (the untouched default a fresh
 * useChatSession() call seeds) does not count as one to continue.
 */
export interface LastConversationPreview {
  hasConversation: boolean;
  title: string | null;
  /** Truncated to a short, list-item-sized snippet — not the full
   *  message, which could be arbitrarily long. */
  lastMessagePreview: string | null;
}

const PREVIEW_LENGTH = 140;

const EMPTY_PREVIEW: LastConversationPreview = {
  hasConversation: false,
  title: null,
  lastMessagePreview: null,
};

function derivePreview(session: GuestSession | null): LastConversationPreview {
  if (!session) return EMPTY_PREVIEW;
  const active =
    session.conversations.find(
      (conversation) => conversation.id === session.activeConversationId,
    ) ?? session.conversations[0];
  if (!active || active.messages.length === 0) return EMPTY_PREVIEW;
  // The most recent message isn't necessarily the most informative one
  // to preview: sendMessage() appends an empty, still-streaming
  // assistant placeholder immediately (lib/chat/use-chat-session.ts),
  // which stays empty if a stream never finished (e.g. the browser
  // closed mid-response before this session was ever revisited).
  // Search backward for the last message with real content instead.
  const lastMeaningfulMessage = [...active.messages]
    .reverse()
    .find((message) => message.content.trim().length > 0);
  return {
    hasConversation: true,
    title: active.title,
    lastMessagePreview: lastMeaningfulMessage
      ? lastMeaningfulMessage.content.slice(0, PREVIEW_LENGTH)
      : null,
  };
}

/**
 * Independent, content-keyed cache for this hook's own derived value —
 * deliberately NOT guest-session-store.ts's own `cachedSession`
 * singleton shared with useChatSession (see peekGuestSession's own
 * docstring on why sharing that cache here would be unsafe). Re-reads
 * peekGuestSession() on every call (cheap: one JSON.parse + one
 * JSON.stringify on a small object) and only allocates a new return
 * value when the serialized content actually differs from last time —
 * satisfying useSyncExternalStore's "getSnapshot must return a stable
 * reference when nothing changed" contract without assuming this hook
 * stays mounted (and thus subscribed) for the whole time the guest
 * session could change elsewhere — e.g. across a /dashboard -> /chat
 * -> /dashboard navigation, where this hook fully unmounts and
 * remounts and a callback-driven invalidation alone would miss the
 * change that happened while unmounted.
 */
let cachedKey: string | undefined;
let cachedPreview: LastConversationPreview = EMPTY_PREVIEW;

function getSnapshot(): LastConversationPreview {
  const session = peekGuestSession();
  const key = session ? JSON.stringify(session) : "";
  if (key !== cachedKey) {
    cachedKey = key;
    cachedPreview = derivePreview(session);
  }
  return cachedPreview;
}

function getServerSnapshot(): LastConversationPreview {
  return EMPTY_PREVIEW;
}

export function useLastConversationPreview(): LastConversationPreview {
  return useSyncExternalStore(subscribeToGuestSession, getSnapshot, getServerSnapshot);
}

/** Test-only reset for this hook's own cache — mirrors guest-session-
 *  store.ts's own __resetGuestSessionStoreForTests, since this file
 *  keeps an independent module-level cache that would otherwise leak
 *  between unrelated test cases in the same file. */
export function __resetLastConversationPreviewCacheForTests(): void {
  cachedKey = undefined;
  cachedPreview = EMPTY_PREVIEW;
}
