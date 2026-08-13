import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  DisplayText,
  HeroText,
  Code,
  Quote,
  List,
  BadgeText,
} from "@/components/ui/typography";
import {
  FloatingActionButton,
  SplitButton,
  DropdownButton,
} from "@/components/ui/button-compound";

describe("Remaining typography", () => {
  it("DisplayText/HeroText render as <p> by default, upgradable to h1", () => {
    render(<DisplayText>Atlas</DisplayText>);
    expect(screen.getByText("Atlas").tagName).toBe("P");

    render(<HeroText as="h1">Journey begins</HeroText>);
    expect(
      screen.getByRole("heading", { level: 1, name: "Journey begins" }),
    ).toBeInTheDocument();
  });

  it("Code renders as an inline <code> element", () => {
    render(<Code>npm install</Code>);
    expect(screen.getByText("npm install").tagName).toBe("CODE");
  });

  it("Quote renders as a <blockquote>", () => {
    render(<Quote>Travel far, worry less.</Quote>);
    expect(screen.getByText("Travel far, worry less.").tagName).toBe(
      "BLOCKQUOTE",
    );
  });

  it("List renders <ul> for bullet and <ol> for number", () => {
    const { rerender } = render(
      <List>
        <li>Passport</li>
      </List>,
    );
    expect(screen.getByText("Passport").closest("ul")).toBeInTheDocument();

    rerender(
      <List variant="number">
        <li>Book flight</li>
      </List>,
    );
    expect(screen.getByText("Book flight").closest("ol")).toBeInTheDocument();
  });

  it("BadgeText renders its content", () => {
    render(<BadgeText>New</BadgeText>);
    expect(screen.getByText("New")).toBeInTheDocument();
  });
});

describe("FloatingActionButton", () => {
  it("renders a single icon-sized button inside a floating layer", () => {
    render(<FloatingActionButton aria-label="New trip" />);
    const btn = screen.getByRole("button", { name: "New trip" });
    expect(btn.className).toContain("rounded-full");
  });
});

describe("SplitButton", () => {
  it("fires the primary action independently of the menu", async () => {
    const onPrimary = vi.fn();
    const user = userEvent.setup();
    render(
      <SplitButton
        onClick={onPrimary}
        actions={[{ label: "Duplicate", onSelect: vi.fn() }]}
      >
        Save trip
      </SplitButton>,
    );
    await user.click(screen.getByRole("button", { name: "Save trip" }));
    expect(onPrimary).toHaveBeenCalledOnce();
  });

  it("opens the secondary menu from its own trigger and fires an action", async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(
      <SplitButton actions={[{ label: "Duplicate", onSelect }]}>
        Save trip
      </SplitButton>,
    );
    await user.click(screen.getByRole("button", { name: "More options" }));
    await user.click(await screen.findByText("Duplicate"));
    expect(onSelect).toHaveBeenCalledOnce();
  });
});

describe("DropdownButton", () => {
  it("opens its menu from the whole button and fires the selected action", async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(
      <DropdownButton actions={[{ label: "Export PDF", onSelect }]}>
        Export
      </DropdownButton>,
    );
    await user.click(screen.getByRole("button", { name: /Export/ }));
    await user.click(await screen.findByText("Export PDF"));
    expect(onSelect).toHaveBeenCalledOnce();
  });
});
