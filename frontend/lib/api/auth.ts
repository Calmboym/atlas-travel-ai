/**
 * Typed wrappers around the backend's /api/v1/auth/* endpoints.
 *
 * ADDED — ATLAS-P1-AUTH-05 (loginRequest), ATLAS-P1-AUTH-04
 * (verifyEmailRequest), ATLAS-P1-AUTH-06 (forgotPasswordRequest,
 * resetPasswordRequest). Response shapes mirror
 * backend/app/schemas/auth.py by hand — no OpenAPI client generation
 * step exists in this project yet.
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
