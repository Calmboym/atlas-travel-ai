# 14_DESIGN_TOKENS.md

Status: LOCKED
Version: 1.0
Applies To: Entire AI Travel Platform
Priority: CRITICAL

---

# Purpose

This document defines the complete Design Token System for the AI Travel Platform.

Design Tokens are the single source of truth for every visual decision across the platform.

Every UI component, page, animation, theme, and future mobile application must consume these tokens instead of hardcoded values.

No visual value may be introduced outside this document.

---

# Token Philosophy

Design Tokens exist to ensure:

• Visual consistency

• Maintainability

• Theme scalability

• Accessibility

• Developer productivity

• Future platform expansion

Every visual property should originate from a semantic token.

Hardcoded values are prohibited.

---

# Token Hierarchy

The token hierarchy consists of four layers:

Primitive Tokens

↓

Semantic Tokens

↓

Component Tokens

↓

Runtime Theme Tokens

Each layer builds upon the previous one.

Components must never consume primitive tokens directly.

---

# Naming Convention

All tokens use lowercase kebab-case.

Examples:

color-primary

spacing-6

radius-lg

shadow-md

duration-normal

Never use spaces.

Never use camelCase.

Never abbreviate unnecessarily.

---

# Token Categories

The official token categories are:

Colors

Typography

Spacing

Sizing

Radius

Borders

Elevation

Opacity

Motion

Breakpoints

Containers

Grid

Icons

Z-index

Blur

Transitions

Themes

States

---

# Primitive Color Tokens

Primitive colors represent raw color values.

They never reference UI meaning.

Example naming:

blue-50

blue-100

blue-200

...

blue-900

Gray follows the same pattern.

Semantic colors are built on top of primitives.

---

# Semantic Color Philosophy

Semantic tokens describe purpose.

Never describe appearance.

Correct:

color-success

color-background

color-primary

Incorrect:

green-dark

blue-light

---

# Theme Structure

Every semantic token supports:

Light Theme

Dark Theme

Future High Contrast Theme

Future AMOLED Theme

Component code never checks theme manually.

Theme Provider resolves token values automatically.

---

# Color Token Groups

Official groups:

Primary

Secondary

Accent

Success

Warning

Error

Info

Background

Surface

Border

Text

Overlay

Focus

Selection

Disabled

Interactive

---

# Theme Switching

Supported modes:

Light

Dark

System

Theme switching is instant.

No layout shift is permitted.

Token transitions should be smooth.

---

# Theme Inheritance

Component Tokens

↓

Semantic Tokens

↓

Primitive Tokens

Theme switching replaces semantic mappings only.

Primitive tokens remain unchanged.

---

# CSS Variable Convention

Every semantic token has a CSS variable.

Example:

--color-primary

--color-text-primary

--color-surface

--spacing-4

--radius-lg

--shadow-md

Developers must consume variables instead of literal values.

---

# Component Independence

Buttons

Cards

Inputs

Dialogs

Navigation

Chat

Maps

must reference semantic tokens only.

Component-specific colors are forbidden unless explicitly defined.

---

# Color Decisions

Colors communicate meaning.

Never decoration.

Examples:

Primary

Interactive actions

Success

Completed actions

Warning

Attention required

Error

Blocking issue

Info

Helpful guidance

Neutral

Supporting UI

---

# Accessibility Requirement

Every semantic color combination must satisfy WCAG AA.

Dark mode and light mode are validated independently.

---

# State Tokens

Every interactive component supports:

Default

Hover

Pressed

Focused

Disabled

Loading

Selected

Active

Visited (where applicable)

Each state maps to semantic tokens.

---

# Future Compatibility

The token architecture is designed to support:

Android

iOS

Desktop

Tablet

Future Design Systems

without changing component APIs.

---

# Token Versioning

Design Tokens follow semantic versioning.

Major

Breaking changes

Minor

New tokens

Patch

Value adjustment

Deprecated tokens remain available until the next major release.

---

# Source of Truth

Design Tokens originate from this document.

Implementation files are generated from these specifications.

No implementation file becomes the source of truth.

---

# Governance

Changes require approval from:

Design

Frontend

Accessibility

Product

Architecture

No team may modify tokens independently.

---

---

