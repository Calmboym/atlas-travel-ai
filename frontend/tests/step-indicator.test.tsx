import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { StepIndicator, type Step } from "@/components/ui/step-indicator";
import { renderWithProviders as render } from "./layout-test-utils";

const STEPS: Step[] = [
  { id: "one", label: "First" },
  { id: "two", label: "Second" },
  { id: "three", label: "Third" },
];

describe("StepIndicator", () => {
  it("renders an ordered list with one item per step", () => {
    render(<StepIndicator steps={STEPS} currentStepIndex={0} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });

  it("marks the current step with aria-current='step'", () => {
    render(<StepIndicator steps={STEPS} currentStepIndex={1} />);
    const items = screen.getAllByRole("listitem");
    expect(items[0]).not.toHaveAttribute("aria-current");
    expect(items[1]).toHaveAttribute("aria-current", "step");
    expect(items[2]).not.toHaveAttribute("aria-current");
  });

  it("shows a checkmark (not a number) for completed steps", () => {
    render(<StepIndicator steps={STEPS} currentStepIndex={2} />);
    // Steps 0 and 1 are complete; their numeric labels are replaced by
    // an icon, so only step 3's own numeral ("3") should remain
    // visible as plain text content.
    expect(screen.queryByText("1")).not.toBeInTheDocument();
    expect(screen.queryByText("2")).not.toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("announces each step's status to assistive technology", () => {
    render(<StepIndicator steps={STEPS} currentStepIndex={1} />);
    expect(screen.getByText(/completed: first/i)).toBeInTheDocument();
    expect(screen.getByText(/current step: second/i)).toBeInTheDocument();
    expect(screen.getByText(/upcoming: third/i)).toBeInTheDocument();
  });

  it("has an accessible progress label on the list", () => {
    render(<StepIndicator steps={STEPS} currentStepIndex={0} />);
    expect(screen.getByRole("list", { name: /progress/i })).toBeInTheDocument();
  });
});
