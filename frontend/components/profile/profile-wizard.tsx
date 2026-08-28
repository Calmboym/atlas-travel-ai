"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { useForm, useWatch, type Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle2, type LucideIcon } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { Link } from "@/i18n/navigation";
import { useMotionPreference } from "@/components/providers/motion-provider";
import { DURATION, SPRING_GENTLE } from "@/lib/tokens/motion";
import {
  createProfileWizardSchema,
  WIZARD_STEP_FIELDS,
  type ProfileWizardValues,
} from "@/lib/validation/profile-schema";
import { getMyProfileRequest, updateMyProfileRequest } from "@/lib/api/profile";
import {
  ACCOMMODATION_PREFERENCE_OPTIONS,
  BUDGET_LEVEL_OPTIONS,
  TRANSPORTATION_PREFERENCE_OPTIONS,
  TRAVEL_PREFERENCE_OPTIONS,
  type WizardOption,
} from "@/components/profile/profile-wizard-options";
import { StepIndicator, type Step } from "@/components/ui/step-indicator";

/**
 * Profile Wizard (ATLAS-P1-PROF-01) — USER_FLOWS.md Flow 03's
 * post-verification step: "Profile Wizard -> Travel Preferences ->
 * Budget -> Travel Style -> Dashboard".
 *
 * Scope note (documented, not a blocker — see this task's own handoff):
 * this component is reachable at its own route
 * (app/[locale]/(app)/profile/wizard) but is NOT auto-triggered after
 * email verification. Wiring that trigger would mean editing AUTH-04's
 * VerifyEmailContent to redirect somewhere, and the flow's own final
 * destination ("-> Dashboard") doesn't exist yet (DASH-01) — the exact
 * same "nowhere real to send the user yet" reasoning AUTH-05's own
 * handoff already used for its post-login redirect. The wizard ends by
 * linking to /profile (real, this same task group's PROF-03) instead.
 *
 * Each step saves progressively (PATCH on every "Continue", not once
 * at the end) — ONBOARDING_EXPERIENCE.md: "The user should never feel
 * that previous work was lost." An abandoned wizard still keeps
 * whatever was already answered.
 *
 * Existing answers are loaded on mount and used to pre-fill the form —
 * ONBOARDING_EXPERIENCE.md: "Never ask the user to repeat information
 * already known" — relevant for anyone re-opening the wizard, not just
 * a hard requirement for the (currently non-existent) auto-redirect
 * case.
 */

type StepField = keyof ProfileWizardValues;

interface WizardStepConfig {
  field: StepField;
  /** A second field shown on the same screen, if any (Step 3 pairs
   * accommodation + transportation — see profile-schema.ts's own note
   * on why "Travel Style" maps to these two fields). */
  secondField?: StepField;
  options: readonly WizardOption<string>[];
  secondOptions?: readonly WizardOption<string>[];
}

const STEP_CONFIG: readonly WizardStepConfig[] = [
  { field: "travelPreference", options: TRAVEL_PREFERENCE_OPTIONS },
  { field: "budgetLevel", options: BUDGET_LEVEL_OPTIONS },
  {
    field: "accommodationPreference",
    options: ACCOMMODATION_PREFERENCE_OPTIONS,
    secondField: "transportationPreference",
    secondOptions: TRANSPORTATION_PREFERENCE_OPTIONS,
  },
];

/** Maps a wizard field name to the backend's PATCH payload key —
 * camelCase (form/schema convention) to snake_case (API convention). */
const FIELD_TO_API_KEY: Record<StepField, string> = {
  travelPreference: "travel_preference",
  budgetLevel: "budget_level",
  accommodationPreference: "accommodation_preference",
  transportationPreference: "transportation_preference",
};

