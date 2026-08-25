import { describe, expect, it } from "vitest";
import {
  isProtectedPath,
  stripLocaleSegment,
  PROTECTED_PATH_SEGMENTS,
} from "@/lib/auth/protected-routes";

describe("stripLocaleSegment", () => {
  it("strips a leading locale segment", () => {
    expect(stripLocaleSegment("/en/dashboard")).toEqual(["dashboard"]);
    expect(stripLocaleSegment("/fa/dashboard")).toEqual(["dashboard"]);
    expect(stripLocaleSegment("/de/dashboard")).toEqual(["dashboard"]);
  });

  it("leaves a path with no locale segment untouched", () => {
    expect(stripLocaleSegment("/dashboard")).toEqual(["dashboard"]);
  });

  it("does not treat a non-locale first segment as a locale", () => {
    expect(stripLocaleSegment("/dashboard/settings")).toEqual(["dashboard", "settings"]);
  });

  it("returns an empty array for the root path", () => {
    expect(stripLocaleSegment("/")).toEqual([]);
    expect(stripLocaleSegment("/en")).toEqual([]);
  });
});

describe("isProtectedPath", () => {
  it.each(PROTECTED_PATH_SEGMENTS)("guards /%s with a locale prefix", (segment) => {
    expect(isProtectedPath(`/en/${segment}`)).toBe(true);
    expect(isProtectedPath(`/fa/${segment}`)).toBe(true);
  });

  it.each(PROTECTED_PATH_SEGMENTS)("guards /%s with no locale prefix", (segment) => {
    expect(isProtectedPath(`/${segment}`)).toBe(true);
  });

  it("guards nested paths under a protected segment", () => {
    expect(isProtectedPath("/en/settings/appearance")).toBe(true);
  });

  it("does NOT guard /chat — guest-mode AI Chat is explicit product scope", () => {
    expect(isProtectedPath("/en/chat")).toBe(false);
    expect(isProtectedPath("/chat")).toBe(false);
  });

  it("does NOT guard /help — public content by default absent a stated requirement", () => {
    expect(isProtectedPath("/en/help")).toBe(false);
  });

  it("does not guard public marketing/auth routes", () => {
    expect(isProtectedPath("/en")).toBe(false);
    expect(isProtectedPath("/en/login")).toBe(false);
    expect(isProtectedPath("/en/register")).toBe(false);
    expect(isProtectedPath("/en/forgot-password")).toBe(false);
    expect(isProtectedPath("/en/reset-password")).toBe(false);
    expect(isProtectedPath("/en/verify-email")).toBe(false);
  });

  it("does not false-positive on a path that merely starts with a protected segment's letters", () => {
    // "/en/settings-page" must not match "settings" via substring —
    // only an exact path-segment match should guard.
    expect(isProtectedPath("/en/settings-page")).toBe(false);
    expect(isProtectedPath("/en/dashboards")).toBe(false);
  });
});
