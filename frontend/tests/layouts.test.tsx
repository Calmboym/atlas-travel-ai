import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "./layout-test-utils";
import { MarketingLayout } from "@/components/layout/marketing-layout";
import { ApplicationLayout } from "@/components/layout/application-layout";
import { FocusLayout } from "@/components/layout/focus-layout";

describe("MarketingLayout", () => {
  it("renders header, a single labeled main landmark, and footer", () => {
    renderWithProviders(
      <MarketingLayout>
        <p>Hero content</p>
      </MarketingLayout>,
    );
    expect(screen.getByRole("banner")).toBeInTheDocument();
    const main = screen.getByRole("main");
    expect(main).toHaveAttribute("id", "main-content");
    expect(screen.getByText("Hero content")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });
});

describe("ApplicationLayout", () => {
  it("renders Navbar, Sidebar, MobileBottomNav, and main content together", () => {
    renderWithProviders(
      <ApplicationLayout>
        <p>Dashboard content</p>
      </ApplicationLayout>,
    );
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(
      screen.getByRole("complementary", { name: "Primary" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveAttribute("id", "main-content");
    expect(screen.getByText("Dashboard content")).toBeInTheDocument();
    // MobileBottomNav is a second <nav aria-label="Main">, distinct
    // from Navbar's own desktop <nav aria-label="Main">.
    expect(screen.getAllByRole("navigation", { name: "Main" }).length).toBeGreaterThanOrEqual(1);
  });

  it("does not render a right panel when none is provided", () => {
    renderWithProviders(<ApplicationLayout>content</ApplicationLayout>);
    expect(
      screen.queryByRole("complementary", { name: "Assistant" }),
    ).not.toBeInTheDocument();
  });

  it("renders the right panel when provided", () => {
    renderWithProviders(
      <ApplicationLayout panel={<p>AI panel</p>}>content</ApplicationLayout>,
    );
    expect(screen.getByText("AI panel")).toBeInTheDocument();
    expect(
      screen.getByRole("complementary", { name: "Assistant" }),
    ).toBeInTheDocument();
  });
});

describe("FocusLayout", () => {
  it("renders a minimal header with no Sidebar and no full nav", () => {
    renderWithProviders(
      <FocusLayout>
        <p>Planning workspace</p>
      </FocusLayout>,
    );
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByText("Planning workspace")).toBeInTheDocument();
    expect(
      screen.queryByRole("complementary", { name: "Primary" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });

  it("renders the AI panel when provided", () => {
    renderWithProviders(
      <FocusLayout aiPanel={<p>Ask AI</p>}>workspace</FocusLayout>,
    );
    expect(screen.getByText("Ask AI")).toBeInTheDocument();
  });

  it("shows an optional status slot (e.g. Saving…)", () => {
    renderWithProviders(
      <FocusLayout statusSlot="Saving…">workspace</FocusLayout>,
    );
    expect(screen.getByText("Saving…")).toBeInTheDocument();
  });
});
