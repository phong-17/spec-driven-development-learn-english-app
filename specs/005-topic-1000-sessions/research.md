# Phase 0 Research: 1000 Topic Words — Session Browser

**Feature**: 005-topic-1000-sessions
**Date**: 2026-05-29

All user-facing clarifications from `/speckit-clarify` are recorded in `spec.md` under `## Clarifications` (in-memory state only, full-width category separator rows, raw `stt`). The items below resolve **implementation-level** unknowns surfaced while filling the Technical Context, and document how this feature diverges from the already-shipped 500-words browser it mirrors.

---

## R-001: Where to load the JSON dataset

**Decision**: `import topicData from "@/data/vocabulary/1000-topic-words.json"` at module top in `TopicSessionBrowser.tsx`, cast to `TopicVocabEntry[]`.

**Rationale**:
- Bundled JSON is statically available; Next.js 16 supports JSON imports out of the box.
- The whole dataset (983 entries, < 250 KB) is needed client-side for instant session switching; no network round-trip.
- Aligns with the project's "no database, no fetching" stance for personal-app data (per CLAUDE.md).
- Identical approach to the shipped 500 browser (`R-001` of 004).

**Alternatives considered**: `fetch` from `public/` (extra round-trip, no type safety); Server Component reads file and serializes as prop (same payload, adds friction for a Client-interactive page). Both rejected.

---

## R-002: Page = Server Component shell vs. fully Client Component

**Decision**: Hybrid — `src/app/vocabulary/1000/page.tsx` is a Server Component rendering the background, `NavigationMenu`, breadcrumb, and `<h1>`, then mounting `<TopicSessionBrowser />` (Client Component) for the interactive area.

**Rationale**:
- Keeps the JSON import and React state inside a Client boundary.
- Server-rendered chrome gives faster FCP.
- Byte-for-byte mirrors the 500 page shell (`src/app/vocabulary/500/page.tsx`), so the two vocabulary pages stay visually consistent.

**Alternatives considered**: Whole page `"use client"` — ships more JS for static chrome. Rejected.

---

## R-003: Grouping strategy — precompute vs. compute on render

**Decision**: Precompute `Map<sessionNumber, TopicVocabEntry[]>` **once** at module scope (outside the component) using a pure helper `groupBySession`. Category sub-grouping (`groupByCategory`) is computed per render for the *currently selected* session only (one session = ~31 rows, trivial cost) and memoized with `useMemo`.

**Rationale**:
- The session `Map` is built once; lookup by session is O(1).
- Category grouping only ever runs over the ~31 visible rows, so per-render cost is negligible; memoizing on `selectedSession` avoids redundant work on unrelated re-renders.

**Alternatives considered**: Pre-grouping every session into categories up front — wasted work for 31 sessions the user never views. Re-grouping the full 983-row array on each change — needless O(n). Both rejected.

---

## R-004: Ordering within a session (and the `stt` reset)

**Decision**: Preserve the dataset's **original order** within each session (sort by `id` ascending, which already follows the source-book order). Do **not** sort by `stt`.

**Rationale**:
- `stt` is a per-category sequence number that **resets to 1 at the start of each category** (confirmed in the data; clarified in spec). Sorting a multi-category session by `stt` would interleave categories (two "1"s, two "2"s…), destroying the thematic grouping.
- Sorting by `id` keeps each category's words contiguous and in book order, so `groupByCategory` can walk the list once and emit category groups in first-appearance order with their `stt` runs intact.
- This is the divergence point from 004's `R-004` (which sorted by `frequency`); the topic dataset has no `frequency` field, and `stt` is category-relative, so original order is the correct learning order.

**Alternatives considered**: Sort by `stt` (interleaves categories — wrong); alphabetical by `word` (obscures the topical curriculum). Both rejected.

---

## R-005: Category section dividers

**Decision**: Render each category group with a leading full-width divider. Desktop: a `<tr>` containing a single `<td colSpan={5}>` styled as `── {category} ──`. Mobile: a full-width block element above that category's cards with the same text.

