"use client";

import { useTranslations } from "next-intl";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  ACCOMMODATION_PREFERENCE_VALUES,
  BUDGET_LEVEL_VALUES,
  TRANSPORTATION_PREFERENCE_VALUES,
  TRAVEL_PREFERENCE_VALUES,
} from "@/lib/validation/profile-schema";
import type {
  FoodPreference,
  TravelerProfile,
  TravelerProfileUpdatePayload,
} from "@/lib/api/profile";

/**
 * Preferences section (ATLAS-P1-PROF-03) —
 * APPLICATION_LAYOUT_GUIDE.md §Profile Sections: Travel Preferences,
 * Budget, Accommodation, Transportation, Food Preferences, Languages.
 * Same underlying fields the Profile Wizard (PROF-01) collects; this
 * is the ongoing "edit anytime" surface ("every field editable
 * later" — PROF-01's own acceptance criterion). Deliberately a
 * different visual treatment than the wizard's big option cards
 * (DESIGN_TOKENS.md: "Compact layouts are reserved for data-heavy...
 * screens" — a settings page listing six groups of preferences at
 * once is exactly that, vs. the wizard's one-concept-per-screen
 * pacing) — compact Select dropdowns and checkboxes here, sharing the
 * SAME translated option labels via Profile.wizard.options rather
 * than duplicating that translation work under a second key.
 *
 * Each control saves immediately on change (no separate Save button,
 * matching PersonalInfoSection's autosave philosophy) since a
 * single-select or checkbox toggle is already a complete, unambiguous
 * "decision" the moment it happens — unlike free text, there's no
 * natural "still typing" state to wait out.
 *
 * preferred_ui_language / preferred_travel_language: no document
 * defines a language-option list broader than this app's own 3
 * implemented locales (en/fa/de — i18n/routing.ts, DEBUG_LOG.md).
 * PRD.md §9's wider 8-language ambition (+AR/FR/ES/ZH/JA) is Phase 4+
 * per DOCUMENTATION_AUDIT_REPORT.md Finding 7 / Amendment-recorded Q4
 * scope decision — using it here would offer languages the product
 * doesn't actually support yet. Both dropdowns use the same 3-locale
 * list; flagged as a scope decision in this task's handoff, not
 * silently assumed.
 */
export interface PreferencesSectionProps {
  profile: TravelerProfile;
  onSave: (payload: TravelerProfileUpdatePayload) => Promise<void>;
}

const LANGUAGE_OPTIONS = ["en", "fa", "de"] as const;

const FOOD_PREFERENCE_VALUES: readonly FoodPreference[] = [
  "vegetarian",
  "vegan",
  "halal",
  "kosher",
  "allergies",
];

export function PreferencesSection({ profile, onSave }: PreferencesSectionProps) {
  const t = useTranslations("Profile.page.preferences");
  const tOptions = useTranslations("Profile.wizard.options");
  const tLanguages = useTranslations("Profile.page.languages");

  const foodPreferences = new Set(profile.food_preferences ?? []);

  function toggleFoodPreference(value: FoodPreference, checked: boolean) {
    const next = new Set(foodPreferences);
    if (checked) next.add(value);
    else next.delete(value);
    void onSave({ food_preferences: Array.from(next) });
  }

  return (
    <section aria-labelledby="preferences-heading" className="flex flex-col gap-6">
      <h2 id="preferences-heading" className="text-lg font-semibold text-text-primary">
        {t("heading")}
      </h2>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="profile-travel-preference">{t("travelPreference")}</Label>
          <Select
            value={profile.travel_preference ?? undefined}
            onValueChange={(value) => void onSave({ travel_preference: value as never })}
          >
            <SelectTrigger id="profile-travel-preference">
              <SelectValue placeholder={t("notSet")} />
            </SelectTrigger>
            <SelectContent>
              {TRAVEL_PREFERENCE_VALUES.map((value) => (
                <SelectItem key={value} value={value}>
                  {tOptions(value)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="profile-budget-level">{t("budgetLevel")}</Label>
          <Select
            value={profile.budget_level ?? undefined}
            onValueChange={(value) => void onSave({ budget_level: value as never })}
          >
            <SelectTrigger id="profile-budget-level">
              <SelectValue placeholder={t("notSet")} />
            </SelectTrigger>
            <SelectContent>
              {BUDGET_LEVEL_VALUES.map((value) => (
                <SelectItem key={value} value={value}>
                  {tOptions(value === "mid_range" ? "midRange" : value)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="profile-accommodation">{t("accommodationPreference")}</Label>
          <Select
            value={profile.accommodation_preference ?? undefined}
            onValueChange={(value) => void onSave({ accommodation_preference: value as never })}
          >
            <SelectTrigger id="profile-accommodation">
              <SelectValue placeholder={t("notSet")} />
            </SelectTrigger>
            <SelectContent>
              {ACCOMMODATION_PREFERENCE_VALUES.map((value) => (
                <SelectItem key={value} value={value}>
                  {tOptions(value)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="profile-transportation">{t("transportationPreference")}</Label>
          <Select
            value={profile.transportation_preference ?? undefined}
            onValueChange={(value) => void onSave({ transportation_preference: value as never })}
          >
            <SelectTrigger id="profile-transportation">
              <SelectValue placeholder={t("notSet")} />
            </SelectTrigger>
            <SelectContent>
              {TRANSPORTATION_PREFERENCE_VALUES.map((value) => (
                <SelectItem key={value} value={value}>
                  {tOptions(value)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="profile-ui-language">{t("uiLanguage")}</Label>
          <Select
            value={profile.preferred_ui_language ?? undefined}
            onValueChange={(value) => void onSave({ preferred_ui_language: value })}
          >
            <SelectTrigger id="profile-ui-language">
              <SelectValue placeholder={t("notSet")} />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGE_OPTIONS.map((code) => (
                <SelectItem key={code} value={code}>
                  {tLanguages(code)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="profile-travel-language">{t("travelLanguage")}</Label>
          <Select
            value={profile.preferred_travel_language ?? undefined}
            onValueChange={(value) => void onSave({ preferred_travel_language: value })}
          >
            <SelectTrigger id="profile-travel-language">
              <SelectValue placeholder={t("notSet")} />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGE_OPTIONS.map((code) => (
                <SelectItem key={code} value={code}>
                  {tLanguages(code)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label className="mb-2 block">{t("foodPreferences")}</Label>
        <div className="flex flex-wrap gap-x-6 gap-y-3">
          {FOOD_PREFERENCE_VALUES.map((value) => (
            <div key={value} className="flex items-center gap-2">
              <Checkbox
                id={`food-preference-${value}`}
                checked={foodPreferences.has(value)}
                onCheckedChange={(checked) => toggleFoodPreference(value, checked === true)}
              />
              <Label htmlFor={`food-preference-${value}`} className="font-normal">
                {tOptions(value)}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
