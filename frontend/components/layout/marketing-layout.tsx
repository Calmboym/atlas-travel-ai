import type { ReactNode } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export interface MarketingLayoutProps {
  children: ReactNode;
}

/**
 * 26_APPLICATION_LAYOUT_GUIDE.md §Marketing Layout:
 *   Header ↓ Hero ↓ Content Sections ↓ CTA ↓ Footer
 *   Container: Max Width 1440px
 *
 * Header and Footer are this component's job. Hero/Content Sections/CTA
 * are page content (`children`) — LAND-01/02's Feature Components,
 * per COMPONENT_OWNERSHIP_MATRIX.md's Foundation/Feature split.
 */
export function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <Navbar variant="marketing" />
      <main id="main-content" className="flex-1">
        <div className="mx-auto max-w-[1440px]">{children}</div>
      </main>
      <Footer variant="marketing" />
    </div>
  );
}
