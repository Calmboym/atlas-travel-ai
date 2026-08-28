"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { AlertCircle, Check } from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";
import { Skeleton } from "@/components/ui/loading";
import { useMotionPreference } from "@/components/providers/motion-provider";
import { DURATION } from "@/lib/tokens/motion";
import { getMeRequest } from "@/lib/api/auth";
import {
  getMyProfileRequest,
  updateMyProfileRequest,
  type TravelerProfile,
  type TravelerProfileUpdatePayload,
} from "@/lib/api/profile";
import { PersonalInfoSection } from "@/components/profile/profile-personal-info-section";
import { PreferencesSection } from "@/components/profile/profile-preferences-section";

/**
 * Profile page shell (ATLAS-P1-PROF-03) —
 * APPLICATION_LAYOUT_GUIDE.md §Profile Page: "Cover -> Avatar ->
 * Profile Information -> Travel Preferences -> ... ". This task's own
 * declared scope is "(Cover/Avatar/Personal Info/Preferences)" — a
 * deliberate subset of that full section list. Saved Destinations,
 * Privacy, and Danger Zone are real sections in that same document but
 * outside PROF-03's own WBS line; not built here, not silently
 * dropped — same boundary app/models/traveler_profile.py's own
 * docstring already documents on the backend side.
 *
 * ProfileMenu (COMPONENT_OWNERSHIP_MATRIX.md §4: "PROF-03 or DASH-01,
 * whichever ships first") is deliberately NOT built as part of this
 * task either — see this task's handoff notes for the full reasoning
 * (it would need to link to /trips, /saved, /dashboard, none of which
 * exist yet). The page itself is still fully reachable: nav-items.ts
 * already lists /profile in both Sidebar and MobileBottomNav.
 *
 * Cover is a decorative gradient banner, not a user-uploadable image —
 * no document anywhere describes cover-photo upload as a feature (only
 * Avatar is named as such, including in COMPONENT_OWNERSHIP_MATRIX.md's
 * own "FileUpload, ImageUpload | PROF-03 (avatar)" citation).
 */
export function ProfilePageContent() {
  const t = useTranslations("Profile.page");
  const { prefersReducedMotion } = useMotionPreference();

  const [profile, setProfile] = useState<TravelerProfile | null>(null);
  const [email, setEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const savedStatusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [localAvatarPreview, setLocalAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getMyProfileRequest(), getMeRequest()])
      .then(([profileResult, userResult]) => {
        if (cancelled) return;
        setProfile(profileResult);
        setEmail(userResult.email);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setLoadError(error instanceof Error ? error.message : t("loadError"));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [t]);

  useEffect(() => {
    return () => {
      if (savedStatusTimeoutRef.current) clearTimeout(savedStatusTimeoutRef.current);
    };
  }, []);

  async function handleSave(payload: TravelerProfileUpdatePayload) {
    setSaveStatus("saving");
    try {
      const updated = await updateMyProfileRequest(payload);
      setProfile(updated);
      setSaveStatus("saved");
      if (savedStatusTimeoutRef.current) clearTimeout(savedStatusTimeoutRef.current);
      savedStatusTimeoutRef.current = setTimeout(() => setSaveStatus("idle"), 2500);
    } catch {
      setSaveStatus("error");
    }
  }

  function handleAvatarSelected(_file: File, previewUrl: string) {
    // See ImageUpload's own docstring: no object-storage endpoint
    // exists anywhere in this repository (nothing documented in
    // ARCHITECTURE.md §11's External Provider list), so the picked
    // photo is previewed locally only — it is NOT sent to
    // PATCH /profile/me's avatar_url, which would otherwise store a
    // blob: URL that becomes invalid the moment this tab closes.
    setLocalAvatarPreview(previewUrl);
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6" aria-busy="true" aria-live="polite">
        <span className="sr-only">{t("loading")}</span>
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-24 w-24 rounded-full" />
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    );
  }

  if (loadError || !profile) {
    return (
      <div role="alert" className="flex items-center gap-2 rounded-lg bg-error-tint px-4 py-3 text-sm text-error-strong">
        <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span>{loadError ?? t("loadError")}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Cover — decorative only, aria-hidden. See module docstring. */}
      <div
        aria-hidden="true"
        className="h-32 w-full rounded-2xl bg-gradient-to-r from-primary-tint via-accent/20 to-primary-tint sm:h-40"
      />

      <div className="-mt-16 flex items-end justify-between px-2 sm:-mt-20">
        <ImageUpload
          currentImageUrl={localAvatarPreview ?? profile.avatar_url}
          fallbackInitials={(email[0] ?? "?").toUpperCase()}
          onFileSelected={handleAvatarSelected}
          onError={() => setSaveStatus("error")}
          label={t("changePhoto")}
        />

        <div role="status" aria-live="polite" className="h-6">
          {saveStatus === "saving" ? (
            <span className="text-sm text-text-secondary">{t("saving")}</span>
          ) : null}
          {saveStatus === "saved" ? (
            <motion.span
              initial={prefersReducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: DURATION.fast }}
              className="flex items-center gap-1 text-sm text-success"
            >
              <Check className="h-4 w-4" aria-hidden="true" />
              {t("saved")}
            </motion.span>
          ) : null}
          {saveStatus === "error" ? (
            <span role="alert" className="flex items-center gap-1 text-sm text-error-strong">
              <AlertCircle className="h-4 w-4" aria-hidden="true" />
              {t("saveError")}
            </span>
          ) : null}
        </div>
      </div>

      {localAvatarPreview ? (
        <p className="-mt-4 text-xs text-text-muted">{t("avatarStorageNotConnected")}</p>
      ) : null}

      <div className="atlas-glass-2 rounded-2xl p-6">
        <PersonalInfoSection profile={profile} email={email} onSave={handleSave} />
      </div>

      <div className="atlas-glass-2 rounded-2xl p-6">
        <PreferencesSection profile={profile} onSave={handleSave} />
      </div>
    </div>
  );
}
