# Conversation Strategy

**Project:** Atlas — AI Travel Platform
**Date:** 2026-07-22
**Status:** LOCKED — Tier 1 (permanent reference). Approved 2026-07-22.

> **PROPOSAL NOTE (2026-07-29):** Adds §7 below. Everything else reproduced verbatim from the locked baseline. §7 is PROPOSED, pending project owner approval, consistent with `MASTER_RULES.md` v1.2's proposed status.

Atlas will be built across many independent Claude conversations rather than one continuous session. This document defines how each one is scoped so that conversation history never has to serve as project memory — `.ai/` does that job instead.

---

## 1. Governing Rule

**One conversation implements exactly one WBS Task, or a small group of tightly-coupled Subtasks under one Task.** If a requested piece of work doesn't fit that, it gets split into smaller WBS Tasks *before* implementation starts, not partway through — per your own Conversation Rules.

A conversation never:
- continues on to the "next logical task" once its assigned task is done — it stops and hands off;
- modifies files outside the ones listed in its own scope;
- redesigns architecture or UI while implementing a feature, even if it spots a real problem (it reports the problem in its handoff instead).

---

## 2. Conversation Naming Convention

```
[MODULE]-[NNN] — [Short Objective]
```
Example: `AUTH-001 — Email/Password Registration Flow`

Module codes match the WBS: `LAND`, `AUTH`, `PROF`, `CHAT`, `MEM`, `DASH`, `ONBOARD`, `INFRA` (Phase 0–1, elaborated to Task level now). Phase 2–7 use finer-grained codes assigned when each phase gets its own Task-level elaboration (e.g. `ORCH`, `AGENTSVC`, `CORE-AGENTS` for Phase 2; `INTEG-MAPS`, `DOMAIN-AGENTS`, `RAG` for Phase 3; `MEMSVC`, `PERSONALIZE` for Phase 4) — see `WORK_BREAKDOWN_STRUCTURE.md` for the authoritative, current set at any point in time.

---

## 3. Conversation Definition Template

Every conversation is defined, before it starts, with this exact structure (this is also what `SESSION_PROMPT.md` asks the assistant to read/produce):

```
Conversation Name:        [MODULE-NNN — Objective]
Objective:                [one sentence]
Assigned WBS ID(s):       [e.g. ATLAS-P1-AUTH-01]
Required Documentation:   [exact doc list, from .ai/INDEX.md — nothing broader]
Required Project Files:   [exact file/module list — nothing broader]
Allowed Files to Modify:  [explicit list or glob]
Forbidden Files:          [explicit list — usually "everything else"]
Expected Deliverables:    [files created/modified, tests, docs updated]
Exit Criteria:            [Definition of Done for this task, from MASTER_RULES.md]
Maximum Scope:            [what this conversation must NOT attempt, even if tempting]
Estimated Context Usage:  [S / M / L / XL — see .ai/INDEX.md for the scale]
```

---

## 4. Worked Examples

### Example A
```
Conversation Name:        AUTH-001 — Email/Password Registration Flow
Objective:                Implement registration UI + backend endpoint per PRD Flow 03.
Assigned WBS ID(s):       ATLAS-P1-AUTH-01, ATLAS-P1-AUTH-04 (backend model+endpoint)
Required Documentation:   MASTER_RULES.md, PROJECT_STATE.md, TASK_BOARD.md, INDEX.md,
                           WORK_BREAKDOWN_STRUCTURE.md §Phase1-AUTH, PRD.md §6/§13.13,
                           APPLICATION_LAYOUT_GUIDE.md §Authentication Layout,
                           ACCESSIBILITY.md §Forms, DESIGN_TOKENS.md Part 6 (Input/Button
                           contracts), GUIDELINES.md §11 (security)
Required Project Files:   /apps/web/app/(auth)/register, /apps/api/app/services/auth
Allowed Files to Modify:  Files under the two paths above, plus new files they create
Forbidden Files:          Anything under /apps/web/app/(dashboard), any Design Bible doc,
                           any .ai/ file except PROJECT_STATE.md and TASK_BOARD.md at handoff
Expected Deliverables:    Registration form component, POST /auth/register endpoint,
                           password hashing, rate limiting, unit + component tests
Exit Criteria:             Per MASTER_RULES.md universal DoD, plus: registers a user in
                           <2 minutes per PRD §13.3, passes ACCESSIBILITY.md Forms checklist
Maximum Scope:             Do NOT implement OAuth (separate task), do NOT implement login
                           (separate task), do NOT touch session/token middleware
Estimated Context Usage:   M
```

