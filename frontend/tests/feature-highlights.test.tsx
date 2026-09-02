import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "./layout-test-utils";
import { FeatureHighlights } from "@/components/landing/feature-highlights";

describe("FeatureHighlights", () => {
  it("renders as the #features section with all four highlights", () => {
    const { container } = renderWithProviders(<FeatureHighlights />);

    expect(container.querySelector("section#features")).toBeInTheDocument();

    const titles = [
      "Explained, not just generated",
      "Built around your preferences",
      "Honest about uncertainty",
      "No pressure to book",
    ];
    for (const title of titles) {
      expect(
        screen.getByRole("heading", { level: 3, name: title }),
      ).toBeInTheDocument();
    }
  });
});
