# Tasks: 500 Common Words — Session Browser

**Input**: Design documents from `/specs/004-vocab-500-sessions/`

**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/components.md ✓, quickstart.md ✓

**Tests**: Not requested — manual acceptance checks in `quickstart.md` are the validation method.

**Organization**: Tasks grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on each other within the same phase)
- **[Story]**: Which user story this task belongs to (US1/US2/US3)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create directory skeleton so all subsequent tasks have valid paths.

- [X] T001 Create feature directory structure `src/features/vocabulary-500/components/`, `src/features/vocabulary-500/hooks/`, `src/features/vocabulary-500/lib/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core helpers and page shell that ALL user story phases depend on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T002 [P] Implement `groupBySession` pure helper in `src/features/vocabulary-500/lib/group-by-session.ts` — signature: `(entries: ReadonlyArray<VocabularyEntry>) => Map<number, VocabularyEntry[]>`; sort each group by `frequency` ascending (nulls last), tiebreak by `id` ascending; input not mutated
- [X] T003 [P] Implement `useExpandedRows` hook in `src/features/vocabulary-500/hooks/useExpandedRows.ts` — internal state `Set<number>`; resets set via `useEffect` when `resetKey` changes; exposes `{ isExpanded(id), toggle(id), clear() }` per contract C-007
- [X] T004 Create page shell `src/app/vocabulary/500/page.tsx` as a Server Component — reuse `NavigationMenu` with `HOME_NAV_LINKS`, render the same full-page background tile (`/images/theme.gif` fixed, `opacity-19`), flex layout matching home page, mount a `<main>` placeholder with breadcrumb `> ~/learn-english/vocabulary/500` and `<h1>500 MOST COMMON WORDS</h1>`

**Checkpoint**: `groupBySession`, `useExpandedRows`, and page shell exist — user story implementation can now begin.

---

## Phase 3: User Story 1 — Browse Words by Session (Priority: P1) 🎯 MVP

**Goal**: A learner can open `/vocabulary/500`, see "Day 1" pre-selected, switch sessions from a custom ASCII dropdown, and the word table updates immediately with that session's words (desktop only at this stage).

**Independent Test**: Navigate to `/vocabulary/500`, open `[ Day 1 ▾ ]`, pick "Day 3", verify the table shows session 3's words sorted by frequency rank, and the page does not fully reload.

### Implementation for User Story 1

- [X] T005 [P] [US1] Implement `SessionDropdown` in `src/features/vocabulary-500/components/SessionDropdown.tsx` — props: `options`, `selected`, `onChange` per contract C-002; trigger `<button>` renders `[ Day N ▾ ]` with dashed border; dropdown list is `<ul role="listbox">` with `<li role="option">` items; `AnimatePresence` + `motion.div` for open/close (`initial={{ opacity:0, y:-4 }}`); keyboard: ArrowDown/Up moves focus, Enter selects, Esc closes; outside-click via `useEffect` document listener closes it; calls `onChange(session)` on selection and closes
- [X] T006 [P] [US1] Implement `WordRow` (no expand yet) in `src/features/vocabulary-500/components/WordRow.tsx` — props: `entry`, `expanded: false` stub, `onToggle` stub per contract C-004; renders `<tr>` with 6 cells: rank (`frequency ?? "—"`), word, phonetic, `viPartOfSpeech`, `meaning`, and a `[ + ]` button placeholder (disabled/non-functional in this task); null fields render `—`
- [X] T007 [P] [US1] Implement `WordTable` in `src/features/vocabulary-500/components/WordTable.tsx` — props: `entries`, `isExpanded`, `onToggle` per contract C-003; renders `<table>` with dashed-border header row (`#`, `WORD`, `PHONETIC`, `POS (VI)`, `MEANING`, `EX.`); header bottom border in accent; maps `entries` to `<WordRow>` keyed by `entry.id`; if `entries.length === 0` renders single row `[ NO WORDS FOUND ]`
- [X] T008 [US1] Implement `VocabularySessionBrowser` in `src/features/vocabulary-500/components/VocabularySessionBrowser.tsx` — `"use client"`; import `500-common-words.json` and call `groupBySession` at module scope; `useState<number>(1)` for `selectedSession`; `useState<boolean>(false)` for `isDropdownOpen`; derive `sessionOptions` and `currentEntries`; render breadcrumb, `<h1>`, `<SessionDropdown>`, and `<WordTable className="hidden lg:table">` (table hidden below lg — card list added in US2); clear expand state stub when session changes
- [X] T009 [US1] Replace placeholder `<main>` in `src/app/vocabulary/500/page.tsx` with `import { VocabularySessionBrowser } from "@/features/vocabulary-500/components/VocabularySessionBrowser"` and render `<VocabularySessionBrowser />` inside `<main>`

