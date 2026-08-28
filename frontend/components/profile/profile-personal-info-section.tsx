"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { TravelerProfile, TravelerProfileUpdatePayload } from "@/lib/api/profile";

/**
 * Personal Info section (ATLAS-P1-PROF-03) —
 * APPLICATION_LAYOUT_GUIDE.md §Profile Sections §Personal Information
 * (Name, Email, Phone, Country, Timezone).
 *
 * Email is shown read-only: it lives on User (AUTH's domain), not
 * TravelerProfile, and this task's scope is Profile CRUD, not account
 * email changes (that would be an AUTH-domain feature — changing a
 * verified login email typically needs its own re-verification flow,
 * out of scope here, same "flag rather than quietly expand scope"
 * boundary this project applies everywhere else).
 *
 * No documented list exists for Country (a real list would be ~195
 * entries, unspecified anywhere) or Timezone (IANA's tz database is
 * ~400 entries, also unspecified) — both are free-text Inputs rather
 * than invented Select option lists, consistent with not fabricating
 * scope no document actually calls for.
 *
 * Autosave-on-blur, one field at a time, only when the value actually
 * changed since the last save — matches
 * TRIP_PLANNING_EXPERIENCE.md's "Saving is automatic. No Save button
 * required" philosophy, applied here to a settings context rather than
 * itinerary editing.
 */
export interface PersonalInfoSectionProps {
  profile: TravelerProfile;
  email: string;
  onSave: (payload: TravelerProfileUpdatePayload) => Promise<void>;
}

type PersonalInfoField = "full_name" | "phone" | "country" | "timezone";

export function PersonalInfoSection({ profile, email, onSave }: PersonalInfoSectionProps) {
  const t = useTranslations("Profile.page.personalInfo");

  const [values, setValues] = useState<Record<PersonalInfoField, string>>({
    full_name: profile.full_name ?? "",
    phone: profile.phone ?? "",
    country: profile.country ?? "",
    timezone: profile.timezone ?? "",
  });
  const lastSavedRef = useRef(values);

  function handleBlur(field: PersonalInfoField) {
    if (values[field] === lastSavedRef.current[field]) return;
    lastSavedRef.current = { ...lastSavedRef.current, [field]: values[field] };
    void onSave({ [field]: values[field] || null });
  }

  return (
    <section aria-labelledby="personal-info-heading" className="flex flex-col gap-5">
      <h2 id="personal-info-heading" className="text-lg font-semibold text-text-primary">
        {t("heading")}
      </h2>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="profile-email">{t("email")}</Label>
          <Input id="profile-email" value={email} disabled readOnly />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="profile-full-name">{t("fullName")}</Label>
          <Input
            id="profile-full-name"
            value={values.full_name}
            onChange={(event) => setValues((prev) => ({ ...prev, full_name: event.target.value }))}
            onBlur={() => handleBlur("full_name")}
            placeholder={t("fullNamePlaceholder")}
            autoComplete="name"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="profile-phone">{t("phone")}</Label>
          <Input
            id="profile-phone"
            type="tel"
            value={values.phone}
            onChange={(event) => setValues((prev) => ({ ...prev, phone: event.target.value }))}
            onBlur={() => handleBlur("phone")}
            placeholder={t("phonePlaceholder")}
            autoComplete="tel"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="profile-country">{t("country")}</Label>
          <Input
            id="profile-country"
            value={values.country}
            onChange={(event) => setValues((prev) => ({ ...prev, country: event.target.value }))}
            onBlur={() => handleBlur("country")}
            placeholder={t("countryPlaceholder")}
            autoComplete="country-name"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="profile-timezone">{t("timezone")}</Label>
          <Input
            id="profile-timezone"
            value={values.timezone}
            onChange={(event) => setValues((prev) => ({ ...prev, timezone: event.target.value }))}
            onBlur={() => handleBlur("timezone")}
            placeholder={t("timezonePlaceholder")}
          />
        </div>
      </div>
    </section>
  );
}
