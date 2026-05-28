# Tasks: Home Page

**Input**: Design documents from `/specs/003-home-page/`

**Prerequisites**: plan.md ✓ · spec.md ✓ · research.md ✓ · data-model.md ✓ · contracts/components.md ✓

**Tests**: Not requested — manual browser verification only (see quickstart.md).

**Organization**: Tasks grouped by user story; each story is an independently deliverable increment.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no shared dependencies)
- **[Story]**: User story this task belongs to ([US1], [US2], [US3])

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Wire up the route constants that all components depend on.

- [X] T001 Add `ROUTE_LESSONS`, `ROUTE_VOCAB_500`, `ROUTE_VOCAB_1000` string constants to `src/utils/route-path.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create the static content module and placeholder destination routes before any component work begins.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T002 [P] Create `src/features/home/content.ts` — export `HOME_NAV_LINKS` (3-item array using T001 constants), `HOME_HERO` (eyebrow/title/tagline), `HOME_SECTIONS` (3-item array with id/title/description per data-model.md)
- [X] T003 [P] Create placeholder page `src/app/lessons/page.tsx` — ASCII-style `<h1>Lessons</h1>` + "Coming soon." body, dark background, monospace font
- [X] T004 [P] Create placeholder page `src/app/vocabulary/500/page.tsx` — same pattern as T003 for "500 Most Common Words"
- [X] T005 [P] Create placeholder page `src/app/vocabulary/1000/page.tsx` — same pattern as T003 for "1000 Topic Vocabulary"

**Checkpoint**: `pnpm dev` starts clean; visiting `/lessons`, `/vocabulary/500`, `/vocabulary/1000` each render their placeholder page without 404.

---

## Phase 3: User Story 1 — Browse Site Entry Point (Priority: P1) 🎯 MVP

**Goal**: The home page at `/` loads with a navigation bar, hero section, and three content sections; clicking each nav item navigates to its dedicated route.

**Independent Test**: Load `/` — the hero section, navigation bar with 3 items, and all three content-section cards are visible. Clicking "Lessons" goes to `/lessons`, "500 Most Common Words" goes to `/vocabulary/500`, "1000 Topic Vocabulary" goes to `/vocabulary/1000` — no console errors.

### Implementation

- [X] T006 [P] [US1] Create `NavigationMenu` component in `src/features/home/components/NavigationMenu.tsx` — accepts `links: ReadonlyArray<{label: string; href: string}>`, renders `<nav aria-label="Primary">` with one `next/link` per item, horizontal row layout with `│` separators
- [X] T007 [P] [US1] Create `HeroSection` component in `src/features/home/components/HeroSection.tsx` — accepts `eyebrow`, `title`, `tagline` props; renders eyebrow in accent color, title in large monospace, box-drawing ASCII border frame around the title block, tagline below
- [X] T008 [P] [US1] Create `ContentSection` component in `src/features/home/components/ContentSection.tsx` — accepts `id`, `title`, `description` props; renders `<section id={id}>` with `<h2>` title + `<p>` description, 1px solid border (`border-foreground/20`), sharp corners, no buttons or links inside
- [X] T009 [US1] Replace `src/app/page.tsx` — import `NavigationMenu`, `HeroSection`, `ContentSection` and `HOME_NAV_LINKS`, `HOME_HERO`, `HOME_SECTIONS` from content.ts; render in order: NavigationMenu → HeroSection → ContentSection×3; root wrapper is `<main className="flex flex-col min-h-screen">` (depends on T002, T006, T007, T008)

**Checkpoint**: Load `/` — all 4 sections render top-to-bottom; 3 nav links navigate to their placeholder pages; no horizontal overflow at 1440px desktop.

---

## Phase 4: User Story 2 — Quick Content Discovery (Priority: P2)

**Goal**: Each of the three content sections shows short, prominent, readable descriptive text that immediately communicates what that study area covers.

**Independent Test**: At desktop viewport, each section title and description are visually prominent (title larger than body, description clearly legible, ≤ 2 sentences each, written in English).

### Implementation

- [X] T010 [US2] Audit `HOME_SECTIONS` copy in `src/features/home/content.ts` — confirm each `description` is ≤ 2 sentences, written in English, and communicates what the area covers; revise if needed (depends on T002)
- [X] T011 [US2] Enhance typography treatment in `src/features/home/components/ContentSection.tsx` — title styled with `text-accent` (accent color `#47B7F8`) or increased type scale to ensure visual hierarchy; description styled with adequate line-height for readability; verify no interactive elements are introduced (depends on T008)

**Checkpoint**: At 1440px viewport, each section title is visually distinct from the description; all three descriptions are legible at a glance.

---

## Phase 5: User Story 3 — Responsive Access on Any Device (Priority: P3)

**Goal**: The home page layout adapts cleanly from 320px to 1920px — no horizontal scroll, navigation remains accessible, sections stack properly on mobile.

**Independent Test**: Resize browser to 375px — all sections stack vertically, nav items remain accessible (stacked or reachable), text is legible, no horizontal scrollbar appears.

### Implementation

