import { describe, expect, it } from "vitest";
import {
  createResetPasswordSchema,
  resetPasswordSchema,
} from "@/lib/validation/reset-password-schema";

describe("resetPasswordSchema (default English messages)", () => {
  it("accepts a valid, matching password pair", () => {
    const result = resetPasswordSchema.safeParse({
      newPassword: "longenough1",
      confirmPassword: "longenough1",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an empty new password", () => {
    const result = resetPasswordSchema.safeParse({ newPassword: "", confirmPassword: "" });
    expect(result.success).toBe(false);
  });

  it("rejects a new password under 8 characters", () => {
    const result = resetPasswordSchema.safeParse({
      newPassword: "short1",
      confirmPassword: "short1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a mismatched confirmation, attached to the confirmPassword field", () => {
    const result = resetPasswordSchema.safeParse({
      newPassword: "longenough1",
      confirmPassword: "different1",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(["confirmPassword"]);
    }
  });

  it("rejects an empty confirmation", () => {
    const result = resetPasswordSchema.safeParse({
      newPassword: "longenough1",
      confirmPassword: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("createResetPasswordSchema (custom messages)", () => {
  it("uses the supplied messages instead of the English defaults", () => {
    const schema = createResetPasswordSchema({
      passwordRequired: "CUSTOM_PASSWORD_REQUIRED",
      passwordTooShort: "CUSTOM_TOO_SHORT",
      confirmPasswordRequired: "CUSTOM_CONFIRM_REQUIRED",
      passwordsMismatch: "CUSTOM_MISMATCH",
    });

    const emptyResult = schema.safeParse({ newPassword: "", confirmPassword: "" });
    expect(emptyResult.success).toBe(false);
    if (!emptyResult.success) {
      expect(emptyResult.error.issues[0].message).toBe("CUSTOM_PASSWORD_REQUIRED");
    }

    const mismatchResult = schema.safeParse({
      newPassword: "longenough1",
      confirmPassword: "different1",
    });
    expect(mismatchResult.success).toBe(false);
    if (!mismatchResult.success) {
      expect(mismatchResult.error.issues[0].message).toBe("CUSTOM_MISMATCH");
    }
  });
});
