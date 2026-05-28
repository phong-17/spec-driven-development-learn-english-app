# Tasks: Parse 500 Common English Words PDF to JSON

**Input**: Design documents from `/specs/001-parse-vocab-pdf/`

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

**Purpose**: Install dependencies and create required directory structure

- [X] T001 Add `pdfjs-dist` and `tsx` as devDependencies in `package.json` by running `pnpm add -D pdfjs-dist tsx`
- [X] T002 [P] Create empty directory `src/data/vocabulary/` (add `.gitkeep` placeholder until JSON is produced)
- [X] T003 [P] Create empty directory `scripts/` at repo root

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Define the shared TypeScript contract that both the extraction script and the app will use

**⚠️ CRITICAL**: This type definition must exist before the extraction script is written

- [X] T004 Create `src/types/vocabulary.ts` with the `VocabularyEntry` interface (`id: number`, `word: string`, `meaning: string | null`, `partOfSpeech: string | null`, `example: string | null`, `session: number`)

**Checkpoint**: Foundation ready — extraction script and future app features can now import `VocabularyEntry` from `@/types/vocabulary`

---

## Phase 3: User Story 1 — Extract All Words from PDF (Priority: P1) 🎯 MVP

**Goal**: Run the script and produce `src/data/vocabulary/500-common-words.json` containing 450–500 entries each with `id`, `word`, `meaning`, `partOfSpeech`, and `example` fields (session assignment comes in US3).

**Independent Test**: `node -e "console.log(JSON.parse(require('fs').readFileSync('src/data/vocabulary/500-common-words.json','utf8')).length)"` prints a number in `[490, 500]`; first 3 entries display correct Vietnamese diacritics.

### Implementation for User Story 1

- [X] T005 [US1] Create `scripts/parse-500-common-words.ts` scaffold: import `pdfjs-dist` and `fs`, define the output file path (`src/data/vocabulary/500-common-words.json`), and add a `main()` async function with try/catch and `process.exit(1)` on failure
- [X] T006 [US1] Implement PDF text extraction in `scripts/parse-500-common-words.ts`: use `pdfjs-dist` `getDocument()` → iterate pages → collect `TextContent.items[].str` into a flat line array; log page count and raw line count
- [X] T007 [US1] Implement heuristic entry parser in `scripts/parse-500-common-words.ts`: for each raw line identify English headword, optional `(POS)` marker, Vietnamese meaning after `:` separator, and optional example sentence on continuation lines; assign sequential `id` starting at 1; log any lines that fail to match
- [X] T008 [US1] Implement non-vocabulary line filter in `scripts/parse-500-common-words.ts`: skip lines that are page numbers (digits-only), section headers (all-caps with no `:`), or empty/whitespace-only lines (FR-006)
- [X] T009 [US1] Implement case-insensitive first-occurrence deduplication in `scripts/parse-500-common-words.ts`: use a `Set<string>` of lowercased words; log count of duplicates removed (FR-007)
- [X] T010 [US1] Write the extracted entries array to `src/data/vocabulary/500-common-words.json` in `scripts/parse-500-common-words.ts`: use `JSON.stringify(entries, null, 2)` with a trailing newline, UTF-8 encoding; assert entry count in `[450, 500]` before writing and exit non-zero if assertion fails (SC-001 — source PDF has 455 entries)

**Checkpoint**: US1 complete — `pnpm tsx scripts/parse-500-common-words.ts` produces a readable JSON file with 450–500 word entries

---

## Phase 4: User Story 2 — Structured Output Suitable for App Consumption (Priority: P2)

**Goal**: Every entry in the JSON has exactly the same six keys with no missing or extra fields; optional fields use `null` instead of being absent or empty-string.

**Independent Test**: `node -e "const d=JSON.parse(require('fs').readFileSync('src/data/vocabulary/500-common-words.json','utf8')); const keys=JSON.stringify(Object.keys(d[0])); console.log(d.every(e=>JSON.stringify(Object.keys(e))===keys))"` prints `true`.

### Implementation for User Story 2

- [X] T011 [US2] Add null normalization to the entry parser in `scripts/parse-500-common-words.ts`: trim all string fields; convert empty strings in `meaning`, `partOfSpeech`, and `example` to `null`; ensure `partOfSpeech` is lowercased when present (V-MN-1, V-POS-1)
- [X] T012 [US2] Add schema-uniformity assertion in `scripts/parse-500-common-words.ts`: after building the entries array verify that every entry has exactly the keys `["id","word","meaning","partOfSpeech","example","session"]` in that order; exit non-zero if any entry fails (V-SC-1, AC-1 of US2) — note: `session` is included now so it defaults to `0` until Phase 5 assigns real values
- [X] T013 [US2] Add SC-002 assertion in `scripts/parse-500-common-words.ts`: verify 100% of entries have a non-empty `word` field before writing; exit non-zero on failure

**Checkpoint**: US2 complete — every JSON entry has uniform schema with proper null handling; app features can iterate entries without key-existence checks

