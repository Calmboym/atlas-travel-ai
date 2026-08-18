import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "./layout-test-utils";
import { ThemeSwitcher } from "@/components/layout/theme-switcher";

describe("ThemeSwitcher", () => {
  it("renders a trigger button describing the current theme", () => {
    renderWithProviders(<ThemeSwitcher />);
    expect(
      screen.getByRole("button", { name: /theme:/i }),
    ).toBeInTheDocument();
  });

  it("opens a menu with Light, Dark, and System options", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ThemeSwitcher />);

    await user.click(screen.getByRole("button", { name: /theme:/i }));

    expect(
      screen.getByRole("menuitemradio", { name: "Light" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("menuitemradio", { name: "Dark" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("menuitemradio", { name: "System" }),
    ).toBeInTheDocument();
  });

  it("defaults to System checked, and Dark becomes checked after selecting it", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ThemeSwitcher />);

    await user.click(screen.getByRole("button", { name: /theme:/i }));
    expect(
      screen.getByRole("menuitemradio", { name: "System" }),
    ).toHaveAttribute("aria-checked", "true");
    expect(
      screen.getByRole("menuitemradio", { name: "Dark" }),
    ).toHaveAttribute("aria-checked", "false");

    await user.click(screen.getByRole("menuitemradio", { name: "Dark" }));

    // Selecting closes the menu (Radix menuitemradio default behavior);
    // the trigger's own label is the simplest, non-flaky way to
    // confirm the selection actually applied, rather than reopening
    // the popover and re-querying its portal-rendered content.
    expect(
      screen.getByRole("button", { name: /theme: dark/i }),
    ).toBeInTheDocument();
  });
});
