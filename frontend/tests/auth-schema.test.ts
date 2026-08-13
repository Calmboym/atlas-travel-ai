import { describe, expect, it } from "vitest";
import { registerSchema } from "@/lib/validation/auth-schema";

describe("registerSchema", () => {
  it("normalizes email by trimming whitespace and lowercasing", () => {
    const result = registerSchema.safeParse({
      email: "   John.Doe@Example.COM  ",
      password: "longenough1",
      confirmPassword: "longenough1",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("john.doe@example.com");
    }
  });

  it("rejects an invalid email format", () => {
    const result = registerSchema.safeParse({
      email: "not-an-email",
      password: "longenough1",
      confirmPassword: "longenough1",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const emailIssue = result.error.issues.find((i) =>
        i.path.includes("email"),
      );
      expect(emailIssue?.message).toBe("Please enter a valid email address.");
    }
  });

  it("rejects a password shorter than 8 characters", () => {
    const result = registerSchema.safeParse({
      email: "user@example.com",
      password: "short1",
      confirmPassword: "short1",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const passwordIssue = result.error.issues.find((i) =>
        i.path.includes("password"),
      );
      expect(passwordIssue?.message).toBe(
        "Password must be at least 8 characters.",
      );
    }
  });

  it("accepts an 8-character password with no other complexity rule", () => {
    // Approved plan adjustment #5: minimum 8 characters ONLY.
    const result = registerSchema.safeParse({
      email: "user@example.com",
      password: "12345678",
      confirmPassword: "12345678",
    });

    expect(result.success).toBe(true);
  });

  it("rejects mismatched confirmPassword and attaches the error to that field", () => {
    const result = registerSchema.safeParse({
      email: "user@example.com",
      password: "longenough1",
      confirmPassword: "different1",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const confirmIssue = result.error.issues.find((i) =>
        i.path.includes("confirmPassword"),
      );
      expect(confirmIssue?.message).toBe("Passwords do not match.");
    }
  });

  it("rejects empty required fields", () => {
    const result = registerSchema.safeParse({
      email: "",
      password: "",
      confirmPassword: "",
    });

    expect(result.success).toBe(false);
  });
});
