# DESIGNSYS Architecture Specification

**Project:** Atlas — AI Travel Platform
**Date:** 2026-07-28
**Status:** DOCUMENTATION ONLY — no code written, no repository touched, `TASK_BOARD.md` / `PROJECT_STATE.md` / `WORK_BREAKDOWN_STRUCTURE.md` not updated. Expands and corrects `DESIGNSYS_FOUNDATION_AUDIT_AND_WBS_PROPOSAL.md` (previous session).
**Relationship to prior file:** Parts 1–2 there are superseded by Parts 1–4 here (corrected + completed). The four proposed tasks (`DESIGNSYS-01..04`) carry forward with refined acceptance criteria — no new tasks were found necessary (see Part 5).

---

## Corrections from the previous pass

Two real gaps, surfaced by re-reading `COMPONENT_INVENTORY.md` in full rather than by category:

1. **Foundation §Layout was under-quoted.** Missed: `AppShell`, `Section`, `AspectRatio`, `ResizablePanel`. Missed under Typography: `Code`, `Quote`, `List`. Missed under Buttons: `OutlineButton`, `DangerButton`, `SuccessButton`, `TextButton`, `SplitButton`, `DropdownButton`. All added to Part 1 below. None require a new task — `DESIGNSYS-02`'s doc citation was already "Foundation section" in full; only the written summary was incomplete.
2. **LanguageSwitcher and ThemeSwitcher were misclassified as Foundation last pass.** They're composed widgets that live inside the Header, not base primitives a page needs to render at all — reclassified to Shared this pass, consistent with your own Part 1 examples.

---

## Part 1 — Foundation Component Inventory (corrected, complete)

✅ = built by `ATLAS-P1-AUTH-01`.

| Group | Components | Source |
|---|---|---|
| Layout shell primitives | AppShell, Container, Stack, Grid, Section, Spacer, Divider/Separator, AspectRatio, ScrollArea, ResizablePanel, PageTransition, StickyArea, FloatingLayer, Portal/Overlay | `COMPONENT_INVENTORY.md` §Layout |
| Layout types (exactly 4, no 5th) | MarketingLayout, ApplicationLayout, FocusLayout, AuthLayout ✅ | `APPLICATION_LAYOUT_GUIDE.md` §Layout Types |
| Global nav shell | Navbar/Header, Sidebar, MobileSidebar | `APPLICATION_LAYOUT_GUIDE.md` §Global Header, §Sidebar |
| Typography | HeroText, DisplayText, Heading, Paragraph, Caption, Link, Code, Quote, List, BadgeText, Label ✅ | `COMPONENT_INVENTORY.md` §Typography |
| Buttons | Button ✅ (base), Secondary/Ghost/Outline/Danger/Success/Text/Icon/Loading/Split/Dropdown variants, FloatingActionButton (FAB shell) | `COMPONENT_INVENTORY.md` §Buttons, `DESIGN_TOKENS.md` Part 6 |
| Inputs (universal set) | Input ✅, FormError ✅, Textarea, Select, Checkbox, Switch, Radio, SearchInput | `COMPONENT_INVENTORY.md` §Inputs, `DESIGN_TOKENS.md` Part 6 |
| Feedback shells | Toast, Alert, Skeleton, Spinner, EmptyState, ErrorState | `COMPONENT_INVENTORY.md` §Feedback |
| Overlays | Dialog/Modal, Sheet/BottomSheet/Drawer, Tooltip, Popover | `COMPONENT_INVENTORY.md` §Dialogs, `DESIGN_TOKENS.md` Part 6 |
| Identity/status | Avatar, Badge/StatusBadge, Card (base contract) | `COMPONENT_INVENTORY.md` §User/§Feedback, `DESIGN_TOKENS.md` Part 6 §Card |
| Glass system | GlassCard, GlassSurface (4 Glass Levels only) | `DESIGN_TOKENS.md` §Atlas Glass Design Language (LOCKED) |
| App-wide providers | ThemeProvider, MotionProvider/reduced-motion context, BackgroundSystem | `DESIGN_TOKENS.md` Part 5, `MOTION_SYSTEM.md` §18, `ACCESSIBILITY.md` §Motion Accessibility |
| Motion wrappers | FadeIn, SlideIn, ScaleIn, ScrollReveal | `COMPONENT_INVENTORY.md` §Motion Components |

