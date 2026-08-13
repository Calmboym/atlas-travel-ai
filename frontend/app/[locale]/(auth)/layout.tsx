import Link from "next/link";

/**
 * Authentication Layout (26_APPLICATION_LAYOUT_GUIDE.md):
 * Minimal Header -> Centered Card -> Footer.
 * Desktop: Two Columns (Illustration, Form). Mobile: Single column.
 * Maximum form width: 480px.
 *
 * Shared by every route under app/(auth)/ — register (this task),
 * login/forgot-password/verify-email (later AUTH tasks reuse this
 * file rather than rebuilding it).
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="flex h-16 items-center px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="rounded-lg text-lg font-bold tracking-tight text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          Atlas
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid w-full max-w-5xl items-center gap-10 lg:grid-cols-2">
          <AuthIllustration />

          <div className="mx-auto w-full max-w-[480px]">
            <div className="atlas-glass-2 rounded-2xl p-6 shadow-sm sm:p-8">
              {children}
            </div>
          </div>
        </div>
      </main>

      <footer className="px-4 py-6 text-center text-sm text-text-muted sm:px-6 lg:px-8">
        <p>
          © {new Date().getFullYear()} Atlas.{" "}
          <Link
            href="/privacy"
            className="underline-offset-2 hover:text-text-secondary hover:underline"
          >
            Privacy
          </Link>{" "}
          ·{" "}
          <Link
            href="/terms"
            className="underline-offset-2 hover:text-text-secondary hover:underline"
          >
            Terms
          </Link>
        </p>
      </footer>
    </div>
  );
}

/**
 * Abstract "connected route" motif — original, generated composition
 * (no external asset, no copied artwork). Matches ICONOGRAPHY_AND_
 * ILLUSTRATION.md §AI Visual Language preferred concepts ("Light,
 * Constellation, Path, Connection, Abstract orbit, Travel route") and
 * avoids the forbidden concepts (no robot/mascot/human avatar). Hidden
 * below `lg` per the layout's documented mobile behavior (single
 * column — the illustration is decorative, not load-bearing content).
 */
function AuthIllustration() {
  return (
    <div
      aria-hidden="true"
      className="hidden lg:flex lg:items-center lg:justify-center"
    >
      <svg
        viewBox="0 0 320 320"
        className="h-auto w-full max-w-sm text-primary"
        fill="none"
      >
        <defs>
          <linearGradient id="atlas-route" x1="0" y1="0" x2="320" y2="320">
            <stop offset="0%" stopColor="var(--atlas-primary-500)" />
            <stop offset="100%" stopColor="var(--atlas-primary-700)" />
          </linearGradient>
        </defs>
        <path
          d="M40 260 C 90 200, 120 140, 100 80 S 200 40, 220 100 S 300 160, 280 220"
          stroke="url(#atlas-route)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="1 10"
        />
        {[
          [40, 260],
          [100, 80],
          [220, 100],
          [280, 220],
        ].map(([cx, cy], index) => (
          <circle
            key={`${cx}-${cy}`}
            cx={cx}
            cy={cy}
            r={index === 1 ? 7 : 5}
            fill="var(--atlas-primary-500)"
            opacity={0.9 - index * 0.12}
          />
        ))}
      </svg>
    </div>
  );
}