- [X] T012 [US3] Update `src/features/home/components/NavigationMenu.tsx` — nav items stack vertically on `< md` (768px); horizontal row with separators from `md:` up; use Tailwind `flex-col md:flex-row` (depends on T006)
- [X] T013 [P] [US3] Add overflow guard to root wrapper in `src/app/page.tsx` — add `overflow-x-hidden` to the main wrapper element; ensure `w-full` on all direct children (depends on T009)
- [X] T014 [P] [US3] Add responsive width constraints to `src/features/home/components/ContentSection.tsx` — wrap content in `max-w-screen-md w-full mx-auto px-4 md:px-8`; verify no content clips at 320px (depends on T008)
- [X] T015 [US3] Add responsive constraints to `src/features/home/components/HeroSection.tsx` — ensure box-drawing frame and title wrap cleanly at 320px (no overflow); use `w-full px-4 md:px-8` on the hero wrapper (depends on T007, T013)

**Checkpoint**: Manually test at 320, 375, 768, 1024, 1440, 1920px per quickstart.md section 2 — no horizontal scrollbar, all content visible, nav accessible on mobile.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final visual consistency pass, lint, and build validation.

- [X] T016 [P] Audit all home-page component files for design violations — confirm no `rounded-*` (except explicitly intended), no `shadow-*`, no `bg-gradient-*`, no `backdrop-blur-*` in any of: `NavigationMenu.tsx`, `HeroSection.tsx`, `ContentSection.tsx`, `app/page.tsx`
- [X] T017 [P] Verify dark/light mode both render correctly in `globals.css` — confirm `background: #111111`/`#ffffff` and `color: #ffffff`/`#111111` toggle correctly; accent `#47B7F8` visible in both modes
- [X] T018 Run `pnpm lint` from repo root — fix all ESLint and TypeScript errors (Note: 1 pre-existing error in `scripts/parse-1000-topic-words.ts` outside this feature; all home-page files lint clean)
- [X] T019 Run `pnpm build` from repo root — confirm clean Turbopack production build with no errors or type failures
- [ ] T020 Execute quickstart.md manual verification checklist — confirm all 5 done-criteria checkboxes pass (viewport checks, nav links, dark/light mode, lint, build)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (T001) — **BLOCKS all user stories**
- **US1 (Phase 3)**: Depends on Phase 2 complete (T002–T005)
- **US2 (Phase 4)**: Depends on US1 complete (T009) — content.ts and ContentSection must exist
- **US3 (Phase 5)**: Depends on US1 complete (T009) — components must exist to apply responsive styles
- **Polish (Phase 6)**: Depends on US1+US2+US3 complete

### User Story Dependencies

- **US1 (P1)**: After Phase 2 — no dependencies on US2/US3
- **US2 (P2)**: After US1 — refines content and typography of components US1 built
- **US3 (P3)**: After US1 — adds responsive behaviour to components US1 built

### Within Each User Story

- T006, T007, T008 are independent — create different component files → run in parallel
- T009 depends on T002, T006, T007, T008 all complete
- T010, T011 are sequential within US2 (T010 first — content must be finalized before typography is styled)
- T012, T013, T014 are independent within US3 (different files) → run in parallel; T015 depends on T007 and T013

---

## Parallel Execution Examples

### Phase 2 (all 4 tasks in parallel)

```
Task T002: src/features/home/content.ts
Task T003: src/app/lessons/page.tsx
Task T004: src/app/vocabulary/500/page.tsx
Task T005: src/app/vocabulary/1000/page.tsx
```

### Phase 3 — component tasks (T006, T007, T008 in parallel; T009 after all three)

```
Task T006: src/features/home/components/NavigationMenu.tsx
Task T007: src/features/home/components/HeroSection.tsx
Task T008: src/features/home/components/ContentSection.tsx
→ then T009: src/app/page.tsx
```

### Phase 5 — responsive tasks (T012, T013, T014 in parallel; T015 after T013)

```
Task T012: NavigationMenu.tsx (flex-col md:flex-row)
Task T013: app/page.tsx (overflow-x-hidden)
Task T014: ContentSection.tsx (max-w/padding)
→ then T015: HeroSection.tsx (depends on T013)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: T001
2. Complete Phase 2: T002–T005
3. Complete Phase 3: T006–T009
4. **STOP and VALIDATE**: Load `/`, check hero + nav + 3 sections render; click all 3 nav links; no 404s
5. Demo / commit if ready

### Incremental Delivery

1. Phase 1 + 2 → foundation ready, placeholder routes live
2. Phase 3 (US1) → home page structure live, nav working → commit
3. Phase 4 (US2) → section descriptions prominent → commit
4. Phase 5 (US3) → fully responsive → commit
5. Phase 6 → lint/build green → ready for PR

---

## Notes

- [P] tasks touch different files — assign concurrently when working solo or pair
- [Story] label maps each task to its acceptance test in spec.md
- No test files generated — verification is manual per quickstart.md
- The reference image (`follow-theme.jpeg`) is a design guide only — it must NOT be imported or rendered in any component
- Placeholder pages (T003–T005) are intentionally minimal — their only job is to prevent 404s when nav links are clicked
- `src/app/page.tsx` is a Server Component — do not add `"use client"` unless interactive animation is introduced