**Rationale**:
- Clarified choice (spec `## Clarifications`): full-width separator row spanning all 5 columns.
- A `colSpan` row keeps the divider inside the `<table>` so the column grid is never broken, and reads as a horizontal terminal divider — consistent with the ASCII aesthetic.
- The divider text uses the raw `category` value (e.g. `JOB - NGHỀ NGHIỆP`) wrapped in box-drawing dashes; no string reformatting needed.

**Alternatives considered**: Separate `<table>` per category (breaks column alignment across groups); inline badge on the first word only (clarification rejected this in favor of a separator row). Both rejected.

---

## R-006: Reuse vs. duplicate `SessionDropdown` and `SpeakButton`

**Decision**: **Reuse by import** from `@/features/vocabulary-500/components/`. `SessionDropdown` is already fully generic (`options` / `selected` / `onChange`, label `"Day N"`); `SpeakButton` takes only a `word` string. Neither needs modification.

**Rationale**:
- Avoids ~200 lines of duplicated, behavior-sensitive code (keyboard nav, outside-click, focus management in the dropdown).
- Both are purely presentational and dataset-agnostic.
- Lower risk than promoting them to `src/components/` now, which would require editing the shipped 500 feature's imports.

**Trade-off / future work**: Creates a `vocabulary-1000 → vocabulary-500` dependency edge, which is semantically backwards. A later refactor can promote both to `src/components/` (shared presentational UI per CLAUDE.md) and update both features' imports. Documented here so it is a conscious decision, not an accident.

**Alternatives considered**: Duplicate into `vocabulary-1000` (full independence, but 200 lines of drift-prone duplication); promote to shared now (correct end-state, but unrequested refactor with edits to working code). Deferred.

---

## R-007: No expand/collapse — dataset has no examples

**Decision**: Omit the `[ + ]`/`[ - ]` toggle, the expandable example section, and the `useExpandedRows` hook entirely. `TopicWordRow` / `TopicWordCard` are stateless presentational components.

**Rationale**:
- `TopicVocabEntry` has no `example` / `viExample` fields (see `src/types/topic-vocabulary.ts`); there is nothing to reveal.
- Spec FR-009 explicitly states there is no row-expand feature.
- This removes the only stateful child concern from the 500 design, simplifying the component tree (no per-row state, no reset-on-session-change hook).

---

## R-008: SpeakButton inclusion (parity decision)

**Decision**: Include `SpeakButton` (Web Speech API) next to each English word, mirroring the shipped 500 page, even though the 1000 spec does not explicitly require audio.

**Rationale**:
- The spec's Assumptions state the page should "mirror the 500 common words session page as closely as possible."
- The 500 page renders a speak button per word; including it keeps the two vocabulary pages consistent for the learner.
- It is a reused, dependency-free component — negligible cost.
- Noted explicitly so it is not mistaken for scope creep: it is a deliberate parity choice, not a new requirement.

---

## R-009: Mobile breakpoint for card vs. table switch

**Decision**: Use Tailwind's `lg` breakpoint (1024 px) — `< lg` shows the card list, `≥ lg` shows the table. Identical to the 500 browser.

**Rationale**:
- Matches the breakpoint `NavigationMenu` already uses for its sidebar/topbar switch, so the whole page flips to "desktop layout" at one consistent width.
- Five dashed-border columns in a monospace font fit comfortably at ≥ 1024 px; at 768 px they cramp.

**Alternatives considered**: `md` (768 px) — 5 columns too tight. Rejected.

---

## R-010: Animation policy

**Decision**:
- Dropdown open/close: inherited from the reused `SessionDropdown` (`motion.div`, `opacity`/`y`, `AnimatePresence`).
- No row-expand animation exists (no expand feature).
- No CSS `transition-*` utilities except `transition-colors` for hover state changes (per CLAUDE.md design rules).

**Rationale**: Consistent with the home and 500 pages' existing animation conventions; the feature introduces no new animated surfaces beyond the reused dropdown.

---

## Resolved NEEDS CLARIFICATION

| Source | Item | Resolution |
|--------|------|------------|
| spec.md Clarifications | Session selection state | In-memory only; no URL param, no persistence |
| spec.md Clarifications | Category header layout | Full-width separator row, `── CATEGORY ──`, `colSpan` all columns |
| spec.md Clarifications | `stt` display | Raw value from data (resets per category) |

No remaining NEEDS CLARIFICATION markers. Ready for Phase 1.
