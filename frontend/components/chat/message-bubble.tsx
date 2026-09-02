"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Check, Copy, RotateCcw, Sparkles, Square } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { ChatMessage } from "@/lib/chat/types";

/**
 * ATLAS-P1-CHAT-02 — AI Chat Bubble
 * (DESIGN_TOKENS.md Part 6 §AI Chat Bubble, verbatim: Assistant =
 * Surface Secondary, User = Primary Surface, radius 24px = rounded-2xl,
 * padding space-5, gap space-3, timestamp text-xs, streaming
 * indicator = semantic info.)
 *
 * ACCESSIBILITY.md §AI Chat Accessibility requires all of: keyboard
 * navigation, screen readers, copy shortcuts, message timestamps,
 * clear sender distinction, streaming announcements, stop/regenerate/
 * retry buttons, accessible markdown rendering. Every one of those is
 * implemented below except markdown rendering — CHAT-02's stub
 * content (Chat.previewNotice) is plain text, and CHAT-03/04's real
 * responses are what will actually need a markdown renderer; adding
 * one now would be building for a data shape that doesn't exist yet.
 *
 * No literal human Avatar for the assistant side —
 * ICONOGRAPHY_AND_ILLUSTRATION.md §AI Visual Language explicitly
 * forbids "Human avatars" for the AI and prefers abstract concepts
 * ("Light, Constellation... Connection"); Sparkles is already Atlas's
 * established AI-identity icon (components/landing/ai-search-box.tsx,
 * Navbar). The user's own messages render without an avatar at all —
 * distinguished by alignment, color, and the sr-only sender label
 * below, which is sufficient per "Clear sender distinction" without
 * an awkward initials-less Avatar fallback for an unauthenticated
 * guest with no known name.
 */
export interface MessageBubbleProps {
  message: ChatMessage;
  /**
   * Regenerate/Retry are exposed only on the most recent assistant
   * turn — every comparable chat product's convention, since this
   * stub's linear conversation model has no way to regenerate an
   * older turn without silently invalidating everything that came
   * after it.
   */
  isLatestAssistantMessage?: boolean;
  onStop?: () => void;
  onRegenerate?: () => void;
  onRetry?: () => void;
  className?: string;
}

export function MessageBubble({
  message,
  isLatestAssistantMessage = false,
  onStop,
  onRegenerate,
  onRetry,
  className,
}: MessageBubbleProps) {
  const t = useTranslations("Chat.message");
  const locale = useLocale();
  const [copied, setCopied] = useState(false);

  const isUser = message.role === "user";
  const isStreaming = message.status === "streaming";
  const isError = message.status === "error";

  const timeLabel = new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(message.createdAt));

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard permission can be denied by the browser/OS. Failing
      // quietly (no crash, no false "Copied" confirmation) is safer
      // than surfacing an error the user has no useful action for.
    }
  }

  const regenerateAction = isError ? onRetry : onRegenerate;
  const regenerateLabel = isError ? t("retry") : t("regenerate");

  return (
    <div
      className={cn(
        "flex items-end gap-3",
        isUser ? "justify-end" : "justify-start",
        className,
      )}
    >
      {!isUser ? (
        <span
          aria-hidden="true"
          className="mb-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-tint text-primary-active"
        >
          <Sparkles className="h-4 w-4" />
        </span>
      ) : null}

      <div
        className={cn(
          "flex max-w-[85%] flex-col gap-1 sm:max-w-[75%]",
          isUser && "items-end",
        )}
      >
        <div
          role={isError ? "alert" : undefined}
          aria-busy={isStreaming || undefined}
          className={cn(
            "rounded-2xl px-5 py-3 text-base leading-relaxed",
            isUser
              ? "bg-primary text-on-primary"
              : isError
                ? "border border-error/20 bg-error-tint text-text-primary"
                : "bg-surface-secondary text-text-primary",
          )}
        >
          <span className="sr-only">{isUser ? t("you") : t("assistant")}: </span>
          <span className="whitespace-pre-wrap">{message.content}</span>
          {isStreaming ? (
            <span
              aria-hidden="true"
              className="ms-0.5 inline-block h-4 w-[2px] translate-y-0.5 animate-pulse bg-info align-middle"
            />
          ) : null}
        </div>

        {/* Streaming announcements (ACCESSIBILITY.md §AI Chat
            Accessibility): a dedicated, decoupled live region rather
            than toggling aria-live on the growing text above — this
            starts empty and is set once, exactly when the turn
            completes, giving screen reader users one clean
            announcement of the full reply instead of noise from every
            few-character chunk. */}
        {!isUser ? (
          <span className="sr-only" aria-live="polite" aria-atomic="true">
            {message.status === "complete"
              ? `${t("assistant")}: ${message.content}`
              : ""}
          </span>
        ) : null}

        <div
          className={cn(
            "flex items-center gap-2 px-1",
            isUser && "flex-row-reverse",
          )}
        >
          <span className="text-xs text-text-muted">{timeLabel}</span>

          {!isStreaming && message.content ? (
            <button
              type="button"
              onClick={handleCopy}
              aria-label={copied ? t("copied") : t("copy")}
              className="rounded-full p-1 text-text-muted transition-colors hover:bg-surface-secondary hover:text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <Copy className="h-3.5 w-3.5" aria-hidden="true" />
              )}
            </button>
          ) : null}

          {isStreaming && onStop ? (
            <button
              type="button"
              onClick={onStop}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-secondary"
            >
              <Square className="h-3 w-3" aria-hidden="true" />
              {t("stopGenerating")}
            </button>
          ) : null}

          {!isStreaming && !isUser && isLatestAssistantMessage && regenerateAction ? (
            <button
              type="button"
              onClick={regenerateAction}
              aria-label={regenerateLabel}
              className="rounded-full p-1 text-text-muted transition-colors hover:bg-surface-secondary hover:text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/**
 * COMPONENT_INVENTORY.md §AI Components lists `StreamingBubble` as its
 * own named component. Here it is not a second implementation:
 * MessageBubble's own `message.status === "streaming"` branch already
 * covers the growing text, blinking cursor, and aria-busy treatment,
 * and ConversationPanel renders every message — streaming or not —
 * through the same component so all states share one visual language.
 * This alias exists so the inventory's name resolves to something
 * real and importable, not as a parallel copy to keep in sync.
 */
export const StreamingBubble = MessageBubble;
