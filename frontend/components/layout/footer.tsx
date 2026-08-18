import { Link } from "@/i18n/navigation";

export interface FooterProps {
  variant?: "marketing" | "minimal";
}

const LEGAL_LINKS = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
] as const;

export function Footer({ variant = "minimal" }: FooterProps) {
  const year = new Date().getFullYear();

  if (variant === "minimal") {
    return (
      <footer className="border-t border-border px-4 py-6 text-center text-sm text-text-muted sm:px-6 lg:px-8">
        <p>
          © {year} Atlas.{" "}
          {LEGAL_LINKS.map((link, index) => (
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

  return (
    <footer className="border-t border-border">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <span className="text-lg font-bold tracking-tight text-text-primary">
            Atlas
          </span>
          <p className="mt-2 max-w-xs text-sm text-text-muted">
            Your intelligent travel companion — before, during, and after
            every journey.
          </p>
        </div>

        <FooterColumn
          title="Company"
          links={[
            { href: "/about", label: "About" },
            { href: "/contact", label: "Contact" },
          ]}
        />

        <FooterColumn
          title="Legal"
          links={[
            { href: "/privacy", label: "Privacy" },
            { href: "/terms", label: "Terms" },
            { href: "/cookies", label: "Cookies" },
          ]}
        />
      </div>

      {/* Product / Resources / Newsletter / Social Links sections
          (26 §Footer §Landing Footer Sections) are intentionally not
          built here — they're Landing-specific marketing content
          (real feature names, real social profile URLs, a working
          newsletter integration), owned by LAND-01 per
          COMPONENT_OWNERSHIP_MATRIX.md's Foundation/Feature split.
          Inventing placeholder feature names or unwired social links
          here would be exactly the "arbitrary placeholder UI" this
          task is instructed to avoid. This shell renders correctly
          and completely on its own in the meantime. */}

      <div className="border-t border-border px-4 py-6 text-center text-sm text-text-muted sm:px-6 lg:px-8">
        © {year} Atlas. All rights reserved.
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
