# 09_ACCESSIBILITY.md

Status: LOCKED
Version: 1.0
Applies To: Entire AI Travel Platform
Priority: Mandatory

---

# Purpose

Accessibility is not an optional enhancement.

It is a core quality requirement.

Every feature added to the platform must satisfy accessibility requirements before it can be considered complete.

Accessibility must never significantly reduce visual quality, motion quality, or product identity.

Instead, accessibility is integrated into every design decision.

---

# Accessibility Goals

The platform must be usable by:

• keyboard users

• screen reader users

• low vision users

• color blind users

• elderly users

• users with motor impairments

• users with cognitive difficulties

• users using mobile devices

• users with slow internet

• users with temporary disabilities

---

# Standard

Target:

WCAG 2.2 AA

This is mandatory.

AAA is optional where practical.

---

# Accessibility Principles

The interface must always be:

Perceivable

Operable

Understandable

Robust

No feature may violate these principles.

---

# Semantic HTML

Semantic HTML is mandatory.

Never replace semantic elements with generic divs.

Required elements include:

header

main

nav

aside

footer

section

article

button

form

label

fieldset

legend

dialog

table

caption

ul

ol

li

figure

figcaption

---

# Heading Structure

Each page has exactly one H1.

Heading hierarchy must never skip levels.

Correct:

H1

H2

H3

Incorrect:

H1

H3

---

# Landmarks

Required landmarks:

Header

Primary Navigation

Main Content

Complementary Content

Footer

Screen readers must be able to navigate directly to them.

---

# Keyboard Navigation

Everything must be usable without a mouse.

Mandatory support:

Tab

Shift + Tab

Enter

Space

Escape

Arrow Keys

Home

End

Page Up

Page Down where appropriate

---

# Focus Visibility

Keyboard focus must always be visible.

Never remove outline.

Instead:

Use custom focus styles.

Minimum contrast:

3:1

Recommended:

Brand primary glow.

---

# Focus Order

Focus order follows visual order.

Never jump unexpectedly.

No hidden focus traps.

---

# Skip Links

Every page includes:

Skip to Main Content

Visible on keyboard focus.

---

# Forms

Every input requires:

Visible label

Programmatic label

Placeholder is NOT a label.

---

Required:

aria-describedby

for validation

help text

error text

---

# Required Fields

Never rely only on color.

Required indicator:

*

and

Accessible description.

---

# Validation

Validation happens:

On blur

and

On submit

Error messages must explain:

What happened

Why

How to fix

Example:

❌ Invalid

Better:

Please enter a valid email address.

---

# Error Identification

Errors use:

Icon

Color

Text

ARIA live announcement

Never color alone.

---

# Buttons

Minimum size:

44 x 44 px

Touch targets:

48 x 48 preferred

---

# Links

Links must describe destination.

Bad:

Click here

Good:

View itinerary

---

# Icons

Icons alone are insufficient.

Decorative icons:

aria-hidden="true"

Functional icons:

Accessible label required.

---

# Images

Decorative images:

Empty alt

Meaningful images:

Descriptive alt text

Infographics:

Long description available

---

# AI Images

Generated destination artwork is decorative unless it conveys essential information.

---

# Color Contrast

Normal text:

4.5:1

Large text:

3:1

Interactive components:

3:1 minimum

---

# Color Independence

Never communicate using color alone.

Example:

Red error

+

Error icon

+

Message

---

# Typography

Minimum body size:

16px

Preferred:

17–18px

Line height:

1.5+

Paragraph width:

60–75 characters

---

# Zoom

Interface must support:

200%

without horizontal scrolling.

---

# Reflow

Responsive layouts required.

No clipped text.

No hidden controls.

---

# Screen Readers

Supported:

VoiceOver

NVDA

JAWS

TalkBack

Common ARIA attributes:

aria-label

aria-labelledby

aria-describedby

aria-live

aria-expanded

aria-controls

aria-current

aria-hidden

role

Use ARIA only when semantic HTML is insufficient.

---

# Live Regions

Required for:

AI streaming

Notifications

Errors

Uploads

Booking progress

Chat responses

Use:

aria-live="polite"

Use assertive only for critical events.

---

# Dialogs

Dialogs must:

Trap focus

Restore focus

Close via Escape

Close button always visible

Screen reader title required

---

# Toast Notifications

Never disappear too quickly.

Minimum:

5 seconds

Pause on hover

Accessible announcement required.

---

# Tables

Use only for tabular data.

Never for layout.

Must include:

caption

thead

tbody

th

scope

---

# Motion Accessibility

Respect:

prefers-reduced-motion

When enabled:

Remove large transitions

Disable parallax

Disable floating animations

Disable decorative GSAP timelines

Disable Three.js camera motion

Maintain usability.

---

# Sound Accessibility

Howler.js sounds are optional.

Muted by default.

User-controlled.

Never autoplay.

---

# Flashing Content

Never exceed:

3 flashes/second

Avoid seizure risks.

---

# AI Chat Accessibility

Chat must support:

Keyboard navigation

Screen readers

Copy shortcuts

Message timestamps

Clear sender distinction

Streaming announcements

Stop generation button

Regenerate button

Retry button

Accessible markdown rendering

---

# Loading States

Skeletons

must include:

aria-busy

Loading message

Progress indication if known

---

# Infinite Scroll

Avoid when possible.

Prefer pagination or Load More.

If infinite scrolling is used:

Maintain focus

Announce newly loaded content

---

# Charts

Charts require:

Text summary

Accessible data table

Meaningful labels

---

# Maps

Interactive maps require:

Keyboard controls

Search alternative

Destination list

Location cards

Never force map interaction.

---

# Drag & Drop

Must have keyboard alternative.

---

# Authentication

Login

Signup

OAuth

Password reset

MFA

All must be fully keyboard accessible.

---

# Localization

RTL supported.

LTR supported.

Screen readers must correctly identify language.

Example:

lang="fa"

lang="en"

lang="de"

---

# Cognitive Accessibility

Reduce memory load.

Reduce distractions.

One primary action per screen.

Clear language.

Consistent navigation.

Avoid unnecessary jargon.

---

# Error Recovery

Always explain recovery path.

Never blame the user.

Good:

We couldn't connect.

Please try again.

Bad:

Unknown Error.

---

# Offline Accessibility

Offline state must explain:

Current availability

Unavailable features

Retry action

Cached content

---

# Accessibility Testing

Every release must pass:

Keyboard-only testing

Screen reader testing

Contrast testing

Zoom testing

Mobile accessibility

Reduced motion testing

Dark mode testing

Light mode testing

RTL testing

LTR testing

---

# Automated Testing

Required tools:

axe-core

Lighthouse

eslint-plugin-jsx-a11y

Accessibility CI checks are mandatory.

---

# Performance Compatibility

Accessibility enhancements must not significantly reduce:

LCP

INP

CLS

Accessibility and performance are equally important.

---

# Accessibility Checklist

Every UI component must satisfy:

✓ Keyboard accessible

✓ Screen reader compatible

✓ Proper semantics

✓ Visible focus

✓ Sufficient contrast

✓ Responsive

✓ Reduced motion support

✓ Error messaging

✓ Touch friendly

✓ RTL compatible

✓ Localization ready

✓ Accessible naming

✓ No accessibility regressions

---

# Definition of Done

A feature cannot be marked complete unless:

Design approved

Engineering approved

Accessibility checklist passed

Automated audits passed

Manual keyboard test passed

Manual screen reader test passed

Performance budget maintained

---

END OF DOCUMENT

LOCK STATUS:
IMMUTABLE