**Total: 46 Foundation items (up from 34 — correction, not scope growth). 8 already built.**

---

## Part 1 — Shared Component Inventory (complete pass)

Rule applied: included only where a document citation exists. Where your example list named something with no citation found, it's marked **not confirmed** and excluded rather than guessed in.

| Component | Confirmed by | Feature area(s) |
|---|---|---|
| SearchOverlay, GlobalCommand/CommandPalette | `COMPONENT_INVENTORY.md` §Navigation/§Dialogs | Dashboard, Trips, Destinations |
| AIQuickAccess | `COMPONENT_INVENTORY.md` §Navigation; `INFORMATION_ARCHITECTURE.md` §AI Entry Points (Landing, Navbar, Dashboard, Trips, Destinations, Hotels, Flights, Notifications, Profile, mobile FAB) | Nearly all — kept Shared not Foundation, it's a composed widget |
| NotificationCenter (shell) | `COMPONENT_INVENTORY.md` §Navigation; `APPLICATION_LAYOUT_GUIDE.md` §Notifications | Global header, Dashboard |
| ProfileMenu / User Menu | `COMPONENT_INVENTORY.md` §Navigation; `APPLICATION_LAYOUT_GUIDE.md` §User Menu | Global header |
| LanguageSwitcher, ThemeSwitcher | `COMPONENT_INVENTORY.md` §Navigation; `APPLICATION_LAYOUT_GUIDE.md` §Language Switcher/§Theme Toggle | Global header (reclassified from Foundation, see above) |
| QuickActions (FAB content) | `DASHBOARD_EXPERIENCE.md` §Quick Actions | Dashboard; likely reused wherever a FAB appears |
| ConnectionStatus, RetryCard | `COMPONENT_INVENTORY.md` §Feedback | Chat, Trip Details, Dashboard |
| Breadcrumb, Pagination, Tabs, StepIndicator | `COMPONENT_INVENTORY.md` §Navigation; `INFORMATION_ARCHITECTURE.md` §Breadcrumbs (explicit usage list) | Destination/Hotel/Flight/Trip/Settings; StepIndicator also PROF-01 (progressive profile) |
| FilterBar | `APPLICATION_LAYOUT_GUIDE.md` §My Trips ("Filters ↓ Grid ↓ Pagination") | My Trips; likely Hotels/Flights search |
| ImageGallery, Lightbox | `COMPONENT_INVENTORY.md` §Media | Destination, Hotel, Trip Details |
| StatusBanner | `TRIP_PLANNING_EXPERIENCE.md` §Availability Awareness ("subtle informational banners") | Trip Planning, Trip Details |
| WeatherSummary / WeatherIcon (display-only) | `DASHBOARD_EXPERIENCE.md` §Weather Widget; `TRIP_DETAILS_EXPERIENCE.md` §Weather Integration | Dashboard, Trip Details, Timeline — live data is Phase 3 |
| MapPanel (chrome only) | `DESIGN_TOKENS.md` Part 6 §Map Panel Contract | Trip Details, Destination, Hotel — live data Phase 3 |
| Date family: DatePicker, TimePicker, Calendar, RangePicker | `COMPONENT_INVENTORY.md` §Inputs | Trip Planning dates, Booking, Profile |
| CurrencyInput, Slider | `COMPONENT_INVENTORY.md` §Inputs | Budget-adjacent contexts — no doc specifies exact screen, named only |
| Autocomplete, Combobox, TagInput | `COMPONENT_INVENTORY.md` §Inputs | Destination search, filters |
| FileUpload, ImageUpload | `COMPONENT_INVENTORY.md` §Inputs | Documents (Trip Details), Profile avatar |
| LocationPicker | `COMPONENT_INVENTORY.md` §Inputs | Trip Planning, Profile address |
| Semantic action buttons: CopyButton, ShareButton, BookmarkButton, FavoriteButton | `COMPONENT_INVENTORY.md` §Buttons | Trips, Destinations, Chat (copy response) |
| RatingStars / TravelScore display | `TRIP_PLANNING_EXPERIENCE.md` Destination Hero example ("Tokyo ★★★★☆…") — inferred from a shown example, not a literally-named component; still well-grounded | Destination, Hotel |
| PriceDisplay (formatted currency) | `COPYWRITING_GUIDELINES.md` §Currency; `COMPONENT_INVENTORY.md` §Hotels (HotelPrice), §Booking (PriceBreakdown) — cross-cutting formatting primitive underneath those | Hotels, Flights, Booking, Budget |

