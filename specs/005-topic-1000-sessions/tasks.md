# Tasks: 1000 Topic Words — Session Browser

**Input**: Design documents from `/specs/005-topic-1000-sessions/`

**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/components.md ✓, quickstart.md ✓

**Tests**: Not requested — manual viewport testing per quickstart.md.

**Organization**: Tasks grouped by user story. Leaf components (row/card) are built in Foundational so they are available to both US1 table/list containers and US3 SpeakButton additions.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks in the same phase)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)

---

## Phase 1: Setup

**Purpose**: Create the feature directory structure before any code is written.

- [X] T001 Create `src/features/vocabulary-1000/components/` and `src/features/vocabulary-1000/lib/` directories

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Data helpers and leaf display components that MUST exist before any container or page component can be built. All four tasks are independent — they touch different files.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T002 [P] Implement `groupBySession` in `src/features/vocabulary-1000/lib/group-by-session.ts` — pure function: `ReadonlyArray<TopicVocabEntry>` → `Map<number, TopicVocabEntry[]>`, sorted by `id` ascending within each bucket (preserves source-book order and keeps categories contiguous)
- [X] T003 [P] Implement `groupByCategory` + export `CategoryGroup` type in `src/features/vocabulary-1000/lib/group-by-category.ts` — pure function: `ReadonlyArray<TopicVocabEntry>` → `CategoryGroup[]`; single linear pass emitting a new group whenever `category` changes; first-appearance order preserved
- [X] T004 [P] Create `src/features/vocabulary-1000/components/TopicWordRow.tsx` — Client Component; props `{ entry: TopicVocabEntry }`; renders a `<tr>` with 5 cells: `stt` (raw value or `—`), `word` (bold), `phonetic` (or `—`), `partOfSpeech` (or `—`), `meaning`; dashed bottom border; no expand toggle; no SpeakButton yet (added in US3)
- [X] T005 [P] Create `src/features/vocabulary-1000/components/TopicWordCard.tsx` — Client Component; props `{ entry: TopicVocabEntry }`; renders a `<li>` with dashed border; stacked fields: `#stt` (or `—`), word (bold), phonetic (or `—`), partOfSpeech (or `—`), meaning (`break-words`); no expand toggle; no SpeakButton yet (added in US3)

**Checkpoint**: Helpers and leaf components ready — container components can now be built.

---

## Phase 3: User Story 1 — Browse Words by Session (Priority: P1) 🎯 MVP

**Goal**: A learner can open the page at `/vocabulary/1000`, pick any day from the dropdown, and immediately see that session's words.

**Independent Test**: Navigate to `/vocabulary/1000`; verify `[ Day 1 ▾ ]` trigger is visible; open dropdown and confirm 32 options; select `Day 3` and verify the word count updates and the list changes; refresh and confirm `Day 1` resets (no persistence).

- [X] T006 [P] [US1] Create `src/features/vocabulary-1000/components/TopicWordTable.tsx` — Client Component; props `{ groups: ReadonlyArray<CategoryGroup>; className?: string }`; renders a `<table>` with header row (5 cols: `STT`, `WORD`, `PHONETIC`, `POS`, `MEANING`); iterates groups and renders one `<TopicWordRow>` per word in each group (no category divider rows yet — added in US2); empty state: `[ NO WORDS FOUND ]` when all groups are empty; visible only at `lg` and above via `className` prop
- [X] T007 [P] [US1] Create `src/features/vocabulary-1000/components/TopicWordCardList.tsx` — Client Component; props `{ groups: ReadonlyArray<CategoryGroup>; className?: string }`; renders a `<ul>` of `<TopicWordCard>` items iterating all groups flat (no category headings yet — added in US2); empty state: `[ NO WORDS FOUND ]`; visible only below `lg` via `className` prop
- [X] T008 [US1] Create `src/features/vocabulary-1000/components/TopicSessionBrowser.tsx` — Client Component (`"use client"`); imports `1000-topic-words.json` cast to `TopicVocabEntry[]`; calls `groupBySession` at module scope inside `try/catch` (sets `loadError` on failure); `selectedSession` state (initial `sortedSessions[0] ?? 1`); derives `sessionOptions` (`useMemo`, `[]` deps) and `categoryGroups = groupByCategory(currentEntries)` (`useMemo`, deps `[selectedSession]`); renders `SESSION:` label + reused `<SessionDropdown>` (imported from `@/features/vocabulary-500/components/SessionDropdown`) + word count; renders `<TopicWordTable className="hidden lg:table">` and `<TopicWordCardList className="lg:hidden">`; renders `[ ERROR: DATA UNAVAILABLE ]` on `loadError`
- [X] T009 [US1] Replace `src/app/vocabulary/1000/page.tsx` — Server Component shell; same chrome as `/vocabulary/500`: fixed `theme.gif` background div, `<NavigationMenu links={HOME_NAV_LINKS} />` sidebar, `<main>` with breadcrumb `> ~/learn-english/vocabulary/1000`, `<h1>` "1000 TOPIC WORDS" (monospace, uppercase, tracking-widest), `<TopicSessionBrowser />`

**Checkpoint**: `/vocabulary/1000` is now a fully functional session browser — dropdown, session switching, all words visible in table (desktop) and cards (mobile), error fallback. US1 is independently testable.

---

## Phase 4: User Story 2 — Topic Category Context (Priority: P2)

