"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useMotionPreference } from "@/components/providers/motion-provider";
import { DURATION } from "@/lib/tokens/motion";

/**
 * Shared StepIndicator — first built here (ATLAS-P1-PROF-01), per
 * COMPONENT_OWNERSHIP_MATRIX.md §4 ("Breadcrumb, Pagination, Tabs,
 * StepIndicator | PROF-01 (StepIndicator first use)"). Generic and
 * content-free (numbers + labels + connecting rail only), so any
 * future multi-step flow can reuse it without depending on anything
 * Profile-specific — Breadcrumb/Pagination/Tabs are NOT built here,
 * since PROF-01 doesn't need them; left for whichever task first does.
 *
 * No DESIGN_TOKENS.md Part 6 component contract exists for
 * StepIndicator specifically. Visual language (rail, filled circle for
 * current/complete, connecting line) is inferred from the same
 * Component Contract philosophy as neighboring components — Design
 * Tokens exclusively, no hardcoded values — rather than a numbered
 * spec, consistent with DEVELOPMENT_EXECUTION_PLAN.md §3's "choosing a
 * sensible default within a task's scope" allowance.
 *
 * PSYCHOLOGY_GUIDELINES.md §10 Goal Gradient Effect: "Visible progress
 * motivates completion... Use progress indicators" — directly
 * motivates why PROF-01's wizard needs this at all, not just how it
 * looks.
 */
export interface Step {
  /** Unique, stable id — used as the React key and for aria labeling. */
  id: string;
  /** Short label shown under/beside the step marker. */
  label: string;
}

export interface StepIndicatorProps {
  steps: readonly Step[];
  /** Zero-based index of the currently active step. */
  currentStepIndex: number;
  className?: string;
}

export function StepIndicator({ steps, currentStepIndex, className }: StepIndicatorProps) {
  const { prefersReducedMotion } = useMotionPreference();

  return (
    <ol
      aria-label="Progress"
      className={cn("flex w-full items-center", className)}
    >
      {steps.map((step, index) => {
        const isComplete = index < currentStepIndex;
        const isCurrent = index === currentStepIndex;
        const isLast = index === steps.length - 1;

        return (
          <li
            key={step.id}
            aria-current={isCurrent ? "step" : undefined}
            className={cn("flex items-center", !isLast && "flex-1")}
          >
            <div className="flex flex-col items-center gap-1.5">
              <motion.div
                initial={false}
                animate={{
                  backgroundColor: isComplete || isCurrent ? "var(--color-primary)" : "var(--color-surface-secondary)",
                  borderColor: isCurrent ? "var(--color-primary)" : "transparent",
                }}
                transition={{ duration: prefersReducedMotion ? 0 : DURATION.normal }}
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold",
                  isComplete || isCurrent ? "text-on-primary" : "text-text-muted",
                )}
              >
                {isComplete ? <Check className="h-4 w-4" aria-hidden="true" /> : index + 1}
              </motion.div>
              <span
                className={cn(
                  "hidden text-xs font-medium sm:block",
                  isCurrent ? "text-text-primary" : "text-text-secondary",
                )}
              >
                {step.label}
              </span>
              <span className="sr-only">
                {isComplete ? "Completed: " : isCurrent ? "Current step: " : "Upcoming: "}
                {step.label}
              </span>
            </div>

            {!isLast ? (
              <div className="mx-2 h-0.5 flex-1 overflow-hidden rounded-full bg-surface-secondary sm:mx-3">
                <motion.div
                  initial={false}
                  animate={{ width: isComplete ? "100%" : "0%" }}
                  transition={{ duration: prefersReducedMotion ? 0 : DURATION.normal }}
                  className="h-full bg-primary"
                />
              </div>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
