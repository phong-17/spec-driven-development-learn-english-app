# Phase 1 Component Contracts: Ms. Huong Lesson Browser

The feature exposes no network APIs. Its "contracts" are the React component prop interfaces and the page route. All components are Server Components unless noted. Imports use the `@/*` → `./src/*` alias.

---

## Route: `/lessons` (`src/app/lessons/page.tsx`)

- **Type**: Server Component (default export `LessonsPage`)
- **Props**: none
- **Renders**: page chrome identical in pattern to `/vocabulary/1000`:
  - fixed `theme.gif` background div (`pointer-events-none fixed inset-0 z-0 opacity-19`, `backgroundSize: "250px"`, repeat)
  - `<NavigationMenu links={HOME_NAV_LINKS} />` sidebar (imported from `@/features/home/components/NavigationMenu` + `@/features/home/content`)
  - `<main>` with breadcrumb `> ~/learn-english/lessons`, `<h1>` "MS. HUONG LESSONS" (monospace, uppercase, tracking-widest)
  - in order: `<CoursePartsOverview />`, `<LessonSessionList />`, `<ChallengeList />`
- **Data**: imports `ms-huong-lessons.json` and passes typed slices down, OR each section imports the JSON itself. **Decision**: `page.tsx` imports the JSON once (cast to `LessonsData`) and passes the relevant slice to each section as props (keeps sections pure/presentational and testable).

---

## `CoursePartsOverview` (`src/features/lessons/components/CoursePartsOverview.tsx`)

- **Type**: Server Component
- **Props**: `{ parts: ReadonlyArray<CoursePart> }`
- **Behavior**: renders a labeled block listing all 5 parts as `[ PART N ]  <vi>  ——  <en>`; Part 1 carries a sub-label marking it as the foundational pre-lesson content covered by the lessons below. Dashed borders, accent for part numbers.
- **Acceptance**: all 5 parts visible with both vi + en (SC-004); Part 1 visibly flagged as foundational (US2 scenario 2).

## `LessonSessionList` (`src/features/lessons/components/LessonSessionList.tsx`)

- **Type**: Server Component
- **Props**: `{ lessons: ReadonlyArray<LessonEntry> }`
- **Behavior**: renders all 16 lessons, each as a group showing: `LESSON N`, `title`, `soundFocus` (IPA), and the two day chips `[ Day {sessions[0]} ]` `[ Day {sessions[1]} ]`. All groups rendered at once (no dropdown). Responsive: comfortable on desktop, stacks without horizontal scroll at 375 px.
- **Acceptance**: 32 sessions visible simultaneously, grouped into 16 lessons (US1 scenario 1, SC-001); each entry shows day label + lesson number + title + sound focus (US1 scenario 2); titles/sound focuses accurate (SC-002).

## `ChallengeSection` (`src/features/lessons/components/ChallengeSection.tsx`)

- **Type**: Server Component (renders `SpeakButton` client islands)
- **Props**: `{ challenge: ChallengeEntry }`
- **Behavior**: renders one challenge as a heading `── CHALLENGE {n}: {titleVi} ({titleEn}) ──` followed by its word rows. Each row: ordinal, word (bold), IPA phonetic, and `<SpeakButton word={word} />`. No horizontal scroll at 375 px (rows wrap/stack).
- **Acceptance**: correct word + IPA + SpeakButton per row (US3 scenarios 1–3, SC-003); SpeakButton pronounces word (US3 scenario 4, SC-008).

## `ChallengeList` (`src/features/lessons/components/ChallengeList.tsx`)

- **Type**: Server Component
- **Props**: `{ challenges: ReadonlyArray<ChallengeEntry>; advanced: AdvancedSection }`
- **Behavior**: renders an intro/section heading then one `<ChallengeSection>` per challenge (3 total), followed by the `advanced` acknowledgement note block (`[ ADVANCED PRONUNCIATION ]` + vi description + page range).
- **Acceptance**: all 3 challenges rendered in order (SC-003); advanced section name visible (SC-007, US edge case).

---

## Reused (imported, not created)

- `SpeakButton` — `@/features/vocabulary-500/components/SpeakButton` — props `{ word: string }`, `"use client"`, Web Speech API. Used inside `ChallengeSection`.
- `NavigationMenu` — `@/features/home/components/NavigationMenu` — props `{ links }`. Used in `page.tsx`.
- `HOME_NAV_LINKS` — `@/features/home/content`. Passed to `NavigationMenu`.
- `ROUTE_LESSONS` — `@/utils/route-path` — already `"/lessons"`; no new constant needed.
