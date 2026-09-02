import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "./layout-test-utils";
import { HeroSection } from "@/components/landing/hero-section";

describe("HeroSection", () => {
  it("renders the headline, subheadline, search box, and guest CTA", () => {
    renderWithProviders(<HeroSection />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Plan every trip with a companion that remembers you.",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/tell atlas where you're dreaming of going/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("search")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Continue as Guest" }),
    ).toBeInTheDocument();
  });

  it("marks the decorative background as hidden from assistive tech", () => {
    const { container } = renderWithProviders(<HeroSection />);
    const decorative = container.querySelector('[aria-hidden="true"]');
    expect(decorative).not.toBeNull();
  });
});
