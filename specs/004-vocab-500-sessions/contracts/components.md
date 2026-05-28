# Phase 1 Component Contracts: 500 Common Words — Session Browser

**Feature**: 004-vocab-500-sessions
**Date**: 2026-05-28

This is a UI feature with no external API. The contracts here describe the **props interfaces** of new React components and the **module exports** of helpers. All inputs/outputs are documented so that downstream `/speckit-tasks` can decompose work cleanly.

---

## C-001: `VocabularySessionBrowser`

**Path**: `src/features/vocabulary-500/components/VocabularySessionBrowser.tsx`

**Type**: Client Component (`"use client"`).

**Props**: none.

**Contract**:

- Imports `500-common-words.json` and the `groupBySession` helper at module top.
- Owns three state pieces (`selectedSession`, `expandedIds`, `isDropdownOpen`) per `data-model.md` D-004.
- Renders, top-to-bottom:
  1. Page breadcrumb `> ~/learn-english/vocabulary/500` (accent color).
  2. `<h1>` "500 MOST COMMON WORDS" (monospace, uppercase, tracking-wider).
  3. `<SessionDropdown>` bound to `selectedSession`.
  4. `<WordTable>` (`hidden lg:block`) and `<WordCardList>` (`lg:hidden`) — both fed `currentEntries` and the same expand state.
- When `selectedSession` changes, `expandedIds` MUST be cleared (via `useExpandedRows`).

**Maps to**: FR-002, FR-003, FR-007, FR-009.

---

## C-002: `SessionDropdown`

**Path**: `src/features/vocabulary-500/components/SessionDropdown.tsx`

**Type**: Client Component.

**Props**:

```ts
type SessionDropdownProps = {
  options: ReadonlyArray<{ session: number; label: string; count?: number }>;
  selected: number;
  onChange: (session: number) => void;
};
```

**Contract**:

- Trigger button text: `` `[ ${label} ▾ ]` `` where `label` is the option matching `selected`.
- Trigger is a `<button>` with `aria-haspopup="listbox"`, `aria-expanded`, dashed border.
- Open/close animated via `motion/react` (`AnimatePresence`).
- Dropdown list rendered as `<ul role="listbox">`; each option is `<li role="option" aria-selected>` with bracket-style hover `▸ Day N`.
- Keyboard: `ArrowDown`/`ArrowUp` move focus within options when open; `Enter` selects the focused option; `Esc` closes; `Tab` closes and moves focus to the next element.
- Outside-click closes the dropdown.
- Calls `onChange(session)` exactly once per selection; closes itself afterwards.

**Maps to**: FR-001, FR-010.

---

## C-003: `WordTable`

**Path**: `src/features/vocabulary-500/components/WordTable.tsx`

**Type**: Client Component (receives state callbacks).

**Props**:

```ts
type WordTableProps = {
  entries: ReadonlyArray<VocabularyEntry>;
  isExpanded: (id: number) => boolean;
  onToggle: (id: number) => void;
};
```

**Contract**:

- Visible only at `lg` and above (`hidden lg:table`).
- Renders a `<table>` with a header row: `#`, `WORD`, `PHONETIC`, `POS (VI)`, `MEANING`, `EX.` (last column hosts the `[ + ]`/`[ - ]` toggle).
- Body delegates each entry to `<WordRow>` keyed by `entry.id`.
- Dashed borders between rows (`border-dashed border-foreground/20`); header has a dashed bottom border in accent color.
- If `entries.length === 0`, renders a single row: `[ NO WORDS FOUND ]`.

**Maps to**: FR-004, FR-005, FR-008, edge case "session has 0 words".

---

## C-004: `WordRow`

**Path**: `src/features/vocabulary-500/components/WordRow.tsx`

**Type**: Client Component.

**Props**:

```ts
type WordRowProps = {
  entry: VocabularyEntry;
  expanded: boolean;
  onToggle: () => void;
};
```

**Contract**:

- Renders a primary `<tr>` with cells: rank (`frequency` or `—`), word, phonetic, viPartOfSpeech, meaning, toggle button.
- Toggle button label: `[ + ]` when collapsed, `[ - ]` when expanded; `aria-expanded={expanded}`, `aria-controls={ex-${entry.id}}`.
- When `expanded`, renders a second `<tr>` (full-width single cell with `colSpan={6}`) containing the English `example` and Vietnamese `viExample`, animated via `motion.div` (`height: 0 → auto`).
- Null fields render an em-dash `—`.

**Maps to**: FR-004, FR-005, FR-006.

---

## C-005: `WordCardList`

**Path**: `src/features/vocabulary-500/components/WordCardList.tsx`

**Type**: Client Component.

**Props**: same shape as `WordTableProps`.

**Contract**:

- Visible only below `lg` (`lg:hidden`).
- Renders a `<ul>` of `<WordCard>` items, one per entry.
- If `entries.length === 0`, renders `[ NO WORDS FOUND ]`.

**Maps to**: FR-004, FR-008, mobile clarification (Q1 in spec).

---

## C-006: `WordCard`

**Path**: `src/features/vocabulary-500/components/WordCard.tsx`

**Type**: Client Component.

**Props**: same shape as `WordRowProps`.

**Contract**:

- Renders a `<li>` wrapped in a dashed-border block, monospace font.
- Top line: rank (left) + `[ + ]`/`[ - ]` toggle (right).
- Body lines stacked: word (bold, accent if desired), phonetic, viPartOfSpeech, meaning.
- Expanded section: same animation as `WordRow`; shows English example + Vietnamese example.

**Maps to**: FR-004, FR-005, FR-006, mobile clarification.

---

## C-007: `useExpandedRows` hook

**Path**: `src/features/vocabulary-500/hooks/useExpandedRows.ts`

**Signature**:

```ts
function useExpandedRows(resetKey: number): {
  isExpanded: (id: number) => boolean;
  toggle: (id: number) => void;
  clear: () => void;
};
```

**Contract**:

- Internal state: `Set<number>`.
- Whenever `resetKey` changes (e.g., new session selected), the set is cleared via an effect.
- `toggle(id)` flips membership.
- `isExpanded(id)` returns `set.has(id)`.

**Maps to**: FR-006, FR-007.

---

## C-008: `groupBySession` helper

**Path**: `src/features/vocabulary-500/lib/group-by-session.ts`

**Signature**:

```ts
export function groupBySession(
  entries: ReadonlyArray<VocabularyEntry>,
): Map<number, VocabularyEntry[]>;
```

**Contract**:

- Returns a `Map` keyed by `session` number.
- Each value array is sorted by `frequency` ascending (nulls last), tiebroken by `id` ascending.
- Pure function — input not mutated.

**Maps to**: data-model D-002.

---

## C-009: `app/vocabulary/500/page.tsx` (route shell)

**Path**: `src/app/vocabulary/500/page.tsx`

**Type**: Server Component, default export.

**Contract**:

- Renders the same page chrome as the home page: full-page background `<div>` with `theme.gif`, flex layout containing `<NavigationMenu links={HOME_NAV_LINKS} />`.
- The `<main>` slot renders `<VocabularySessionBrowser />`.
- No state; no data fetching; no client directives.

**Maps to**: FR-008, FR-009.

---

## Module exports

```ts
// src/features/vocabulary-500/lib/group-by-session.ts
export function groupBySession(
  entries: ReadonlyArray<VocabularyEntry>,
): Map<number, VocabularyEntry[]>;

// src/features/vocabulary-500/hooks/useExpandedRows.ts
export function useExpandedRows(resetKey: number): {
  isExpanded: (id: number) => boolean;
  toggle: (id: number) => void;
  clear: () => void;
};

// src/features/vocabulary-500/components/*
export { SessionDropdown };
export { WordTable };
export { WordRow };
export { WordCardList };
export { WordCard };
export { VocabularySessionBrowser };
```

No new route-path constants required — `ROUTE_VOCAB_500` already exists in `src/utils/route-path.ts`.
