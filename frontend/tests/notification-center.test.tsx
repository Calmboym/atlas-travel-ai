import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "./layout-test-utils";
import { NotificationCenter } from "@/components/layout/notification-center";

describe("NotificationCenter", () => {
  it("renders a trigger button and opens an honest empty-state panel", async () => {
    const user = userEvent.setup();
    renderWithProviders(<NotificationCenter />);

    const trigger = screen.getByRole("button", { name: /notifications/i });
    expect(trigger).toBeInTheDocument();

    await user.click(trigger);

    expect(
      await screen.findByText(/you're all caught up/i),
    ).toBeInTheDocument();
  });
});
