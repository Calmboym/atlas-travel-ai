# Complete Dependency Graph

**Project:** Atlas — AI Travel Platform
**Date:** 2026-07-22
**Status:** LOCKED — Tier 1 (permanent point-in-time record). Approved 2026-07-22; the one cycle documented below is resolved via Amendment 002.

This graph is derived entirely from the source documents. Where the documents' own stated dependencies conflict (one cycle found — see below), the conflict is shown as-is, with the proposed resolution noted, rather than silently corrected.

---

## 1. System-Level Dependency Chain

From `ARCHITECTURE.md` §3, the runtime dependency order is strictly linear:

```
User
  ↓
Frontend Application (Next.js)
  ↓
Backend API Layer (FastAPI)
  ↓
AI Orchestration Layer
  ↓
Specialized AI Agents
  ↓
Tool Layer
  ↓
External APIs + Internal Services
  ↓
Database / Memory / Knowledge Base (PostgreSQL, Redis, Qdrant)
```

No shortcuts are permitted: `GUIDELINES.md` §9 explicitly forbids agents calling external APIs directly (must go through the Tool Layer) and forbids the frontend calling external APIs directly (must go through the Backend API Layer).

---

## 2. Module Dependency Order (Build Sequence)

Derived from `ROADMAP.md` + `ARCHITECTURE.md` §7. An arrow means "must exist, at least in scaffold form, before the next module can be meaningfully built."

```
Foundation (repo, Docker, DB connections, env)                [Phase 0 — DONE]
  ↓
Authentication Service  →  User Profile Service
  ↓                              ↓
Conversation Management  ←───────┘
  ↓
Basic (temporary) Memory
  ↓
AI Orchestrator  →  Agent Service  →  Core Agents (Destination, Itinerary,
  ↓                                    Recommendation, Budget, Traveler Profile)
Tool Service
  ↓
External Integration Adapters (Maps, Weather, Currency, Events)
  ↓
Domain Agents (Flight, Hotel, Visa, Transportation, Restaurant, Culture,
               Event, Translation, Safety, Currency, Packing)
  ↓
Long-Term Memory Service  →  Personalized Recommendations
  ↓
MVP Beta Hardening (security review, perf testing, AI evaluation)
  ↓
Booking / Communication Platform Expansion (Phase 6)
  ↓
Global Scale Features (Phase 7)
```

**No circular dependency exists at the system/module level.** The one cycle in the entire corpus is confined to two UI-experience documents (below).

---

## 3. Design Bible Document Dependency Graph

Using the proposed canonical numbering from `DOCUMENTATION_AUDIT_REPORT.md`, Finding 2.

```
01 Brand Guidelines            (no stated deps — foundational)
02 Product Vision              (no stated deps — foundational)
03 Design System                → 01, 02
04 Component Inventory          → 03
05 Information Architecture     → 02
06 User Flows                   → 05
07 Psychology Guidelines        (no stated deps — foundational)
08 Motion System                (no stated deps — foundational)
09 Accessibility                (no stated deps — foundational)
10 Content Strategy             (no stated deps — foundational)
11 Copywriting Guidelines       (no stated deps — foundational)
12 Responsive System            (no stated deps — foundational)
13 Iconography & Illustration   (no stated deps — foundational)
14 Design Tokens                (no stated deps — foundational, but consumed by nearly everything downstream)
15 Visual QA Checklist          → ALL prior (generic reference)
16 Onboarding Experience        (no declared deps — GAP, see Audit Finding 5)
17 AI Experience                (no declared deps — GAP, see Audit Finding 5)
18 Dashboard Experience         (no declared deps — GAP, see Audit Finding 5)
19 Trip Planning Experience     → 02, 03, 05, 06, 08, 14, 17, 18
20 Trip Details Experience      → 18, 19, 22 ⚠, 14, 08
21 Premium Microinteractions    → 03, 08, 14, 18, 19, 20
22 Travel Timeline Experience   → 05, 06, 04, 08, 14, 17, 18, 19, 20 ⚠, 21
23 Notification & Communication → 03, 08, 09, 10, 11, 14, 17, 20, 22
24 Design QA Checklist          → ALL Design Bible docs (generic reference)
25 Frontend Implementation      → ALL Design Bible docs + 22 (specific callout)
26 Application Layout Guide     (no declared deps — GAP, see Audit Finding 5)
```

**✅ Cycle resolved — Amendment 002, approved 2026-07-22.** Document 22's citation of Document 20 as a dependency is struck. **Document 20 → Document 22** is the sole, formal direction (consistent with Document 20's own text: *"The detailed behavior is defined in: 22..."*). Full record: `.ai/DESIGN_BIBLE_AMENDMENTS.md`, Amendment 002; original evidence in `DOCUMENTATION_AUDIT_REPORT.md`, Finding 1.

**Reading order implied by this graph, cycle now resolved:**
`01 → 02 → 03 → 04/05 → 06 → 07/08/09/10/11/12/13/14 → 15 → 16/17/18 → 19 → 22 → 20 → 21 → 23 → 24 → 25 → 26`

---

## 4. Phase 1 Feature Dependency Map (near-term, actionable)

```
Landing / Guest Entry
  ↓ (no auth required for guest chat)
AI Chat (guest, session-memory only)  ───────────┐
  ↓                                              │
Authentication (register / login / OAuth prep)   │
  ↓                                              │
Basic Profile (progressive collection)           │
  ↓                                              │
Persistent Memory (authenticated only)  ←────────┘ (guest → authenticated upgrade path)
  ↓
Dashboard shell (last-conversation landing)
```

Auth blocks persistent Profile and persistent Memory, but does **not** block guest-mode Chat or Landing — those can be built and demoed independently and in parallel. This matches `ONBOARDING_EXPERIENCE.md` §Guest Experience, which explicitly requires full guest functionality with no registration wall before value is demonstrated.

---

## 5. Cross-Phase Dependencies

| Phase | Depends on |
|---|---|
| Phase 2 — AI Agent System | Phase 1's Conversation Management + basic AI Orchestrator |
| Phase 3 — External Data Integration | Phase 2's Tool Service / Agent Service |
| Phase 4 — Personalized Intelligence | Phase 1's basic Memory **and** Phase 3's verified external data |
| Phase 5 — MVP Beta Release | All of Phases 1–4 (hardening phase, not a feature phase) |
| Phase 6 — Advanced Platform (booking, Telegram, mobile) | Phase 3's adapter architecture (new adapters, not new abstraction layers) |
| Phase 7 — Global Scale | Phase 6 |

No circular dependency exists across phases.

---

## 6. Findings Recap

- **1 circular dependency found**, confined to the Design Bible documentation layer (20 ↔ 22) — **resolved 2026-07-22 via Amendment 002.**
- **No circular dependencies** found at the system, module, phase, or agent level.
- **4 documents** (16, 17, 18, 26) declare no dependencies at all despite being heavily depended upon — a metadata gap, not a cycle.


---

**END OF DOCUMENT**

**LOCK STATUS:**
**IMMUTABLE — approved baseline, 2026-07-22, following Q1–Q4 sign-off.**