# Primitive Color Tokens

Primitive tokens represent raw color values.

They contain no semantic meaning.

They are never referenced directly by components.

Semantic tokens map to primitive tokens.

---

# Neutral Palette

The Neutral palette is the foundation of the interface.

It defines backgrounds, text, borders, overlays, shadows, and grayscale UI elements.

| Token | HEX |
|-------|------|
| neutral-0 | #FFFFFF |
| neutral-25 | #FCFCFD |
| neutral-50 | #F8FAFC |
| neutral-100 | #F1F5F9 |
| neutral-200 | #E2E8F0 |
| neutral-300 | #CBD5E1 |
| neutral-400 | #94A3B8 |
| neutral-500 | #64748B |
| neutral-600 | #475569 |
| neutral-700 | #334155 |
| neutral-800 | #1E293B |
| neutral-900 | #0F172A |
| neutral-950 | #020617 |

---

# Primary Palette

Primary represents Atlas.

It communicates trust, intelligence and confidence.

Blue is intentionally calm rather than saturated.

| Token | HEX |
|-------|------|
| primary-50 | #EEF4FF |
| primary-100 | #DCE8FF |
| primary-200 | #B8D3FF |
| primary-300 | #86B5FF |
| primary-400 | #5A97FF |
| primary-500 | #2F6BFF |
| primary-600 | #2558E6 |
| primary-700 | #1E47BF |
| primary-800 | #183A99 |
| primary-900 | #112A6F |

Primary-500 is the official Brand Color.

No alternative brand color is permitted.

---

# Accent Palette

Accent colors create moments of delight.

They are never used as the primary identity.

Accent should occupy less than 10% of any screen.

| Token | HEX |
|-------|------|
| accent-50 | #EFFCF8 |
| accent-100 | #D6F8ED |
| accent-200 | #A8EFD8 |
| accent-300 | #6CE2BF |
| accent-400 | #39D3A8 |
| accent-500 | #12C48F |
| accent-600 | #0EA777 |
| accent-700 | #0A8860 |
| accent-800 | #086C4D |
| accent-900 | #05523A |

---

# Success Palette

| Token | HEX |
|-------|------|
| success-50 | #F0FDF4 |
| success-100 | #DCFCE7 |
| success-200 | #BBF7D0 |
| success-300 | #86EFAC |
| success-400 | #4ADE80 |
| success-500 | #22C55E |
| success-600 | #16A34A |
| success-700 | #15803D |
| success-800 | #166534 |
| success-900 | #14532D |

---

# Warning Palette

| Token | HEX |
|-------|------|
| warning-50 | #FFFBEB |
| warning-100 | #FEF3C7 |
| warning-200 | #FDE68A |
| warning-300 | #FCD34D |
| warning-400 | #FBBF24 |
| warning-500 | #F59E0B |
| warning-600 | #D97706 |
| warning-700 | #B45309 |
| warning-800 | #92400E |
| warning-900 | #78350F |

---

# Error Palette

| Token | HEX |
|-------|------|
| error-50 | #FEF2F2 |
| error-100 | #FEE2E2 |
| error-200 | #FECACA |
| error-300 | #FCA5A5 |
| error-400 | #F87171 |
| error-500 | #EF4444 |
| error-600 | #DC2626 |
| error-700 | #B91C1C |
| error-800 | #991B1B |
| error-900 | #7F1D1D |

---

# Info Palette

| Token | HEX |
|-------|------|
| info-50 | #EFF6FF |
| info-100 | #DBEAFE |
| info-200 | #BFDBFE |
| info-300 | #93C5FD |
| info-400 | #60A5FA |
| info-500 | #3B82F6 |
| info-600 | #2563EB |
| info-700 | #1D4ED8 |
| info-800 | #1E40AF |
| info-900 | #1E3A8A |

---

# Glass Tokens

These tokens define the Atlas Glass Design Language.

Glass is subtle.

Glass is never opaque.

Glass is never dominant.

| Token | Value |
|--------|-------|
| glass-opacity-light | 0.55 |
| glass-opacity-medium | 0.72 |
| glass-opacity-strong | 0.84 |
| glass-blur-xs | 4px |
| glass-blur-sm | 8px |
| glass-blur-md | 12px |
| glass-blur-lg | 20px |
| glass-blur-xl | 28px |
| glass-border-opacity | 0.18 |
| glass-highlight-opacity | 0.35 |

