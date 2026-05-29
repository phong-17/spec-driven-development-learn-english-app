# Implementation Plan: 1000 Topic Words — Session Browser

**Branch**: `005-topic-1000-sessions` | **Date**: 2026-05-29 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/005-topic-1000-sessions/spec.md`

## Summary

Replace the "Coming soon" placeholder at `/vocabulary/1000` with an interactive session browser for the 1000 topic-based English words, mirroring the shipped 500-words browser (`/vocabulary/500`) as closely as the different dataset allows. The page is a Server Component shell (background, shared `NavigationMenu`, breadcrumb + title) that mounts a `TopicSessionBrowser` Client Component which loads the static JSON dataset (`src/data/vocabulary/1000-topic-words.json`), groups entries by `session` (1..32), and renders:

1. A **custom ASCII-styled dropdown** (`[ Day 1 ▾ ]`) of all 32 sessions (default = Day 1) — reusing the existing `SessionDropdown`.
2. A **responsive word list** — 5-column dashed-bordered table on desktop (≥ lg), vertical card layout on mobile (< lg) — showing `stt`, word, phonetic, part of speech, Vietnamese meaning.
3. **Category section dividers** — within a session, words are grouped by their `category` field; each group is preceded by a full-width separator (`── CATEGORY ──`) spanning all columns (desktop) or a full-width block (mobile).

Key differences from the 500 browser: **no example sentences** in this dataset, so there is **no expand/collapse, no `[ + ]`/`[ - ]` toggle, and no `useExpandedRows` hook**. Instead the new dimension is **category grouping within each session**. Session selection is in-memory only (no URL param, no persistence). The page is fully keyboard-accessible via the reused dropdown.

## Technical Context

**Language/Version**: TypeScript 5 (strict), React 19.2, Next.js 16 App Router

**Primary Dependencies**: `next` 16, `react` 19.2, `tailwindcss` v4, `motion` v12 (dropdown open/close animation only)

**Storage**: None — reads bundled JSON via `import` (`src/data/vocabulary/1000-topic-words.json`)

**Testing**: Manual viewport testing (375 / 768 / 1024 / 1440), keyboard nav verification. No unit tests for this UI feature.

**Target Platform**: Web (modern evergreen browsers). The interactive area is a **Client Component** (`"use client"`) because dropdown/session state lives in the browser.

**Project Type**: Web frontend (single Next.js app)

**Performance Goals**: Session switch renders in < 100 ms (in-memory `Map` lookup over a pre-grouped 983-row dataset). FCP < 1.5 s on mid-tier mobile.

**Constraints**:
- No horizontal scroll at any viewport ≥ 375 px
- Monospace-only typography (uses existing `--font-mono` token)
- Sharp corners only, dashed borders, no shadows / gradients / glassmorphism
- Only `transition-colors` allowed as a CSS transition utility (per CLAUDE.md)
- Animations via `motion/react` only

**Scale/Scope**: 1 page (`/vocabulary/1000`) + ~5 new files. Dataset = 983 entries across 32 sessions (30–31 per session), spanning 27 topic categories (1–3 categories per session).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The project constitution at `.specify/memory/constitution.md` contains only template placeholders — no enforceable principles have been ratified. There are therefore no gates to evaluate.

**Result**: PASS (vacuously). Re-check after Phase 1 design — still PASS.

## Project Structure

### Documentation (this feature)

```text
specs/005-topic-1000-sessions/
├── plan.md                       # This file (/speckit-plan command output)
├── spec.md                       # Feature spec (/speckit-specify output)
├── research.md                   # Phase 0 output (this command)
├── data-model.md                 # Phase 1 output (this command) — UI data model
├── quickstart.md                 # Phase 1 output (this command)
├── contracts/
│   └── components.md             # Phase 1 output — component prop contracts
├── checklists/
│   └── requirements.md           # Spec quality checklist
└── tasks.md                      # Phase 2 output (/speckit-tasks — NOT created here)
```

### Source Code (repository root)

```text
src/
├── app/
│   └── vocabulary/
│       └── 1000/
│           └── page.tsx                          # REPLACED — Server Component shell (mirrors 500 page)
├── features/
│   └── vocabulary-1000/
│       ├── components/
│       │   ├── TopicSessionBrowser.tsx           # NEW — orchestrator (dropdown + grouped list + state)
│       │   ├── TopicWordTable.tsx                # NEW — desktop table (≥ lg) w/ category divider rows
│       │   ├── TopicWordCardList.tsx             # NEW — mobile card list (< lg) w/ category blocks
│       │   ├── TopicWordRow.tsx                  # NEW — single table row (no expand)
│       │   └── TopicWordCard.tsx                 # NEW — single card (no expand)
│       └── lib/
│           ├── group-by-session.ts               # NEW — TopicVocabEntry[] → Map<session, entries>
│           └── group-by-category.ts              # NEW — entries → CategoryGroup[] (first-appearance order)
├── data/
│   └── vocabulary/
│       └── 1000-topic-words.json                 # (existing — unchanged)
├── features/
│   ├── home/
│   │   └── components/
│   │       └── NavigationMenu.tsx                # (existing — REUSED as-is)
│   └── vocabulary-500/
│       └── components/
│           ├── SessionDropdown.tsx               # (existing — REUSED via import)
│           └── SpeakButton.tsx                   # (existing — REUSED via import)
└── types/
    └── topic-vocabulary.ts                       # (existing — REUSED, no edits) — TopicVocabEntry
```

**Structure Decision**: Single Next.js project, App Router. The route file (`src/app/vocabulary/1000/page.tsx`) is a thin Server Component shell that renders the page chrome (background, sidebar, breadcrumb, title) and mounts the `TopicSessionBrowser` Client Component. The interactive feature lives under `src/features/vocabulary-1000/`, mirroring the existing `src/features/vocabulary-500/` convention.

Two generic, presentational components from the 500 feature — `SessionDropdown` (already fully parameterized via `options`/`selected`/`onChange`) and `SpeakButton` — are **reused by import** rather than duplicated, to avoid ~200 lines of duplication. This introduces a `vocabulary-1000 → vocabulary-500` import edge; a future refactor could promote both to `src/components/` (shared presentational UI per CLAUDE.md), but that is out of scope here to avoid touching the shipped 500 feature.

## Complexity Tracking

No constitution violations — section omitted.
