# Phase 1 Component & Route Contracts: Vocabulary Practice Quiz

No network APIs. Contracts are the route, the route helper, and the React component prop interfaces. Imports use the `@/*` → `./src/*` alias. Components are Client Components unless noted.

---

## Route helper (`src/utils/route-path.ts`)

```ts
export const ROUTE_PRACTICE = "/practice" as const;
export function routePractice(source: PracticeSource, session: number): string {
  return `/practice/${source}/${session}`; // e.g. "/practice/500/5"
}
```

## Route: `/practice/[source]/[session]` (`src/app/practice/[source]/[session]/page.tsx`)

- **Type**: Server Component (default export). Next.js 16 — `params` is a Promise and MUST be awaited.
- **Params**: `{ source: string; session: string }`.
- **Behavior**:
  - `export function generateStaticParams()` → all valid `{ source, session }` pairs derived from both datasets' session groupings (≈ 64).
  - Validate `source ∈ {"500","1000"}` and `session` parses to an existing session number; otherwise render an error block (`[ SESSION NOT FOUND ]` + Link back to the vocabulary page).
  - Call `loadPracticeSession(source, sessionNum)` → `PracticeSessionData`.
  - Render the standard page chrome (fixed `theme.gif` background, `<NavigationMenu links={HOME_NAV_LINKS} />`, breadcrumb `> ~/learn-english/practice/{source}/{session}`, `<h1>` = `data.label` uppercased) and `<PracticeBrowser data={data} />`.
- **Acceptance**: US1 scenarios 1–3, SC-001/002.

## `loadPracticeSession` (`src/features/practice/lib/load-practice-session.ts`)

- **Type**: Server-usable pure module (imports the JSON).
- **Signature**: `loadPracticeSession(source: PracticeSource, session: number): PracticeSessionData`.
- **Behavior**: select dataset, `groupBySession`, take the session bucket, filter null meanings, map to `PracticeEntry[]`, build `label` (`Day {session} · {500|1000} Words`).

---

## `PracticeButton` (`src/features/practice/components/PracticeButton.tsx`)

- **Type**: Client Component (renders a `next/link` `Link`).
- **Props**: `{ source: PracticeSource; session: number }`.
- **Behavior**: renders `[ PRACTICE ▶ ]` styled as a bracket button (dashed border, accent on hover, `transition-colors`); `href={routePractice(source, session)}`.
- **Acceptance**: FR-001, SC-001. Placed in the existing SESSION row of both browsers.

## `PracticeBrowser` (`src/features/practice/components/PracticeBrowser.tsx`)

- **Type**: Client Component (`"use client"`).
- **Props**: `{ data: PracticeSessionData }`.
- **Behavior**: tab bar (`[ TYPE THE WORD ]` `[ CHOOSE MEANING ]` `[ FLASH CARDS ]`, active = accent — same pattern as `LessonsBrowser`); default tab = `type`; renders the active exercise, keyed by tab+session so switching tabs restarts cleanly. Empty-entries → `[ NO WORDS IN THIS SESSION ]`.
- **Acceptance**: FR-004; US2/US3/US4 entry; SC-003.

## `TerminalInput` (`src/features/practice/components/TerminalInput.tsx`)

- **Type**: Client Component.
- **Props**: `{ value: string; onChange: (v: string) => void; onSubmit: () => void; disabled?: boolean; autoFocus?: boolean }`.
- **Behavior**: monospace `> ` prompt + `<input>` with dashed border, transparent bg, accent `caret-color`; Enter calls `onSubmit`; auto-focuses on mount and when re-enabled. No submit button (FR-005, clarified Enter-only).

## `TypeTheWord` (`src/features/practice/components/TypeTheWord.tsx`)

- **Type**: Client Component.
- **Props**: `{ entries: PracticeEntry[] }`.
- **Behavior**: shuffle on mount (`useQuizProgress`); show `partOfSpeech` + Vietnamese `meaning` prompt + `<TerminalInput>`; Enter submits → evaluate (trim + case-insensitive, FR-006) → `revealed` phase showing `[ CORRECT ]` or `[ WRONG ] → "word"` (+ `SpeakButton`); Enter again or `[ NEXT → ]` advances (FR-013); a `[ SKIP ]` action marks skipped; end → `<QuizSummary>`.
- **Acceptance**: US2 scenarios 1–5; SC-004/006/007.

## `ChooseTheMeaning` (`src/features/practice/components/ChooseTheMeaning.tsx`)

- **Type**: Client Component.
- **Props**: `{ entries: PracticeEntry[] }`.
- **Behavior**: shuffle on mount; per question build a `MeaningChoice` via `buildChoices` (correct + ≤3 same-session distractors, FR-009); show English `word` (+ `SpeakButton`) and the options as bracket buttons; click → highlight correct/wrong + reveal (FR-007); `[ NEXT → ]` advances (FR-013); end → `<QuizSummary>`. < 4 entries → fewer options, no crash.
- **Acceptance**: US3 scenarios 1–4.

## `FlashCards` (`src/features/practice/components/FlashCards.tsx`)

- **Type**: Client Component.
- **Props**: `{ entries: PracticeEntry[] }`.
- **Behavior**: shuffle on mount; front = Vietnamese `meaning`; flip (motion) → back = `word` + `phonetic` (if any) + `example` (if any) + `SpeakButton`; `[ KNOWN ]` / `[ UNKNOWN ]` advance and queue unknowns for a second pass (FR-010); end → summary with known/unknown counts.
- **Acceptance**: US4 scenarios 1–4.

## `QuizSummary` (`src/features/practice/components/QuizSummary.tsx`)

- **Type**: Client Component.
- **Props**: `{ correct: number; wrong: number; total: number; elapsedMs: number; onRestart: () => void }`.
- **Behavior**: ASCII summary box — `[ SESSION COMPLETE ]`, correct/wrong/total, elapsed time (mm:ss), `[ RESTART ]` button. For flash cards, "correct/wrong" labels read as "known/unknown".
- **Acceptance**: FR-008, SC-007.

## `useQuizProgress` (`src/features/practice/hooks/useQuizProgress.ts`)

- **Type**: Client hook.
- **Signature**: `useQuizProgress(entries: PracticeEntry[]) → { current, index, total, phase, correct, wrong, submit(isCorrect), skip(), next(), restart(), elapsedMs, finished }`.
- **Behavior**: holds shuffled order (mount effect), index, `phase: "answering"|"revealed"`, counts, start time; `next()` advances or finishes.

---

## Edits to existing components

- **`VocabularySessionBrowser.tsx`** (vocabulary-500): add `<PracticeButton source="500" session={selectedSession} />` into the existing SESSION `<div className="flex flex-wrap items-center gap-3">` row.
- **`TopicSessionBrowser.tsx`** (vocabulary-1000): add `<PracticeButton source="1000" session={selectedSession} />` into its SESSION row.

## Reused (imported, not created)

- `SpeakButton` — `@/features/vocabulary-500/components/SpeakButton` — `{ word }`.
- `groupBySession` — each dataset's existing `lib/group-by-session`.
- `NavigationMenu` + `HOME_NAV_LINKS` — page chrome.