Glass surfaces should always include:

• subtle backdrop blur

• thin border

• soft elevation

• translucent background

Never use heavy frosted effects.

---

# Semantic Color Mapping (Light Theme)

Background

color-background → neutral-25

Surface

color-surface → neutral-0

Secondary Surface

color-surface-secondary → neutral-50

Elevated Surface

color-surface-elevated → neutral-0

Primary Text

color-text-primary → neutral-900

Secondary Text

color-text-secondary → neutral-600

Muted Text

color-text-muted → neutral-500

Border

color-border → neutral-200

Divider

color-divider → neutral-100

Primary Action

color-primary → primary-500

Primary Hover

color-primary-hover → primary-600

Primary Active

color-primary-active → primary-700

Success

color-success → success-500

Warning

color-warning → warning-500

Danger

color-error → error-500

Information

color-info → info-500

Glass

color-glass → rgba(255,255,255,0.65)

Glass Border

color-glass-border → rgba(255,255,255,0.18)

Glass Highlight

rgba(255,255,255,0.35)

---

# Design Rule

No component may directly consume:

primary-500

neutral-900

success-500

or any primitive token.

Components consume only semantic tokens.

This guarantees unlimited theme expansion.

---

---

# Atlas Glass Design Language

Status: LOCKED

The Atlas interface is built upon a restrained Glass Design Language.

Glass is not a visual effect.

Glass is part of the brand identity.

It communicates:

• Trust

• Calmness

• Sophistication

• Depth

• Premium quality

Glass should never dominate the interface.

Content is always more important than decoration.

---

# Glass Philosophy

Glass exists to separate information layers while maintaining visual continuity.

The interface should feel:

Light

Elegant

Airy

Comfortable

Timeless

Never futuristic.

Never cyberpunk.

Never neon.

Never gaming inspired.

---

# Glass Surface Types

Atlas defines four official glass levels.

Only these four are allowed.

---

## Glass Level 1

Purpose

Navigation

Toolbar

Floating Controls

Opacity

0.58

Blur

10px

Border

1px

Shadow

XS

Usage

Most common glass layer.

---

## Glass Level 2

Purpose

Cards

Widgets

Panels

Opacity

0.68

Blur

16px

Border

1px

Shadow

SM

Most dashboard cards use this level.

---

## Glass Level 3

Purpose

Dialogs

Large Panels

Timeline Details

AI Context Panels

Opacity

0.80

Blur

24px

Border

1px

Shadow

MD

Reserved for high focus areas.

---

## Glass Level 4

Purpose

Modal Background

Special Landing Sections

Hero Storytelling

Opacity

0.88

Blur

32px

Border

1px

Shadow

LG

Should be used sparingly.

---

# Background Tint

Glass never floats on a pure white surface.

Every glass panel inherits subtle background tint.

Light Theme

Very light neutral

Dark Theme

Dark blue-neutral

Never completely transparent.

---

# Glass Borders

Glass borders are always subtle.

Default

1px

Hover

1.2px visual emphasis

Maximum opacity

22%

Minimum opacity

14%

Never use thick borders.

---

# Glass Highlights

Every glass panel contains a subtle internal highlight.

Purpose

Simulate light reflection.

Maximum opacity

8%

Never use strong white streaks.

---

# Glass Shadows

Atlas uses layered shadows.

Instead of one large shadow.

Preferred structure

Small shadow

↓

Soft shadow

↓

Ambient shadow

This produces natural depth.

Hard shadows are forbidden.

---

# Corner Radius

Glass components use generous radius.

Navigation

24px

Cards

24px

Dialogs

28px

Floating Panels

32px

Bottom Sheets

32px

Never mix different radius values inside the same component.

---

# Internal Padding

Cards breathe.

Minimum

20px

Preferred

24px

Large Panels

32px

No dense layouts.

---

# Card Density

Atlas follows

Comfortable Density

Large whitespace.

Readable content.

Low visual stress.

Compact layouts are reserved for data-heavy admin screens.

---

# Surface Elevation

Elevation represents importance.

Higher elevation

