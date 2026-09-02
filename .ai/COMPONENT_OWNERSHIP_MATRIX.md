# COMPONENT_OWNERSHIP_MATRIX.md

**Project:** Atlas — AI Travel Platform
**Date:** 2026-07-29 · **Reconciled:** 2026-08-16 (Governance Reconciliation — §3 Foundation table corrected against the actual DESIGNSYS-01–04 baseline; see that section's own note) · **Annotated:** 2026-08-19 (AUTH-01 Audit & Bug Fix — added provenance notes to the `Label`, `AuthLayout`, and `Footer` rows; no classification, ownership, or dependency-direction changes) · **Updated:** 2026-08-25 (`ATLAS-P1-PROF-01`/`02`/`03`) — `RadioGroupItem` extended with a `card` variant; `StepIndicator`, `FileUpload`, `ImageUpload` built (Shared, §4); `ProfileMenu` explicitly deferred with rationale (§4); Profile-specific Feature Components added (§5). · **Extended:** 2026-08-22 (AUTH-02 through AUTH-05 — §5 Feature Component Matrix gains LoginForm, LoginPageContent, VerifyEmailContent, and OAuthButtons; no Foundation or Shared row touched, no dependency-direction changes) · **Extended:** 2026-08-24 (AUTH-06 through AUTH-08 — §5 gains ForgotPasswordForm, ForgotPasswordPageContent, ResetPasswordForm, ResetPasswordContent; no Foundation or Shared row touched — AUTH-07/AUTH-08 introduced no new UI components, only backend session/RBAC infrastructure and a frontend route-guard module that isn't itself a UI component) · **Updated:** 2026-08-29 (`ATLAS-P1-LAND-01`/`02`/`03`) — §5 Landing-specific row replaced with the actual, verified 11-component breakdown (the pre-LAND speculative row named `Testimonials`, never built, and was missing `HowItWorks`/`FeatureHighlights`/`FAQSection`/`CTASection`/`AISearchBox`/`GuestEntryCta`); §4 `AIQuickAccess` annotated with LAND-01's deliberate non-claim; §3 `Footer` row updated — localized, Product column added, AUTH-01-audit-flagged gap closed · **Updated:** 2026-09-01 (`ATLAS-P1-CHAT-01`/`02`) — §5 `Chat-specific` row moved from planned to delivered, with real file paths and two naming notes (`ConversationList`/`Item` ships as one `ConversationSidebar`, not two; `StreamingBubble` ships as a direct `MessageBubble` alias); §4 `AIQuickAccess` and `ConnectionStatus`/`RetryCard` both annotated with `CHAT-01`'s deliberate non-claim of either — no Foundation row touched
**Status:** APPROVED — 2026-08-13, by project owner, as part of the Bootstrap Reconciliation pass (`DESIGN_BIBLE_AMENDMENTS.md`, Amendment 006). Canonical and binding; `MASTER_RULES.md`, `CONVERSATION_STRATEGY.md`, `SESSION_PROMPT.md`, and `INDEX.md` all reference it as approved. The 2026-08-16 pass is a factual-accuracy correction, not a re-approval of the document's authority — its binding status is unchanged.
**Derived from:** `DESIGN_SYSTEM.md`, `COMPONENT_INVENTORY.md`, `DESIGN_TOKENS.md`, `APPLICATION_LAYOUT_GUIDE.md`, `FRONTEND_IMPLEMENTATION_GUIDELINES.md`, `MASTER_RULES.md`, `WORK_BREAKDOWN_STRUCTURE.md`, `DESIGNSYS_FOUNDATION_AUDIT_AND_WBS_PROPOSAL.md`, `DESIGNSYS_ARCHITECTURE_SPECIFICATION.md` (this project's own prior sessions). No architecture invented — see Part 4 findings in the accompanying chat message for the two ambiguities found while building this.

---

## 1. Purpose

- **Foundation Components exist** so that visual and interaction decisions already ratified in `DESIGN_TOKENS.md` and `DESIGN_SYSTEM.md` are implemented exactly once, not re-derived by every feature that needs a button.
- **Shared Components exist** because several features independently need the same composed behavior (search, notifications, filters) without each reinventing it — but the behavior isn't universal enough to belong in Foundation.
- **Feature Components exist** because business logic and data shape are specific to one part of the product (a `TripCard` knows about itineraries; nothing else should).
- **Reusable UI must never be recreated** because duplication is exactly how `DESIGN_TOKENS.md`'s token-only rule quietly erodes — a second hand-rolled `Button` is a second place hardcoded values creep in.
- **Ownership exists** so that when a future implementation session considers building a component, there is one place to check whether it already exists, who is allowed to touch it, and what it's allowed to depend on — before writing any code.

---

## 2. Component Categories

**Foundation Components** — created only by `DESIGNSYS` tasks. Reusable everywhere. No business logic. Depend only on Design Tokens and other Foundation components.

**Shared Components** — reusable, but not universal. Created by whichever WBS Task first needs them (recorded below as that component's Owner). May later be consumed by many other tasks. May depend on Foundation.

**Feature Components** — business-specific. Owned by exactly one WBS Task. Never reusable outside their intended feature without an explicit architectural amendment (same bar as a Design Bible change, per `DEVELOPMENT_EXECUTION_PLAN.md` §3). May depend on Foundation and Shared.

---

## 3. Foundation Component Matrix

**Reconciled 2026-08-16** (Governance Reconciliation session). Every row below was checked against the actual file in the supplied baseline — not inherited from the prior draft. The prior version of this table marked ~24 of the ~33 rows "Not built" for components that DESIGNSYS-02 had already shipped on 2026-07-29 (the day this document was first drafted, before that task's own output was folded back in). That failure mode — the one document whose entire purpose is preventing recreation, itself telling a future session a real component doesn't exist — is exactly what this pass corrects. A **Source File** column is added below so "where does it live" never again requires guessing.

**Default lifecycle (applies unless noted):** created by its `DESIGNSYS` task → immediately consumable by any task → extended only through documented variants, never forked → deprecation requires a `MASTER_RULES.md`-style amendment, not a unilateral decision inside an implementation session.
**Default dependencies (applies unless noted):** Design Tokens only.
**Default rule (applies unless noted):** must never be recreated; never duplicate its styling inside a Shared or Feature Component. All source paths below are relative to `frontend/` unless otherwise noted.

| Component(s) | Source File | Owner | Created By | Status | Consumed by | Notes |
|---|---|---|---|---|---|---|
| Container, Stack, Divider, Grid, Spacer | `components/ui/layout.tsx` | DESIGNSYS | `DESIGNSYS-02` | ✅ Built (2026-07-29) | All tasks | — |
| AppShell, Section, StickyArea, FloatingLayer, Portal | `components/ui/structural.tsx` | DESIGNSYS | `DESIGNSYS-02` | ✅ Built (2026-07-29) | All tasks | — |
| ScrollArea | `components/ui/scroll-area.tsx` | DESIGNSYS | `DESIGNSYS-02` | ✅ Built (2026-07-29) | All tasks | Radix-wrapped |
| ResizablePanelGroup (+ Panel/Handle) | `components/ui/resizable-panel.tsx` | DESIGNSYS | `DESIGNSYS-02` | ✅ Built (2026-07-29) | All tasks | — |
| AspectRatio, PageTransition · FadeIn, SlideIn, ScaleIn, ScrollReveal | `components/ui/motion-wrappers.tsx` | DESIGNSYS | AspectRatio/PageTransition: `DESIGNSYS-02` · FadeIn/SlideIn/ScaleIn/ScrollReveal: `DESIGNSYS-04` (added to the same file, 2026-08-16) | ✅ Built | Heaviest: LAND. Light-touch: all | The entrance wrappers (Fade/Slide/Scale/ScrollReveal) depend on MotionProvider |
| HeroText, DisplayText, Heading, Paragraph, Caption, Link, Code, Quote, List, BadgeText | `components/ui/typography.tsx` | DESIGNSYS | `DESIGNSYS-02` | ✅ Built (2026-07-29) | All tasks | — |
| Label | `components/ui/label.tsx` | DESIGNSYS | pre-dates DESIGNSYS | ✅ Built by `AUTH-01` | All tasks | Reconciled against DESIGNSYS-02, not rebuilt. **2026-08-19 (AUTH-01 audit):** required-asterisk fixed from physical `ml-0.5` to logical `ms-0.5` — RTL bug, see `PROJECT_STATE.md`. |
| Button — variants `primary`/`secondary`/`ghost`/`outline`/`text`/`danger`/`success`, size `icon` (= IconButton), `isLoading` (= LoadingButton) | `components/ui/button.tsx` | DESIGNSYS | Base: pre-dates DESIGNSYS (`AUTH-01`) · Variants: `DESIGNSYS-02` | ✅ Built | All tasks | **Variants are a `variant` CVA prop, not separate component exports** — use `<Button variant="secondary">`, never author a new component for a variant that already exists here |
| FloatingActionButton, SplitButton, DropdownButton | `components/ui/button-compound.tsx` | DESIGNSYS | `DESIGNSYS-02` | ✅ Built (2026-07-29) | All tasks | Compound components, built on `Button` |
| Input | `components/ui/input.tsx` | DESIGNSYS | pre-dates DESIGNSYS | ✅ Built by `AUTH-01` | All tasks | Reconciled against DESIGNSYS-02, not rebuilt |
| FormError | `components/ui/form-error.tsx` | DESIGNSYS | pre-dates DESIGNSYS | ✅ Built by `AUTH-01` | All tasks | Reconciled against DESIGNSYS-02, not rebuilt |
| Textarea | `components/ui/textarea.tsx` | DESIGNSYS | `DESIGNSYS-02` | ✅ Built (2026-07-29) | AUTH, PROF, DASH, CHAT | — |
| SearchInput | `components/ui/search-input.tsx` | DESIGNSYS | `DESIGNSYS-02` | ✅ Built (2026-07-29) | AUTH, PROF, DASH, CHAT | — |
| Select (+ Group/Value/Trigger/Content/Item) | `components/ui/select.tsx` | DESIGNSYS | `DESIGNSYS-02` | ✅ Built (2026-07-29) | AUTH, PROF, DASH, CHAT | Radix-wrapped |
| Checkbox | `components/ui/checkbox.tsx` | DESIGNSYS | `DESIGNSYS-02` | ✅ Built (2026-07-29) | AUTH, PROF, DASH, CHAT | Radix-wrapped |
| Switch | `components/ui/switch.tsx` | DESIGNSYS | `DESIGNSYS-02` | ✅ Built (2026-07-29) | AUTH, PROF, DASH, CHAT | Radix-wrapped |
| RadioGroup, RadioGroupItem | `components/ui/radio.tsx` | DESIGNSYS | `DESIGNSYS-02`; `card` variant added by `PROF-01` | ✅ Built (2026-07-29); extended 2026-08-25 | AUTH, PROF, DASH, CHAT | Radix-wrapped. `variant="circle"` (default, byte-identical to before) vs `variant="card"` (full clickable card with children — Profile Wizard's option pickers). Documented Extension per §7's Lifecycle table, not a fork. |
| Toast (ToastRoot + `useToast`) | `components/ui/toast.tsx` | DESIGNSYS | `DESIGNSYS-02` | ✅ Built (2026-07-29) | All tasks | — |
| Alert | `components/ui/alert.tsx` | DESIGNSYS | `DESIGNSYS-02` | ✅ Built (2026-07-29) | All tasks | — |
| Skeleton, Spinner | `components/ui/loading.tsx` | DESIGNSYS | `DESIGNSYS-02` | ✅ Built (2026-07-29) | All tasks | — |
| EmptyState, ErrorState | `components/ui/state.tsx` | DESIGNSYS | `DESIGNSYS-02` | ✅ Built (2026-07-29) | All tasks | — |
| Dialog (+ Trigger/Content) | `components/ui/dialog.tsx` | DESIGNSYS | `DESIGNSYS-02` | ✅ Built (2026-07-29) | AUTH, PROF, DASH, CHAT | Radix-wrapped |
| Sheet (+ Trigger/Content) | `components/ui/sheet.tsx` | DESIGNSYS | `DESIGNSYS-02` | ✅ Built (2026-07-29) | AUTH, PROF, DASH, CHAT | Radix Dialog primitive, bottom-sheet styling |
| Tooltip (+ Provider/Trigger/Content) | `components/ui/tooltip.tsx` | DESIGNSYS | `DESIGNSYS-02`; `TooltipProvider` mounted app-wide by `DESIGNSYS-03` | ✅ Built (2026-07-29); Provider actually mounted 2026-08-15 | AUTH, PROF, DASH, CHAT | Radix-wrapped. Component existed but its Provider sat unmounted until DESIGNSYS-03 — see `INFRASTRUCTURE_BASELINE.md`. `side` prop is physical not logical — open RTL finding, `PROJECT_STATE.md` |
| Popover (+ Trigger/Content/Anchor) | `components/ui/popover.tsx` | DESIGNSYS | `DESIGNSYS-02` | ✅ Built (2026-07-29) | AUTH, PROF, DASH, CHAT | Radix-wrapped |
| Avatar, Badge | `components/ui/avatar-badge.tsx` | DESIGNSYS | `DESIGNSYS-02` | ✅ Built (2026-07-29) | All tasks | — |
| Card | `components/ui/card.tsx` | DESIGNSYS | `DESIGNSYS-02` | ✅ Built (2026-07-29) | All tasks | Base contract every Feature-tier `*Card` extends |
| MarketingLayout, ApplicationLayout, FocusLayout | `components/layout/marketing-layout.tsx`, `application-layout.tsx`, `focus-layout.tsx` | DESIGNSYS | `DESIGNSYS-03` | ✅ Built (2026-08-15) | LAND (Marketing) / DASH, CHAT, PROF, Settings (Application) / future Trip Planning (Focus) | Exactly these 3 + AuthLayout — no 5th layout type without amendment |
| AuthLayout | `app/[locale]/(auth)/layout.tsx` | DESIGNSYS | pre-dates DESIGNSYS | ✅ Built by `AUTH-01` | AUTH | Reconciled against DESIGNSYS-03, not rebuilt. **2026-08-19 (AUTH-01 audit):** locale-dropping `next/link` replaced with `i18n/navigation`'s `Link`; Privacy/Terms/logo copy localized (real `Auth.layout` messages, not placeholder); converted to `async` + `getTranslations` from `next-intl/server` to stay a Server Component. See `PROJECT_STATE.md`. |
| Navbar | `components/layout/navbar.tsx` | DESIGNSYS | `DESIGNSYS-03` | ✅ Built (2026-08-15) | DASH, CHAT, PROF, Settings, LAND | Exposes `userSlot`/`notificationsSlot` props for ProfileMenu/NotificationCenter (§4) — not built here |
| Sidebar | `components/layout/sidebar.tsx` | DESIGNSYS | `DESIGNSYS-03` | ✅ Built (2026-08-15) | DASH, CHAT, PROF, Settings | Width 300px/88px per `DESIGN_TOKENS.md` — see Amendment 007 |
| MobileNavDrawer, MobileBottomNav | `components/layout/mobile-nav-drawer.tsx`, `mobile-bottom-nav.tsx` | DESIGNSYS | `DESIGNSYS-03` | ✅ Built (2026-08-15) | DASH, CHAT, PROF, Settings | Together = `APPLICATION_LAYOUT_GUIDE.md` §Mobile Navigation's "MobileSidebar" concept, delivered as two components matching that section's own two-part description |
| Footer | `components/layout/footer.tsx` | DESIGNSYS | `DESIGNSYS-03`; localized + Product column added by `LAND-01` (2026-08-29) | ✅ Built (2026-08-15); localized (2026-08-29) | LAND, marketing pages | ~~Flagged 2026-08-19 (AUTH-01 audit): hardcoded-English `LEGAL_LINKS`~~ — resolved by `LAND-01`: full `Footer` namespace, real EN/FA/DE, `useTranslations` (`"use client"` — the `getTranslations`/async-Server-Component pattern was tried first, matching AuthLayout's precedent, but reverted after it broke `tests/layouts.test.tsx`; see `PROJECT_STATE.md`'s 2026-08-29 Verification Results for the full reasoning). New Product column links to LAND-01's four real in-page sections, reusing `Navigation`'s existing `discover`/`aiAssistant`/`features`/`faq` keys rather than duplicating them. |
| SkipLink | `components/layout/skip-link.tsx` | DESIGNSYS | `DESIGNSYS-03` | ✅ Built (2026-08-15) | All tasks (mounted once, globally) | **Not previously tracked in this matrix** — added during this reconciliation; mounted app-wide in `app/[locale]/layout.tsx`, not per-page |
| GlassCard, GlassSurface | `components/ui/glass.tsx` | DESIGNSYS | `DESIGNSYS-04` | ✅ Built (2026-08-16) — formalizes the pre-existing `.atlas-glass-N` utility classes (already consumed by class name in Navbar/Sidebar/Card) into typed components; does not replace those existing usages | All tasks | Exactly 4 Glass Levels — no 5th without amendment |
| ThemeProvider | `components/providers/theme-provider.tsx` | DESIGNSYS | `DESIGNSYS-01` | ✅ Built (2026-07-29) | All tasks | Depends on Design Tokens Part 5 only |
| MotionProvider (reduced-motion context) | `components/providers/motion-provider.tsx` | DESIGNSYS | `DESIGNSYS-04` | ✅ Built (2026-08-16) — built on `useSyncExternalStore`, mirroring ThemeProvider's pattern, not Framer Motion's own `useReducedMotion()` hook (found not to re-render on a live preference change) | All tasks | — |
| BackgroundSystem | `components/ui/background-system.tsx` | DESIGNSYS | `DESIGNSYS-04` | ✅ Built (2026-08-16) | All tasks | Renders the fixed `.atlas-noise` layer; mounted once at app root |

**33 Foundation component groups, all built.** DESIGNSYS-01–04 constitute a closed, complete Foundation layer — see §20 in `MASTER_RULES.md` / `PROJECT_STATE.md` for the formal status declaration. No Foundation work remains open; any future "Foundation" request should first re-check this table, since the answer is very likely "already exists."

---

## 4. Shared Component Matrix

| Component | Owner (first-creating task) | Created By | Consumed by | Dependencies | Status | Rule |
|---|---|---|---|---|---|---|
| SearchOverlay, GlobalCommand | `DASH-01` | `DASH-01` | DASH, Phase 2+ Trips/Destinations | Input, Dialog | Not built | Reusable — never duplicate search logic per-feature |
| AIQuickAccess | Unclaimed — both listed candidates (`LAND-01`, `CHAT-01`) have now shipped without taking it | — | LAND, DASH, CHAT, Phase 2+ Destination/Hotel/Flight | Button/IconButton | Not built | **Explicitly declined by `LAND-01` (2026-08-29)** and again by **`CHAT-01` (2026-09-01)**. LAND-01's reasoning: a persistent cross-page AI quick-access trigger needs an actual chat surface to open, which didn't exist yet. Now that `/chat` is real, `CHAT-01`'s own reasoning: building it would mean adding a slot to `Navbar` (`DESIGNSYS-03` territory) beyond CHAT-01/02's own declared file boundaries (`components/chat/**`, `app/[locale]/(app)/chat/page.tsx`) — out of scope for a task that isn't itself a DESIGNSYS or Navbar-owning task. Next candidate owner: whichever future task has a concrete reason to add a global trigger and stays within Navbar's own file boundaries — likely `DASH-01`, which already touches global-header slots for `ProfileMenu`/`NotificationCenter`. |
| NotificationCenter | `DASH-01` (assigned per `DESIGNSYS_ARCHITECTURE_SPECIFICATION.md` Part 7 finding #7) | `DASH-01` | Global header, DASH | Toast, Badge | Not built | — |
| ProfileMenu | `PROF-03` or `DASH-01`, whichever ships first | — | Global header | Avatar, Popover | Not built | **Explicitly deferred by `PROF-03` (2026-08-25)**, not claimed: a ProfileMenu now would need to link to /trips, /saved, /dashboard — none of which have real pages yet — creating dead-end links. `/profile` remains fully reachable regardless, via Sidebar/MobileBottomNav's existing nav-items.ts entries (predate this decision). Next candidate owner: `DASH-01`. |
| LanguageSwitcher, ThemeSwitcher | `DESIGNSYS-03` (bundled with nav shell build) | `DESIGNSYS-03` | Global header, all modules | Select/Dropdown, ThemeProvider | ✅ Built (2026-08-15) — `components/layout/language-switcher.tsx`, `theme-switcher.tsx` | Reclassified from Foundation — composed widget, not a base primitive |
| QuickActions | `DASH-01` | `DASH-01` | DASH, any page with a FAB | FAB, Sheet | Not built | — |
| ConnectionStatus, RetryCard | Unclaimed — `CHAT-01` shipped first (2026-09-01) but explicitly declined; `DASH-01` remains a candidate | — | Chat, Trip Details, Dashboard | Alert | Not built | `CHAT-01`/`02`'s entire send/streaming pipeline runs against a local, isolated stub (`lib/chat/simulate-assistant-reply.ts`) — there is no live network connection to report the status of yet, and won't be until `CHAT-03`/`04` (the real backend) exist. Building a connection-status indicator now would have nothing real to indicate. Next candidate owner: whichever of `CHAT-03`/`04` or `DASH-01` ships first once there's an actual connection worth monitoring. |
| StepIndicator | `PROF-01` (first use) | `PROF-01` | Phase 2+ Destination/Hotel/Flight/Trip/Settings | Foundation only | ✅ Built (2026-08-25) — `components/ui/step-indicator.tsx` | Breadcrumb/Pagination/Tabs remain unbuilt — PROF-01 only needed StepIndicator; those three stay "Not built" below their own future first-consumer. |
| Breadcrumb, Pagination, Tabs | TBD — Phase 2+ | — | Destination/Hotel/Flight/Trip/Settings | Foundation only | Not built | Split out from the combined row above now that StepIndicator has shipped separately. |
| FilterBar | TBD — Phase 2+, no Task-level owner yet | — | My Trips, Hotels, Flights | Select, Checkbox | Not built | Flagged below (Part 4) |
| ImageGallery, Lightbox | TBD — Phase 2+ | — | Destination, Hotel, Trip Details | AspectRatio | Not built | — |
| StatusBanner | TBD — Phase 2 (Trip Planning) | — | Trip Planning, Trip Details | Alert | Not built | — |
| WeatherSummary/WeatherIcon | TBD — Phase 2+ chrome, Phase 3 data | — | Dashboard, Trip Details, Timeline | Card | Not built | Display-only until Phase 3 |
| MapPanel | TBD — Phase 3 | — | Trip Details, Destination, Hotel | GlassCard | Not built | Chrome only until Phase 3 data |
| DatePicker, TimePicker, Calendar, RangePicker | TBD — Phase 2 (Trip Planning) | — | Trip Planning, Booking, Profile | Popover, Calendar | Not built | — |
| CurrencyInput, Slider | TBD — Phase 2 (Budget) | — | Trip Planning budget step | Input | Not built | — |
| Autocomplete, Combobox, TagInput | TBD — Phase 2 (Destination search) | — | Destinations, filters | Input, Popover | Not built | — |
| FileUpload, ImageUpload | `PROF-03` (avatar) first; Phase 2+ (Documents) | `PROF-03` | Profile, Trip Details Documents | Foundation only | ✅ Built (2026-08-25) — `components/ui/file-upload.tsx` (generic base), `components/ui/image-upload.tsx` (avatar preview, built on FileUpload) | ImageUpload only ever produces a local object-URL preview — no object-storage endpoint exists anywhere in this repo (undocumented in ARCHITECTURE.md §11); same class of gap as AUTH-03's OAuth stub and AUTH-04's email stub. A future Documents-consuming task reuses FileUpload directly, not ImageUpload. |
| LocationPicker | TBD — Phase 2 (Trip Planning) | — | Trip Planning, Profile address | Input, Autocomplete | Not built | — |
| CopyButton, ShareButton, BookmarkButton, FavoriteButton | `CHAT-02` (copy response) first; Phase 2+ (Trips/Destinations) | `CHAT-02` | Chat, Trips, Destinations | IconButton | Not built | — |
| RatingStars | TBD — Phase 2 (Destination/Hotel) | — | Destination, Hotel | Foundation only | Not built | Inferred from a shown example in `TRIP_PLANNING_EXPERIENCE.md`, not a literally-named component |
| PriceDisplay | TBD — Phase 2 (Hotel/Flight) | — | Hotels, Flights, Booking, Budget widget | Foundation only | Not built | — |

Rows marked **TBD** have no owner because the module they belong to isn't elaborated to Task level yet (rolling-wave planning, per `WORK_BREAKDOWN_STRUCTURE.md`). Per this document's own rule (§6), they get an owner and an entry update the moment their first consuming Task is defined — not before.

---

## 5. Feature Component Matrix

Feature Components are **not** individually pre-assigned to invented task IDs. Per `WORK_BREAKDOWN_STRUCTURE.md`'s rolling-wave planning, Phase 2+ modules exist at Module/Feature level only — no Task-level IDs exist yet for Trip/Timeline/Destination/Hotel/Flight components. Assigning them a specific task ID now (e.g., a placeholder like "TRIP-02") would be inventing WBS structure that doesn't exist — flagged per this document's own instruction to report ambiguity rather than guess.

| Group | Components (indicative, not exhaustive) | Owner WBS Task | Foundation consumed | Shared consumed | Why not DESIGNSYS |
|---|---|---|---|---|---|
| Auth-specific | RegisterForm | `AUTH-01` — ✅ done | Input, Button, FormError, AuthLayout | none | Already built; scope is exactly this task |
| Auth-specific | LoginForm, LoginPageContent, VerifyEmailContent | `AUTH-05` (LoginForm/LoginPageContent) — ✅ done · `AUTH-04` (VerifyEmailContent) — ✅ done | Label, Input, Button, FormError, AuthLayout | OAuthButtons (LoginPageContent only) | LoginForm mirrors RegisterForm's structure; unlike Register, wired end-to-end to `POST /api/v1/auth/login` per AUTH-05's own combined scope (not split UI-only) |
| Auth-specific | OAuthButtons | `AUTH-03` — ✅ done | Button, FormError | none | **Shared, not Feature** — consumed by both RegisterPageContent (AUTH-01) and LoginPageContent (AUTH-05); classified here anyway since it's AUTH-domain business logic (hits `/api/v1/auth/oauth/{provider}`), not a generic reusable primitive. Handshake stubbed — no Google/Apple credentials exist anywhere in this repo, reported per AUTH-03's own acceptance criteria. |
| Auth-specific | ForgotPasswordForm, ForgotPasswordPageContent, ResetPasswordForm, ResetPasswordContent | `AUTH-06` — ✅ done | Label, Input, Button, FormError, AuthLayout | none | Same structural pattern as LoginForm/VerifyEmailContent — ResetPasswordContent reads `?token=` like VerifyEmailContent but renders a form (needs new-password input) instead of auto-submitting; wired end-to-end to `POST /api/v1/auth/forgot-password` / `POST /api/v1/auth/reset-password` per this task's own combined UI+backend scope |
| Profile-specific | ProfileWizard, ProfileWizardOptions (data) | `PROF-01` — ✅ done | StepIndicator, RadioGroupItem (`card` variant, extended by this same task), Button | none | Wired end-to-end to `GET`/`PATCH /api/v1/profile/me` (`PROF-02`, done first in this same session so no stub-then-wire split was needed, unlike AUTH-01/02) |
| Profile-specific | ProfilePageContent, PersonalInfoSection, PreferencesSection | `PROF-03` — ✅ done | Card→`.atlas-glass-2`, Avatar, ImageUpload, Input, Label, Select, Checkbox, Skeleton | none | Wired end-to-end to `GET`/`PATCH /api/v1/profile/me` and `GET /api/v1/auth/me` (email). Avatar upload UI is real and fully functional up to the local-preview boundary — no PATCH of `avatar_url` is ever sent, since no object-storage endpoint exists anywhere in this repo (see FileUpload/ImageUpload's own §3 row) |
| Landing-specific | HeroSection, HowItWorks, DestinationCarousel, AIShowcase, FeatureHighlights, FAQSection, CTASection | `LAND-01` — ✅ done | MarketingLayout, Typography (HeroText/Heading/Paragraph/BadgeText/Caption), Button (`buttonVariants`), Card, GlassCard, AnimationWrappers (FadeIn/ScrollReveal/ScaleIn) | AISearchBox, GuestEntryCta (both composed into HeroSection/CTASection) | Marketing-only; excluded from productivity workflows per `DESIGN_SYSTEM.md` §29. **No Testimonials/StatisticsSection/PartnerLogos/Newsletter** — named in `COMPONENT_INVENTORY.md` §Landing Page but deliberately not built: no real users/reviews/usage stats/partners exist yet, and `BRAND_GUIDELINES.md` §8/§13 forbids fabricating any of the four. `CTASection` is `"use client"` (calls `buttonVariants()` directly — a real RSC-boundary constraint found live, not a stylistic choice; see `PROJECT_STATE.md`'s 2026-08-29 Verification Results). `AnimatedBackground` (below) is HeroSection's own decorative child, not separately Foundation-consumed. |
| Landing-specific | AISearchBox, ExamplePrompts (data) | `LAND-02` — ✅ done | (none beyond what HeroSection already provides — composes directly into it) | none | The Hero's AI search box + rotating example-prompt placeholder, per `TRIP_PLANNING_EXPERIENCE.md` §Step 1's exact 8-prompt list. Submits to `/chat?prompt=<text>` — `CHAT-01` reads that query param once it exists, not invented here. `"use client"` (state, router, interval) |
| Landing-specific | GuestEntryCta | `LAND-03` — ✅ done | (none beyond what HeroSection/CTASection already provide) | none | "Continue as Guest" entry-point wiring only — links to `/chat` with reassuring copy. The actual guest session-memory *mechanism* is explicitly `MEM-01`'s separate, `CHAT-02`-gated scope, not built here. `"use client"` (no interactivity beyond a styled Link, but composed by `"use client"` siblings) |
| Landing-specific | AnimatedBackground | `LAND-01` — ✅ done | Design Tokens only (`--color-primary`/`--color-accent` via CSS vars, Framer Motion `motion.path`/`motion.circle`) | none | Purely decorative Hero background, `aria-hidden`. No GSAP/Three.js — neither is an installed dependency of this repository; introducing either for one decorative element wasn't this task's call to make unilaterally (`MASTER_RULES.md` §5). Respects reduced motion via framer-motion's own `useReducedMotion()` (not `MotionProvider`'s context — same standalone-hook pattern `Button` already uses) |
| Chat-specific | ✅ Done (2026-09-01). `MessageBubble` (`components/chat/message-bubble.tsx`, also exports `StreamingBubble` as a direct alias — `MessageBubble`'s own `status` field already covers the streaming visual/`aria-busy` treatment, so it isn't a second implementation), `TypingIndicator` (`components/chat/typing-indicator.tsx`), `ConversationSidebar` (`components/chat/conversation-sidebar.tsx` — ships as one cohesive component rather than separate `ConversationList`/`ConversationCard` components), `ChatComposer` (`components/chat/chat-composer.tsx`, the `ChatInput` equivalent), `ConversationPanel` (`components/chat/conversation-panel.tsx`, not originally named in this matrix — the scrollable message-list + empty-state container CHAT-01 needed to host CHAT-02's message components) | `CHAT-01`, `CHAT-02` (file-level split recorded in `PROJECT_STATE.md`'s 2026-09-01 Verification Results) | Avatar (declined for the assistant side — see `message-bubble.tsx`'s own doc comment on `ICONOGRAPHY_AND_ILLUSTRATION.md`'s no-human-avatar-for-AI rule), Skeleton, Card, Sheet, ScrollArea, Textarea, Button | None (`ConnectionStatus`/`CopyButton` — both still unbuilt at the time; Copy was implemented inline in `MessageBubble` instead of duplicating a nonexistent Shared component, and there is no live connection yet for `ConnectionStatus` to report on, see §4) | Tied to Conversation Manager's data shape (`CHAT-03`/`04`, not yet built) — the actual send/streaming pipeline runs against `lib/chat/simulate-assistant-reply.ts`, a documented, isolated stub; every component here only ever sees `lib/chat/types.ts`'s `ChatMessage`/`Conversation` shapes and callback props, never the transport, so swapping in the real backend later shouldn't require touching any of them |
| Dashboard-specific | TravelSummaryHero, widget instances | `DASH-01` | Card, GlassCard | QuickActions, NotificationCenter, WeatherSummary | Dashboard's own composition |
| Trips/Timeline | TripCard, TripTimeline, TimelineMilestone/Day, ActivityCard, BudgetCard, ReservationCard | **TBD — Phase 2–3, not yet Task-elaborated** | Card, GlassCard, Badge | StatusBanner, PriceDisplay, Date family | Depends on real itinerary data from Core Agents (Phase 2), adapters (Phase 3) |
| Destinations/Hotels/Flights | DestinationCard, HotelCard, FlightCard, RestaurantCard, RecommendationCard | **TBD — Phase 2–3, not yet Task-elaborated** | Card, Badge, Avatar | RatingStars, PriceDisplay, ImageGallery | Feature-specific Recommendation Agent output |

---

## 6. Feature Component Creation Policy

- Feature Components MUST NOT be implemented during `DESIGNSYS` tasks.
- Feature Components MUST ONLY be implemented inside the WBS Task that owns them.
- Feature Components MUST NOT exist before their owning WBS Task starts.
- Every Feature Component entry MUST reference: owning WBS Task, creation moment, Foundation components consumed, Shared components consumed.
- Future implementation sessions MUST NOT pre-build Feature Components "while they're in the area."
- Feature Components are implemented **just-in-time**, when their owning WBS Task begins — never earlier.

---

## 7. Component Lifecycle

| Stage | Meaning | Who can trigger it |
|---|---|---|
| Created | First implementation, entered into this matrix | The owning task, same session |
| Consumed | Used by another task without modification | Any task, no approval needed |
| Extended | New variant added, base contract unchanged | The category's normal owner (DESIGNSYS for Foundation; original owner or a documented follow-up task for Shared) |
| Deprecated | Marked for removal, still functional | Requires a `MASTER_RULES.md`-tier amendment — not a unilateral session decision |
| Replaced | Deprecated component's consumers migrated | Its own WBS Task, scoped like any other implementation task |
| Ownership Transfer | A Shared/Feature component's designated owner changes | Requires this matrix to be updated in the same session as the transfer, with the reason recorded |

---

## 8. Dependency Rules

- **Foundation** depends only on: Design Tokens, Providers (ThemeProvider/MotionProvider), Utilities.
- **Shared** may depend on Foundation.
- **Feature** may depend on Foundation and Shared.
- Foundation must never depend on Shared.
- Foundation must never depend on Feature.
- Shared must never depend on Feature.

(Standard one-directional layering: Foundation → Shared → Feature. No component may depend on a layer above it.)

---

## 9. Validation Checklist

Before any UI component is merged, the implementing session confirms:

- [ ] Component classified as Foundation, Shared, or Feature, and that classification is recorded here.
- [ ] Checked this matrix first — not already built by an earlier task under a different name.
- [ ] If Foundation: created only within a `DESIGNSYS` task.
- [ ] If Shared: this is genuinely its first consumer, or it's being reused (not re-implemented) from an existing entry.
- [ ] If Feature: not built before its owning task started; not something that should have been Shared instead.
- [ ] Dependency direction respected — no Foundation→Shared/Feature, no Shared→Feature.
- [ ] Uses Design Tokens exclusively, per `MASTER_RULES.md` §7 — no hardcoded values.
- [ ] This matrix updated in the same task that created or modified the component.
