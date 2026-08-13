# 22_TRAVEL_TIMELINE_EXPERIENCE.md

> **Status:** LOCKED
> **Version:** 1.0
> **Owner:** Product Design Team
> **Priority:** Core Product Experience
> **Dependencies:**
>
> - 05_INFORMATION_ARCHITECTURE.md
> - 06_USER_FLOWS.md
> - 07_COMPONENT_LIBRARY.md
> - 09_MOTION_SYSTEM.md
> - 14_DESIGN_TOKENS.md
> - 17_AI_EXPERIENCE.md
> - 18_DASHBOARD_EXPERIENCE.md
> - 19_TRIP_PLANNING_EXPERIENCE.md
> - 20_TRIP_DETAILS_EXPERIENCE.md
> - 21_PREMIUM_MICROINTERACTIONS.md

---

# Purpose

The Travel Timeline is the signature experience of Atlas.

Unlike traditional itinerary lists, the Timeline visualizes the entire journey as a continuous story.

The user should understand their trip in less than five seconds.

It answers:

- Where am I?
- What already happened?
- What is happening now?
- What happens next?
- What changed?
- What requires my attention?

The Timeline is not merely navigation.

It becomes the primary interaction model for the entire trip.

---

# Product Philosophy

The trip should feel alive.

Instead of browsing disconnected screens, users move through one continuous journey.

The Timeline becomes the visual heartbeat of Atlas.

---

# UX Goals

The Timeline should feel:

- effortless
- premium
- spatial
- predictable
- intelligent
- calm

Never:

- crowded
- technical
- spreadsheet-like
- overwhelming

---

# Timeline Orientation

Desktop:

Horizontal.

Mobile:

Horizontal swipe.

Tablet:

Horizontal with optional drag.

No vertical timeline is used as the primary experience.

---

# Structure

```

Trip

───────────────●────────●────────●────────●────────

Departure

↓

Flight

↓

Hotel

↓

Activities

↓

Return

```

Every stop represents a journey milestone.

---

# Timeline Levels

Atlas supports three zoom levels.

## Level 1 — Journey Overview

Displays:

- Departure
- Cities
- Flights
- Hotels
- Return

Purpose:

Understand the whole trip.

---

## Level 2 — Daily Timeline

Displays:

- Breakfast
- Museum
- Lunch
- Walking
- Train
- Dinner
- Hotel

Purpose:

Daily planning.

---

## Level 3 — Activity Timeline

Displays:

Minute-level scheduling.

Example:

```

09:00

↓

Metro

↓

09:30

↓

Temple

↓

11:00

↓

Coffee

```

---

# Timeline Sections

The timeline consists of:

- Journey Rail
- Milestones
- Progress Indicator
- Current Position
- Live Status
- Delay Indicators
- Weather Events
- AI Suggestions
- Completion Markers

---

# Journey Rail

The rail represents the complete journey.

Visual style:

- Thin
- Elegant
- Rounded
- Soft gradient
- Glass-compatible

The rail should never dominate the interface.

---

# Milestones

Each milestone is represented by a circular node.

Examples:

✈ Flight

🏨 Hotel

🍜 Restaurant

🎫 Reservation

🚆 Train

🏛 Museum

🌅 Sunset

📍 Landmark

---

# Milestone Size

Primary milestone

48px

Secondary

36px

Minor

28px

Touch target

Minimum 44px

---

# Current Position

Only one node is active.

Visual treatment:

- Brand accent
- Gentle pulse
- Soft glow
- Elevated shadow

Pulse repeats every 4–6 seconds.

Never continuously.

---

# Completed Milestones

Completed items display:

✓ Checkmark

Reduced emphasis

Muted colors

Accessible label:

Completed

Animation:

Fill transition

150ms

---

# Upcoming Milestones

Upcoming milestones remain:

Neutral

Readable

Low emphasis

Hover reveals preview.

---

# Delayed Milestones

Delay is communicated using:

Amber outline

Clock icon

Reason tooltip

Optional AI explanation

Never rely on color alone.

---

# Cancelled Milestones

Display:

Strike-through label

Muted opacity

Reason available

Alternative suggestion nearby.

---

# Timeline Progress

A progress indicator fills the journey rail.

Progress updates automatically.

Never animated continuously.

Only changes after events.

---

# Hover Interaction (Desktop)

Hovering over a milestone displays a floating information card.

Contains:

Activity

Time

Location

Weather

Reservation status

Estimated duration

Transportation

Quick actions

---

# Tap Interaction (Mobile)

Tapping opens a bottom sheet.

Bottom sheet contains:

Large title

Photos

Description

Map preview

Tickets

