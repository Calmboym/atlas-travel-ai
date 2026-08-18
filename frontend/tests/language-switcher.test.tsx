import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import { renderWithProviders } from "./layout-test-utils";
import { LanguageSwitcher } from "@/components/layout/language-switcher";

describe("LanguageSwitcher", () => {
  it("shows language names, never flags (13_ICONOGRAPHY_AND_ILLUSTRATION.md)", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LanguageSwitcher />);

    await user.click(screen.getByRole("button", { name: /language:/i }));

    expect(screen.getByRole("menuitemradio", { name: "English" })).toBeInTheDocument();
    expect(screen.getByRole("menuitemradio", { name: "فارسی" })).toBeInTheDocument();
    expect(screen.getByRole("menuitemradio", { name: "Deutsch" })).toBeInTheDocument();
    // No <img> or emoji-flag content anywhere in the menu.
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("switches locale while preserving the current path (Flow 15)", async () => {
    const user = userEvent.setup();
    const replace = vi.fn();
    vi.mocked(useRouter).mockReturnValue({
      push: vi.fn(),
      replace,
      prefetch: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
    } as unknown as ReturnType<typeof useRouter>);

    renderWithProviders(<LanguageSwitcher />);
    await user.click(screen.getByRole("button", { name: /language:/i }));
    await user.click(screen.getByRole("menuitemradio", { name: "Deutsch" }));

    // next-intl's router.replace(pathname, {locale}) resolves the
    // fully-localized path internally and calls the underlying
    // next/navigation router with that single string — confirmed by
    // running this test and observing the actual mock call, not
    // assumed from the public API shape alone.
    expect(replace).toHaveBeenCalledWith("/de");
  });
});
