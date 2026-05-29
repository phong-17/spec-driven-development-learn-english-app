# Quickstart: Vocabulary Practice Quiz — Manual Acceptance Checks

**Prerequisite**: `pnpm dev` running. Test at viewport widths **375, 768, 1024, 1440 px**.

## US1 — Launch from vocabulary pages

1. [ ] On `/vocabulary/500`, the `[ PRACTICE ]` button is visible on the **same row** as the SESSION dropdown (no scroll) (SC-001).
2. [ ] On `/vocabulary/1000`, the `[ PRACTICE ]` button is likewise visible on the SESSION row.
3. [ ] Select Day 5 on `/vocabulary/500`, click `[ PRACTICE ]` → lands on `/practice/500/5`; heading shows "DAY 5 · 500 WORDS" (or equivalent); navigation feels instant (< 0.5 s, no full reload) (SC-002).
4. [ ] Select Day 12 on `/vocabulary/1000`, click `[ PRACTICE ]` → lands on `/practice/1000/12` with Day 12 words.
5. [ ] Open `/practice/500/5` directly in a fresh tab → loads correctly with no prior navigation (FR-011).
6. [ ] Open `/practice/500/999` (invalid) → shows `[ SESSION NOT FOUND ]` with a link back.

## US2 — Type the Word (core)

7. [ ] On the practice page, the **Type the Word** tab is active by default; the terminal input is auto-focused (cursor ready, no click needed) (SC-006).
8. [ ] A Vietnamese meaning prompt is shown above the `> ___` input.
9. [ ] Type the correct word, press **Enter** → `[ CORRECT ]` feedback appears; no submit button exists (Enter-only).
10. [ ] Press **Enter** again (or click `[ NEXT → ]`) → advances to the next word (manual advance, no auto-timer) (FR-013).
11. [ ] Type a wrong word, press Enter → `[ WRONG ] → "correctword"` is revealed before advancing.
12. [ ] Typing with different case / extra spaces (e.g. `  Apple ` for `apple`) is accepted as correct (FR-006).
13. [ ] Use `[ SKIP ]` on a word → it is counted as skipped and may reappear at the end.
14. [ ] After the last word → summary screen shows correct / wrong-or-skipped / total + elapsed time (SC-007).

## US3 — Choose the Meaning

15. [ ] Switch to **Choose the Meaning** tab → each question shows an English word + exactly 4 Vietnamese options (fewer only if the session has < 4 words).
16. [ ] Selecting the correct option highlights it as correct; selecting a wrong option highlights it and reveals the correct one (FR-007).
17. [ ] `[ NEXT → ]` advances; summary appears at the end.

## US4 — Flash Cards

18. [ ] Switch to **Flash Cards** tab → front shows the Vietnamese meaning.
19. [ ] Flip → back shows the English word, phonetic (if present), example (if present, 500 set only), and a `▶` SpeakButton; clicking ▶ pronounces the word.
20. [ ] `[ KNOWN ]` / `[ UNKNOWN ]` advance; unknown cards reappear in a second pass; summary shows known vs. unknown.

## Cross-cutting / build

21. [ ] All three tabs work for both datasets across several sessions (e.g. 500/1, 500/32, 1000/1, 1000/32) (SC-003).
22. [ ] No horizontal scroll at 375/768/1024/1440 px on the practice page (SC-005).
23. [ ] Refreshing mid-exercise resets progress (no persistence) (FR-012).
24. [ ] `pnpm lint` clean for all new `src/features/practice/`, `src/types/practice.ts`, route, and edited browser files.
25. [ ] `pnpm build` succeeds and `/practice/[source]/[session]` pages prerender as static (`○`).
