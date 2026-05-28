# Tasks: Parse 1000 Topic-Based English Vocabulary PDF to JSON

**Input**: Design documents from `/specs/002-parse-topic-vocab-pdf/`

**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: Not requested in spec — no test tasks generated.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each increment.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Exact file paths included in all descriptions

## Path Conventions

Single-project Next.js layout (per plan.md):
- `scripts/` — extraction scripts at repo root
- `src/data/vocabulary/` — committed JSON output
- `src/types/` — shared TypeScript types

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create required file structure; no new packages needed (pdfjs-dist + tsx already installed from feature 001)

- [X] T001 Probe the PDF structure by writing a temporary `scripts/probe-1000-topic-words.ts` script that prints the first 3 pages of raw pdfjs items (x, y, str) to understand column layout and how category headings differ from entry rows
- [X] T002 [P] Create `src/types/topic-vocabulary.ts` with the `TopicVocabEntry` interface: `id: number`, `stt: number | null`, `word: string`, `partOfSpeech: string | null`, `phonetic: string | null`, `meaning: string`, `category: string`, `session: number`
- [X] T003 [P] Create empty directory `src/data/vocabulary/` placeholder if not already present (already exists from feature 001 — verify and skip if so)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Understand the PDF column layout and confirm category heading detection strategy before writing the main parser

**⚠️ CRITICAL**: T001 probe results must be reviewed before T005 to set correct column X ranges and heading detection logic

- [X] T004 Run `pnpm tsx scripts/probe-1000-topic-words.ts` and document the column X-coordinate ranges (STT, word, partOfSpeech, phonetic, meaning) and the visual pattern that distinguishes category headings from entry rows (e.g., no leading STT number, different y spacing, different x range)

**Checkpoint**: Column layout and heading detection strategy confirmed — extraction script can now be written

---

## Phase 3: User Story 1 — Extract All Vocabulary Entries from PDF (Priority: P1) 🎯 MVP

**Goal**: Run the script and produce `src/data/vocabulary/1000-topic-words.json` containing 900–1050 entries each with all 8 fields. Category detection is scaffolded but US2 completes its validation.

**Independent Test**: `node -e "const d=JSON.parse(require('fs').readFileSync('src/data/vocabulary/1000-topic-words.json','utf8')); console.log(d.length)"` prints a number in `[900, 1050]`.

### Implementation for User Story 1

- [X] T005 [US1] Create `scripts/parse-1000-topic-words.ts` scaffold: import `pdfjs-dist/legacy/build/pdf.mjs` and `node:fs`/`node:path`, define constants (PDF filename, output path, TOTAL_SESSIONS=32), add `main()` async function with try/catch and `process.exit(1)` on failure
- [X] T006 [US1] Add column X-range constants to `scripts/parse-1000-topic-words.ts` based on probe findings from T004: define `COL_STT`, `COL_WORD`, `COL_POS`, `COL_PHONETIC`, `COL_MEANING`; add footer/header y-filter (skip items with y < 30) matching the feature 001 pattern
- [X] T007 [US1] Implement PDF text extraction in `scripts/parse-1000-topic-words.ts`: use `getDocument()` → iterate pages → collect text items as `{ str, x, y }` sorted by descending y then ascending x; skip footer items below y=30
- [X] T008 [US1] Implement row detection in `scripts/parse-1000-topic-words.ts`: identify entry rows by a leading integer in `COL_STT` (the `stt` value); group all items on the same logical row together by accumulating items until the next STT trigger; store the STT number as `rawStt`
- [X] T009 [US1] Implement category heading detection in `scripts/parse-1000-topic-vocab.ts`: a line is a heading when it has no leading STT number and its text falls outside all entry columns (or spans a wider x range); maintain a `currentCategory` string variable, defaulting to `"Uncategorized"` at start, and update it whenever a heading line is detected
- [X] T010 [US1] Implement column-text joining in `scripts/parse-1000-topic-words.ts`: reuse the `joinColumnText()` and `parseWordColumn()` helper patterns from `scripts/parse-500-common-words.ts` (mid-word wrap handling and bleed-over detection) — adapt for this PDF's column layout
- [X] T011 [US1] Implement null normalization in `scripts/parse-1000-topic-words.ts`: trim all string fields; convert empty strings in `partOfSpeech` and `phonetic` to `null`; lowercase `partOfSpeech` when present; normalize known split POS labels (same `POS_NORMALIZATION` map approach as feature 001)
- [X] T012 [US1] Implement `id` assignment and `stt` extraction in `scripts/parse-1000-topic-words.ts`: `id` is the 1-based array index; `stt` is the integer parsed from `rawStt` (set to `null` if unparseable); assign `category = currentCategory` at the time each entry row is processed
- [X] T013 [US1] Add SC-001 and SC-002 assertions and JSON write in `scripts/parse-1000-topic-words.ts`: assert entry count in `[900, 1050]`; assert all entries have non-empty `word`; assert schema uniformity (keys `["id","stt","word","partOfSpeech","phonetic","meaning","category","session"]` in order); write `JSON.stringify(entries, null, 2) + "\n"` to `src/data/vocabulary/1000-topic-words.json`; exit non-zero on any failure

**Checkpoint**: US1 complete — `pnpm tsx scripts/parse-1000-topic-words.ts` produces a readable JSON file with 900–1050 entries

---

## Phase 4: User Story 2 — Category Metadata Preserved in Output (Priority: P2)

**Goal**: Every entry has a non-null `category` matching the PDF topic heading; at least 2 distinct categories appear; `"Uncategorized"` fallback fires only when no heading has been seen.

