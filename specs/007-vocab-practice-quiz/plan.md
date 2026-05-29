# Implementation Plan: Vocabulary Practice Quiz

**Branch**: `007-vocab-practice-quiz` | **Date**: 2026-05-29 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/007-vocab-practice-quiz/spec.md`

## Summary

Add a self-contained practice mode for the existing vocabulary sessions. On both `/vocabulary/500` and `/vocabulary/1000`, a `[ PRACTICE ]` button sits on the same row as the session dropdown and links to a new route `/practice/{source}/{session}` (e.g. `/practice/500/5`). That route is a Server Component shell that loads the selected session's words from the static JSON, normalises them into a common `PracticeEntry` shape, and mounts a client `PracticeBrowser`.

`PracticeBrowser` presents three exercise tabs over the session's words:

1. **Type the Word** (Meaning → Word, P1 core) — a terminal/ASCII text input; Vietnamese meaning shown, learner types the English word, submits with **Enter**, evaluation is case-insensitive + trimmed, then **manual advance** (Enter / `[ NEXT → ]`).
2. **Choose the Meaning** (Word → Meaning, P2) — English word + 4 Vietnamese options (3 distractors drawn from the same session), click to answer, manual advance.
3. **Flash Cards** (P3) — meaning on the front, flip to reveal word + phonetic + example, self-score `[ KNOWN ]` / `[ UNKNOWN ]`, unknown cards repeat in a second pass.

Each exercise ends in a summary screen (score + elapsed time). No persistence — refresh resets. The whole feature is static-prerenderable (64 pages = 2 sources × 32 sessions via `generateStaticParams`).

## Technical Context

**Language/Version**: TypeScript 5 (strict), React 19.2, Next.js 16 App Router

**Primary Dependencies**: `next` 16, `react` 19.2, `tailwindcss` v4, `motion` v12 (flash-card flip + feedback enter/exit; CSS transitions limited to `transition-colors`).

**Storage**: None — reads bundled JSON (`src/data/vocabulary/500-common-words.json`, `…/1000-topic-words.json`) at build time, server-side only. Practice state is in-memory in the client during a session.

**Testing**: Manual viewport + interaction testing per quickstart.md (375/768/1024/1440; keyboard-only flow for Type-the-Word). No unit tests for this UI feature.

**Target Platform**: Web (modern evergreen browsers). The practice page shell is a Server Component; the interactive browser + exercises are `"use client"`.

**Project Type**: Web frontend (single Next.js app)

**Performance Goals**: Client-side navigation from button → practice page < 500 ms (SC-002). Answer-evaluation feedback < 100 ms (SC-004). Fully static prerender (`○`) for all 64 session pages.

**Constraints**:
- No horizontal scroll at any viewport ≥ 375 px (SC-005)
- Monospace-only typography; ASCII/terminal aesthetic (dashed borders, sharp corners, no shadows/gradients/glassmorphism)
- Only `transition-colors` as a CSS transition utility; all other motion via `motion/react`
- Terminal input uses the native caret (`caret-color` = accent) for the blink — no custom transition needed
- No login, no persistence (FR-011, FR-012)

**Scale/Scope**: 1 dynamic route (64 prerendered pages) + ~10 new files under `src/features/practice/` + 1 types file + 1 route helper + small edits to the two existing session-browser components (add the button).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The project constitution at `.specify/memory/constitution.md` contains only template placeholders — no enforceable principles have been ratified. There are therefore no gates to evaluate.

**Result**: PASS (vacuously). Re-check after Phase 1 design — still PASS.

## Project Structure

### Documentation (this feature)

```text
specs/007-vocab-practice-quiz/
├── plan.md                       # This file (/speckit-plan output)
├── spec.md                       # Feature spec (/speckit-specify output)
├── research.md                   # Phase 0 output (this command)
├── data-model.md                 # Phase 1 output (this command)
├── quickstart.md                 # Phase 1 output (this command)
├── contracts/
│   └── components.md             # Phase 1 output — component + route contracts
├── checklists/
│   └── requirements.md           # Spec quality checklist
└── tasks.md                      # Phase 2 output (/speckit-tasks — NOT created here)
```

### Source Code (repository root)

```text
src/
├── app/
│   └── practice/
│       └── [source]/
│           └── [session]/
│               └── page.tsx                    # NEW — Server shell + generateStaticParams; loads session, renders PracticeBrowser
├── features/
│   └── practice/
│       ├── components/
│       │   ├── PracticeBrowser.tsx             # NEW — client; tab bar + active exercise + shared chrome
│       │   ├── PracticeButton.tsx              # NEW — client; [ PRACTICE ] Link, props { source, session }
│       │   ├── TypeTheWord.tsx                 # NEW — client; Meaning → Word exercise (terminal input)
│       │   ├── ChooseTheMeaning.tsx            # NEW — client; Word → Meaning, 4 options
│       │   ├── FlashCards.tsx                  # NEW — client; flip + self-score + 2nd pass
│       │   ├── TerminalInput.tsx               # NEW — client; ASCII-styled `> ___` input
│       │   └── QuizSummary.tsx                 # NEW — shared end-of-exercise summary
│       ├── hooks/
│       │   └── useQuizProgress.ts              # NEW — index/score/phase state + advance/restart
│       └── lib/
│           ├── load-practice-session.ts        # NEW — (source, session) → PracticeEntry[]; server-side
│           ├── shuffle.ts                       # NEW — Fisher–Yates (pure)
│           └── build-choices.ts                 # NEW — distractor picker for Choose-the-Meaning
├── types/
│   └── practice.ts                             # NEW — PracticeSource, PracticeEntry, exercise enums
├── utils/
│   └── route-path.ts                           # EDIT — add routePractice(source, session)
└── features/
    ├── vocabulary-500/components/
    │   ├── VocabularySessionBrowser.tsx        # EDIT — add <PracticeButton source="500" .../> to SESSION row
    │   └── SpeakButton.tsx                      # (reused via import in exercises/flash cards)
    └── vocabulary-1000/components/
        └── TopicSessionBrowser.tsx             # EDIT — add <PracticeButton source="1000" .../> to SESSION row
```

**Structure Decision**: Single Next.js project, App Router. A new dynamic route `/practice/[source]/[session]` keeps practice decoupled from the two vocabulary feature modules and makes the page bookmarkable/shareable (FR-002, FR-011). The route file is a thin Server Component that does all JSON loading + normalisation server-side (the raw datasets never reach the client bundle) and passes a `PracticeEntry[]` to the client `PracticeBrowser`. Existing `group-by-session` helpers are reused for grouping; `SpeakButton` is reused by import. The two session browsers get a one-line addition (the `PracticeButton`) on their existing SESSION row.

## Complexity Tracking

No constitution violations — section omitted.
