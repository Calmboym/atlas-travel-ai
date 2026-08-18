import { afterEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { usePathname } from "next/navigation";
import { renderWithProviders } from "./layout-test-utils";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";

describe("MobileBottomNav", () => {
  afterEach(() => {
    vi.mocked(usePathname).mockReturnValue("/en");
  });

  it("renders exactly 5 items (26 §Mobile Navigation maximum)", () => {
    renderWithProviders(<MobileBottomNav />);
    const nav = screen.getByRole("navigation", { name: "Main" });
    const links = nav.querySelectorAll("a");
    expect(links).toHaveLength(5);
  });

  it("includes Dashboard, Trips, AI Chat, Notifications, and Profile", () => {
    renderWithProviders(<MobileBottomNav />);
    for (const label of ["Dashboard", "Trips", "AI Chat", "Notifications", "Profile"]) {
      expect(screen.getByRole("link", { name: label })).toBeInTheDocument();
    }
  });

  it("marks the current route active via aria-current", () => {
    vi.mocked(usePathname).mockReturnValue("/en/profile");
    renderWithProviders(<MobileBottomNav />);
    expect(screen.getByRole("link", { name: "Profile" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("gives every item at least a 44px touch target", () => {
    renderWithProviders(<MobileBottomNav />);
    for (const link of screen.getAllByRole("link")) {
      expect(link.className).toMatch(/min-w-\[44px\]/);
    }
  });
});
