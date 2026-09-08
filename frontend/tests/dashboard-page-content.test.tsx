import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import { renderWithProviders } from "./layout-test-utils";
import { DashboardPageContent } from "@/components/dashboard/dashboard-page-content";
import {
  __resetGuestSessionStoreForTests,
  type GuestSession,
} from "@/lib/chat/guest-session-store";
import { __resetLastConversationPreviewCacheForTests } from "@/lib/dashboard/use-last-conversation-preview";

const STORAGE_KEY = "atlas-chat-guest-session";

const USER = {
  id: "user-1",
  email: "grace@example.com",
  is_verified: true,
  created_at: "2026-01-01T00:00:00Z",
};

const PROFILE_NAMED = {
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

function mockHappyApis() {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockImplementation(async (url: string) => {
      if (url.includes("/auth/me")) return jsonResponse(USER);
      return jsonResponse(PROFILE_NAMED);
    }),
  );
}

beforeEach(() => {
  __resetGuestSessionStoreForTests();
  __resetLastConversationPreviewCacheForTests();
});

describe("DashboardPageContent", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("shows a loading state, then the welcome hero with the person's name", async () => {
    mockRouter();
    mockHappyApis();
    renderWithProviders(<DashboardPageContent />);

    expect(screen.getByText(/loading your dashboard/i)).toBeInTheDocument();

    expect(
      await screen.findByRole("heading", { level: 1, name: /welcome back, grace hopper/i }),
    ).toBeInTheDocument();
    const startPlanningLinks = screen.getAllByRole("link", { name: /start planning/i });
    expect(startPlanningLinks[0]).toHaveAttribute("href", "/en/chat");
  });

  it("shows suggested prompts and capabilities in the welcome (no-conversation) state", async () => {
    mockRouter();
    mockHappyApis();
    renderWithProviders(<DashboardPageContent />);

    await screen.findByRole("heading", { level: 1 });
    expect(screen.getByRole("heading", { name: /try asking atlas/i })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /what atlas can help with/i }),
    ).toBeInTheDocument();
  });

  it("shows honest empty states for trips and recommendations", async () => {
    mockRouter();
    mockHappyApis();
    renderWithProviders(<DashboardPageContent />);

    await screen.findByRole("heading", { level: 1 });
    expect(screen.getByText(/no trips yet/i)).toBeInTheDocument();
    expect(screen.getByText(/nothing to recommend yet/i)).toBeInTheDocument();
  });

  it("shows 'Continue conversation' and no suggested prompts when a real conversation already exists", async () => {
    mockRouter();
    mockHappyApis();
    const persisted: GuestSession = {
      conversations: [
        {
          id: "conv-1",
          title: "Rome trip",
          createdAt: "2026-01-01T00:00:00.000Z",
          messages: [
            {
              id: "msg-1",
              role: "user",
              content: "Plan a trip to Rome",
              status: "complete",
              createdAt: "2026-01-01T00:00:00.000Z",
            },
          ],
        },
      ],
      activeConversationId: "conv-1",
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));

    renderWithProviders(<DashboardPageContent />);

    expect(
      await screen.findByRole("link", { name: /continue conversation/i }),
    ).toHaveAttribute("href", "/en/chat");
    expect(screen.getByText("Rome trip")).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /try asking atlas/i }),
    ).not.toBeInTheDocument();
    // "Continue chat" also appears among the quick actions in this state.
    expect(screen.getByRole("link", { name: /continue chat/i })).toBeInTheDocument();
  });

  it("shows a RetryCard on load failure and recovers on successful retry", async () => {
    mockRouter();
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new Error("network down"))
      .mockImplementation(async (url: string) => {
        if (url.includes("/auth/me")) return jsonResponse(USER);
        return jsonResponse(PROFILE_NAMED);
      });
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    renderWithProviders(<DashboardPageContent />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /couldn't load your dashboard/i,
    );

    await user.click(screen.getByRole("button", { name: /retry/i }));

    expect(
      await screen.findByRole("heading", { level: 1, name: /welcome back/i }),
    ).toBeInTheDocument();
  });

  it("redirects to /login on a 401 rather than showing an error", async () => {
    const { replace } = mockRouter();
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockImplementation(async () =>
          jsonResponse({ detail: "Not authenticated" }, 401),
        ),
    );
    renderWithProviders(<DashboardPageContent />);

    await waitFor(() =>
      expect(replace).toHaveBeenCalledWith("/en/login?redirect=%2Fdashboard"),
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
