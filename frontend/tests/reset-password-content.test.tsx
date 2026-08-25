import { afterEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useSearchParams } from "next/navigation";
import { ResetPasswordContent } from "@/components/auth/reset-password-content";
import { renderWithProviders as render } from "./layout-test-utils";

function mockSearchParams(query: string): void {
  vi.mocked(useSearchParams).mockReturnValue(
    new URLSearchParams(query) as ReturnType<typeof useSearchParams>,
  );
}

function fillAndSubmit(user: ReturnType<typeof userEvent.setup>) {
  return async () => {
    await user.type(screen.getByLabelText(/^new password/i), "longenough1");
    await user.type(screen.getByLabelText(/confirm new password/i), "longenough1");
    await user.click(screen.getByRole("button", { name: /reset password/i }));
  };
}

describe("ResetPasswordContent", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    mockSearchParams("");
  });

  it("shows the missing-token state (with a link to request a new one) when no ?token= is present", async () => {
    mockSearchParams("");
    render(<ResetPasswordContent />);

    expect(await screen.findByText(/reset link is missing its token/i)).toBeInTheDocument();
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /request a new link/i })).toHaveAttribute(
      "href",
      "/en/forgot-password",
    );
  });

  it("does not render the password form when the token is missing", () => {
    mockSearchParams("");
    render(<ResetPasswordContent />);
    expect(screen.queryByLabelText(/new password/i)).not.toBeInTheDocument();
  });

  it("renders the reset form (not an auto-submitting spinner) when a token is present", () => {
    mockSearchParams("token=valid-token-123");
    render(<ResetPasswordContent />);

    expect(screen.getByLabelText(/^new password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm new password/i)).toBeInTheDocument();
  });

  it("submits the token from the URL together with the typed password, and shows success", async () => {
    const user = userEvent.setup();
    mockSearchParams("token=valid-token-123");
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          message: "Your password has been changed. Please log in again.",
          user: {
            id: "11111111-1111-1111-1111-111111111111",
            email: "reset-user@example.com",
            is_verified: true,
            created_at: "2026-08-20T00:00:00Z",
          },
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    render(<ResetPasswordContent />);
    await fillAndSubmit(user)();

    expect(await screen.findByText(/password changed/i)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/auth/reset-password"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ token: "valid-token-123", new_password: "longenough1" }),
      }),
    );
  });

  it("shows the backend's error message inline (form stays visible) when the token is invalid or expired", async () => {
    const user = userEvent.setup();
    mockSearchParams("token=bad-token");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ detail: "This reset link is invalid or has expired." }), {
          status: 400,
          headers: { "content-type": "application/json" },
        }),
      ),
    );

    render(<ResetPasswordContent />);
    await fillAndSubmit(user)();

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("This reset link is invalid or has expired.");
    // Unlike verify-email's page-level error, this must NOT replace
    // the form — the user's typed input stays intact.
    expect(screen.getByLabelText(/^new password/i)).toBeInTheDocument();
  });

  it("falls back to a generic error message when the request itself fails", async () => {
    const user = userEvent.setup();
    mockSearchParams("token=whatever");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));

    render(<ResetPasswordContent />);
    await fillAndSubmit(user)();

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(/we couldn't reset your password/i),
    );
  });
});
