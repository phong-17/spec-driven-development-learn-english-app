# Quickstart: 1000 Topic Words — Session Browser

**Feature**: 005-topic-1000-sessions
**Date**: 2026-05-29

This document gives a developer the shortest path from "checkout the branch" to "see the feature working" — and the manual checks that prove the spec is satisfied.

---

## 1. Prerequisites

- Repository checked out on branch `005-topic-1000-sessions`.
- Node + pnpm installed.
- `pnpm install` has been run.

The JSON dataset is already present at `src/data/vocabulary/1000-topic-words.json` (983 entries, sessions 1..32, 27 categories).

---

## 2. Run the app

```powershell
pnpm dev
```

Open <http://localhost:3000/vocabulary/1000>.

---

## 3. Manual acceptance checks

These map 1:1 to the Acceptance Scenarios in `spec.md`.

### US1 — Browse Words by Session (P1)

1. Page loads → `[ Day 1 ▾ ]` trigger visible; word list shows session 1's ~31 entries under the `── JOB - NGHỀ NGHIỆP ──` heading (then `── FRUIT - TRÁI CÂY ──`).
2. Click `[ Day 1 ▾ ]` → dropdown opens with options `Day 1` through `Day 32`. Confirm all 32 are present.
3. Pick `Day 3` → trigger becomes `[ Day 3 ▾ ]`; word list updates to session 3's entries; no page reload (no flash).
4. Refresh the page → trigger resets to `[ Day 1 ▾ ]` (no persistence, no `?session=` in the URL — per spec Clarification).

### US2 — Topic Category Context Per Session (P2)

5. Select `Day 5` → three category dividers appear in order: `── ANIMAL - ĐỘNG VẬT ──`, `── COLOR - MÀU SẮC ──`, `── BODY PART - BỘ PHẬN CƠ THỂ ──`, each followed by its words.
6. Select `Day 4` → a single category divider (`── ANIMAL - ĐỘNG VẬT ──`) above all words.
7. Count the rows for any session → total is 30 or 31 words (matches the dataset).

### US3 — Read Word Details at a Glance (P3)

8. On any selected session, each entry shows 5 fields: `stt`, word, phonetic, part of speech, Vietnamese meaning.
9. Confirm `stt` restarts at 1 at the top of each new category divider within a multi-category session (raw value — per spec Clarification).
10. Resize the window to ≥ 1024 px → layout is a dashed-bordered table with full-width category divider rows.
11. Resize the window to 375 px → layout becomes stacked dashed-bordered cards grouped under category headings; no horizontal scrollbar.
12. Find an entry with a long meaning → text wraps inside its cell/card (no silent truncation).

### Edge cases

13. Click the `▶` speak button next to a word → the browser pronounces it (Web Speech API; parity with the 500 page).
14. Temporarily break the JSON import → page renders `[ ERROR: DATA UNAVAILABLE ]`. (Revert after testing.)
15. Tab from the top → the dropdown trigger is focusable; `Enter`/`Space` opens it; arrows move between days; `Enter` selects; `Esc` closes.

### Style sanity

16. No rounded corners, no shadows, no gradients; no `transition-*` utility other than `transition-colors`.
17. All visible borders are dashed; category dividers use box-drawing dashes `──`.
18. Font is the project's `VT323` monospace; page chrome (background, sidebar, breadcrumb) matches `/vocabulary/500`.

---

## 4. Where things live

| Concern | Path |
|---------|------|
| Page route | `src/app/vocabulary/1000/page.tsx` |
| Feature components | `src/features/vocabulary-1000/components/` |
| Session grouping helper | `src/features/vocabulary-1000/lib/group-by-session.ts` |
| Category grouping helper | `src/features/vocabulary-1000/lib/group-by-category.ts` |
| Dataset | `src/data/vocabulary/1000-topic-words.json` |
| Reused dropdown | `src/features/vocabulary-500/components/SessionDropdown.tsx` |
| Reused speak button | `src/features/vocabulary-500/components/SpeakButton.tsx` |
| Reused sidebar | `src/features/home/components/NavigationMenu.tsx` |
| Type | `src/types/topic-vocabulary.ts` (`TopicVocabEntry`) |

---

## 5. Done When

- All 18 manual checks above pass.
- `pnpm lint` is clean.
- `pnpm build` succeeds.
