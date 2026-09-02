import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "./layout-test-utils";
import { Footer } from "@/components/layout/footer";

describe("Footer", () => {
  it("minimal variant renders a single-line footer with legal links", () => {
    renderWithProviders(<Footer variant="minimal" />);
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Privacy" })).toHaveAttribute(
      "href",
      "/en/privacy",
    );
    expect(screen.getByRole("link", { name: "Terms" })).toHaveAttribute(
      "href",
      "/en/terms",
    );
    expect(
      screen.getByText(`© ${new Date().getFullYear()} Atlas.`, {
        exact: false,
      }),
    ).toBeInTheDocument();
  });

  it("marketing variant renders Product, Company, and Legal columns", () => {
    renderWithProviders(<Footer variant="marketing" />);
    expect(
      screen.getByRole("heading", { name: "Product" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Company" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Legal" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "About" })).toHaveAttribute(
      "href",
      "/en/about",
    );
    expect(screen.getByRole("link", { name: "Discover" })).toHaveAttribute(
      "href",
      "#discover",
    );
  });

  it("marketing variant shows the full copyright line and tagline", () => {
    renderWithProviders(<Footer variant="marketing" />);
    expect(
      screen.getByText(
        `© ${new Date().getFullYear()} Atlas. All rights reserved.`,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/intelligent travel companion/i),
    ).toBeInTheDocument();
  });
});
