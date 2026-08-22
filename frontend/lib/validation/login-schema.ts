import { z } from "zod";

/**
 * Login validation schema.
 *
 * ADDED — ATLAS-P1-AUTH-05. Deliberately lighter than
 * `createRegisterSchema`: login must not re-state the password policy
 * (min 8 chars) — a user whose account predates a future policy change
 * must still be able to log in with their existing password. Only
 * "is something present" is checked here; the backend is the source
 * of truth for whether the credentials are actually correct.
 *
 * Same factory-function-over-i18n-messages shape as
 * `createRegisterSchema` (lib/validation/auth-schema.ts), for the same
 * reason: keeps this module free of any i18n-library coupling while
 * letting the caller (LoginForm, via next-intl's live translator)
 * supply localized text.
 */
export interface LoginSchemaMessages {
  emailRequired: string;
  emailInvalid: string;
  passwordRequired: string;
}

export function createLoginSchema(messages: LoginSchemaMessages) {
  return z.object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .min(1, { message: messages.emailRequired })
      .pipe(z.email({ message: messages.emailInvalid })),
    password: z.string().min(1, { message: messages.passwordRequired }),
  });
}

/** English-language defaults — must stay byte-identical to
 * `messages/en.json`'s `Auth.validation` namespace (shared with
 * register; login reuses emailRequired/emailInvalid/passwordRequired
 * rather than duplicating them under a separate key, since the text is
 * identical). */
const DEFAULT_EN_MESSAGES: LoginSchemaMessages = {
  emailRequired: "Email is required.",
  emailInvalid: "Please enter a valid email address.",
  passwordRequired: "Password is required.",
};

/**
 * Default English schema — used by unit tests that validate schema
 * behavior independent of any React/next-intl context. LoginForm
 * itself does NOT use this constant at runtime; it calls
 * `createLoginSchema` directly with next-intl's live translator.
 */
export const loginSchema = createLoginSchema(DEFAULT_EN_MESSAGES);

export type LoginFormValues = z.infer<typeof loginSchema>;