**Goal**: Words within a session are visually divided by topic category, making the thematic grouping immediately apparent.

**Independent Test**: Select `Day 5`; verify three category dividers appear in order — `── ANIMAL - ĐỘNG VẬT ──`, `── COLOR - MÀU SẮC ──`, `── BODY PART - BỘ PHẬN CƠ THỂ ──` — each preceding its group of words. Select `Day 4`; verify a single divider `── ANIMAL - ĐỘNG VẬT ──` above all words.

- [X] T010 [US2] Add full-width category divider rows to `src/features/vocabulary-1000/components/TopicWordTable.tsx` — before each group's word rows, insert `<tr><td colSpan={5} className="...">── {group.category} ──</td></tr>` styled with accent color, dashed top border, monospace font; render the divider for every group (including single-group sessions)
- [X] T011 [P] [US2] Add category heading blocks to `src/features/vocabulary-1000/components/TopicWordCardList.tsx` — before each group's cards, render a full-width `<div>── {group.category} ──</div>` styled with accent color, dashed bottom border, monospace font

**Checkpoint**: Category context is visible in both desktop table and mobile card views. US2 is independently testable on top of the US1 foundation.

---

## Phase 5: User Story 3 — Word Details at a Glance (Priority: P3)

**Goal**: Each entry in the list includes a `SpeakButton` (Web Speech API) next to the English word — matching the parity behavior of `/vocabulary/500`.

**Independent Test**: On any session, click the `▶` button next to any English word; verify the browser pronounces the word. Verify `stt` values reset to 1 at each category boundary when reading the column.

- [X] T012 [US3] Add `<SpeakButton word={entry.word} />` next to the word cell in `src/features/vocabulary-1000/components/TopicWordRow.tsx` — import from `@/features/vocabulary-500/components/SpeakButton`; render inline with `flex items-center gap-2` wrapper around word + button
- [X] T013 [P] [US3] Add `<SpeakButton word={entry.word} />` next to the word field in `src/features/vocabulary-1000/components/TopicWordCard.tsx` — same import; render with `flex items-center gap-2` wrapper on the word line

**Checkpoint**: All three user stories are fully implemented. The page matches the 18 quickstart.md acceptance checks.

---

## Phase 6: Polish

**Purpose**: Lint, build validation, and quickstart walkthrough to confirm the shipped feature is clean.

- [X] T014 [P] Run `pnpm lint` and resolve any ESLint errors or warnings in new `vocabulary-1000` files
- [X] T015 Run `pnpm build` and confirm `/vocabulary/1000` pre-renders successfully; then walk through all 18 manual acceptance checks in `specs/005-topic-1000-sessions/quickstart.md` and mark them complete

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user stories; T002–T005 are all parallel with each other
- **US1 (Phase 3)**: Depends on Foundational — T006 + T007 run in parallel after T004/T005; T008 runs after T006 + T007; T009 runs after T008
- **US2 (Phase 4)**: Depends on US1 (Phase 3) — T010 + T011 run in parallel
- **US3 (Phase 5)**: Depends on US1 (Phase 3) — T012 + T013 run in parallel; US2 and US3 phases are independent of each other
- **Polish (Phase 6)**: Depends on US1 + US2 + US3 all complete

### User Story Dependencies

- **US1 (P1)**: Requires Foundational complete. Independently testable without US2/US3.
- **US2 (P2)**: Requires US1 complete (modifies T006/T007 outputs). Independently testable on top of US1.
- **US3 (P3)**: Requires US1 complete (modifies T004/T005 outputs). Independent from US2.

### Within Each Phase

- Foundational: all 4 tasks (T002–T005) are fully parallel
- US1: T006 ∥ T007 → T008 → T009
- US2: T010 ∥ T011
- US3: T012 ∥ T013

---

## Parallel Example: Foundational Phase

```text
# All 4 foundational tasks can run simultaneously:
Task T002: group-by-session.ts
Task T003: group-by-category.ts
Task T004: TopicWordRow.tsx
Task T005: TopicWordCard.tsx
```

## Parallel Example: US1 Phase

```text
# Start these two immediately after Foundational completes:
Task T006: TopicWordTable.tsx
Task T007: TopicWordCardList.tsx

# Then, once both complete:
Task T008: TopicSessionBrowser.tsx
Task T009: page.tsx (after T008)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Navigate to `/vocabulary/1000`, pick a day, see all 32 sessions, session switching works, table on desktop, cards on mobile
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → helpers and leaf components ready
2. Add US1 → session browser live at `/vocabulary/1000` → validate and demo
3. Add US2 → category dividers visible → validate
4. Add US3 → SpeakButton parity with 500 page → validate
5. Polish → lint + build clean

---

## Notes

- [P] tasks = different files, no blocking inter-dependencies
- `SessionDropdown` and `SpeakButton` are imported from `src/features/vocabulary-500/` — do NOT copy them; import as-is
- `ROUTE_VOCAB_1000` already exists in `src/utils/route-path.ts` — no new constant needed
- `TopicVocabEntry` type already exists in `src/types/topic-vocabulary.ts` — do NOT redefine
- `HOME_NAV_LINKS` import is already used by `/vocabulary/500/page.tsx` — reuse the same import pattern
- Category `stt` values reset to 1 per category — this is expected, not a bug (per spec Clarification)
- No `useExpandedRows` hook, no expand/collapse — the topic dataset has no example sentences
