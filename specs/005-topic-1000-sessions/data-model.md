# Phase 1 Data Model: 1000 Topic Words — Session Browser

**Feature**: 005-topic-1000-sessions
**Date**: 2026-05-29

This feature has no database and no API. The "data model" here describes (a) the existing JSON dataset shape, (b) the in-memory representations used at runtime, and (c) the UI state shape.

---

## D-001: Source dataset

**Path**: `src/data/vocabulary/1000-topic-words.json`

**Shape**: `TopicVocabEntry[]` (defined in `src/types/topic-vocabulary.ts` — reused unchanged).

```ts
interface TopicVocabEntry {
  id: number;
  stt: number | null;        // sequence number WITHIN a category (resets to 1 per category)
  word: string;
  partOfSpeech: string | null; // e.g. "n", "v", "adj"
  phonetic: string | null;     // IPA, e.g. "/əˈkaʊn.t̬ənt/"
  meaning: string;             // Vietnamese gloss (non-null in this dataset)
  category: string;            // topic group, "ENGLISH - VIETNAMESE", e.g. "JOB - NGHỀ NGHIỆP"
  session: number;             // 1..32
}
```

**Volume**: 983 entries, 32 sessions, 30–31 entries per session, 27 distinct categories.

**Invariants** (relied upon by this feature, observed in the parsed dataset):
- Every entry has a non-null integer `session` in `[1, 32]`.
- Every entry has a unique `id`.
- Within a session, all entries of a given `category` are contiguous when ordered by `id` (source-book order).
- A session contains words from 1 to 3 categories.
- `stt` resets to 1 at the start of each category; it is **not** unique within a session.

---

## D-002: Grouped-by-session runtime structure

Computed once at module load (outside React render) by `src/features/vocabulary-1000/lib/group-by-session.ts`:

```ts
type SessionId = number; // 1..32
type SessionGroups = Map<SessionId, TopicVocabEntry[]>;

function groupBySession(entries: ReadonlyArray<TopicVocabEntry>): SessionGroups;
```

**Order within each group**: ascending by `id` (preserves source-book order, keeps categories contiguous and `stt` runs intact). **No** sort by `stt` or `frequency` (see research R-004).

**Session list for dropdown**: `Array.from(sessionGroups.keys()).sort((a, b) => a - b)` → `[1, 2, …, 32]`.

---

## D-003: Grouped-by-category runtime structure

Computed per selected session (memoized on `selectedSession`) by `src/features/vocabulary-1000/lib/group-by-category.ts`:

```ts
type CategoryGroup = {
  category: string;            // raw category value, e.g. "JOB - NGHỀ NGHIỆP"
  words: TopicVocabEntry[];    // entries of this category, in id order
};

function groupByCategory(entries: ReadonlyArray<TopicVocabEntry>): CategoryGroup[];
```

**Behavior**:
- Walks the (already id-ordered) entries once, starting a new group whenever `category` changes from the previous entry.
- Emits groups in **first-appearance order**, preserving the curriculum sequence.
- Because same-category entries are contiguous, this is a single linear pass (no map/dedup needed).

---

## D-004: Dropdown option model

Derived view for the reused `SessionDropdown` UI:

```ts
type SessionOption = {
  session: number;   // 1..32
  label: string;     // "Day 1" … "Day 32"
  count?: number;    // number of words in this session (informational)
};
```

`label` formatting: `` `Day ${session}` ``.

---

## D-005: UI state

All state lives in `TopicSessionBrowser` (Client Component):

| State | Type | Initial | Updates when |
|-------|------|---------|--------------|
| `selectedSession` | `number` | `sortedSessions[0] ?? 1` | User picks an option from the dropdown |

There is **no** per-row expand state and **no** `useExpandedRows` hook — the topic dataset has no example sentences, so rows are not expandable (research R-007). The dropdown's open/closed state is encapsulated inside the reused `SessionDropdown` component.

---

## D-006: Derived render data

```ts
// Inside TopicSessionBrowser, after state is read:
const sessionOptions: SessionOption[] = /* memoized, [] deps */;
const currentEntries: TopicVocabEntry[] = sessionGroups.get(selectedSession) ?? [];
const categoryGroups: CategoryGroup[] = /* useMemo on selectedSession */ groupByCategory(currentEntries);
```

`categoryGroups` feeds both the desktop `TopicWordTable` and the mobile `TopicWordCardList` (only one is visible at a time via Tailwind responsive classes `hidden lg:table` / `lg:hidden`).

---

## D-007: Error / empty states

- **Load failure** (JSON import throws during grouping): `TopicSessionBrowser` catches at module scope and renders `[ ERROR: DATA UNAVAILABLE ]` (mirrors 500 browser).
- **Empty session** (`currentEntries.length === 0`): the table / card list renders `[ NO WORDS FOUND ]`.

---

## D-008: No persistence

No write paths. `selectedSession` does not survive a page reload (per spec Assumptions and the `/speckit-clarify` decision). No localStorage, no URL query param, no cookies.