**Checkpoint**: `/vocabulary/500` renders a working session browser on desktop — dropdown switches sessions, table shows sorted words. User Story 1 is independently testable.

---

## Phase 4: User Story 2 — Read Word Details at a Glance (Priority: P2)

**Goal**: All 5 word fields (rank, word, phonetic, Vietnamese POS, Vietnamese meaning) are visible without interaction on both mobile (card layout) and desktop (table). Long meanings wrap; no horizontal scroll at 375 px.

**Independent Test**: Resize to 375 px — cards appear with all 5 fields stacked; no horizontal scrollbar. Resize to 1024 px — table appears with 5 columns; all fields visible.

### Implementation for User Story 2

- [X] T010 [P] [US2] Implement `WordCard` in `src/features/vocabulary-500/components/WordCard.tsx` — props: `entry`, `expanded` stub, `onToggle` stub per contract C-006; renders `<li>` with dashed border; top row: rank left, `[ + ]` placeholder right; stacked body lines: word (accent color), phonetic, `viPartOfSpeech`, `meaning`; text wraps naturally (no `truncate` or `whitespace-nowrap`)
- [X] T011 [P] [US2] Implement `WordCardList` in `src/features/vocabulary-500/components/WordCardList.tsx` — props: `entries`, `isExpanded`, `onToggle` per contract C-005; renders `<ul>` of `<WordCard>` keyed by `entry.id`; if `entries.length === 0` renders `[ NO WORDS FOUND ]`
- [X] T012 [US2] Add responsive visibility to `VocabularySessionBrowser` in `src/features/vocabulary-500/components/VocabularySessionBrowser.tsx` — replace `"hidden lg:table"` on `<WordTable>` with `"hidden lg:block"`; add `<WordCardList className="lg:hidden">` receiving same `entries`, expand stubs; verify at 375 px no horizontal scrollbar and all 5 fields readable on `WordCard`

**Checkpoint**: Both mobile card layout and desktop table layout work. All 5 fields visible at every breakpoint ≥ 375 px. User Stories 1 + 2 are independently testable.

---

## Phase 5: User Story 3 — View Example Sentence (Priority: P3)

**Goal**: Each word entry has a `[ + ]` / `[ - ]` button that expands/collapses the English example and Vietnamese translation. Multiple rows can be open simultaneously; switching sessions collapses all.

**Independent Test**: Click `[ + ]` on two different rows — both expand and show their examples. Change session from dropdown — both collapse. Click `[ + ]` on a row, click `[ - ]` — it collapses.

### Implementation for User Story 3

- [X] T013 [P] [US3] Add expand functionality to `WordRow` in `src/features/vocabulary-500/components/WordRow.tsx` — receive live `expanded: boolean` and `onToggle: () => void` props; toggle button renders `[ + ]` / `[ - ]` with `aria-expanded={expanded}` and `aria-controls={\`ex-${entry.id}\`}`; when `expanded`, render a second `<tr>` with `colSpan={6}` containing `<AnimatePresence>` + `<motion.div initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }} exit={{ height:0, opacity:0 }}>` wrapping English `example` and `viExample` (null renders `—`)
- [X] T014 [P] [US3] Add expand functionality to `WordCard` in `src/features/vocabulary-500/components/WordCard.tsx` — same props `expanded`, `onToggle`; toggle button in top-right corner renders `[ + ]` / `[ - ]`; expanded section uses identical `<AnimatePresence>` + `<motion.div>` pattern showing `example` and `viExample`
- [X] T015 [US3] Wire expand state throughout in `src/features/vocabulary-500/components/VocabularySessionBrowser.tsx`, `WordTable.tsx`, `WordCardList.tsx` — call `useExpandedRows(selectedSession)` in `VocabularySessionBrowser`; pass `isExpanded` and `onToggle` as props down to `<WordTable>` and `<WordCardList>`, which thread them to each `<WordRow>` / `<WordCard>`; verify FR-006 (expand row A then row B — both stay open) and FR-007 (change session — `useExpandedRows` effect clears the set)

**Checkpoint**: All three user stories work end-to-end. Row expand/collapse functions on both layouts. Session switch resets expand state.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility hardening, error edge case, and final validation.

