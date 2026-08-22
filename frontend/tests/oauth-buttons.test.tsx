import { afterEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { renderWithProviders as render } from "./layout-test-utils";

describe("OAuthButtons", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("renders a labeled divider and both provider buttons", () => {
    render(<OAuthButtons />);

    expect(screen.getByText(/or continue with/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /continue with google/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /continue with apple/i })).toBeInTheDocument();
  });

  it("hits the real stub endpoint and surfaces its message when Google is clicked", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          detail: "Google sign-in isn't configured yet. Please continue with email and password for now.",
        }),
        { status: 501, headers: { "content-type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    render(<OAuthButtons />);

    await user.click(screen.getByRole("button", { name: /continue with google/i }));

    expect(
      await screen.findByText(/google sign-in isn't configured yet/i),
    ).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/auth/oauth/google"),
      expect.objectContaining({ credentials: "include" }),
    );
  });

  it("hits the real stub endpoint and surfaces its message when Apple is clicked", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          detail: "Apple sign-in isn't configured yet. Please continue with email and password for now.",
        }),
        { status: 501, headers: { "content-type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    render(<OAuthButtons />);

    await user.click(screen.getByRole("button", { name: /continue with apple/i }));

    expect(await screen.findByText(/apple sign-in isn't configured yet/i)).toBeInTheDocument();
  });

  it("shows a loading state on the clicked button only while the request is pending", async () => {
    let resolveFetch: (value: Response) => void = () => {};
    const fetchMock = vi.fn(
      () =>
        new Promise<Response>((resolve) => {
          resolveFetch = resolve;
        }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    render(<OAuthButtons />);

    await user.click(screen.getByRole("button", { name: /continue with google/i }));

    const googleButton = await screen.findByRole("button", { name: /connecting/i });
    expect(googleButton).toBeDisabled();
    const appleButton = screen.getByRole("button", { name: /continue with apple/i });
    expect(appleButton).not.toBeDisabled();

    resolveFetch(
      new Response(JSON.stringify({ detail: "stub" }), {
        status: 501,
        headers: { "content-type": "application/json" },
      }),
    );
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /continue with google/i })).toBeInTheDocument(),
    );
  });

  it("falls back to a generic message when the network request itself fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new TypeError("Failed to fetch")),
    );

    const user = userEvent.setup();
    render(<OAuthButtons />);

    await user.click(screen.getByRole("button", { name: /continue with google/i }));

    expect(await screen.findByText(/sign-in method isn't available yet/i)).toBeInTheDocument();
  });
});
