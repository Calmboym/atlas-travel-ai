/**
 * Minimal fetch wrapper for calling the Atlas backend API.
 *
 * ADDED — ATLAS-P1-AUTH-05. First frontend -> backend network call in
 * this repository: AUTH-01's RegisterForm was deliberately UI-only,
 * with no API client at all (see register-page-content.tsx's own
 * comment on that scope decision). ARCHITECTURE.md §4 names TanStack
 * Query as the intended server-state layer, but it isn't installed
 * yet, and a single login/verify-email mutation doesn't need
 * caching or invalidation — pulling it in for one fetch call would be
 * exactly the "unnecessary abstraction" GUIDELINES.md §2 warns
 * against. TanStack Query is a reasonable addition whenever a future
 * task actually needs query caching (e.g. Dashboard data fetching).
 *
 * This calls Atlas's OWN Backend API Layer — the documented
 * Frontend -> Backend API Layer relationship (ARCHITECTURE.md §3) —
 * not a third-party service, so this does not conflict with
 * ARCHITECTURE.md §2 / GUIDELINES.md §9's rule against the frontend
 * calling EXTERNAL APIs directly.
 */

// EXTENDED — ATLAS-P1-CHAT-04: exported (was module-private) so
// lib/chat/stream-assistant-reply.ts can build the same backend origin
// for its own fetch() call without duplicating the
// NEXT_PUBLIC_API_URL-resolution logic — that file can't reuse apiFetch
// itself, since apiFetch awaits the full JSON body up front and this
// is a streaming (ReadableStream) response instead.
export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
).replace(/\/$/, "");

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function extractErrorDetail(body: unknown): string | undefined {
  if (body && typeof body === "object" && "detail" in body) {
    const detail = (body as { detail: unknown }).detail;
    return typeof detail === "string" ? detail : undefined;
  }
  return undefined;
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    // Sends/receives the httpOnly session cookie POST /auth/login
    // sets (see backend/app/api/v1/auth.py) across the frontend's
    // and backend's distinct origins.
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const body: unknown = isJson ? await response.json() : undefined;

  if (!response.ok) {
    throw new ApiError(
      extractErrorDetail(body) ?? `Request failed with status ${response.status}.`,
      response.status,
    );
  }

  return body as T;
}
