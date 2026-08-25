"use client";

import { useId, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "framer-motion";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import {
  createResetPasswordSchema,
  type ResetPasswordFormValues,
} from "@/lib/validation/reset-password-schema";
import { DURATION, SPRING_GENTLE } from "@/lib/tokens/motion";

export interface ResetPasswordFormProps {
  /**
   * ADDED — ATLAS-P1-AUTH-06. Same UI/wiring split as LoginForm: this
   * component is presentation-only, wired to the real
   * POST /api/v1/auth/reset-password endpoint by its caller
   * (reset-password-content.tsx), which already has the token from
   * the URL — this form only collects/validates the new password.
   */
  onSubmit: (values: ResetPasswordFormValues) => Promise<void>;
}

export function ResetPasswordForm({ onSubmit }: ResetPasswordFormProps) {
  const prefersReducedMotion = useReducedMotion();
  const t = useTranslations("Auth.resetPassword");
  const tValidation = useTranslations("Auth.validation");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const localizedSchema = useMemo(
    () =>
      createResetPasswordSchema({
        passwordRequired: tValidation("passwordRequired"),
        passwordTooShort: tValidation("passwordTooShort", { min: 8 }),
        confirmPasswordRequired: tValidation("confirmPasswordRequired"),
        passwordsMismatch: tValidation("passwordsMismatch"),
      }),
    [tValidation],
  );

  const {
    register,
    handleSubmit,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(localizedSchema),
    mode: "onBlur", // ACCESSIBILITY.md §Forms: "Validation happens: On blur and On submit"
    reValidateMode: "onChange",
  });

  const newPasswordErrorId = useId();
  const confirmPasswordErrorId = useId();
  const submitErrorId = useId();

  const onValid = async (values: ResetPasswordFormValues) => {
    setSubmitError(null);
    try {
      await onSubmit(values);
      setIsSuccess(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : t("genericError"));
    }
  };

  const onInvalid = (formErrors: typeof errors) => {
    const firstField = Object.keys(formErrors)[0] as keyof ResetPasswordFormValues | undefined;
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
        <Link href="/login" className={`${buttonVariants({ variant: "primary" })} mt-2`}>
          {t("continueToLogin")}
        </Link>
      </motion.div>
    );
  }

  return (
    <form noValidate onSubmit={handleSubmit(onValid, onInvalid)} className="flex flex-col gap-5">
      <div>
        <Label htmlFor="newPassword" required>
          {t("newPasswordLabel")}
        </Label>
        <Input
          id="newPassword"
          type="password"
          autoComplete="new-password"
          invalid={!!errors.newPassword}
          aria-describedby={errors.newPassword ? newPasswordErrorId : undefined}
          className="mt-1.5"
          {...register("newPassword")}
        />
        <FormError id={newPasswordErrorId} message={errors.newPassword?.message} />
      </div>

      <div>
        <Label htmlFor="confirmPassword" required>
          {t("confirmPasswordLabel")}
        </Label>
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          invalid={!!errors.confirmPassword}
          aria-describedby={errors.confirmPassword ? confirmPasswordErrorId : undefined}
          className="mt-1.5"
          {...register("confirmPassword")}
        />
        <FormError id={confirmPasswordErrorId} message={errors.confirmPassword?.message} />
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
