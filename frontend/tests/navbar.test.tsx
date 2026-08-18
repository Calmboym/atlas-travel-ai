import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "./layout-test-utils";
import { Navbar } from "@/components/layout/navbar";

describe("Navbar", () => {
  it("marketing variant shows the marketing nav and guest CTAs", () => {
    renderWithProviders(<Navbar variant="marketing" />);
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Atlas" })).toHaveAttribute(
      "href",
      "/en",
    );
    expect(screen.getByRole("link", { name: "Log in" })).toHaveAttribute(
      "href",
      "/en/login",
    );
    expect(screen.getByRole("link", { name: /get started/i })).toHaveAttribute(
      "href",
      "/en/register",
    );
  });

  it("app variant shows the authenticated header nav, not guest CTAs", () => {
    renderWithProviders(<Navbar variant="app" />);
    expect(
      screen.getByRole("link", { name: "AI Chat" }),
    ).toHaveAttribute("href", "/en/chat");
    expect(screen.queryByRole("link", { name: "Log in" })).not.toBeInTheDocument();
  });

  it("opens the mobile menu drawer from the hamburger button", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Navbar variant="marketing" />);

    const menuButton = screen.getByRole("button", { name: /open menu/i });
    expect(menuButton).toHaveAttribute("aria-expanded", "false");

    await user.click(menuButton);
    expect(menuButton).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("renders LanguageSwitcher and ThemeSwitcher", () => {
    renderWithProviders(<Navbar variant="app" />);
    expect(screen.getByRole("button", { name: /language:/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /theme:/i })).toBeInTheDocument();
  });
});