Higher attention.

Glass level and elevation must remain consistent.

Never create random floating cards.

---

# Hover Behavior

Hover never surprises.

Allowed

Slight elevation

Small shadow increase

Border refinement

2–4% brightness increase

Forbidden

Large scaling

Rotation

Bounce

Elastic animation

Glow explosions

---

# Press State

Pressed components move

1–2px

toward the surface.

Shadow decreases.

Feedback must feel physical.

---

# Focus State

Keyboard focus is mandatory.

Focus ring

2px

Primary color

Outside border

Never hidden.

---

# Motion

Glass panels animate softly.

Duration

180–260ms

Curve

Ease Out

Movement

4–8px

Maximum opacity change

10%

Never fade from 0%.

---

# Layer Hierarchy

Official order

Background

↓

Illustration

↓

Glass Panels

↓

Interactive Controls

↓

Floating Actions

↓

Dialogs

↓

Notifications

↓

System Overlay

Never violate hierarchy.

---

# Noise Texture

Optional.

Very subtle.

Maximum opacity

2%

Purpose

Reduce digital flatness.

Never visible as a pattern.

---

# Reflection

Allowed only on:

Landing Hero

Marketing Cards

Never inside productivity workflows.

---

# Frost Effect

Glass should remain readable.

Blur should never make text difficult to read.

Readability always wins.

---

# Dashboard Style

Dashboard should resemble a premium workspace.

Characteristics

Wide margins

Rounded containers

Large cards

Breathing room

Soft hierarchy

No visual clutter.

---

# Landing Style

Landing page may be slightly more expressive.

Allowed

Large glass hero

Floating illustrations

Animated gradients

3D globe

Animated airplane

Glass CTA

The Dashboard should be calmer.

---

# Timeline Glass

The Travel Timeline uses:

Glass Level 2

Current Event

Glass Level 3

Hovered Event

Glass Level 4

This naturally guides user attention.

---

# AI Chat Glass

Conversation remains easy to read.

Assistant Messages

Soft Surface

User Messages

Primary Glass

Streaming Panel

Glass Level 2

Context Panel

Glass Level 3

---

# Mobile Adaptation

Blur automatically decreases.

Desktop

16–24px

Tablet

12–18px

Mobile

8–14px

Performance has priority.

---

# Reduced Transparency

If the operating system requests reduced transparency:

Disable blur.

Replace with elevated solid surfaces.

Maintain identical spacing and hierarchy.

---

# Performance Budget

Maximum simultaneous live blur layers

Desktop

8

Tablet

6

Mobile

4

Avoid stacking glass over glass.

---

# Accessibility

Contrast always satisfies WCAG AA.

Glass never reduces readability.

Text never sits directly on busy photography.

---

# Definition of Done

A Glass component is complete only if:

✓ Uses approved Glass Level

✓ Uses semantic tokens

✓ Uses official radius

✓ Uses official spacing

✓ Meets accessibility contrast

✓ Meets performance budget

✓ Matches Atlas visual identity

✓ Passes design review

---

---

# Typography Tokens

Typography is one of the strongest elements of the Atlas brand.

It should communicate:

• Calmness

• Confidence

• Precision

• Readability

Typography must remain highly readable in all supported languages.

---

# Font Families

Primary UI Font

Plus Jakarta Sans

Fallback

Inter

System UI

sans-serif

Persian

Vazirmatn

Fallback

IRANSansX

System UI

Arabic

IBM Plex Sans Arabic

German

Plus Jakarta Sans

English

Plus Jakarta Sans

No additional font families are permitted.

---

# Font Weights

| Token | Value |
|--------|-------|
| font-thin | 100 |
| font-extra-light | 200 |
| font-light | 300 |
| font-regular | 400 |
| font-medium | 500 |
| font-semibold | 600 |
| font-bold | 700 |
| font-extra-bold | 800 |

Default UI Weight

400

Buttons

600

Navigation

500

Cards

400

Titles

700

---

# Font Scale

| Token | Size |
|--------|------|
| text-2xs | 10px |
| text-xs | 12px |
| text-sm | 14px |
| text-base | 16px |
| text-lg | 18px |
| text-xl | 20px |
| text-2xl | 24px |
| text-3xl | 30px |
| text-4xl | 36px |
| text-5xl | 48px |
| text-6xl | 60px |
| text-7xl | 72px |