---

## Phase 5: User Story 3 — Session Distribution Metadata (Priority: P3)

**Goal**: Each entry has a `session` integer 1–32 assigned by sequential block distribution; all 32 sessions are populated with 15–16 entries each.

**Independent Test**: `node -e "const d=JSON.parse(require('fs').readFileSync('src/data/vocabulary/500-common-words.json','utf8')); const s=new Set(d.map(e=>e.session)); console.log(s.size,[...s].sort((a,b)=>a-b).slice(0,3),'...')"` prints `32 [1, 2, 3] ...`

### Implementation for User Story 3

- [X] T014 [US3] Implement block session assignment in `scripts/parse-500-common-words.ts`: after deduplication compute `base = Math.floor(N/32)`, `extra = N % 32`; assign `session = i < extra * (base+1) ? Math.floor(i/(base+1))+1 : Math.floor((i - extra)/(base))+extra+1` (first `extra` sessions get `base+1` words, remaining get `base`); log session size distribution
- [X] T015 [US3] Add session validation assertions in `scripts/parse-500-common-words.ts`: assert every entry's `session` is an integer 1–32 (V-SE-1); assert all 32 sessions appear (V-SE-2); assert each session has 10–20 entries (V-SE-3, SC-005); assert SC-003 (100% entries have session in 1–32); exit non-zero on any failure

**Checkpoint**: US3 complete — final JSON is fully formed with all 6 fields per entry and proper session distribution

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: End-to-end validation, artifact cleanup, and commit

- [X] T016 Run the full extraction via `pnpm tsx scripts/parse-500-common-words.ts` and confirm all assertions pass with zero non-zero exit
- [X] T017 [P] Manually verify Vietnamese diacritics round-trip correctly by printing the first 5 entries and checking `meaning` fields display properly (quickstart.md verification step 2)
- [X] T018 [P] Remove `src/data/vocabulary/.gitkeep` (if created in T002) now that the real JSON exists
- [X] T019 Confirm `src/types/vocabulary.ts` matches the final JSON shape (6 fields, correct types including `session: number`); update the JSDoc comment on `session` to note `// 1..32`
- [X] T020 Verify the JSON can be imported in a Next.js context: add a temporary `console.log` import check in `src/app/page.tsx`, run `pnpm build` to confirm no TypeScript or bundler errors, then remove the temporary import

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — T002 and T003 run in parallel after T001
- **Foundational (Phase 2)**: Depends on Phase 1 complete — BLOCKS all user story work
- **US1 (Phase 3)**: Depends on Phase 2 — tasks T005→T006→T007→T008→T009→T010 are sequential (all in same file)
- **US2 (Phase 4)**: Depends on Phase 3 checkpoint — adds normalization and schema assertions to same script
- **US3 (Phase 5)**: Depends on Phase 4 checkpoint — adds session field to same script
- **Polish (Phase 6)**: Depends on Phase 5 complete

### User Story Dependencies

- **US1 (P1)**: Starts after Foundational — independently produces a usable JSON
- **US2 (P2)**: Extends US1 script — independently verifiable by schema uniformity check
- **US3 (P3)**: Extends US2 script — independently verifiable by session distribution check

### Within Each User Story

All tasks within a story modify the same `scripts/parse-500-common-words.ts` and must be completed sequentially in listed order.

### Parallel Opportunities

- T002 and T003 (dir creation) run in parallel
- T017 and T018 (polish validation steps) run in parallel
- US1, US2, US3 are sequential (same file, incremental additions)

---

## Parallel Example: Phase 1 Setup

```bash
# After T001 completes (pnpm add), run in parallel:
Task: "Create src/data/vocabulary/ directory — T002"
Task: "Create scripts/ directory — T003"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T003)
2. Complete Phase 2: Foundational (T004)
3. Complete Phase 3: US1 (T005–T010)
4. **STOP and VALIDATE**: Run `pnpm tsx scripts/parse-500-common-words.ts`, confirm 450–500 entries in JSON
5. Proceed to US2 only after US1 validation passes

### Incremental Delivery

1. Setup + Foundational → TypeScript type ready, deps installed
2. Add US1 → Raw extraction works → Validate entry count
3. Add US2 → Schema uniformity enforced → Validate uniform keys
4. Add US3 → Session distribution added → Validate all 32 sessions
5. Polish → Full end-to-end validation + build check → Ready to commit

---

## Notes

- [P] tasks = different files or independent concerns, no cross-task dependencies
- [Story] label maps each task to a user story for traceability
- Each phase checkpoint = independently testable increment
- The single script file (`scripts/parse-500-common-words.ts`) grows incrementally phase-by-phase; avoid jumping ahead
- Commit only after Phase 6 (Polish) completes — the JSON is not useful in partial state
- `pdfjs-dist` worker setup: in Node scripts, set `GlobalWorkerOptions.workerSrc = ''` to disable the web worker and run synchronously
