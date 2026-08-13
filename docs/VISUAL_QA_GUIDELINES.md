# 15_VISUAL_QA_GUIDELINES.md

Status: LOCKED
Version: 1.0
Applies To: Entire AI Travel Platform
Priority: Mandatory

---

# Purpose

This document defines the mandatory visual quality assurance process for every screen, component, interaction, and animation in the Atlas AI Travel Platform.

A feature is not considered complete simply because it works.

It is complete only when it meets the visual quality defined in this document.

Visual quality is treated as a production requirement.

---

# Philosophy

Atlas is a premium product.

Users should notice:

clarity

precision

consistency

calmness

craftsmanship

They should never notice:

misalignment

inconsistent spacing

visual noise

cheap animations

broken hierarchy

---

# Visual Review Order

Every UI review follows the same sequence.

Visual Hierarchy

↓

Layout

↓

Spacing

↓

Typography

↓

Color

↓

Component Consistency

↓

Motion

↓

Accessibility

↓

Responsive Behaviour

↓

Performance

No review may skip steps.

---

# Alignment

Every element aligns to the grid.

Never place elements visually.

Place them mathematically.

Alignment tolerances:

0px

Visual approximations are unacceptable.

---

# Grid Validation

Every screen must follow the official responsive grid.

Desktop

12 Columns

Tablet

8 Columns

Mobile

4 Columns

No custom layouts.

---

# Spacing Validation

Only official spacing tokens are allowed.

Examples

space-2

space-4

space-6

space-8

Random spacing values are prohibited.

Whitespace should feel intentional.

---

# Typography Validation

Verify:

Heading hierarchy

Readable line length

Consistent font weight

Correct line height

Localized typography

No mixed font systems.

---

# Color Validation

Every color must originate from semantic tokens.

Reject:

Hardcoded HEX

Random opacity

Library defaults

Every screen must pass contrast validation.

---

# Radius Validation

Radius must follow component contracts.

Example

Cards

24px

Buttons

16px

Dialogs

32px

No visual inconsistencies.

---

# Shadow Validation

Only approved shadow tokens.

No harsh shadows.

No duplicated elevation.

Elevation must clearly communicate hierarchy.

---

# Glass Validation

Glass components must use approved Glass Levels.

Verify:

Opacity

Blur

Border

Shadow

Contrast

Performance

Stacking multiple heavy blur layers is prohibited.

---

# Icon Validation

Icons must use:

Lucide

Official sizes

Consistent stroke

CurrentColor

No mixed icon styles.

---

# Illustration Validation

Illustrations must match Atlas visual language.

Reject:

Cartoon style

Heavy gradients

Stock-photo appearance

Inconsistent perspective

---

# Image Validation

Images must be:

High quality

Optimized

Correctly cropped

Lazy loaded

Responsive

Accessible

---

# Motion Validation

Every animation answers:

Why does this animation exist?

If no answer exists,

remove it.

---

# Animation Quality

Animation should feel:

Soft

Natural

Purposeful

Never flashy.

Never distracting.

---

# Interaction Feedback

Every interaction provides immediate feedback.

Hover

Focus

Pressed

Loading

Disabled

Success

Error

No interaction feels unresponsive.

---

# Loading States

Every async operation requires:

Skeleton

Spinner

Progress

or

Streaming feedback

Blank screens are prohibited.

---

# Empty States

Every empty state includes:

Explanation

Illustration (optional)

Primary action

Encouragement

Never dead ends.

---

# Error States

Errors must:

Explain the issue

Suggest recovery

Maintain visual consistency

Avoid technical jargon.

---

# Responsive Review

Test every screen on:

Mobile

Tablet

Laptop

Desktop

Ultra-wide

Foldables

Layouts must remain visually balanced.

---

# Accessibility Review

Validate:

Keyboard navigation

Focus visibility

Contrast

Screen readers

Touch targets

Reduced motion

RTL

Localization

---

# Theme Review

Every component must work correctly in:

Light

Dark

System

Future themes must inherit automatically.

---

# AI Review

AI-generated content should:

Respect layout

Avoid overflow

Handle long responses

Handle multilingual text

Support markdown gracefully

---

# Timeline Review

Travel Timeline must verify:

Correct progress state

Current location indicator

Hover details

Mobile tap interaction

Animation consistency

Responsive scaling

Accessibility

---

# Dashboard Review

Dashboard should always feel:

Calm

Organized

Scannable

Information-dense without clutter.

---

# Landing Page Review

Landing page should communicate:

Trust

Intelligence

Motion

Premium quality

Storytelling

Without reducing performance.

---

# Performance Review

Visual polish must never reduce:

LCP

CLS

INP

Heavy visual effects should degrade gracefully.

---

# Browser Review

Validate latest versions of:

Chrome

Safari

Firefox

Edge

iOS Safari

Chrome Android

---

# Localization Review

Test:

English

فارسی

Deutsch

العربية

Français

Español

Ensure layouts adapt correctly.

---

# QA Checklist

Every screen must satisfy:

✓ Grid alignment

✓ Token compliance

✓ Typography consistency

✓ Accessible contrast

✓ Official spacing

✓ Component contracts

✓ Responsive layout

✓ Motion compliance

✓ Theme compatibility

✓ Glass consistency

✓ RTL support

✓ Localization support

✓ Performance budget

✓ Accessibility compliance

---

# Definition of Done

A screen is production-ready only if:

Design approved

Engineering approved

Accessibility passed

Responsive validated

Performance passed

Visual QA passed

Product approved

---

END OF DOCUMENT

LOCK STATUS:
IMMUTABLE
