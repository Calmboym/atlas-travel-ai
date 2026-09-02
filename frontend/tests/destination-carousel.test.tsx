import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "./layout-test-utils";
import { DestinationCarousel } from "@/components/landing/destination-carousel";

describe("DestinationCarousel", () => {
  it("renders as the #discover section with every destination", () => {
    const { container } = renderWithProviders(<DestinationCarousel />);

    expect(container.querySelector("section#discover")).toBeInTheDocument();
    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(6);
    expect(
      screen.getByRole("heading", { level: 3, name: "Kyoto" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Japan")).toBeInTheDocument();
  });

  it("never displays a rating, review count, or price (no fabricated data)", () => {
    renderWithProviders(<DestinationCarousel />);
    expect(screen.queryByText(/★|stars?|reviews?|\$\d/i)).not.toBeInTheDocument();
  });
});
