# Phase 1 Component Contracts: 1000 Topic Words — Session Browser

**Feature**: 005-topic-1000-sessions
**Date**: 2026-05-29

This is a UI feature with no external API. The contracts here describe the **props interfaces** of new React components and the **module exports** of helpers, so `/speckit-tasks` can decompose work cleanly. All new components live under `src/features/vocabulary-1000/`.

---

## C-001: `TopicSessionBrowser`

**Path**: `src/features/vocabulary-1000/components/TopicSessionBrowser.tsx`

**Type**: Client Component (`"use client"`).

**Props**: none.

**Contract**:

- Imports `1000-topic-words.json` and `groupBySession` at module top; builds `sessionGroups` once at module scope inside a `try/catch` (sets `loadError` on failure).
- Owns one state piece: `selectedSession: number` (initial `sortedSessions[0] ?? 1`).
- Memoizes `sessionOptions` (`[]` deps) and `categoryGroups = groupByCategory(currentEntries)` (deps `[selectedSession]`).
- Renders, top-to-bottom:
  1. A `SESSION:` label + `<SessionDropdown>` (reused) bound to `selectedSession` + a `({n} words)` count.
  2. `<TopicWordTable>` (`hidden lg:table`) and `<TopicWordCardList>` (`lg:hidden`), both fed `categoryGroups`.
- If `loadError`, renders `[ ERROR: DATA UNAVAILABLE ]` instead.
- No expand state, no `useExpandedRows`.

**Maps to**: FR-002, FR-003, FR-009; spec Clarification (in-memory state).

---

## C-002: `SessionDropdown` (REUSED — not new)

**Path**: `src/features/vocabulary-500/components/SessionDropdown.tsx` (imported, unchanged)

**Type**: Client Component.

**Props**:

```ts
type SessionDropdownProps = {
  options: ReadonlyArray<{ session: number; label: string; count?: number }>;
  selected: number;
  onChange: (session: number) => void;
};
```

**Contract** (already implemented & shipped):

- Trigger button: `` `[ ${label} ▾ ]` `` (▴ when open), dashed border, `aria-haspopup="listbox"`, `aria-expanded`.
- Open/close animated via `motion/react`.
- Options rendered as `<ul role="listbox">` / `<li role="option" aria-selected>`; selected option prefixed `▸`.
- Keyboard: ArrowUp/ArrowDown move focus, Home/End jump, Enter/Space select, Esc closes, Tab closes; outside-click closes.
- Calls `onChange(session)` once per selection, then closes and returns focus to the trigger.

**Maps to**: FR-001, FR-008.

---

## C-003: `TopicWordTable`

**Path**: `src/features/vocabulary-1000/components/TopicWordTable.tsx`

**Type**: Client Component (presentational).

**Props**:

```ts
type TopicWordTableProps = {
  groups: ReadonlyArray<CategoryGroup>;   // CategoryGroup = { category: string; words: TopicVocabEntry[] }
  className?: string;
};
```

**Contract**:

- Visible only at `lg` and above (`hidden lg:table`).
- Renders a `<table>` with a header row: `STT`, `WORD`, `PHONETIC`, `POS`, `MEANING` (5 columns).
- For each `CategoryGroup`, emits:
  1. A **full-width divider row**: `<tr><td colSpan={5}>── {category} ──</td></tr>`, accent-colored, dashed border — per spec Clarification.
  2. One `<TopicWordRow>` per word in the group, keyed by `entry.id`.
- Dashed borders between rows; header has a dashed bottom border in accent color.
- If `groups` is empty (no words for the session), renders a single `[ NO WORDS FOUND ]` row.

**Maps to**: FR-004, FR-005, edge case "session has 0 words".

---

## C-004: `TopicWordRow`

**Path**: `src/features/vocabulary-1000/components/TopicWordRow.tsx`

