"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { forgotPasswordRequest } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import type { ForgotPasswordFormValues } from "@/lib/validation/forgot-password-schema";

/**
 * ADDED — ATLAS-P1-AUTH-06. Same "one task, wired end-to-end" scope as
 * AUTH-05's LoginPageContent (not split into a UI-only pass the way
 * AUTH-01's RegisterForm was). A thrown ApiError becomes
 * ForgotPasswordForm's form-level error banner; success shows its
 * success state, which deliberately does NOT reveal whether the email
 * address was actually found — the backend's anti-enumeration
 * response shape (identical message either way, see
 * request_password_reset's docstring) would be defeated if the
 * frontend showed a different UI state for "sent" vs. "no such
 * account."
 */
export function ForgotPasswordPageContent() {
  const t = useTranslations("Auth.forgotPassword");

  const handleForgotPassword = async (values: ForgotPasswordFormValues): Promise<void> => {
    try {
      await forgotPasswordRequest(values.email);
    } catch (error) {
      // Only an ApiError's message is guaranteed to be safe,
      // translated, user-facing copy (it came from the backend's own
      // response body). Anything else — a network failure, a thrown
      // TypeError from fetch itself — must never reach the user
      // verbatim (AI_EXPERIENCE.md §Error Recovery: "Never display
      // raw system errors"). Defined inside the component (not as a
      // top-level function) specifically so it can close over t().
      throw new Error(error instanceof ApiError ? error.message : t("genericError"));
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold leading-tight text-text-primary">{t("title")}</h1>
      <p className="mt-2 text-sm leading-normal text-text-secondary">{t("subtitle")}</p>

      <div className="mt-6">
        <ForgotPasswordForm onSubmit={handleForgotPassword} />
      </div>

      <p className="mt-6 text-center text-sm text-text-secondary">
        <Link
          href="/login"
          className="font-medium text-primary underline-offset-2 hover:underline"
        >
          {t("backToLogin")}
        </Link>
      </p>
    </div>
  );
}
