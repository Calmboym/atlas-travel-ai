"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import { apiFetch, ApiError } from "@/lib/api/client";

/**
 * OAuth entry points (Google, Apple).
 *
 * ADDED — ATLAS-P1-AUTH-03. Feature Component, owned by AUTH-03,
 * consumed by both RegisterPageContent (AUTH-01) and
 * LoginPageContent (AUTH-05) — see COMPONENT_OWNERSHIP_MATRIX.md §5.
 *
 * STUBBED, reported per this task's own acceptance criteria: no
 * Google or Apple OAuth client credentials exist anywhere in this
 * repository. Clicking a button hits the real, deployed
 * GET /api/v1/auth/oauth/{provider} route, which responds 501 with a
 * clear explanation (see backend/app/api/v1/oauth.py) — this is a
 * real network round-trip to a real (stub) endpoint, not a fake
 * client-side-only button.
 *
 * Deliberately text-only, no bespoke Google/Apple logo glyph:
 * reproducing either company's actual trademarked mark without their
 * real, licensed brand assets (unavailable in this environment — see
 * this session's handoff notes) risked an inaccurate imitation, which
 * ICONOGRAPHY_AND_ILLUSTRATION.md's licensing rule counsels against
 * ("Only use assets with verified commercial licenses"). Same
 * reasoning AuthLayout's own illustration used for avoiding copied
 * artwork, applied to third-party trademarks instead of illustration.
 */
export function OAuthButtons() {
  const t = useTranslations("Auth.oauth");
  const [error, setError] = useState<string | null>(null);
  const [pendingProvider, setPendingProvider] = useState<"google" | "apple" | null>(null);

  async function handleClick(provider: "google" | "apple") {
    setError(null);
    setPendingProvider(provider);
    try {
      await apiFetch(`/api/v1/auth/oauth/${provider}`);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : t("genericError"));
    } finally {
      setPendingProvider(null);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3" role="presentation">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs font-medium uppercase tracking-wide text-text-muted">
          {t("dividerLabel")}
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <Button
        type="button"
        variant="outline"
        isLoading={pendingProvider === "google"}
        className="w-full"
        onClick={() => handleClick("google")}
      >
        {pendingProvider === "google" ? t("connecting") : t("continueWithGoogle")}
      </Button>

      <Button
        type="button"
        variant="outline"
        isLoading={pendingProvider === "apple"}
        className="w-full"
        onClick={() => handleClick("apple")}
      >
        {pendingProvider === "apple" ? t("connecting") : t("continueWithApple")}
      </Button>

      <FormError id="oauth-error" message={error ?? undefined} />
    </div>
  );
}
