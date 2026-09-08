"use client";

import { useTranslations } from "next-intl";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Card } from "@/components/ui/card";
import { Heading, Paragraph } from "@/components/ui/typography";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import type { LastConversationPreview } from "@/lib/dashboard/use-last-conversation-preview";

/**
 * ATLAS-P1-DASH-01 — the Phase 1 stand-in for 18_DASHBOARD_EXPERIENCE
 * .md's "Travel Summary Hero" (which the doc itself scopes to "Always
 * displayed when an active trip exists" — no trip data exists in
 * Phase 1; Trip Service is Phase 2+, per DEPENDENCY_GRAPH.md §4/§5).
 * Implements §Default Landing instead, the part of the same document
 * that IS in scope now: "After authentication Atlas opens: Last AI
 * Conversation. If no conversation exists: Open Welcome Dashboard.
 * The user should never arrive at an empty page."
 *
 * COPYWRITING_GUIDELINES.md §Dashboard Messaging: "Welcome back...
 * Resume where you stopped. No unnecessary greetings" — one <h1>,
 * one primary CTA, no fabricated trip/budget numbers.
 */
export interface DashboardHeroProps {
  displayName: string | null;
  conversation: LastConversationPreview;
}

export function DashboardHero({ displayName, conversation }: DashboardHeroProps) {
  const t = useTranslations("Dashboard.hero");
  const greeting = displayName
    ? t("welcomeBackNamed", { name: displayName })
    : t("welcomeBack");

  if (conversation.hasConversation) {
    return (
      <Card>
        <Heading as="h1" className="text-2xl">
          {greeting}
        </Heading>
        <Paragraph className="mt-2 text-text-secondary">
          {t("continueSubtitle")}
        </Paragraph>
        <div className="mt-5 rounded-xl bg-surface-secondary px-4 py-3">
          <p className="truncate text-sm font-medium text-text-primary">
            {conversation.title ?? t("conversationFallbackTitle")}
          </p>
          {conversation.lastMessagePreview ? (
            <p className="mt-1 truncate text-sm text-text-secondary">
              {conversation.lastMessagePreview}
            </p>
          ) : null}
        </div>
        <Link
          href="/chat"
          className={cn(buttonVariants({ variant: "primary" }), "mt-5 gap-2")}
        >
          {t("continueConversation")}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </Card>
    );
  }

  return (
    <Card>
      <div className="atlas-glass-1 flex h-11 w-11 items-center justify-center rounded-full">
        <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
      </div>
      <Heading as="h1" className="mt-4 text-2xl">
        {greeting}
      </Heading>
      <Paragraph className="mt-2 text-text-secondary">
        {t("welcomeSubtitle")}
      </Paragraph>
      <Link
        href="/chat"
        className={cn(buttonVariants({ variant: "primary" }), "mt-5 gap-2")}
      >
        {t("startPlanning")}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </Card>
  );
}
