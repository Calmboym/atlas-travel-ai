import { afterEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { usePathname } from "next/navigation";
import { renderWithProviders } from "./layout-test-utils";
import { Sidebar } from "@/components/layout/sidebar";

describe("Sidebar", () => {
  afterEach(() => {
    vi.mocked(usePathname).mockReturnValue("/en");
    localStorage.clear();
  });

  it("renders as a labeled landmark with all 8 nav items", () => {
    renderWithProviders(<Sidebar />);
    const nav = screen.getByRole("complementary", { name: "Primary" });
    expect(nav).toBeInTheDocument();
    for (const label of [
      "Dashboard",
      "Trips",
      "AI Chat",
      "Saved",
      "Notifications",
      "Profile",
      "Settings",
      "Help",
    ]) {
      expect(screen.getByRole("link", { name: label })).toBeInTheDocument();
    }
  });

  it("marks the active route with aria-current", () => {
    vi.mocked(usePathname).mockReturnValue("/en/trips");
    renderWithProviders(<Sidebar />);
    expect(screen.getByRole("link", { name: "Trips" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(
      screen.getByRole("link", { name: "Dashboard" }),
    ).not.toHaveAttribute("aria-current");
  });

  it("collapses on toggle and hides text labels behind sr-only", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Sidebar />);

    await user.click(screen.getByRole("button", { name: /collapse sidebar/i }));

    expect(
      screen.getByRole("button", { name: /expand sidebar/i }),
    ).toBeInTheDocument();
    // Labels remain in the DOM for screen readers even when visually
    // collapsed — sr-only, not removed.
    expect(screen.getByText("Dashboard")).toHaveClass("sr-only");
  });
});
