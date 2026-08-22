import { describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "@/components/auth/login-form";
import { renderWithProviders as render } from "./layout-test-utils";

function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  return async () => {
    await user.type(screen.getByLabelText(/email/i), "  Jane@Example.COM ");
    await user.type(screen.getByLabelText(/password/i), "longenough1");
  };
}

describe("LoginForm", () => {
  it("renders Email and Password with visible programmatic labels", () => {
    render(<LoginForm onSubmit={vi.fn()} />);

    const email = screen.getByLabelText(/email/i);
    const password = screen.getByLabelText(/password/i);

    expect(email).toBeVisible();
    expect(password).toBeVisible();
    expect(email).toHaveAttribute("type", "email");
    expect(password).toHaveAttribute("type", "password");
  });

  it("does not render a Confirm Password field (login isn't registration)", () => {
    render(<LoginForm onSubmit={vi.fn()} />);
    expect(screen.queryByLabelText(/confirm password/i)).not.toBeInTheDocument();
  });

  it("shows a validation error on blur for an invalid email, linked via aria-describedby", async () => {
    const user = userEvent.setup();
    render(<LoginForm onSubmit={vi.fn()} />);

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

  it("shows a required error on blur for an empty password, without an 8-character policy message", async () => {
    const user = userEvent.setup();
    render(<LoginForm onSubmit={vi.fn()} />);

    await user.type(screen.getByLabelText(/email/i), "jane@example.com");
    await user.click(screen.getByLabelText(/password/i));
    await user.tab();

    expect(await screen.findByText("Password is required.")).toBeInTheDocument();
    expect(screen.queryByText(/at least 8 characters/i)).not.toBeInTheDocument();
  });

  it("does not call onSubmit while the form is invalid, and moves focus to the first invalid field", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<LoginForm onSubmit={onSubmit} />);

    await user.click(screen.getByRole("button", { name: /log in/i }));

    expect(onSubmit).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.getByLabelText(/email/i)).toHaveFocus());
  });

  it("calls onSubmit with the normalized (trimmed + lowercased) payload once valid", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<LoginForm onSubmit={onSubmit} />);

    await fillValidForm(user)();
    await user.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ email: "jane@example.com", password: "longenough1" }),
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
    render(<LoginForm onSubmit={onSubmit} />);

    await fillValidForm(user)();
    await user.click(screen.getByRole("button", { name: /log in/i }));

    const loadingButton = await screen.findByRole("button", { name: /logging in/i });
    expect(loadingButton).toBeDisabled();
    expect(loadingButton).toHaveAttribute("aria-busy", "true");

    resolveSubmit();
    await waitFor(() => expect(screen.getByText(/you're logged in/i)).toBeInTheDocument());
  });

  it("shows a form-level error banner (role=alert) when onSubmit rejects, and does not show the success state", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockRejectedValue(new Error("Incorrect email or password."));
    render(<LoginForm onSubmit={onSubmit} />);

    await fillValidForm(user)();
    await user.click(screen.getByRole("button", { name: /log in/i }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Incorrect email or password.");
    expect(screen.queryByText(/you're logged in/i)).not.toBeInTheDocument();
  });

  it("shows the success state after onSubmit resolves", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<LoginForm onSubmit={onSubmit} />);

    await fillValidForm(user)();
    await user.click(screen.getByRole("button", { name: /log in/i }));

    expect(await screen.findByText(/you're logged in/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /log in/i })).not.toBeInTheDocument();
  });
});
