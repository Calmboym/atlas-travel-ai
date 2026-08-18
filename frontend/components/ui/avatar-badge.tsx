import { type HTMLAttributes, type ImgHTMLAttributes, useState } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Avatar Contract (COMPONENT_INVENTORY.md §User): sizes 32/40/48/64/96,
 * radius full, optional border, status badge support. Falls back to
 * initials (never a broken-image icon) if the image fails to load or
 * none is given — ICONOGRAPHY_AND_ILLUSTRATION.md's "never misrepresent"
 * spirit applied to a missing photo, not just AI imagery.
 */
export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  size?: 32 | 40 | 48 | 64 | 96;
  src?: string;
  alt?: string;
  /** Shown when `src` is absent or fails to load. */
  initials?: string;
  status?: "online" | "offline" | "away";
  imgProps?: ImgHTMLAttributes<HTMLImageElement>;
}

const avatarSizeMap = {
  32: "h-8 w-8 text-xs",
  40: "h-10 w-10 text-sm",
  48: "h-12 w-12 text-base",
  64: "h-16 w-16 text-lg",
  96: "h-24 w-24 text-2xl",
} as const;

const statusColorMap = {
  online: "bg-success",
  offline: "bg-neutral-400",
  away: "bg-warning",
} as const;

export function Avatar({
  size = 48,
  src,
  alt = "",
  initials,
  status,
  className,
  imgProps,
  ...props
}: AvatarProps) {
  const [errored, setErrored] = useState(false);
  const showImage = src && !errored;

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-secondary font-semibold text-text-secondary",
        avatarSizeMap[size],
        className,
      )}
      {...props}
    >
      {showImage ? (
        // Plain <img>, not next/image: avatar sources are arbitrary/
        // user-provided, which doesn't fit next/image's static-domain
        // allowlisting.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          onError={() => setErrored(true)}
          {...imgProps}
        />
      ) : (
        <span aria-hidden={alt ? undefined : true}>{initials ?? "?"}</span>
      )}
      {status ? (
        <span
          className={cn(
            "absolute bottom-0 right-0 block rounded-full ring-2 ring-surface",
            statusColorMap[status],
            size <= 40 ? "h-2 w-2" : "h-3 w-3",
          )}
          aria-label={`Status: ${status}`}
        />
      ) : null}
    </span>
  );
}

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "neutral" | "primary" | "success" | "warning" | "error" | "info";
}

const badgeVariantMap = {
  neutral: "bg-surface-secondary text-text-secondary",
  primary: "bg-primary-tint text-primary-active",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  error: "bg-error-tint text-error-strong",
  info: "bg-info/10 text-info",
} as const;

export function Badge({
  variant = "neutral",
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium leading-normal",
        badgeVariantMap[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
