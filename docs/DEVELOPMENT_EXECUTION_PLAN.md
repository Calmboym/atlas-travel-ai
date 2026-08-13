# Development Execution Plan

**Project:** Atlas — AI Travel Platform
**Date:** 2026-07-22
**Status:** LOCKED — Tier 1 (permanent reference). Approved 2026-07-22.

This is the process that ties the Roadmap, WBS, and Conversation Strategy together into something hundreds of independent Claude sessions can actually execute without drifting.

---

## 1. Session Lifecycle

Every implementation session (not this one) follows the same three-part shape:

**Start**
1. Read `MASTER_RULES.md`, `PROJECT_STATE.md`, `TASK_BOARD.md`, `INDEX.md`, `WORK_BREAKDOWN_STRUCTURE.md` — nothing else, yet.
2. Read only the documentation and files `PROJECT_STATE.md` / the assigned WBS Task point to.
3. Confirm the assigned task's Definition of Ready is met (dependencies done, docs available, scope fits one conversation). If not, stop and report — don't proceed on a guess.

**Middle**
4. Implement exactly the assigned WBS Task. Nothing upstream, nothing downstream, no drive-by refactors.
5. Follow `MASTER_RULES.md` without exception (Design Tokens only, no hardcoded values, accessibility built in from the start, tests included, no TODOs or placeholders).

**End**
6. Run the Definition of Done checklist from `MASTER_RULES.md` against the actual deliverable.
7. Update `PROJECT_STATE.md` and `TASK_BOARD.md` (and `WORK_BREAKDOWN_STRUCTURE.md` only if scope genuinely changed).
8. Produce the implementation + handoff summary, list every file touched, name the next task, and stop.

This lifecycle is also what `SESSION_PROMPT.md` instructs, verbatim, at the start of every future conversation.

---

## 2. Design Bible Amendment Process

The Design Bible documents are immutable per `WORKFLOW.md`. But immutable documents still occasionally need correction (as this session's audit demonstrates — see Findings 1, 2, 3). The process, consistent with `FRONTEND_IMPLEMENTATION_GUIDELINES.md`'s own closing line ("...unless documented through a formal versioned revision"):

1. **Never edit a locked document's body.** Not even to fix a typo or a numbering error.
2. A correction is proposed as a new, separately-versioned **addendum** (e.g., `14_DESIGN_TOKENS_ADDENDUM_v1.1.md`), referencing the exact section it amends.
3. The addendum is presented to you for explicit approval — never auto-applied.
4. Once approved, `.ai/INDEX.md` and `.ai/WORK_BREAKDOWN_STRUCTURE.md` are updated to point future sessions at "original + addendum" as the combined source of truth for that document.
5. The original document's `LOCK STATUS: IMMUTABLE` is honored — it is superseded, not altered.

This is the exact mechanism used to resolve Q1–Q3: on 2026-07-22 the project owner approved all three, and they now exist as Amendments 001–003 in `.ai/DESIGN_BIBLE_AMENDMENTS.md` — the first executed instance of this process, not a hypothetical. (Q4 was a scope decision rather than a document correction, so it was recorded directly in `PROJECT_STATE.md` instead — see that file's "Resolved Decisions" section for the reasoning.)

---

## 3. Governance — What Requires Your Sign-Off vs. What Doesn't

**Requires explicit approval, every time:**
- Any Design Bible amendment.
- Any change to `ARCHITECTURE.md`'s technology choices.
- Starting a new Phase.
- Resolving a genuine document conflict (never done unilaterally by an implementation session).

**Does not require approval, and should just happen:**
- Following an already-approved WBS Task to completion.
- Choosing a sensible default within a task's scope when the Design Bible under-specifies a micro-decision (e.g. exact wording of a loading message, chosen from `COPYWRITING_GUIDELINES.md`'s own examples).
- Updating the five `.ai/` memory files at session end.

---

## 4. Risk Register

| Risk | Mitigation |
|---|---|
| A session skips `INDEX.md` and re-reads large swaths of the Design Bible "just in case," bloating context and slowing itself down | `SESSION_PROMPT.md` explicitly forbids scanning unrelated documentation; `INDEX.md` is built precisely to make this unnecessary |
| Two parallel conversations touch overlapping files | Conversation Strategy's "Allowed Files to Modify" list is mandatory in every conversation definition; overlaps are caught at definition time, not discovered mid-implementation |
| The unresolved numbering conflict (Q1) causes two sessions to cite the Design Bible differently | This deliverable set already standardizes on one proposed numbering everywhere; only needs your confirmation to become final |
| A far-future phase (5–7) gets over-planned now and the detail goes stale before it's relevant | WBS deliberately uses rolling-wave planning: full task breakdown for Phase 1 only, module/feature level for Phases 2–7, elaborated just before each phase starts |
| Scope creep inside a single conversation ("while I'm here, I'll also...") | Explicitly forbidden by Conversation Rules; Maximum Scope field exists in every conversation definition precisely to name the temptation in advance |

---

## 5. Success Metrics Tie-Back

Every phase above ultimately serves `PRODUCT_VISION.md` §23's North Star Metric: **Successful Trips Assisted**. Phase 1 doesn't move that metric on its own (no trip exists yet), but it is the load-bearing prerequisite — without registration, persistent memory, and a working chat surface, no trip can ever be planned, let alone completed. Phase-level KPIs are tracked in `MASTER_IMPLEMENTATION_ROADMAP.md`'s exit criteria per phase; product-level KPIs remain exactly as defined in `PRODUCT_VISION.md` §24 and are not restated here.

---

## 6. What This Session Did Not Do

Per the Master Build Prompt's explicit constraints: no production code, no application source files, no edits to any of the 33 uploaded documents. Everything in this plan is a proposal for how future sessions should operate — nothing here takes effect until you approve it and the first implementation conversation begins.


---

**END OF DOCUMENT**

**LOCK STATUS:**
**IMMUTABLE — approved baseline, 2026-07-22, following Q1–Q4 sign-off.**
