# Phase 0 Research: Vocabulary Practice Quiz

All Technical Context fields were resolvable from the spec (clarifications already locked the advance + submit interactions) and the existing codebase. No open `NEEDS CLARIFICATION` items. Key decisions below.

## Decision 1: Dedicated dynamic route `/practice/[source]/[session]`

- **Decision**: Practice lives at `/practice/{source}/{session}` where `source ∈ {500, 1000}` and `session ∈ 1..32`. The `[ PRACTICE ]` button is a `next/link` `Link` whose `href` is computed from the currently-selected session.
- **Rationale**: Satisfies FR-002/FR-011 (bookmarkable, shareable, reachable by direct URL with no prior navigation). Decouples practice from the two vocabulary feature modules. A `Link` gives client-side navigation < 500 ms (SC-002) with prefetch.
- **Alternatives considered**:
  - *Modal/overlay on the vocabulary page* — rejected: not shareable by URL, and crowds the existing browser.
  - *Query param `?practice=5` on the vocab page* — rejected: muddles the browser's own session state and is less clean than a path.

## Decision 2: Static prerender via `generateStaticParams` (64 pages)

- **Decision**: Export `generateStaticParams` returning all valid `{source, session}` pairs (2 × 32 = 64). The page reads the bundled JSON, groups by session, and only emits params for sessions that actually exist in each dataset.
- **Rationale**: Keeps the whole app static (`○`), consistent with every other page. No runtime data fetching. Next.js 16 — `params` is async and must be awaited.
- **Alternatives considered**: *On-demand dynamic rendering* — unnecessary; the data is fixed and small. *Hardcoding 1..32* — rejected: derive from data so a dataset with a missing session doesn't 404 a prerendered page incorrectly.

## Decision 3: Server-side load + normalise to `PracticeEntry`

- **Decision**: The route's Server Component imports both datasets, picks the one for `source`, reuses the existing `groupBySession` helper, filters out entries with no Vietnamese meaning, maps each to a normalised `PracticeEntry`, and passes the array to the client `PracticeBrowser` as a prop. Raw JSON never ships to the client.
- **Rationale**: `VocabularyEntry` (500) and `TopicVocabEntry` (1000) have different shapes; a single `PracticeEntry` lets all exercises stay dataset-agnostic. All three exercises require a meaning prompt, so meaning-less entries (possible in the 500 set where `meaning` is nullable) are dropped up front (spec Edge Case).
- **Alternatives considered**: *Load JSON in the client component* — rejected: ships both datasets to the browser and duplicates grouping logic. *Two separate exercise code paths per dataset* — rejected: normalisation is simpler and avoids divergence.

## Decision 4: Randomise order on the client after mount (avoid hydration mismatch)

- **Decision**: The server passes `PracticeEntry[]` in a stable (source) order. Each exercise shuffles into its own state inside a mount `useEffect` (Fisher–Yates), not during render.
- **Rationale**: `Math.random()` during render would make server HTML and first client render disagree → React hydration mismatch. Shuffling in a mount effect keeps SSR deterministic and reshuffles once on the client. Re-entering the same session reshuffles (spec assumption: different order each start).
- **Alternatives considered**: *Seeded deterministic shuffle from the session number* — rejected: gives the same order every time, contradicting the "randomised each start" assumption. *`useState(() => shuffle(...))`* — rejected: the initializer runs during SSR too and would mismatch.

## Decision 5: Terminal input uses the native caret (no custom blink animation)

- **Decision**: `TerminalInput` is a monospace `<input>` with a `> ` prompt prefix, dashed border, transparent background, and `caret-color` set to the accent token; it is auto-focused on load and on each new question. Submit is **Enter only** (clarified) — no submit button.
- **Rationale**: The native text caret already blinks, giving the terminal feel for free while respecting the CLAUDE.md rule that the only permitted CSS transition utility is `transition-colors`. Avoids a custom keyframe/animation. Auto-focus satisfies SC-006 and the keyboard-only flow.
- **Alternatives considered**: *Custom block-cursor with a CSS `@keyframes` blink* — deferred: possible via `motion/react` if a block cursor is wanted later, but the native caret is simpler and constraint-safe. *Visible `[ SUBMIT ]` button* — rejected per clarification (Enter-only).

## Decision 6: Manual advance with Enter / `[ NEXT → ]`; feedback via `motion`

- **Decision**: After submit, the exercise enters a "revealed" state showing `[ CORRECT ]` or `[ WRONG ] → "answer"`. Advance is manual: pressing Enter again (Type-the-Word) or clicking `[ NEXT → ]` moves on. Feedback blocks use `motion/react` for enter/exit.
- **Rationale**: Clarified behaviour (no auto-timer). Reusing one Enter key for both submit and advance (in two distinct phases: `answering` → `revealed`) keeps the keyboard-only flow fluid. `motion` is the only sanctioned animation lib.
- **Alternatives considered**: *Auto-advance after a delay* — rejected per clarification.

## Decision 7: Distractors drawn from the same session

- **Decision**: `build-choices` picks the correct meaning plus up to 3 distractor meanings sampled from other entries in the same session, shuffled. If the session has < 4 entries, it returns as many options as exist (≥ 1).
- **Rationale**: FR-009 + the < 4-entry edge case. Same-session distractors keep difficulty appropriate and avoid loading the whole dataset.
- **Alternatives considered**: *Global distractors from the whole dataset* — rejected: needs the full dataset client-side and can produce too-easy/too-random options.

## Decision 8: Reuse `SpeakButton`, `group-by-session`, and the `SessionDropdown` row pattern

- **Decision**: Import `SpeakButton` from `@/features/vocabulary-500/components/SpeakButton` for word audio on flash-card backs and answer reveals. Reuse each dataset's existing `groupBySession`. Add `PracticeButton` to the existing SESSION row in both browsers.
- **Rationale**: Consistency and no duplication; the SESSION row is the natural home for the button (FR-001 "same row as the session dropdown").
- **Alternatives considered**: *New audio/grouping code* — rejected as needless duplication.
