# Phase 0 Research: 500 Common Words — Session Browser

**Feature**: 004-vocab-500-sessions
**Date**: 2026-05-28

All clarifications from `/speckit-clarify` are recorded in `spec.md` under `## Clarifications`. The remaining research items below resolve **implementation-level** unknowns surfaced while filling the Technical Context.

---

## R-001: Where to load the JSON dataset

**Decision**: `import data from "@/data/vocabulary/500-common-words.json"` at module top in `VocabularySessionBrowser.tsx`.

**Rationale**:
- Bundled JSON is statically typed by TypeScript (Next.js 16 supports JSON imports out of the box).
- Tree-shaking is irrelevant here — we want the whole dataset client-side anyway (~455 entries, < 200 KB).
- No network round-trip; session switch is instant.
- Aligns with the project's "no database, no fetching" stance for personal-app data (per CLAUDE.md).

**Alternatives considered**:
- Fetch via `fetch('/data/vocabulary/...')` from `public/`: extra round-trip, no type safety, no benefit.
- Server Component reads file at build time and passes as prop: forces serialization; same payload anyway. Adds friction without value because the page must be a Client Component for interactivity.

---

## R-002: Page = Server Component shell vs. fully Client Component

**Decision**: Hybrid — the route file `src/app/vocabulary/500/page.tsx` is a Server Component that renders the page background and `NavigationMenu`, then mounts `<VocabularySessionBrowser />` (Client Component) for the interactive area.

**Rationale**:
- Keeps the JSON import and React state in a Client Component boundary.
- Allows the Server Component shell to render initial HTML for the chrome (faster FCP).
- Matches the home page architecture (`page.tsx` composes Server + Client children).

**Alternatives considered**:
- Whole page as `"use client"`: simpler but ships more JS upfront for static chrome that doesn't need it.

---

## R-003: Grouping strategy — precompute vs. compute on render

**Decision**: Precompute `Map<sessionNumber, VocabularyEntry[]>` **once** at module scope (outside the component) using a pure helper `groupBySession`.

**Rationale**:
- Dataset is immutable and module-scoped.
- Avoids re-grouping 500 entries on every render.
- `Map` lookup by session number is O(1).

**Alternatives considered**:
- `useMemo` inside component: equivalent runtime cost but adds a hook for static data.
- Re-filter array on every selection: O(n) per session change × 32 sessions = wasteful when O(1) is trivial.

---

## R-004: Sorting words within a session

**Decision**: Sort by `frequency` ascending (rare nulls pushed to end). Within the same frequency, stable order by `id` ascending.

**Rationale**:
- `frequency` is the natural "rank" the dataset is built on; learners expect to see word #1, #2, #3 in order.
- A small number of entries (per the existing `mingology_pdf_entry_count.md` memory) have `null` frequency — pushing them to the end avoids jarring `null` rows interrupting the rank sequence.

**Alternatives considered**:
- Sort by `id`: less meaningful; `id` is an extraction artifact, not a learning order.
- Alphabetical by `word`: not requested; would obscure the frequency-based curriculum.

---

## R-005: Dropdown component — build from scratch vs. use a library

**Decision**: Build a tiny custom dropdown from scratch in `SessionDropdown.tsx`. No external dependency.

**Rationale**:
- The dropdown needs only: a trigger button, a dropdown list, keyboard navigation (ArrowUp / ArrowDown / Enter / Esc), and an animated open/close. All of this is ~80 LOC.
- Existing toolbox (`motion/react` for animation, Tailwind for styling) is sufficient.
- Headless libraries (Radix, Headless UI) would bring conflicting default focus-ring styles that fight the dashed/ASCII aesthetic.
- The clarification explicitly chose "custom styled dropdown" over native `<select>` — implies bespoke implementation.

**Alternatives considered**:
- `@radix-ui/react-select`: ~30 KB gzipped, plus its DOM structure complicates ASCII styling.
- Native `<select>`: rejected during clarification.

---

## R-006: Per-row expand state shape

**Decision**: `useState<Set<number>>(new Set())` keyed by `VocabularyEntry.id`. Encapsulated in a small custom hook `useExpandedRows` that exposes `{ isExpanded, toggle, clear }` and is reset by the parent on session change.

**Rationale**:
- A `Set` avoids re-allocating an object map and gives O(1) `has` / `add` / `delete`.
- Multiple rows can be expanded concurrently (per FR-006).
- `clear()` called when the selected session changes (per FR-007).

**Alternatives considered**:
- Single `expandedId: number | null`: violates FR-006 (only one row expandable at a time).
- `Record<number, boolean>`: works but slightly more allocation per toggle.

---

## R-007: Mobile breakpoint for card vs. table switch

**Decision**: Use Tailwind's `lg` breakpoint (1024 px) as the cut-over — `< lg` shows the card list, `≥ lg` shows the table.

**Rationale**:
- Matches the existing breakpoint already used by `NavigationMenu` for the sidebar/topbar switch — keeps the entire page transitioning to "desktop layout" at the same width.
- Five dashed-border columns plus a `[+]` button fit comfortably at ≥ 1024 px in a monospace font; at 768 px (md) they cramp.

**Alternatives considered**:
- `md` (768 px): the 5-column table feels cramped here; learners would struggle to scan meanings.
- Custom breakpoint: avoid introducing new breakpoints when an existing one fits.

---

## R-008: Animation policy

**Decision**:
- Dropdown open/close: `motion.div` with `initial={{ opacity: 0, y: -4 }}` → `animate={{ opacity: 1, y: 0 }}`, `exit` reversed; `AnimatePresence` wrapper.
- Row expand: `motion.div` with `initial={{ height: 0, opacity: 0 }}` → `animate={{ height: "auto", opacity: 1 }}`; `AnimatePresence`.
- No CSS `transition-*` utilities except `transition-colors` for hover state changes (per CLAUDE.md design rules).

**Rationale**: Consistent with the home page's existing animation conventions (see `NavigationMenu.tsx`).

---

## Resolved NEEDS CLARIFICATION

| Source | Item | Resolution |
|--------|------|------------|
| spec.md Clarifications | Mobile layout | Card layout < lg, table ≥ lg |
| spec.md Clarifications | Dropdown style | Custom ASCII `[ Day N ▾ ]` with `motion/react` |
| spec.md Clarifications | Row expand trigger | Dedicated `[ + ]` / `[ - ]` button |

No remaining NEEDS CLARIFICATION markers. Ready for Phase 1.
