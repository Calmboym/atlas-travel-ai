"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { DURATION } from "@/lib/tokens/motion";

export interface FormErrorProps {
  /** Must match the input's aria-describedby target id. */
  id: string;
  message?: string;
}

/**
 * ACCESSIBILITY.md §Error Identification: "Errors use: Icon, Color,
 * Text, ARIA live announcement. Never color alone." Field-level errors
 * use aria-live="polite" (not role="alert"/assertive) — per
 * ACCESSIBILITY.md §Live Regions, assertive is reserved for critical
 * events; a per-field validation message on blur is routine, not
 * critical, and an assertive interruption for every field would be
 * disruptive while tabbing through the form.
 *
 * Animation: "Small fade. No shaking. No flashing." — 21_PREMIUM_
 * MICROINTERACTIONS.md §Error Feedback.
 */
export function FormError({ id, message }: FormErrorProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {message ? (
        <motion.p
          key={message}
          id={id}
          aria-live="polite"
          initial={prefersReducedMotion ? false : { opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={prefersReducedMotion ? undefined : { opacity: 0 }}
          transition={{ duration: DURATION.fast }}
          className="mt-1.5 flex items-center gap-1.5 text-sm leading-snug text-error-strong"
        >
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{message}</span>
        </motion.p>
      ) : null}
    </AnimatePresence>
  );
}
