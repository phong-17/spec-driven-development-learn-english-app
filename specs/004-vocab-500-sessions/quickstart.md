# Quickstart: 500 Common Words — Session Browser

**Feature**: 004-vocab-500-sessions
**Date**: 2026-05-28

This document gives a developer the shortest path from "checkout the branch" to "see the feature working" — and the manual checks that prove the spec is satisfied.

---

## 1. Prerequisites

- Repository checked out on branch `004-vocab-500-sessions`.
- Node + pnpm installed.
- `pnpm install` has been run.

The JSON dataset is already present at `src/data/vocabulary/500-common-words.json` (455 entries, sessions 1..32).

---

## 2. Run the app

```powershell
pnpm dev
```

Open <http://localhost:3000/vocabulary/500>.

---

## 3. Manual acceptance checks

These map 1:1 to the Acceptance Scenarios in `spec.md`.

### US1 — Browse Words by Session (P1)

1. Page loads → `[ Day 1 ▾ ]` trigger visible, word list shows the 15 entries for session 1, sorted by frequency.
2. Click `[ Day 1 ▾ ]` → dropdown opens with options `Day 1` through `Day 32`. Confirm all 32 are present.
3. Pick `Day 3` → trigger becomes `[ Day 3 ▾ ]`, word list updates to session 3's entries; no page reload (no flash).
4. Refresh the page → trigger resets to `[ Day 1 ▾ ]` (no persistence — per Assumptions).

### US2 — Read Word Details at a Glance (P2)

5. On any selected session, each entry shows 5 fields: rank, word, phonetic, Vietnamese POS, Vietnamese meaning.
6. Resize the window to ≥ 1024 px → the layout is a dashed-bordered table.
7. Resize the window to 375 px → the layout becomes a stack of dashed-bordered cards; no horizontal scrollbar appears.
8. Find an entry with a long meaning → the text wraps inside its cell/card (no silent truncation).

### US3 — View Example Sentence (P3)

9. Click `[ + ]` on any row/card → an inline section expands showing the English example and Vietnamese example. Button label becomes `[ - ]`.
10. Click `[ + ]` on a different row → both rows are now expanded simultaneously (FR-006).
11. Click `[ - ]` on the first expanded row → only that row collapses; the other stays open.
12. Change session from the dropdown → all expanded rows collapse (FR-007).

### Edge cases

13. Open DevTools, temporarily blank the JSON import (or break the file) → page renders the error fallback `[ ERROR: DATA UNAVAILABLE ]`. (Revert the change after testing.)
14. Tab through the page from the top → dropdown trigger is focusable, then each row's `[ + ]` toggle is focusable. `Enter` activates them. `Esc` closes the dropdown.

### Style sanity

15. Confirm no rounded corners, no shadows, no gradients, no `transition-*` utility other than `transition-colors` on this page.
16. All visible borders are dashed.
17. Font is the project's `VT323` monospace.

---

## 4. Where things live

| Concern | Path |
|---------|------|
| Page route | `src/app/vocabulary/500/page.tsx` |
| Feature components | `src/features/vocabulary-500/components/` |
| State hook | `src/features/vocabulary-500/hooks/useExpandedRows.ts` |
| Grouping helper | `src/features/vocabulary-500/lib/group-by-session.ts` |
| Dataset | `src/data/vocabulary/500-common-words.json` |
| Reused sidebar | `src/features/home/components/NavigationMenu.tsx` |
| Type | `src/types/vocabulary.ts` (`VocabularyEntry`) |

---

## 5. Done When

- All 16 manual checks above pass.
- `pnpm lint` is clean.
- `pnpm build` succeeds.
