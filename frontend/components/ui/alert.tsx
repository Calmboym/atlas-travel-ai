import { type HTMLAttributes } from "react";
import { CheckCircle2, Info, AlertTriangle, AlertCircle } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

/**
 * ACCESSIBILITY.md §Color Independence: "Never communicate using color
 * alone. Example: Red error + Error icon + Message." Every variant
 * pairs a distinct icon with its color, never color by itself. Uses the
 * `-tint`/`-strong` semantic pairs already established for error in
 * DESIGNSYS-01's globals.css (light-tinted background, strong-shade
 * text/icon, both AA-checked there) — success/warning/info don't have
 * their own tint/strong pairs yet (only a single mid-shade token each),
 * so those three variants use the base semantic color at reduced
 * opacity for the background instead of inventing new tint tokens.
 */
const alertVariants = cva(
  "flex items-start gap-3 rounded-xl border p-4 text-sm leading-normal",
  {
    variants: {
      variant: {
        info: "border-info/20 bg-info/10 text-text-primary",
        success: "border-success/20 bg-success/10 text-text-primary",
        warning: "border-warning/20 bg-warning/10 text-text-primary",
        error: "border-error/20 bg-error-tint text-text-primary",
      },
    },
    defaultVariants: { variant: "info" },
  },
);

const iconMap = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertCircle,
} as const;

const iconColorMap = {
  info: "text-info",
  success: "text-success",
  warning: "text-warning",
  error: "text-error-strong",
} as const;

export interface AlertProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title?: string;
}

export function Alert({
  variant = "info",
  title,
  className,
  children,
  ...props
}: AlertProps) {
  const resolvedVariant = variant ?? "info";
  const Icon = iconMap[resolvedVariant];
  return (
    <div
      role={resolvedVariant === "error" ? "alert" : "status"}
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      <Icon
        className={cn("h-5 w-5 shrink-0", iconColorMap[resolvedVariant])}
        aria-hidden="true"
      />
      <div>
        {title ? <p className="font-semibold">{title}</p> : null}
        <div className={title ? "mt-0.5 text-text-secondary" : undefined}>
          {children}
        </div>
      </div>
    </div>
  );
}
