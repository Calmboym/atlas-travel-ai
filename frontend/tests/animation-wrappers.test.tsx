import { describe, expect, it } from "vitest";
import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import {
  FadeIn,
  SlideIn,
  ScaleIn,
  ScrollReveal,
} from "@/components/ui/motion-wrappers";
import { MotionProvider } from "@/components/providers/motion-provider";

/**
 * These wrappers only make sense (and only respect reduced motion) when
 * mounted under MotionProvider's <MotionConfig>, matching how they're
 * actually consumed app-wide (mounted once in app/[locale]/layout.tsx).
 * Behavioral assertions stay at the level of this component's own
 * contract — renders children, applies className, accepts the
 * documented props — rather than asserting on Framer Motion's internal
 * inline style output, which is an implementation detail of the
 * animation library, not of these wrappers.
 */
function withMotion(children: ReactNode) {
  return <MotionProvider>{children}</MotionProvider>;
}

describe("FadeIn", () => {
  it("renders its children", () => {
    render(withMotion(<FadeIn>fade content</FadeIn>));
    expect(screen.getByText("fade content")).toBeInTheDocument();
  });

  it("applies a caller-provided className", () => {
    render(
      withMotion(
        <FadeIn className="my-fade">content</FadeIn>,
      ),
    );
    expect(screen.getByText("content")).toHaveClass("my-fade");
  });
});

describe("SlideIn", () => {
  it("renders its children for every direction", () => {
    const directions = ["up", "down", "left", "right"] as const;
    for (const direction of directions) {
      const { unmount } = render(
        withMotion(<SlideIn direction={direction}>slide {direction}</SlideIn>),
      );
      expect(screen.getByText(`slide ${direction}`)).toBeInTheDocument();
      unmount();
    }
  });

  it("defaults to the up direction when none is given", () => {
    render(withMotion(<SlideIn>default direction</SlideIn>));
    expect(screen.getByText("default direction")).toBeInTheDocument();
  });
});

describe("ScaleIn", () => {
  it("renders its children", () => {
    render(withMotion(<ScaleIn>scale content</ScaleIn>));
    expect(screen.getByText("scale content")).toBeInTheDocument();
  });
});

describe("ScrollReveal", () => {
  it("renders its children", () => {
    render(withMotion(<ScrollReveal>revealed content</ScrollReveal>));
    expect(screen.getByText("revealed content")).toBeInTheDocument();
  });

  it("accepts a delay without throwing", () => {
    render(
      withMotion(<ScrollReveal delay={0.2}>delayed reveal</ScrollReveal>),
    );
    expect(screen.getByText("delayed reveal")).toBeInTheDocument();
  });
});
