# Implementation Plan: Home Page

**Branch**: `003-home-page` | **Date**: 2026-05-28 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-home-page/spec.md`

## Summary

Build the application's home page at `/`, replacing the default Next.js starter page. The page presents an ASCII/terminal-aesthetic layout with four stacked sections (Hero, Lessons, 500 Most Common Words, 1000 Topic Vocabulary), each containing only short prominent descriptive text. A top navigation bar links to three dedicated routes (`/lessons`, `/vocabulary/500`, `/vocabulary/1000`) — placeholder pages will be added so links resolve cleanly. The layout is fully responsive from 320px to 1920px and respects the project's monospace / box-drawing / flat design tokens already defined in `globals.css`.

## Technical Context

**Language/Version**: TypeScript 5 (strict), React 19.2, Next.js 16 App Router

**Primary Dependencies**: `next` 16, `react` 19.2, `tailwindcss` v4, `motion` v12 (typewriter / scan-line reveals if used)

**Storage**: None — all section copy is static, hard-coded in the component module

**Testing**: Manual viewport testing in browser (320 / 375 / 768 / 1024 / 1440 / 1920). No unit tests for this feature — UI-only static page

**Target Platform**: Web (modern evergreen browsers); rendered as a Next.js Server Component

**Project Type**: Web frontend (single Next.js app)

**Performance Goals**: First Contentful Paint < 1.5 s on mid-tier mobile; no layout shift after initial paint (CLS ≈ 0)

**Constraints**:
- No horizontal scrollbar at any viewport ≥ 320px
- Monospace-only typography (uses existing `--font-mono` token)
- Sharp corners only, 1px borders, no shadows / gradients / glassmorphism
- Dark mode is the default (already wired via `prefers-color-scheme` in `globals.css`)

**Scale/Scope**: Single page (`/`) + 3 placeholder pages (`/lessons`, `/vocabulary/500`, `/vocabulary/1000`); ~4 React components

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The project constitution at `.specify/memory/constitution.md` contains only template placeholders — no enforceable principles have been ratified. There are therefore no gates to evaluate.

**Result**: PASS (vacuously). Revisit after Phase 1 design — still PASS.

## Project Structure

### Documentation (this feature)

```text
specs/003-home-page/
├── plan.md              # This file (/speckit-plan command output)
├── spec.md              # Feature spec (/speckit-specify output)
├── research.md          # Phase 0 output (this command)
├── data-model.md        # Phase 1 output (this command) — UI content model
├── quickstart.md        # Phase 1 output (this command)
├── contracts/
│   └── components.md    # Phase 1 output — component prop contracts
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (/speckit-tasks — NOT created here)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── page.tsx                       # REPLACED — root home page (/)
│   ├── layout.tsx                     # untouched
│   ├── globals.css                    # untouched
│   ├── lessons/
│   │   └── page.tsx                   # NEW — placeholder route
│   └── vocabulary/
│       ├── 500/
│       │   └── page.tsx               # NEW — placeholder route
│       └── 1000/
│           └── page.tsx               # NEW — placeholder route
├── features/
│   └── home/
│       ├── components/
│       │   ├── NavigationMenu.tsx     # NEW — top nav with 3 links
│       │   ├── HeroSection.tsx        # NEW — first section, ASCII banner
│       │   └── ContentSection.tsx     # NEW — reusable text section
│       └── content.ts                 # NEW — static section copy
├── components/                        # (existing — not touched)
├── utils/
│   └── route-path.ts                  # EDITED — add 3 route constants
└── types/                             # (existing — not touched)

public/
└── images/
    └── follow-theme.jpeg              # (already present — design reference only, not rendered)
```

**Structure Decision**: Single Next.js project, App Router. The home page itself is a Server Component that composes presentational components colocated under `src/features/home/`. Three placeholder pages are added under `src/app/lessons` and `src/app/vocabulary/{500,1000}` so navigation links resolve cleanly. The reference image (`follow-theme.jpeg`) is a design guide for the developer — it is NOT rendered into the page (the spec only describes it as a visual guide).

## Complexity Tracking

No constitution violations — section omitted.
