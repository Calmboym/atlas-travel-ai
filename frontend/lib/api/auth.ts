/**
 * Typed wrappers around the backend's /api/v1/auth/* endpoints.
 *
 * ADDED — ATLAS-P1-AUTH-05 (loginRequest), ATLAS-P1-AUTH-04
 * (verifyEmailRequest), ATLAS-P1-AUTH-06 (forgotPasswordRequest,
 * resetPasswordRequest). Response shapes mirror
 * backend/app/schemas/auth.py by hand — no OpenAPI client generation
 * step exists in this project yet.
 * EXTENDED — ATLAS-P1-PROF-03 (getMeRequest): the backend's GET
 * /auth/me endpoint existed since AUTH-07 but had no frontend wrapper
 * yet — PROF-03's Personal Info section needs the user's email
 * (TravelerProfile has no email field of its own; email lives on
 * User, per APPLICATION_LAYOUT_GUIDE.md §Personal Information listing
 * Email alongside profile-only fields like Phone/Country/Timezone).
 * EXTENDED — ATLAS-P1-DASH-01 (logoutRequest): the backend's
 * POST /auth/logout endpoint existed since AUTH-07 but had no
 * frontend wrapper or UI trigger anywhere in the app yet —
 * ProfileMenu (APPLICATION_LAYOUT_GUIDE.md §User Menu: "...Logout")
 * is the first place one is needed. Returns void: the endpoint itself
 * is 204 No Content (see backend/app/api/v1/auth.py's own docstring
 * — "Idempotent... always returns 204"), which apiFetch resolves to
 * `undefined` since there is no JSON body to parse.
 */

import { apiFetch } from "@/lib/api/client";

export interface AuthUser {
  id: string;
  email: string;
  is_verified: boolean;
  created_at: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: AuthUser;
}

export interface VerifyEmailResponse {
  message: string;
  user: AuthUser;
}

export interface ResetPasswordResponse {
  message: string;
  user: AuthUser;
}

export function loginRequest(values: { email: string; password: string }): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify(values),
  });
}

export function verifyEmailRequest(token: string): Promise<VerifyEmailResponse> {
  return apiFetch<VerifyEmailResponse>("/api/v1/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
}

export function forgotPasswordRequest(email: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/api/v1/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function resetPasswordRequest(
  token: string,
  newPassword: string,
): Promise<ResetPasswordResponse> {
  return apiFetch<ResetPasswordResponse>("/api/v1/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, new_password: newPassword }),
  });
}

export function getMeRequest(): Promise<AuthUser> {
  return apiFetch<AuthUser>("/api/v1/auth/me", { method: "GET" });
}

export function logoutRequest(): Promise<void> {
  return apiFetch<void>("/api/v1/auth/logout", { method: "POST" });
}
