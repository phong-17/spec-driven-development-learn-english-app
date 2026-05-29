# Phase 1 Data Model: Vocabulary Practice Quiz

No runtime database. Practice reads the existing static datasets server-side and normalises them into a single in-memory shape. All TypeScript types live in `src/types/practice.ts`.

## Source datasets (existing — reused, not modified)

- **500 set**: `src/data/vocabulary/500-common-words.json` → `VocabularyEntry[]` (`src/types/vocabulary.ts`). Fields used: `word`, `meaning` (nullable), `partOfSpeech`, `phonetic`, `example`, `session`.
- **1000 set**: `src/data/vocabulary/1000-topic-words.json` → `TopicVocabEntry[]` (`src/types/topic-vocabulary.ts`). Fields used: `word`, `meaning`, `partOfSpeech`, `phonetic`, `session` (no `example`).

## TypeScript Types (`src/types/practice.ts`)

```ts
export type PracticeSource = "500" | "1000";

export type PracticeExercise = "type" | "choose" | "flashcards";

/** Dataset-agnostic word used by every exercise. */
export interface PracticeEntry {
  id: number;
  word: string;              // English — the answer in Type / Choose-front / Flash-back
  meaning: string;           // Vietnamese — required (null-meaning entries are filtered out)
  partOfSpeech: string | null;
  phonetic: string | null;
  example: string | null;    // English example sentence (500 set); null for 1000 set
}

/** Context resolved by the route shell and passed to the client browser. */
export interface PracticeSessionData {
  source: PracticeSource;
  session: number;           // 1..32
  label: string;             // e.g. "Day 5 · 500 Words"
  entries: PracticeEntry[];  // stable (source) order; client shuffles per exercise
}

/** One multiple-choice question for the Choose-the-Meaning exercise. */
export interface MeaningChoice {
  entryId: number;
  word: string;
  options: string[];         // 1..4 Vietnamese meanings, shuffled
  correct: string;           // the correct meaning (one of options)
}
```

## Normalisation rules (`load-practice-session.ts`)

- Map `VocabularyEntry` → `PracticeEntry`: `example` ← `entry.example`.
- Map `TopicVocabEntry` → `PracticeEntry`: `example` ← `null`.
- **Filter**: drop any entry whose `meaning` is `null`/empty (all exercises need a meaning). Documented in spec Edge Cases.
- Order: preserve the dataset's `groupBySession` order (frequency/id for 500; id for 1000). The client reshuffles per exercise on mount.

## Validation / Invariants

- `source` must be exactly `"500"` or `"1000"`; any other value → the route renders a not-found / error state with a link back (spec Edge Case).
- `session` must be an integer that exists as a key in that dataset's session grouping; otherwise error state.
- `PracticeSessionData.entries.length` ≥ 0; an empty session renders an empty-state message (no crash).
- `MeaningChoice.options.length` = `min(4, sessionEntryCount)`; `correct` is always present in `options` (FR-009 + < 4-entry edge case).
- Typed-answer comparison: `input.trim().toLowerCase() === entry.word.trim().toLowerCase()` (FR-006).

## Exercise state (client, in-memory only — not persisted)

- **Type the Word / Choose the Meaning** (`useQuizProgress`): `order: PracticeEntry[]` (shuffled on mount), `index`, `phase: "answering" | "revealed"`, `correctCount`, `wrongCount`, `skipped: PracticeEntry[]`, `startedAt`. On finish → summary; skipped items may be appended for a second pass.
- **Flash Cards**: `queue: PracticeEntry[]` (shuffled), `index`, `flipped: boolean`, `knownCount`, `unknownQueue: PracticeEntry[]`. After the first pass, `unknownQueue` becomes the queue for a second pass; summary shows known vs. unknown.
- All state resets on unmount/refresh (FR-012).
