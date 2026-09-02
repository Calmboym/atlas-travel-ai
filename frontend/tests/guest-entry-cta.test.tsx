import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "./layout-test-utils";
import { GuestEntryCta } from "@/components/landing/guest-entry-cta";

describe("GuestEntryCta", () => {
  it("links to /chat with the current locale prefix and a no-pressure hint", () => {
    renderWithProviders(<GuestEntryCta />);

    const link = screen.getByRole("link", { name: "Continue as Guest" });
    expect(link).toHaveAttribute("href", "/en/chat");
    expect(screen.getByText("No account needed to explore.")).toBeInTheDocument();
  });
});
