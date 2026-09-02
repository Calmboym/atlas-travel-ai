/**
 * ATLAS-P1-CHAT-02 — shared chat data types.
 *
 * Deliberately independent of any backend response shape: CHAT-03/04
 * (Conversation Manager Agent + its endpoint) don't exist yet, and per
 * COMPONENT_OWNERSHIP_MATRIX.md's Feature Component Matrix, these
 * types are "tied to Conversation Manager's data shape (CHAT-03/04)"
 * — meaning CHAT-03/04 is expected to adapt ITS response shape to
 * satisfy (or extend) this contract, not the other way around, so the
 * UI built against it here does not need to be rewritten later.
 */

export type MessageRole = "user" | "assistant";

/**
 * ACCESSIBILITY.md §AI Chat Accessibility requires "Retry button" —
 * "error" is included now so MessageBubble's retry affordance has a
 * real state to render for, even though nothing in this stub
 * pipeline currently produces it (lib/chat/simulate-assistant-reply.ts
 * never fails). CHAT-03/04's real network call is what will actually
 * set it.
 */
export type MessageStatus = "complete" | "streaming" | "error";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  /** Streaming messages hold their partial text here as it grows. */
  content: string;
  status: MessageStatus;
  /** ISO 8601 — COPYWRITING_GUIDELINES.md §Dates: always localized at
   *  render time, never formatted into this stored value. */
  createdAt: string;
}

export interface Conversation {
  id: string;
  /** Null until the first user message sets it (ConversationSidebar
   *  falls back to Chat.sidebar.untitledConversation). */
  title: string | null;
  messages: ChatMessage[];
  createdAt: string;
}
