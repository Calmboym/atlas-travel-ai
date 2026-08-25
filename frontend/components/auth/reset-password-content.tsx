"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useReducedMotion, motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { resetPasswordRequest } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { DURATION } from "@/lib/tokens/motion";
import type { ResetPasswordFormValues } from "@/lib/validation/reset-password-schema";

/**
 * ADDED — ATLAS-P1-AUTH-06. Reads the reset token from the URL
 * (`?token=...`, the exact query shape app/services/auth_service.py's
 * stubbed email-delivery log line produces:
 * `/reset-password?token=<raw_token>`) — same convention
 * VerifyEmailContent (AUTH-04) established. A Client Component
 * (useSearchParams requires one) — wrapped in Suspense by the route's
 * page.tsx per Next.js's own requirement for that hook.
 *
 * Deliberately NOT a straight copy of VerifyEmailContent's
 * auto-submit-on-mount pattern: verify-email needs no input from the
 * user (the token alone is sufficient), but reset-password needs a
 * new password typed in first — so this renders a form and waits for
 * submission rather than firing the API call in a useEffect. An
 * invalid/expired token surfaces as the FORM's own inline error (see
 * ResetPasswordForm's submitError state) rather than a page-level
 * error panel: the user has already filled out two password fields
 * by the time that's discovered, and replacing the whole UI with an
 * unrelated error screen would throw that input away for no reason.
 */
export function ResetPasswordContent() {
  const t = useTranslations("Auth.resetPassword");
  const searchParams = useSearchParams();
  const prefersReducedMotion = useReducedMotion();
  const token = searchParams.get("token");

  if (!token) {
    return (
      <motion.div
        role="alert"
        initial={prefersReducedMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: DURATION.normal }}
        className="flex flex-col items-center gap-3 py-6 text-center"
      >
        <AlertCircle className="h-10 w-10 text-error-strong" aria-hidden="true" />
        <p className="text-lg font-semibold text-text-primary">{t("errorTitle")}</p>
        <p className="text-sm text-text-secondary">{t("missingToken")}</p>
        <Link
          href="/forgot-password"
          className="mt-2 font-medium text-primary underline-offset-2 hover:underline"
        >
          {t("requestNewLink")}
        </Link>
      </motion.div>
    );
  }

  const handleResetPassword = async (values: ResetPasswordFormValues): Promise<void> => {
    try {
      await resetPasswordRequest(token, values.newPassword);
    } catch (error) {
      // Only an ApiError's message is guaranteed to be safe,
      // translated, user-facing copy (it came from the backend's own
      // response body). Anything else — a network failure, a thrown
      // TypeError from fetch itself — must never reach the user
      // verbatim (AI_EXPERIENCE.md §Error Recovery: "Never display
      // raw system errors"). ResetPasswordForm's own catch trusts
      // any Error's .message at face value, so that normalization has
      // to happen here, once, rather than relying on the form to
      // guess which errors are safe to display.
      throw new Error(error instanceof ApiError ? error.message : t("genericError"));
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold leading-tight text-text-primary">{t("title")}</h1>
      <p className="mt-2 text-sm leading-normal text-text-secondary">{t("subtitle")}</p>

      <div className="mt-6">
        <ResetPasswordForm onSubmit={handleResetPassword} />
      </div>
    </div>
  );
}
