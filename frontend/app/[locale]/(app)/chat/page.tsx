import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { Skeleton } from "@/components/ui/loading";
import { ChatPageContent } from "@/components/chat/chat-page-content";

/**
 * ATLAS-P1-CHAT-01. Suspense boundary mirrors reset-password/page.tsx
 * and verify-email/page.tsx — required by Next.js around any component
 * using useSearchParams (ChatPageContent reads `?prompt=`), confirmed
 * empirically by AUTH-04/06's own sessions. Unlike those two forms,
 * this page has real, non-trivial layout (sidebar/conversation/
 * composer) rather than a small centered card, so its fallback is a
 * matching skeleton rather than `null` — DESIGN_SYSTEM.md §33 "Never
 * blank screens," ACCESSIBILITY.md §Loading States "Skeletons must
 * include: aria-busy, Loading message."
 */
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Chat.page");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

function ChatPageSkeleton({ loadingLabel }: { loadingLabel: string }) {
  return (
    <div
      role="status"
      aria-busy="true"
      className="flex h-[calc(100dvh-9rem)] flex-col lg:h-[calc(100dvh-72px)]"
    >
      <span className="sr-only">{loadingLabel}</span>

      <div className="flex items-center gap-3 border-b border-border px-4 py-3 lg:hidden">
        <Skeleton radius="full" className="h-10 w-10" />
        <Skeleton className="h-4 w-32" />
      </div>

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-[320px] shrink-0 border-e border-border p-4 lg:block">
          <Skeleton className="mb-4 h-9 w-full rounded-xl" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="flex-1 px-4 py-6 sm:px-6">
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
              <Skeleton className="h-16 w-2/3 rounded-2xl" />
              <Skeleton className="ms-auto h-12 w-1/2 rounded-2xl" />
            </div>
          </div>
          <div className="border-t border-border px-4 py-4 sm:px-6">
            <Skeleton className="mx-auto h-12 w-full max-w-3xl rounded-3xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function ChatPage() {
  const t = await getTranslations("Chat.page");
  return (
    <Suspense fallback={<ChatPageSkeleton loadingLabel={t("loading")} />}>
      <ChatPageContent />
    </Suspense>
  );
}
