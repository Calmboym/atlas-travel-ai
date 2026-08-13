# DESIGNSYS Foundation Audit & WBS Amendment Proposal

**Project:** Atlas — AI Travel Platform
**Date:** 2026-07-28
**Status:** PROPOSAL — awaiting project owner approval. Nothing here has been merged into `TASK_BOARD.md`, `PROJECT_STATE.md`, `WORK_BREAKDOWN_STRUCTURE.md`, or `DEPENDENCY_GRAPH.md`. No code has been written.
**Scope delivered this session:** Part 1 (audit) and Part 4 (WBS gap analysis + amendment proposal) of the requested architecture audit.
**Scope deliberately not started:** Part 2 (implementation), Part 3 (AUTH-01 refactor), Part 5's code/ZIP output — see below.

---

## Why implementation didn't happen this session

Two structural reasons, both grounded in this project's own process documents, not a stylistic preference:

1. **No WBS task currently owns this work.** `INDEX.md` names `DESIGNSYS` as a cross-cutting concern but lists no `Related WBS`. `MISSING_INFORMATION.md` flags this twice, independently: the token→CSS wiring and the global Application Shell each have "no single owning WBS task." Building before the task exists and is approved would skip the same gate the AUTH-01 session applied to itself before touching AUTH-02 ("Neither is authorized yet — per your own process, that requires a separate, explicit go-ahead").
2. **Even scoped to Foundation + Shared only, this is bigger than one Task.** `WORK_BREAKDOWN_STRUCTURE.md`'s own integrity check treats "no oversized Tasks... none rated XL" as a quality bar every existing Phase 1 Task meets. A single "build all Foundation + Shared components" task would be the first XL task in the project — AUTH itself needed 8 tasks, not 1. So Part 4 below proposes four right-sized tasks instead of one oversized one.

Resolve reason 1 by approving (or amending) the proposal below; reason 2 is already resolved by how it's split.

---

## Part 1 — Foundation Component Inventory

Universal: needed by essentially every page, owned by no single feature. ✅ = already delivered by `ATLAS-P1-AUTH-01` — do not rebuild.

### Layout & shells
| Component(s) | Source | Status |
|---|---|---|
| Container, Stack, Grid, Spacer, Divider/Separator, ScrollArea, Portal/Overlay, StickyArea, FloatingLayer, PageTransition | `COMPONENT_INVENTORY.md` §Layout | Not built |
| MarketingLayout, ApplicationLayout (Header+Sidebar+Main+Panel), FocusLayout | `APPLICATION_LAYOUT_GUIDE.md` §Layout Types — exactly 4 approved types exist, no 5th without approval | Not built |
| AuthLayout | `APPLICATION_LAYOUT_GUIDE.md` §Authentication Layout | ✅ built (`app/(auth)/layout.tsx`) |
| Navbar/Topbar, Sidebar, MobileSidebar/drawer nav, LanguageSwitcher, ThemeSwitcher | `APPLICATION_LAYOUT_GUIDE.md` §Global Header, §Sidebar | Not built |

### Typography & core primitives
| Component(s) | Source | Status |
|---|---|---|
| Heading, Paragraph, Caption, Link, BadgeText, DisplayText/HeroText | `COMPONENT_INVENTORY.md` §Typography | Not built |
| Label | `COMPONENT_INVENTORY.md` §Typography | ✅ built |
| Avatar, Badge/StatusBadge | `COMPONENT_INVENTORY.md` §User, §Feedback | Not built |
| Card (base contract) | `DESIGN_TOKENS.md` Part 6 §Card Contract — Glass L2, radius-2xl | Not built |

### Buttons & inputs
| Component(s) | Source | Status |
|---|---|---|
| Button (base case) | `DESIGN_TOKENS.md` Part 6 §Button Contract | ✅ built |
| Secondary/Ghost/Icon/Loading button variants | `DESIGN_TOKENS.md` Part 6 | Not built — extend AUTH-01's `Button`, don't fork |
| Input (text case) | `DESIGN_TOKENS.md` Part 6 §Input Contract | ✅ built |
| FormError | Not a named Component Inventory entry — AUTH-01's own generalizable addition | ✅ built |
| Textarea, Select, Checkbox, Switch, Radio, SearchInput | `COMPONENT_INVENTORY.md` §Inputs | Not built |

