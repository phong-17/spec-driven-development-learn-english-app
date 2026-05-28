# Implementation Plan: 500 Common Words — Session Browser

**Branch**: `004-vocab-500-sessions` | **Date**: 2026-05-28 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-vocab-500-sessions/spec.md`

## Summary

Replace the placeholder at `/vocabulary/500` with an interactive session browser for the 500 most common English words. Layout reuses the home page chrome (shared `NavigationMenu` sidebar, ASCII/terminal styling). The page is a Client Component that loads the static JSON dataset (`src/data/vocabulary/500-common-words.json`), groups entries by `session` (1..32), and renders:

1. A **custom ASCII-styled dropdown** (`[ Day 1 ▾ ]`) of all 32 sessions (default = Day 1).
2. A **responsive word list** — full 5-column dashed-bordered table on desktop (≥ lg), vertical card layout on mobile (< lg) — showing rank, word, phonetic, Vietnamese part-of-speech, Vietnamese meaning.
3. A **dedicated `[ + ]` / `[ - ]` toggle** on each entry that expands an inline section revealing the English example and its Vietnamese translation. Switching sessions collapses all rows.

No data fetching, no state persistence, no search/filter/sort. The page is fully keyboard-accessible.

## Technical Context

**Language/Version**: TypeScript 5 (strict), React 19.2, Next.js 16 App Router

**Primary Dependencies**: `next` 16, `react` 19.2, `tailwindcss` v4, `motion` v12 (dropdown open/close + row expand animations)

**Storage**: None — reads bundled JSON via `import` (`src/data/vocabulary/500-common-words.json`)

**Testing**: Manual viewport testing (375 / 768 / 1024 / 1440), keyboard nav verification. No unit tests for this UI feature.

**Target Platform**: Web (modern evergreen browsers). The page is a **Client Component** (`"use client"`) because dropdown state and per-row expand state must live in the browser.

**Project Type**: Web frontend (single Next.js app)

**Performance Goals**: Session switch renders in < 100 ms (in-memory filter of 500-row array). FCP < 1.5 s on mid-tier mobile.

**Constraints**:
- No horizontal scroll at any viewport ≥ 375 px
- Monospace-only typography (uses existing `--font-mono` token)
- Sharp corners only, dashed borders, no shadows / gradients / glassmorphism
- Only `transition-colors` allowed as a CSS transition utility (per CLAUDE.md)
- Animations via `motion/react` only

**Scale/Scope**: 1 page (`/vocabulary/500`) + ~4 new components. Dataset = ~455 entries across 32 sessions (~14–15 per session).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The project constitution at `.specify/memory/constitution.md` contains only template placeholders — no enforceable principles have been ratified. There are therefore no gates to evaluate.

**Result**: PASS (vacuously). Re-check after Phase 1 design — still PASS.

## Project Structure

### Documentation (this feature)

```text
specs/004-vocab-500-sessions/
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
│       └── 500/
│           └── page.tsx                          # REPLACED — Client wrapper for the browser
├── features/
│   └── vocabulary-500/
│       ├── components/
│       │   ├── SessionDropdown.tsx               # NEW — custom ASCII dropdown ([ Day N ▾ ])
│       │   ├── WordTable.tsx                     # NEW — desktop table (≥ lg)
│       │   ├── WordCardList.tsx                  # NEW — mobile card list (< lg)
│       │   ├── WordRow.tsx                       # NEW — single table row + expandable example
│       │   ├── WordCard.tsx                      # NEW — single card + expandable example
│       │   └── VocabularySessionBrowser.tsx      # NEW — orchestrator (dropdown + list + state)
│       ├── hooks/
│       │   └── useExpandedRows.ts                # NEW — Set<id> state with clear-on-session-change
│       └── lib/
│           └── group-by-session.ts               # NEW — pure helper: VocabularyEntry[] → Map<session, entries>
├── data/
│   └── vocabulary/
│       └── 500-common-words.json                 # (existing — unchanged)
├── features/
│   └── home/
│       └── components/
│           └── NavigationMenu.tsx                # (existing — REUSED as-is)
└── types/
    └── vocabulary.ts                             # (existing — REUSED, no edits)
```

**Structure Decision**: Single Next.js project, App Router. The page itself (`src/app/vocabulary/500/page.tsx`) is a thin Server Component shell that renders the page chrome (background, sidebar) and mounts the `VocabularySessionBrowser` Client Component. The interactive feature lives under `src/features/vocabulary-500/`, mirroring the existing `src/features/home/` convention. The `NavigationMenu` from the home feature is imported and reused — links remain identical to the home page sidebar.

## Complexity Tracking

No constitution violations — section omitted.