**Independent Test**: `node -e "const d=JSON.parse(require('fs').readFileSync('src/data/vocabulary/1000-topic-words.json','utf8')); const c=new Set(d.map(e=>e.category)); console.log(c.size, d.every(e=>e.category!==null))"` prints `≥2 true`.

### Implementation for User Story 2

- [X] T014 [US2] Add SC-003 assertion in `scripts/parse-1000-topic-words.ts`: assert 100% of entries have a non-null, non-empty `category` string; log a warning for any entry that received `"Uncategorized"` so the operator knows how many pre-heading entries were found; exit non-zero if any `category` is null or empty
- [X] T015 [US2] Add SC-007 assertion in `scripts/parse-1000-topic-words.ts`: assert at least 2 distinct `category` values appear in the output; log the full list of detected categories and their entry counts; exit non-zero if fewer than 2 categories found

**Checkpoint**: US2 complete — category field is valid for every entry; category coverage logged to console

---

## Phase 5: User Story 3 — Session Distribution Metadata (Priority: P3)

**Goal**: Each entry has a `session` integer 1–32; all 32 sessions populated; session sizes differ by at most 1.

**Independent Test**: `node -e "const d=JSON.parse(require('fs').readFileSync('src/data/vocabulary/1000-topic-words.json','utf8')); const s=new Set(d.map(e=>e.session)); console.log(s.size)"` prints `32`.

### Implementation for User Story 3

- [X] T016 [US3] Implement `assignSession()` in `scripts/parse-1000-topic-words.ts`: reuse the identical block-distribution algorithm from `scripts/parse-500-common-words.ts` — `base = Math.floor(N/32)`, `extra = N % 32`, first `extra` sessions get `base+1` entries, remaining get `base`; apply after deduplication/filtering is complete
- [X] T017 [US3] Add SC-004 and SC-005 assertions in `scripts/parse-1000-topic-words.ts`: assert every entry's `session` is an integer 1–32; assert all 32 sessions appear; assert `max(session_size) - min(session_size) ≤ 1`; log session size distribution; exit non-zero on any failure

**Checkpoint**: US3 complete — final JSON is fully formed with all 8 fields per entry and correct session distribution

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: End-to-end validation, cleanup, and TypeScript build check

- [X] T018 Delete the temporary probe script `scripts/probe-1000-topic-words.ts`
- [X] T019 Run the full extraction via `pnpm tsx scripts/parse-1000-topic-words.ts` and confirm all assertions pass with exit code 0
- [X] T020 [P] Manually verify Vietnamese diacritics: print the first 5 entries and confirm `meaning` fields display correct Vietnamese characters
- [X] T021 [P] Verify category names look correct: print the unique `category` values and confirm they match the PDF's topic headings
- [X] T022 Confirm `src/types/topic-vocabulary.ts` matches the final JSON shape; verify `meaning` is typed as `string` (non-nullable, per data-model) not `string | null`
- [X] T023 Run `pnpm exec tsc --noEmit` to confirm no TypeScript errors across the project after adding `src/types/topic-vocabulary.ts`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: T001 must complete before T004; T002 and T003 are parallel
- **Foundational (Phase 2)**: T004 depends on T001 — BLOCKS all US1 script work (column ranges must be known)
- **US1 (Phase 3)**: T005→T006→T007→T008→T009→T010→T011→T012→T013 are sequential (all in same file)
- **US2 (Phase 4)**: Depends on Phase 3 checkpoint — adds category assertions to same script
- **US3 (Phase 5)**: Depends on Phase 4 checkpoint — adds session logic to same script
- **Polish (Phase 6)**: Depends on Phase 5 complete

### User Story Dependencies

- **US1 (P1)**: Starts after Foundational — independently produces a usable JSON
- **US2 (P2)**: Extends US1 script — independently verifiable by category check
- **US3 (P3)**: Extends US2 script — independently verifiable by session distribution check

### Within Each User Story

All tasks within US1 modify the same `scripts/parse-1000-topic-words.ts` and must be completed sequentially in listed order.

### Parallel Opportunities

- T002 (type file) and T003 (directory check) run in parallel after project is set up
- T020 and T021 (polish verification steps) run in parallel
- US1, US2, US3 are sequential (same script file, incremental additions)

---

## Parallel Example: Phase 1 Setup

```bash
# Run in parallel after T001 starts:
Task: "Create src/types/topic-vocabulary.ts — T002"
Task: "Verify src/data/vocabulary/ directory — T003"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T003) — probe PDF structure
2. Complete Phase 2: Foundational (T004) — document column layout
3. Complete Phase 3: US1 (T005–T013)
4. **STOP and VALIDATE**: Run script, confirm 900–1050 entries in JSON
5. Proceed to US2 only after US1 validation passes

### Incremental Delivery

1. Setup + Foundational → Column layout known, type file ready
2. Add US1 → Raw extraction works → Validate entry count and schema
3. Add US2 → Category assertions enforced → Validate category coverage
4. Add US3 → Session distribution added → Validate all 32 sessions
5. Polish → Full end-to-end validation + tsc check → Ready to commit

---

## Notes

- [P] tasks = different files or independent concerns, no cross-task dependencies
- The probe step (T001/T004) is unique to this feature vs feature 001 — the topic PDF has a different visual layout that must be understood before writing the parser
- Reuse `joinColumnText()` and `parseWordColumn()` patterns verbatim from `scripts/parse-500-common-words.ts`; only the column X-ranges and category detection logic differ
- Category detection is the key new logic: iterate rows top-to-bottom, track `currentCategory`, update when a heading line is detected
- Commit only after Phase 6 (Polish) completes — JSON is not useful in partial state
