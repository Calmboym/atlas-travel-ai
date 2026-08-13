// app/[locale]/page.tsx
//
// WHY THIS EXISTS: Next.js requires at least one page.tsx for `pnpm
// dev` / `pnpm build` to produce a servable route; without one there
// is nothing to boot into.
//
// DOCUMENTATION JUSTIFYING IT: none, deliberately. This is NOT the
// documented Landing Page experience — that has real, specific
// content (Hero, AI search box, rotating example prompts, Popular
// Destinations — ONBOARDING_EXPERIENCE.md §Landing CTA/§Initial AI
// Prompt, TRIP_PLANNING_EXPERIENCE.md §Step 1 Dream,
// APPLICATION_LAYOUT_GUIDE.md §Marketing Layout). Building that would
// be inventing product UI/content, explicitly out of scope here.
//
// STATUS: minimal boot placeholder only. Reads one placeholder string
// from messages/*.json purely to prove the i18n pipeline resolves
// end-to-end (routing → request config → message file → render).
//
// EXPECTED TO CHANGE: entirely replaced by ATLAS-P1-LAND-01 ("Build
// Marketing Layout") and ATLAS-P1-LAND-02 ("AI search box + rotating
// example prompts") — see WORK_BREAKDOWN_STRUCTURE.md §Module: LAND.
// This file should not survive Phase 1.

import { useTranslations } from "next-intl";

export default function HomePage() {
  const t = useTranslations("HomePage");

  return (
    <main>
      <h1>{t("title")}</h1>
    </main>
  );
}
