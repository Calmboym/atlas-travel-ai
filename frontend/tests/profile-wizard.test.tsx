import { afterEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProfileWizard } from "@/components/profile/profile-wizard";
import { renderWithProviders as render } from "./layout-test-utils";

import type { TravelerProfile } from "@/lib/api/profile";

const EMPTY_PROFILE: TravelerProfile = {
  id: "profile-1",
  user_id: "user-1",
  full_name: null,
  phone: null,
  country: null,
  timezone: null,
  avatar_url: null,
  travel_preference: null,
  budget_level: null,
  accommodation_preference: null,
  transportation_preference: null,
  food_preferences: null,
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

/**
 * GET always returns `initialProfile`; PATCH echoes back
 * `initialProfile` merged with whatever the request body contained, so
 * assertions can inspect what the component actually sent without a
 * real backend.
 */
function mockProfileApi(initialProfile: typeof EMPTY_PROFILE = EMPTY_PROFILE) {
  const patchCalls: Record<string, unknown>[] = [];
  const fetchMock = vi.fn().mockImplementation(async (url: string, options?: RequestInit) => {
    if (options?.method === "PATCH") {
      const body = JSON.parse(options.body as string);
      patchCalls.push(body);
      return jsonResponse({ ...initialProfile, ...body });
    }
    return jsonResponse(initialProfile);
  });
  vi.stubGlobal("fetch", fetchMock);
  return { fetchMock, patchCalls };
}

describe("ProfileWizard", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("shows a loading state, then the first step (Travel Preferences)", async () => {
    mockProfileApi();
    render(<ProfileWizard />);

    expect(screen.getByText(/loading your profile/i)).toBeInTheDocument();

    expect(await screen.findByText(/how do you usually travel/i)).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /adventure/i })).toBeInTheDocument();
  });

  it("shows a validation error when Continue is pressed with nothing selected", async () => {
    mockProfileApi();
    const user = userEvent.setup();
    render(<ProfileWizard />);

    await screen.findByText(/how do you usually travel/i);
    await user.click(screen.getByRole("button", { name: /continue/i }));

    expect(
      await screen.findByText(/choose the option that best describes this trip/i),
    ).toBeInTheDocument();
  });

  it("saves the selection and advances to the Budget step on Continue", async () => {
    const { patchCalls } = mockProfileApi();
    const user = userEvent.setup();
    render(<ProfileWizard />);

    await screen.findByText(/how do you usually travel/i);
    await user.click(screen.getByRole("radio", { name: /adventure/i }));
    await user.click(screen.getByRole("button", { name: /continue/i }));

    expect(await screen.findByText(/what's your usual budget/i)).toBeInTheDocument();
    expect(patchCalls).toEqual([{ travel_preference: "adventure" }]);
  });

  it("returns to the previous step on Back without losing the earlier answer", async () => {
    mockProfileApi();
    const user = userEvent.setup();
    render(<ProfileWizard />);

    await screen.findByText(/how do you usually travel/i);
    await user.click(screen.getByRole("radio", { name: /^family$/i }));
    await user.click(screen.getByRole("button", { name: /continue/i }));

    await screen.findByText(/what's your usual budget/i);
    await user.click(screen.getByRole("button", { name: /back/i }));

    await screen.findByText(/how do you usually travel/i);
    expect(screen.getByRole("radio", { name: /^family$/i })).toBeChecked();
  });

  it("Back is disabled on the first step", async () => {
    mockProfileApi();
    render(<ProfileWizard />);
    await screen.findByText(/how do you usually travel/i);
    expect(screen.getByRole("button", { name: /back/i })).toBeDisabled();
  });

  it("step 3 requires both accommodation and transportation, and shows the finish button", async () => {
    mockProfileApi();
    const user = userEvent.setup();
    render(<ProfileWizard />);

    await screen.findByText(/how do you usually travel/i);
    await user.click(screen.getByRole("radio", { name: /^solo$/i }));
    await user.click(screen.getByRole("button", { name: /continue/i }));

    await screen.findByText(/what's your usual budget/i);
    await user.click(screen.getByRole("radio", { name: /^economy$/i }));
    await user.click(screen.getByRole("button", { name: /continue/i }));

    expect(await screen.findByText(/where do you like to stay/i)).toBeInTheDocument();
    expect(screen.getByText(/how do you like to get around/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /finish/i })).toBeInTheDocument();

    // Only accommodation answered — transportation's own error should
    // block completion.
    await user.click(screen.getByRole("radio", { name: /^hotel$/i }));
    await user.click(screen.getByRole("button", { name: /finish/i }));
    expect(
      await screen.findByText(/choose a transportation preference/i),
    ).toBeInTheDocument();
  });

  it("completes the wizard end to end and shows the completion screen", async () => {
    const { patchCalls } = mockProfileApi();
    const user = userEvent.setup();
    render(<ProfileWizard />);

    await screen.findByText(/how do you usually travel/i);
    await user.click(screen.getByRole("radio", { name: /^couple$/i }));
    await user.click(screen.getByRole("button", { name: /continue/i }));

    await screen.findByText(/what's your usual budget/i);
    await user.click(screen.getByRole("radio", { name: /^premium$/i }));
    await user.click(screen.getByRole("button", { name: /continue/i }));

    await screen.findByText(/where do you like to stay/i);
    await user.click(screen.getByRole("radio", { name: /^resort$/i }));
    await user.click(screen.getByRole("radio", { name: /^flight$/i }));
    await user.click(screen.getByRole("button", { name: /finish/i }));

    expect(await screen.findByText(/you're all set/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /view my profile/i })).toHaveAttribute(
      "href",
      "/en/profile",
    );

    expect(patchCalls).toEqual([
      { travel_preference: "couple" },
      { budget_level: "premium" },
      { accommodation_preference: "resort", transportation_preference: "flight" },
    ]);
  });

  it("pre-fills answers from an existing profile instead of asking again", async () => {
    mockProfileApi({ ...EMPTY_PROFILE, travel_preference: "business" });
    render(<ProfileWizard />);

    await screen.findByText(/how do you usually travel/i);
    expect(screen.getByRole("radio", { name: /^business$/i })).toBeChecked();
  });

  it("shows an inline error and stays on the same step if saving fails", async () => {
    const fetchMock = vi.fn().mockImplementation(async (_url: string, options?: RequestInit) => {
      if (options?.method === "PATCH") {
        return jsonResponse({ detail: "We couldn't reach the server." }, 500);
      }
      return jsonResponse(EMPTY_PROFILE);
    });
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    render(<ProfileWizard />);

    await screen.findByText(/how do you usually travel/i);
    await user.click(screen.getByRole("radio", { name: /^solo$/i }));
    await user.click(screen.getByRole("button", { name: /continue/i }));

    const alert = await screen.findByRole("alert");
    expect(within(alert).getByText(/couldn't reach the server/i)).toBeInTheDocument();
    // Still on step 1 — no silent skip-ahead on failure.
    expect(screen.getByText(/how do you usually travel/i)).toBeInTheDocument();
  });

  it("shows step progress via the StepIndicator", async () => {
    mockProfileApi();
    render(<ProfileWizard />);
    await screen.findByText(/how do you usually travel/i);
    expect(screen.getByRole("list", { name: /progress/i })).toBeInTheDocument();
  });
});
