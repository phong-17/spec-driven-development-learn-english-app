# Tasks: Vocabulary Practice Quiz

**Input**: Design documents from `/specs/007-vocab-practice-quiz/`

**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/components.md ✓, quickstart.md ✓

**Tests**: Not requested — manual acceptance testing per quickstart.md.

**Organization**: Foundational phase creates all shared types, pure helpers, and leaf components (TerminalInput, QuizSummary, useQuizProgress) that every exercise needs. US1 adds the button + route. US2 creates TypeTheWord and the PracticeBrowser orchestrator (with stubs for US3/US4 tabs). US3 and US4 each add one exercise component and replace their stub in PracticeBrowser.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no incomplete dependencies within the same phase)
- **[Story]**: Which user story this task belongs to (US1–US4)

---

## Phase 1: Setup

**Purpose**: Create all new directories before any code is written.

- [X] T001 Create directories `src/features/practice/components/`, `src/features/practice/lib/`, `src/features/practice/hooks/`, `src/app/practice/[source]/[session]/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Types, pure helpers, and shared leaf components/hooks that EVERY exercise and the route shell depend on. T002 (types) must complete first; T003–T009 can all proceed in parallel once T002 is done (T005 additionally requires T004).

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T002 Create `src/types/practice.ts` — export `PracticeSource = "500" | "1000"`, `PracticeExercise = "type" | "choose" | "flashcards"`, `PracticeEntry { id, word, meaning, partOfSpeech, phonetic, example }`, `PracticeSessionData { source, session, label, entries }`, `MeaningChoice { entryId, word, options, correct }` — per data-model.md
- [X] T003 [P] Edit `src/utils/route-path.ts` — add `export const ROUTE_PRACTICE = "/practice" as const` and `export function routePractice(source: PracticeSource, session: number): string` returning `/practice/${source}/${session}`; import `PracticeSource` from `@/types/practice`
- [X] T004 [P] Create `src/features/practice/lib/shuffle.ts` — export `shuffle<T>(arr: ReadonlyArray<T>): T[]` (Fisher–Yates; copies the array, pure, no side effects — required by Decision 4 to avoid hydration mismatch)
- [X] T005 [P] Create `src/features/practice/lib/build-choices.ts` — export `buildChoices(correct: PracticeEntry, pool: PracticeEntry[]): MeaningChoice` — picks up to 3 distinct distractors from `pool` (excluding `correct`) using `shuffle`, returns `{ entryId: correct.id, word: correct.word, options: shuffled [correct.meaning, ...distractors], correct: correct.meaning }`; if pool has < 3 other entries, returns fewer options (FR-009 edge case); import `PracticeEntry`, `MeaningChoice` from `@/types/practice`; import `shuffle` from `./shuffle`
- [X] T006 [P] Create `src/features/practice/lib/load-practice-session.ts` — export `loadPracticeSession(source: PracticeSource, session: number): PracticeSessionData | null` — imports both JSON datasets, picks the correct one, calls each dataset's own `groupBySession` helper, filters entries where `meaning` is null/empty, maps to `PracticeEntry[]`, builds `label = "Day ${session} · ${source} Words"`, returns null if session not found; runs **server-side only** (no `"use client"`)
- [X] T007 [P] Create `src/features/practice/components/TerminalInput.tsx` — `"use client"`; props `{ value: string; onChange: (v: string) => void; onSubmit: () => void; disabled?: boolean; autoFocus?: boolean }`; renders a `<label>` with `> ` prefix + monospace `<input>` (dashed border, transparent bg, `caret-color: accent`, `autoFocus` on mount via `useEffect` and when `disabled` changes from true→false); **Enter key calls `onSubmit`**; no submit button (FR-005, clarified)
- [X] T008 [P] Create `src/features/practice/components/QuizSummary.tsx` — `"use client"`; props `{ correct: number; wrong: number; total: number; elapsedMs: number; onRestart: () => void }`; renders ASCII box: `[ SESSION COMPLETE ]`, correct/wrong/total counts, elapsed time formatted as `mm:ss`, `[ RESTART ]` button; import `PracticeSource` from `@/types/practice` (for future label variants); (FR-008, SC-007)
- [X] T009 [P] Create `src/features/practice/hooks/useQuizProgress.ts` — `"use client"` hook; signature: `useQuizProgress(entries: PracticeEntry[]) → { shuffled, index, total, phase, correct, wrong, skipped, finished, elapsedMs, submit(isCorrect: boolean), skip(), next(), restart() }`; shuffles `entries` in a mount `useEffect` (not during render — Decision 4); `phase: "answering" | "revealed"`; `submit` transitions to `"revealed"`, `next` advances index or marks `finished`; `restart` resets all state and reshuffles

**Checkpoint**: Types, helpers, and leaf components ready — user story implementation can begin.

---

## Phase 3: User Story 1 — Launch Practice from Vocabulary Page (Priority: P1)

**Goal**: Both vocabulary pages show `[ PRACTICE ]` next to the session dropdown; clicking it navigates to `/practice/{source}/{session}` with the correct context rendered.

**Independent Test**: On `/vocabulary/500`, select Day 3; verify `[ PRACTICE ]` button is on the same row; click it → `/practice/500/3` loads with heading "DAY 3 · 500 WORDS" and a placeholder body (exercises wired in US2); verify `/practice/1000/12` also works; verify `/practice/500/999` shows `[ SESSION NOT FOUND ]` with a back link.

- [X] T010 [P] [US1] Create `src/features/practice/components/PracticeButton.tsx` — `"use client"`; props `{ source: PracticeSource; session: number }`; renders a `next/link` `Link` styled as `[ PRACTICE ▶ ]` bracket button (dashed border, accent on hover, `transition-colors`); `href={routePractice(source, session)}`; import `routePractice` from `@/utils/route-path`; import `PracticeSource` from `@/types/practice`
- [X] T011 [P] [US1] Create `src/app/practice/[source]/[session]/page.tsx` — Server Component; export `async function generateStaticParams()` deriving all valid `{source, session}` pairs from both datasets via `loadPracticeSession` existence checks (2×32 = up to 64 pairs); `export default async function PracticePage({ params })` where `params` is awaited (Next.js 16); validates source and session, returns error state (`[ SESSION NOT FOUND ]` + Link back) on invalid; calls `loadPracticeSession`; renders standard page chrome (fixed `theme.gif` bg, `<NavigationMenu links={HOME_NAV_LINKS} />`, breadcrumb `> ~/learn-english/practice/{source}/{session}`, `<h1>` = `data.label.toUpperCase()`); renders `<p className="font-mono text-foreground/50">[ SELECT AN EXERCISE TAB ]</p>` as placeholder — replaced in T016 (US2)
- [X] T012 [P] [US1] Edit `src/features/vocabulary-500/components/VocabularySessionBrowser.tsx` — add `import { PracticeButton } from "@/features/practice/components/PracticeButton"` and add `<PracticeButton source="500" session={selectedSession} />` inside the existing SESSION `<div className="flex flex-wrap items-center gap-3">` row (FR-001)
- [X] T013 [P] [US1] Edit `src/features/vocabulary-1000/components/TopicSessionBrowser.tsx` — same pattern as T012 but `source="1000"` (FR-001)

**Checkpoint**: `/vocabulary/500` and `/vocabulary/1000` both have the `[ PRACTICE ]` button; `/practice/{source}/{session}` loads with correct heading + placeholder body. US1 independently testable (quickstart checks 1–6).

---

## Phase 4: User Story 2 — Meaning → Word, Type the Word (Priority: P1) 🎯 Core Exercise

**Goal**: The practice page has a working "Type the Word" exercise — Vietnamese meaning shown, learner types the English word with Enter, gets immediate feedback, advances manually, receives a summary at the end.

**Independent Test**: Navigate to `/practice/500/5`; verify tab `[ TYPE THE WORD ]` is active by default; verify the `>` terminal input is auto-focused; type a correct word + press Enter → `[ CORRECT ]`; press Enter again → next word; type wrong word → `[ WRONG ] → "word"` revealed; tab through all words → summary screen with correct/wrong/total + time.

- [X] T014 [US2] Create `src/features/practice/components/TypeTheWord.tsx` — `"use client"`; props `{ entries: PracticeEntry[] }`; uses `useQuizProgress(entries)`; when `finished` renders `<QuizSummary correct wrong total elapsedMs onRestart>`; when `phase === "answering"` renders `partOfSpeech` + `meaning` prompt + `<TerminalInput value answer onChange onSubmit={()=>submit(check())} autoFocus>`; when `phase === "revealed"` renders `[ CORRECT ]` or `[ WRONG ] → "{correct}"` (+ `<SpeakButton word={entry.word} />`) + `[ NEXT → ]` button (Enter also calls `next()`); check function: `input.trim().toLowerCase() === entry.word.trim().toLowerCase()` (FR-006); a `[ SKIP ]` button calls `skip()` when `phase === "answering"`; import `SpeakButton` from `@/features/vocabulary-500/components/SpeakButton`
- [X] T015 [US2] Create `src/features/practice/components/PracticeBrowser.tsx` — `"use client"`; props `{ data: PracticeSessionData }`; `useState<PracticeExercise>("type")` for active tab; renders tab bar with three `[ TYPE THE WORD ]`, `[ CHOOSE MEANING ]`, `[ FLASH CARDS ]` buttons (active = accent border, inactive = muted — same style as `LessonsBrowser` tabs); renders `<TypeTheWord>` for the `"type"` tab; renders `<p className="font-mono text-foreground/50">[ COMING SOON ]</p>` for `"choose"` and `"flashcards"` tabs (replaced in T018, T020); each exercise is `key={activeTab + data.session}` so switching tabs resets state; empty `entries` → `[ NO WORDS IN THIS SESSION ]`
- [X] T016 [US2] Edit `src/app/practice/[source]/[session]/page.tsx` — add `import { PracticeBrowser } from "@/features/practice/components/PracticeBrowser"` and replace the `<p>[ SELECT AN EXERCISE TAB ]</p>` placeholder with `<PracticeBrowser data={data} />`

**Checkpoint**: `/practice/{source}/{session}` is fully functional for the Type-the-Word exercise. US2 independently testable (quickstart checks 7–14).

---

## Phase 5: User Story 3 — Word → Meaning, Choose the Meaning (Priority: P2)

**Goal**: The "Choose the Meaning" tab works — English word displayed, learner picks from 4 Vietnamese options with feedback.

**Independent Test**: On `/practice/500/5`, switch to `[ CHOOSE MEANING ]` tab; verify 4 options shown; select correct → highlights green; select wrong → red + correct highlighted; `[ NEXT → ]` advances; summary at end.

- [X] T017 [US3] Create `src/features/practice/components/ChooseTheMeaning.tsx` — `"use client"`; props `{ entries: PracticeEntry[] }`; uses `useQuizProgress(entries)`; per question calls `buildChoices(currentEntry, entries)` for `MeaningChoice`; renders `word` (bold) + `<SpeakButton>` + the options as bracket-style buttons `[ option text ]`; on selection sets `selected` state and calls `submit(isCorrect)`; `phase === "revealed"` applies correct/wrong visual states to option buttons and shows `[ NEXT → ]` button; `finished` → `<QuizSummary>`; fewer than 4 entries in session handled gracefully (FR-009 edge case — `buildChoices` returns fewer options, no crash)
- [X] T018 [US3] Edit `src/features/practice/components/PracticeBrowser.tsx` — add `import { ChooseTheMeaning } from "./ChooseTheMeaning"` and replace the `"choose"` tab's `[ COMING SOON ]` placeholder with `<ChooseTheMeaning entries={data.entries} />`

**Checkpoint**: "Choose the Meaning" tab fully functional. US3 independently testable (quickstart checks 15–17).

---

## Phase 6: User Story 4 — Flash Cards (Priority: P3)

**Goal**: The "Flash Cards" tab works — flip cards to reveal answers, self-score Known/Unknown, unknown cards repeat in a second pass.

**Independent Test**: On `/practice/500/5`, switch to `[ FLASH CARDS ]` tab; verify meaning on the front; flip → word + phonetic + example + SpeakButton appear; tap `[ KNOWN ]` → advances; tap `[ UNKNOWN ]` → card reappears after the first pass; summary shows known vs. unknown counts.

- [X] T019 [US4] Create `src/features/practice/components/FlashCards.tsx` — `"use client"`; props `{ entries: PracticeEntry[] }`; local state: `queue` (shuffled on mount via `useEffect`), `index`, `flipped: boolean`, `knownCount`, `unknownQueue: PracticeEntry[]`, `pass: 1 | 2`, `startedAt`; when not `flipped` shows `meaning` (card front) + `[ FLIP ]` button (or click-anywhere); when `flipped` uses `motion.div` with rotateY flip animation (motion/react) to reveal `word` (bold) + `phonetic` + `example` (both if present) + `<SpeakButton>`; `[ KNOWN ]` increments `knownCount` and advances; `[ UNKNOWN ]` pushes to `unknownQueue` and advances; after first pass, if `unknownQueue` is non-empty sets `queue = shuffle(unknownQueue)` for second pass; finished → `<QuizSummary correct={knownCount} wrong={unknownQueue.length} total={entries.length} ...>` with labels "KNOWN"/"UNKNOWN"
- [X] T020 [US4] Edit `src/features/practice/components/PracticeBrowser.tsx` — add `import { FlashCards } from "./FlashCards"` and replace the `"flashcards"` tab's `[ COMING SOON ]` placeholder with `<FlashCards entries={data.entries} />`

**Checkpoint**: All three exercise tabs fully functional. The page matches all 25 quickstart.md acceptance checks (quickstart checks 18–20).

---

## Phase 7: Polish

**Purpose**: Lint, build validation, and manual acceptance walkthrough.

- [X] T021 [P] Run `pnpm lint` and resolve any ESLint errors or warnings in new `src/features/practice/`, `src/types/practice.ts`, `src/app/practice/`, and edited browser files
- [X] T022 Run `pnpm build` and confirm all `/practice/[source]/[session]` pages prerender as static (`○`); then walk through all 25 manual acceptance checks in `specs/007-vocab-practice-quiz/quickstart.md` and mark each complete

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user stories; T002 first, then T003–T009 run in parallel (T005 additionally needs T004)
- **US1 (Phase 3)**: Depends on Foundational — T010 ∥ T011 (different files); T012 + T013 run after T010
- **US2 (Phase 4)**: Depends on Foundational + US1 complete — T014 → T015 → T016 (sequential)
- **US3 (Phase 5)**: Depends on US2 complete — T017 → T018 (sequential)
- **US4 (Phase 6)**: Depends on US2 complete — T019 → T020 (sequential); US3 and US4 can overlap (T017+T019 use different files)
- **Polish (Phase 7)**: Depends on US1 + US2 + US3 + US4 all complete

### User Story Dependencies

- **US1 (P1)**: Requires Foundational. Independently testable (button + route + navigation).
- **US2 (P1)**: Requires US1 (builds PracticeBrowser, updates page.tsx). Independently testable at the exercise level.
- **US3 (P2)**: Requires US2 (PracticeBrowser exists to add the tab to). Independent from US4.
- **US4 (P3)**: Requires US2 (same reason). Independent from US3.

### Within Each Phase

- Foundational: T002 → {T003 ∥ T004 ∥ T006 ∥ T007 ∥ T008 ∥ T009} → T005 (T005 after T004)
- US1: {T010 ∥ T011} → {T012 ∥ T013}
- US2: T014 → T015 → T016
- US3+US4 overlap: T017 ∥ T019 → T018 then T020 (or T020 then T018)

---

## Parallel Opportunity: Foundational Phase

```text
# After T002 completes, start all of these simultaneously:
T003: route-path.ts edit
T004: shuffle.ts
T006: load-practice-session.ts
T007: TerminalInput.tsx
T008: QuizSummary.tsx
T009: useQuizProgress.ts

