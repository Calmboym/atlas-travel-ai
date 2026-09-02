import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "./layout-test-utils";
import { AIShowcase } from "@/components/landing/ai-showcase";

describe("AIShowcase", () => {
  it("renders as the #ai-assistant section with the labeled example exchange", () => {
    const { container } = renderWithProviders(<AIShowcase />);

    expect(
      container.querySelector("section#ai-assistant"),
    ).toBeInTheDocument();
    expect(screen.getByText("Example conversation")).toBeInTheDocument();
    expect(
      screen.getByText(/i have 6 days and love good food/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/lisbon fits well/i)).toBeInTheDocument();
  });
});
