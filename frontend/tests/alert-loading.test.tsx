import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Alert } from "@/components/ui/alert";
import { Skeleton, Spinner } from "@/components/ui/loading";

describe("Alert", () => {
  it("defaults to the info variant with role=status", () => {
    render(<Alert>Heads up</Alert>);
    expect(screen.getByRole("status")).toHaveTextContent("Heads up");
  });

  it("uses role=alert (assertive) only for the error variant", () => {
    render(<Alert variant="error">Something failed</Alert>);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("renders a title separately from the body when given", () => {
    render(
      <Alert variant="warning" title="Heads up">
        Details here
      </Alert>,
    );
    expect(screen.getByText("Heads up")).toBeInTheDocument();
    expect(screen.getByText("Details here")).toBeInTheDocument();
  });

  it("never communicates variant by color alone — an icon is always present", () => {
    const { container } = render(<Alert variant="success">Done</Alert>);
    // aria-hidden icon should exist alongside the text content per
    // ACCESSIBILITY.md §Color Independence.
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
  });
});

describe("Skeleton", () => {
  it("is hidden from assistive tech (the real content it stands in for isn't ready yet)", () => {
    const { container } = render(<Skeleton className="h-4 w-24" />);
    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
  });
});

describe("Spinner", () => {
  it("exposes a default accessible label via role=status", () => {
    render(<Spinner />);
    expect(screen.getByRole("status")).toHaveTextContent("Loading");
  });

  it("accepts a custom label", () => {
    render(<Spinner label="Sending message" />);
    expect(screen.getByRole("status")).toHaveTextContent("Sending message");
  });
});
