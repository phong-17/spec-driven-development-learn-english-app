# Phase 1 Data Model: 500 Common Words — Session Browser

**Feature**: 004-vocab-500-sessions
**Date**: 2026-05-28

This feature has no database and no API. The "data model" here describes (a) the existing JSON dataset shape, (b) the in-memory representation used at runtime, and (c) the UI state shape.

---

## D-001: Source dataset

**Path**: `src/data/vocabulary/500-common-words.json`

**Shape**: `VocabularyEntry[]` (defined in `src/types/vocabulary.ts` — reused unchanged).

```ts
interface VocabularyEntry {
  id: number;
  frequency: number | null;   // rank from original PDF (may be null for a few entries)
  word: string;
  meaning: string | null;     // Vietnamese gloss
  partOfSpeech: string | null;       // English part-of-speech label
  viPartOfSpeech: string | null;     // Vietnamese part-of-speech label
  phonetic: string | null;           // IPA, e.g. "/ðə/"
  example: string | null;            // English example sentence(s)
  viExample: string | null;          // Vietnamese translation of example
  session: number;                   // 1..32
}
```

**Volume**: ~455 entries, 32 sessions, ~14–15 entries per session.

**Invariants** (relied upon by this feature, sourced from the existing PDF parse output):
- Every entry has a non-null integer `session` in `[1, 32]`.
- Every entry has a unique `id`.
- `frequency` may be `null` for a small number of entries (see memory `mingology_pdf_entry_count.md`).

---

## D-002: Grouped runtime structure

Computed once at module load (outside React render) by `src/features/vocabulary-500/lib/group-by-session.ts`:

```ts
type SessionId = number; // 1..32
type SessionGroups = Map<SessionId, VocabularyEntry[]>;

function groupBySession(entries: VocabularyEntry[]): SessionGroups;
```

**Sort order within each group**: ascending by `frequency` (nulls last), then ascending by `id` (stable tiebreaker).

**Session list for dropdown**: `Array.from(sessionGroups.keys()).sort((a, b) => a - b)` — produces `[1, 2, …, 32]`.

---

## D-003: Dropdown option model

Derived view of `SessionGroups` for the dropdown UI:

```ts
type SessionOption = {
  session: number;       // 1..32
  label: string;         // "Day 1", "Day 32"
  count: number;         // number of words in this session (informational, optional)
};
```

`label` formatting: `` `Day ${session}` ``.

---

## D-004: UI state

All state lives in `VocabularySessionBrowser` (Client Component):

| State | Type | Initial | Updates when |
|-------|------|---------|--------------|
| `selectedSession` | `number` | `1` | User picks an option from the dropdown |
| `expandedIds` | `Set<number>` | `new Set()` | User toggles `[ + ]`/`[ - ]` on a row/card; **cleared** whenever `selectedSession` changes |
| `isDropdownOpen` | `boolean` | `false` | User clicks the dropdown trigger; auto-closes on outside click, Esc, or selection |

`expandedIds` is managed by the custom hook `useExpandedRows(selectedSession)` — the hook resets the set whenever its dependency changes, encoding FR-007 declaratively.

---

## D-005: Derived render data

```ts
// Inside VocabularySessionBrowser, after state is read:
const sessionOptions: SessionOption[] = /* memoized */;
const currentEntries: VocabularyEntry[] = sessionGroups.get(selectedSession) ?? [];
```

`currentEntries` feeds both the desktop `WordTable` and the mobile `WordCardList` (only one is visible at a time via Tailwind responsive classes).

---

## D-006: No persistence

No write paths. `selectedSession` does not survive a page reload (per Assumptions in spec). No localStorage, no URL query param, no cookies.
