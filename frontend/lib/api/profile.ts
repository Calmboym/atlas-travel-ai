/**
 * Typed wrappers around the backend's /api/v1/profile/* endpoints.
 *
 * ADDED — ATLAS-P1-PROF-01/02. Response shape mirrors
 * backend/app/schemas/profile.py's TravelerProfileResponse by hand —
 * same "no OpenAPI client generation step yet" note as lib/api/auth.ts.
 */

import { apiFetch } from "@/lib/api/client";

export type TravelPreference =
  | "solo"
  | "family"
  | "couple"
  | "business"
  | "adventure"
  | "luxury"
  | "budget";

export type BudgetLevel = "economy" | "mid_range" | "premium" | "luxury";

export type AccommodationPreference = "hotel" | "apartment" | "hostel" | "resort";

export type TransportationPreference = "flight" | "train" | "car" | "walking";

export type FoodPreference = "vegetarian" | "vegan" | "halal" | "kosher" | "allergies";

export interface TravelerProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  country: string | null;
  timezone: string | null;
  avatar_url: string | null;
  travel_preference: TravelPreference | null;
  budget_level: BudgetLevel | null;
  accommodation_preference: AccommodationPreference | null;
  transportation_preference: TransportationPreference | null;
  food_preferences: FoodPreference[] | null;
  preferred_ui_language: string | null;
  preferred_travel_language: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Every field optional — matches the backend's partial-update contract
 * (app/schemas/profile.py's TravelerProfileUpdate): a field omitted
 * from this object leaves the stored value unchanged; a field present
 * with value `null` clears it.
 */
export type TravelerProfileUpdatePayload = Partial<{
  full_name: string | null;
  phone: string | null;
  country: string | null;
  timezone: string | null;
  avatar_url: string | null;
  travel_preference: TravelPreference | null;
  budget_level: BudgetLevel | null;
  accommodation_preference: AccommodationPreference | null;
  transportation_preference: TransportationPreference | null;
  food_preferences: FoodPreference[] | null;
  preferred_ui_language: string | null;
  preferred_travel_language: string | null;
}>;

export function getMyProfileRequest(): Promise<TravelerProfile> {
  return apiFetch<TravelerProfile>("/api/v1/profile/me", { method: "GET" });
}

export function updateMyProfileRequest(
  payload: TravelerProfileUpdatePayload,
): Promise<TravelerProfile> {
  return apiFetch<TravelerProfile>("/api/v1/profile/me", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
