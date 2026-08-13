# 26_APPLICATION_LAYOUT_GUIDE.md

> **Status:** LOCKED
> **Version:** 1.0
> **Owner:** Product Design Team
> **Purpose:** Define the complete application layout architecture for every page of Atlas. This document is the single source of truth for page structure, navigation, layouts, grids, responsive behavior, and global UI regions. It complements the Design Bible and does not redefine components or design tokens.

---

# Purpose

This document answers one question:

> **"What does every page of Atlas look like?"**

It defines:

- Every page
- Every layout
- Every navigation region
- Every grid
- Every global component
- Responsive behavior
- Page hierarchy

This document intentionally does **not** define visual styling, animations, or component design. Those are covered in the Design Bible.

---

# Application Sitemap

```text
Landing

├── Login
├── Register
├── Forgot Password
├── Verify Email

├── AI Chat
│
├── New Trip
│
├── Trip Details
│
├── Dashboard
│   ├── Overview
│   ├── My Trips
│   ├── Saved
│   ├── Notifications
│   ├── Profile
│   ├── Settings
│   └── Help
│
└── Future
    ├── Pricing
    ├── Teams
    ├── Shared Trips
    ├── Admin
    └── API
```

---

# Global Application Structure

```text
App

↓

Global Header

↓

Page Content

↓

Global Footer
```

Authenticated pages:

```text
Header

↓

Sidebar

↓

Main Content

↓

Optional Right Panel

↓

Footer (minimal)
```

---

# Layout Types

Atlas uses four layout types only.

| Layout | Used By |
|---------|----------|
| Marketing Layout | Landing |
| Authentication Layout | Login/Register |
| Application Layout | Dashboard, Chat |
| Focus Layout | Trip Planning |

No additional layouts should be introduced without architectural approval.

---

# Marketing Layout

Used by:

- Landing

Structure:

```text
Header

↓

Hero

↓

Content Sections

↓

CTA

↓

Footer
```

Container:

```text
Max Width

1440px
```

---

# Authentication Layout

Used by:

- Login
- Register
- Forgot Password
- Verify Email

Structure:

```text
Minimal Header

↓

Centered Card

↓

Footer
```

Desktop:

```text
Two Columns

Illustration

Form
```

Mobile:

Single column.

Maximum form width:

480px

---

# Application Layout

Used by:

- Dashboard
- Chat
- Profile
- Settings
- Notifications

Structure:

```text
Header

↓

Sidebar

↓

Main Content

↓

Optional Right Panel
```

Grid:

```text
Sidebar

280px

Main

Flexible

Panel

360px
```

---

# Focus Layout

Used by:

- New Trip
- Trip Planning

Purpose:

Remove distractions.

Structure:

```text
Header

↓

Planning Workspace

↓

AI Panel
```

---

# Global Header

Present on every page.

Contains:

- Logo
- Main Navigation
- Search
- Language Switcher
- Theme Toggle
- Notifications
- User Avatar
- Profile Menu

Guest users:

- Login
- Register

Authenticated users:

- Avatar
- Notifications
- Quick Trip Button

---

# Header Behavior

Desktop:

Fixed.

Transparent on Landing Hero.

Solid after scrolling.

Application pages:

Always solid.

Height:

80px

Mobile:

64px

---

# Header Navigation

Landing:

- Home
- Discover
- AI Assistant
- Features
- FAQ

Authenticated:

- Dashboard
- Trips
- AI Chat
- Saved

Current page is clearly highlighted.

---

# Search

Available after login.

Supports:

- Trips
- Destinations
- Conversations
- Hotels (future)
- Flights (future)

Always accessible.

---

# Language Switcher

Supports:

- English
- فارسی
- Deutsch

Future-ready.

RTL automatically applied.

---

# Theme Toggle

Modes:

- Light
- Dark
- System

Preference persists.

---

# Notifications

Accessible globally.

Displays:

- AI updates
- Reservation changes
- Timeline reminders
- Weather alerts

Unread badge supported.

---

# User Menu

Contains:

- Profile
- Dashboard
- My Trips
- Saved
- Settings
- Help
- Logout

---

# Sidebar

Visible on desktop.

Collapsed on tablet.

Drawer on mobile.

Contains:

```text
Dashboard

My Trips

AI Chat

Saved Trips

Notifications

Profile

Settings

Help
```

---

# Sidebar Behavior

Collapsed width:

80px

Expanded width:

280px

Remembers state.

---

# Mobile Navigation

Bottom Navigation.

Contains:

```text
Home

Trips

Chat

Notifications

Profile
```

Maximum:

Five items.

---

# Footer

Visible on marketing pages.

Minimal footer inside application.

Landing Footer Sections:

```text
Logo

Product

Resources

Company

Legal

Newsletter

Social Links
```

---

# Dashboard

Purpose:

Personal travel command center.

Layout:

```text
Header

↓

Trip Summary

↓

Travel Timeline

↓

Active Trips

↓

Recommendations

↓

Budget

↓

Recent Activity
```

Desktop Grid:

```text
8 Columns

Main

4 Columns

Sidebar
```

