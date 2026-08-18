import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { BackgroundSystem } from "@/components/ui/background-system";

describe("BackgroundSystem", () => {
  it("renders a decorative, non-interactive noise layer by default", () => {
    const { container } = render(<BackgroundSystem />);
    const layer = container.firstChild as HTMLElement;
    expect(layer).toHaveClass("atlas-noise");
    expect(layer).toHaveAttribute("aria-hidden", "true");
    expect(layer).toHaveClass("pointer-events-none");
  });

  it("sits at the bottom of the stack (fixed, negative z-index)", () => {
    const { container } = render(<BackgroundSystem />);
    const layer = container.firstChild as HTMLElement;
    expect(layer).toHaveClass("fixed", "inset-0", "-z-10");
  });

  it("renders nothing when noise is explicitly disabled", () => {
    const { container } = render(<BackgroundSystem noise={false} />);
    expect(container.firstChild).toBeNull();
  });

  it("is not announced to assistive technology (decorative only)", () => {
    const { container } = render(<BackgroundSystem />);
    // aria-hidden="true" plus no text content/role is the standard
    // "fully decorative, invisible to AT" contract — nothing further
    // to assert via role queries since none should be exposed.
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull();
  });
});
