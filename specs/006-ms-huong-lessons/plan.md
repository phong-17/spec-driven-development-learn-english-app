# Implementation Plan: Ms. Huong Lesson Browser

**Branch**: `006-ms-huong-lessons` | **Date**: 2026-05-29 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/006-ms-huong-lessons/spec.md`

## Summary

Replace the "Coming soon" placeholder at `/lessons` with a static, read-only reference page for Ms. Huong's English-pronunciation course. The page is a Server Component shell (background, shared `NavigationMenu`, breadcrumb + title) that renders three stacked sections, all driven by a single hand-authored JSON dataset (`src/data/lessons/ms-huong-lessons.json`):

1. **Course structure overview** — the 5-part book structure (Vietnamese + English names), with Part 1 flagged as foundational pre-lesson content.
2. **Lesson + session list** — all 16 lessons, each shown with its title, sound focus (IPA), and its two study sessions labeled `Day N` (Day 1–32). All 32 sessions are visible simultaneously, grouped by lesson — **no dropdown selector**.
3. **Pre-lesson challenge word lists** — the three Part 1 challenges (10 + 8 + 24 = 42 words), each word shown with its IPA phonetic and a reused `SpeakButton`.

A short note acknowledges the supplementary "Advanced Pronunciation" section (after Lesson 16) so no source-book section is silently dropped.

Key differences from the vocabulary browsers (`/vocabulary/500`, `/vocabulary/1000`): **no session dropdown, no per-session state, no interactive container** — the entire page is static content. The only client-side behavior is the `SpeakButton` (Web Speech API), reused by import. Because the source lesson pages are image-based, only lesson titles + sound focuses (metadata) and the 42 challenge words are surfaced; no in-lesson drills are extractable and none are invented.

## Technical Context

**Language/Version**: TypeScript 5 (strict), React 19.2, Next.js 16 App Router

**Primary Dependencies**: `next` 16, `react` 19.2, `tailwindcss` v4. No `motion` needed (no animated/interactive elements beyond the existing `SpeakButton`).

**Storage**: None — reads a bundled, hand-authored JSON via `import` (`src/data/lessons/ms-huong-lessons.json`). No parse script (per spec Clarification — source PDF is image-based and the data is fixed and small).

**Testing**: Manual viewport testing (375 / 768 / 1024 / 1440) + IPA glyph rendering check + SpeakButton click. No unit tests for this static UI feature.

**Target Platform**: Web (modern evergreen browsers). The page is predominantly Server Components; `SpeakButton` is the only `"use client"` island.

**Project Type**: Web frontend (single Next.js app)

**Performance Goals**: Fully static prerender (`○`) — no client data fetching, no session state. FCP < 1.5 s on mid-tier mobile.

**Constraints**:
- No horizontal scroll at any viewport ≥ 375 px
- Monospace-only typography (existing `--font-mono` token); IPA glyphs must render (VT323 + system fallback)
- Sharp corners only, dashed borders, no shadows / gradients / glassmorphism
- Only `transition-colors` allowed as a CSS transition utility (per CLAUDE.md)

**Scale/Scope**: 1 page (`/lessons`) + ~5 new component files + 1 JSON data file + 1 types file. Dataset = 5 course parts, 16 lessons, 32 sessions (derived 2-per-lesson), 42 challenge words, 1 advanced-section note.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The project constitution at `.specify/memory/constitution.md` contains only template placeholders — no enforceable principles have been ratified. There are therefore no gates to evaluate.

**Result**: PASS (vacuously). Re-check after Phase 1 design — still PASS.

## Project Structure

### Documentation (this feature)

```text
specs/006-ms-huong-lessons/
├── plan.md                       # This file (/speckit-plan command output)
├── spec.md                       # Feature spec (/speckit-specify output)
├── research.md                   # Phase 0 output (this command)
├── data-model.md                 # Phase 1 output (this command) — data shapes + full content
├── quickstart.md                 # Phase 1 output (this command) — manual acceptance checks
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
│   └── lessons/
│       └── page.tsx                          # REPLACED — Server Component shell (mirrors vocab page chrome)
├── features/
│   └── lessons/
│       └── components/
│           ├── CoursePartsOverview.tsx       # NEW — 5-part book structure (Server Component)
│           ├── LessonSessionList.tsx         # NEW — 16 lessons × 2 Day-sessions (Server Component)
│           ├── ChallengeSection.tsx          # NEW — one challenge block (word + IPA + SpeakButton)
│           └── ChallengeList.tsx             # NEW — renders all 3 ChallengeSections + advanced note
├── data/
│   └── lessons/
│       └── ms-huong-lessons.json             # NEW — hand-authored dataset (single source of truth)
├── types/
│   └── lesson.ts                             # NEW — CoursePart, LessonEntry, ChallengeEntry, etc.
├── features/
│   ├── home/
│   │   └── components/
│   │       └── NavigationMenu.tsx            # (existing — REUSED as-is)
│   └── vocabulary-500/
│       └── components/
│           └── SpeakButton.tsx               # (existing — REUSED via import)
└── utils/
    └── route-path.ts                         # (existing — ROUTE_LESSONS already defined)
```

**Structure Decision**: Single Next.js project, App Router. The route file (`src/app/lessons/page.tsx`) is a Server Component shell that renders the page chrome (background, sidebar, breadcrumb, title) and composes three presentational sections from `src/features/lessons/`. Unlike the vocabulary features, there is **no client orchestrator component** — the page has no in-memory state (no dropdown, no session switching), so everything is a Server Component except the `SpeakButton` client island reused from `vocabulary-500`.

`SpeakButton` is reused by import (introducing a `lessons → vocabulary-500` import edge, consistent with the existing `vocabulary-1000 → vocabulary-500` edge) rather than duplicated. The `SessionDropdown` is **not** reused — there is no dropdown in this feature.

## Complexity Tracking

No constitution violations — section omitted.
