# AI Travel Platform

# MOTION SYSTEM

Version: 1.0

Status:
LOCKED

Motion is part of the product language.

Motion exists to improve understanding,
guide attention,
reduce uncertainty,
and increase perceived quality.

Motion is never decoration.

------------------------------------------------------------
1. MOTION PHILOSOPHY
------------------------------------------------------------

Every animation must answer at least one question:

What changed?

Where should the user look?

What just happened?

What can the user do next?

If an animation cannot answer one of these questions,
remove it.

------------------------------------------------------------
2. MOTION PRINCIPLES
------------------------------------------------------------

Motion must be

Purposeful

Fast

Natural

Predictable

Interruptible

Accessible

Consistent

Never flashy.

Never distracting.

Never excessive.

------------------------------------------------------------
3. MOTION HIERARCHY
------------------------------------------------------------

Level 1

Micro Feedback

Examples

Hover

Focus

Click

Selection

Toggle

Save

Copy

Loading

--------------------------------

Level 2

Component Motion

Cards

Dialogs

Menus

Tabs

Dropdowns

Accordions

--------------------------------

Level 3

Page Motion

Page transitions

Navigation

Route changes

--------------------------------

Level 4

Storytelling Motion

Landing

Hero

Interactive Globe

Flight Path

Travel Timeline

--------------------------------

Level 5

Immersive Motion

Three.js

GSAP Timeline

WebGL

Only Landing Page.

------------------------------------------------------------
4. APPROVED LIBRARIES
------------------------------------------------------------

Framer Motion

Default animation library.

Used for:

UI Components

Transitions

Cards

Buttons

Dialogs

Lists

Loading

--------------------------------

GSAP

Used only for:

Scroll Storytelling

Timeline Animations

Hero

Landing

Complex sequences

--------------------------------

Three.js

Used only for:

Interactive Globe

Flight Path

Earth

Travel Route

Landmarks

Never for basic UI.

--------------------------------

CSS

Preferred for

Hover

Focus

Opacity

Small transitions

--------------------------------

Never animate using JavaScript when CSS is sufficient.

------------------------------------------------------------
5. ANIMATION SPEED
------------------------------------------------------------

Fast

100-150ms

Medium

200-300ms

Slow

350-500ms

Hero

Maximum 700ms

Never exceed 800ms.

------------------------------------------------------------
6. EASING
------------------------------------------------------------

Natural easing only.

No bounce.

No elastic.

No cartoon motion.

Movement should feel premium.

------------------------------------------------------------
7. PAGE TRANSITIONS
------------------------------------------------------------

Allowed

Fade

Slide

Scale (subtle)

Crossfade

Not Allowed

Spin

Flip

Zoom Explosion

Rotate

------------------------------------------------------------
8. SCROLL STORYTELLING
------------------------------------------------------------

Only Landing Page.

Sections allowed:

Hero

Journey

Destination

AI

CTA

Examples

Airplane follows scroll.

Clouds move slowly.

Flight path draws itself.

Destination appears gradually.

Earth rotates.

Landmarks emerge.

Never create long unskippable animations.

Content always remains readable.

------------------------------------------------------------
9. HERO ANIMATION
------------------------------------------------------------

Hero may include

Animated Globe

Travel Lines

Airplane

Cloud Layers

Gradient Motion

Particle Atmosphere

Never autoplay videos with sound.

Hero must remain lightweight.

------------------------------------------------------------
10. PARALLAX
------------------------------------------------------------

Allowed

Clouds

Mountains

Background Shapes

Map Layers

Forbidden

Text

Buttons

Forms

Navigation

------------------------------------------------------------
11. THREE.JS RULES
------------------------------------------------------------

Allowed

Interactive Globe

Destination Highlight

Flight Path

Earth Rotation

Country Highlight

Location Pin

Forbidden

Background WebGL everywhere.

Heavy particle systems.

Full-page 3D.

Complex physics.

------------------------------------------------------------
12. WEBGL PERFORMANCE
------------------------------------------------------------

Three.js scenes

Lazy Loaded.

Suspended until visible.

Destroyed when unused.

Texture Compression mandatory.

GPU memory minimized.

------------------------------------------------------------
13. GSAP RULES
------------------------------------------------------------

GSAP is reserved for

Landing

Hero

Major storytelling

Interactive sections

Do not animate dashboards.

Do not animate forms.

Do not animate tables.

------------------------------------------------------------
14. MICRO INTERACTIONS
------------------------------------------------------------

Buttons

Subtle scale

Hover color

Press feedback

--------------------------------

Inputs

Focus ring

Validation

Caret animation

--------------------------------

Cards

Elevation

Border emphasis

--------------------------------

Navigation

Underline

Highlight

Slide indicator

------------------------------------------------------------
15. AI CHAT MOTION
------------------------------------------------------------

Streaming response.

Typing indicator.

Message fade-in.

Scroll follows conversation.

Suggestions appear naturally.

Memory updates subtly.

------------------------------------------------------------
16. LOADING
------------------------------------------------------------

Prefer

Skeleton

Streaming

Progressive Rendering

Avoid

Global Spinner

Blank Page

------------------------------------------------------------
17. MOBILE MOTION
------------------------------------------------------------

Simpler than desktop.

No heavy effects.

Battery friendly.

GPU friendly.

------------------------------------------------------------
18. REDUCED MOTION
------------------------------------------------------------

Support

prefers-reduced-motion

Disable

Parallax

Storytelling

Complex transitions

Retain usability.

------------------------------------------------------------
19. SOUND
------------------------------------------------------------

Howler.js only.

Allowed

Confirmation

Trip Completed

Booking Success

Memory Saved

Forbidden

Background Music

Looping Audio

Autoplay

------------------------------------------------------------
20. PERFORMANCE BUDGET
------------------------------------------------------------

Motion must never reduce

LCP

CLS

INP

Target

60 FPS

No dropped frames.

No layout shifts.

------------------------------------------------------------
21. STORYTELLING SCENES
------------------------------------------------------------

Landing

Hero

↓

Clouds

↓

Airplane

↓

Globe

↓

Destinations

↓

AI

↓

Journey

↓

CTA

Every scene has a purpose.

------------------------------------------------------------
22. MOTION ACCESSIBILITY
------------------------------------------------------------

Animations

Interruptible

Skippable

Reduced Motion Compatible

Keyboard Safe

Screen Reader Friendly

------------------------------------------------------------
23. QUALITY CHECKLIST
------------------------------------------------------------

Before merging any animation

✓ Improves UX

✓ Uses correct library

✓ Lazy Loaded

✓ Accessible

✓ Responsive

✓ No layout shift

✓ Passes Lighthouse

✓ Passes Core Web Vitals

------------------------------------------------------------

END OF DOCUMENT
