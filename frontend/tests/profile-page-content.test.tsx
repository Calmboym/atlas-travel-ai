import { afterEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProfilePageContent } from "@/components/profile/profile-page-content";
import { renderWithProviders as render } from "./layout-test-utils";
import type { TravelerProfile } from "@/lib/api/profile";

const PROFILE: TravelerProfile = {
  id: "profile-1",
  user_id: "user-1",
  full_name: "Grace Hopper",
  phone: null,
  country: null,
  timezone: null,
  avatar_url: null,
  travel_preference: "adventure",
  budget_level: null,
  accommodation_preference: null,
  transportation_preference: null,
  food_preferences: ["vegetarian"],
  preferred_ui_language: null,
  preferred_travel_language: null,
  created_at: "2026-08-20T00:00:00Z",
  updated_at: "2026-08-20T00:00:00Z",
};

const USER = { id: "user-1", email: "grace@example.com", is_verified: true, created_at: "2026-01-01T00:00:00Z" };

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

function mockApis({
  profile = PROFILE,
  patchStatus = 200,
}: { profile?: TravelerProfile; patchStatus?: number } = {}) {
  const patchCalls: Record<string, unknown>[] = [];
  const fetchMock = vi.fn().mockImplementation(async (url: string, options?: RequestInit) => {
    if (url.includes("/auth/me")) return jsonResponse(USER);
    if (options?.method === "PATCH") {
      const body = JSON.parse(options.body as string);
      patchCalls.push(body);
      if (patchStatus !== 200) return jsonResponse({ detail: "failed" }, patchStatus);
      return jsonResponse({ ...profile, ...body });
    }
    return jsonResponse(profile);
  });
  vi.stubGlobal("fetch", fetchMock);
  return { patchCalls };
}

describe("ProfilePageContent", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("shows a loading state, then the loaded profile", async () => {
    mockApis();
    render(<ProfilePageContent />);
    expect(screen.getByText(/loading your profile/i)).toBeInTheDocument();

    expect(await screen.findByDisplayValue("Grace Hopper")).toBeInTheDocument();
    expect(screen.getByDisplayValue("grace@example.com")).toBeInTheDocument();
  });

  it("shows an error state if the profile fails to load", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("network down")),
    );
    render(<ProfilePageContent />);
    expect(await screen.findByRole("alert")).toHaveTextContent(/network down/i);
  });

  it("email field is read-only", async () => {
    mockApis();
    render(<ProfilePageContent />);
    expect(await screen.findByDisplayValue("grace@example.com")).toHaveAttribute("readonly");
  });

  it("saves a personal-info field on blur and shows a saved confirmation", async () => {
    const { patchCalls } = mockApis();
    const user = userEvent.setup();
    render(<ProfilePageContent />);

    const phoneInput = await screen.findByLabelText(/phone/i);
    await user.click(phoneInput);
    await user.type(phoneInput, "+15551234567");
    await user.tab();

    await waitFor(() => expect(patchCalls).toEqual([{ phone: "+15551234567" }]));
    expect(await screen.findByText(/^saved$/i)).toBeInTheDocument();
  });

  it("does not save on blur if the field value didn't change", async () => {
    const { patchCalls } = mockApis();
    const user = userEvent.setup();
    render(<ProfilePageContent />);

    const nameInput = await screen.findByDisplayValue("Grace Hopper");
    await user.click(nameInput);
    await user.tab();

    expect(patchCalls).toHaveLength(0);
  });

  it("saves immediately when a preference dropdown changes", async () => {
    const { patchCalls } = mockApis();
    const user = userEvent.setup();
    render(<ProfilePageContent />);

    await screen.findByDisplayValue("Grace Hopper");
    await user.click(screen.getByLabelText(/^budget$/i));
    await user.click(await screen.findByRole("option", { name: /premium/i }));

    await waitFor(() => expect(patchCalls).toEqual([{ budget_level: "premium" }]));
  });

  it("pre-checks food preference checkboxes already on the profile", async () => {
    mockApis();
    render(<ProfilePageContent />);
    await screen.findByDisplayValue("Grace Hopper");
    expect(screen.getByRole("checkbox", { name: /vegetarian/i })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: /vegan/i })).not.toBeChecked();
  });

  it("toggling a food preference checkbox saves the updated array", async () => {
    const { patchCalls } = mockApis();
    const user = userEvent.setup();
    render(<ProfilePageContent />);

    await screen.findByDisplayValue("Grace Hopper");
    await user.click(screen.getByRole("checkbox", { name: /halal/i }));

    await waitFor(() =>
      expect(patchCalls[0]?.food_preferences).toEqual(expect.arrayContaining(["vegetarian", "halal"])),
    );
  });

  it("shows an error indicator if a save fails", async () => {
    mockApis({ patchStatus: 500 });
    const user = userEvent.setup();
    render(<ProfilePageContent />);

    const phoneInput = await screen.findByLabelText(/phone/i);
    await user.type(phoneInput, "12345");
    await user.tab();

    expect(await screen.findByText(/couldn't save/i)).toBeInTheDocument();
  });

  it("selecting an avatar photo shows a local preview and the storage-not-connected note, without a PATCH call for it", async () => {
    URL.createObjectURL = vi.fn().mockReturnValue("blob:preview");
    URL.revokeObjectURL = vi.fn();
    const { patchCalls } = mockApis();
    const user = userEvent.setup();
    render(<ProfilePageContent />);

    await screen.findByDisplayValue("Grace Hopper");
    const file = new File(["x"], "avatar.png", { type: "image/png" });
    await user.upload(screen.getByLabelText(/change photo/i), file);

    expect(await screen.findByText(/storage isn't connected yet/i)).toBeInTheDocument();
    expect(patchCalls.find((call) => "avatar_url" in call)).toBeUndefined();
  });
});