**Not confirmed — excluded, no citation found:** Currency Selector, Country Selector (would use generic Select), Sort Controls, Section Header, Feature Header, Hero Wrapper, Glass Hero (pattern exists — Glass Level 4 on heroes — but no named component), Location Chip, Empty Illustration (it's a sub-element of EmptyState, not separate), Loading Overlay (folds into Skeleton/Spinner), Global Search Results (folds into SearchOverlay's own result rendering), Image Viewer (folds into Lightbox/ImageGallery). `MegaMenu` is named in `COMPONENT_INVENTORY.md` but no experience doc calls for it anywhere — flagged as documented-but-currently-unneeded, not built.

---

## Part 2 — Foundation Consumption

A literal component-by-module grid (46 × ~10) would be mostly checkmarks and low-signal. Grouped by actual consumption pattern instead:

| Pattern | Components | Consumed by |
|---|---|---|
| Truly universal | Layout primitives, Typography, Button/IconButton, Toast/Alert/Skeleton/Spinner/EmptyState/ErrorState, ThemeProvider/MotionProvider/BackgroundSystem | Every module, no exceptions |
| Form-context | Input, Textarea, Select, Checkbox, Switch, Radio, FormError | AUTH, PROF, DASH (settings), CHAT (composer) |
| Overlay-context | Dialog/Modal, Sheet/Drawer, Tooltip, Popover | AUTH (confirmations), PROF, DASH, CHAT |
| Identity/status | Avatar, Badge, Card, GlassCard | AUTH (post-verify), PROF, DASH, CHAT, and every Phase 2+ card built on the base Card contract |
| Motion | AnimationWrappers | Heaviest in LAND; light-touch everywhere else for micro-feedback |
| Layout-type-scoped | MarketingLayout → LAND only · AuthLayout → AUTH only (built) · ApplicationLayout → DASH/CHAT/PROF/Settings and all Phase 2+ authenticated modules · FocusLayout → future Trip Planning (Phase 2) |
| Nav shell | Navbar, Sidebar, MobileNav | Bundled with ApplicationLayout — same consumers |

---

## Part 3 — Shared Consumption Matrix

