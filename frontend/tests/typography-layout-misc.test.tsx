import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Heading, Paragraph, Caption, Link } from "@/components/ui/typography";
import { Container, Stack, Divider } from "@/components/ui/layout";
import { Card } from "@/components/ui/card";
import { Avatar, Badge } from "@/components/ui/avatar-badge";
import { EmptyState, ErrorState } from "@/components/ui/state";

describe("Typography", () => {
  it("Heading renders the requested semantic level, independent of visual size", () => {
    render(<Heading as="h1">Atlas</Heading>);
    expect(screen.getByRole("heading", { level: 1, name: "Atlas" })).toBeInTheDocument();
  });

  it("Paragraph and Caption render as their respective elements", () => {
    render(
      <>
        <Paragraph>Body text</Paragraph>
        <Caption>Helper text</Caption>
      </>,
    );
    expect(screen.getByText("Body text").tagName).toBe("P");
    expect(screen.getByText("Helper text").tagName).toBe("SPAN");
  });

  it("Link renders a real anchor with the given href", () => {
    render(<Link href="/trips">My trips</Link>);
    expect(screen.getByRole("link", { name: "My trips" })).toHaveAttribute(
      "href",
      "/trips",
    );
  });
});

describe("Layout primitives", () => {
  it("Container applies a max-width from the token scale", () => {
    render(<Container size="lg">content</Container>);
    expect(screen.getByText("content")).toHaveStyle({
      maxWidth: "var(--atlas-container-lg)",
    });
  });

  it("Stack lays out children with a token-driven gap class", () => {
    const { container } = render(
      <Stack gap={6} data-testid="stack">
        <span>a</span>
        <span>b</span>
      </Stack>,
    );
    expect(container.firstChild).toHaveClass("gap-6");
  });

  it("is a native <hr> (implicit role=separator) in both orientations, with aria-orientation set only for vertical", () => {
    const { rerender } = render(<Divider />);
    expect(screen.getByRole("separator")).not.toHaveAttribute(
      "aria-orientation",
    );
    rerender(<Divider orientation="vertical" />);
    expect(screen.getByRole("separator")).toHaveAttribute(
      "aria-orientation",
      "vertical",
    );
  });
});

describe("Card", () => {
  it("renders children inside the Glass Level 2 shell", () => {
    render(<Card>Trip summary</Card>);
    expect(screen.getByText("Trip summary")).toBeInTheDocument();
  });
});

describe("Avatar", () => {
  it("shows initials when no image is provided", () => {
    render(<Avatar initials="MJ" alt="Mohammad" />);
    expect(screen.getByText("MJ")).toBeInTheDocument();
  });

  it("exposes a status label when a status is set", () => {
    render(<Avatar initials="MJ" status="online" />);
    expect(screen.getByLabelText("Status: online")).toBeInTheDocument();
  });
});

describe("Badge", () => {
  it("renders its content with the requested semantic variant", () => {
    render(<Badge variant="success">Confirmed</Badge>);
    expect(screen.getByText("Confirmed")).toHaveClass("text-success");
  });
});

describe("EmptyState", () => {
  it("renders title, description, and an optional action", () => {
    render(
      <EmptyState
        title="No saved trips yet"
        description="Create your first itinerary to access it anytime."
        action={<button>Start Planning</button>}
      />,
    );
    expect(screen.getByText("No saved trips yet")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Start Planning" }),
    ).toBeInTheDocument();
  });
});

describe("ErrorState", () => {
  it("renders with role=alert per ACCESSIBILITY.md's Error Recovery guidance", () => {
    render(
      <ErrorState
        title="We couldn't reach the server."
        description="Please check your connection and try again."
      />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "We couldn't reach the server.",
    );
  });
});