---

# Fluid Typography

Headings should scale using CSS clamp().

Example philosophy:

Minimum

↓

Preferred

↓

Maximum

Typography should grow smoothly.

Never jump abruptly at breakpoints.

---

# Line Heights

| Token | Value |
|--------|-------|
| leading-tight | 1.2 |
| leading-snug | 1.35 |
| leading-normal | 1.5 |
| leading-relaxed | 1.65 |
| leading-loose | 1.8 |

Body

1.5

Large paragraphs

1.65

---

# Letter Spacing

| Token | Value |
|--------|-------|
| tracking-tight | -0.03em |
| tracking-normal | 0 |
| tracking-wide | 0.02em |

Headings

Slightly tighter.

Body

Normal.

Captions

Slightly wider.

---

# Spacing System

Atlas uses a 4px spacing grid.

No custom spacing values.

---

# Spacing Tokens

| Token | Value |
|--------|-------|
| space-0 | 0 |
| space-1 | 4px |
| space-2 | 8px |
| space-3 | 12px |
| space-4 | 16px |
| space-5 | 20px |
| space-6 | 24px |
| space-8 | 32px |
| space-10 | 40px |
| space-12 | 48px |
| space-16 | 64px |
| space-20 | 80px |
| space-24 | 96px |
| space-32 | 128px |

Spacing outside this scale is prohibited.

---

# Component Spacing

Button Padding

Horizontal

24px

Vertical

12px

Input Padding

16px

Card Padding

24px

Section Padding

64px Desktop

48px Tablet

32px Mobile

Container Gap

24px

Grid Gap

24px

---

# Radius Tokens

Atlas uses generous rounded geometry.

| Token | Value |
|--------|-------|
| radius-none | 0 |
| radius-xs | 4px |
| radius-sm | 8px |
| radius-md | 12px |
| radius-lg | 16px |
| radius-xl | 20px |
| radius-2xl | 24px |
| radius-3xl | 32px |
| radius-full | 999px |

Preferred Card Radius

24px

Dialogs

28–32px

Navigation

24px

Buttons

16px

Inputs

16px

---

# Border Tokens

| Token | Value |
|--------|-------|
| border-none | 0 |
| border-thin | 1px |
| border-medium | 1.5px |
| border-thick | 2px |

Only these values are permitted.

---

# Border Opacity

Light

14%

Medium

18%

Strong

22%

---

# Shadow Tokens

Atlas uses layered elevation.

| Token | Blur | Opacity |
|--------|------|----------|
| shadow-xs | 2px | 4% |
| shadow-sm | 8px | 6% |
| shadow-md | 16px | 8% |
| shadow-lg | 28px | 10% |
| shadow-xl | 40px | 12% |
| shadow-2xl | 64px | 14% |

Hard shadows are forbidden.

---

# Opacity Tokens

| Token | Value |
|--------|-------|
| opacity-0 | 0 |
| opacity-5 | 0.05 |
| opacity-10 | 0.10 |
| opacity-20 | 0.20 |
| opacity-40 | 0.40 |
| opacity-60 | 0.60 |
| opacity-80 | 0.80 |
| opacity-100 | 1 |

---

# Blur Tokens

| Token | Value |
|--------|-------|
| blur-xs | 4px |
| blur-sm | 8px |
| blur-md | 12px |
| blur-lg | 20px |
| blur-xl | 28px |
| blur-2xl | 40px |

Used only for approved Glass layers.

---

# Icon Tokens

| Token | Value |
|--------|-------|
| icon-xs | 16px |
| icon-sm | 20px |
| icon-md | 24px |
| icon-lg | 32px |
| icon-xl | 48px |

Navigation

20px

Cards

20px

Hero

32–48px

---

# Motion Tokens

Duration

| Token | Value |
|--------|-------|
| instant | 0ms |
| fast | 120ms |
| normal | 200ms |
| slow | 300ms |
| slower | 450ms |
| slowest | 700ms |

---

# Easing Tokens

ease-standard

ease-out

ease-in

ease-in-out

spring-soft

spring-gentle

Only these curves are allowed.

