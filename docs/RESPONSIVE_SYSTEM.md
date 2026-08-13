# 12_RESPONSIVE_SYSTEM.md

Status: LOCKED
Version: 1.0
Applies To: Entire AI Travel Platform
Priority: Mandatory

---

# Purpose

This document defines the responsive design system for the AI Travel Platform.

Every page, component, interaction, and layout must follow these rules.

Responsive behavior is part of the design system, not an implementation detail.

---

# Design Philosophy

The interface should feel native on every screen size.

Users should never feel like they are using a "shrunk desktop website" or a "stretched mobile app."

Each breakpoint should provide an optimized experience.

---

# Supported Devices

The platform officially supports:

• Mobile Phones

• Large Phones

• Foldable Phones

• Small Tablets

• Large Tablets

• Laptops

• Desktop Monitors

• Ultra-wide Monitors

Future mobile apps (Android / iOS) will follow the same design principles using native components.

---

# Mobile First

Development follows a Mobile First strategy.

Order:

Mobile

↓

Tablet

↓

Laptop

↓

Desktop

↓

Ultra-wide

Desktop layouts must never dictate mobile behavior.

---

# Official Breakpoints

Extra Small (XS)
0–479px

Small (SM)
480–639px

Medium (MD)
640–767px

Large (LG)
768–1023px

Extra Large (XL)
1024–1279px

2XL
1280–1535px

3XL
1536px+

These breakpoints are immutable.

---

# Layout Width

Maximum content width:

1440px

Reading width:

720–820px

Landing page hero sections may exceed content width for visual storytelling.

---

# Grid System

Desktop:

12-column grid

Tablet:

8-column grid

Mobile:

4-column grid

Spacing must remain consistent across all breakpoints.

---

# Container Padding

Mobile:

16px

Tablet:

24px

Desktop:

32px

Wide Desktop:

48px

Never allow content to touch screen edges.

---

# Responsive Spacing

Spacing scales proportionally.

Preferred spacing scale:

4

8

12

16

20

24

32

40

48

64

80

96

128

Arbitrary spacing values are discouraged.

---

# Responsive Typography

Typography scales fluidly.

Minimum body text:

16px

Desktop body:

17–18px

Headings increase proportionally.

Never reduce body text below 16px.

---

# Fluid Scaling

Prefer fluid sizing using CSS clamp().

Example philosophy:

Minimum

Preferred

Maximum

Avoid abrupt jumps between breakpoints.

---

# Images

Images scale responsively.

Never distort aspect ratio.

Preferred formats:

AVIF

WebP

Fallback:

JPEG

PNG only when transparency is required.

---

# Responsive Media

Videos

Maps

3D Canvas

Charts

must resize automatically while preserving aspect ratio.

---

# Hero Section

Landing page hero adapts:

Desktop:

Split layout

Tablet:

Balanced layout

Mobile:

Vertical stack

Primary CTA must remain visible without scrolling.

---

# Navigation

Desktop:

Top Navigation

Tablet:

Top Navigation

Mobile:

Bottom Navigation + Collapsible Menu

Navigation behavior remains consistent throughout the platform.

---

# Sidebar

Desktop:

Expanded

Laptop:

Collapsible

Tablet:

Hidden by default

Mobile:

Drawer

---

# Dashboard

Desktop:

Multi-column

Tablet:

Reduced columns

Mobile:

Single-column

Priority order:

Current chat

Trips

Recommendations

Recent activity

---

# AI Chat

Desktop:

Two-panel layout

Conversation

Optional context sidebar

Tablet:

Sidebar collapsible

Mobile:

Conversation only

Context accessed via bottom sheet.

---

# Cards

Cards expand naturally.

Avoid fixed heights.

Support dynamic content.

Equal heights only when visually necessary.

---

# Tables

Desktop:

Full table

Tablet:

Scrollable table

Mobile:

Card representation preferred

Never force horizontal scrolling unless unavoidable.

---

# Forms

Desktop:

Multi-column when appropriate

Mobile:

Single-column only

Touch-friendly spacing required.

---

# Buttons

Minimum size:

44 × 44 px

Preferred:

48 × 48 px

Primary actions remain thumb-friendly.

---

# Touch Zones

Interactive elements must never overlap.

Minimum spacing:

8px

Preferred:

12px

---

# Bottom Sheets

Preferred on mobile for:

Filters

Destination details

Trip actions

AI settings

Avoid modal overload.

---

# Modals

Desktop:

Centered modal

Tablet:

Large modal

Mobile:

Bottom sheet unless fullscreen is necessary.

---

# Floating Action Button

Allowed only where it improves usability.

Never use more than one FAB per screen.

---

# Search

Search remains prominent across all breakpoints.

Mobile search opens dedicated search interface.

Natural language input remains primary.

---

# Maps

Desktop:

Map + list

Tablet:

Switchable

Mobile:

Fullscreen map with draggable sheet

---

# Booking Flow

Desktop:

Multi-column review

Mobile:

Step-by-step flow

Reduce cognitive load on small screens.

---

# Sticky Elements

Allowed:

Navigation

Chat input

Primary booking CTA

Avoid excessive sticky UI.

---

# Safe Areas

Support device safe areas.

Required for:

iPhone Dynamic Island

Notch devices

Rounded corners

Foldables

System gesture areas

---

# Orientation

Support:

Portrait

Landscape

Landscape should never hide critical functionality.

---

# Foldable Devices

Support split-screen layouts.

Avoid assumptions about screen dimensions.

---

# Keyboard Behavior

On mobile:

Input fields remain visible when keyboard opens.

Chat input must never become hidden.

---

# Scrolling

Prefer vertical scrolling.

Avoid nested scrolling containers.

Horizontal scrolling only for exceptional content.

---

# Responsive Motion

Animations adapt by device.

Mobile:

Shorter

Simpler

Desktop:

More expressive

Reduced motion settings override all animations.

---

# Three.js

3D experiences are limited to:

Landing Page

Selected marketing sections

Never inside productivity workflows.

Disable automatically on:

Low-end devices

Battery saver

Reduced motion preference

Poor GPU performance

---

# Performance Rules

Responsive behavior must never degrade:

LCP

CLS

INP

Animation complexity must scale down on weaker devices.

---

# Offline Behavior

Responsive layouts remain fully functional offline where supported.

Cached content adapts identically across breakpoints.

---

# RTL Support

Responsive layouts must support:

LTR

RTL

Without layout breakage.

Spacing logic must use logical CSS properties whenever possible.

---

# Accessibility

Responsive changes must never reduce:

Keyboard usability

Screen reader compatibility

Touch accessibility

Contrast

Readable typography

---

# Testing Matrix

Every release must be tested on:

320px

375px

390px

414px

768px

834px

1024px

1280px

1440px

1920px

Landscape variants

Foldable emulation

---

# Browser Support

Latest two versions of:

Chrome

Safari

Firefox

Edge

Mobile Safari

Chrome Android

Graceful degradation for unsupported features.

---

# Quality Checklist

Every responsive layout must satisfy:

✓ No horizontal scrolling

✓ No clipped content

✓ Consistent spacing

✓ Fluid typography

✓ Accessible touch targets

✓ Correct navigation behavior

✓ Stable layout during resize

✓ Optimized media loading

✓ RTL compatibility

✓ Accessibility compliance

✓ Performance budget maintained

---

# Definition of Done

A responsive implementation is complete only if:

All breakpoints validated

All supported devices tested

Accessibility verified

Performance targets met

No layout regressions

Design review approved

Engineering review approved

QA approved

---

END OF DOCUMENT

LOCK STATUS:
IMMUTABLE
