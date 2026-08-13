# COMPONENT_OWNERSHIP_MATRIX.md

**Project:** Atlas — AI Travel Platform
**Date:** 2026-07-29
**Status:** PROPOSED — new canonical document, pending project owner approval. Not yet binding; not yet referenced by any live session until `MASTER_RULES.md`, `CONVERSATION_STRATEGY.md`, `SESSION_PROMPT.md`, and `INDEX.md` are actually updated to point to it (proposed versions delivered alongside this file).
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

**Default lifecycle (applies unless noted):** created by its `DESIGNSYS` task → immediately consumable by any task → extended only through documented variants, never forked → deprecation requires a `MASTER_RULES.md`-style amendment, not a unilateral decision inside an implementation session.
**Default dependencies (applies unless noted):** Design Tokens only.
**Default rule (applies unless noted):** must never be recreated; never duplicate its styling inside a Shared or Feature Component.

| Component(s) | Owner | Created By | Status | Consumed by | Exceptions |
|---|---|---|---|---|---|
| AppShell, Container, Stack, Grid, Section, Spacer, Divider/Separator, AspectRatio, ScrollArea, ResizablePanel, PageTransition, StickyArea, FloatingLayer, Portal/Overlay | DESIGNSYS | `DESIGNSYS-02` | Not built | All tasks | — |
| HeroText, DisplayText, Heading, Paragraph, Caption, Link, Code, Quote, List, BadgeText | DESIGNSYS | `DESIGNSYS-02` | Not built | All tasks | — |
| Label | DESIGNSYS | `DESIGNSYS-02` | ✅ Built by `AUTH-01` (pre-dates DESIGNSYS — see Part 4 finding) | All tasks | Reconcile, don't rebuild |
| Button (base + Secondary/Ghost/Outline/Danger/Success/Text/Icon/Loading/Split/Dropdown variants), FloatingActionButton | DESIGNSYS | `DESIGNSYS-02` | Base case ✅ built by `AUTH-01`; variants not built | All tasks | Extend AUTH-01's `Button`, don't fork |
| Input, FormError | DESIGNSYS | `DESIGNSYS-02` | ✅ Built by `AUTH-01` | All tasks | Reconcile, don't rebuild |
| Textarea, Select, Checkbox, Switch, Radio, SearchInput | DESIGNSYS | `DESIGNSYS-02` | Not built | AUTH, PROF, DASH, CHAT | — |
| Toast, Alert, Skeleton, Spinner, EmptyState, ErrorState | DESIGNSYS | `DESIGNSYS-02` | Not built | All tasks | — |
| Dialog/Modal, Sheet/BottomSheet/Drawer, Tooltip, Popover | DESIGNSYS | `DESIGNSYS-02` | Not built | AUTH, PROF, DASH, CHAT | — |
| Avatar, Badge/StatusBadge, Card | DESIGNSYS | `DESIGNSYS-02` | Not built | All tasks | Card = base contract every other card-tier Feature Component extends |
| MarketingLayout, ApplicationLayout, FocusLayout | DESIGNSYS | `DESIGNSYS-03` | Not built | LAND (Marketing) / DASH, CHAT, PROF, Settings (Application) / future Trip Planning (Focus) | Exactly these 3 + AuthLayout — no 5th layout type without amendment |
| AuthLayout | DESIGNSYS | `DESIGNSYS-03` | ✅ Built by `AUTH-01` | AUTH | Verify against existing, don't rebuild |
| Navbar/Header, Sidebar, MobileSidebar | DESIGNSYS | `DESIGNSYS-03` | Not built | DASH, CHAT, PROF, Settings | Bundled with ApplicationLayout |
| GlassCard, GlassSurface | DESIGNSYS | `DESIGNSYS-04` | Not built | All tasks | Exactly 4 Glass Levels — no 5th without amendment |
| ThemeProvider | DESIGNSYS | `DESIGNSYS-01` | Not built | All tasks | Depends on Design Tokens Part 5 only |
| MotionProvider (reduced-motion context) | DESIGNSYS | `DESIGNSYS-04` | Not built | All tasks | — |
| BackgroundSystem | DESIGNSYS | `DESIGNSYS-04` | Not built | All tasks | — |
| FadeIn, SlideIn, ScaleIn, ScrollReveal | DESIGNSYS | `DESIGNSYS-04` | Not built | Heaviest: LAND. Light-touch: all | Depends on MotionProvider |

