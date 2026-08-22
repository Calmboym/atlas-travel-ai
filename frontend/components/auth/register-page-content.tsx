"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { RegisterForm } from "@/components/auth/register-form";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import type { RegisterFormValues } from "@/lib/validation/auth-schema";

/**
 * AUTH-01 is UI-only (approved plan adjustment #3): no API client, no
 * service wrapper, no network call (and deliberately NOT a Next.js
 * Server Action either — a Server Action still round-trips to the
 * server, which is a form of network call). This is a plain,
 * ordinary client-side function that never leaves the browser. It
 * exists so the full field -> validate -> submit -> success/error
 * state machine is real and demonstrable without a backend. Wiring
 * this to the actual POST /auth/register endpoint is a separate,
 * later integration task — see PROJECT_STATE.md.
 */
async function handleRegister(values: RegisterFormValues): Promise<void> {
  console.info("[AUTH-01] Registration form validated (UI-only build):", {
    email: values.email,
  });
}

export function RegisterPageContent() {
  const t = useTranslations("Auth.register");

  return (
    <div>
      <h1 className="text-2xl font-bold leading-tight text-text-primary">
        {t("title")}
      </h1>
      <p className="mt-2 text-sm leading-normal text-text-secondary">
        {t("subtitle")}
      </p>

      <div className="mt-6">
        <RegisterForm onSubmit={handleRegister} />
      </div>

      {/* ADDED — ATLAS-P1-AUTH-03. RegisterForm itself and
          handleRegister above are untouched (still AUTH-01's UI-only
          scope) — this only adds the OAuth entry points alongside it,
          which is exactly what AUTH-03's own WBS scope ("OAuth button
          scaffolding ... Dependencies: AUTH-01") anticipates. */}
      <div className="mt-6">
        <OAuthButtons />
      </div>

      <p className="mt-6 text-center text-sm text-text-secondary">
        {t("alreadyHaveAccount")}{" "}
        <Link
          href="/login"
          className="font-medium text-primary underline-offset-2 hover:underline"
        >
          {t("logIn")}
        </Link>
      </p>
    </div>
  );
}
