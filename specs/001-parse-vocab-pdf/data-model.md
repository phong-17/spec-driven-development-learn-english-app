# Phase 1 Data Model — Parse 500 Common English Words PDF to JSON

**Feature**: `001-parse-vocab-pdf` · **Date**: 2026-05-28

## Entities

### VocabularyEntry

Represents one extracted word from the PDF. This is the **only** entity in this feature and the unit consumed by all downstream vocabulary features.

| Field          | Type                  | Required | Description                                                                                       |
|----------------|-----------------------|----------|---------------------------------------------------------------------------------------------------|
| `id`           | `number` (integer)    | yes      | Sequential 1-based identifier reflecting PDF order. Stable across re-extractions.                |
| `word`         | `string`              | yes      | The English headword as it appears in the PDF. Trimmed; never empty.                              |
| `meaning`      | `string \| null`      | yes      | Vietnamese gloss. `null` only when the PDF row lacks a meaning (rare; logged by the script).      |
| `partOfSpeech` | `string \| null`      | yes      | E.g. `"n"`, `"v"`, `"adj"`, `"adv"`. Normalized to lowercase. `null` if absent in the PDF.        |
| `example`      | `string \| null`      | yes      | Example sentence if present in the PDF; otherwise `null`.                                         |
| `session`      | `number` (integer)    | yes      | Session number 1–32 assigned by sequential block distribution (see plan / research).             |

**Notes:**
- All optional fields use `null` (not `undefined`, not missing keys) so every entry has an identical schema — required by FR-003 and AC-3 of US2.
- Field order in JSON output matches the table order above for stable diffs.

#### Validation rules

| Rule       | Statement                                                                                              | Source     |
|------------|--------------------------------------------------------------------------------------------------------|------------|
| `V-ID-1`   | `id` is a positive integer, unique, and the array is sorted by `id` ascending.                          | FR-003     |
| `V-WD-1`   | `word` is a non-empty, trimmed string after extraction.                                                 | SC-002     |
| `V-WD-2`   | After case-insensitive comparison, no two entries share the same `word` (first occurrence wins).        | FR-007     |
| `V-MN-1`   | `meaning`, if a string, is trimmed; empty strings are normalized to `null`.                              | AC-3 (US2) |
| `V-POS-1`  | `partOfSpeech`, if a string, is lowercased.                                                              | (style)    |
| `V-SE-1`   | `session` ∈ `{1, 2, …, 32}` (integer).                                                                   | SC-003     |
| `V-SE-2`   | Across all entries, every session number 1–32 appears at least once.                                     | SC-005     |
| `V-SE-3`   | Each session contains between 10 and 20 entries inclusive (target 15–16).                                | SC-005     |
| `V-CT-1`   | Total entry count is in `[450, 500]` (source PDF actually contains 455 entries).                         | SC-001     |
| `V-SC-1`   | Every entry has exactly the six keys above — no missing, no extra.                                       | AC-1 (US2) |

#### Lifecycle / state transitions

VocabularyEntry has **no runtime state**; it is a frozen record produced once by the script and read thereafter. There are no transitions to model. If the PDF is ever re-extracted, the entire JSON file is regenerated atomically — entries are never updated in place.

---

## Relationships

This feature defines exactly one entity. No relationships.

The `session` field is a **denormalized foreign-key-like reference** to a logical session group (1–32). There is no separate `Session` entity in this feature (per spec, "Not a separate object — expressed as a field on each VocabularyEntry"). Future features that need session metadata (e.g. session titles, ordering across all 32 sessions) will introduce a `Session` entity separately.

---

## TypeScript type (target shape at `src/types/vocabulary.ts`)

```ts
export interface VocabularyEntry {
  id: number;
  word: string;
  meaning: string | null;
  partOfSpeech: string | null;
  example: string | null;
  session: number; // 1..32
}
```

The script will narrow this further internally (e.g. branding `session` as `1 | 2 | … | 32`) but the exported type uses plain `number` for ergonomic consumption.