---

## 4. Shared Component Matrix

| Component | Owner (first-creating task) | Created By | Consumed by | Dependencies | Status | Rule |
|---|---|---|---|---|---|---|
| SearchOverlay, GlobalCommand | `DASH-01` | `DASH-01` | DASH, Phase 2+ Trips/Destinations | Input, Dialog | Not built | Reusable — never duplicate search logic per-feature |
| AIQuickAccess | Whichever of `LAND-01`/`CHAT-01` ships first | same | LAND, DASH, CHAT, Phase 2+ Destination/Hotel/Flight | Button/IconButton | Not built | — |
| NotificationCenter | `DASH-01` (assigned per `DESIGNSYS_ARCHITECTURE_SPECIFICATION.md` Part 7 finding #7) | `DASH-01` | Global header, DASH | Toast, Badge | Not built | — |
| ProfileMenu | `PROF-03` or `DASH-01`, whichever ships first | same | Global header | Avatar, Popover | Not built | — |
| LanguageSwitcher, ThemeSwitcher | `DESIGNSYS-03` (bundled with nav shell build) | `DESIGNSYS-03` | Global header, all modules | Select/Dropdown, ThemeProvider | Not built | Reclassified from Foundation — composed widget, not a base primitive |
| QuickActions | `DASH-01` | `DASH-01` | DASH, any page with a FAB | FAB, Sheet | Not built | — |
| ConnectionStatus, RetryCard | Whichever of `CHAT-01`/`DASH-01` ships first | same | Chat, Trip Details, Dashboard | Alert | Not built | — |
| Breadcrumb, Pagination, Tabs, StepIndicator | `PROF-01` (StepIndicator first use) | `PROF-01` | Phase 2+ Destination/Hotel/Flight/Trip/Settings | Foundation only | Not built | — |
| FilterBar | TBD — Phase 2+, no Task-level owner yet | — | My Trips, Hotels, Flights | Select, Checkbox | Not built | Flagged below (Part 4) |
| ImageGallery, Lightbox | TBD — Phase 2+ | — | Destination, Hotel, Trip Details | AspectRatio | Not built | — |
| StatusBanner | TBD — Phase 2 (Trip Planning) | — | Trip Planning, Trip Details | Alert | Not built | — |
| WeatherSummary/WeatherIcon | TBD — Phase 2+ chrome, Phase 3 data | — | Dashboard, Trip Details, Timeline | Card | Not built | Display-only until Phase 3 |
| MapPanel | TBD — Phase 3 | — | Trip Details, Destination, Hotel | GlassCard | Not built | Chrome only until Phase 3 data |
| DatePicker, TimePicker, Calendar, RangePicker | TBD — Phase 2 (Trip Planning) | — | Trip Planning, Booking, Profile | Popover, Calendar | Not built | — |
| CurrencyInput, Slider | TBD — Phase 2 (Budget) | — | Trip Planning budget step | Input | Not built | — |
| Autocomplete, Combobox, TagInput | TBD — Phase 2 (Destination search) | — | Destinations, filters | Input, Popover | Not built | — |
| FileUpload, ImageUpload | `PROF-03` (avatar) first; Phase 2+ (Documents) | `PROF-03` | Profile, Trip Details Documents | Foundation only | Not built | — |
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
| Landing-specific | HeroSection, AnimatedBackground, DestinationCarousel, Testimonials, AIShowcase | `LAND-01`, `LAND-02` | MarketingLayout, Button, AnimationWrappers | AIQuickAccess | Marketing-only; excluded from productivity workflows per `DESIGN_SYSTEM.md` §29 |
| Chat-specific | MessageBubble, StreamingBubble, TypingIndicator, ConversationList/Item, ChatInput | `CHAT-01`, `CHAT-02` | Avatar, Skeleton, Card | ConnectionStatus, CopyButton | Tied to Conversation Manager's data shape (`CHAT-03`/`04`) |
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
