# Phase 1 Data Model — Parse 1000 Topic-Based Vocabulary PDF to JSON

**Feature**: `002-parse-topic-vocab-pdf` · **Date**: 2026-05-28

## Entities

### TopicVocabEntry

Represents one extracted vocabulary record from the topic PDF. Sole entity in this feature.

| Field          | Type                  | Required | Description                                                                                       |
|----------------|-----------------------|----------|---------------------------------------------------------------------------------------------------|
| `id`           | `number` (integer)    | yes      | Sequential 1-based identifier reflecting PDF order. No gaps. Stable across re-extractions.        |
| `stt`          | `number \| null`      | yes      | Per-book sequence number as printed in the PDF's STT column. `null` only when the source row lacks one. May have gaps; not necessarily equal to `id`. |
| `word`         | `string`              | yes      | English headword as it appears in the PDF. Trimmed; never empty.                                  |
| `partOfSpeech` | `string \| null`      | yes      | Part-of-speech tag from the PDF (e.g. `"n"`, `"v"`, `"adj"`). Lowercased. `null` if absent.       |
| `phonetic`     | `string \| null`      | yes      | IPA phonetic transcription (e.g. `"/əˈnɪməl/"`). `null` if absent in the PDF.                     |
| `meaning`      | `string`              | yes      | Vietnamese gloss. Non-empty trimmed string (Vietnamese is reliably present in topic books).       |
| `category`     | `string`              | yes      | Topic heading from the PDF, stored exactly as it appears. Falls back to `"Uncategorized"` if no heading has been encountered yet. |
| `session`      | `number` (integer)    | yes      | Session number 1–32 assigned by sequential block distribution.                                    |

**Notes:**
- Field order in JSON output matches the table order above for stable diffs.
- All optional fields use `null` (not `undefined`, not missing keys) so every entry has an identical schema.
- `category` is never `null` (per SC-003 and the clarified fallback rule).

#### Validation rules

| Rule       | Statement                                                                                              | Source     |
|------------|--------------------------------------------------------------------------------------------------------|------------|
| `V-ID-1`   | `id` is a positive integer, unique, and the array is sorted by `id` ascending.                          | FR-003     |
| `V-STT-1`  | `stt`, if a number, is a positive integer.                                                              | FR-003     |
| `V-WD-1`   | `word` is a non-empty, trimmed string.                                                                  | SC-002     |
| `V-POS-1`  | `partOfSpeech`, if a string, is lowercased and trimmed; empty strings normalized to `null`.             | (style)    |
| `V-PH-1`   | `phonetic`, if a string, is trimmed; empty strings normalized to `null`.                                | (style)    |
| `V-MN-1`   | `meaning` is a non-empty, trimmed string.                                                               | FR-003     |
| `V-CT-1`   | `category` is a non-null, non-empty trimmed string (defaults to `"Uncategorized"` when no heading seen yet). | SC-003 + clarification 2026-05-28 |
| `V-SE-1`   | `session` ∈ `{1, 2, …, 32}` (integer).                                                                   | SC-004     |
| `V-SE-2`   | Across all entries, every session number 1–32 appears at least once.                                     | SC-005     |
| `V-SE-3`   | `max(session_size) - min(session_size) ≤ 1`.                                                             | SC-005     |
| `V-CNT-1`  | Total entry count is in `[900, 1050]`.                                                                   | SC-001     |
| `V-CAT-2`  | At least 2 distinct `category` values appear.                                                            | SC-007     |
| `V-SC-1`   | Every entry has exactly the eight keys above, in the canonical order.                                    | AC-1 (US1) |

#### Lifecycle / state transitions

`TopicVocabEntry` has **no runtime state**; it is a frozen record produced once by the script and read thereafter. There are no transitions. If the PDF is ever re-extracted, the entire JSON file is regenerated atomically.

---

## Relationships

This feature defines exactly one entity. No relationships to other persistent entities.

- The `category` field is a denormalized string. There is no separate `Category` entity in this feature — same rationale as the `session` field on the 500-words entity. Future features that need rich category metadata (icons, ordering, localization) can introduce a `Category` entity separately and join by string match.
- The `session` field aligns with the 32-session structure shared by `500-common-words.json`. The two datasets are independent arrays; a future "Session N" view would union entries from both files by filtering on `session === N`.

---

## TypeScript type (target shape at `src/types/topic-vocabulary.ts`)

```ts
export interface TopicVocabEntry {
  id: number;
  stt: number | null;
  word: string;
  partOfSpeech: string | null;
  phonetic: string | null;
  meaning: string;
  category: string;
  session: number; // 1..32
}
```

The script narrows internally where useful (e.g. validating `session` as an integer 1..32) but the exported type uses plain `number` for ergonomic consumption.
