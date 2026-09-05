/**
 * ATLAS-P1-CHAT-02 — shared chat data types.
 *
 * Deliberately independent of any backend response shape. Per
 * COMPONENT_OWNERSHIP_MATRIX.md's Feature Component Matrix, these
 * types are "tied to Conversation Manager's data shape (CHAT-03/04)"
 * — meaning CHAT-03/04 adapted ITS response shape to satisfy this
 * contract, not the other way around (see
 * backend/app/schemas/chat.py's own docstring), so this UI needed no
 * rewrite once the real backend existed.
 */

export type MessageRole = "user" | "assistant";

/**
 * ACCESSIBILITY.md §AI Chat Accessibility requires "Retry button" —
 * "error" was added ahead of CHAT-03/04 so MessageBubble's retry
 * affordance had a real state to render for. EXTENDED — ATLAS-P1-CHAT-04:
 * lib/chat/stream-assistant-reply.ts's real network call is what
 * actually sets it now, on any failed turn (see
 * lib/chat/use-chat-session.ts's runAssistantTurn).
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
