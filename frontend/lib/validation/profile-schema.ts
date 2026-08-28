import { z } from "zod";

/**
 * Profile Wizard validation schema (ATLAS-P1-PROF-01).
 *
 * Field-shape provenance — every enum value taken verbatim from
 * APPLICATION_LAYOUT_GUIDE.md §Profile Sections, same source as the
 * backend's app/models/traveler_profile.py (kept hand-in-sync; no
 * shared codegen step exists in this project, same note as
 * lib/api/auth.ts carries for response shapes):
 *
 * - travelPreference: §Travel Preferences (Solo/Family/Couple/Business/
 *   Adventure/Luxury/Budget) — Wizard Screen 1 ("Travel Preferences" in
 *   USER_FLOWS.md Flow 03).
 * - budgetLevel: §Budget (Economy/Mid-range/Premium/Luxury) — Screen 2
 *   ("Budget" in Flow 03).
 * - accommodationPreference / transportationPreference: §Accommodation
 *   and §Transportation. Flow 03's Screen 3 is labeled "Travel Style",
 *   a concept no document defines with its own enumerated value list
 *   (see this task's handoff notes for the full reasoning) — mapped
 *   here to these two closed, documented lists, both genuinely about
 *   HOW someone likes to travel.
 *
 * Same factory pattern as lib/validation/auth-schema.ts's
 * createRegisterSchema: messages passed in as plain strings so this
 * module stays free of any i18n-library coupling, with an English
 * default export for schema-only unit tests.
 */

export const TRAVEL_PREFERENCE_VALUES = [
  "solo",
  "family",
  "couple",
  "business",
  "adventure",
  "luxury",
  "budget",
] as const;

export const BUDGET_LEVEL_VALUES = ["economy", "mid_range", "premium", "luxury"] as const;

export const ACCOMMODATION_PREFERENCE_VALUES = ["hotel", "apartment", "hostel", "resort"] as const;

export const TRANSPORTATION_PREFERENCE_VALUES = ["flight", "train", "car", "walking"] as const;

export interface ProfileWizardSchemaMessages {
  travelPreferenceRequired: string;
  budgetLevelRequired: string;
  accommodationPreferenceRequired: string;
  transportationPreferenceRequired: string;
}

export function createProfileWizardSchema(messages: ProfileWizardSchemaMessages) {
  return z.object({
    travelPreference: z.enum(TRAVEL_PREFERENCE_VALUES, {
      message: messages.travelPreferenceRequired,
    }),
    budgetLevel: z.enum(BUDGET_LEVEL_VALUES, {
      message: messages.budgetLevelRequired,
    }),
    accommodationPreference: z.enum(ACCOMMODATION_PREFERENCE_VALUES, {
      message: messages.accommodationPreferenceRequired,
    }),
    transportationPreference: z.enum(TRANSPORTATION_PREFERENCE_VALUES, {
      message: messages.transportationPreferenceRequired,
    }),
  });
}

const DEFAULT_EN_MESSAGES: ProfileWizardSchemaMessages = {
  travelPreferenceRequired: "Please choose the option that best describes this trip.",
  budgetLevelRequired: "Please choose a budget level.",
  accommodationPreferenceRequired: "Please choose an accommodation preference.",
  transportationPreferenceRequired: "Please choose a transportation preference.",
};

export const profileWizardSchema = createProfileWizardSchema(DEFAULT_EN_MESSAGES);

export type ProfileWizardValues = z.infer<typeof profileWizardSchema>;

/** One entry per wizard screen — field(s) each screen is responsible
 * for validating before "Continue" is enabled. */
export const WIZARD_STEP_FIELDS = [
  ["travelPreference"],
  ["budgetLevel"],
  ["accommodationPreference", "transportationPreference"],
] as const satisfies readonly (readonly (keyof ProfileWizardValues)[])[];