| Component | First creates | Consumed by | Dependencies | Feature area |
|---|---|---|---|---|
| SearchOverlay/GlobalCommand | DASH-01 | DASH, Phase 2+ Trips/Destinations | Input, Dialog | Dashboard, Trips |
| AIQuickAccess | LAND-01 or CHAT-01 (whichever ships first) | LAND, DASH, CHAT, and Phase 2+ Destination/Hotel/Flight pages | Button/IconButton | Cross-cutting |
| NotificationCenter | **unowned — see Part 7** | Global header, DASH | Toast, Badge | Dashboard, Notifications |
| ProfileMenu | PROF-03 or DASH-01 | Global header | Avatar, Popover | Profile |
| LanguageSwitcher, ThemeSwitcher | DESIGNSYS-03 (bundled with header build, see Part 5) | Global header, all modules | Select/Dropdown, ThemeProvider | Cross-cutting |
| QuickActions | DASH-01 | DASH, any page with a FAB | FAB, Sheet | Dashboard |
| ConnectionStatus, RetryCard | Whichever of CHAT-01/DASH-01 ships first | Chat, Trip Details, Dashboard | Alert | Cross-cutting error handling |
| Breadcrumb, Pagination, Tabs, StepIndicator | PROF-01 (StepIndicator first use) | Phase 2+ Destination/Hotel/Flight/Trip/Settings | none beyond Foundation | Cross-cutting |
| FilterBar | Phase 2+ (My Trips not yet a Task-level item) | My Trips, Hotels, Flights | Select, Checkbox | Trips |
| ImageGallery, Lightbox | Phase 2+ | Destination, Hotel, Trip Details | AspectRatio | Cross-cutting |
| StatusBanner | Phase 2 (Trip Planning) | Trip Planning, Trip Details | Alert | Trips |
| WeatherSummary/WeatherIcon | Phase 2+ chrome now, Phase 3 for live data | Dashboard, Trip Details, Timeline | Card | Cross-cutting |
| MapPanel | Phase 3 | Trip Details, Destination, Hotel | GlassCard | Cross-cutting |
| Date family | Phase 2 (Trip Planning dates) | Trip Planning, Booking, Profile | Popover, Calendar | Cross-cutting |
| CurrencyInput, Slider | Phase 2 (Budget) | Trip Planning budget step | Input | Trips |
| Autocomplete/Combobox/TagInput | Phase 2 (Destination search) | Destinations, filters | Input, Popover | Cross-cutting |
| FileUpload/ImageUpload | Phase 2+ (Documents), PROF-03 (avatar) | Trip Details Documents, Profile | none beyond Foundation | Cross-cutting |
| LocationPicker | Phase 2 (Trip Planning) | Trip Planning, Profile address | Input, Autocomplete | Cross-cutting |
| CopyButton/ShareButton/BookmarkButton/FavoriteButton | Phase 2+ (Trips/Destinations), CHAT-02 (copy response) | Trips, Destinations, Chat | IconButton | Cross-cutting |
| RatingStars | Phase 2 (Destination/Hotel) | Destination, Hotel | none beyond Foundation | Destinations, Hotels |
| PriceDisplay | Phase 2 (Hotel/Flight), Phase 6 (Booking) | Hotels, Flights, Booking, Budget widget | none beyond Foundation | Cross-cutting |

---

## Part 4 — Feature Component Ownership (grouped)

Grouped by module rather than 100+ individual rows — the "why not DESIGNSYS" rationale is the same within each group: these are single-feature data shapes and business logic, not reusable primitives, and several depend on Phase 2/3 backend work (Agents, external adapters) that doesn't exist yet.

| Group | Components | Owning task(s) | Foundation consumed | Shared consumed | Why not DESIGNSYS |
|---|---|---|---|---|---|
| Chat | MessageBubble, StreamingBubble, TypingIndicator, ConversationList/Item, ChatInput | CHAT-01, CHAT-02 | Avatar, Skeleton, Card | ConnectionStatus, CopyButton | Tied to Conversation Manager's data shape (CHAT-03/04), not reusable outside chat |
| Trips/Timeline | TripCard, TripTimeline, TimelineMilestone/Day, ActivityCard, BudgetCard, ReservationCard | Phase 2–3 backlog (not yet Task-level) | Card, GlassCard, Badge | StatusBanner, PriceDisplay, Date family | Depends on real itinerary data from Core Agents (Phase 2) and adapters (Phase 3) |
| Destinations/Hotels/Flights | DestinationCard, HotelCard, FlightCard, RestaurantCard, RecommendationCard | Phase 2–3 backlog | Card, Badge, Avatar | RatingStars, PriceDisplay, ImageGallery | Feature-specific recommendation logic from Recommendation Agent |
| Dashboard-specific | TravelSummaryHero, widget instances (Budget/Weather/Checklist) | DASH-01, Phase 2+ for data-backed widgets | Card, GlassCard | QuickActions, WeatherSummary | Dashboard's own composition, not reused elsewhere |
| Landing-specific | HeroSection, AnimatedBackground/3D scenes, DestinationCarousel, Testimonials, AIShowcase | LAND-01, LAND-02 | MarketingLayout, Button, AnimationWrappers | none | Marketing-only, explicitly excluded from productivity workflows per `DESIGN_SYSTEM.md` §29 |
| Auth-specific | RegisterForm | AUTH-01 (done) | Input, Button, FormError, AuthLayout | none | Already built; scope is exactly this task |

