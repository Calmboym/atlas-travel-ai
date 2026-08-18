import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { GlassSurface, GlassCard } from "@/components/ui/glass";

describe("GlassSurface", () => {
  it.each([1, 2, 3, 4] as const)(
    "applies the atlas-glass-%i class",
    (level) => {
      render(<GlassSurface level={level} data-testid="surface" />);
      expect(screen.getByTestId("surface")).toHaveClass(`atlas-glass-${level}`);
    },
  );

  it("merges a caller-provided className rather than replacing it", () => {
    render(<GlassSurface level={2} className="my-panel" data-testid="surface" />);
    const el = screen.getByTestId("surface");
    expect(el).toHaveClass("atlas-glass-2");
    expect(el).toHaveClass("my-panel");
  });

  it("forwards a ref to the underlying element", () => {
    let ref: HTMLDivElement | null = null;
    render(
      <GlassSurface
        level={1}
        ref={(el) => {
          ref = el;
        }}
      />,
    );
    expect(ref).toBeInstanceOf(HTMLDivElement);
  });
});

describe("GlassCard", () => {
  it("defaults to radius-2xl (rounded-2xl) and space-6 padding", () => {
    render(
      <GlassCard level={3} data-testid="card">
        content
      </GlassCard>,
    );
    const el = screen.getByTestId("card");
    expect(el).toHaveClass("atlas-glass-3", "rounded-2xl", "p-6", "shadow-sm");
  });

  it("applies the requested radius token", () => {
    render(
      <GlassCard level={4} radius="3xl" data-testid="card">
        content
      </GlassCard>,
    );
    expect(screen.getByTestId("card")).toHaveClass("rounded-3xl");
  });

  it("adds hover/transition classes only when interactive", () => {
    const { rerender } = render(
      <GlassCard level={2} data-testid="card">
        content
      </GlassCard>,
    );
    expect(screen.getByTestId("card")).not.toHaveClass("hover:shadow-md");

    rerender(
      <GlassCard level={2} interactive data-testid="card">
        content
      </GlassCard>,
    );
    expect(screen.getByTestId("card")).toHaveClass("hover:shadow-md");
  });

  it("renders children", () => {
    render(<GlassCard level={2}>hello</GlassCard>);
    expect(screen.getByText("hello")).toBeInTheDocument();
  });
});
