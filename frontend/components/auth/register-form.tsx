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
  createRegisterSchema,
  MIN_PASSWORD_LENGTH,
  type RegisterFormValues,
} from "@/lib/validation/auth-schema";
import { DURATION, SPRING_GENTLE } from "@/lib/tokens/motion";

export interface RegisterFormProps {
  /**
   * Called with validated, normalized values once the form passes
   * client-side validation. AUTH-01 is UI-only (approved plan
   * adjustment #3) — this component has no knowledge of how
   * registration is actually fulfilled (no fetch, no API client). The
   * caller (the route/page, or a test) supplies that behavior. A
   * rejected promise is shown as a form-level error; a resolved
   * promise shows the success state.
   */
  onSubmit: (values: RegisterFormValues) => Promise<void>;
}

export function RegisterForm({ onSubmit }: RegisterFormProps) {
  const prefersReducedMotion = useReducedMotion();
  const t = useTranslations("Auth.register");
  const tValidation = useTranslations("Auth.validation");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Localization fix (AUTH-01 audit): the schema previously hardcoded
  // English validation messages regardless of locale. Rebuilt here
  // with next-intl's live translator so /fa and /de show real
  // localized errors, not English ones under an RTL layout.
  const localizedSchema = useMemo(
    () =>
      createRegisterSchema({
        emailRequired: tValidation("emailRequired"),
        emailInvalid: tValidation("emailInvalid"),
        passwordRequired: tValidation("passwordRequired"),
        passwordTooShort: tValidation("passwordTooShort", {
          min: MIN_PASSWORD_LENGTH,
        }),
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
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(localizedSchema),
    mode: "onBlur", // ACCESSIBILITY.md §Forms: "Validation happens: On blur and On submit"
    reValidateMode: "onChange",
  });

  const emailErrorId = useId();
  const passwordErrorId = useId();
  const confirmErrorId = useId();
  const submitErrorId = useId();

  const onValid = async (values: RegisterFormValues) => {
    setSubmitError(null);
    try {
      await onSubmit(values);
      setIsSuccess(true);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : t("genericError"),
      );
    }
  };

  // Forms & Feedback checklist: auto-focus the first invalid field
  // after a failed submit attempt.
  const onInvalid = (formErrors: typeof errors) => {
    const firstField = Object.keys(formErrors)[0] as
      | keyof RegisterFormValues
      | undefined;
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
        <CheckCircle2
          className="h-10 w-10 text-primary"
          aria-hidden="true"
        />
        <p className="text-lg font-semibold text-text-primary">
          {t("successTitle")}
        </p>
        <p className="text-sm text-text-secondary">
          {t("successSubtitle")}
        </p>
      </motion.div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onValid, onInvalid)}
      className="flex flex-col gap-5"
    >
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
          autoComplete="new-password"
          invalid={!!errors.password}
          aria-describedby={errors.password ? passwordErrorId : undefined}
          className="mt-1.5"
          {...register("password")}
        />
        <FormError id={passwordErrorId} message={errors.password?.message} />
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
          aria-describedby={
            errors.confirmPassword ? confirmErrorId : undefined
          }
          className="mt-1.5"
          {...register("confirmPassword")}
        />
        <FormError
          id={confirmErrorId}
          message={errors.confirmPassword?.message}
        />
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