### Feedback, overlays, glass, motion, providers
| Component(s) | Source | Status |
|---|---|---|
| Toast, Alert, Skeleton, Spinner, EmptyState (shell), ErrorState (shell) | `COMPONENT_INVENTORY.md` §Feedback | Not built |
| Dialog/Modal, Sheet/BottomSheet/Drawer, Tooltip, Popover | `COMPONENT_INVENTORY.md` §Dialogs, `DESIGN_TOKENS.md` Part 6 | Not built |
| GlassCard, GlassSurface (4 official Glass Levels only) | `DESIGN_TOKENS.md` §Atlas Glass Design Language (LOCKED) | Not built |
| ThemeProvider (Light/Dark/System) | `DESIGN_TOKENS.md` Part 5 §Theme Structure | Not built |
| MotionProvider / reduced-motion context | `MOTION_SYSTEM.md` §18, `ACCESSIBILITY.md` §Motion Accessibility | Not built |
| AnimationWrappers: FadeIn, SlideIn, ScaleIn, ScrollReveal | `COMPONENT_INVENTORY.md` §Motion Components | Not built |
| BackgroundSystem (subtle tint/texture) | `DESIGN_TOKENS.md` §Background Tint, §Noise Texture | Not built |

**Total: ~34 Foundation components/systems. 6 already exist from AUTH-01. 28 remain.**

---

## Shared Component Inventory

Used by 2+ features, not universal. **Recommendation: build just-in-time, inside whichever feature task first needs one** — not front-loaded here, since several depend on Phase 3 data shapes (Weather, Maps) that don't exist yet.

| Component | Used by | Likely first owner |
|---|---|---|
| ConnectionStatus, RetryCard | Chat, Trip Details, Dashboard error states | Whichever of CHAT-01/DASH-01 ships first |
| SearchOverlay / GlobalCommand | Dashboard, Trips, Destinations | DASH-01 |
| NotificationCenter shell | Global header, Dashboard | Unowned — flag when first needed |
| ProfileMenu | Global header | PROF-03 or DASH-01 |
| Breadcrumb, Pagination, Tabs, StepIndicator | Destination/Hotel/Flight/Trip/Settings | Phase 2+ (not yet Task-elaborated) |
| ImageGallery, Lightbox | Destination, Hotel, Trip photos | Phase 2+ |
| WeatherSummary/WeatherIcon (display-only) | Dashboard widget, Trip Details, Timeline | Phase 2+; live data is Phase 3 |
| MapPanel (chrome only, no live data) | Trip Details, Destination, Hotel | Phase 3 |

---

## Feature Component Mapping (Phase 1 Task-level only)

Phase 2+ modules (TRIPPLAN, TRIPDET, TIMELINE, AGENTS…) aren't elaborated to Task level yet, per the WBS's own rolling-wave approach — mapping their component consumption now would mean inventing task detail that doesn't exist yet. For defined Phase 1 tasks:

- **LAND-01/02** → consumes MarketingLayout, Button, Input (search variant). Owns (feature-only): HeroSection, AnimatedBackground, DestinationCarousel.
- **CHAT-01/02** → consumes ApplicationLayout or FocusLayout (TBD by implementer), Avatar, Skeleton. Owns: MessageBubble, StreamingBubble, TypingIndicator, ConversationList.
- **DASH-01** → consumes ApplicationLayout, Card, GlassCard, NotificationCenter (Shared). Owns: TravelSummaryHero, widget instances.
- **PROF-01/03** → consumes ApplicationLayout, Input family, ProfileMenu (Shared). Owns nothing uniquely foundational.
- **AUTH-03** (OAuth buttons) → consumes Button, IconButton only.
- **AUTH-05** (Login UI) → consumes AuthLayout, Input, Button, FormError — all ✅ already built by AUTH-01. Needs almost nothing new.
- **AUTH-02/04/06/07/08, MEM-01/02, PROF-02, LAND-03** → backend/logic-heavy; no material Foundation UI consumption.

