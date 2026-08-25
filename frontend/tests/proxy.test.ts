import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import proxy from "@/proxy";
import { ACCESS_TOKEN_COOKIE_NAME } from "@/lib/auth/protected-routes";

/**
 * ADDED — ATLAS-P1-AUTH-08. Exercises proxy.ts's actual default
 * export (not just the pure isProtectedPath helper in
 * protected-routes.test.ts) — NextRequest/NextResponse construct and
 * behave correctly under Vitest's environment, confirmed empirically
 * before writing this file, so there was no need to fall back to
 * logic-only coverage.
 */
describe("proxy (route guard)", () => {
  it("redirects an unauthenticated request to a protected path, to /login with a redirect param", () => {
    const request = new NextRequest("http://localhost:3000/en/dashboard");
    const response = proxy(request);

    expect(response.status).toBe(307);
    const location = new URL(response.headers.get("location")!);
    expect(location.pathname).toBe("/en/login");
    expect(location.searchParams.get("redirect")).toBe("/en/dashboard");
  });

  it("falls back to the default locale when the protected path has no locale prefix", () => {
    const request = new NextRequest("http://localhost:3000/dashboard");
    const response = proxy(request);

    const location = new URL(response.headers.get("location")!);
    expect(location.pathname).toBe("/en/login");
  });

  it("preserves the fa locale in the redirect for a Persian-locale request", () => {
    const request = new NextRequest("http://localhost:3000/fa/settings");
    const response = proxy(request);

    const location = new URL(response.headers.get("location")!);
    expect(location.pathname).toBe("/fa/login");
    expect(location.searchParams.get("redirect")).toBe("/fa/settings");
  });

  it("does not redirect an authenticated request (cookie present) to a protected path", () => {
    const request = new NextRequest("http://localhost:3000/en/dashboard");
    request.cookies.set(ACCESS_TOKEN_COOKIE_NAME, "some-jwt-value");

    const response = proxy(request);

    const location = response.headers.get("location");
    if (location) {
      expect(new URL(location).pathname).not.toBe("/en/login");
    }
  });

  it("does not redirect an unauthenticated request to /chat (guest-accessible)", () => {
    const request = new NextRequest("http://localhost:3000/en/chat");
    const response = proxy(request);

    const location = response.headers.get("location");
    if (location) {
      expect(new URL(location).pathname).not.toBe("/en/login");
    }
  });

  it("does not redirect an unauthenticated request to a public route", () => {
    const request = new NextRequest("http://localhost:3000/en/login");
    const response = proxy(request);

    const location = response.headers.get("location");
    if (location) {
      expect(new URL(location).pathname).not.toBe("/en/login");
    }
  });
});
