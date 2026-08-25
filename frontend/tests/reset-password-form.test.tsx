import { describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { renderWithProviders as render } from "./layout-test-utils";

function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  return async () => {
    await user.type(screen.getByLabelText(/^new password/i), "longenough1");
    await user.type(screen.getByLabelText(/confirm new password/i), "longenough1");
  };
}

describe("ResetPasswordForm", () => {
  it("renders New Password and Confirm New Password with visible programmatic labels", () => {
    render(<ResetPasswordForm onSubmit={vi.fn()} />);

    const newPassword = screen.getByLabelText(/^new password/i);
    const confirmPassword = screen.getByLabelText(/confirm new password/i);

    expect(newPassword).toBeVisible();
    expect(confirmPassword).toBeVisible();
    expect(newPassword).toHaveAttribute("type", "password");
    expect(confirmPassword).toHaveAttribute("type", "password");
  });

  it("shows a required error on blur for an empty new password", async () => {
    const user = userEvent.setup();
    render(<ResetPasswordForm onSubmit={vi.fn()} />);

    await user.click(screen.getByLabelText(/^new password/i));
    await user.tab();

    expect(await screen.findByText("Password is required.")).toBeInTheDocument();
  });

  it("shows a too-short error for a password under 8 characters", async () => {
    const user = userEvent.setup();
    render(<ResetPasswordForm onSubmit={vi.fn()} />);

    await user.type(screen.getByLabelText(/^new password/i), "short1");
    await user.tab();

    expect(await screen.findByText(/at least 8 characters/i)).toBeInTheDocument();
  });

  it("shows a mismatch error when confirm password does not match", async () => {
    const user = userEvent.setup();
    render(<ResetPasswordForm onSubmit={vi.fn()} />);

    await user.type(screen.getByLabelText(/^new password/i), "longenough1");
    await user.type(screen.getByLabelText(/confirm new password/i), "different1");
    await user.tab();

    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
  });

  it("does not call onSubmit while the form is invalid, and moves focus to the first invalid field", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ResetPasswordForm onSubmit={onSubmit} />);

    await user.click(screen.getByRole("button", { name: /reset password/i }));

    expect(onSubmit).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.getByLabelText(/^new password/i)).toHaveFocus());
  });

  it("calls onSubmit with the new password once valid", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<ResetPasswordForm onSubmit={onSubmit} />);

    await fillValidForm(user)();
    await user.click(screen.getByRole("button", { name: /reset password/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ newPassword: "longenough1", confirmPassword: "longenough1" }),
    );
  });

  it("shows a loading state while onSubmit is pending", async () => {
    const user = userEvent.setup();
    let resolveSubmit: () => void = () => {};
    const onSubmit = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveSubmit = resolve;
        }),
    );
    render(<ResetPasswordForm onSubmit={onSubmit} />);

    await fillValidForm(user)();
    await user.click(screen.getByRole("button", { name: /reset password/i }));

    const loadingButton = await screen.findByRole("button", { name: /resetting/i });
    expect(loadingButton).toBeDisabled();
    expect(loadingButton).toHaveAttribute("aria-busy", "true");

    resolveSubmit();
    await waitFor(() => expect(screen.getByText(/password changed/i)).toBeInTheDocument());
  });

  it("shows a form-level error banner (role=alert) when onSubmit rejects — e.g. an expired token", async () => {
    const user = userEvent.setup();
    const onSubmit = vi
      .fn()
      .mockRejectedValue(new Error("This reset link is invalid or has expired."));
    render(<ResetPasswordForm onSubmit={onSubmit} />);

    await fillValidForm(user)();
    await user.click(screen.getByRole("button", { name: /reset password/i }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("This reset link is invalid or has expired.");
    expect(screen.queryByText(/password changed/i)).not.toBeInTheDocument();
    // The form must still be usable — the user typed real input and
    // shouldn't lose it to an unrelated full-page error state.
    expect(screen.getByLabelText(/^new password/i)).toBeInTheDocument();
  });

  it("shows the success state with a Continue to log in link after onSubmit resolves", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<ResetPasswordForm onSubmit={onSubmit} />);

    await fillValidForm(user)();
    await user.click(screen.getByRole("button", { name: /reset password/i }));

    expect(await screen.findByText(/password changed/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /continue to log in/i })).toHaveAttribute(
      "href",
      "/en/login",
    );
    expect(screen.queryByRole("button", { name: /reset password/i })).not.toBeInTheDocument();
  });
});
