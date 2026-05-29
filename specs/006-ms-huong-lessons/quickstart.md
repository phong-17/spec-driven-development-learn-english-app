# Quickstart: Ms. Huong Lesson Browser — Manual Acceptance Checks

**Prerequisite**: `pnpm dev` running; open `http://localhost:3000/lessons`.

Run the responsive checks at 4 viewport widths: **375, 768, 1024, 1440 px**.

## Page chrome

1. [ ] Breadcrumb reads `> ~/learn-english/lessons`.
2. [ ] Page title "MS. HUONG LESSONS" is visible (monospace, uppercase).
3. [ ] Shared navigation sidebar (`NavigationMenu`) is present, matching `/vocabulary/500` and `/vocabulary/1000`.
4. [ ] Terminal/ASCII aesthetic: dashed borders, sharp corners, no shadows/gradients, monospace font.

## US2 — Course structure overview

5. [ ] All **5 course parts** are listed with both Vietnamese and English names (SC-004).
6. [ ] Part 1 is visibly flagged as the foundational pre-lesson content (the lessons below belong to it).

## US1 — Lesson + session list

7. [ ] All **16 lessons** are shown, each with title and sound focus (IPA) (SC-002).
8. [ ] All **32 sessions** are visible simultaneously — no dropdown/selector needed (SC-001).
9. [ ] Sessions are grouped by lesson: each lesson shows its two day labels (e.g., Lesson 1 → `Day 1` / `Day 2`).
10. [ ] Lesson 1 = "Alphabets" (Day 1–2); Lesson 16 = "/tʃ/ and /dʒ/ Sounds" (Day 31–32).
11. [ ] Day numbers run 1..32 with no gaps or duplicates.

## US3 — Challenge word lists

12. [ ] **Challenge 1 — Đọc số**: 10 rows; first row `One /wʌn/`, last row `Ten /ten/`.
13. [ ] **Challenge 2 — Đọc từ khá giống nhau**: 8 rows (Like, Life, Line, Lime, Lie, Light, Liar, Lice) with IPA.
14. [ ] **Challenge 3 — Đọc từ phổ biến**: 24 rows; spot-check `Vegetable /ˈvedʒ.tə.bəl/`, `Island /ˈaɪ.lənd/`.
15. [ ] Each challenge word has a `▶` SpeakButton next to it.
16. [ ] Clicking a SpeakButton pronounces the English word aloud (Web Speech API) (SC-008).

## Edge / quality

17. [ ] IPA symbols render as real glyphs — no `□` replacement boxes anywhere (`/ʃ/`, `/ŋ/`, `/θ/`, `/ð/`, `/ʒ/`, `/dʒ/`, `/wʌn/`) (SC-006).
18. [ ] The **Advanced Pronunciation** section name is visible (note after the lessons/challenges) — not silently dropped (SC-007).
19. [ ] No horizontal scroll at 375, 768, 1024, 1440 px (SC-005).

## Build

20. [ ] `pnpm lint` passes for all new `src/features/lessons/` and `src/types/lesson.ts` files.
21. [ ] `pnpm build` succeeds and `/lessons` prerenders as static content (`○`).
