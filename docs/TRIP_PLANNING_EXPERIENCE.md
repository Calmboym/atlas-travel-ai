# 19_TRIP_PLANNING_EXPERIENCE.md

> **Status:** LOCKED
> **Version:** 1.0
> **Owner:** Product Design Team
> **Dependencies:**
>
> - 02_PRODUCT_VISION.md
> - 03_DESIGN_PRINCIPLES.md
> - 05_INFORMATION_ARCHITECTURE.md
> - 06_USER_FLOWS.md
> - 09_MOTION_SYSTEM.md
> - 14_DESIGN_TOKENS.md
> - 17_AI_EXPERIENCE.md
> - 18_DASHBOARD_EXPERIENCE.md

---

# Purpose

Trip Planning is the heart of Atlas.

Everything in the product exists to make this experience feel like collaborating with an expert travel companion—not filling out a complicated booking form.

The planning experience must transform:

> "I want to go somewhere in October."

into

> a complete, editable, intelligent travel plan within minutes.

The process should feel:

- calm
- conversational
- visual
- adaptive
- trustworthy
- enjoyable

Never overwhelming.

---

# Primary UX Philosophy

The user should never feel like they are configuring software.

Instead they should feel like they are discussing travel with someone experienced.

Atlas asks only what is necessary.

It predicts everything else.

---

# User Journey Overview

The planning experience consists of six stages.

```text id="fk83p0"
Dream

↓

Understand

↓

Design

↓

Review

↓

Refine

↓

Start Trip
```

Each stage has a unique emotional objective.

| Stage | Emotional Goal |
|---|---|
| Dream | Excitement |
| Understand | Confidence |
| Design | Surprise |
| Review | Trust |
| Refine | Control |
| Start Trip | Anticipation |

---

# Entry Points

Users may begin planning from multiple locations.

## Landing Page

Primary CTA:

Start Planning

---

## Dashboard

Floating action:

```text id="d53cla"
+ New Trip
```

---

## AI Chat

Natural language:

> Plan a week in Japan.

---

## Saved Destination

Every destination card includes:

Plan Trip

---

## Previous Trip

Duplicate Trip

Edit Existing

---

# Step 1 — Dream

Purpose:

Capture intent with almost zero friction.

---

Screen contains:

- Large greeting
- Minimal layout
- Single AI input
- Example prompts
- Suggested destinations
- Recent searches

---

Example prompts:

```text id="o7m28p"
A romantic weekend in Italy

Family vacation in Thailand

Cheap trip from Germany

7 days in Japan

Winter adventure

Beach with nightlife

Solo backpacking

Luxury honeymoon
```

---

No forms.

No filters.

Conversation first.

---

# AI Input Behavior

Supports:

- Natural language
- Voice
- Paste itinerary
- Image inspiration (future)
- PDF import (future)

Input expands automatically.

Supports multiple languages.

---

# AI Understanding Phase

After submission Atlas immediately begins reasoning.

Loading state should feel alive.

Never static.

---

Animated reasoning messages rotate.

Examples:

```text id="idrq3t"
Finding ideal destinations...

Checking seasons...

Comparing flight routes...

Estimating budget...

Looking for hidden gems...

Building itinerary...

Almost ready...
```

No fake percentages.

Never show:

```text id="k2h4z1"
87%
```

Instead show progress through meaningful actions.

---

# AI Reasoning Visualization

Use an elegant vertical activity stream.

Each completed reasoning task receives:

- Animated completion checkmark
- Subtle motion
- Soft glow

No aggressive loaders.

Estimated duration:

5–20 seconds.

---

# Step 2 — Clarification

Atlas should avoid asking unnecessary questions.

Maximum:

3 clarification questions.

If confidence is already high:

Ask zero.

---

Questions should appear conversationally.

Example:

> Are you traveling alone or with someone?

User answers.

Next appears naturally.

---

Avoid long questionnaires.

---

Possible clarification topics:

- Travelers
- Budget
- Dates
- Transportation
- Accommodation
- Visa constraints
- Accessibility
- Children
- Pets
- Food preferences
- Activity level
- Weather preference
- Language

Questions should adapt dynamically.

Not fixed order.

---

# Smart Assumptions

Atlas should intelligently infer:

- Preferred airport
- Likely currency
- Season expectations
- Trip length
- Transport preference
- Walking tolerance
- Typical accommodation level

unless user overrides.

Every assumption must be editable later.

---

# Step 3 — Plan Generation

After understanding intent Atlas begins composing the trip.

This is the product's biggest delight moment.

---

# Animation

The interface gradually assembles itself.

- Destination appears
- Hero image fades in
- Weather loads
- Budget estimate appears
- Timeline builds
- Map appears
- Recommendations populate

Everything arrives progressively.

Not all at once.

---

# Perceived Performance

Prioritize perceived speed over absolute completion.

Show usable information immediately.

Lazy-load secondary sections.

---

# Generated Plan Structure

Every generated plan includes:

- Destination
- Trip summary
- Dates
- Budget
- Transportation
- Accommodation
- Daily itinerary
- Restaurants
- Activities
- Reservations
- Weather
- Packing advice
- Local tips
- Emergency info
- Offline resources
- Maps
- Notes
- AI recommendations

Nothing feels hidden.

Everything remains editable.

---

# Information Hierarchy

Priority order:

```text id="g8f4q2"
Destination

↓

Timeline

↓

Daily schedule

↓

Budget

↓

Reservations

↓

Recommendations

↓

Details
```

