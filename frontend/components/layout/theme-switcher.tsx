"use client";

import { Monitor, Moon, Sun, type LucideIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils/cn";
import {
  useTheme,
  type ThemeSetting,
} from "@/components/providers/theme-provider";

const THEME_OPTIONS: ReadonlyArray<{
  value: ThemeSetting;
  label: string;
  icon: LucideIcon;
}> = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

/**
 * DESIGN_TOKENS.md Part 5 §Theme Structure: Light / Dark / System,
 * "Theme switching is instant. No layout shift is permitted." The
 * actual switch/transition timing is handled by ThemeProvider itself
 * (DESIGNSYS-01) — this component only ever calls `setTheme`.
 */
export function ThemeSwitcher() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const CurrentIcon =
    THEME_OPTIONS.find((option) => option.value === theme)?.icon ?? Monitor;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Theme: ${theme}. Currently showing ${resolvedTheme}. Open theme menu.`}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-surface-secondary hover:text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <CurrentIcon className="h-5 w-5" aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-44 !p-1.5"
        role="menu"
        aria-label="Theme"
      >
        {THEME_OPTIONS.map(({ value, label, icon: Icon }) => {
          const active = theme === value;
          return (
            <button
              key={value}
              type="button"
              role="menuitemradio"
              aria-checked={active}
              onClick={() => setTheme(value)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start text-sm font-medium transition-colors hover:bg-surface-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                active ? "text-primary" : "text-text-primary",
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}
