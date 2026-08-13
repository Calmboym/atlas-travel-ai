import type { Metadata } from "next";
import "@fontsource/plus-jakarta-sans/400.css";
import "@fontsource/plus-jakarta-sans/500.css";
import "@fontsource/plus-jakarta-sans/600.css";
import "@fontsource/plus-jakarta-sans/700.css";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { getThemeScript } from "@/lib/theme/theme-script";

export const metadata: Metadata = {
  title: "Atlas — AI Travel Platform",
  description:
    "Atlas is an intelligent travel companion that helps you plan, prepare, and travel with confidence.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // suppressHydrationWarning is required here, not optional: the
    // blocking script below sets `data-theme` on this element before
    // React hydrates, so server and client markup legitimately differ
    // on that one attribute. This is the standard, narrowly-scoped fix
    // for that specific, expected mismatch — nothing else is suppressed.
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Must run before first paint to avoid a flash of the wrong
            theme — see lib/theme/theme-script.ts for why this can't be
            a regular React effect. */}
        <script
          dangerouslySetInnerHTML={{ __html: getThemeScript() }}
        />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
