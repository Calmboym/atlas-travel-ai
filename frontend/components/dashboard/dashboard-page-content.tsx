"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Map, MessageCircle, Settings as SettingsIcon, Sparkles } from "lucide-react";
import { Container, Stack } from "@/components/ui/layout";
import { Skeleton } from "@/components/ui/loading";
import { RetryCard } from "@/components/shared/retry-card";
import { ConnectionStatus } from "@/components/shared/connection-status";
import { QuickActions, type QuickAction } from "@/components/shared/quick-actions";
import { DashboardHero } from "@/components/dashboard/dashboard-hero";
import { DashboardSuggestedPrompts } from "@/components/dashboard/dashboard-suggested-prompts";
import { DashboardCapabilities } from "@/components/dashboard/dashboard-capabilities";
import { DashboardEmptySection } from "@/components/dashboard/dashboard-empty-section";
import { useLastConversationPreview } from "@/lib/dashboard/use-last-conversation-preview";
import { getMeRequest } from "@/lib/api/auth";
import { getMyProfileRequest } from "@/lib/api/profile";
import { ApiError } from "@/lib/api/client";
import { useRouter } from "@/i18n/navigation";

/**
 * ATLAS-P1-DASH-01 — the sole remaining Phase 1 task
 * (MASTER_IMPLEMENTATION_ROADMAP.md's Phase 1 module list; see this
 * task's own handoff for the full scope note). Implements
 * 18_DASHBOARD_EXPERIENCE.md's §Default Landing / §Empty Dashboard —
 * the parts of that document that don't depend on Trip Service data,
 * which doesn't exist until Phase 2+ (DEPENDENCY_GRAPH.md §4/§5).
 * Travel Summary Hero, Travel Timeline, and every data-backed widget
 * (Budget/Weather/Checklist) are explicitly deferred — building them
 * now would mean fabricating trip data, which BRAND_GUIDELINES.md
 * §13 forbids ("Never fabricates travel information").
 *
 * Fetches the same GET /auth/me + GET /profile/me pair ProfileMenu
 * fetches independently (see that component's own docstring on why
 * there's no shared cache yet) — this instance renders the page's own
 * loading/error states (Skeleton / RetryCard) rather than degrading
 * silently, since a failed fetch here is the whole page's content,
 * not a small header dropdown.
 *
 * Retry keeps `loadState` at "error" throughout the attempt (rather
 * than flashing back to the full Skeleton) — RetryCard's own
 * `isRetrying` + a ConnectionStatus("reconnecting") indicator
 * communicate the in-flight state instead, matching
 * PREMIUM_MICROINTERACTIONS.md's "never abrupt" error-feedback
 * guidance.
 */
type LoadState = "loading" | "loaded" | "error";

export function DashboardPageContent() {
  const t = useTranslations("Dashboard");
  const router = useRouter();
  const conversation = useLastConversationPreview();

  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [isRetrying, setIsRetrying] = useState(false);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [retryNonce, setRetryNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getMeRequest(), getMyProfileRequest()])
      .then(([, profile]) => {
        if (cancelled) return;
        setDisplayName(profile.full_name);
        setLoadState("loaded");
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        if (error instanceof ApiError && error.status === 401) {
          // proxy.ts's own edge guard only checks cookie *presence*,
          // not validity (see that file's docstring: "a page that
          // receives a 401... is expected to redirect to /login
          // itself once such a page exists"). This is that page.
          router.replace(`/login?redirect=${encodeURIComponent("/dashboard")}`);
          return;
        }
        setLoadState("error");
      })
      .finally(() => {
        if (!cancelled) setIsRetrying(false);
      });
    return () => {
      cancelled = true;
    };
  }, [retryNonce, router]);

  function handleRetry() {
    setIsRetrying(true);
    setRetryNonce((n) => n + 1);
  }

  const quickActions: QuickAction[] = [
    { key: "newTrip", label: t("quickActions.newTrip"), href: "/chat", icon: Sparkles },
    ...(conversation.hasConversation
      ? [
          {
            key: "continueChat",
            label: t("quickActions.continueChat"),
            href: "/chat",
            icon: MessageCircle,
          },
        ]
      : []),
    { key: "settings", label: t("quickActions.settings"), href: "/settings", icon: SettingsIcon },
  ];

  return (
    <Container size="max" className="py-8 md:py-10">
      {loadState === "loading" ? (
        <div className="flex flex-col gap-6" aria-busy="true" aria-live="polite">
          <span className="sr-only">{t("loading")}</span>
          <Skeleton className="h-56 w-full rounded-2xl" />
          <Skeleton className="h-12 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
      ) : loadState === "error" ? (
        <Stack gap={4} align="center">
          {isRetrying ? (
            <ConnectionStatus state="reconnecting" label={t("loadError.reconnecting")} />
          ) : null}
          <RetryCard
            title={t("loadError.title")}
            description={t("loadError.description")}
            retryLabel={t("loadError.retry")}
            onRetry={handleRetry}
            isRetrying={isRetrying}
            className="w-full"
          />
        </Stack>
      ) : (
        <Stack gap={8}>
          <DashboardHero displayName={displayName} conversation={conversation} />

          <QuickActions label={t("quickActions.label")} actions={quickActions} />

          {!conversation.hasConversation ? <DashboardSuggestedPrompts /> : null}

          <DashboardCapabilities />

          <div className="grid gap-6 md:grid-cols-2">
            <DashboardEmptySection
              title={t("trips.title")}
              icon={<Map className="h-8 w-8" aria-hidden="true" />}
              emptyTitle={t("trips.emptyTitle")}
              emptyDescription={t("trips.emptyDescription")}
              actionHref="/chat"
              actionLabel={t("trips.emptyAction")}
            />
            <DashboardEmptySection
              title={t("recommendations.title")}
              icon={<Sparkles className="h-8 w-8" aria-hidden="true" />}
              emptyTitle={t("recommendations.emptyTitle")}
              emptyDescription={t("recommendations.emptyDescription")}
            />
          </div>
        </Stack>
      )}
    </Container>
  );
}
