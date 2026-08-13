import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RegisterForm } from "@/components/auth/register-form";

function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  return async () => {
    await user.type(screen.getByLabelText(/email/i), "  Jane@Example.COM ");
    await user.type(screen.getByLabelText(/^password/i), "longenough1");
    await user.type(
      screen.getByLabelText(/confirm password/i),
      "longenough1",
    );
  };
}

describe("RegisterForm", () => {
  it("renders Email, Password, and Confirm password with visible programmatic labels (no placeholder-only)", () => {
    render(<RegisterForm onSubmit={vi.fn()} />);

    const email = screen.getByLabelText(/email/i);
    const password = screen.getByLabelText(/^password/i);
    const confirm = screen.getByLabelText(/confirm password/i);

    expect(email).toBeVisible();
    expect(password).toBeVisible();
    expect(confirm).toBeVisible();
    expect(email).toHaveAttribute("type", "email");
    expect(password).toHaveAttribute("type", "password");
    expect(confirm).toHaveAttribute("type", "password");
  });

  it("does not render a Name field (approved scope: Email, Password, Confirm Password only)", () => {
    render(<RegisterForm onSubmit={vi.fn()} />);
    expect(screen.queryByLabelText(/name/i)).not.toBeInTheDocument();
  });

  it("shows a validation error on blur for an invalid email, linked via aria-describedby", async () => {
    const user = userEvent.setup();
    render(<RegisterForm onSubmit={vi.fn()} />);

    const email = screen.getByLabelText(/email/i);
    await user.type(email, "not-an-email");
    await user.tab(); // triggers blur

    const errorText = await screen.findByText(
      /please enter a valid email address/i,
    );
    expect(errorText).toBeInTheDocument();

    const describedById = email.getAttribute("aria-describedby");
    expect(describedById).toBeTruthy();
    expect(document.getElementById(describedById!)).toHaveTextContent(
      /please enter a valid email address/i,
    );
    expect(email).toHaveAttribute("aria-invalid", "true");
  });

  it("shows the 8-character password policy message and nothing stricter", async () => {
    const user = userEvent.setup();
    render(<RegisterForm onSubmit={vi.fn()} />);

    const password = screen.getByLabelText(/^password/i);
    await user.type(password, "short1");
    await user.tab();

    expect(
      await screen.findByText("Password must be at least 8 characters."),
    ).toBeInTheDocument();
  });

  it("shows a confirm-password mismatch error and blocks submission", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<RegisterForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/email/i), "jane@example.com");
    await user.type(screen.getByLabelText(/^password/i), "longenough1");
    await user.type(
      screen.getByLabelText(/confirm password/i),
      "doesnotmatch",
    );
    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(
      await screen.findByText("Passwords do not match."),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("does not call onSubmit while the form is invalid, and moves focus to the first invalid field", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<RegisterForm onSubmit={onSubmit} />);

    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(onSubmit).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(screen.getByLabelText(/email/i)).toHaveFocus(),
    );
  });

  it("calls onSubmit with the normalized (trimmed + lowercased) payload once valid", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<RegisterForm onSubmit={onSubmit} />);

    await fillValidForm(user)();
    await user.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ email: "jane@example.com" }),
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
    render(<RegisterForm onSubmit={onSubmit} />);

    await fillValidForm(user)();
    await user.click(screen.getByRole("button", { name: /create account/i }));

    const loadingButton = await screen.findByRole("button", {
      name: /creating account/i,
    });
    expect(loadingButton).toBeDisabled();
    expect(loadingButton).toHaveAttribute("aria-busy", "true");

    resolveSubmit();
    await waitFor(() =>
      expect(screen.getByText(/account created/i)).toBeInTheDocument(),
    );
  });

  it("shows a form-level error banner (role=alert) when onSubmit rejects, and does not show the success state", async () => {
    const user = userEvent.setup();
    const onSubmit = vi
      .fn()
      .mockRejectedValue(new Error("That email is already registered."));
    render(<RegisterForm onSubmit={onSubmit} />);

    await fillValidForm(user)();
    await user.click(screen.getByRole("button", { name: /create account/i }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("That email is already registered.");
    expect(screen.queryByText(/account created/i)).not.toBeInTheDocument();
  });

  it("shows the success state after onSubmit resolves", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<RegisterForm onSubmit={onSubmit} />);

    await fillValidForm(user)();
    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(await screen.findByText(/account created/i)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /create account/i }),
    ).not.toBeInTheDocument();
  });
});
