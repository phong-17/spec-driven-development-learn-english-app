# Tasks: Ms. Huong Lesson Browser

**Input**: Design documents from `/specs/006-ms-huong-lessons/`

**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/components.md ✓, quickstart.md ✓

**Tests**: Not requested — manual viewport testing per quickstart.md.

**Organization**: Tasks are organized by user story. `page.tsx` is built incrementally: US1 creates it with the session list only, US2 inserts `CoursePartsOverview` above it, US3 appends `ChallengeList` below it. No stub components needed at any stage.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks in the same phase)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)

---

## Phase 1: Setup

**Purpose**: Create directory structure before any code is written.

- [X] T001 Create `src/features/lessons/components/` and `src/data/lessons/` directories

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Type definitions and the complete hand-authored dataset. Both tasks are independent files — they can run in parallel.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T002 [P] Create `src/types/lesson.ts` — export `CoursePart`, `LessonEntry`, `ChallengeWord`, `ChallengeEntry`, `AdvancedSection`, `LessonsData` interfaces exactly as defined in `specs/006-ms-huong-lessons/data-model.md` (TypeScript Types section)
- [X] T003 [P] Create `src/data/lessons/ms-huong-lessons.json` — hand-author the complete dataset from `specs/006-ms-huong-lessons/data-model.md`: 5 course parts, 16 lessons (each with `sessions: [dayA, dayB]` pair, Day 1–32 continuous), all 42 challenge words with IPA phonetics (Challenge 1: 10 words; Challenge 2: 8 words; Challenge 3: 24 words), and the advanced section object; validate counts match data-model.md invariants before saving

**Checkpoint**: Types and complete dataset ready — all component and page tasks can now be built.

---

## Phase 3: User Story 1 — Browse Sessions by Lesson (Priority: P1) 🎯 MVP

**Goal**: A learner opens `/lessons` and sees all 32 study sessions grouped into 16 lessons, each labeled with `Day N` chips and the lesson's IPA sound focus.

**Independent Test**: Navigate to `/lessons`; verify all 32 sessions are visible simultaneously (no dropdown); verify 16 lesson groups each showing `LESSON N`, title, sound focus, and two `[ Day N ]` chips; verify Lesson 1 = "Alphabets" (Day 1–2) and Lesson 16 = "/tʃ/ and /dʒ/ Sounds" (Day 31–32); verify no horizontal scroll at 375 px.

- [X] T004 [US1] Create `src/features/lessons/components/LessonSessionList.tsx` — Server Component; props `{ lessons: ReadonlyArray<LessonEntry> }`; renders 16 lesson groups; each group shows: `LESSON N` label (accent color, monospace), lesson `title` (bold), `soundFocus` (IPA, monospace, accent/muted), and two day chips `[ Day {sessions[0]} ]` / `[ Day {sessions[1]} ]` (dashed border, accent); responsive layout — no horizontal scroll at 375 px; import `LessonEntry` from `@/types/lesson`
- [X] T005 [US1] Replace `src/app/lessons/page.tsx` — Server Component; same chrome as `/vocabulary/1000/page.tsx` (fixed `theme.gif` background div, `<NavigationMenu links={HOME_NAV_LINKS} />` sidebar, breadcrumb `> ~/learn-english/lessons`, `<h1>` "MS. HUONG LESSONS" — monospace uppercase tracking-widest); imports `ms-huong-lessons.json` cast as `LessonsData` from `@/types/lesson`; renders `<LessonSessionList lessons={data.lessons} />` only at this stage — CoursePartsOverview and ChallengeList are added in US2/US3 respectively

**Checkpoint**: `/lessons` is live and functional — 32 sessions visible grouped by lesson. US1 is independently testable.

---

## Phase 4: User Story 2 — Course Structure Overview (Priority: P2)

**Goal**: The 5-part course structure of Ms. Huong's book is shown above the session list as contextual reference, with Part 1 flagged as the foundational pre-lesson section.

**Independent Test**: On `/lessons`, verify the 5 course parts appear above the session list; verify each part shows its Vietnamese and English names; verify Part 1 carries a visible note that it is the foundational pre-lesson section containing the 16 lessons below.

- [X] T006 [US2] Create `src/features/lessons/components/CoursePartsOverview.tsx` — Server Component; props `{ parts: ReadonlyArray<CoursePart> }`; renders a section block listing all 5 parts as rows: `[ PART N ]  <vi>  ──  <en>` (dashed bordered rows, accent for `PART N`); Part 1 row includes a sub-line "Foundational — includes the 16 lessons below"; import `CoursePart` from `@/types/lesson`
- [X] T007 [US2] Update `src/app/lessons/page.tsx` — add `import { CoursePartsOverview } from "@/features/lessons/components/CoursePartsOverview"`; insert `<CoursePartsOverview parts={data.courseParts} />` above `<LessonSessionList />`

**Checkpoint**: Course structure overview is visible above the session list. US2 is independently testable on top of US1.

---

## Phase 5: User Story 3 — Pre-Lesson Challenge Word Lists (Priority: P3)

**Goal**: The three Part 1 challenge exercises (42 words with IPA phonetics and a SpeakButton each) are shown below the session list, plus an acknowledgement of the Advanced Pronunciation section.

**Independent Test**: On `/lessons`, verify three challenge sections appear below the session list; verify Challenge 1 shows 10 number words (first: "One /wʌn/", last: "Ten /ten/") each with a `▶` SpeakButton; spot-check Challenge 3 entry "Vegetable /ˈvedʒ.tə.bəl/"; verify `[ ADVANCED PRONUNCIATION ]` note is visible after the challenges; verify clicking a SpeakButton pronounces the word aloud.

