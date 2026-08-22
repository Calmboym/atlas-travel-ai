import { afterEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { useSearchParams } from "next/navigation";
import { VerifyEmailContent } from "@/components/auth/verify-email-content";
import { renderWithProviders as render } from "./layout-test-utils";

/**
 * next/navigation's real (non-mocked) type declares useSearchParams()
 * -> ReadonlyURLSearchParams, a branded subtype whose mutating methods
 * are typed as uncallable. tsc checks this file's import against the
 * REAL module's types (the Vitest-only alias in vitest.config.ts
 * doesn't apply to tsc — see that file's own comment), so a plain
 * `new URLSearchParams(...)` needs this cast to satisfy it; it's
 * still the real runtime mock from tests/mocks/next-navigation.ts.
 */
function mockSearchParams(query: string): void {
  vi.mocked(useSearchParams).mockReturnValue(
    new URLSearchParams(query) as ReturnType<typeof useSearchParams>,
  );
}

describe("VerifyEmailContent", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    mockSearchParams("");
  });

  it("shows the missing-token state when no ?token= is present", async () => {
    mockSearchParams("");
    render(<VerifyEmailContent />);

    expect(
      await screen.findByText(/verification link is missing its token/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("shows a verifying state, then success, when the token is valid", async () => {
    mockSearchParams("token=valid-token-123");
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          message: "Your email has been verified.",
          user: {
            id: "11111111-1111-1111-1111-111111111111",
            email: "verified@example.com",
            is_verified: true,
            created_at: "2026-08-20T00:00:00Z",
          },
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    render(<VerifyEmailContent />);

    expect(screen.getByText(/verifying your email/i)).toBeInTheDocument();

    expect(await screen.findByText(/email verified/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /continue to log in/i })).toHaveAttribute(
      "href",
      "/en/login",
    );
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/auth/verify-email"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ token: "valid-token-123" }),
      }),
    );
  });

  it("shows the error state with the backend's message when the token is invalid or expired", async () => {
    mockSearchParams("token=bad-token");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({ detail: "This verification link is invalid or has expired." }),
          { status: 400, headers: { "content-type": "application/json" } },
        ),
      ),
    );

    render(<VerifyEmailContent />);

    expect(
      await screen.findByText(/this verification link is invalid or has expired/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /back to log in/i })).toHaveAttribute(
      "href",
      "/en/login",
    );
  });

  it("falls back to a generic error message when the request itself fails", async () => {
    mockSearchParams("token=whatever");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));

    render(<VerifyEmailContent />);

    expect(await screen.findByText(/we couldn't verify your email/i)).toBeInTheDocument();
  });
});
