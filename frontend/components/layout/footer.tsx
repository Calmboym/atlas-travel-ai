"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export interface FooterProps {
  variant?: "marketing" | "minimal";
}

/**
 * Localization fix (ATLAS-P1-LAND-01): this previously hardcoded every
 * English string with no next-intl wiring at all — logged in
 * PROJECT_STATE.md as LAND-01's job.
 *
 * Client Component, not the async-Server-Component + `getTranslations`
 * pattern AuthLayout uses: tried that first here too, and it works
 * fine in the real app, but breaks *every existing test that renders
 * a layout containing Footer* — `tests/layouts.test.tsx`'s
 * MarketingLayout/ApplicationLayout tests call plain synchronous
 * `render()`, which cannot await a component nested arbitrarily deep
 * in the tree (only the component passed *directly* to `render()` can
 * be manually awaited first, which doesn't help an ancestor that
 * renders Footer as a normal JSX child). Confirmed by actually running
 * the full suite: `next build` succeeded and Footer's own test passed
 * with `getTranslations`, but `layouts.test.tsx` failed with an empty
 * render tree. `useTranslations` (this file) has none of that problem
 * — proven by every other static Landing component this task adds —
 * so it's the safer choice for a component many other things compose.
 */
export function Footer({ variant = "minimal" }: FooterProps) {
  const year = new Date().getFullYear();
  const t = useTranslations("Footer");
  const nav = useTranslations("Navigation");

  const legalLinks = [
    { href: "/privacy", label: t("legal.privacy") },
    { href: "/terms", label: t("legal.terms") },
  ] as const;

  if (variant === "minimal") {
    return (
      <footer className="border-t border-border px-4 py-6 text-center text-sm text-text-muted sm:px-6 lg:px-8">
        <p>
          {t("copyrightPrefix", { year })}{" "}
          {legalLinks.map((link, index) => (
            <span key={link.href}>
              {index > 0 ? " · " : ""}
              <Link
                href={link.href}
                className="underline-offset-2 hover:text-text-secondary hover:underline"
              >
                {link.label}
              </Link>
            </span>
          ))}
        </p>
      </footer>
    );
  }

  const productLinks = [
    { href: "#discover", label: nav("discover") },
    { href: "#ai-assistant", label: nav("aiAssistant") },
    { href: "#features", label: nav("features") },
    { href: "#faq", label: nav("faq") },
  ] as const;

  return (
    <footer className="border-t border-border">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="md:col-span-1">
          <span className="text-lg font-bold tracking-tight text-text-primary">
            Atlas
          </span>
          <p className="mt-2 max-w-xs text-sm text-text-muted">
            {t("tagline")}
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-text-primary">
            {t("product.title")}
          </h2>
          <ul className="mt-3 flex flex-col gap-2">
            {productLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-sm text-text-secondary transition-colors hover:text-text-primary"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <FooterColumn
          title={t("company.title")}
          links={[
            { href: "/about", label: t("company.about") },
            { href: "/contact", label: t("company.contact") },
          ]}
        />

        <FooterColumn
          title={t("legal.title")}
          links={[
            { href: "/privacy", label: t("legal.privacy") },
            { href: "/terms", label: t("legal.terms") },
            { href: "/cookies", label: t("legal.cookies") },
          ]}
        />
      </div>

      {/* Resources / Newsletter / Social Links sections
          (26 §Footer §Landing Footer Sections) remain intentionally
          not built: no real blog/help-center content, working
          newsletter integration, or social profile URLs exist yet to
          link honestly. Inventing placeholder feature names or unwired
          social links would be exactly the "arbitrary placeholder UI"
          this task is instructed to avoid. */}

      <div className="border-t border-border px-4 py-6 text-center text-sm text-text-muted sm:px-6 lg:px-8">
        {t("copyrightFull", { year })}
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: ReadonlyArray<{ href: string; label: string }>;
}) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
      <ul className="mt-3 flex flex-col gap-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-text-secondary transition-colors hover:text-text-primary"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
