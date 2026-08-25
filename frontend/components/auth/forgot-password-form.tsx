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
import {
  createForgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "@/lib/validation/forgot-password-schema";
import { DURATION, SPRING_GENTLE } from "@/lib/tokens/motion";

export interface ForgotPasswordFormProps {
  /**
   * ADDED — ATLAS-P1-AUTH-06. Same UI/wiring split as LoginForm
   * (login-form.tsx): this component is presentation-only, wired to
   * the real POST /api/v1/auth/forgot-password endpoint by its caller
   * (forgot-password-page-content.tsx). A rejected promise becomes
   * this form's error banner; a resolved promise shows the success
   * state — identical contract to LoginForm/RegisterForm's onSubmit.
   */
  onSubmit: (values: ForgotPasswordFormValues) => Promise<void>;
}

export function ForgotPasswordForm({ onSubmit }: ForgotPasswordFormProps) {
  const prefersReducedMotion = useReducedMotion();
  const t = useTranslations("Auth.forgotPassword");
  const tValidation = useTranslations("Auth.validation");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const localizedSchema = useMemo(
    () =>
      createForgotPasswordSchema({
        emailRequired: tValidation("emailRequired"),
        emailInvalid: tValidation("emailInvalid"),
      }),
    [tValidation],
  );

  const {
    register,
    handleSubmit,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(localizedSchema),
    mode: "onBlur", // ACCESSIBILITY.md §Forms: "Validation happens: On blur and On submit"
    reValidateMode: "onChange",
  });

  const emailErrorId = useId();
  const submitErrorId = useId();

  const onValid = async (values: ForgotPasswordFormValues) => {
    setSubmitError(null);
    try {
      await onSubmit(values);
      setIsSuccess(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : t("genericError"));
    }
  };

  const onInvalid = (formErrors: typeof errors) => {
    const firstField = Object.keys(formErrors)[0] as keyof ForgotPasswordFormValues | undefined;
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