AI recommendations

Notes

Edit actions

Swipe down closes.

---

# Double Tap

Reserved for quick favorite (future).

Disabled in MVP.

---

# Long Press

Displays contextual menu.

Actions:

Edit

Duplicate

Move

Delete

Share

Ask AI

---

# Timeline Navigation

Supported interactions:

Mouse wheel

Trackpad

Horizontal drag

Touch swipe

Keyboard arrows

Mini-map jump

---

# Snap Behavior

Timeline snaps gently to milestones.

No aggressive magnetic behavior.

Snap duration:

180ms

---

# Zoom Behavior

Desktop:

Ctrl + Scroll

Trackpad pinch

Toolbar buttons

Mobile:

Pinch gesture

Toolbar controls

Zoom preserves current position.

---

# Mini Timeline

Long trips display a compressed overview.

Visible above the primary timeline.

Acts as navigation.

Current viewport highlighted.

---

# Sticky Current Position

While scrolling:

Current milestone remains partially visible.

Users should never lose context.

---

# Today Marker

If the trip spans multiple days:

A "Today" marker appears automatically.

Style:

Subtle

Brand accent

Accessible label

---

# Time Awareness

Past

↓

Now

↓

Upcoming

Time separation remains visually obvious.

---

# AI Integration

AI continuously monitors:

Weather

Traffic

Delays

Crowds

Reservations

Opening hours

Unexpected closures

Timeline updates intelligently.

---

# Dynamic Replanning

If an event changes:

Atlas updates only affected milestones.

Example:

Flight delayed.

Updated:

Airport arrival

Taxi

Hotel check-in

Dinner reservation

Nothing else changes.

---

# Change Visualization

Updated milestones animate softly.

Sequence:

Old state fades.

↓

Connector adjusts.

↓

New state appears.

↓

Small AI badge shown.

Duration:

250ms

---

# AI Explanation

Every automatic modification includes:

"What changed"

"Why"

"What was affected"

"What you can do"

Example:

> Heavy traffic is expected this afternoon.
>
> I moved your museum visit to tomorrow morning and replaced today's afternoon with an indoor café nearby.

---

# Weather Layer

Optional overlay.

Displays:

Rain

Snow

Heat

Wind

Storm

Weather icons remain secondary.

---

# Transportation Layer

Transportation connectors display:

Walking

Taxi

Metro

Train

Flight

Bus

Ferry

Each has a unique icon.

---

# Reservation Layer

Reservation status appears directly on milestones.

States:

Booked

Pending

Checked-in

Expired

Cancelled

---

# Notification Layer

Timeline notifications include:

Gate changed

Restaurant confirmed

Museum closed

Weather warning

AI optimization

Displayed as small badges.

---

# Collaboration (Future)

Timeline supports:

Traveler cursors

Comments

Approval markers

Assignments

Voting

Hidden until feature release.

---

# Offline Mode

Offline users can:

Browse timeline

Open cached details

Read reservations

View maps (cached)

Create notes

Pending edits synchronize later.

---

# Accessibility

Supports:

Keyboard navigation

Screen readers

Reduced motion

Large text

Voice navigation

High contrast

Every milestone has:

ARIA label

Accessible status

Time description

---

# Performance

Requirements:

Initial render:

<200ms

Virtual rendering for long trips.

Only visible milestones mounted.

60 FPS scrolling.

No layout shifts.

---

# Responsive Behavior

Desktop:

Full-width timeline.

Tablet:

Reduced spacing.

Mobile:

Swipe-first interaction.

Bottom sheets replace hover.

---

# Empty State

Before planning:

Illustration

Message:

> Your journey begins here.

Primary CTA:

Start Planning

---

# Emotional Design

Users should feel:

"My trip has a clear story."

"I always know where I am."

"I trust the AI."

"I can change anything."

"My journey feels organized."

---

# Anti-Patterns

Never use:

- giant timelines
- endless scrolling
- flashing progress bars
- auto-scrolling without permission
- bouncing milestones
- overwhelming labels
- overlapping cards
- forced animations
- tiny touch targets

---

# Success Metrics

- Timeline engagement rate
- Daily timeline interactions
- AI optimization acceptance
- Milestone completion rate
- Timeline navigation time
- Edit frequency
- User confidence score
- Session duration during travel
- Timeline-related support requests

---

# Definition of Done

The Travel Timeline is complete only when:

- Users understand the entire journey within seconds.
- Timeline navigation feels natural across every device.
- AI updates occur transparently without disrupting user trust.
- Every milestone can be explored, edited, and understood with minimal effort.
- The Timeline becomes Atlas's most recognizable and memorable product experience.
