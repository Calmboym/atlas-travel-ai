import { describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { renderWithProviders as render } from "./layout-test-utils";

describe("ForgotPasswordForm", () => {
  it("renders a single Email field with a visible programmatic label", () => {
    render(<ForgotPasswordForm onSubmit={vi.fn()} />);

    const email = screen.getByLabelText(/email/i);
    expect(email).toBeVisible();
    expect(email).toHaveAttribute("type", "email");
  });

  it("does not render a Password field (this isn't a login/registration form)", () => {
    render(<ForgotPasswordForm onSubmit={vi.fn()} />);
    expect(screen.queryByLabelText(/^password$/i)).not.toBeInTheDocument();
  });

  it("shows a validation error on blur for an invalid email, linked via aria-describedby", async () => {
    const user = userEvent.setup();
    render(<ForgotPasswordForm onSubmit={vi.fn()} />);

    const email = screen.getByLabelText(/email/i);
    await user.type(email, "not-an-email");
    await user.tab();

    const errorText = await screen.findByText(/please enter a valid email address/i);
    expect(errorText).toBeInTheDocument();

    const describedById = email.getAttribute("aria-describedby");
    expect(describedById).toBeTruthy();
    expect(document.getElementById(describedById!)).toHaveTextContent(
      /please enter a valid email address/i,
    );
    expect(email).toHaveAttribute("aria-invalid", "true");
  });

  it("does not call onSubmit while the form is invalid, and moves focus to the email field", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ForgotPasswordForm onSubmit={onSubmit} />);

    await user.click(screen.getByRole("button", { name: /send reset link/i }));

    expect(onSubmit).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.getByLabelText(/email/i)).toHaveFocus());
  });

  it("calls onSubmit with the normalized (trimmed + lowercased) email once valid", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<ForgotPasswordForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/email/i), "  Jane@Example.COM ");
    await user.click(screen.getByRole("button", { name: /send reset link/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ email: "jane@example.com" }));
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
    render(<ForgotPasswordForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/email/i), "jane@example.com");
    await user.click(screen.getByRole("button", { name: /send reset link/i }));

    const loadingButton = await screen.findByRole("button", { name: /sending/i });
    expect(loadingButton).toBeDisabled();
    expect(loadingButton).toHaveAttribute("aria-busy", "true");

    resolveSubmit();
    await waitFor(() => expect(screen.getByText(/check your email/i)).toBeInTheDocument());
  });

  it("shows a form-level error banner (role=alert) when onSubmit rejects, and does not show the success state", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockRejectedValue(new Error("Something went wrong."));
    render(<ForgotPasswordForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/email/i), "jane@example.com");
    await user.click(screen.getByRole("button", { name: /send reset link/i }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Something went wrong.");
    expect(screen.queryByText(/check your email/i)).not.toBeInTheDocument();
  });

  it("shows the success state after onSubmit resolves, revealing nothing about whether the email exists", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<ForgotPasswordForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/email/i), "jane@example.com");
    await user.click(screen.getByRole("button", { name: /send reset link/i }));

    expect(await screen.findByText(/check your email/i)).toBeInTheDocument();
    expect(
      screen.getByText(/if an account with that email exists/i),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /send reset link/i })).not.toBeInTheDocument();
  });
});
