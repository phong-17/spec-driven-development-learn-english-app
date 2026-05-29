# Phase 0 Research: Ms. Huong Lesson Browser

All Technical Context fields were resolvable from the existing codebase and the spec clarifications — there were no open `NEEDS CLARIFICATION` items. This document records the key decisions.

## Decision 1: Static Server Components, no client orchestrator

- **Decision**: Build the page as Server Components with a single `SpeakButton` client island. No `"use client"` orchestrator, no `useState`, no dropdown.
- **Rationale**: The spec clarification fixed the display as a full list (all 32 sessions visible, grouped by lesson) with no per-session content to load. There is no interactive state to manage, so a client container would add hydration cost for zero benefit. The page can prerender fully static (`○`).
- **Alternatives considered**:
  - *Mirror the vocabulary `SessionBrowser` (client + dropdown)* — rejected: the dropdown's purpose is to swap which session's word list is shown; lessons have no per-session word list, only one-line metadata, so the dropdown reveals nothing new.
  - *Client component for the whole page* — rejected: unnecessary hydration; only the speak buttons need the browser.

## Decision 2: Hand-authored JSON, no parse script

- **Decision**: Author `src/data/lessons/ms-huong-lessons.json` by hand; no `scripts/parse-*.ts`.
- **Rationale**: Per spec clarification. The source PDF lesson pages are image-based (verified by text extraction — only titles and the 3 challenge word lists carry extractable text). The data is fixed and small (16 lessons, 42 words). A parse script would be brittle (OCR-less extraction can't read the images) and pointless (data won't change).
- **Alternatives considered**:
  - *Parse script like `parse-1000-topic-words.ts`* — rejected: most content is non-extractable images; the script could only recover what we already have transcribed.
  - *Inline the data in component files* — rejected: violates the project's data pattern (JSON under `src/data/`), and mixes content with presentation.

## Decision 3: Reuse `SpeakButton`, do not reuse `SessionDropdown`

- **Decision**: Import `SpeakButton` from `@/features/vocabulary-500/components/SpeakButton`. Do not import `SessionDropdown`.
- **Rationale**: `SpeakButton` is a generic presentational client component (`{ word }` → Web Speech API) — exactly what the challenge words need, giving cross-page consistency (spec clarification: SpeakButton parity). `SessionDropdown` is not needed (no dropdown).
- **Alternatives considered**: *Promote `SpeakButton` to `src/components/`* — deferred (out of scope; would touch the shipped 500 feature). The existing `vocabulary-1000 → vocabulary-500` import edge already sets precedent for importing it in place.

## Decision 4: IPA glyph rendering

- **Decision**: Rely on the existing `--font-mono` (VT323) with the browser's default monospace/system fallback for IPA glyphs not covered by VT323. No new font loading.
- **Rationale**: The challenge phonetics use standard IPA (`/wʌn/`, `/θriː/`, `/ʃ/`, `/ŋ/`, `/ʒ/`, `/dʒ/`). VT323 covers most Latin; uncovered glyphs fall through to the next font in the stack, which on all target platforms includes IPA coverage. SC-006 verifies no `□` replacement glyphs appear — a manual viewport check, cheap to confirm.
- **Alternatives considered**: *Load a dedicated IPA web font* — rejected as premature; adds weight for a handful of glyphs. Revisit only if SC-006 fails on a target platform.

## Decision 5: Sessions derived from lessons (embedded day pair)

- **Decision**: Store each lesson's two session numbers as an embedded `sessions: [dayA, dayB]` pair on the `LessonEntry`. Do not maintain a separate flat 32-row session array.
- **Rationale**: The display groups sessions by lesson (16 groups of 2), so iterating lessons and rendering each lesson's day pair is the natural structure. Denormalizing the lesson title/sound-focus into a flat `SessionEntry[]` would duplicate data the renderer already has in scope.
- **Alternatives considered**: *Flat `SessionEntry[]` of 32 rows* — rejected: redundant denormalization; the grouped-by-lesson view never needs the flat form.

## Decision 6: Advanced Pronunciation acknowledged as a note

- **Decision**: Represent the post-Lesson-16 "Advanced Pronunciation" section as a single `advanced` object in the JSON (English + Vietnamese title, short note, page range), rendered as a labeled note after the lesson list / within the challenge area.
- **Rationale**: FR-009 + SC-007 require it not be silently dropped, but it is supplementary (not a 17th lesson and not sessions 33–34). A note preserves the information without distorting the 32-session model.
- **Alternatives considered**: *Generate sessions 33–34* — rejected: contradicts the fixed 32-session model and the spec assumption.