---

# Z-Index Tokens

| Token | Value |
|--------|-------|
| base | 0 |
| dropdown | 1000 |
| sticky | 1100 |
| fixed | 1200 |
| overlay | 1300 |
| modal | 1400 |
| popover | 1500 |
| tooltip | 1600 |
| toast | 1700 |

No arbitrary z-index values are permitted.

---

# Breakpoint Tokens

| Token | Value |
|--------|-------|
| xs | 0px |
| sm | 480px |
| md | 640px |
| lg | 768px |
| xl | 1024px |
| 2xl | 1280px |
| 3xl | 1536px |

---

# Container Width Tokens

| Token | Width |
|--------|-------|
| container-sm | 540px |
| container-md | 720px |
| container-lg | 960px |
| container-xl | 1140px |
| container-2xl | 1320px |
| container-max | 1440px |

---

# Grid Tokens

Desktop

12 Columns

Tablet

8 Columns

Mobile

4 Columns

Grid Gap

24px

Maximum Content Width

1440px

Reading Width

760px

---
---

# PART 5 — IMPLEMENTATION TOKEN MAPPING

Status: LOCKED

This section defines how Design Tokens are consumed across the engineering stack.

No implementation may bypass these mappings.

Design Tokens remain the single source of truth.

---

# Architecture

Single Source of Truth

↓

Design Tokens

↓

Generated CSS Variables

↓

Tailwind Theme

↓

React Components

↓

Application UI

Components must never define visual values directly.

---

# CSS Variable Naming

Every semantic token generates one CSS variable.

Official syntax:

--atlas-{category}-{token}

Examples

--atlas-color-primary

--atlas-color-background

--atlas-color-surface

--atlas-color-border

--atlas-space-4

--atlas-radius-xl

--atlas-shadow-md

--atlas-duration-normal

--atlas-blur-lg

Never invent custom prefixes.

---

# Theme Structure

Official theme classes

.light

.dark

.system

Future

.high-contrast

.amoled

Themes switch only CSS variables.

React components never check the theme manually.

---

# Color Consumption

Correct

Button

↓

color-primary

↓

CSS Variable

↓

Primitive Color

Incorrect

Button

↓

#2F6BFF

Hardcoded HEX values are forbidden.

---

# Tailwind Integration

Tailwind consumes semantic tokens.

Example philosophy

bg-background

bg-surface

bg-primary

text-primary

text-secondary

border-default

shadow-md

rounded-xl

Never expose primitive palette to component authors.

---

# Utility Rules

Allowed

bg-surface

text-primary

border-default

shadow-lg

space-6

rounded-2xl

Forbidden

