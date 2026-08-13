# AI Travel Platform

# COMPONENT INVENTORY

Version: 1.0

Status:
LOCKED

This document defines every reusable UI component used throughout the platform.

No page may create custom UI before checking this inventory.

All components must follow:

03_DESIGN_SYSTEM.md

---

# COMPONENT PRINCIPLES

Every component must be

Reusable

Composable

Accessible

Responsive

Theme-aware

Localized

RTL Compatible

Animated (only when beneficial)

Typed

Documented

Unit Testable

---

# COMPONENT STATES

Every interactive component must support

Default

Hover

Pressed

Focused

Keyboard Focus

Loading

Disabled

Success

Error

Empty

Skeleton

Dark Mode

RTL

---

# RESPONSIVE RULE

Every component must define behavior for

Desktop

Laptop

Tablet

Mobile

Never scale blindly.

Layouts adapt.

Content adapts.

Interactions adapt.

---

==========================================================
FOUNDATION COMPONENTS
==========================================================

Layout

AppShell

Container

Section

Grid

Stack

Spacer

Divider

AspectRatio

ScrollArea

ResizablePanel

Separator

PageTransition

StickyArea

FloatingLayer

Portal

Overlay

---

Typography

HeroText

DisplayText

Heading

Paragraph

Caption

Label

Code

Link

Quote

List

BadgeText

---

Buttons

PrimaryButton

SecondaryButton

GhostButton

OutlineButton

DangerButton

SuccessButton

TextButton

IconButton

FloatingActionButton

LoadingButton

SplitButton

DropdownButton

CopyButton

ShareButton

BookmarkButton

FavoriteButton

---

Inputs

Input

Textarea

PasswordInput

EmailInput

PhoneInput

SearchInput

CurrencyInput

OTPInput

Slider

Checkbox

Switch

Radio

Select

Autocomplete

DatePicker

TimePicker

Calendar

RangePicker

Combobox

TagInput

FileUpload

ImageUpload

LocationPicker

---

Feedback

Toast

Alert

Snackbar

ProgressBar

Spinner

LoadingDots

Skeleton

EmptyState

ErrorState

RetryCard

StatusBadge

ConnectionStatus

---

Dialogs

Dialog

AlertDialog

Drawer

BottomSheet

Popover

Tooltip

HoverCard

ContextMenu

CommandPalette

==========================================================
NAVIGATION
==========================================================

Navbar

MobileNavbar

Sidebar

MobileSidebar

Topbar

Breadcrumb

Pagination

Tabs

StepIndicator

MegaMenu

LanguageSwitcher

ThemeSwitcher

ProfileMenu

NotificationCenter

SearchOverlay

GlobalCommand

AIQuickAccess

==========================================================
LANDING PAGE
==========================================================

HeroSection

AnimatedBackground

FloatingClouds

AirplaneAnimation

TravelRouteAnimation

InteractiveGlobe

DestinationCarousel

PopularDestinations

FeaturedTrips

FeaturedHotels

FeaturedFlights

TravelCategories

ExperienceCards

HowItWorks

StatisticsSection

Testimonials

PartnerLogos

AIShowcase

FAQSection

Newsletter

CTASection

Footer

==========================================================
AI COMPONENTS
==========================================================

AIChatLayout

ConversationList

ConversationCard

ConversationHeader

ConversationFooter

MessageBubble

UserBubble

AssistantBubble

StreamingBubble

TypingIndicator

MemoryIndicator

SourceCard

ToolCallCard

ReasoningCard

RecommendationCard

SuggestionCard

ActionCard

PromptSuggestion

ChatInput

VoiceInput

AttachmentInput

ConversationSearch

ConversationTimeline

==========================================================
USER
==========================================================

Avatar

ProfileCard

ProfileSummary

PreferenceCard

TravelStyleCard

BudgetCard

LanguageCard

TripHistoryCard

SavedTripCard

MemoryCard

AchievementCard

SettingsCard

SecurityCard

==========================================================
DESTINATIONS
==========================================================

DestinationHero

DestinationCard

DestinationGallery

DestinationOverview

MapPreview

WeatherCard

CurrencyCard

VisaCard

SafetyCard

LocalTipsCard

EventsCard

RestaurantCard

TransportCard

NearbyPlacesCard

DestinationTimeline

==========================================================
HOTELS
==========================================================

HotelCard

HotelGallery

HotelPrice

HotelAmenities

HotelMap

HotelReview

HotelComparison

RoomCard

AvailabilityCard

BookingCTA

==========================================================
FLIGHTS
==========================================================

FlightCard

FlightTimeline

FlightComparison

PriceHistory

SeatMap

AirlineCard

AirportCard

ConnectionCard

FlightSummary

==========================================================
TRIPS
==========================================================

TripOverview

TripTimeline

TripDayCard

ActivityCard

BudgetSummary

PackingChecklist

ExpenseCard

ReservationCard

DocumentCard

TravelCompanionCard

TripMap

TripProgress

==========================================================
BOOKING
==========================================================

BookingSummary

PriceBreakdown

TravelerForm

PassengerCard

PaymentSummary

BookingStatus

ConfirmationCard

RefundStatus

==========================================================
DASHBOARD
==========================================================

DashboardHeader

DashboardSidebar

DashboardStats

RecentTrips

UpcomingTrips

RecentChats

TravelInsights

RecommendationFeed

NotificationFeed

QuickActions

==========================================================
ANALYTICS
==========================================================

MetricCard

LineChart

BarChart

PieChart

AreaChart

HeatMap

TrendCard

ComparisonCard

==========================================================
SETTINGS
==========================================================

GeneralSettings

NotificationSettings

PrivacySettings

MemorySettings

AppearanceSettings

LanguageSettings

SecuritySettings

SubscriptionSettings

ConnectedAccounts

==========================================================
ADMIN
==========================================================

AdminSidebar

UserTable

TripTable

AnalyticsDashboard

FeatureFlags

PromptEditor

AIProviderSettings

LogsViewer

QueueMonitor

HealthDashboard

==========================================================
MOTION COMPONENTS
==========================================================

FadeIn

SlideIn

ScaleIn

Parallax

ScrollReveal

SectionTransition

AnimatedCounter

AnimatedPath

AnimatedMap

AnimatedPlane

AnimatedLandmark

==========================================================
3D COMPONENTS
==========================================================

EarthScene

FlightPathScene

CountryHighlight

DestinationPin

InteractiveGlobeScene

StarField

CloudLayer

==========================================================
MEDIA
==========================================================

ImageGallery

VideoPlayer

Lightbox

PanoramaViewer

AudioPlayer

==========================================================
COMMON RULES

Every page must be built only from components listed above.

If a new component is needed:

Check whether an existing one can be extended.

Only create a new component when reuse is impossible.

Duplicate UI is forbidden.

---

DEPENDENCY RULE

Presentation Components

↓

Feature Components

↓

Page Components

Pages never contain business logic.

Business logic belongs to hooks/services.

---

QUALITY CHECKLIST

Every component must include

Accessibility

RTL Support

Dark Mode

Loading State

Error State

Empty State

Responsive Behavior

Animation Rules

TypeScript Types

Storybook-ready API

Unit Tests

END OF DOCUMENT
