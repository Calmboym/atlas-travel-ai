# AI Travel Platform

# INFORMATION ARCHITECTURE

Version: 1.0

Status:
LOCKED

This document defines the complete information architecture,
navigation structure,
routing hierarchy,
and page responsibilities.

No page may be added without updating this document.

---

# INFORMATION ARCHITECTURE PRINCIPLES

The platform must always answer:

Where am I?

What can I do here?

What should I do next?

How can I return?

Navigation should never require thinking.

---

# NAVIGATION PRINCIPLES

Maximum navigation depth:

3 Levels

Every important feature:

Maximum 2 clicks away.

AI Chat:

Always accessible.

Search:

Always visible.

Language:

Always available.

Theme:

Always available.

Profile:

Always available after login.

---

====================================================
PUBLIC ROUTES
====================================================

/

Landing Page

Purpose

Introduce the platform.

Build trust.

Encourage exploration.

Primary CTA

Start Planning

Secondary CTA

Continue as Guest

---

/login

Email Login

OAuth Login

Forgot Password

---

/register

Account Creation

Email Verification

OAuth

---

/forgot-password

Password Reset

---

/about

Brand Story

Mission

Vision

Trust

---

/pricing

Free Plan

Future Premium Plan

Comparison

FAQ

---

/contact

Contact Form

Support

---

/privacy

Privacy Policy

---

/terms

Terms of Service

---

/cookies

Cookie Policy

---

====================================================
AUTHENTICATED ROUTES
====================================================

/dashboard

User Home

Purpose

Continue previous activity.

Quick overview.

Last AI chat.

Upcoming trips.

Recommendations.

Notifications.

---

Dashboard Sections

Recent Chat

Upcoming Trips

Saved Trips

Travel Insights

Notifications

Quick Actions

---

/chat

AI Travel Companion

Streaming

Conversation History

Memory

Attachments

Prompt Suggestions

Sources

Tool Results

---

/chat/:conversationId

Conversation Detail

---

/profile

Personal Information

Travel Preferences

Budget

Languages

Accessibility

Travel Style

---

/profile/security

Password

OAuth

Sessions

2FA

---

/profile/memory

AI Memory

Stored Preferences

Trip History

Delete Memory

Export Memory

---

/profile/settings

Appearance

Language

Notifications

Privacy

Accessibility

---

====================================================
TRIPS
====================================================

/trips

Trip List

---

/trips/new

Create New Trip

AI Guided

---

/trips/:id

Trip Overview

Timeline

Budget

Hotels

Flights

Reservations

Packing

Notes

---

/trips/:id/edit

Trip Editor

---

/trips/:id/share

Shared Trip

Read Only

---

====================================================
DESTINATIONS
====================================================

/destinations

Destination Explorer

---

/destinations/:slug

Destination Detail

Overview

Map

Weather

Currency

Visa

Events

Hotels

Flights

Restaurants

Transport

Safety

Nearby

FAQ

AI Suggestions

---

====================================================
HOTELS
====================================================

/hotels

Search Hotels

---

/hotels/:id

Hotel Detail

Gallery

Rooms

Amenities

Reviews

Map

Price

Recommendations

---

====================================================
FLIGHTS
====================================================

/flights

Flight Search

---

/flights/:id

Flight Details

Timeline

Airline

Airport

Seats

Connections

Recommendations

---

====================================================
SEARCH
====================================================

No traditional search page.

All search flows through AI.

Users express intent naturally.

Example

"I want a quiet beach in September under $2000."

The AI orchestrates search internally.

---

====================================================
BOOKING
====================================================

Booking is AI-assisted.

The platform recommends.

Booking providers execute.

Booking flow

Recommendation

↓

Comparison

↓

Confirmation

↓

Provider

↓

Return

Users never lose context.

---

====================================================
NOTIFICATIONS
====================================================

Notification Center

Travel Reminders

Weather Alerts

Visa Alerts

Flight Changes

Currency Alerts

Local Events

Trip Reminders

---

====================================================
POST TRAVEL
====================================================

Trip Reflection

Experience Feedback

Favorite Places

Lessons Learned

Future Suggestions

Memory Update

---

====================================================
GLOBAL COMPONENTS

Visible everywhere

Navigation

AI Button

Language Switcher

Theme Switcher

Toast

Connection Status

Session Status

Profile Access

---

====================================================
AI ENTRY POINTS

AI is accessible from:

Landing Hero

Navbar

Dashboard

Trips

Destination Pages

Hotels

Flights

Notifications

Profile

Floating Action Button (Mobile)

---

====================================================
MOBILE NAVIGATION

Bottom Navigation

Home

Trips

Chat

Notifications

Profile

Floating AI Button remains available.

---

====================================================
BREADCRUMBS

Used only where hierarchy exists.

Never on Landing Page.

Never on Dashboard.

Used on:

Destination Detail

Hotel Detail

Flight Detail

Trip Detail

Settings

Admin

---

====================================================
ERROR ROUTES

404

Friendly.

Helpful.

AI suggests next actions.

---

500

Explain issue.

Retry.

Status Page.

---

Offline

Offline page.

Retry.

Cached data if available.

---

====================================================
LOADING EXPERIENCE

Never display blank pages.

Every route has:

Skeleton

Progressive Loading

Streaming

Optimistic UI where possible.

---

====================================================
PAGE RESPONSIBILITY

Every page has:

One primary goal.

One primary CTA.

Limited cognitive load.

Maximum one dominant decision.

---

====================================================
ROUTE RULES

Marketing Pages

SSG + ISR

Dashboard

Dynamic

AI Chat

Streaming

Trips

Dynamic

Destination Pages

ISR

Hotel Pages

ISR

Flight Pages

Dynamic

Profile

Dynamic

---

====================================================
FUTURE ROUTES

/api

Native Mobile

Wearables

Voice Assistant

Enterprise API

Admin Portal

Partner Portal

Offline Sync

====================================================

END OF DOCUMENT
