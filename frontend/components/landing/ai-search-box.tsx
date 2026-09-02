"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useReducedMotion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils/cn";
import {
  EXAMPLE_PROMPT_COUNT,
  PROMPT_ROTATION_INTERVAL_MS,
} from "@/components/landing/example-prompts";

/**
 * ATLAS-P1-LAND-02 — AI search box + rotating example prompts.
 *
 * Contract: DESIGN_TOKENS.md Part 6 §Landing Search (Height 64px,
 * Radius Full, Glass Level 2, Shadow shadow-md, Leading Icon AI) — a
 * more specific contract than the generic Foundation `SearchInput`
 * (§Search Box Contract: 56px, bordered surface, plain Search icon),
 * so this composes the same primitives (glass utility, Atlas tokens)
 * at the Landing-specific geometry rather than reshaping the shared
 * Foundation component to fit one page's contract. Consistent with
 * INFORMATION_ARCHITECTURE.md: "No traditional search page... Natural
 * language is the only search interface. Users never need filters
 * before the first result" — no filter affordance exists here.
 *
 * Submission: CHAT-01/03/04 (the real chat surface and its backend)
 * don't exist yet in this repository. Submitting here therefore
 * navigates to `/chat?prompt=<text>` — a real, working, locale-aware
 * navigation (not a stub) that hands the typed prompt to whichever
 * task builds `/chat` next, the same "wire the entry point, the
 * destination catches up" pattern already established for AUTH-08's
 * route guards and every nav-items.ts link. `/chat` is confirmed
 * guest-accessible (not in `PROTECTED_PATH_SEGMENTS`), so this never
 * hits a registration wall, per USER_FLOWS.md Flow 02.
 */
export function AISearchBox() {
  const t = useTranslations("HomePage.hero");
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const inputId = useId();
  const [value, setValue] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // ONBOARDING_EXPERIENCE.md §Initial AI Prompt: "Examples rotate
  // subtly without distracting the user." Reduced-motion preference
  // stops the rotation entirely (a single, stable example) rather
  // than just skipping the transition — a continuously auto-changing
  // placeholder is itself a form of motion this brand's calm identity
  // avoids for users who've asked for less of it.
  useEffect(() => {
    if (prefersReducedMotion) return;
    const timer = window.setInterval(() => {
      setPlaceholderIndex((current) => (current + 1) % EXAMPLE_PROMPT_COUNT);
    }, PROMPT_ROTATION_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [prefersReducedMotion]);

  const examplePrompts = t.raw("examplePrompts") as string[];
  const placeholder = examplePrompts[placeholderIndex] ?? examplePrompts[0];
  // A static, always-visible subset (not placeholder-dependent) so
  // keyboard and screen-reader users have a real interactive way to
  // explore examples, not just a rotating, inert placeholder string.
  const visibleChips = examplePrompts.filter((_, index) => index % 2 === 0);

  function submitPrompt(prompt: string) {
    const trimmed = prompt.trim();
    if (!trimmed) return;
    router.push(`/chat?prompt=${encodeURIComponent(trimmed)}`);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitPrompt(value);
  }

  return (
    <div className="w-full max-w-2xl">
      <form onSubmit={handleSubmit} role="search">
        <label htmlFor={inputId} className="sr-only">
          {t("searchLabel")}
        </label>
        <div className="atlas-glass-2 flex h-16 items-center gap-3 rounded-full px-3 shadow-md ps-6">
          <Sparkles
            className="h-5 w-5 shrink-0 text-primary"
            aria-hidden="true"
          />
          <input
            id={inputId}
            type="text"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder={placeholder}
            className={cn(
              "h-full flex-1 bg-transparent text-base text-text-primary outline-none",
              "placeholder:text-text-muted",
            )}
          />
          <button
            type="submit"
            disabled={value.trim().length === 0}
            aria-label={t("searchSubmit")}
            className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </form>

      <div
        className="mt-4 flex flex-wrap justify-center gap-2"
        aria-label={t("examplesLabel")}
      >
        {visibleChips.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => submitPrompt(prompt)}
            className="rounded-full border border-border bg-surface px-4 py-2 text-sm text-text-secondary transition-colors hover:bg-surface-secondary hover:text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}
