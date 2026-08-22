"use client";

import { useId, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "framer-motion";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import { createLoginSchema, type LoginFormValues } from "@/lib/validation/login-schema";
import { DURATION, SPRING_GENTLE } from "@/lib/tokens/motion";

export interface LoginFormProps {
  /**
   * Called with validated values once the form passes client-side
   * validation. Unlike AUTH-01's RegisterForm (deliberately UI-only —
   * see register-page-content.tsx), Login was never split into a
   * UI-only pass: AUTH-05's own scope is "Login UI + backend
   * endpoint" as one task, so this component is wired end-to-end by
   * its caller (login-page-content.tsx) to the real
   * POST /api/v1/auth/login endpoint. A rejected promise is shown as
   * a form-level error; a resolved promise shows the success state —
   * same contract as RegisterForm's onSubmit.
   */
  onSubmit: (values: LoginFormValues) => Promise<void>;
}

export function LoginForm({ onSubmit }: LoginFormProps) {
  const prefersReducedMotion = useReducedMotion();
  const t = useTranslations("Auth.login");
  const tValidation = useTranslations("Auth.validation");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const localizedSchema = useMemo(
    () =>
      createLoginSchema({
        emailRequired: tValidation("emailRequired"),
        emailInvalid: tValidation("emailInvalid"),
        passwordRequired: tValidation("passwordRequired"),
      }),
    [tValidation],
  );

  const {
    register,
    handleSubmit,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(localizedSchema),
    mode: "onBlur", // ACCESSIBILITY.md §Forms: "Validation happens: On blur and On submit"
    reValidateMode: "onChange",
  });

  const emailErrorId = useId();
  const passwordErrorId = useId();
  const submitErrorId = useId();

  const onValid = async (values: LoginFormValues) => {
    setSubmitError(null);
    try {
      await onSubmit(values);
      setIsSuccess(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : t("genericError"));
    }
  };

  const onInvalid = (formErrors: typeof errors) => {
    const firstField = Object.keys(formErrors)[0] as keyof LoginFormValues | undefined;
    if (firstField) setFocus(firstField);
  };

  if (isSuccess) {
    return (
      <motion.div
        role="status"
        initial={prefersReducedMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: DURATION.normal }}
        className="flex flex-col items-center gap-3 py-6 text-center"
      >
        <CheckCircle2 className="h-10 w-10 text-primary" aria-hidden="true" />
        <p className="text-lg font-semibold text-text-primary">{t("successTitle")}</p>
        <p className="text-sm text-text-secondary">{t("successSubtitle")}</p>
      </motion.div>
    );
  }

  return (
    <form noValidate onSubmit={handleSubmit(onValid, onInvalid)} className="flex flex-col gap-5">
      <div>
        <Label htmlFor="email" required>
          {t("emailLabel")}
        </Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          invalid={!!errors.email}
          aria-describedby={errors.email ? emailErrorId : undefined}
          className="mt-1.5"
          {...register("email")}
        />
        <FormError id={emailErrorId} message={errors.email?.message} />
      </div>

      <div>
        <Label htmlFor="password" required>
          {t("passwordLabel")}
        </Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          invalid={!!errors.password}
          aria-describedby={errors.password ? passwordErrorId : undefined}
          className="mt-1.5"
          {...register("password")}
        />
        <FormError id={passwordErrorId} message={errors.password?.message} />
      </div>

      {submitError ? (
        <motion.div
          id={submitErrorId}
          role="alert"
          initial={prefersReducedMotion ? false : { opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={SPRING_GENTLE}
          className="flex items-center gap-2 rounded-lg bg-error-tint px-4 py-3 text-sm text-error-strong"
        >
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{submitError}</span>
        </motion.div>
      ) : null}

      <Button type="submit" isLoading={isSubmitting} className="mt-1 w-full">
        {isSubmitting ? t("submitting") : t("submit")}
      </Button>
    </form>
  );
}
