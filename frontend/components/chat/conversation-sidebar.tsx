"use client";

import { useTranslations } from "next-intl";
import { PlusCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils/cn";
import type { Conversation } from "@/lib/chat/types";

/**
 * ATLAS-P1-CHAT-01 — the "Sidebar" pane of 26_APPLICATION_LAYOUT_
 * GUIDE.md's AI Chat layout: "Sidebar ↓ Conversation ↓ Composer...
 * Desktop: 320px." Not the global navigation Sidebar
 * (components/layout/sidebar.tsx, DESIGNSYS-03) — that one lists
 * Dashboard/Trips/Chat/etc. and stays exactly as built; this is
 * Chat's own, page-local conversation list, rendered inside
 * ApplicationLayout's <main>. A single component reused two ways by
 * ChatPageContent: inline in a fixed-width column on desktop, and as
 * the content of a Sheet(side="left") drawer on mobile (26 §AI Chat
 * "Mobile: Conversation only. Sidebar opens as drawer.").
 */
export interface ConversationSidebarProps {
  conversations: Conversation[];
  activeConversationId: string;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  /**
   * False when rendered inside components/ui/sheet.tsx's SheetContent
   * (the mobile drawer), which already renders its own Dialog.Title
   * from the `title` prop chat-page-content.tsx passes it — found via
   * live verification (Playwright screenshot) to visibly duplicate
   * "Conversations" otherwise. True (default) for the plain desktop
   * <aside> usage, which has no other heading of its own.
   */
  showHeading?: boolean;
  className?: string;
}

export function ConversationSidebar({
  conversations,
  activeConversationId,
  onSelect,
  onNewChat,
  showHeading = true,
  className,
}: ConversationSidebarProps) {
  const t = useTranslations("Chat.sidebar");

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {showHeading ? (
        <h2 className="px-1 text-sm font-semibold text-text-secondary">
          {t("title")}
        </h2>
      ) : null}

      <button
        type="button"
        onClick={onNewChat}
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-text-primary transition-colors hover:bg-surface-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        <PlusCircle className="h-4 w-4" aria-hidden="true" />
        {t("newChat")}
      </button>

      {/* max-h rather than flex-1/h-full: this component renders both
          inside a properly height-bounded <aside> (desktop, flex-
          stretch resolves h-full correctly) and inside SheetContent's
          unbounded `<div className="mt-4">` wrapper (mobile drawer,
          components/ui/sheet.tsx — not editable here), where a
          percentage height has no ancestor to resolve against. A
          viewport-relative cap works correctly in both without
          needing two different codepaths. */}
      <ScrollArea className="max-h-[55vh]">
        <ul className="flex flex-col gap-1 pe-2" aria-label={t("title")}>
          {conversations.map((conversation) => {
            const isActive = conversation.id === activeConversationId;
            const label = conversation.title ?? t("untitledConversation");
            return (
              <li key={conversation.id}>
                <button
                  type="button"
                  onClick={() => onSelect(conversation.id)}
                  aria-current={isActive ? "true" : undefined}
                  className={cn(
                    "block w-full truncate rounded-xl px-3 py-2.5 text-start text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                    isActive
                      ? "bg-primary-tint font-medium text-primary-active"
                      : "text-text-secondary hover:bg-surface-secondary hover:text-text-primary",
                  )}
                >
                  {label}
                </button>
              </li>
            );
          })}
        </ul>
      </ScrollArea>
    </div>
  );
}