**Type**: Client Component (stateless presentational — needed for `SpeakButton`'s `"use client"` boundary).

**Props**:

```ts
type TopicWordRowProps = {
  entry: TopicVocabEntry;
};
```

**Contract**:

- Renders a single `<tr>` with 5 cells: `stt` (raw value or `—`), word (bold) + `<SpeakButton>`, phonetic, `partOfSpeech`, `meaning`.
- Null/blank fields render an em-dash `—`.
- No toggle button, no expandable section.

**Maps to**: FR-005; spec Clarification (raw `stt`).

---

## C-005: `TopicWordCardList`

**Path**: `src/features/vocabulary-1000/components/TopicWordCardList.tsx`

**Type**: Client Component (presentational).

**Props**: same shape as `TopicWordTableProps` (`groups`, `className`).

**Contract**:

- Visible only below `lg` (`lg:hidden`).
- For each `CategoryGroup`, renders a full-width category heading block (`── {category} ──`, dashed bottom border, accent) followed by a `<ul>` of `<TopicWordCard>` items.
- If `groups` is empty, renders `[ NO WORDS FOUND ]`.

**Maps to**: FR-004, FR-005; mobile responsive (SC-003).

---

## C-006: `TopicWordCard`

**Path**: `src/features/vocabulary-1000/components/TopicWordCard.tsx`

**Type**: Client Component (stateless presentational).

**Props**:

```ts
type TopicWordCardProps = {
  entry: TopicVocabEntry;
};
```

**Contract**:

- Renders a `<li>` in a dashed-border block, monospace font.
- Top line: `#{stt}` (left). Word line: word (bold) + `<SpeakButton>`. Then stacked: phonetic, `partOfSpeech`, `meaning`.
- Null/blank fields render `—`. Long `meaning` wraps (`break-words`). No toggle, no expand.

**Maps to**: FR-005; mobile responsive (SC-003).

---

## C-007: `SpeakButton` (REUSED — not new)

**Path**: `src/features/vocabulary-500/components/SpeakButton.tsx` (imported, unchanged)

**Props**: `{ word: string }`.

**Contract**: Renders a `▶` button that calls the Web Speech API to pronounce `word` (en-US). Dashed border, `transition-colors` hover. Included for parity with the 500 page (research R-008).

**Maps to**: parity (R-008); not a spec FR.

---

## C-008: `groupBySession` helper

**Path**: `src/features/vocabulary-1000/lib/group-by-session.ts`

**Signature**:

```ts
export function groupBySession(
  entries: ReadonlyArray<TopicVocabEntry>,
): Map<number, TopicVocabEntry[]>;
```

**Contract**:

- Returns a `Map` keyed by `session` number.
- Each value array is sorted by `id` ascending (preserves source order; keeps categories contiguous).
- Pure function — input not mutated.

**Maps to**: data-model D-002.

---

## C-009: `groupByCategory` helper

**Path**: `src/features/vocabulary-1000/lib/group-by-category.ts`

**Signature**:

```ts
export type CategoryGroup = {
  category: string;
  words: TopicVocabEntry[];
};

export function groupByCategory(
  entries: ReadonlyArray<TopicVocabEntry>,
): CategoryGroup[];
```

**Contract**:

- Single linear pass over `entries` (assumed id-ordered, so same-category entries are contiguous).
- Starts a new `CategoryGroup` whenever `category` differs from the previous entry.
- Preserves first-appearance order. Pure function — input not mutated.

**Maps to**: data-model D-003, FR-004.

---

## C-010: `app/vocabulary/1000/page.tsx` (route shell)

**Path**: `src/app/vocabulary/1000/page.tsx`

**Type**: Server Component, default export. **REPLACES** the current "Coming soon" placeholder.

**Contract**:

- Renders the same page chrome as the 500 page: fixed full-page background `<div>` with `theme.gif`, flex layout containing `<NavigationMenu links={HOME_NAV_LINKS} />`.
- `<main>` renders the breadcrumb `> ~/learn-english/vocabulary/1000`, an `<h1>` "1000 TOPIC WORDS" (monospace, uppercase, tracking-widest), and `<TopicSessionBrowser />`.
- No state; no data fetching; no client directives.

**Maps to**: FR-006, FR-007.

---

## Module exports

```ts
// src/features/vocabulary-1000/lib/group-by-session.ts
export function groupBySession(
  entries: ReadonlyArray<TopicVocabEntry>,
): Map<number, TopicVocabEntry[]>;

// src/features/vocabulary-1000/lib/group-by-category.ts
export type CategoryGroup = { category: string; words: TopicVocabEntry[] };
export function groupByCategory(
  entries: ReadonlyArray<TopicVocabEntry>,
): CategoryGroup[];

// src/features/vocabulary-1000/components/*
export { TopicSessionBrowser };
export { TopicWordTable };
export { TopicWordRow };
export { TopicWordCardList };
export { TopicWordCard };
```

Reused via import (no new exports):

```ts
import { SessionDropdown, type SessionOption } from "@/features/vocabulary-500/components/SessionDropdown";
import { SpeakButton } from "@/features/vocabulary-500/components/SpeakButton";
```

No new route-path constant required — `ROUTE_VOCAB_1000` already exists in `src/utils/route-path.ts`.