bg-[#2F6BFF]

text-[#111827]

rounded-[19px]

shadow-[...]

p-[22px]

Arbitrary Tailwind values are prohibited except in documented edge cases.

---

# shadcn/ui Integration

Every imported component must be mapped to Atlas tokens.

Never use default shadcn colors.

Override

colors

radius

spacing

focus ring

shadows

motion

Typography

before first use.

Atlas Design Language always overrides library defaults.

---

# Radix UI Integration

Radix provides behavior.

Atlas provides appearance.

Never style directly inside Radix primitives.

Always wrap primitives with Atlas components.

---

# Framer Motion Integration

Animation values come from Motion Tokens.

Never hardcode:

Duration

Delay

Spring

Ease

Opacity

Scale

Distance

Every animation references approved motion tokens.

---

# GSAP Integration

GSAP is restricted to:

Landing Hero

Storytelling Sections

Premium Marketing

Never use GSAP inside:

Forms

Dashboard

Settings

Admin

Booking Flow

Chat

Framer Motion remains the default interaction library.

---

# Three.js Integration

Three.js consumes Atlas Design Tokens where applicable.

Examples

Background colors

Fog

Lighting intensity

Camera transitions

Overlay spacing

3D scenes must visually match the UI.

---

# Howler.js Integration

Sound states reference semantic event tokens.

Examples

Success

Notification

Reminder

Error

Sounds never define their own categories.

---

# Figma Variable Mapping

Every design token has an equivalent Figma Variable.

Groups

Color

Typography

Spacing

Radius

Shadow

Motion

Opacity

Blur

Breakpoint

Naming must remain identical.

Design and code stay synchronized.

---

# Component Mapping

Every component exposes only semantic properties.

Correct

<Card variant="surface">

<Button variant="primary">

<Input variant="default">

Incorrect

<Card background="#ffffff">

<Button color="#2F6BFF">

<Input border="#CBD5E1">

---

# Token Resolution

Component

↓

Semantic Token

↓

Theme

↓

Primitive Token

↓

Rendered Value

Components never skip levels.

---

# Dark Mode

Dark mode changes only semantic mappings.

Component APIs never change.

No conditional styling inside components.

---

# Runtime Theme Switching

Theme switching should complete without:

Layout Shift

Flash

Re-render Storm

Animation interruption

Target

<150ms perceived transition.

---

# Icon Library

Official icon library

Lucide

Icons inherit

Current Color

Current Size

Current Opacity

Never recolor SVG assets manually.

---

# Responsive Mapping

Spacing

Radius

Typography

Motion

may adapt by breakpoint.

Colors never change by breakpoint.

---

# Accessibility Mapping

Focus Ring

↓

Semantic Focus Token

Error

↓

Semantic Error Token

Success

↓

Semantic Success Token

Never bypass accessibility tokens.

---

# Future Platforms

Design Tokens must generate compatible outputs for

Next.js

React Native

iOS

Android

Desktop

Future design systems

without changing token names.

---

# Build Pipeline

Recommended generation flow

Figma Variables

↓

Token JSON

↓

Generated CSS Variables

↓

Tailwind Theme

↓

React Components

↓

Production Build

Manual duplication is discouraged.

---

# Code Review Rules

Reject code if:

Hardcoded HEX exists

Hardcoded spacing exists

Hardcoded radius exists

Hardcoded shadow exists

Hardcoded duration exists

Custom z-index appears

Arbitrary Tailwind values appear

Every visual value must originate from Atlas Tokens.

---

# Quality Checklist

Implementation passes only if:

✓ No hardcoded values

✓ Semantic tokens only

✓ Theme compatible

✓ Accessible

✓ Responsive

✓ Library compliant

✓ Motion compliant

✓ Production optimized

---

---

# PART 6 — COMPONENT TOKEN CONTRACTS

Status: LOCKED

This section defines the official visual contracts for every reusable UI component.

Components do not choose their own visual values.

Every component consumes predefined Atlas Tokens.

Changing a token updates the entire platform consistently.

---

# Component Philosophy

Every Atlas component must satisfy:

Consistency

Accessibility

Responsiveness

Predictable behavior

Minimal cognitive load

Premium visual quality

No component may define custom spacing, radius, colors, or shadows.

---

# Button Contract

Background

color-primary

Text

color-on-primary

Radius

radius-lg

Padding

space-6 horizontal

space-3 vertical

Shadow

shadow-sm

Hover

color-primary-hover

Pressed

color-primary-active

Focus

focus-ring-primary

Motion

duration-normal

ease-out

Minimum Height

48px

Minimum Width

44px

---

# Secondary Button

Background

surface

Border

border-default

Text

text-primary

Shadow

none

Hover

surface-secondary

---

# Ghost Button

Background

transparent

Hover

surface-secondary

Border

none

Radius

radius-lg

---

# Icon Button

Size

48 × 48

Radius

full

Icon

icon-sm

Hover

surface-secondary

---

# Input Contract

Height

52px

Padding

space-4

Radius

radius-lg

Background

surface

Border

border-default

Focus

primary focus ring

Placeholder

text-muted

Error

semantic error

Disabled

disabled surface

---

# Search Box

Variant

Large Input

Leading Icon

Search

Trailing

Voice (future)

AI Prompt

Natural Language

Minimum Height

56px

---

# Card Contract

Glass Level

2

Radius

radius-2xl

Padding

space-6

Border

glass-border

Shadow

shadow-sm

Hover

shadow-md

Lift

4px

Motion

duration-normal

---

# Dashboard Widget

Glass Level

2

Padding

space-6

Header Gap

space-4

Body Gap

space-5

Radius

radius-2xl

---

# AI Chat Bubble

Assistant

Surface Secondary

User

Primary Surface

Radius

24px

Padding

space-5

Gap

space-3

Timestamp

text-xs

Streaming Indicator

semantic info

---

# Timeline Component

Orientation

Horizontal

Desktop

Horizontal Scroll

Disabled

Timeline auto scales.

Mobile

Horizontal swipe

Current Step

Primary

Completed

Success

Upcoming

Neutral

Delayed

Warning

Cancelled

Error

Hover

Glass Level 4

Expand Animation

duration-fast

---

# Timeline Detail Card

Glass Level

3

Radius

radius-3xl

Padding

space-6

Shadow

shadow-lg

Arrow

Optional

Maximum Width

420px

---

# Navigation Bar

Height

72px

Glass

Level 1

Blur

Medium

Border Bottom

Glass Border

Logo Area

Fixed

Navigation Gap

space-8

---

# Sidebar

Width

300px

Glass

Level 2

Collapsed Width

88px

Item Radius

16px

Section Gap

space-8

---

# Modal

Glass Level

4

Radius

32px

Padding

32px

Maximum Width

720px

Background Overlay

Overlay Token

Close Button

Top Right

Keyboard

Escape

---

# Bottom Sheet

Radius

32px

Padding

24px

Handle

Mandatory

Snap Points

Supported

Motion

Spring Gentle

---

# Toast

Maximum Width

420px

Radius

20px

Glass Level

2

Shadow

shadow-md

Auto Hide

5 seconds

Pause on Hover

Supported

---

# Dropdown

Radius

16px

Padding

12px

Item Height

44px

Shadow

shadow-md

Glass

Level 2

---

# Tooltip

Maximum Width

260px

Radius

12px

Padding

12px

Shadow

shadow-sm

Delay

300ms

---

# Skeleton

Animation

Shimmer

Speed

Slow

Radius

Inherits component radius

Color

surface-secondary

---

# Empty State

Illustration

Optional

Maximum Width

480px

Title

text-2xl

Description

text-base

CTA

Primary Button

---

# Hero Section

Maximum Width

1440px

Headline Width

700px

Glass Hero

Allowed

3D Scene

Allowed

Animation

GSAP

Spacing

Very Spacious

---

# Landing Search

Height

64px

Radius

Full

Glass

Level 2

Shadow

shadow-md

Leading Icon

AI

---

# Travel Progress Widget

Timeline

Always Visible

Current Step

Highlighted

Progress

Animated

Next Step

Preview Card

Remaining Days

Displayed

Estimated Budget

Displayed

Weather Alerts

Optional

---

# Analytics Card

Chart

Responsive

Header

space-4

Body

space-6

Legend

Bottom

Glass

Level 2

---

# Avatar

Sizes

32

40

48

64

96

Radius

Full

Border

Optional

Status Badge

Supported

---

# Image Card

Radius

24px

Aspect Ratio

Adaptive

Loading

Skeleton

Error

Placeholder

Lazy Loading

Required

---

# Map Panel

Radius

24px

Glass Controls

Yes

Floating Buttons

Yes

Fullscreen

Supported

AI Suggestions

Overlay Cards

---

# Booking Summary

Sticky

Desktop

Bottom Sheet

Mobile

Glass

Level 3

Primary CTA

Persistent

---

# Accessibility Contract

Every component must include:

Keyboard Navigation

Screen Reader Labels

Focus Ring

Semantic HTML

Touch Target ≥ 44px

Reduced Motion Support

RTL Compatibility

Localization Ready

---

# Responsive Contract

Every component defines behavior for:

Mobile

Tablet

Desktop

Ultra-wide

Foldables

No component may break outside supported breakpoints.

---

# Token Compliance

Reject implementation if a component:

Uses hardcoded values

Uses arbitrary Tailwind classes

Uses custom colors

Uses custom spacing

Uses undefined radius

Uses undefined shadows

Uses undefined animations

---

# Definition of Done

A component is production-ready only if:

✓ Uses Atlas Design Tokens exclusively

✓ Matches Component Contract

✓ Responsive

✓ Accessible

✓ Localized

✓ Theme Compatible

✓ Motion Compliant

✓ Performance Budget Passed

✓ QA Approved

✓ Design Review Approved

---

END OF DOCUMENT

LOCK STATUS:
IMMUTABLE
