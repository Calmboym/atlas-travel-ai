import { z } from "zod";

import { MIN_PASSWORD_LENGTH } from "@/lib/validation/auth-schema";

/**
 * Reset-password validation schema.
 *
 * ADDED — ATLAS-P1-AUTH-06. Reuses MIN_PASSWORD_LENGTH from
 * auth-schema.ts (createRegisterSchema) rather than redefining it —
 * this is the exact same "set a password" policy question, and the
 * two must never drift apart. Field shape (newPassword +
 * confirmPassword, with a cross-field refine) mirrors
 * createRegisterSchema's password/confirmPassword pair one-for-one;
 * only the field names differ (newPassword vs. password), since the
 * page copy needs to say "new password" for this flow to make sense.
 */
export interface ResetPasswordSchemaMessages {
  passwordRequired: string;
  passwordTooShort: string;
  confirmPasswordRequired: string;
  passwordsMismatch: string;
}

export function createResetPasswordSchema(messages: ResetPasswordSchemaMessages) {
  return z
    .object({
      newPassword: z
        .string()
        .min(1, { message: messages.passwordRequired })
        .min(MIN_PASSWORD_LENGTH, { message: messages.passwordTooShort }),
      confirmPassword: z.string().min(1, { message: messages.confirmPasswordRequired }),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: messages.passwordsMismatch,
      path: ["confirmPassword"],
    });
}

/** English-language defaults — must stay byte-identical to
 * `messages/en.json`'s `Auth.validation` namespace (shared with
 * register — see this file's own docstring). */
const DEFAULT_EN_MESSAGES: ResetPasswordSchemaMessages = {
  passwordRequired: "Password is required.",
  passwordTooShort: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
  confirmPasswordRequired: "Please confirm your password.",
  passwordsMismatch: "Passwords do not match.",
};

/**
 * Default English schema — used by unit tests independent of any
 * React/next-intl context. ResetPasswordForm itself does NOT use this
 * constant at runtime; it calls createResetPasswordSchema directly
 * with next-intl's live translator.
 */
export const resetPasswordSchema = createResetPasswordSchema(DEFAULT_EN_MESSAGES);

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
