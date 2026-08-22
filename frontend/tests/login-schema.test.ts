import { describe, expect, it } from "vitest";
import { createLoginSchema, loginSchema } from "@/lib/validation/login-schema";

describe("loginSchema (default English messages)", () => {
  it("accepts a valid email/password pair", () => {
    const result = loginSchema.safeParse({
      email: "jane@example.com",
      password: "anything-not-empty",
    });
    expect(result.success).toBe(true);
  });

  it("trims and lowercases the email", () => {
    const result = loginSchema.parse({
      email: "  Jane@Example.COM  ",
      password: "anything",
    });
    expect(result.email).toBe("jane@example.com");
  });

  it("rejects an empty email", () => {
    const result = loginSchema.safeParse({ email: "", password: "x" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const result = loginSchema.safeParse({ email: "not-an-email", password: "x" });
    expect(result.success).toBe(false);
  });

  it("rejects an empty password", () => {
    const result = loginSchema.safeParse({ email: "jane@example.com", password: "" });
    expect(result.success).toBe(false);
  });

  it("does NOT enforce an 8-character minimum on password (login isn't the policy check)", () => {
    // Unlike registerSchema, a short password must still pass client
    // validation here — the backend decides if it's actually correct.
    const result = loginSchema.safeParse({ email: "jane@example.com", password: "a" });
    expect(result.success).toBe(true);
  });
});

describe("createLoginSchema (custom messages)", () => {
  it("uses the supplied messages instead of the English defaults", () => {
    const schema = createLoginSchema({
      emailRequired: "CUSTOM_EMAIL_REQUIRED",
      emailInvalid: "CUSTOM_EMAIL_INVALID",
      passwordRequired: "CUSTOM_PASSWORD_REQUIRED",
    });

    const emailResult = schema.safeParse({ email: "", password: "x" });
    expect(emailResult.success).toBe(false);
    if (!emailResult.success) {
      expect(emailResult.error.issues[0].message).toBe("CUSTOM_EMAIL_REQUIRED");
    }

    const passwordResult = schema.safeParse({ email: "jane@example.com", password: "" });
    expect(passwordResult.success).toBe(false);
    if (!passwordResult.success) {
      expect(passwordResult.error.issues[0].message).toBe("CUSTOM_PASSWORD_REQUIRED");
    }
  });
});
