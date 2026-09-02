"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { ChatMessage, Conversation } from "@/lib/chat/types";
import {
  simulateAssistantReply,
  type SimulatedReplyHandle,
} from "@/lib/chat/simulate-assistant-reply";

/**
 * ATLAS-P1-CHAT-02 — chat session state.
 *
 * SCOPE, STATED PLAINLY: conversation/message state lives only in this
 * component tree's React state. Nothing here reads or writes
 * localStorage/sessionStorage or calls a backend. Guest session
 * memory (client-side, survives navigation within the tab, cleared on
 * browser close) is `ATLAS-P1-MEM-01`'s own, separately-scoped task —
 * WORK_BREAKDOWN_STRUCTURE.md lists it with an explicit dependency on
 * CHAT-02, i.e. it is expected to wrap or extend this hook later, not
 * something CHAT-02 should pre-build. A page refresh here loses the
 * conversation; that is correct, current, in-scope behavior, not a bug.
 *
 * Business logic kept out of components per MASTER_RULES.md §6 —
 * components/chat/* only ever receives plain props/callbacks from
 * this hook.
 */

function createId(prefix: string): string {
  // Client-only (every call site is inside an event handler or this
  // hook's own initial-render branch below, never part of SSR output
  // — see the `conv-initial` fixed id note), so crypto.randomUUID's
  // browser-only availability is safe to rely on directly.
  return `${prefix}-${crypto.randomUUID()}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

function makeConversation(id: string): Conversation {
  return { id, title: null, messages: [], createdAt: nowIso() };
}

/** Fixed, non-random id for the very first conversation only, so the
 *  initial `useState` lazy initializer never depends on
 *  crypto.randomUUID() during the server-rendered pass — every
 *  subsequent conversation is created inside an onClick handler
 *  (startNewConversation), which by definition only ever runs
 *  client-side after hydration, where a random id is unproblematic. */
const INITIAL_CONVERSATION_ID = "conv-initial";

export interface UseChatSessionOptions {
  /** Chat.previewNotice, already resolved by the caller via
   *  useTranslations — this hook has no i18n access of its own. */
  previewReply: string;
  prefersReducedMotion: boolean;
}

export function useChatSession({
  previewReply,
  prefersReducedMotion,
}: UseChatSessionOptions) {
  const [conversations, setConversations] = useState<Conversation[]>(() => [
    makeConversation(INITIAL_CONVERSATION_ID),
  ]);
  const [activeConversationId, setActiveConversationId] = useState(
    INITIAL_CONVERSATION_ID,
  );
  const streamHandleRef = useRef<SimulatedReplyHandle | null>(null);
  const lastPartialRef = useRef("");

  const activeConversation = useMemo(
    () =>
      conversations.find((conversation) => conversation.id === activeConversationId) ??
      conversations[0],
    [conversations, activeConversationId],
  );

  const isStreaming = activeConversation.messages.some(
    (message) => message.status === "streaming",
  );

  const patchConversation = useCallback(
    (id: string, updater: (conversation: Conversation) => Conversation) => {
      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === id ? updater(conversation) : conversation,
        ),
      );
    },
    [],
  );

  const runAssistantTurn = useCallback(
    (conversationId: string) => {
      const assistantMessageId = createId("msg");
      lastPartialRef.current = "";

      const assistantMessage: ChatMessage = {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        status: "streaming",
        createdAt: nowIso(),
      };
      patchConversation(conversationId, (conversation) => ({
        ...conversation,
        messages: [...conversation.messages, assistantMessage],
      }));

      streamHandleRef.current = simulateAssistantReply({
        reply: previewReply,
        instant: prefersReducedMotion,
        onChunk: (partial) => {
          lastPartialRef.current = partial;
          patchConversation(conversationId, (conversation) => ({
            ...conversation,
            messages: conversation.messages.map((message) =>
              message.id === assistantMessageId
                ? { ...message, content: partial }
                : message,
            ),
          }));
        },
        onDone: (full) => {
          lastPartialRef.current = full;
          streamHandleRef.current = null;
          patchConversation(conversationId, (conversation) => ({
            ...conversation,
            messages: conversation.messages.map((message) =>
              message.id === assistantMessageId
                ? { ...message, content: full, status: "complete" }
                : message,
            ),
          }));
        },
      });
    },
    [patchConversation, prefersReducedMotion, previewReply],
  );

  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isStreaming) return;

      const conversationId = activeConversationId;
      const userMessage: ChatMessage = {
        id: createId("msg"),
        role: "user",
        content: trimmed,
        status: "complete",
        createdAt: nowIso(),
      };

      patchConversation(conversationId, (conversation) => ({
        ...conversation,
        title: conversation.title ?? trimmed.slice(0, 60),
        messages: [...conversation.messages, userMessage],
      }));

      runAssistantTurn(conversationId);
    },
    [activeConversationId, isStreaming, patchConversation, runAssistantTurn],
  );

  const stopGenerating = useCallback(() => {
    if (!streamHandleRef.current) return;
    streamHandleRef.current.stop();
    streamHandleRef.current = null;
    const partial = lastPartialRef.current;
    patchConversation(activeConversationId, (conversation) => ({
      ...conversation,
      messages: conversation.messages.map((message) =>
        message.status === "streaming"
          ? { ...message, content: partial, status: "complete" }
          : message,
      ),
    }));
  }, [activeConversationId, patchConversation]);

  /** Drops the last assistant turn and regenerates it. Also serves as
   *  `retryLastMessage` — this stub has no failure path to react to
   *  differently, so both actions run the identical, real regeneration
   *  pipeline rather than one of them being a no-op placeholder. */
  const regenerateLastResponse = useCallback(() => {
    if (isStreaming) return;
    // Read the current state directly rather than mutating a variable
    // from inside the setConversations updater below and reading it
    // back immediately after — that pattern isn't reliably synchronous
    // in React (a real bug this hook's own tests caught: the trimmed
    // conversation could commit before the flag it set was observed,
    // silently skipping the regenerate call entirely).
    const hasAssistantMessage = activeConversation.messages.some(
      (message) => message.role === "assistant",
    );
    if (!hasAssistantMessage) return;

    const conversationId = activeConversationId;
    patchConversation(conversationId, (conversation) => {
      const lastAssistantIndex = conversation.messages
        .map((message) => message.role)
        .lastIndexOf("assistant");
      if (lastAssistantIndex === -1) return conversation;
      return {
        ...conversation,
        messages: conversation.messages.slice(0, lastAssistantIndex),
      };
    });
    runAssistantTurn(conversationId);
  }, [
    activeConversation,
    activeConversationId,
    isStreaming,
    patchConversation,
    runAssistantTurn,
  ]);

  const startNewConversation = useCallback(() => {
    streamHandleRef.current?.stop();
    streamHandleRef.current = null;
    const conversation = makeConversation(createId("conv"));
    setConversations((current) => [conversation, ...current]);
    setActiveConversationId(conversation.id);
  }, []);

  const selectConversation = useCallback((id: string) => {
    setActiveConversationId(id);
  }, []);

  return {
    conversations,
    activeConversation,
    activeConversationId,
    isStreaming,
    sendMessage,
    stopGenerating,
    retryLastMessage: regenerateLastResponse,
    regenerateLastResponse,
    startNewConversation,
    selectConversation,
  };
}

export type UseChatSessionReturn = ReturnType<typeof useChatSession>;
