import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "./layout-test-utils";
import { FAQSection } from "@/components/landing/faq-section";

describe("FAQSection", () => {
  it("renders as the #faq section with all four questions collapsed by default", () => {
    const { container } = renderWithProviders(<FAQSection />);

    expect(container.querySelector("section#faq")).toBeInTheDocument();
    const items = container.querySelectorAll("details");
    expect(items).toHaveLength(4);
    for (const item of items) {
      expect(item).not.toHaveAttribute("open");
    }
    expect(
      screen.getByText("Do I need an account to use Atlas?"),
    ).toBeInTheDocument();
  });

  it("expands an answer on click without affecting the others", async () => {
    const user = userEvent.setup();
    const { container } = renderWithProviders(<FAQSection />);

    await user.click(
      screen.getByText("Do I need an account to use Atlas?"),
    );

    const items = Array.from(container.querySelectorAll("details"));
    expect(items[0]).toHaveAttribute("open");
    expect(items[1]).not.toHaveAttribute("open");
    expect(
      screen.getByText(/creating an account just lets you save it/i),
    ).toBeVisible();
  });
});
