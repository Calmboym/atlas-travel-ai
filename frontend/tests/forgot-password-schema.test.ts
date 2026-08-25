import { describe, expect, it } from "vitest";
import {
  createForgotPasswordSchema,
  forgotPasswordSchema,
} from "@/lib/validation/forgot-password-schema";

describe("forgotPasswordSchema (default English messages)", () => {
  it("accepts a valid email", () => {
    const result = forgotPasswordSchema.safeParse({ email: "jane@example.com" });
    expect(result.success).toBe(true);
  });

  it("trims and lowercases the email", () => {
    const result = forgotPasswordSchema.parse({ email: "  Jane@Example.COM  " });
    expect(result.email).toBe("jane@example.com");
  });

  it("rejects an empty email", () => {
    const result = forgotPasswordSchema.safeParse({ email: "" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const result = forgotPasswordSchema.safeParse({ email: "not-an-email" });
    expect(result.success).toBe(false);
  });
});

describe("createForgotPasswordSchema (custom messages)", () => {
  it("uses the supplied messages instead of the English defaults", () => {
    const schema = createForgotPasswordSchema({
      emailRequired: "CUSTOM_EMAIL_REQUIRED",
      emailInvalid: "CUSTOM_EMAIL_INVALID",
    });

    const result = schema.safeParse({ email: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("CUSTOM_EMAIL_REQUIRED");
    }
  });
});