# After T004 completes:
T005: build-choices.ts
```

## Parallel Opportunity: US3 + US4 Overlap

```text
# After US2 (T016) is done, start these simultaneously:
T017: ChooseTheMeaning.tsx   [US3]
T019: FlashCards.tsx         [US4]

# Then sequentially:
T018: update PracticeBrowser for US3 (after T017)
T020: update PracticeBrowser for US4 (after T019)
```

---

## Implementation Strategy

### MVP First (US1 + US2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: US1 — button + route live
4. Complete Phase 4: US2 — Type the Word exercise working
5. **STOP and VALIDATE**: Navigate `/practice/500/5`; verify button, route, terminal input, Enter submit, feedback, summary
6. Demo/deploy if ready

### Incremental Delivery

1. Setup + Foundational → shared infra ready
2. US1 (T010–T013) → button visible on both vocab pages, route loads → validate
3. US2 (T014–T016) → Type the Word fully working → validate (quickstart 7–14)
4. US3 (T017–T018) → Choose the Meaning tab working → validate (quickstart 15–17)
5. US4 (T019–T020) → Flash Cards tab working → validate (quickstart 18–20)
6. Polish (T021–T022) → lint + build clean → run all 25 quickstart checks

---

## Notes

- [P] tasks = different files, no blocking inter-dependencies within the phase
- T011 (page.tsx) renders a `[ SELECT AN EXERCISE TAB ]` placeholder — T016 replaces it with `<PracticeBrowser>`
- T015 (PracticeBrowser) renders `[ COMING SOON ]` for US3/US4 tabs — T018 and T020 replace them
- `SpeakButton` imported from `@/features/vocabulary-500/components/SpeakButton` in TypeTheWord, ChooseTheMeaning (word display), and FlashCards — do NOT copy
- `groupBySession` from each dataset's own `lib/group-by-session` is used by `load-practice-session.ts`
- Next.js 16: `params` in the route file is a **Promise** and MUST be `await`-ed (see CLAUDE.md breaking changes)
- `routePractice` imported from `@/utils/route-path` in PracticeButton — add it there (T003) before PracticeButton (T010)
- No `generateStaticParams` hardcodes 1–32; it derives valid pairs from the actual data (Decision 2)
- Fisher–Yates shuffle runs in a `useEffect` mount, NOT during render — avoids React hydration mismatch (Decision 4)
