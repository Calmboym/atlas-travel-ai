# AI Travel Platform

# DESIGN SYSTEM

Version: 1.0

Status:
LOCKED

This document is the single source of truth for every visual and interaction decision.

No implementation may violate this document.

---

# 1. Design Philosophy

The interface should disappear behind the travel experience.

Users should think about their trip.

Not about how to use the interface.

Every interaction must reduce cognitive load.

Every screen must answer one primary question.

Every page must have one primary action.

Never compete for attention.

---

# 2. Experience Goals

The interface must feel:

Professional

Premium

Modern

Intelligent

Trustworthy

Calm

Fast

Human

Elegant

Not luxurious.

Not playful.

Not corporate.

---

# 3. Visual Inspiration

Study—not copy—

Apple

Airbnb

Linear

Notion

Stripe

Google Travel

Arc Browser

The final experience must become its own identity.

---

# 4. Design Keywords

Minimal

Elegant

Breathing Space

Focused

Readable

Calm

Premium

Soft Motion

Natural

Human

---

# 5. Color Philosophy

Color exists to communicate.

Never decorate.

Every color has meaning.

---

# 6. Primary Palette

Primary

Blue

Purpose:

Trust

Navigation

Primary CTA

AI identity

Secondary

Teal

Purpose

Discovery

Travel

Exploration

Accent

Amber

Purpose

Warnings

Travel alerts

Information

Success

Green

Purpose

Confirmed

Completed

Safe

Danger

Red

Purpose

Errors

Cancellation

Critical issues

Neutral

Warm Gray

Purpose

Typography

Borders

Surfaces

---

# 7. Semantic Colors

Every color token must exist.

Primary

Primary Hover

Primary Active

Secondary

Background

Surface

Surface Elevated

Border

Divider

Text Primary

Text Secondary

Text Disabled

Success

Warning

Danger

Info

Overlay

Skeleton

Selection

Focus Ring

Chart Colors

Never use raw HEX values inside components.

Use semantic design tokens only.

---

# 8. Theme

Supported Themes

Light

Dark

System Auto

System theme is default.

---

# 9. Typography

Characteristics

Readable

Modern

Open

Friendly

Never decorative.

Desktop

Hero XL

Hero L

H1

H2

H3

Body Large

Body

Body Small

Caption

Label

Button

Mobile scales independently.

Never use typography smaller than accessibility guidelines.

---

# 10. Spacing System

Only 8-point grid.

4

8

16

24

32

40

48

64

80

96

128

Never invent spacing.

---

# 11. Radius System

Small

Medium

Large

XL

Full

Cards use consistent radius.

Buttons use consistent radius.

---

# 12. Shadow System

Level 0

No elevation

Level 1

Cards

Level 2

Dropdown

Level 3

Modal

Level 4

Floating UI

Soft shadows only.

Never harsh.

---

# 13. Layout

Desktop

Maximum Content Width

1280px

Reading Width

720px

Dashboard Width

1440px

Sections always centered.

---

# 14. Grid

Desktop

12 Columns

Tablet

8 Columns

Mobile

4 Columns

---

# 15. Responsive Breakpoints

Mobile

Tablet

Laptop

Desktop

Ultra Wide

Layouts adapt.

Never scale blindly.

---

# 16. White Space

Whitespace is a feature.

Never fill empty areas unnecessarily.

Every section breathes.

---

# 17. Navigation

Sticky Navigation

Always visible.

Minimal.

Search

AI

Language

Theme

Profile

remain accessible.

---

# 18. Buttons

Primary

Secondary

Ghost

Danger

Icon

Loading

Disabled

Every button has hover, active, focus and loading states.

---

# 19. Forms

Forms should feel effortless.

Validation appears inline.

Never surprise users.

Errors explain solutions.

---

# 20. Cards

Cards are the primary information container.

Hotel Card

Flight Card

Destination Card

Trip Card

Recommendation Card

AI Suggestion Card

All share one visual language.

---

# 21. Icons

Lucide Icons

Consistent stroke width.

Never mix icon libraries.

---

# 22. Images

Large.

Beautiful.

Authentic.

Never stock-photo feeling.

Prioritize destination atmosphere.

---

# 23. Illustration Style

Minimal.

Flat.

Modern.

Used only when needed.

---

# 24. Motion Philosophy

Motion explains.

Motion guides.

Motion never distracts.

---

# 25. Motion Duration

Fast

Medium

Slow

No animation longer than necessary.

---

# 26. Page Transitions

Soft Fade

Soft Slide

No dramatic transitions.

---

# 27. Micro Interactions

Buttons

Inputs

Cards

Navigation

Language Switch

Theme Switch

Chat Messages

All receive subtle feedback.

---

# 28. Scroll Storytelling

Landing Page may contain storytelling sections.

Examples

Airplane flies across screen.

Cloud layers.

Moving landmarks.

Animated travel route.

Parallax mountains.

These animations are optional enhancements.

Content must remain usable without them.

---

# 29. Three.js Rules

Three.js is not used for decoration.

Only use when it improves storytelling.

Examples

Interactive Globe

Flight Path

Earth Rotation

Destination Visualization

Never use full-page heavy WebGL.

Lazy load all scenes.

---

# 30. GSAP Rules

GSAP is used for

Scroll Storytelling

Timeline Animations

Hero Animations

Section Reveals

Complex Motion

Never animate everything.

---

# 31. Howler.js Rules

Sound is optional.

Never autoplay.

Never block interaction.

Used only for meaningful confirmations.

---

# 32. Accessibility

WCAG 2.2 AA minimum.

Keyboard Navigation.

Screen Reader support.

Visible Focus.

Reduced Motion support.

Color contrast compliant.

---

# 33. Loading Experience

Skeletons.

Progressive loading.

Streaming.

Optimistic UI where appropriate.

Never blank screens.

---

# 34. Empty States

Every empty page teaches users what to do next.

Never simply display "No Data".

---

# 35. Error States

Explain

What happened.

Why.

What users can do next.

---

# 36. AI Experience

AI must always feel available.

One-click access.

Streaming responses.

Typing indicators.

Memory indicators.

Sources when appropriate.

---

# 37. Performance Budget

LCP target

< 2.5s

CLS

< 0.1

INP

< 200ms

Animations must never reduce Core Web Vitals.

---

# 38. SEO Rules

All marketing pages

SSG + ISR

Metadata required.

OpenGraph required.

Structured Data required.

Canonical URLs required.

---

# 39. Component Quality Rules

Every component must be

Reusable

Accessible

Responsive

Typed

Documented

Testable

Composable

---

# 40. Approved Libraries

Next.js

React

TailwindCSS

shadcn/ui

Radix UI

Framer Motion

GSAP

Three.js

Howler.js

React Hook Form

Zod

TanStack Query

next-intl

Lucide

Class Variance Authority

clsx

Motion One (only if justified)

Use MCP 21st.dev to discover high-quality component implementations.

Do not copy blindly.

Components must conform to this Design System.

---

# 41. Skills & MCP Usage

Before implementing any feature:

1. Review installed Claude Skills.
2. Use only skills that clearly improve implementation quality.
3. If multiple skills overlap, choose the most suitable one.
4. Use MCP 21st.dev as a reference source for production-grade UI patterns.
5. Adapt all imported ideas to this Design System.
6. Never let an external component override typography, spacing, colors, accessibility, or motion rules defined here.

---

END OF DOCUMENT
