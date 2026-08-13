import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges class lists, resolving conflicting Tailwind utilities (e.g. a
 * consumer-supplied `className="bg-error-500"` correctly overriding a
 * component's own `bg-primary`, rather than both concatenating and
 * leaving the cascade order to chance). Standard pairing for any
 * component built with class-variance-authority — added here because
 * DESIGNSYS-02 introduces CVA-based variants; AUTH-01's single-variant
 * Button didn't need it yet. `tailwind-merge` isn't separately listed in
 * DESIGN_SYSTEM.md §40, but it's the standard, expected companion to
 * `class-variance-authority` and `clsx`, both of which are — flagged
 * here rather than added silently.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
