import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SkipLink } from "@/components/layout/skip-link";

describe("SkipLink", () => {
  it("renders a link to #main-content", () => {
    render(<SkipLink />);
    const link = screen.getByRole("link", { name: /skip to main content/i });
    expect(link).toHaveAttribute("href", "#main-content");
  });

  it("is visually hidden until it receives focus", () => {
    render(<SkipLink />);
    const link = screen.getByRole("link", { name: /skip to main content/i });
    expect(link.className).toMatch(/sr-only/);
    expect(link.className).toMatch(/focus:not-sr-only/);
  });
});
