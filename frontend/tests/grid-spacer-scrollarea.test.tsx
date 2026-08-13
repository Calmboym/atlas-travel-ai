import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Grid, Spacer } from "@/components/ui/layout";
import { ScrollArea } from "@/components/ui/scroll-area";

describe("Grid", () => {
  it("applies the mobile-first responsive column classes for 12 columns", () => {
    const { container } = render(<Grid>item</Grid>);
    expect(container.firstChild).toHaveClass(
      "grid",
      "grid-cols-4",
      "md:grid-cols-8",
      "lg:grid-cols-12",
    );
  });

  it("applies a reduced column set for columns=4", () => {
    const { container } = render(<Grid columns={4}>item</Grid>);
    expect(container.firstChild).toHaveClass("grid-cols-4");
    expect(container.firstChild).not.toHaveClass("lg:grid-cols-12");
  });
});

describe("Spacer", () => {
  it("is a flex-grow spacer with no size given", () => {
    const { container } = render(<Spacer />);
    expect(container.firstChild).toHaveClass("flex-1");
  });

  it("is a fixed-size, axis-appropriate spacer when size is given", () => {
    const { container } = render(<Spacer size={8} axis="vertical" />);
    expect(container.firstChild).toHaveClass("h-8");
  });

  it("is hidden from assistive tech", () => {
    const { container } = render(<Spacer size={4} />);
    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
  });
});

describe("ScrollArea", () => {
  it("renders its children inside the scrollable viewport", () => {
    render(
      <ScrollArea className="h-40">
        <div>Long content</div>
      </ScrollArea>,
    );
    expect(screen.getByText("Long content")).toBeInTheDocument();
  });
});