- [X] T008 [P] [US3] Create `src/features/lessons/components/ChallengeSection.tsx` — Server Component; props `{ challenge: ChallengeEntry }`; renders a challenge heading `── CHALLENGE {n}: {titleVi} ({titleEn}) ──` (accent, dashed border, uppercase); then one row per word: ordinal number (muted), word (bold), IPA phonetic (monospace, muted), and `<SpeakButton word={word} />` (imported from `@/features/vocabulary-500/components/SpeakButton`); no horizontal scroll at 375 px; imports from `@/types/lesson`
- [X] T009 [US3] Create `src/features/lessons/components/ChallengeList.tsx` — Server Component; props `{ challenges: ReadonlyArray<ChallengeEntry>; advanced: AdvancedSection }`; renders a section heading; maps each challenge to `<ChallengeSection challenge={c} />`; after the three challenges renders the Advanced Pronunciation acknowledgement: `[ ADVANCED PRONUNCIATION ]` label (accent, dashed border), `advanced.titleVi` description, `advanced.note`, page range `pp. {advanced.pageRange}`; imports from `@/types/lesson` and `./ChallengeSection`
- [X] T010 [US3] Update `src/app/lessons/page.tsx` — add `import { ChallengeList } from "@/features/lessons/components/ChallengeList"`; append `<ChallengeList challenges={data.challenges} advanced={data.advanced} />` after `<LessonSessionList />`

**Checkpoint**: All three user stories fully implemented. The page matches all 21 quickstart.md acceptance checks.

---

## Phase 6: Polish

**Purpose**: Lint, build validation, and full quickstart walkthrough.

- [X] T011 [P] Run `pnpm lint` and resolve any ESLint errors or warnings in new `src/features/lessons/` and `src/types/lesson.ts` files
- [X] T012 Run `pnpm build` and confirm `/lessons` prerenders as static content (`○`); then walk through all 21 manual acceptance checks in `specs/006-ms-huong-lessons/quickstart.md` and mark each complete

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user stories; T002 ∥ T003 are parallel with each other
- **US1 (Phase 3)**: Depends on Foundational — T004 runs after T002+T003; T005 runs after T004 (sequential)
- **US2 (Phase 4)**: Depends on US1 — T006 runs after T002 (can overlap with T004 since different file); T007 runs after T005+T006
- **US3 (Phase 5)**: Depends on US1 — T008 runs after T002 (can overlap with T006/T007 since different file); T009 after T008; T010 after T009+T005
- **Polish (Phase 6)**: Depends on US1 + US2 + US3 all complete

### User Story Dependencies

- **US1 (P1)**: Requires Foundational complete. Independently testable at `/lessons` without US2/US3.
- **US2 (P2)**: Requires US1 complete (edits page.tsx). Independently testable on top of US1.
- **US3 (P3)**: Requires US1 complete (edits page.tsx). Independent from US2 at the component level (ChallengeSection/ChallengeList touch different files from CoursePartsOverview), but sequenced after US2 for clean incremental delivery.

### Within Each Phase

- Foundational: T002 ∥ T003
- US1: T004 → T005
- US2: T006 → T007
- US3: T008 → T009 → T010
- Polish: T011 [P] → T012

---

## Parallel Opportunity: Foundational Phase

```text
# Run simultaneously (different files, no cross-dependencies):
T002: src/types/lesson.ts
T003: src/data/lessons/ms-huong-lessons.json
```

## Parallel Opportunity: US2 + US3 Component Creation

```text
# Once US1 is complete, T006 and T008 can start simultaneously:
T006: CoursePartsOverview.tsx    [US2 component]
T008: ChallengeSection.tsx       [US3 component — P marker]

# Then, once each component exists:
T007: update page.tsx for US2   (after T006 + T005)
T009: ChallengeList.tsx          (after T008)
T010: update page.tsx for US3   (after T009 + T005)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1 (T004, T005)
4. **STOP and VALIDATE**: Navigate to `/lessons`; verify 32 sessions grouped by 16 lessons; Day 1–32 chips visible; Lesson 1 = "Alphabets"; Lesson 16 = "/tʃ/ and /dʒ/ Sounds"
5. Demo/deploy if ready

### Incremental Delivery

1. Setup + Foundational → types + dataset ready
2. US1 (T004–T005) → `/lessons` shows session list → validate and demo
3. US2 (T006–T007) → course structure overview visible above list → validate
4. US3 (T008–T010) → challenge word lists + SpeakButton visible below list → validate
5. Polish (T011–T012) → lint + build clean → run all 21 quickstart checks

---

## Notes

- [P] tasks = different files, no blocking inter-dependencies
- T005 REPLACES `src/app/lessons/page.tsx` entirely (currently just a "Coming soon" stub) — write from scratch
- T007 and T010 EDIT the existing page.tsx file — add an import line and one JSX element each
- `SpeakButton` is imported from `@/features/vocabulary-500/components/SpeakButton` — do NOT copy it
- `NavigationMenu` + `HOME_NAV_LINKS` import pattern is identical to `/vocabulary/500` and `/vocabulary/1000` pages
- Cast JSON data: `const data = lessonsJson as LessonsData` where `LessonsData` is from `@/types/lesson`
- No `SessionDropdown`, no `useState`, no `"use client"` orchestrator — all Server Components except the existing `SpeakButton` island
- `ROUTE_LESSONS` already exists in `src/utils/route-path.ts` — no new route constant needed
- All 42 challenge words + IPA are in `specs/006-ms-huong-lessons/data-model.md` — copy from there into T003
