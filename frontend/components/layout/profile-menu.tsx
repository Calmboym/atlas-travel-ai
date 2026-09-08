"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  LogOut,
  Settings as SettingsIcon,
  User as UserIcon,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar } from "@/components/ui/avatar-badge";
import { Link, useRouter } from "@/i18n/navigation";
import { getMeRequest } from "@/lib/api/auth";
import { getMyProfileRequest } from "@/lib/api/profile";
import { logoutRequest } from "@/lib/api/auth";

/**
 * ATLAS-P1-DASH-01 — ProfileMenu
 * (COMPONENT_OWNERSHIP_MATRIX.md §4: "PROF-03 or DASH-01, whichever
 * ships first" — PROF-03 explicitly deferred it, see
 * profile-page-content.tsx's own docstring: "it would need to link to
 * /trips, /saved, /dashboard, none of which existed yet." DASH-01
 * ships /dashboard, so it's the natural owner now). Fills Navbar's
 * `userSlot` (via app/[locale]/(app)/layout.tsx) —
 * APPLICATION_LAYOUT_GUIDE.md §User Menu: "Profile, Dashboard, My
 * Trips, Saved, Settings, Help, Logout." Only the routes that
 * actually exist today are included (Dashboard, Profile, Settings +
 * Logout) — My Trips/Saved/Help are real doc sections but no page
 * exists yet for any of them (same "wire it when the destination
 * exists" rule nav-items.ts's own docstring already established); a
 * dead link here would be worse than a shorter, honest menu.
 *
 * Fetches its own user/profile summary independently of any page
 * content (Navbar is mounted at the (app) layout level, a sibling of
 * — not a parent-with-shared-state to — page content like
 * DashboardPageContent, which needs the same data for its own
 * greeting). No shared cache exists yet (lib/api/client.ts's own
 * comment already anticipated this: "TanStack Query is a reasonable
 * addition whenever a future task actually needs query caching, e.g.
 * Dashboard data fetching" — now genuinely true) — introducing it is
 * a real architecture addition ARCHITECTURE.md §4 already approves in
 * principle but is out of this task's own scope to wire in; flagged
 * in the handoff rather than added silently.
 */
interface ProfileSummary {
  displayName: string | null;
  email: string;
  avatarUrl: string | null;
}

export function ProfileMenu() {
  const t = useTranslations("Shared.profileMenu");
  const tNav = useTranslations("Navigation");
  const router = useRouter();
  const [summary, setSummary] = useState<ProfileSummary | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getMeRequest(), getMyProfileRequest()])
      .then(([user, profile]) => {
        if (cancelled) return;
        setSummary({
          displayName: profile.full_name,
          email: user.email,
          avatarUrl: profile.avatar_url,
        });
      })
      .catch(() => {
        // Silent by design: this is a small header dropdown, not a
        // page — it still fully functions (fallback initials, every
        // navigation item, sign out) without the name/email/avatar,
        // and there's no reasonable place here for a RetryCard-style
        // recovery UI. DashboardPageContent's own fetch of the same
        // endpoints does surface a real error state for the page.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSignOut() {
    setIsSigningOut(true);
    try {
      await logoutRequest();
    } catch {
      // logoutRequest is idempotent on the backend (see its own
      // docstring) — even if this call itself failed (e.g. the
      // session had already expired), the person should still be
      // able to leave via the sign-out action rather than get stuck.
    } finally {
      router.push("/login");
    }
  }

  const initials = (
    summary?.displayName?.trim()?.[0] ??
    summary?.email[0] ??
    "?"
  ).toUpperCase();
  const triggerLabel = t("triggerLabel", {
    name: summary?.displayName ?? summary?.email ?? t("fallbackName"),
  });

  function closeMenu() {
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={triggerLabel}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <Avatar
            size={32}
            src={summary?.avatarUrl ?? undefined}
            initials={initials}
            alt=""
          />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 !p-1.5" aria-label={t("menuLabel")}>
        {summary ? (
          <div className="px-3 py-2.5">
            {summary.displayName ? (
              <p className="truncate text-sm font-semibold text-text-primary">
                {summary.displayName}
              </p>
            ) : null}
            <p className="truncate text-xs text-text-secondary">{summary.email}</p>
          </div>
        ) : null}

        <div aria-hidden="true" className="my-1 h-px bg-border" />

        <Link
          href="/dashboard"
          onClick={closeMenu}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-surface-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
          {tNav("dashboard")}
        </Link>
        <Link
          href="/profile"
          onClick={closeMenu}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-surface-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <UserIcon className="h-4 w-4" aria-hidden="true" />
          {tNav("profile")}
        </Link>
        <Link
          href="/settings"
          onClick={closeMenu}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-surface-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <SettingsIcon className="h-4 w-4" aria-hidden="true" />
          {tNav("settings")}
        </Link>

        <div aria-hidden="true" className="my-1 h-px bg-border" />

        <button
          type="button"
          onClick={handleSignOut}
          disabled={isSigningOut}
          aria-busy={isSigningOut || undefined}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start text-sm font-medium text-error-strong transition-colors hover:bg-error-tint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          {isSigningOut ? t("signingOut") : t("signOut")}
        </button>
      </PopoverContent>
    </Popover>
  );
}
