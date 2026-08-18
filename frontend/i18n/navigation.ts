// i18n/navigation.ts
//
// WHY THIS EXISTS: none of DESIGNSYS-01/02 needed locale-aware internal
// navigation (Button/Card/etc. are generic; AUTH-01's AuthLayout links
// to "/" and "/privacy" with a plain next/link, which resolves correctly
// but doesn't preserve the current locale on click — see
// .ai/ATLAS-BOOTSTRAP-IMPLEMENTATION-REPORT.md-adjacent finding, noted
// but out of scope to change here since AuthLayout is AUTH-01's file).
// DESIGNSYS-03 is the first task whose components need this: the
// LanguageSwitcher must switch locale while staying on the same page
// (USER_FLOWS.md Flow 15 "Stay On Same Page ↓ Preserve Context"), and
// every Navbar/Sidebar/MobileBottomNav link must keep the active locale.
//
// DOCUMENTED: the requirement itself (Flow 15) is documented. The
// `createNavigation` call shape is RECONSTRUCTED, framework-necessary —
// next-intl's own required API for locale-aware App Router navigation,
// not an Atlas-specific decision, exactly like i18n/routing.ts's
// `defineRouting` call before it.
//
// STATUS: DESIGNSYS-03 infrastructure. Minimal — re-exports only, no
// business logic.

import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
