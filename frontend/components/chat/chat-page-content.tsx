"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { PanelLeft } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useMotionPreference } from "@/components/providers/motion-provider";
import { useChatSession } from "@/lib/chat/use-chat-session";
import { ConversationSidebar } from "@/components/chat/conversation-sidebar";
import { ConversationPanel } from "@/components/chat/conversation-panel";
import { ChatComposer } from "@/components/chat/chat-composer";

/**
 * ATLAS-P1-CHAT-01 — the AI Chat page.
 * 26_APPLICATION_LAYOUT_GUIDE.md §AI Chat: "Sidebar ↓ Conversation ↓
 * Composer... Desktop: 320px Conversation Flexible... Mobile:
 * Conversation only. Sidebar opens as drawer." `/chat` is guest-
 * accessible (lib/auth/protected-routes.ts) and rendered inside the
 * already-built ApplicationLayout via app/[locale]/(app)/chat/page.tsx.
 *
 * Height: reserves Navbar's own height (h-16/72px, matching Navbar's
 * HEADER_HEIGHT and Sidebar's identical calc) plus, on mobile only,
 * MobileBottomNav's space (ApplicationLayout's <main> already reserves
 * this via `pb-20` for normal pages; this page additionally subtracts
 * it from its own height so the composer never renders underneath the
 * fixed bottom nav). Desktop intentionally does not reserve space for
 * the minimal Footer below <main> — Footer remains reachable by
 * scrolling the outer page slightly further, a reasonable trade-off
 * for a workspace-style view rather than growing this page's own
 * height math to account for a footer's height it doesn't own.
 */
export function ChatPageContent() {
  const t = useTranslations("Chat");
  const searchParams = useSearchParams();
  const { prefersReducedMotion } = useMotionPreference();
  const [composerValue, setComposerValue] = useState(
    () => searchParams.get("prompt") ?? "",
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const {
    conversations,
    activeConversation,
    activeConversationId,
    isStreaming,
    sendMessage,
    stopGenerating,
    retryLastMessage,
    regenerateLastResponse,
    startNewConversation,
    selectConversation,
  } = useChatSession({
    previewReply: t("previewNotice"),
    prefersReducedMotion,
  });

  function handleSend() {
    if (!composerValue.trim()) return;
    sendMessage(composerValue);
    setComposerValue("");
  }

  function handleExamplePrompt(prompt: string) {
    sendMessage(prompt);
  }

  function handleSelectConversation(id: string) {
    selectConversation(id);
    setIsSidebarOpen(false);
  }

  function handleNewConversation() {
    startNewConversation();
    setIsSidebarOpen(false);
  }

  const conversationTitle = activeConversation.title ?? t("sidebar.untitledConversation");

  return (
    <div className="flex h-[calc(100dvh-9rem)] flex-col lg:h-[calc(100dvh-72px)]">
      {/* ACCESSIBILITY.md: "Each page has exactly one H1." The page's
          purpose is already visible via the persistently-highlighted
          "AI Chat" nav item, so this stays screen-reader-only rather
          than duplicating a large visible banner above the composer. */}
      <h1 className="sr-only">{t("page.heading")}</h1>

      <div className="flex items-center gap-3 border-b border-border px-4 py-3 lg:hidden">
        <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
          <SheetTrigger
            aria-label={t("sidebar.openConversations")}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-surface-secondary hover:text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <PanelLeft className="h-5 w-5" aria-hidden="true" />
          </SheetTrigger>
          <SheetContent side="left" title={t("sidebar.title")}>
            <ConversationSidebar
              conversations={conversations}
              activeConversationId={activeConversationId}
              onSelect={handleSelectConversation}
              onNewChat={handleNewConversation}
              showHeading={false}
            />
          </SheetContent>
        </Sheet>
        <p className="truncate text-sm font-medium text-text-primary">
          {conversationTitle}
        </p>
      </div>

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-[320px] shrink-0 border-e border-border p-4 lg:block">
          <ConversationSidebar
            conversations={conversations}
            activeConversationId={activeConversationId}
            onSelect={selectConversation}
            onNewChat={startNewConversation}
          />
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="min-h-0 flex-1">
            <ConversationPanel
              messages={activeConversation.messages}
              onStop={stopGenerating}
              onRegenerate={regenerateLastResponse}
              onRetry={retryLastMessage}
              onExamplePrompt={handleExamplePrompt}
            />
          </div>
          <ChatComposer
            value={composerValue}
            onChange={setComposerValue}
            onSend={handleSend}
            disabled={isStreaming}
          />
        </div>
      </div>
    </div>
  );
}
