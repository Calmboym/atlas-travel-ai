import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "./layout-test-utils";
import { CTASection } from "@/components/landing/cta-section";

describe("CTASection", () => {
  it("renders a same-page anchor back to the search box and the guest CTA", () => {
    renderWithProviders(<CTASection />);

    expect(
      screen.getByRole("heading", { level: 2, name: "Ready to start planning?" }),
    ).toBeInTheDocument();

    const primary = screen.getByRole("link", { name: "Start Planning" });
    expect(primary).toHaveAttribute("href", "#ai-search");
    expect(
      screen.getByRole("link", { name: "Continue as Guest" }),
    ).toBeInTheDocument();
  });
});
