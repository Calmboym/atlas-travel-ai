# 21_PREMIUM_MICROINTERACTIONS.md

> **Status:** LOCKED
> **Version:** 1.0
> **Owner:** Product Design Team
> **Dependencies:**
>
> - 04_DESIGN_SYSTEM.md
> - 09_MOTION_SYSTEM.md
> - 14_DESIGN_TOKENS.md
> - 18_DASHBOARD_EXPERIENCE.md
> - 19_TRIP_PLANNING_EXPERIENCE.md
> - 20_TRIP_DETAILS_EXPERIENCE.md

---

# Purpose

Microinteractions transform a functional interface into a premium product.

Users rarely remember individual buttons.

They remember how the product *felt*.

Every interaction in Atlas should communicate:

- Confidence
- Precision
- Calmness
- Intelligence
- Responsiveness

Motion should never exist for decoration.

Every animation must explain something.

---

# Design Philosophy

Atlas behaves like a thoughtful travel companion.

Not a game.

Not a social network.

Not a flashy marketing website.

Microinteractions should be:

- Soft
- Predictable
- Elegant
- Fast
- Purposeful

Never distracting.

---

# Interaction Principles

Every interaction should answer one of these questions:

- Did something happen?
- What changed?
- What can I do next?
- Is my action complete?
- Am I waiting?
- Did the system understand me?

If an animation answers none of these questions,

it should not exist.

---

# Motion Characteristics

Motion language is:

- Gentle
- Organic
- Layered
- Natural

Avoid:

- Bouncing
- Overshooting
- Elastic effects
- Dramatic zooms
- Flashing

Atlas should feel mature.

---

# Hover States

Hover effects communicate interactivity.

Allowed hover behaviors:

- Slight elevation
- Soft shadow increase
- Glass highlight
- Background tint
- Icon color transition

Avoid:

- Large scaling
- Rotation
- Excessive glow

Duration:

150–200 ms

---

# Button Interactions

On hover:

- Slight elevation
- Increased contrast

On press:

- Scale to 98%
- Shadow softens
- Immediate feedback

On release:

Return smoothly.

Disabled buttons never animate.

---

# Card Interactions

Cards should feel lightweight.

Hover:

- Elevation +2
- Shadow increase
- Border brightness slightly increases

Never exceed:

Scale 1.01

Cards should never "jump."

---

# Navigation

Navigation transitions should feel effortless.

Examples:

- Active indicator slides
- Icon color transitions
- Underline movement
- Background fade

Navigation never flashes.

---

# Page Transitions

Transitions should preserve continuity.

Preferred techniques:

- Fade
- Slide
- Cross dissolve

Avoid:

- Full-screen wipes
- Spins
- Rotations

Target duration:

250–350 ms

---

# AI Response Streaming

Streaming should feel conversational.

Message bubble expands naturally.

Cursor blinks softly.

Content appears progressively.

No sudden jumps.

Auto-scroll only when appropriate.

---

# AI Thinking State

Display:

- Animated dots
- Gentle shimmer
- Contextual status text

Examples:

> Thinking...

> Comparing options...

> Optimizing itinerary...

Avoid fake percentages.

---

# Input Fields

Focus:

- Border color transition
- Shadow increase
- Cursor visible immediately

Validation:

Success:

Soft green confirmation.

Error:

Subtle red highlight.

Shake animations are prohibited.

---

# Search Experience

Typing:

Results appear progressively.

Search field expands naturally.

Suggestion list fades in.

No blocking spinners.

---

# Drag & Drop

Dragging an item should:

- Lift slightly
- Increase shadow
- Reduce opacity slightly

Drop target:

Soft highlight.

Drop completion:

Smooth reposition animation.

Never abrupt.

---

# Timeline Interactions

Timeline supports:

- Hover previews
- Tap details
- Current marker pulse
- Smooth scrolling
- Snap alignment

Progress updates animate gently.

Completed milestones fade into their completed state.

---

# Notification Behavior

Notifications slide in gently.

Never cover important controls.

Auto-dismiss only for low-priority information.

Critical notifications require explicit acknowledgment.

---

# Loading States

Use skeletons.

Avoid traditional spinners whenever possible.

Skeleton shimmer remains subtle.

Large layout shifts are prohibited.

---

# Success Feedback

Examples:

Trip saved.

Reservation updated.

Activity moved.

Show:

- Check icon
- Soft fade
- Short confirmation

No confetti.

No celebration effects.

---

# Error Feedback

Errors should feel reassuring.

Example:

> Something interrupted this update.

> Please try again.

Animation:

Small fade.

No shaking.

No flashing.

---

# Empty States

Illustration fades in.

Primary action becomes immediately visible.

Empty states should invite action,

not emphasize absence.

---

# AI Suggestions

When Atlas proposes a change:

Suggestion card slides upward gently.

Accept:

Soft confirmation.

Decline:

Card fades away.

No pressure.

---

# Budget Updates

Budget changes animate numerically.

Example:

€2,150

↓

€2,030

Number transitions smoothly.

Avoid rapid counting effects.

---

# Weather Updates

Weather icon transitions:

Sunny

↓

Cloudy

↓

Rain

Crossfade only.

No spinning icons.

---

# Reservation Updates

Confirmed:

Border transitions softly.

Confirmation badge appears.

Cancelled:

Muted appearance.

Clear explanation.

---

# Gesture Support

Touch gestures:

Swipe

Drag

Pull

Pinch (future maps)

All gestures require immediate visual feedback.

---

# Scroll Experience

Scrolling should feel smooth.

Sticky elements transition naturally.

Sections reveal progressively.

Never trigger excessive animations during scroll.

---

# Sound Design

Optional only.

Very subtle.

Examples:

- Save confirmation
- Successful booking
- Reminder acknowledgment

Muted by default.

User-controlled.

---

# Haptics

Supported devices may provide:

- Light tap on success
- Medium tap on drag drop
- Soft confirmation on save

Never excessive.

---

# Reduced Motion

When enabled:

Remove:

- Parallax
- Large transitions
- Decorative animations

Keep:

- Essential feedback
- Focus indicators
- State transitions

Accessibility always takes priority.

---

# Performance

Motion must maintain:

60 FPS

GPU acceleration

Minimal repaint

No blocking JavaScript

No unnecessary layout calculations

---

# Emotional Outcomes

Users should feel:

> Atlas is responsive.

> Atlas understands me.

> Atlas feels premium.

> Atlas feels calm.

> Atlas feels reliable.

They should never think:

> Why is everything moving?

---

# Motion Consistency Checklist

Every interaction should satisfy:

✓ Purpose

✓ Accessibility

✓ Performance

✓ Predictability

✓ Subtlety

✓ Consistency

---

# Definition of Done

Premium Microinteractions are complete only when:

- Every interaction provides meaningful feedback.
- Motion communicates state rather than decoration.
- Performance remains smooth on supported devices.
- Accessibility settings are fully respected.
- Users perceive Atlas as calm, premium, polished, and intelligent through every small interaction.
