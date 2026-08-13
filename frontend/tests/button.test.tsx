import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("renders as a submit button by default, matching form-submission conventions", () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole("button", { name: "Save" })).toHaveAttribute(
      "type",
      "submit",
    );
  });

  it("applies the primary variant by default", () => {
    render(<Button>Go</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-primary");
  });

  it.each([
    ["secondary", "border-border"],
    ["ghost", "bg-transparent"],
    ["outline", "border-border"],
    ["text", "bg-transparent"],
    ["danger", "bg-error"],
    ["success", "bg-success"],
  ] as const)("applies the %s variant's classes", (variant, expectedClass) => {
    render(<Button variant={variant}>Go</Button>);
    expect(screen.getByRole("button")).toHaveClass(expectedClass);
  });

  it("applies the icon size as a 48x48 square", () => {
    render(<Button size="icon" aria-label="Close" />);
    const btn = screen.getByRole("button", { name: "Close" });
    expect(btn.className).toContain("h-12");
    expect(btn.className).toContain("w-12");
    expect(btn.className).toContain("rounded-full");
  });

  it("shows a spinner and sets aria-busy when isLoading, but keeps the label", () => {
    render(<Button isLoading>Submitting</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toHaveAttribute("aria-busy", "true");
    expect(btn).toBeDisabled();
    expect(screen.getByText("Submitting")).toBeInTheDocument();
  });

  it("is disabled and unclickable when disabled is set", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(
      <Button disabled onClick={onClick}>
        Go
      </Button>,
    );
    await user.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("fires onClick when enabled", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<Button onClick={onClick}>Go</Button>);
    await user.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("merges a consumer className without losing variant classes", () => {
    render(<Button className="mt-4">Go</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toHaveClass("mt-4");
    expect(btn).toHaveClass("bg-primary");
  });
});