- [X] T016 [P] Keyboard accessibility pass on `SessionDropdown` in `src/features/vocabulary-500/components/SessionDropdown.tsx` — ensure `aria-haspopup="listbox"`, `aria-expanded` on trigger, `role="listbox"` on list, `role="option"` + `aria-selected` on items; confirm Tab closes dropdown and moves focus forward; test ArrowDown/Up cycle through all 32 options; add `tabIndex` if any option loses focusability
- [X] T017 [P] Add error fallback to `VocabularySessionBrowser` in `src/features/vocabulary-500/components/VocabularySessionBrowser.tsx` — wrap JSON import + groupBySession in a try/catch; if it throws render `<p className="text-accent font-mono">[ ERROR: DATA UNAVAILABLE ]</p>` instead of the browser UI
- [X] T018 Run all 16 manual acceptance checks from `specs/004-vocab-500-sessions/quickstart.md`; fix any failures found; confirm `pnpm lint` exits 0 and `pnpm build` succeeds

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — BLOCKS all user story phases
- **Phase 3 (US1)**: Depends on Phase 2 completion
- **Phase 4 (US2)**: Depends on Phase 3 completion (needs `VocabularySessionBrowser` to add responsive switching)
- **Phase 5 (US3)**: Depends on Phase 4 completion (expand slots exist in `WordRow` / `WordCard`)
- **Phase 6 (Polish)**: Depends on Phase 5 completion

### User Story Dependencies

- **US1 (P1)**: Can start after Phase 2 — no dependencies on US2/US3
- **US2 (P2)**: Depends on US1 (`VocabularySessionBrowser` must exist to add card list to it)
- **US3 (P3)**: Depends on US2 (`WordRow` / `WordCard` stubs must exist to add expand behaviour)

### Within Each Phase

- Tasks marked `[P]` within the same phase touch different files and can run in parallel
- Tasks without `[P]` within a phase depend on the `[P]` tasks of that same phase completing first

---

## Parallel Execution Examples

### Phase 2 — Run T002 and T003 together

```
Task A: T002 — groupBySession helper in lib/group-by-session.ts
Task B: T003 — useExpandedRows hook in hooks/useExpandedRows.ts
```

### Phase 3 (US1) — Run T005, T006, T007 together, then T008, then T009

```
Round 1 (parallel): T005 SessionDropdown, T006 WordRow (stub), T007 WordTable
Round 2 (sequential): T008 VocabularySessionBrowser (depends on T005 + T007)
Round 3 (sequential): T009 page.tsx mount (depends on T008)
```

### Phase 4 (US2) — Run T010 and T011 together, then T012

```
Round 1 (parallel): T010 WordCard, T011 WordCardList
Round 2 (sequential): T012 VocabularySessionBrowser responsive (depends on T010 + T011)
```

### Phase 5 (US3) — Run T013 and T014 together, then T015

```
Round 1 (parallel): T013 WordRow expand, T014 WordCard expand
Round 2 (sequential): T015 wire expand state (depends on T013 + T014)
```

### Phase 6 — Run T016 and T017 together, then T018

```
Round 1 (parallel): T016 keyboard nav, T017 error fallback
Round 2 (sequential): T018 final acceptance validation
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (T002, T003, T004)
3. Complete Phase 3: User Story 1 (T005–T009)
4. **STOP and VALIDATE**: Desktop session browser works end-to-end — run quickstart checks 1–4 from `quickstart.md`
5. Demo the MVP

### Incremental Delivery

1. Setup + Foundational → helpers and page shell ready
2. **+US1** → Session dropdown + desktop word table (MVP)
3. **+US2** → Mobile card layout, full responsive support
4. **+US3** → Row expand with example sentences
5. Polish → Keyboard nav + error handling + final build check

---

## Notes

- `[P]` tasks within the same phase can be started simultaneously (they edit different files)
- `[Story]` label maps each task to its spec user story for traceability
- `groupBySession` (T002) must sort by `frequency` ascending, nulls last — critical for rank display
- `useExpandedRows(resetKey)` (T003) encodes FR-007 (collapse on session change) via `useEffect` — do not implement this logic in `VocabularySessionBrowser` directly
- Never use `transition`, `transition-all`, or any transition utility except `transition-colors` (per CLAUDE.md)
- All borders must be `border-dashed`; no `rounded-*`, no `shadow-*`
- `500-common-words.json` import path: `@/data/vocabulary/500-common-words.json`