---

## Part 5 — DESIGNSYS Task Refinement

Checked all 46 Foundation items against the four proposed tasks. **Conclusion: no new task required.** Corrections made are scope-note clarifications only, not new IDs, dependencies, or complexity changes.

- `DESIGNSYS-01` (token/CSS/ThemeProvider) — unchanged.
- `DESIGNSYS-02` (core primitives) — scope note added: explicitly includes `AppShell`, `Section`, `AspectRatio`, `ResizablePanel`, `Code`, `Quote`, `List`, and the full button-variant set, all already inside its existing "Foundation section" doc citation.
- `DESIGNSYS-03` (layout shells + nav) — scope note added: bundles `LanguageSwitcher`/`ThemeSwitcher` (reclassified here from Foundation to Shared, but built alongside the header since they live inside it — no separate task needed for them).
- `DESIGNSYS-04` (glass + motion + background) — unchanged.

No Feature component was found inside any DESIGNSYS task. No Foundation component was found without an owning task.

---

## Part 6 — WBS Amendment Validation

| Check | Result |
|---|---|
| Preserves every existing task | ✅ none edited |
| Preserves numbering | ✅ new module, new IDs only |
| Preserves milestones | ✅ still Milestone M1, Phase 1 |
| Preserves dependencies | ✅ no existing `Dependencies` field touched |
| Preserves execution order | ✅ relative order among LAND/AUTH/PROF/CHAT/MEM/DASH unchanged |
| Preserves rolling-wave planning | ✅ Phase 2+ left at Module/Feature level, not elaborated |
| No oversized tasks | ✅ Complexity M/L/L/M — none XL |
| MASTER_RULES compliant | ✅ tokens-only, accessible, one task per future session |

**One practical risk found — not a document conflict, flagged per Part 6's instruction anyway:** `LAND-01`, `CHAT-01`, and `DASH-01` all show `Dependencies: none` or dependencies that don't include DESIGNSYS. Building any of them before `DESIGNSYS-01/02/03` exist means either throwaway shell code or quiet scope creep into layout/primitive territory. This isn't a rule violation — it's a sequencing risk, detailed in Part 7.

---

## Part 7 — Design System Coverage Report

**1. Foundation:** 46 items, 8 built, 38 remain, all covered by `DESIGNSYS-01..04`.
**2. Shared:** 22 confirmed items; 12 excluded as not documented (listed in Part 1, with reasons).
**3. Feature:** 6 groups, all Phase 2+ or already-built (AUTH-01); none consumed by DESIGNSYS.
**4. Consumption matrix:** Part 2 (Foundation), Part 3 (Shared).
**5. Ownership matrix:** Part 4.
**6. Missing components:** none found beyond what's listed — the 12 "not confirmed" items are exclusions, not gaps.
**7. Missing WBS ownership:** `NotificationCenter` has no first-owner task. Recommendation: fold into `DASH-01`'s scope (Dashboard is its first real consumer) rather than open a new task.
**8. Missing dependencies:** the `LAND-01`/`CHAT-01`/`DASH-01` sequencing risk (Part 6). Recommendation: informal guidance to implement `DESIGNSYS-01→03` first, without editing their formal `Dependencies` field.
**9. Proposed WBS amendment:** `DESIGNSYS-01..04` as defined in the prior file, refined per Part 5 — no new tasks.
**10. Risk analysis:** the two items above (#7, #8) are the only open risks. Neither blocks approval; both are one-line calls you can make now or defer to when `DASH-01`/`LAND-01` actually start.
**11. Implementation readiness:** `DESIGNSYS-01` — ready now. `02`/`04` — ready pending `01`. `03` — ready pending `01`+`02`. Overall **9/10**; the one point is the two open items above, both minor and non-blocking.
**12. Remaining gaps before implementation begins:** none structural. Two decisions worth a one-line answer whenever convenient: who owns `NotificationCenter`, and whether the sequencing risk needs a formal note anywhere.

---

Waiting for your review before any implementation starts, per this session's scope.
