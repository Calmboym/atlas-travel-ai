"use client";

import { useId, type DragEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Shared FileUpload — first built here (ATLAS-P1-PROF-03), per
 * COMPONENT_OWNERSHIP_MATRIX.md §4 ("FileUpload, ImageUpload | PROF-03
 * (avatar) first; Phase 2+ (Documents)"). Generic drag/click file
 * picker with no image-specific behavior (no preview, no aspect
 * ratio) — that lives in ImageUpload, built on top of this one. Kept
 * separate so a future Documents task (Trip Details §Documents) can
 * reuse this same base for non-image files without inheriting
 * ImageUpload's preview assumptions.
 *
 * COMPONENT_INVENTORY.md §Inputs lists FileUpload as its own entry,
 * distinct from ImageUpload — this mirrors that split.
 *
 * Uses a native <label htmlFor> association with the real (visually
 * hidden, but still keyboard/screen-reader operable) <input
 * type="file"> — not a custom role="button" wrapper around it. The
 * first draft of this component did exactly that, which left two
 * independently focusable elements for one logical control (a real
 * accessibility bug, caught before this ever shipped): the label
 * approach is both less code and more correct, since the browser
 * already handles activation/keyboard/focus semantics for free.
 */
export interface FileUploadProps {
  accept?: string;
  maxSizeBytes?: number;
  onFileSelected: (file: File) => void;
  onError?: (message: string) => void;
  disabled?: boolean;
  label: string;
  hint?: string;
  children?: ReactNode;
  className?: string;
}

export function FileUpload({
  accept,
  maxSizeBytes,
  onFileSelected,
  onError,
  disabled,
  label,
  hint,
  children,
  className,
}: FileUploadProps) {
  const inputId = useId();

  function validateAndEmit(file: File | undefined) {
    if (!file) return;
    if (maxSizeBytes && file.size > maxSizeBytes) {
      onError?.(hint ?? "That file is too large.");
      return;
    }
    onFileSelected(file);
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    if (disabled) return;
    validateAndEmit(event.dataTransfer.files?.[0]);
  }

  return (
    <label
      htmlFor={inputId}
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleDrop}
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-surface-secondary p-6 text-center transition-colors",
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:border-primary/60",
        "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary has-[:focus-visible]:ring-offset-2",
        className,
      )}
    >
      <input
        id={inputId}
        type="file"
        accept={accept}
        disabled={disabled}
        aria-label={label}
        onChange={(event) => validateAndEmit(event.target.files?.[0])}
        className="sr-only"
      />
      {children ?? (
        <>
          <span className="text-sm font-medium text-text-primary">{label}</span>
          {hint ? <span className="text-xs text-text-muted">{hint}</span> : null}
        </>
      )}
    </label>
  );
}
