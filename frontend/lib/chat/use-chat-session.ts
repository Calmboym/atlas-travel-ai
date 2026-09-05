"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { ChatMessage, Conversation } from "@/lib/chat/types";
import {
  streamAssistantReply,
  type StreamReplyHandle,
} from "@/lib/chat/stream-assistant-reply";

/**
 * ATLAS-P1-CHAT-02 — chat session state.
 * EXTENDED — ATLAS-P1-CHAT-04: sendMessage/regenerateLastResponse now
 * call the real backend (lib/chat/stream-assistant-reply.ts) instead
 * of lib/chat/simulate-assistant-reply.ts's fixed local timer, and
 * runAssistantTurn gained an onError path — see below. Also dropped
 * the `prefersReducedMotion` option entirely: it existed only to tell
 * the retired stub whether to skip its artificial typewriter-style
 * reveal, which a real network stream has no equivalent of (chunks
 * arrive whenever the backend actually sends them — there's nothing
 * to "instantly reveal" instead of). Reduced-motion for chat's own
 * rendering (the streaming cursor, message transitions) is a
 * components/chat/* concern via its own useMotionPreference() call,
 * unrelated to this hook's data layer.
 *
 * SCOPE, STATED PLAINLY: conversation/message state lives only in this
 * component tree's React state. Nothing here reads or writes
 * localStorage/sessionStorage. Guest session memory (client-side,
 * survives navigation within the tab, cleared on browser close) is
 * `ATLAS-P1-MEM-01`'s own, separately-scoped task —
 * WORK_BREAKDOWN_STRUCTURE.md lists it with an explicit dependency on
 * CHAT-02, i.e. it is expected to wrap or extend this hook later, not
 * something this hook should pre-build. A page refresh here loses the
 * conversation; that is correct, current, in-scope behavior, not a bug.
 * The backend itself is stateless too (no conversation persistence) —
 * see backend/app/services/chat_service.py's own docstring; this hook
 * remains the single source of truth for message history, both what's
 * shown and what's sent to the backend on the next turn.
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

/** Backend request shape only ever needs role + content — id, status,
 *  and createdAt are UI-owned concerns the backend never sees (see
 *  backend/app/schemas/chat.py's own docstring on this same
 *  deliberate asymmetry). A message that ended in "error" status is
 *  never resent as if it were real conversational history — it holds
 *  a translated fallback string, not what the model actually said. */
function toOutgoingMessages(
  messages: ChatMessage[],
): { role: "user" | "assistant"; content: string }[] {
  return messages
    .filter((message) => message.status !== "error")
    .map((message) => ({ role: message.role, content: message.content }));
}

export interface UseChatSessionOptions {
  /** Chat.errors.generic, already resolved by the caller via
   *  useTranslations — this hook has no i18n access of its own. Shown
   *  verbatim whenever a turn fails, regardless of the underlying
   *  cause (AI_EXPERIENCE.md "Error Recovery": never display raw
   *  system errors). */
  errorMessage: string;
}

export function useChatSession({ errorMessage }: UseChatSessionOptions) {
  const [conversations, setConversations] = useState<Conversation[]>(() => [
    makeConversation(INITIAL_CONVERSATION_ID),
  ]);
  const [activeConversationId, setActiveConversationId] = useState(
    INITIAL_CONVERSATION_ID,
  );
  const streamHandleRef = useRef<StreamReplyHandle | null>(null);
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
    (conversationId: string, messagesForRequest: ChatMessage[]) => {
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

      streamHandleRef.current = streamAssistantReply({
        messages: toOutgoingMessages(messagesForRequest),
        onChunk: (partial) => {
          lastPartialRef.current = partial;
          patchConversation(conversationId, (conversation) => ({
            ...conversation,
            // Guarded on status === "streaming": if the user already
            // pressed Stop (or a "done"/"error" already landed), this
            // message has already been finalized — a late callback
            // from the now-abandoned network call (aborted, but not
            // necessarily instantaneously silenced — a real race, not
            // hypothetical) must not resurrect or rewrite it. Found via
            // this hook's own test suite, not assumed.
            messages: conversation.messages.map((message) =>
              message.id === assistantMessageId && message.status === "streaming"
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
              message.id === assistantMessageId && message.status === "streaming"
                ? { ...message, content: full, status: "complete" }
                : message,
            ),
          }));
        },
        onError: () => {
          streamHandleRef.current = null;
          patchConversation(conversationId, (conversation) => ({
            ...conversation,
            messages: conversation.messages.map((message) =>
              message.id === assistantMessageId && message.status === "streaming"
                ? { ...message, content: errorMessage, status: "error" }
                : message,
            ),
          }));
        },
      });
    },
    [errorMessage, patchConversation],
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
      // Computed synchronously from activeConversation, BEFORE the
      // state update below — reading conversations/activeConversation
      // back again immediately after calling patchConversation isn't
      // reliably synchronous in React (the exact pitfall
      // regenerateLastResponse's own comment already documents for
      // this hook). This is the array actually sent to the backend.
      const messagesForRequest = [...activeConversation.messages, userMessage];

      patchConversation(conversationId, (conversation) => ({
        ...conversation,
        title: conversation.title ?? trimmed.slice(0, 60),
        messages: messagesForRequest,
      }));

      runAssistantTurn(conversationId, messagesForRequest);
    },
    [activeConversation, activeConversationId, isStreaming, patchConversation, runAssistantTurn],
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
   *  `retryLastMessage` — whether the previous turn ended "complete"
   *  (a real regenerate) or "error" (a retry), the pipeline is
   *  identical: drop it, resend everything before it. */
  const regenerateLastResponse = useCallback(() => {
    if (isStreaming) return;
    // Read the current state directly rather than mutating a variable
    // from inside the setConversations updater below and reading it
    // back immediately after — that pattern isn't reliably synchronous
    // in React (a real bug this hook's own tests caught: the trimmed
    // conversation could commit before the flag it set was observed,
    // silently skipping the regenerate call entirely).
    const lastAssistantIndex = activeConversation.messages
      .map((message) => message.role)
      .lastIndexOf("assistant");
    if (lastAssistantIndex === -1) return;

    const conversationId = activeConversationId;
    const messagesForRequest = activeConversation.messages.slice(0, lastAssistantIndex);

    patchConversation(conversationId, (conversation) => ({
      ...conversation,
      messages: messagesForRequest,
    }));
    runAssistantTurn(conversationId, messagesForRequest);
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
