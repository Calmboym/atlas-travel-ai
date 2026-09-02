/**
 * ATLAS-P1-LAND-02 — rotating example prompts for the Hero AI search box.
 *
 * TRIP_PLANNING_EXPERIENCE.md §Step 1 (Dream) gives this exact list of
 * eight example prompts, verbatim, as the documented content for this
 * feature ("no forms. no filters. Conversation first."). The English
 * strings below are that list unchanged; `messages/{en,fa,de}.json`'s
 * `HomePage.hero.examplePrompts` array carries the localized versions
 * (meaning/tone/intent preserved per COPYWRITING_GUIDELINES.md
 * §Localization Rules, not literal translation) — this file only
 * defines *how many* there are and their rotation order, not the
 * translated text itself, which lives with the rest of the page copy.
 */
export const EXAMPLE_PROMPT_COUNT = 8;

/** ONBOARDING_EXPERIENCE.md §Initial AI Prompt: "Examples rotate
 *  subtly without distracting the user." Slow enough to read a full
 *  sentence, per COPYWRITING_GUIDELINES.md's 8-18 word sentence
 *  guidance for this kind of prompt. */
export const PROMPT_ROTATION_INTERVAL_MS = 4000;
