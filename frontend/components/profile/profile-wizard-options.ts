import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  Building2,
  Car,
  Footprints,
  Gem,
  Heart,
  Hotel,
  Mountain,
  PiggyBank,
  Plane,
  Sparkles,
  TrainFront,
  Users,
  Wallet,
  BedDouble,
} from "lucide-react";
import {
  ACCOMMODATION_PREFERENCE_VALUES,
  BUDGET_LEVEL_VALUES,
  TRANSPORTATION_PREFERENCE_VALUES,
  TRAVEL_PREFERENCE_VALUES,
} from "@/lib/validation/profile-schema";

/**
 * Profile Wizard option metadata (icons + message-key mapping).
 *
 * ADDED — ATLAS-P1-PROF-01. Split out of profile-wizard.tsx so the
 * icon-to-value mapping is easy to scan/verify on its own; option
 * *labels* live in messages/{en,fa,de}.json's Profile.wizard.options
 * namespace (translated), this file only maps each value to an icon
 * and the translation key.
 */

export interface WizardOption<TValue extends string> {
  value: TValue;
  icon: LucideIcon;
  /** Key into Profile.wizard.options.<field> */
  labelKey: string;
}

export const TRAVEL_PREFERENCE_OPTIONS: readonly WizardOption<
  (typeof TRAVEL_PREFERENCE_VALUES)[number]
>[] = [
  { value: "solo", icon: Footprints, labelKey: "solo" },
  { value: "family", icon: Users, labelKey: "family" },
  { value: "couple", icon: Heart, labelKey: "couple" },
  { value: "business", icon: Briefcase, labelKey: "business" },
  { value: "adventure", icon: Mountain, labelKey: "adventure" },
  { value: "luxury", icon: Gem, labelKey: "luxury" },
  { value: "budget", icon: PiggyBank, labelKey: "budget" },
];

export const BUDGET_LEVEL_OPTIONS: readonly WizardOption<(typeof BUDGET_LEVEL_VALUES)[number]>[] = [
  { value: "economy", icon: Wallet, labelKey: "economy" },
  { value: "mid_range", icon: Sparkles, labelKey: "midRange" },
  { value: "premium", icon: Gem, labelKey: "premium" },
  { value: "luxury", icon: Building2, labelKey: "luxury" },
];

export const ACCOMMODATION_PREFERENCE_OPTIONS: readonly WizardOption<
  (typeof ACCOMMODATION_PREFERENCE_VALUES)[number]
>[] = [
  { value: "hotel", icon: Hotel, labelKey: "hotel" },
  { value: "apartment", icon: Building2, labelKey: "apartment" },
  { value: "hostel", icon: BedDouble, labelKey: "hostel" },
  { value: "resort", icon: Sparkles, labelKey: "resort" },
];

export const TRANSPORTATION_PREFERENCE_OPTIONS: readonly WizardOption<
  (typeof TRANSPORTATION_PREFERENCE_VALUES)[number]
>[] = [
  { value: "flight", icon: Plane, labelKey: "flight" },
  { value: "train", icon: TrainFront, labelKey: "train" },
  { value: "car", icon: Car, labelKey: "car" },
  { value: "walking", icon: Footprints, labelKey: "walking" },
];
