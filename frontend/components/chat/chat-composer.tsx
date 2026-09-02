"use client";

import { useEffect, useId, useRef, type KeyboardEvent } from "react";
import { useTranslations } from "next-intl";
import { Send } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils/cn";

/**
 * ATLAS-P1-CHAT-01 — the "Composer" pane of 26_APPLICATION_LAYOUT_
 * GUIDE.md's AI Chat layout. Sits at the bottom of the flex column in
 * chat-page-content.tsx, always visible below the scrollable
 * Conversation pane above it (functionally "sticky" per 26 §Sticky
 * Elements without needing literal `position: sticky` — the
 * conversation pane is the only scrolling region, so the composer
 * never scrolls out of view).
 *
 * "Attachments (future)" and voice input (COMPONENT_INVENTORY.md's
 * separate AttachmentInput/VoiceInput) are deliberately not built
 * here — 26 §Chat Components lists Attachments as future-scoped
 * explicitly, and CHAT-01's own WBS scope names only sidebar/
 * conversation/composer.
 */
export interface ChatComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
  className?: string;
}

const MAX_TEXTAREA_HEIGHT_PX = 200;

export function ChatComposer({
  value,
  onChange,
  onSend,
  disabled = false,
  className,
}: ChatComposerProps) {
  const t = useTranslations("Chat.composer");
  const textareaId = useId();
  const hintId = useId();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow: reset to a single line's height, then expand to fit
  // content, capped so a long paste doesn't push the composer (and
  // the send button with it) off-screen.
  useEffect(() => {
    const node = textareaRef.current;
    if (!node) return;
    node.style.height = "auto";
    node.style.height = `${Math.min(node.scrollHeight, MAX_TEXTAREA_HEIGHT_PX)}px`;
  }, [value]);

  const canSend = value.trim().length > 0 && !disabled;

  function handleSend() {
    if (!canSend) return;
    onSend();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  }

  return (
    <div className={cn("border-t border-border bg-background px-4 py-4 sm:px-6", className)}>
      <div className="mx-auto flex w-full max-w-3xl items-end gap-3">
        <div className="atlas-glass-1 flex flex-1 items-end gap-2 rounded-3xl px-3 py-2">
          <label htmlFor={textareaId} className="sr-only">
            {t("label")}
          </label>
          <Textarea
            ref={textareaRef}
            id={textareaId}
            rows={1}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("placeholder")}
            disabled={disabled}
            aria-describedby={hintId}
            className="max-h-[200px] min-h-0 flex-1 resize-none border-0 bg-transparent px-2 py-2 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!canSend}
            aria-label={t("send")}
            className="mb-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <Send className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
      <p id={hintId} className="mx-auto mt-2 w-full max-w-3xl text-xs text-text-muted">
        {t("hint")}
      </p>
    </div>
  );
}
