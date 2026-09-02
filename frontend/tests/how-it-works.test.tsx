import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "./layout-test-utils";
import { HowItWorks } from "@/components/landing/how-it-works";

describe("HowItWorks", () => {
  it("renders all three steps with their titles and descriptions", () => {
    renderWithProviders(<HowItWorks />);

    expect(
      screen.getByRole("heading", { level: 2, name: "How Atlas works" }),
    ).toBeInTheDocument();

    const stepTitles = [
      "Tell Atlas about your trip",
      "Get a plan you can trust",
      "Refine it together",
    ];
    for (const title of stepTitles) {
      expect(
        screen.getByRole("heading", { level: 3, name: title }),
      ).toBeInTheDocument();
    }
  });
});
