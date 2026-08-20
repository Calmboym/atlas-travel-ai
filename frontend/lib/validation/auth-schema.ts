import { z } from "zod";

/**
 * Password policy: MINIMUM 8 CHARACTERS ONLY.
 *
 * Searched for an explicit password policy in every doc in this task's
 * required set plus ARCHITECTURE.md §12 and GUIDELINES.md §11 (both of
 * which cover *storage* — hashing — not client-side complexity rules).
 * None specify length/complexity. Per the approved plan adjustment,
 * the fallback is "minimum of 8 characters only" — no forced
 * uppercase/number/symbol rules are added here.
 */
export const MIN_PASSWORD_LENGTH = 8;

/**
 * Every message the schema can produce, as plain strings rather than a
 * next-intl `t` function directly — keeps this module free of any
 * i18n-library coupling (still trivially testable / usable outside a
 * React tree) while letting the actual caller supply translated text.
 * `passwordTooShort` is pre-interpolated by the caller (e.g.
 * `t("passwordTooShort", { min: MIN_PASSWORD_LENGTH })`) since Zod
 * messages are plain strings, not render-time nodes.
 */
export interface RegisterSchemaMessages {
  emailRequired: string;
  emailInvalid: string;
  passwordRequired: string;
  passwordTooShort: string;
  confirmPasswordRequired: string;
  passwordsMismatch: string;
}

/**
 * Localization audit finding (AUTH-01 audit, RTL/i18n pass): this
 * schema previously hardcoded every validation message in English,
 * meaning `/fa/register` and `/de/register` showed English errors
 * regardless of locale. `messages/{en,fa,de}.json`'s new
 * `Auth.validation` namespace now holds the real, translated copy;
 * `RegisterForm` builds a live-localized schema via this factory using
 * `useTranslations("Auth.validation")`. This function is the single
 * place field-shape + validation rules live — only the message text
 * varies by caller.
 *
 * Email is normalized (trim + lowercase) at the schema level, per the
 * approved plan adjustment, so every consumer of the validated form
 * value (RegisterForm's onSubmit, tests) already receives the
 * normalized string — normalization cannot be forgotten downstream.
 */
export function createRegisterSchema(messages: RegisterSchemaMessages) {
  return z
    .object({
      email: z
        .string()
        .trim()
        .toLowerCase()
        .min(1, { message: messages.emailRequired })
        .pipe(z.email({ message: messages.emailInvalid })),
      password: z
        .string()
        .min(1, { message: messages.passwordRequired })
        .min(MIN_PASSWORD_LENGTH, { message: messages.passwordTooShort }),
      confirmPassword: z
        .string()
        .min(1, { message: messages.confirmPasswordRequired }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: messages.passwordsMismatch,
      path: ["confirmPassword"],
    });
}

/** English-language defaults — must stay byte-identical to
 * `messages/en.json`'s `Auth.validation` namespace (verified by the
 * two test suites that check each: tests/auth-schema.test.ts against
 * this constant, tests/register-form.test.tsx against the live
 * next-intl-rendered form). */
const DEFAULT_EN_MESSAGES: RegisterSchemaMessages = {
  emailRequired: "Email is required.",
  emailInvalid: "Please enter a valid email address.",
  passwordRequired: "Password is required.",
  passwordTooShort: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
  confirmPasswordRequired: "Please confirm your password.",
  passwordsMismatch: "Passwords do not match.",
};

/**
 * Default English schema — used by unit tests that validate schema
 * behavior independent of any React/next-intl context. RegisterForm
 * itself does NOT use this constant at runtime; it calls
 * `createRegisterSchema` directly with next-intl's live translator so
 * validation messages match the page's actual locale.
 */
export const registerSchema = createRegisterSchema(DEFAULT_EN_MESSAGES);

export type RegisterFormValues = z.infer<typeof registerSchema>;
