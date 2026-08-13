"use client";

import { forwardRef, useId, type InputHTMLAttributes } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * Search Box Contract (DESIGN_TOKENS.md Part 6): variant of the Input
 * Contract, leading Search icon, minimum height 56px (taller than a
 * regular 52px Input — search is a primary entry point per
 * INFORMATION_ARCHITECTURE.md's "No traditional search page... The AI
 * orchestrates search internally," so it's given slightly more visual
 * weight). Clear button appears only once there's a value to clear.
 */
export interface SearchInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  onClear?: () => void;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, value, onClear, "aria-label": ariaLabel, ...props }, ref) => {
    const generatedId = useId();
    const hasValue = typeof value === "string" && value.length > 0;

    return (
      <div className="relative w-full">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted"
          aria-hidden="true"
        />
        <input
          ref={ref}
          type="search"
          value={value}
          aria-label={ariaLabel ?? "Search"}
          id={props.id ?? generatedId}
          className={cn(
            "h-14 w-full rounded-full border border-border bg-surface pl-12 pr-12 text-base text-text-primary",
            "placeholder:text-text-muted",
            "transition-colors duration-200 ease-out",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
            // Native search inputs render their own clear "x" in some
            // browsers — suppressed so the one custom button below is
            // the only clear affordance, avoiding two redundant ones.
            "[&::-webkit-search-cancel-button]:appearance-none",
            className,
          )}
          {...props}
        />
        {hasValue && onClear ? (
          <button
            type="button"
            onClick={onClear}
            aria-label="Clear search"
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-text-muted transition-colors hover:bg-surface-secondary hover:text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : null}
      </div>
    );
  },
);
SearchInput.displayName = "SearchInput";
