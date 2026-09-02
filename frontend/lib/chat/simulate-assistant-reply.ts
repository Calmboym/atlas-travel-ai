/**
 * ATLAS-P1-CHAT-02 — simulated assistant reply.
 *
 * WHY THIS EXISTS: `ATLAS-P1-CHAT-03`/`04` (the Conversation Manager
 * Agent and its streaming endpoint — ARCHITECTURE.md §7 "AI
 * Orchestration Service") are not part of this task group and do not
 * exist in this repository yet. CHAT-02's own acceptance criterion is
 * that streaming "feels conversational" (21_PREMIUM_MICROINTERACTIONS.md
 * §AI Response Streaming) and respects reduced motion — a UI/motion
 * requirement that can be verified against a locally-timed reveal
 * without a live model call. This module is the single, isolated place
 * that fact lives: `lib/chat/use-chat-session.ts` calls it once, and
 * swapping to a real SSE/stream consumer against CHAT-03/04's endpoint
 * later means replacing this one function's internals, not touching
 * any component in `components/chat/`.
 *
 * HONESTY, NOT FABRICATION: this does not invent travel facts, prices,
 * or recommendations — BRAND_GUIDELINES.md §13 "Never fabricates
 * travel information" and MASTER_RULES.md §8 both govern what Atlas
 * tells real users. The only content this ever reveals is the fixed,
 * transparent `Chat.previewNotice` copy (messages/en.json), which
 * states plainly that this is a preview and that real planning is
 * grounded, verified content once CHAT-03/04 connect it. Nothing here
 * pretends to be a real AI response to the user's actual question.
 */

export interface SimulateAssistantReplyOptions {
  /** The full text to reveal — always `Chat.previewNotice`, supplied
   *  by the caller already localized (this module has no i18n access
   *  of its own, matching lib/chat's "pure data/timing" scope). */
  reply: string;
  onChunk: (partial: string) => void;
  onDone: (full: string) => void;
  /** True under prefers-reduced-motion: skips the incremental reveal
   *  and delivers the complete text after one short pause instead —
   *  ACCESSIBILITY.md §Motion Accessibility "Maintain usability,"
   *  applied to a JS-timed content reveal that Framer Motion's
   *  MotionConfig (app/[locale]/layout.tsx) cannot suppress on its
   *  own, since no `motion.*` animation value is involved here. */
  instant: boolean;
}

export interface SimulatedReplyHandle {
  /** Cancels any further reveal. Does not itself decide what the
   *  message's final content should be — the caller already has the
   *  latest partial text from `onChunk` and finalizes with that,
   *  mirroring how a real "Stop generating" keeps whatever streamed
   *  so far (21_PREMIUM_MICROINTERACTIONS.md doesn't specify this
   *  explicitly for Atlas, but it's the universal, expected behavior
   *  for that control in every chat product it could be compared to). */
  stop: () => void;
}

/** ~500ms "thinking" pause before the first chunk — long enough to be
 *  a real, visible state (PREMIUM_MICROINTERACTIONS.md §AI Thinking
 *  State), short enough not to feel unresponsive. */
const THINKING_DELAY_MS = 450;

/** Reveal speed tuned for a natural, unhurried read — not a race to
 *  finish, not slow enough to feel sluggish for a short message. */
const CHUNK_INTERVAL_MS = 24;
const CHUNK_SIZE_CHARS = 2;

export function simulateAssistantReply({
  reply,
  onChunk,
  onDone,
  instant,
}: SimulateAssistantReplyOptions): SimulatedReplyHandle {
  let cancelled = false;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  if (instant) {
    timeoutId = setTimeout(() => {
      if (cancelled) return;
      onDone(reply);
    }, THINKING_DELAY_MS);
    return {
      stop: () => {
        cancelled = true;
        clearTimeout(timeoutId);
      },
    };
  }

  let revealed = 0;
  function tick() {
    if (cancelled) return;
    revealed = Math.min(revealed + CHUNK_SIZE_CHARS, reply.length);
    const partial = reply.slice(0, revealed);
    if (revealed >= reply.length) {
      onDone(partial);
      return;
    }
    onChunk(partial);
    timeoutId = setTimeout(tick, CHUNK_INTERVAL_MS);
  }

  timeoutId = setTimeout(tick, THINKING_DELAY_MS);

  return {
    stop: () => {
      cancelled = true;
      clearTimeout(timeoutId);
    },
  };
}
