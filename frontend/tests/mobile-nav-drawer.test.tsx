import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "./layout-test-utils";
import { MobileNavDrawer } from "@/components/layout/mobile-nav-drawer";

describe("MobileNavDrawer", () => {
  it("renders nothing when closed", () => {
    renderWithProviders(
      <MobileNavDrawer open={false} onOpenChange={vi.fn()} variant="app" />,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows the app nav grid when open with variant='app'", () => {
    renderWithProviders(
      <MobileNavDrawer open onOpenChange={vi.fn()} variant="app" />,
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /settings/i })).toBeInTheDocument();
  });

  it("shows guest sign-in CTAs for variant='marketing' when not authenticated", () => {
    renderWithProviders(
      <MobileNavDrawer open onOpenChange={vi.fn()} variant="marketing" />,
    );
    expect(screen.getByRole("link", { name: "Log in" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /get started/i })).toBeInTheDocument();
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    renderWithProviders(
      <MobileNavDrawer open onOpenChange={onOpenChange} variant="app" />,
    );

    await user.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