### Example B
```
Conversation Name:        CHAT-001 — Streaming Chat Layout (Guest Mode)
Objective:                Build the AI Chat page layout and streaming message UI for guests.
Assigned WBS ID(s):       ATLAS-P1-CHAT-01, ATLAS-P1-CHAT-02
Required Documentation:   MASTER_RULES.md, PROJECT_STATE.md, INDEX.md,
                           WORK_BREAKDOWN_STRUCTURE.md §Phase1-CHAT,
                           APPLICATION_LAYOUT_GUIDE.md §AI Chat, AI_EXPERIENCE.md
                           §Communication Style/§Streaming, COMPONENT_INVENTORY.md
                           §AI Components, MOTION_SYSTEM.md §15 (AI Chat Motion)
Required Project Files:   /apps/web/app/chat, /apps/web/components/ai-chat
Allowed Files to Modify:  Files under the two paths above
Forbidden Files:          Backend orchestration code (separate, Phase 2), auth files
Expected Deliverables:    Chat layout, MessageBubble/StreamingBubble/TypingIndicator
                           components, guest session-memory (client-side only)
Exit Criteria:             Per MASTER_RULES.md universal DoD, plus reduced-motion and
                           screen-reader support per ACCESSIBILITY.md §AI Chat Accessibility
Maximum Scope:             No multi-agent logic — this is a single-model passthrough UI only
Estimated Context Usage:   M
```

These two conversations can run **in parallel** — `DEPENDENCY_GRAPH.md` §4 confirms guest-mode Chat does not depend on Authentication.

---

## 5. Handoff Protocol

At the end of every conversation, before stopping:

1. Update `.ai/PROJECT_STATE.md` (current task → done, next task identified).
2. Update `.ai/TASK_BOARD.md` (move the card, note blockers if any surfaced).
3. Update `.ai/WORK_BREAKDOWN_STRUCTURE.md` only if the task's own scope changed (rare).
4. List every file created, modified, and deleted, explicitly.
5. Produce an implementation summary and a handoff summary.
6. State the next recommended WBS task.
7. **Stop. Do not continue automatically. Wait for approval**, exactly as your Permanent Project Instructions require.

---

## 6. Escalation Rule — When a Conversation Should Stop and Ask

A conversation halts and asks you directly, rather than guessing, when it hits:

- A genuine conflict between two required documents (not already resolved in the Documentation Audit Report).
- A missing document or spec needed to complete the assigned task.
- Scope that doesn't fit in one conversation once work is underway (should have been caught at definition time, but sometimes only becomes clear mid-task).
- A required architecture or Design Bible change (never made unilaterally, per MASTER_RULES.md).

It does **not** halt for: minor implementation choices already governed by MASTER_RULES.md, or questions already answered by `.ai/INDEX.md`.

---

## 7. UI Component Governance Requirement *(PROPOSED)*

Any conversation whose Assigned WBS Task(s) create, modify, or consume a UI component must:

- Include `COMPONENT_OWNERSHIP_MATRIX.md` in that conversation's **Required Documentation** field (§3 template).
- Classify the requested component(s) as Foundation, Shared, or Feature — per `COMPONENT_OWNERSHIP_MATRIX.md` §2 — before implementation begins.
- Check `COMPONENT_OWNERSHIP_MATRIX.md` first: if the component already exists, reuse or extend it; never recreate it.
- Add `COMPONENT_OWNERSHIP_MATRIX.md` update to that conversation's **Expected Deliverables** whenever it creates a new Shared or Feature Component. Foundation Components are created only by `DESIGNSYS` conversations, which update the matrix as part of their own deliverables.

Does not apply to conversations scoped entirely to backend/non-UI work (e.g. `AUTH-02`'s password hashing) — consistent with `MASTER_RULES.md` §4 treating `COMPONENT_OWNERSHIP_MATRIX.md` as conditional reading, not universal.

---

**END OF DOCUMENT**

**LOCK STATUS:**
**IMMUTABLE — approved baseline, 2026-07-22, following Q1–Q4 sign-off. §7 is PROPOSED (2026-07-29), not yet part of the locked baseline.**
