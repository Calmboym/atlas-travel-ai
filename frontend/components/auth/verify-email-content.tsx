"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "framer-motion";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";
import { verifyEmailRequest } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { DURATION } from "@/lib/tokens/motion";

type AsyncState = "verifying" | "success" | "error";

function StatusPanel({
  role,
  animate,
  icon,
  title,
  message,
  action,
}: {
  role: "status" | "alert";
  animate: boolean;
  icon: ReactNode;
  title?: string;
  message: string;
  action?: ReactNode;
}) {
  return (
    <motion.div
      role={role}
      initial={animate ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
      transition={{ duration: DURATION.normal }}
      className="flex flex-col items-center gap-3 py-6 text-center"
    >
      {icon}
      {title ? <p className="text-lg font-semibold text-text-primary">{title}</p> : null}
      <p className="text-sm text-text-secondary">{message}</p>
      {action}
    </motion.div>
  );
}

/**
 * ADDED — ATLAS-P1-AUTH-04. Reads the verification token from the URL
 * (`?token=...`, the exact query shape
 * app/services/auth_service.py's stubbed email-delivery log line
 * produces: `/verify-email?token=<raw_token>`) and confirms it against
 * POST /api/v1/auth/verify-email. A Client Component (useSearchParams
 * requires one) — wrapped in Suspense by the route's page.tsx per
 * Next.js's own requirement for that hook.
 *
 * The "no token in the URL" case is a plain render-time branch, not
 * effect-driven state: it's already known synchronously from
 * searchParams, so setting it via useEffect would mean calling
 * setState synchronously inside the effect body — a real
 * `react-hooks/set-state-in-effect` violation, caught by actually
 * running lint (see this session's handoff notes). The effect below
 * only sets state from the async verifyEmailRequest promise's own
 * .then()/.catch() callbacks, which is exactly the pattern that rule
 * expects.
 */
export function VerifyEmailContent() {
  const t = useTranslations("Auth.verifyEmail");
  const searchParams = useSearchParams();
  const prefersReducedMotion = useReducedMotion();
  const token = searchParams.get("token");

  const [state, setState] = useState<AsyncState>("verifying");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    verifyEmailRequest(token)
      .then(() => {
        if (!cancelled) setState("success");
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setErrorMessage(error instanceof ApiError ? error.message : t("genericError"));
        setState("error");
      });

    return () => {
      cancelled = true;
    };
  }, [token, t]);

  const animate = !prefersReducedMotion;

  if (!token) {
    return (
      <StatusPanel
        role="alert"
        animate={animate}
        icon={<AlertCircle className="h-10 w-10 text-error-strong" aria-hidden="true" />}
        title={t("errorTitle")}
        message={t("missingToken")}
        action={
          <Link
            href="/login"
            className="mt-2 font-medium text-primary underline-offset-2 hover:underline"
          >
            {t("backToLogin")}
          </Link>
        }
      />
    );
  }

  if (state === "verifying") {
    return (
      <StatusPanel
        role="status"
        animate={false}
        icon={<Loader2 className="h-10 w-10 animate-spin text-primary" aria-hidden="true" />}
        message={t("verifying")}
      />
    );
  }

  if (state === "success") {
    return (
      <StatusPanel
        role="status"
        animate={animate}
        icon={<CheckCircle2 className="h-10 w-10 text-primary" aria-hidden="true" />}
        title={t("successTitle")}
        message={t("successSubtitle")}
        action={
          <Link href="/login" className={`${buttonVariants({ variant: "primary" })} mt-2`}>
            {t("continueToLogin")}
          </Link>
        }
      />
    );
  }

  return (
    <StatusPanel
      role="alert"
      animate={animate}
      icon={<AlertCircle className="h-10 w-10 text-error-strong" aria-hidden="true" />}
      title={t("errorTitle")}
      message={errorMessage ?? t("genericError")}
      action={
        <Link
          href="/login"
          className="mt-2 font-medium text-primary underline-offset-2 hover:underline"
        >
          {t("backToLogin")}
        </Link>
      }
    />
  );
}
