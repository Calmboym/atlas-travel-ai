"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { CheckCircle2, Info, AlertTriangle, AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * Toast Contract (DESIGN_TOKENS.md Part 6, verbatim): max-width 420px,
 * radius 20px, Glass Level 2, shadow-md, auto-hide 5s, pause on hover.
 * ACCESSIBILITY.md §Toast Notifications: "Never disappear too quickly.
 * Minimum: 5 seconds. Pause on hover. Accessible announcement required"
 * — Radix's Toast handles the pause-on-hover/focus and live-region
 * announcement natively; this wrapper supplies duration + appearance.
 *
 * Icon+color pairing follows the same rule as Alert (never color
 * alone) — same variant set, same icon map.
 */
type ToastVariant = "info" | "success" | "warning" | "error";

interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: (input: Omit<ToastItem, "id">) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

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

/** Wrap the app once, like ThemeProvider/TooltipProvider. */
export function ToastRoot({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback((input: Omit<ToastItem, "id">) => {
    const id = crypto.randomUUID();
    setToasts((current) => [...current, { ...input, id }]);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const value = useMemo<ToastContextValue>(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      <ToastPrimitive.Provider duration={5000} swipeDirection="right">
        {children}
        {toasts.map(({ id, title, description, variant }) => {
          const Icon = iconMap[variant];
          return (
            <ToastPrimitive.Root
              key={id}
              onOpenChange={(open) => {
                if (!open) dismiss(id);
              }}
              className={cn(
                "atlas-glass-2 flex w-full max-w-[420px] items-start gap-3 rounded-[20px] p-4 shadow-md",
                "data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom-2 data-[state=open]:fade-in",
                "data-[state=closed]:animate-out data-[state=closed]:fade-out",
                "data-[swipe=end]:animate-out",
              )}
            >
              <Icon
                className={cn("h-5 w-5 shrink-0", iconColorMap[variant])}
                aria-hidden="true"
              />
              <div className="flex-1">
                <ToastPrimitive.Title className="text-sm font-semibold text-text-primary">
                  {title}
                </ToastPrimitive.Title>
                {description ? (
                  <ToastPrimitive.Description className="mt-0.5 text-sm text-text-secondary">
                    {description}
                  </ToastPrimitive.Description>
                ) : null}
              </div>
              <ToastPrimitive.Close
                aria-label="Dismiss"
                className="shrink-0 rounded-full p-1 text-text-muted hover:bg-surface-secondary hover:text-text-primary"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </ToastPrimitive.Close>
            </ToastPrimitive.Root>
          );
        })}
        <ToastPrimitive.Viewport className="fixed bottom-6 right-6 z-toast flex w-full max-w-[420px] flex-col gap-3 outline-none" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within <ToastRoot>");
  }
  return ctx;
}
