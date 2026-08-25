import { z } from "zod";

/**
 * Forgot-password validation schema.
 *
 * ADDED — ATLAS-P1-AUTH-06. Same factory-function-over-i18n-messages
 * shape as createLoginSchema/createRegisterSchema (lib/validation/
 * login-schema.ts, auth-schema.ts) — email field only, reusing the
 * exact same email rules (trim + lowercase + required + valid format)
 * as both of those, since it's the same "identify an account by
 * email" concern.
 */
export interface ForgotPasswordSchemaMessages {
  emailRequired: string;
  emailInvalid: string;
}

export function createForgotPasswordSchema(messages: ForgotPasswordSchemaMessages) {
  return z.object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .min(1, { message: messages.emailRequired })
      .pipe(z.email({ message: messages.emailInvalid })),
  });
}

/** English-language defaults — must stay byte-identical to
 * `messages/en.json`'s `Auth.validation` namespace (shared with
 * login/register — see this file's own docstring). */
const DEFAULT_EN_MESSAGES: ForgotPasswordSchemaMessages = {
  emailRequired: "Email is required.",
  emailInvalid: "Please enter a valid email address.",
};

/**
 * Default English schema — used by unit tests independent of any
 * React/next-intl context. ForgotPasswordForm itself does NOT use
 * this constant at runtime; it calls createForgotPasswordSchema
 * directly with next-intl's live translator.
 */
export const forgotPasswordSchema = createForgotPasswordSchema(DEFAULT_EN_MESSAGES);

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
