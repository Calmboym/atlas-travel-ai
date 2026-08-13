// app/[locale]/layout.tsx
//
// WHY THIS EXISTS: Next.js App Router requires a root layout to
// render anything at all; without one, `pnpm dev` cannot serve a
// page. The [locale] segment is required by next-intl's routing
// (i18n/routing.ts) for per-locale rendering to resolve.
//
// DOCUMENTATION JUSTIFYING IT: RTL for the fa locale is DOCUMENTED —
// DEBUG_LOG.md: "FA (RTL)"; ACCESSIBILITY.md / RESPONSIVE_SYSTEM.md
// both require correct LTR/RTL handling generally. The
// NextIntlClientProvider wiring is RECONSTRUCTED, framework-necessary
// (next-intl's own required App Router pattern).
//
// STATUS: bootstrap infrastructure / minimal placeholder. This is
// NOT the documented Application Layout (Global Header, Navigation,
// Footer, Search, Language/Theme Switcher — APPLICATION_LAYOUT_GUIDE.md
// §Global Header). None of that is built here; adding it would be
// implementing product UI, out of scope for a scaffold.
//
// EXPECTED TO CHANGE: this file is expected to be substantially
// rewritten by whichever task first implements the global application
// shell. No single WBS task currently owns "global shell" as its own
// item in WORK_BREAKDOWN_STRUCTURE.md — the closest existing tasks are
// ATLAS-P1-LAND-01 (marketing layout, public pages) and the
// Application Layout Guide's Authenticated Layout (Header/Sidebar),
// which has no dedicated WBS task yet either. Both gaps are recorded
// in .ai/MISSING_INFORMATION.md.

import type { Metadata } from "next";
import type { ReactNode } from "react";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import "../globals.css";

// RECONSTRUCTED placeholder metadata — not sourced from any document.
export const metadata: Metadata = {
  title: "Atlas",
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
    <html lang={locale} dir={dir}>
      <body>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