---

## Part 4 — Proposed WBS Amendment

**New module: `DESIGNSYS`, Phase 1.** Suggested insertion point: after the Milestone M1 objective, before `Module: LAND` — foundational, so listed first. This does not alter LAND/AUTH/PROF/CHAT/MEM/DASH's own task order, numbering, or stated Dependencies; no existing task is modified.

### `ATLAS-P1-DESIGNSYS-01` — Design Token → CSS/Tailwind wiring + ThemeProvider
- Dependencies: none
- Required docs: `DESIGN_TOKENS.md` Parts 1–5, `DESIGN_SYSTEM.md`
- Priority: High (blocks the others in practice) | Complexity: M | Context: M
- Acceptance: every semantic token resolves as a real CSS variable; Light/Dark/System switch with no layout shift, <150ms, per `DESIGN_TOKENS.md` Part 5 §Runtime Theme Switching

### `ATLAS-P1-DESIGNSYS-02` — Core UI primitives
- Dependencies: DESIGNSYS-01
- Required docs: `COMPONENT_INVENTORY.md` (Foundation section), `DESIGN_TOKENS.md` Part 6, `ACCESSIBILITY.md`
- Priority: High | Complexity: L | Context: L
- Acceptance: reconciles with AUTH-01's existing Button/Input/Label/FormError first — extends, doesn't fork; every primitive typed, keyboard-operable, meets `MASTER_RULES.md` §12 contrast minimums

### `ATLAS-P1-DESIGNSYS-03` — Layout shells + navigation shell
- Dependencies: DESIGNSYS-01, DESIGNSYS-02
- Required docs: `APPLICATION_LAYOUT_GUIDE.md`, `RESPONSIVE_SYSTEM.md`
- Priority: High | Complexity: L | Context: L
- Acceptance: exactly the 4 approved layout types, no 5th introduced; AuthLayout verified against AUTH-01's existing one, not rebuilt

### `ATLAS-P1-DESIGNSYS-04` — Glass system + motion wrappers + BackgroundSystem
- Dependencies: DESIGNSYS-01
- Required docs: `DESIGN_TOKENS.md` §Atlas Glass Design Language, `MOTION_SYSTEM.md`, `PREMIUM_MICROINTERACTIONS.md`
- Priority: Medium | Complexity: M | Context: M
- Acceptance: exactly the 4 Glass Levels, no 5th; reduced-motion strips parallax/decorative motion but keeps state transitions, per `ACCESSIBILITY.md` §Motion Accessibility

**Practical sequencing note (informational, not a Dependencies edit):** LAND-01, CHAT-01, and DASH-01 will all want DESIGNSYS-01/02/03 done first in practice. Their formal `Dependencies` fields are untouched, per the instruction to preserve existing structure.

---

## Part 3 note — AUTH-01 refactor

Not done this session (nothing to refactor toward yet — the components DESIGNSYS-02 would produce don't exist). Recommend folding the reconciliation into DESIGNSYS-02's own acceptance criteria (above) rather than a separate blind refactor pass, so it happens once, against real components, with behavior/routing/validation unchanged as instructed.

---

## Downstream documents this would touch, once approved

- `TASK_BOARD.md` — 4 new Todo rows under a new DESIGNSYS grouping.
- `PROJECT_STATE.md` — "Next Task" note updated to surface DESIGNSYS-01 as newly available.
- `DEPENDENCY_GRAPH.md` — is `LOCKED`/`IMMUTABLE`, same tier as the Design Bible. Adding a DESIGNSYS box needs its own dated amendment, the same way Amendments 001–003 were handled — not a direct edit. Not done here.

None of the three are edited in this session.
