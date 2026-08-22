"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { loginRequest } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import type { LoginFormValues } from "@/lib/validation/login-schema";

/**
 * ADDED — ATLAS-P1-AUTH-05. Unlike AUTH-01's RegisterForm (deliberately
 * UI-only, see register-page-content.tsx), Login was scoped as ONE
 * task — "Login UI + backend endpoint" — so this wires the form to the
 * real POST /api/v1/auth/login endpoint end-to-end. A thrown ApiError
 * becomes LoginForm's form-level error banner; success shows
 * LoginForm's success state. No redirect to a dashboard/authenticated
 * area is attempted here: neither the Dashboard (DASH-01) nor route
 * guards (AUTH-08) exist yet, so there is nowhere real to send the
 * user — the same "no dead ends" reasoning RegisterForm's own success
 * state already follows.
 */
async function handleLogin(values: LoginFormValues): Promise<void> {
  try {
    await loginRequest(values);
  } catch (error) {
    if (error instanceof ApiError) {
      throw new Error(error.message);
    }
    throw error;
  }
}

export function LoginPageContent() {
  const t = useTranslations("Auth.login");

  return (
    <div>
      <h1 className="text-2xl font-bold leading-tight text-text-primary">{t("title")}</h1>
      <p className="mt-2 text-sm leading-normal text-text-secondary">{t("subtitle")}</p>

      <div className="mt-6">
        <LoginForm onSubmit={handleLogin} />
      </div>

      <div className="mt-6">
        <OAuthButtons />
      </div>

      <p className="mt-6 text-center text-sm text-text-secondary">
        {t("noAccount")}{" "}
        <Link
          href="/register"
          className="font-medium text-primary underline-offset-2 hover:underline"
        >
          {t("signUp")}
        </Link>
      </p>
    </div>
  );
}
