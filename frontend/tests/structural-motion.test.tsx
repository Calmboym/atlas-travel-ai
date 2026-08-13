import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchInput } from "@/components/ui/search-input";
import {
  AppShell,
  Section,
  StickyArea,
  FloatingLayer,
  Portal,
} from "@/components/ui/structural";
import { AspectRatio, PageTransition } from "@/components/ui/motion-wrappers";
import { ResizablePanelGroup } from "@/components/ui/resizable-panel";

describe("SearchInput", () => {
  it("renders a search input with a default accessible label", () => {
    render(<SearchInput value="" onChange={() => {}} />);
    expect(screen.getByRole("searchbox", { name: "Search" })).toBeInTheDocument();
  });

  it("shows a clear button only once there's a value, and calls onClear", async () => {
    const onClear = vi.fn();
    const user = userEvent.setup();
    const { rerender } = render(
      <SearchInput value="" onChange={() => {}} onClear={onClear} />,
    );
    expect(screen.queryByRole("button", { name: "Clear search" })).not.toBeInTheDocument();

    rerender(<SearchInput value="tokyo" onChange={() => {}} onClear={onClear} />);
    await user.click(screen.getByRole("button", { name: "Clear search" }));
    expect(onClear).toHaveBeenCalledOnce();
  });
});

describe("Structural primitives", () => {
  it("AppShell renders a full-height flex column", () => {
    const { container } = render(<AppShell>content</AppShell>);
    expect(container.firstChild).toHaveClass("min-h-screen", "flex-col");
  });

  it("Section renders as a semantic <section>", () => {
    render(<Section>Body</Section>);
    expect(screen.getByText("Body").tagName).toBe("SECTION");
  });

  it("StickyArea applies the given offset as top", () => {
    render(<StickyArea offset={80}>nav</StickyArea>);
    expect(screen.getByText("nav")).toHaveStyle({ top: "80px" });
  });

  it("FloatingLayer positions content per the requested corner", () => {
    const { container } = render(
      <FloatingLayer position="bottom-left">fab</FloatingLayer>,
    );
    expect(container.firstChild).toHaveClass("left-6", "bottom-6");
  });

  it("Portal renders its children into document.body once mounted", async () => {
    render(<Portal>portal content</Portal>);
    expect(await screen.findByText("portal content")).toBeInTheDocument();
    expect(document.body).toContainElement(screen.getByText("portal content"));
  });
});

describe("AspectRatio", () => {
  it("renders children within the given ratio container", () => {
    render(
      <AspectRatio ratio={16 / 9}>
        <img alt="Destination" src="/x.jpg" />
      </AspectRatio>,
    );
    expect(screen.getByAltText("Destination")).toBeInTheDocument();
  });
});

describe("PageTransition", () => {
  it("renders children regardless of variant", () => {
    render(<PageTransition variant="slide">Page body</PageTransition>);
    expect(screen.getByText("Page body")).toBeInTheDocument();
  });
});

describe("ResizablePanelGroup", () => {
  it("renders both panels and a keyboard-operable separator", () => {
    render(
      <ResizablePanelGroup
        first={<div>Left</div>}
        second={<div>Right</div>}
        firstPanelId="left-panel"
        secondPanelId="right-panel"
      />,
    );
    expect(screen.getByText("Left")).toBeInTheDocument();
    expect(screen.getByText("Right")).toBeInTheDocument();
    const splitter = screen.getByRole("separator");
    expect(splitter).toHaveAttribute("tabIndex", "0");
    expect(splitter).toHaveAttribute("aria-valuenow", "50");
  });

  it("adjusts the split via arrow keys, clamped to min/max", async () => {
    const user = userEvent.setup();
    render(
      <ResizablePanelGroup
        first={<div>Left</div>}
        second={<div>Right</div>}
        defaultSplit={50}
        min={15}
        max={85}
      />,
    );
    const splitter = screen.getByRole("separator");
    await user.click(splitter);
    await user.keyboard("{ArrowRight}");
    expect(splitter).toHaveAttribute("aria-valuenow", "52");

    await user.keyboard("{End}");
    expect(splitter).toHaveAttribute("aria-valuenow", "85");
  });
});
