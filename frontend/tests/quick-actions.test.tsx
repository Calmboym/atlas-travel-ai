import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "./layout-test-utils";
import { QuickActions } from "@/components/shared/quick-actions";
import { Sparkles } from "lucide-react";

describe("QuickActions", () => {
  it("renders each action as a link with the given label and href", () => {
    renderWithProviders(
      <QuickActions
        label="Quick actions"
        actions={[
          { key: "a", label: "New trip", href: "/chat", icon: Sparkles },
          { key: "b", label: "Settings", href: "/settings", icon: Sparkles },
        ]}
      />,
    );

    expect(screen.getByRole("navigation", { name: "Quick actions" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /new trip/i })).toHaveAttribute(
      "href",
      "/en/chat",
    );
    expect(screen.getByRole("link", { name: /settings/i })).toHaveAttribute(
      "href",
      "/en/settings",
    );
  });

  it("renders nothing when there are no actions", () => {
    const { container } = renderWithProviders(
      <QuickActions label="Quick actions" actions={[]} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
