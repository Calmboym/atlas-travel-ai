// app/[locale]/layout.tsx
//
// This is the application's single root layout — the only file that
// renders <html>/<body>. It previously coexisted with a separate,
// non-locale-aware app/layout.tsx (added during DESIGNSYS-01 to carry
// ThemeProvider, font loading, and the no-flash theme script). Because
// every real route lives under app/[locale]/..., Next.js nested that
// second <html>/<body> pair inside this one at runtime — confirmed via
// an actual production build + live server response, not assumed:
// curling /en showed two <html> elements and two <body> elements in
// the served markup, with the OUTER pair permanently `lang="en"` and
// no `dir` attribute regardless of locale. Since browsers only
// reliably treat the outermost <html> as canonical, this silently
// broke RTL for /fa. Fixed here by merging DESIGNSYS-01's theme/font
// additions into this file — the correct, locale-aware place for them
// — and removing the now-redundant app/layout.tsx. Full writeup in the
// reconciliation report.
//
// WHY THIS EXISTS: Next.js App Router requires a root layout to
// render anything at all; without one, `pnpm dev` cannot serve a
// page. The [locale] segment is required by next-intl's routing
// (i18n/routing.ts) for per-locale rendering to resolve.
//
// DOCUMENTATION JUSTIFYING IT: RTL for the fa locale is DOCUMENTED —
// DEBUG_LOG.md: "FA (RTL)"; ACCESSIBILITY.md / RESPONSIVE_SYSTEM.md
// both require correct LTR/RTL handling generally. The no-flash theme
// script and ThemeProvider are DESIGNSYS-01 deliverables (DESIGN_
// TOKENS.md Part 5 "Runtime Theme Switching": <150ms, no flash). Font
// loading via @fontsource (not next/font/google) is a documented
// environment constraint — next/font/google is blocked at build time
// in this sandboxed environment.
//
// STATUS (corrected 2026-08-16, Governance Reconciliation — this
// header was stale, describing the app shell as unbuilt while the
// code below already had it wired in): root-level providers and
// global chrome are complete. ThemeProvider (DESIGNSYS-01),
// MotionProvider + BackgroundSystem (DESIGNSYS-04), and
// TooltipProvider + SkipLink (DESIGNSYS-03) are all mounted here —
// see the inline comment at the JSX below for what each one is and
// why it lives at this level. Page-level composition (Navbar/Footer
// via MarketingLayout/ApplicationLayout, actual page content) is
// still owned by each route's own layout/page — see
// .ai/COMPONENT_OWNERSHIP_MATRIX.md for what exists where.
//
// PREVIOUSLY: this file was a bootstrap placeholder pointing at
// DESIGNSYS-03/LAND-01 as "expected to change it." Both DESIGNSYS-03
// and DESIGNSYS-04 have since shipped (.ai/TASK_BOARD.md) and their
// additions are reflected below. LAND-01 (real marketing page
// content) has not started and remains a future task.

import type { Metadata } from "next";
import type { ReactNode } from "react";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import "@fontsource/plus-jakarta-sans/400.css";
import "@fontsource/plus-jakarta-sans/500.css";
import "@fontsource/plus-jakarta-sans/600.css";
import "@fontsource/plus-jakarta-sans/700.css";
import { routing } from "@/i18n/routing";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { MotionProvider } from "@/components/providers/motion-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SkipLink } from "@/components/layout/skip-link";
import { BackgroundSystem } from "@/components/ui/background-system";
import { getThemeScript } from "@/lib/theme/theme-script";
import "../globals.css";

export const metadata: Metadata = {
  title: "Atlas — AI Travel Platform",
  description:
    "Atlas is an intelligent travel companion that helps you plan, prepare, and travel with confidence.",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // DOCUMENTED: fa is RTL (DEBUG_LOG.md: "FA (RTL)").
  const dir = locale === "fa" ? "rtl" : "ltr";

  return (
    // suppressHydrationWarning is required here, not optional: the
    // blocking script below sets `data-theme` on this element before
    // React hydrates, so server and client markup legitimately differ
    // on that one attribute. This is the standard, narrowly-scoped fix
    // for that specific, expected mismatch — nothing else is suppressed.
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <head>
        {/* Must run before first paint to avoid a flash of the wrong
            theme — see lib/theme/theme-script.ts for why this can't be
            a regular React effect. */}
        <script dangerouslySetInnerHTML={{ __html: getThemeScript() }} />
      </head>
      <body>
        <ThemeProvider>
          <MotionProvider>
            <NextIntlClientProvider>
              {/*
                TooltipProvider (DESIGNSYS-03 addition): DESIGNSYS-02
                built Tooltip/TooltipProvider but never mounted the
                Provider anywhere in the running app — confirmed it only
                ever appeared inside its own isolated component test.
                Sidebar (DESIGNSYS-03) is the first real page-level
                consumer, so it's mounted here once, app-wide, matching
                this file's existing "wrap the app once" pattern for
                ThemeProvider. A pre-existing gap found and fixed, not
                new application behavior.

                SkipLink (ACCESSIBILITY.md §Skip Links): a genuinely
                global, layout-agnostic concern — rendered once here so
                every layout (Marketing/Application/Focus/Auth) gets it
                automatically rather than each needing to remember it.

                BackgroundSystem (DESIGNSYS-04): the fixed, decorative
                noise-texture layer sits outside TooltipProvider/
                SkipLink entirely — it's inert (aria-hidden,
                pointer-events-none, -z-10) and belongs at the true
                root of the visual stack per DESIGN_TOKENS.md's Layer
                Hierarchy, not nested inside any interactive-machinery
                provider.

                MotionProvider (DESIGNSYS-04): wraps ThemeProvider's
                children, matching the same "wrap the app once" shape
                — every `motion.*` component anywhere below this line,
                including inside ThemeProvider's own theme-transition
                CSS handling (which is class-based, not Framer Motion,
                so unaffected either way), now automatically respects
                `prefers-reduced-motion` via Framer Motion's own
                <MotionConfig reducedMotion="user">.
              */}
              <BackgroundSystem />
              <TooltipProvider>
                <SkipLink />
                {children}
              </TooltipProvider>
            </NextIntlClientProvider>
          </MotionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
