/**
 * Shared navigation data for DESIGNSYS-03's nav shell.
 *
 * Route provenance, since not every path is equally well-documented:
 * - /dashboard, /chat, /profile — literal routes in
 *   INFORMATION_ARCHITECTURE.md's Authenticated Routes table.
 * - /trips, /saved — INFORMATION_ARCHITECTURE.md's Trips section
 *   ("/trips") and Dashboard Sections ("Saved Trips"); "/saved" is the
 *   natural slug for the latter, not a literally spelled-out route in
 *   the IA table — flagged, not fabricated functionality.
 * - /notifications, /settings, /help — APPLICATION_LAYOUT_GUIDE.md's
 *   own sitemap and "# Notifications Page" / "# Settings" / "# Help
 *   Center" sections describe these as real, but IA's route table only
 *   gives a nested "/profile/settings", not a top-level "/settings".
 *   Layout Guide's Sidebar list treats Settings as a peer of Profile,
 *   not nested under it, so this file follows Layout Guide (the doc
 *   this task is actually built from) for the slug and flags the IA
 *   inconsistency rather than silently picking one with no note —
 *   worth a documentation amendment, not a DESIGNSYS-03 decision.
 *
 * All routes below will 404 until their owning WBS task ships the
 * page (DASH-01, PROF-03, CHAT-01, etc.) — that is expected, ordinary
 * incremental build-out, not broken navigation. AUTH-01's own
 * register route shipped the same way, before AUTH-01 existed.
 */

import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Map,
  MessageCircle,
  Bookmark,
  Bell,
  User,
  Settings,
  HelpCircle,
} from "lucide-react";

export interface NavItem {
  /** Key into the "Navigation" messages namespace. */
  labelKey: string;
  href: string;
  icon: LucideIcon;
}

/** Full authenticated nav — Sidebar's complete list (26 §Sidebar). */
export const APP_NAV_ITEMS: readonly NavItem[] = [
  { labelKey: "dashboard", href: "/dashboard", icon: LayoutDashboard },
  { labelKey: "trips", href: "/trips", icon: Map },
  { labelKey: "chat", href: "/chat", icon: MessageCircle },
  { labelKey: "saved", href: "/saved", icon: Bookmark },
  { labelKey: "notifications", href: "/notifications", icon: Bell },
  { labelKey: "profile", href: "/profile", icon: User },
  { labelKey: "settings", href: "/settings", icon: Settings },
  { labelKey: "help", href: "/help", icon: HelpCircle },
] as const;

/**
 * Mobile bottom nav — exactly 5 items, the documented maximum
 * (26 §Mobile Navigation: "Maximum: Five items").
 */
export const MOBILE_BOTTOM_NAV_ITEMS: readonly NavItem[] = [
  { labelKey: "dashboard", href: "/dashboard", icon: LayoutDashboard },
  { labelKey: "trips", href: "/trips", icon: Map },
  { labelKey: "chat", href: "/chat", icon: MessageCircle },
  { labelKey: "notifications", href: "/notifications", icon: Bell },
  { labelKey: "profile", href: "/profile", icon: User },
] as const;

/**
 * Authenticated header nav (26 §Header Navigation "Authenticated:
 * Dashboard, Trips, AI Chat, Saved") — a shorter set than the Sidebar's
 * full list, matching the doc's own distinction between the two.
 */
export const APP_HEADER_NAV_ITEMS: readonly NavItem[] = [
  { labelKey: "dashboard", href: "/dashboard", icon: LayoutDashboard },
  { labelKey: "trips", href: "/trips", icon: Map },
  { labelKey: "chat", href: "/chat", icon: MessageCircle },
  { labelKey: "saved", href: "/saved", icon: Bookmark },
] as const;

/**
 * Marketing header nav (26 §Header Navigation "Landing: Home, Discover,
 * AI Assistant, Features, FAQ"). Home links to the real route; the rest
 * are same-page anchors into sections LAND-01/02 haven't built yet
 * (COMPONENT_INVENTORY.md §Landing Page lists FAQSection, AIShowcase,
 * etc. as same-page sections, not separate routes). An anchor to an
 * ID that doesn't exist yet is an inert no-op, not a broken link —
 * real targets land with LAND-01/02, which owns that content.
 */
export interface MarketingNavItem {
  labelKey: string;
  href: string;
}

export const MARKETING_NAV_ITEMS: readonly MarketingNavItem[] = [
  { labelKey: "discover", href: "#discover" },
  { labelKey: "aiAssistant", href: "#ai-assistant" },
  { labelKey: "features", href: "#features" },
  { labelKey: "faq", href: "#faq" },
] as const;
