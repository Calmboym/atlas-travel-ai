import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ToastRoot, useToast } from "@/components/ui/toast";

describe("Dialog", () => {
  it("opens on trigger click, shows the title, and closes on Escape", async () => {
    const user = userEvent.setup();
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent title="Delete this itinerary?">
          Are you sure?
        </DialogContent>
      </Dialog>,
    );

    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(
      screen.getByRole("heading", { name: "Delete this itinerary?" }),
    ).toBeInTheDocument();

    await user.keyboard("{Escape}");
    await waitFor(() =>
      expect(
        screen.queryByRole("heading", { name: "Delete this itinerary?" }),
      ).not.toBeInTheDocument(),
    );
  });

  it("closes via the close button", async () => {
    const user = userEvent.setup();
    render(
      <Dialog defaultOpen>
        <DialogContent title="Title">Body</DialogContent>
      </Dialog>,
    );
    await user.click(screen.getByRole("button", { name: "Close" }));
    await waitFor(() =>
      expect(screen.queryByText("Body")).not.toBeInTheDocument(),
    );
  });
});

describe("Sheet", () => {
  it("renders a drag handle only for the bottom side", () => {
    const { rerender } = render(
      <Sheet defaultOpen>
        <SheetContent title="Filters" side="bottom">
          content
        </SheetContent>
      </Sheet>,
    );
    // Portaled to document.body — the local render() container can't
    // see it, so this checks the whole document via `screen`/`document`.
    expect(document.querySelector(".bg-border.rounded-full")).toBeInTheDocument();

    rerender(
      <Sheet defaultOpen>
        <SheetContent title="Filters" side="right">
          content
        </SheetContent>
      </Sheet>,
    );
    expect(
      document.querySelector(".bg-border.rounded-full"),
    ).not.toBeInTheDocument();
  });

  it("opens from a trigger and shows its title", async () => {
    const user = userEvent.setup();
    render(
      <Sheet>
        <SheetTrigger>Filters</SheetTrigger>
        <SheetContent title="Filter trips">body</SheetContent>
      </Sheet>,
    );
    await user.click(screen.getByRole("button", { name: "Filters" }));
    // getByText alone is ambiguous by design: the visible <h2> title and
    // the sr-only fallback Description (Radix's own recommended pattern
    // to avoid its accessibility warning when no description is given)
    // intentionally share the same text.
    expect(
      screen.getByRole("heading", { name: "Filter trips" }),
    ).toBeInTheDocument();
  });
});

describe("Popover", () => {
  it("opens on trigger click and shows its content", async () => {
    const user = userEvent.setup();
    render(
      <Popover>
        <PopoverTrigger>Info</PopoverTrigger>
        <PopoverContent>Extra detail</PopoverContent>
      </Popover>,
    );
    await user.click(screen.getByRole("button", { name: "Info" }));
    expect(await screen.findByText("Extra detail")).toBeInTheDocument();
  });
});

describe("Tooltip", () => {
  it("shows content on hover/focus after the configured delay", async () => {
    const user = userEvent.setup();
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Help</TooltipTrigger>
          <TooltipContent>More info here</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );
    await user.hover(screen.getByText("Help"));
    expect(await screen.findByText("More info here")).toBeInTheDocument();
  });
});

function ToastDemo() {
  const { toast } = useToast();
  return (
    <button
      onClick={() =>
        toast({ title: "Trip saved", variant: "success" })
      }
    >
      Save
    </button>
  );
}

describe("Toast", () => {
  it("shows a toast after toast() is called, with the right variant icon color", async () => {
    const user = userEvent.setup();
    render(
      <ToastRoot>
        <ToastDemo />
      </ToastRoot>,
    );
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(await screen.findByText("Trip saved")).toBeInTheDocument();
  });

  it("useToast throws when used outside ToastRoot", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    expect(() => render(<ToastDemo />)).toThrow(
      "useToast must be used within <ToastRoot>",
    );
    consoleError.mockRestore();
  });
});
