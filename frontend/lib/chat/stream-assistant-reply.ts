/**
 * Real network client for POST /api/v1/chat/completions/stream.
 *
 * ADDED — ATLAS-P1-CHAT-04. Retires lib/chat/simulate-assistant-reply.ts
 * — that module's own doc comment named this exact swap as its
 * intended replacement moment ("swapping to a real SSE/stream consumer
 * against CHAT-03/04's endpoint later means replacing this one
 * function's internals"). Matches SimulatedReplyHandle's shape
 * ({ stop }) and the onChunk(partial)/onDone(full) accumulation
 * convention exactly, so lib/chat/use-chat-session.ts's call site and
 * every component under components/chat/* needed no other changes.
 *
 * Not built on the browser EventSource API — EventSource only issues
 * GET requests with no body, and the full conversation history has to
 * go in the request body (the backend is intentionally stateless — see
 * backend/app/services/chat_service.py's own docstring). Uses fetch()
 * with a ReadableStream reader instead, which is the standard approach
 * for a POST-initiated SSE-shaped stream.
 *
 * Wire format matches backend/app/api/v1/chat.py's streaming route
 * exactly: newline-delimited `data: <json>\n\n` frames, each JSON
 * object discriminated by a "type" field ("chunk" | "done" | "error").
 */

import { API_BASE_URL } from "@/lib/api/client";

export interface StreamAssistantReplyMessage {
  role: "user" | "assistant";
  content: string;
}

export interface StreamAssistantReplyOptions {
  messages: StreamAssistantReplyMessage[];
  onChunk: (partial: string) => void;
  onDone: (full: string) => void;
  /** No message parameter — the caller (use-chat-session.ts) already
   *  owns a single, pre-translated fallback string (this module has no
   *  i18n access of its own, matching every other lib/chat file's own
   *  stated scope) and shows the same text regardless of *why* the
   *  request failed. AI_EXPERIENCE.md "Error Recovery": never display
   *  raw system errors — so the real cause is never threaded through
   *  to this callback in the first place. */
  onError: () => void;
}

export interface StreamReplyHandle {
  stop: () => void;
}

type ServerEvent =
  | { type: "chunk"; content: string }
  | { type: "done" }
  | { type: "error"; message: string };

function parseServerEvent(rawEvent: string): ServerEvent | null {
  const dataLine = rawEvent.split("\n").find((line) => line.startsWith("data: "));
  if (!dataLine) return null;
  try {
    return JSON.parse(dataLine.slice("data: ".length)) as ServerEvent;
  } catch {
    return null;
  }
}

export function streamAssistantReply(
  options: StreamAssistantReplyOptions,
): StreamReplyHandle {
  const controller = new AbortController();

  void (async () => {
    let full = "";
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/chat/completions/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Harmless for guests (no cookie exists yet) and consistent
        // with apiFetch's own convention — the endpoint itself never
        // requires it, see backend/app/api/v1/chat.py's own docstring.
        credentials: "include",
        body: JSON.stringify({ messages: options.messages }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        options.onError();
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let boundary = buffer.indexOf("\n\n");
        while (boundary !== -1) {
          const rawEvent = buffer.slice(0, boundary);
          buffer = buffer.slice(boundary + 2);

          const event = parseServerEvent(rawEvent);
          if (event?.type === "chunk") {
            full += event.content;
            options.onChunk(full);
          } else if (event?.type === "done") {
            options.onDone(full);
            return;
          } else if (event?.type === "error") {
            options.onError();
            return;
          }

          boundary = buffer.indexOf("\n\n");
        }
      }

      // The connection closed without an explicit "done"/"error"
      // frame — treat whatever text already arrived as final rather
      // than silently discarding it.
      options.onDone(full);
    } catch {
      // AbortController.abort() (the user pressed Stop) also lands
      // here as a DOMException — that is expected, user-initiated
      // termination, not a failure, and use-chat-session.ts's own
      // stopGenerating already finalizes the message using
      // lastPartialRef — so it is deliberately not reported as an
      // error.
      if (controller.signal.aborted) return;
      options.onError();
    }
  })();

  return {
    stop: () => controller.abort(),
  };
}
