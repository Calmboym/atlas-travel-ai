import { afterEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import { renderWithProviders } from "./layout-test-utils";
import { ProfileMenu } from "@/components/layout/profile-menu";

const USER = {
  id: "user-1",
  email: "grace@example.com",
  is_verified: true,
  created_at: "2026-01-01T00:00:00Z",
};

const PROFILE = {
  id: "profile-1",
  user_id: "user-1",
  full_name: "Grace Hopper",
  phone: null,
  country: null,
  timezone: null,
  avatar_url: null,
  travel_preference: null,
  budget_level: null,
  accommodation_preference: null,
  transportation_preference: null,
  food_preferences: [],
  preferred_ui_language: null,
  preferred_travel_language: null,
  created_at: "2026-08-20T00:00:00Z",
  updated_at: "2026-08-20T00:00:00Z",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function mockRouter() {
  const push = vi.fn();
  const replace = vi.fn();
  vi.mocked(useRouter).mockReturnValue({
    push,
    replace,
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  } as unknown as ReturnType<typeof useRouter>);
  return { push, replace };
}

describe("ProfileMenu", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("shows the fetched name and email once open", async () => {
    mockRouter();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(async (url: string) => {
        if (url.includes("/auth/me")) return jsonResponse(USER);
        return jsonResponse(PROFILE);
      }),
    );
    const user = userEvent.setup();
    renderWithProviders(<ProfileMenu />);

    await user.click(await screen.findByRole("button", { name: /grace hopper/i }));

    expect(screen.getByText("Grace Hopper")).toBeInTheDocument();
    expect(screen.getByText("grace@example.com")).toBeInTheDocument();
  });

  it("still opens and functions with fallback initials if the fetch fails", async () => {
    mockRouter();
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));
    const user = userEvent.setup();
    renderWithProviders(<ProfileMenu />);

    const trigger = await screen.findByRole("button", { name: /account/i });
    await user.click(trigger);

    expect(screen.getByRole("link", { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign out/i })).toBeInTheDocument();
  });

  it("links to Dashboard, Profile, and Settings", async () => {
    mockRouter();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(async (url: string) => {
        if (url.includes("/auth/me")) return jsonResponse(USER);
        return jsonResponse(PROFILE);
      }),
    );
    const user = userEvent.setup();
    renderWithProviders(<ProfileMenu />);

    await user.click(await screen.findByRole("button", { name: /grace hopper/i }));

    expect(screen.getByRole("link", { name: /dashboard/i })).toHaveAttribute(
      "href",
      "/en/dashboard",
    );
    expect(screen.getByRole("link", { name: /profile/i })).toHaveAttribute(
      "href",
      "/en/profile",
    );
    expect(screen.getByRole("link", { name: /settings/i })).toHaveAttribute(
      "href",
      "/en/settings",
    );
  });

  it("signs out and navigates to /login on Sign out", async () => {
    const { push } = mockRouter();
    const fetchMock = vi.fn().mockImplementation(async (url: string, options?: RequestInit) => {
      if (url.includes("/auth/me")) return jsonResponse(USER);
      if (url.includes("/auth/logout")) {
        return new Response(null, { status: 204 });
      }
      return jsonResponse(PROFILE);
    });
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    renderWithProviders(<ProfileMenu />);

    await user.click(await screen.findByRole("button", { name: /grace hopper/i }));
    await user.click(screen.getByRole("button", { name: /sign out/i }));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/auth/logout"),
        expect.objectContaining({ method: "POST" }),
      ),
    );
    await waitFor(() => expect(push).toHaveBeenCalledWith("/en/login"));
  });

  it("still navigates to /login even if the logout request itself fails", async () => {
    const { push } = mockRouter();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(async (url: string) => {
        if (url.includes("/auth/me")) return jsonResponse(USER);
        if (url.includes("/auth/logout")) return jsonResponse({ detail: "expired" }, 401);
        return jsonResponse(PROFILE);
      }),
    );
    const user = userEvent.setup();
    renderWithProviders(<ProfileMenu />);

    await user.click(await screen.findByRole("button", { name: /grace hopper/i }));
    await user.click(screen.getByRole("button", { name: /sign out/i }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/en/login"));
  });
});