The user always understands:

- Where am I?
- What happens next?
- How much does it cost?

---

# Destination Hero

Large immersive hero.

Includes:

- Destination image
- City
- Country
- Travel score
- Best season
- Quick weather
- Duration
- Estimated budget
- Travel style tags

Example:

```text id="ml90ep"
Tokyo

★★★★☆

October

22°C

7 Days

Adventure

Food

Culture
```

---

# AI Summary

Immediately beneath hero.

Short.

Warm.

Readable in under 20 seconds.

Example:

> This itinerary balances iconic landmarks with quiet neighborhoods, leaving enough flexibility to explore without feeling rushed.

No marketing language.

No exaggerated enthusiasm.

---

# Editable Sections

Every block supports editing.

Examples:

- Change hotel
- Replace museum
- Move activity
- Increase budget
- Remove restaurant
- Add hiking
- Add free day

Changes happen inline.

No modal overload.

---

# AI Assisted Editing

User can simply write:

```text id="07qa56"
Too expensive.
```

Atlas updates:

- Hotels
- Transportation
- Restaurants
- Activities
- Budget
- Timeline

without rebuilding everything.

---

# Continuous Planning

Planning never ends after generation.

The itinerary remains alive.

Every change triggers intelligent recalculation.

Only affected sections update.

Everything else stays stable.

This preserves user trust.

---

# Daily Itinerary Design

Each day becomes a collapsible card.

Contains:

- Morning
- Afternoon
- Evening
- Transportation
- Reservations
- Weather
- Walking distance
- Estimated cost
- Duration
- Notes

---

# Daily Flow

Morning begins at top.

Natural downward reading.

Cards connected through subtle timeline indicators.

Never dense.

---

# Drag & Drop

Users can:

- Move activities
- Swap days
- Duplicate events
- Delete items
- Insert breaks
- Reorder meals

Every movement animates naturally.

---

# AI Reaction to Changes

After user modifies itinerary:

Small assistant notification appears.

Example:

> I noticed this creates a long travel day. Want me to optimize it?

One-click:

- Optimize
- Ignore

Never interrupt.

Never force.

---

# Budget Integration

Budget updates continuously.

Changing:

- Hotel
- Flight
- Activity
- Transportation
- Food

immediately refreshes totals.

Changes animate smoothly.

Never flash.

---

# Availability Awareness

Future integrations may display:

- Fully booked
- Limited availability
- Weather warning
- Holiday closures
- Local festivals

These appear as subtle informational banners.

Never alarming unless critical.

---

# Plan Confidence

Atlas internally computes planning confidence.

High confidence:

No warning.

Medium:

Suggest review.

Low:

Highlight uncertainty.

Example:

> Restaurant hours may change seasonally.

Transparency builds trust.

---

# Saving Plans

Saving is automatic.

No Save button required.

Status indicator:

```text id="v6m8r4"
Saving...

Saved

Offline Saved

Conflict Resolved
```

No intrusive notifications.

---

# Multiple Versions

Users can create itinerary variants.

Examples:

- Budget Version
- Luxury Version
- Rain Version
- Family Version
- Solo Version

Switching between versions is instant.

---

# Collaboration (Future)

Future support:

- Invite travelers
- Shared editing
- Comments
- Voting
- Approval flow
- Task assignments

Design now to accommodate later.

---

# AI Memory

Atlas remembers:

- Preferred pace
- Favorite cuisines
- Hotel standards
- Transport choices
- Budget behavior
- Activity interests
- Accessibility preferences

Future plans become smarter.

---

# Error Recovery

If generation fails:

Never display technical errors.

Instead:

> I couldn't finish building your itinerary just yet. I'm trying again.

Retry automatically.

Allow manual retry.

---

# Offline Behavior

Previously generated plans remain available.

Users can:

- Browse
- Read
- Edit notes
- Access maps (cached)
- View reservations

Offline indicators remain subtle.

---

# Mobile Experience

Planning on mobile prioritizes:

- Conversation
- Timeline
- Today's schedule
- Swipe navigation
- Bottom sheets
- Sticky AI input
- One-handed interaction

Everything optimized for thumb reach.

---

# Accessibility

Support:

- Keyboard navigation
- Screen readers
- Reduced motion
- Voice input
- Large text
- High contrast
- Touch targets ≥44px
- ARIA labels
- Focus management

---

# Emotional Principles

Users should consistently feel:

> "I know what's happening."

> "I can change anything."

> "The AI understands me."

> "My trip belongs to me."

> "I'm excited."

Never:

> "I'm filling out software."

> "I'll lose my work."

> "The AI took control."

> "I'm overwhelmed."

---

# Success Metrics

Primary KPIs:

- Time to first itinerary
- Planning completion rate
- Number of edits per trip
- Saved itinerary rate
- Return planning sessions
- AI acceptance rate
- User satisfaction score
- Planning abandonment rate
- Average refinement cycles
- Time to confidence

---

# Definition of Done

Trip Planning is complete only when:

- A first-time user can generate a complete itinerary in minutes with minimal input.
- Every part of the itinerary is editable without friction.
- AI adapts incrementally instead of rebuilding unnecessarily.
- Planning feels like a collaborative conversation, not a configuration wizard.
- Users always understand the current state, upcoming steps, and impact of every change.
- The experience consistently reflects Atlas's premium, calm, intelligent travel companion identity.
