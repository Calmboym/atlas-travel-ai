import { type HTMLAttributes, type AnchorHTMLAttributes } from "react";
import NextLink from "next/link";
import { cn } from "@/lib/utils/cn";

/**
 * Typography primitives (COMPONENT_INVENTORY.md §Typography). Weights
 * and line-heights follow DESIGN_TOKENS.md's table exactly: Titles 700,
 * default UI weight 400, leading-normal (1.5) for body, leading-tight
 * (1.2) for headings. `as` lets callers pick the semantic element
 * (h1–h4) independently of visual size — ACCESSIBILITY.md §Heading
 * Structure requires correct, non-skipping hierarchy, which is a page
 * layout concern the component itself can't enforce, only support.
 */

type HeadingLevel = "h1" | "h2" | "h3" | "h4";

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: HeadingLevel;
}

const headingSizes: Record<HeadingLevel, string> = {
  h1: "text-4xl md:text-5xl leading-tight tracking-tight",
  h2: "text-3xl md:text-4xl leading-tight tracking-tight",
  h3: "text-2xl md:text-3xl leading-tight",
  h4: "text-xl md:text-2xl leading-snug",
};

export function Heading({
  as = "h2",
  className,
  children,
  ...props
}: HeadingProps) {
  const Tag = as;
  return (
    <Tag
      className={cn(
        "font-bold text-text-primary",
        headingSizes[as],
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}

export interface ParagraphProps extends HTMLAttributes<HTMLParagraphElement> {
  /** COPYWRITING_GUIDELINES.md: body 1.5, large paragraphs 1.65. */
  size?: "base" | "lg";
}

export function Paragraph({
  size = "base",
  className,
  children,
  ...props
}: ParagraphProps) {
  return (
    <p
      className={cn(
        "font-normal text-text-primary",
        size === "lg" ? "text-lg leading-relaxed" : "text-base leading-normal",
        className,
      )}
      {...props}
    >
      {children}
    </p>
  );
}

export function Caption({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "text-xs font-normal leading-snug tracking-wide text-text-muted",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
}

/**
 * ACCESSIBILITY.md §Links: "Links must describe destination." (an
 * authoring rule for callers, not something this component enforces).
 * Wraps next/link for internal routes; external/absolute URLs fall
 * through to a plain anchor via next/link's own href-detection.
 */
export function Link({ className, children, href, ...props }: LinkProps) {
  return (
    <NextLink
      href={href}
      className={cn(
        "font-medium text-primary underline-offset-4 hover:underline",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm",
        className,
      )}
      {...props}
    >
      {children}
    </NextLink>
  );
}

/**
 * DisplayText / HeroText — COMPONENT_INVENTORY.md §Typography, above
 * Heading in the size scale. DESIGN_SYSTEM.md §9: "Desktop: Hero XL,
 * Hero L, H1..." — the largest, marketing-register sizes; not meant for
 * the same semantic-hierarchy rules as Heading (a page can have several
 * of these, e.g. inside a scroll-storytelling section, without
 * violating ACCESSIBILITY.md's one-H1 rule, because these render as
 * <p>/<div> by default, not headings — `as` lets a caller upgrade one
 * to an actual heading when it legitimately is the page's H1).
 */
export interface DisplayTextProps extends HTMLAttributes<HTMLElement> {
  as?: "h1" | "p" | "div";
}

export function DisplayText({
  as: Tag = "p",
  className,
  children,
  ...props
}: DisplayTextProps) {
  return (
    <Tag
      className={cn(
        "text-4xl font-bold leading-tight tracking-tight text-text-primary md:text-5xl",
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}

export function HeroText({
  as: Tag = "p",
  className,
  children,
  ...props
}: DisplayTextProps) {
  return (
    <Tag
      className={cn(
        "text-5xl font-bold leading-tight tracking-tight text-text-primary md:text-6xl lg:text-7xl",
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}

/** DESIGN_TOKENS.md font scale: monospace isn't a separate declared
 * font family anywhere in the Design Bible — falls back to the
 * platform's default monospace stack rather than inventing/importing
 * one that was never approved. */
export function Code({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLElement>) {
  return (
    <code
      className={cn(
        "rounded-md bg-surface-secondary px-1.5 py-0.5 font-mono text-sm text-text-primary",
        className,
      )}
      {...props}
    >
      {children}
    </code>
  );
}

export function Quote({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLQuoteElement>) {
  return (
    <blockquote
      className={cn(
        "border-l-2 border-primary pl-4 text-lg italic leading-relaxed text-text-secondary",
        className,
      )}
      {...props}
    >
      {children}
    </blockquote>
  );
}

export interface ListProps extends HTMLAttributes<HTMLUListElement> {
  variant?: "bullet" | "number";
}

export function List({
  variant = "bullet",
  className,
  children,
  ...props
}: ListProps) {
  const Tag = variant === "number" ? "ol" : "ul";
  return (
    <Tag
      className={cn(
        "ml-5 space-y-1.5 text-base leading-normal text-text-primary",
        variant === "number" ? "list-decimal" : "list-disc",
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}

export function BadgeText({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "text-xs font-semibold uppercase tracking-wide text-text-secondary",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