---

# Dashboard Sections

- Welcome
- Continue Planning
- Active Trips
- Upcoming Trips
- AI Recommendations
- Budget Summary
- Recent Conversations
- Notifications

---

# AI Chat

Layout:

```text
Sidebar

↓

Conversation

↓

Composer
```

Desktop:

```text
320px

Conversation

Flexible
```

Mobile:

Conversation only.

Sidebar opens as drawer.

---

# Chat Components

- Conversation List
- Messages
- Streaming Area
- Suggestion Chips
- Composer
- Attachments (future)

---

# New Trip

Purpose:

Create itinerary.

Layout:

```text
Prompt

↓

AI Planning

↓

Editable Plan

↓

Timeline
```

AI remains visible.

---

# Trip Details

Layout:

```text
Hero

↓

Timeline

↓

Today's Overview

↓

Daily Itinerary

↓

Reservations

↓

Budget

↓

Documents

↓

Notes

↓

AI Assistant
```

Desktop:

```text
8 Columns

Main

4 Columns

Assistant
```

---

# My Trips

Purpose:

Manage every trip.

Layout:

```text
Filters

↓

Grid

↓

Pagination
```

Filters:

- Upcoming
- Active
- Completed
- Draft

Cards remain consistent.

---

# Saved Trips

Displays:

- Favorites
- Templates
- Archived Plans

Layout:

Grid.

---

# Notifications Page

Layout:

```text
Unread

↓

Today

↓

Earlier
```

Actions:

- Mark Read
- Delete
- Open Related Trip

---

# Profile Page

Purpose:

Manage traveler identity.

Layout:

```text
Cover

↓

Avatar

↓

Profile Information

↓

Travel Preferences

↓

Budget Preferences

↓

Languages

↓

Saved Destinations

↓

Travel Style

↓

Privacy

↓

Danger Zone
```

---

# Profile Sections

## Personal Information

- Name
- Email
- Phone
- Country
- Timezone

---

## Travel Preferences

- Solo
- Family
- Couple
- Business
- Adventure
- Luxury
- Budget

---

## Budget

Preferred:

- Economy
- Mid-range
- Premium
- Luxury

---

## Accommodation

Preferences:

- Hotel
- Apartment
- Hostel
- Resort

---

## Transportation

Preferences:

- Flight
- Train
- Car
- Walking

---

## Food Preferences

- Vegetarian
- Vegan
- Halal
- Kosher
- Allergies

---

## Languages

Preferred UI Language

Preferred Travel Language

---

## Saved Destinations

Favorite countries.

Favorite cities.

Wishlist.

---

## Privacy

- Export Data
- Delete Data
- Session Management
- Connected Devices

---

## Danger Zone

Contains:

- Delete Account
- Sign Out Everywhere

Requires confirmation.

---

# Settings

Sections:

- Appearance
- Notifications
- AI Preferences
- Language
- Security
- Accessibility

---

# Help Center

Contains:

- FAQ
- Contact
- Documentation
- Report Bug

---

# Empty States

Every page supports empty states.

Includes:

- Illustration
- Explanation
- Primary Action

Never leave blank screens.

---

# Grid System

Desktop:

12-column grid

Container:

1440px

Gutter:

24px

---

Tablet

8-column grid

---

Mobile

4-column grid

---

# Responsive Rules

Desktop

≥1280px

Tablet

768–1279px

Mobile

≤767px

Layouts adapt without changing information hierarchy.

---

# Sticky Elements

Sticky:

- Header
- Sidebar
- Timeline (Trip Details)
- Composer (Chat)
- AI Assistant (Desktop)

---

# Scroll Behavior

Each major page has one primary scroll container.

Avoid nested scrolling whenever possible.

---

# Navigation Flow

```text
Landing

↓

AI Chat

↓

Trip Planning

↓

Trip Details

↓

Dashboard

↓

Future Trips
```

---

# Future Pages

Reserved architecture:

- Pricing
- Team Workspace
- Shared Trips
- Marketplace
- Integrations
- API Console
- Admin Dashboard

Layouts remain compatible.

---

# Accessibility

Every page must support:

- Keyboard navigation
- Screen readers
- Focus order
- Skip links
- High contrast
- Reduced motion

---

# Performance Requirements

- Lazy load secondary panels
- Virtualize long lists
- Keep layout stable
- Prevent cumulative layout shift (CLS)
- Optimize Largest Contentful Paint (LCP)

---

# Design Consistency Rules

Every page must:

- Use the global grid.
- Respect spacing tokens.
- Reuse existing components.
- Maintain consistent navigation.
- Preserve visual hierarchy.
- Follow the premium Atlas design language.

No page should introduce unique UI patterns that conflict with the Design System.

---

# Definition of Done

The Application Layout Architecture is complete only when:

- Every page has a clearly defined layout.
- Navigation is predictable across the entire product.
- Header, footer, sidebar, and mobile navigation remain consistent.
- Responsive behavior is fully specified.
- Grid systems are standardized.
- New pages can be added without breaking architectural consistency.
- Developers can implement any page without making layout decisions on their own.