function OptionGrid({
  name,
  options,
  value,
  onValueChange,
  getLabel,
  legend,
}: {
  name: string;
  options: readonly WizardOption<string>[];
  value: string | undefined;
  onValueChange: (value: string) => void;
  getLabel: (labelKey: string) => string;
  legend: string;
}) {
  return (
    <RadioGroup
      value={value}
      onValueChange={onValueChange}
      aria-label={legend}
      className="grid grid-cols-2 gap-3 sm:grid-cols-3"
    >
      {options.map((option) => {
        const Icon: LucideIcon = option.icon;
        return (
          <RadioGroupItem key={option.value} variant="card" value={option.value} id={`${name}-${option.value}`}>
            <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
            <span className="text-sm font-medium text-text-primary">{getLabel(option.labelKey)}</span>
          </RadioGroupItem>
        );
      })}
    </RadioGroup>
  );
}

export function ProfileWizard() {
  const { prefersReducedMotion } = useMotionPreference();
  const t = useTranslations("Profile.wizard");
  const tOptions = useTranslations("Profile.wizard.options");
  const tValidation = useTranslations("Profile.wizard.validation");

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isLoadingExisting, setIsLoadingExisting] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  const localizedSchema = useMemo(
    () =>
      createProfileWizardSchema({
        travelPreferenceRequired: tValidation("travelPreferenceRequired"),
        budgetLevelRequired: tValidation("budgetLevelRequired"),
        accommodationPreferenceRequired: tValidation("accommodationPreferenceRequired"),
        transportationPreferenceRequired: tValidation("transportationPreferenceRequired"),
      }),
    [tValidation],
  );

  const {
    control,
    getValues,
    setValue,
    trigger,
    reset,
    formState: { errors },
  } = useForm<ProfileWizardValues>({
    resolver: zodResolver(localizedSchema),
  });

  // Pre-fill from any answers already on the profile (see module
  // docstring — "never ask the user to repeat information already known").
  useEffect(() => {
    let cancelled = false;
    getMyProfileRequest()
      .then((profile) => {
        if (cancelled) return;
        reset({
          travelPreference: profile.travel_preference ?? undefined,
          budgetLevel: profile.budget_level ?? undefined,
          accommodationPreference: profile.accommodation_preference ?? undefined,
          transportationPreference: profile.transportation_preference ?? undefined,
        } as ProfileWizardValues);
      })
      .catch(() => {
        // Nothing to pre-fill — proceed with an empty wizard. Load
        // failure isn't fatal here (unlike a save failure): every
        // field is still answerable from scratch.
      })
      .finally(() => {
        if (!cancelled) setIsLoadingExisting(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reset]);

  const stepIds: readonly Step[] = useMemo(
    () => [
      { id: "travel-preference", label: t("steps.travelPreference") },
      { id: "budget", label: t("steps.budget") },
      { id: "travel-style", label: t("steps.travelStyle") },
    ],
    [t],
  );

  const currentStep = STEP_CONFIG[currentStepIndex];
  const isLastStep = currentStepIndex === STEP_CONFIG.length - 1;
  const fieldsForCurrentStep = WIZARD_STEP_FIELDS[currentStepIndex];

  const errorSummaryId = useId();

  // Must be called unconditionally, before any early return (Rules of
  // Hooks) — hence the `?? currentStep.field` fallback for
  // `secondFieldValue`'s `name` on steps with no second field: it's a
  // harmless extra subscription, never read unless
  // `currentStep.secondField` is actually set (see render below).
  const currentFieldValue = useWatch({ control, name: currentStep.field });
  const secondFieldValue = useWatch({
    control,
    name: currentStep.secondField ?? currentStep.field,
  });

  async function handleContinue() {
    setSaveError(null);
    const isValid = await trigger(fieldsForCurrentStep as unknown as Path<ProfileWizardValues>[]);
    if (!isValid) return;

    const payload: Record<string, string> = {};
    for (const field of fieldsForCurrentStep) {
      const apiKey = FIELD_TO_API_KEY[field];
      const fieldValue = getValues(field);
      if (fieldValue) payload[apiKey] = fieldValue;
    }

    setIsSaving(true);
    try {
      await updateMyProfileRequest(payload);
      if (isLastStep) {
        setIsComplete(true);
      } else {
        setCurrentStepIndex((index) => index + 1);
      }
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : t("genericError"));
    } finally {
      setIsSaving(false);
    }
  }

  function handleBack() {
    setSaveError(null);
    setCurrentStepIndex((index) => Math.max(0, index - 1));
  }

  if (isLoadingExisting) {
    return (
      <div role="status" aria-live="polite" className="py-12 text-center text-sm text-text-secondary">
        {t("loading")}
      </div>
    );
  }

  if (isComplete) {
    return (
      <motion.div
        role="status"
        initial={prefersReducedMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: DURATION.normal }}
        className="flex flex-col items-center gap-3 py-10 text-center"
      >
        <CheckCircle2 className="h-10 w-10 text-primary" aria-hidden="true" />
        <p className="text-lg font-semibold text-text-primary">{t("completeTitle")}</p>
        <p className="max-w-sm text-sm text-text-secondary">{t("completeSubtitle")}</p>
        <Link href="/profile" className={cn(buttonVariants({ variant: "primary" }), "mt-2")}>
          {t("viewProfile")}
        </Link>
      </motion.div>
    );
  }

  const currentFieldError = errors[currentStep.field]?.message;
  const secondFieldError = currentStep.secondField ? errors[currentStep.secondField]?.message : undefined;

  return (
    <div className="flex flex-col gap-8">
      <StepIndicator steps={stepIds} currentStepIndex={currentStepIndex} />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStepIndex}
          initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }}
          transition={{ duration: DURATION.normal }}
          className="flex flex-col gap-6"
        >
          <div>
            <h2 className="text-xl font-semibold leading-snug text-text-primary">
              {t(`titles.${currentStep.field}`)}
            </h2>
            <p className="mt-1 text-sm text-text-secondary">{t(`descriptions.${currentStep.field}`)}</p>
          </div>

          <div>
            <OptionGrid
              name={currentStep.field}
              options={currentStep.options}
              value={currentFieldValue ?? ""}
              onValueChange={(value) => setValue(currentStep.field, value as never, { shouldValidate: true })}
              getLabel={tOptions}
              legend={t(`titles.${currentStep.field}`)}
            />
            {currentFieldError ? (
              <p role="alert" className="mt-2 flex items-center gap-1.5 text-sm text-error-strong">
                <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                {currentFieldError}
              </p>
            ) : null}
          </div>

          {currentStep.secondField && currentStep.secondOptions ? (
            <div>
              <h3 className="text-base font-semibold leading-snug text-text-primary">
                {t(`titles.${currentStep.secondField}`)}
              </h3>
              <p className="mt-1 text-sm text-text-secondary">{t(`descriptions.${currentStep.secondField}`)}</p>
              <div className="mt-3">
                <OptionGrid
                  name={currentStep.secondField}
                  options={currentStep.secondOptions}
                  value={secondFieldValue ?? ""}
                  onValueChange={(value) =>
                    setValue(currentStep.secondField as StepField, value as never, { shouldValidate: true })
                  }
                  getLabel={tOptions}
                  legend={t(`titles.${currentStep.secondField}`)}
                />
                {secondFieldError ? (
                  <p role="alert" className="mt-2 flex items-center gap-1.5 text-sm text-error-strong">
                    <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                    {secondFieldError}
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}
        </motion.div>
      </AnimatePresence>

      {saveError ? (
        <motion.div
          id={errorSummaryId}
          role="alert"
          initial={prefersReducedMotion ? false : { opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={SPRING_GENTLE}
          className="flex items-center gap-2 rounded-lg bg-error-tint px-4 py-3 text-sm text-error-strong"
        >
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{saveError}</span>
        </motion.div>
      ) : null}

      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" onClick={handleBack} disabled={currentStepIndex === 0 || isSaving}>
          {t("back")}
        </Button>
        <Button onClick={handleContinue} isLoading={isSaving}>
          {isSaving ? t("saving") : isLastStep ? t("finish") : t("continue")}
        </Button>
      </div>
    </div>
  );
}
