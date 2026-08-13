import { type LabelHTMLAttributes } from "react";
import clsx from "clsx";

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  /**
   * Shows the "*" required indicator plus a screen-reader-only
   * "(required)" suffix — ACCESSIBILITY.md §Required Fields: "Never
   * rely only on color. Required indicator: * and Accessible
   * description."
   */
  required?: boolean;
}

export function Label({ children, required, className, ...props }: LabelProps) {
  return (
    <label
      className={clsx(
        "text-sm font-medium leading-normal text-text-primary",
        className,
      )}
      {...props}
    >
      {children}
      {required ? (
        <>
          <span aria-hidden="true" className="ml-0.5 text-error-strong">
            *
          </span>
          <span className="sr-only"> (required)</span>
        </>
      ) : null}
    </label>
  );
}
