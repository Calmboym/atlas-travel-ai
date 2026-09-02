"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Compass } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmptyState } from "@/components/ui/state";
import { MessageBubble } from "@/components/chat/message-bubble";
import { TypingIndicator } from "@/components/chat/typing-indicator";
import { useMotionPreference } from "@/components/providers/motion-provider";
import type { ChatMessage } from "@/lib/chat/types";

/**
 * ATLAS-P1-CHAT-01 — the "Conversation" pane of 26_APPLICATION_LAYOUT_
 * GUIDE.md's AI Chat layout (Sidebar / Conversation / Composer).
 * Renders CHAT-02's message components; owns the scroll container,
 * empty state, and auto-scroll behavior itself.
 */
export interface ConversationPanelProps {
  messages: ChatMessage[];
  onStop: () => void;
  onRegenerate: () => void;
  onRetry: () => void;
  onExamplePrompt: (prompt: string) => void;
}

/** How close to the bottom (px) counts as "still following the
 *  conversation" for the auto-scroll decision below. */
const AUTO_SCROLL_THRESHOLD_PX = 96;

export function ConversationPanel({
  messages,
  onStop,
  onRegenerate,
  onRetry,
  onExamplePrompt,
}: ConversationPanelProps) {
  const t = useTranslations("Chat");
  const { prefersReducedMotion } = useMotionPreference();
  const scrollRootRef = useRef<HTMLDivElement>(null);
  const bottomAnchorRef = useRef<HTMLDivElement>(null);
  // 21_PREMIUM_MICROINTERACTIONS.md §AI Response Streaming: "Auto-scroll
  // only when appropriate" — true until the reader scrolls up to
  // review earlier messages, restored once they scroll back down.
  const shouldAutoScrollRef = useRef(true);

  // Radix ScrollArea's own ref resolves to the Root wrapper, not the
  // actual scrolling element — `data-radix-scroll-area-viewport` is
  // the library's own internal marker for that inner node. Not part
  // of Radix's public API, but stable enough in practice for this
  // read-only scroll-position check; scrollIntoView (used below for
  // the actual scroll action) doesn't depend on it at all.
  function getViewport(): HTMLElement | null {
    return (
      scrollRootRef.current?.querySelector<HTMLElement>(
        "[data-radix-scroll-area-viewport]",
      ) ?? null
    );
  }

  useEffect(() => {
    const viewport = getViewport();
    if (!viewport) return;
    function handleScroll() {
      if (!viewport) return;
      const distanceFromBottom =
        viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight;
      shouldAutoScrollRef.current = distanceFromBottom < AUTO_SCROLL_THRESHOLD_PX;
    }
    viewport.addEventListener("scroll", handleScroll, { passive: true });
    return () => viewport.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!shouldAutoScrollRef.current) return;
    bottomAnchorRef.current?.scrollIntoView({
      block: "end",
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  }, [messages, prefersReducedMotion]);

  const lastAssistantMessageId = [...messages]
    .reverse()
    .find((message) => message.role === "assistant")?.id;

  const examplePrompts = t.raw("emptyState.examples") as string[];

  return (
    <ScrollArea ref={scrollRootRef} className="h-full">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6 sm:px-6">
        {messages.length === 0 ? (
          <EmptyState
            icon={<Compass className="h-10 w-10" />}
            title={t("emptyState.title")}
            description={t("emptyState.description")}
            action={
              <div
                className="flex flex-wrap justify-center gap-2"
                aria-label={t("emptyState.examplesLabel")}
              >
                {examplePrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => onExamplePrompt(prompt)}
                    className="rounded-full border border-border bg-surface px-4 py-2 text-sm text-text-secondary transition-colors hover:bg-surface-secondary hover:text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            }
          />
        ) : (
          messages.map((message) => {
            // PREMIUM_MICROINTERACTIONS.md §AI Thinking State: shown
            // in place of an empty streaming bubble during the brief
            // pause before the first chunk arrives.
            if (message.role === "assistant" && message.status === "streaming" && !message.content) {
              return <TypingIndicator key={message.id} />;
            }
            return (
              <MessageBubble
                key={message.id}
                message={message}
                isLatestAssistantMessage={message.id === lastAssistantMessageId}
                onStop={onStop}
                onRegenerate={onRegenerate}
                onRetry={onRetry}
              />
            );
          })
        )}
        <div ref={bottomAnchorRef} aria-hidden="true" />
      </div>
    </ScrollArea>
  );
}
