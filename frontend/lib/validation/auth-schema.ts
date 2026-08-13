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
const MIN_PASSWORD_LENGTH = 8;

/**
 * Email is normalized (trim + lowercase) at the schema level, per the
 * approved plan adjustment, so every consumer of the validated form
 * value (RegisterForm's onSubmit, tests) already receives the
 * normalized string — normalization cannot be forgotten downstream.
 */
export const registerSchema = z
  .object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .min(1, { message: "Email is required." })
      .pipe(z.email({ message: "Please enter a valid email address." })),
    password: z
      .string()
      .min(1, { message: "Password is required." })
      .min(MIN_PASSWORD_LENGTH, {
        message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
      }),
    confirmPassword: z
      .string()
      .min(1, { message: "Please confirm your password." }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const REGISTER_FIELD_LABELS = {
  email: "Email",
  password: "Password",
  confirmPassword: "Confirm password",
} as const;
