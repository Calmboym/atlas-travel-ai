"use client";

import { useEffect, useState } from "react";
import { Camera } from "lucide-react";
import { Avatar } from "@/components/ui/avatar-badge";
import { FileUpload } from "@/components/ui/file-upload";
import { cn } from "@/lib/utils/cn";

const MAX_AVATAR_BYTES = 5 * 1024 * 1024; // 5MB — not documented anywhere
// (no upload provider is documented at all — see module docstring),
// chosen as a conventional, generous-but-not-unbounded avatar limit.

/**
 * Shared ImageUpload — ATLAS-P1-PROF-03, built on the FileUpload
 * primitive. Avatar-focused: circular preview matching Avatar's own
 * Contract (COMPONENT_INVENTORY.md §User), camera-icon affordance.
 *
 * Only ever produces a local, in-memory object URL preview — there is
 * NO object-storage endpoint anywhere in this repository to upload the
 * actual bytes to. ARCHITECTURE.md §11's External Provider list has no
 * image/file storage entry, and no other document names one. This is
 * the same class of documented gap ATLAS-P1-AUTH-04 already hit for
 * email delivery (no SMTP provider documented -> stubbed, reported,
 * not invented) and ATLAS-P1-AUTH-03 for OAuth (no client
 * ID/secret -> stubbed, reported). Consistent with that precedent:
 * the component is fully real and working up to the boundary of the
 * missing piece — file picking, validation, and preview all genuinely
 * work — and `onFileSelected` hands the caller a real `File`, but
 * ProfilePageContent (this same task's consumer) does not pretend to
 * persist it; see that component's own note.
 */
export interface ImageUploadProps {
  currentImageUrl?: string | null;
  fallbackInitials?: string;
  onFileSelected: (file: File, previewUrl: string) => void;
  onError?: (message: string) => void;
  label: string;
  hint?: string;
  disabled?: boolean;
}

export function ImageUpload({
  currentImageUrl,
  fallbackInitials,
  onFileSelected,
  onError,
  label,
  hint,
  disabled,
}: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Revoke the object URL when replaced or unmounted — otherwise every
  // selected file leaks memory for the lifetime of the tab.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function handleFileSelected(file: File) {
    if (!file.type.startsWith("image/")) {
      onError?.(hint ?? "Please choose an image file.");
      return;
    }
    const nextPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl((existing) => {
      if (existing) URL.revokeObjectURL(existing);
      return nextPreviewUrl;
    });
    onFileSelected(file, nextPreviewUrl);
  }

  const displayedUrl = previewUrl ?? currentImageUrl ?? undefined;

  return (
    <FileUpload
      accept="image/*"
      maxSizeBytes={MAX_AVATAR_BYTES}
      onFileSelected={handleFileSelected}
      onError={onError}
      disabled={disabled}
      label={label}
      hint={hint}
      className="!flex-row !items-center gap-4 !p-3 w-fit !rounded-full border-none bg-transparent hover:!border-none"
    >
      <div className={cn("relative", disabled && "opacity-60")}>
        <Avatar size={96} src={displayedUrl} initials={fallbackInitials} alt="" />
        <span className="absolute bottom-0 end-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-on-primary shadow-sm">
          <Camera className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
      <span className="text-sm font-medium text-primary">{label}</span>
    </FileUpload>
  );
}
