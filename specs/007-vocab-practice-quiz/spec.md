# Feature Specification: Vocabulary Practice Quiz

**Feature Branch**: `007-vocab-practice-quiz`

**Created**: 2026-05-29

**Status**: Draft

**Input**: User description: "tại 2 màn 500 và 1000 tôi đang có ý tưởng làm một button (vị trí để cùng hàng với session). Khi click vào nó sẽ sang một trang gõ WORD dựa trên MEANING và nó sẽ lấy data dựa trên session đã selected ở màn 500 hay 1000. Input cho nhập vào thì hãy làm cho nó giống với terminal ASCII. Ngoài ra nếu bạn nghĩ có cách nào để luyện từ thì có thể thêm thành tabs với ý tưởng trên của tôi."

---

## Overview

Add a practice mode accessible from both `/vocabulary/500` and `/vocabulary/1000`. From either page, a `[ PRACTICE ]` button — placed on the same row as the session dropdown — launches a dedicated practice screen for the currently-selected session's words.

The practice screen offers multiple exercise modes presented as tabs. The core mode is **Meaning → Word**: the learner sees a Vietnamese meaning and must type the English word. Additional tabs cover complementary recall directions and recognition exercises, giving the learner a complete session workout.

All exercises draw only from the words in the selected session (e.g., Day 5 of the 500-word set). The session context is passed via the URL so the practice page is bookmarkable and shareable.

---

## Clarifications

### Session 2026-05-29

- Q: How does the learner advance to the next question after feedback is shown? → A: Manual advance — learner presses Enter or clicks `[ NEXT → ]` to proceed; no auto-timer.
- Q: How does the learner submit their typed answer in the Type-the-Word exercise? → A: Enter key only — no visible submit button; purely keyboard-driven, matching the terminal aesthetic.

---

## User Scenarios & Testing _(mandatory)_

### User Story 1 — Launch Practice from Vocabulary Page (Priority: P1)

A learner is browsing words in session Day 5 on `/vocabulary/500`. They see a `[ PRACTICE ]` button next to the session selector, click it, and land on a practice screen loaded with Day 5's words.

**Why this priority**: This is the entry point for the entire feature. Nothing else works without it.

**Independent Test**: On `/vocabulary/500`, select Day 5; verify `[ PRACTICE ]` button is visible on the same row as the dropdown; click it; verify the practice page loads with the title indicating "Day 5 · 500 Words" (or equivalent); verify the word count matches Day 5's actual entry count.

**Acceptance Scenarios**:

1. **Given** the learner is on `/vocabulary/500` with Day 5 selected, **When** they click `[ PRACTICE ]`, **Then** they are taken to a practice page with Day 5's words from the 500-word dataset.
2. **Given** the learner is on `/vocabulary/1000` with Day 12 selected, **When** they click `[ PRACTICE ]`, **Then** they are taken to a practice page with Day 12's words from the 1000-word dataset.
3. **Given** the learner copies and opens the practice URL directly, **When** the page loads, **Then** it shows the correct session and dataset without requiring navigation back to the source page.

---

### User Story 2 — Meaning → Word (Type the Word) (Priority: P1) 🎯 Core Exercise

The learner sees a Vietnamese meaning (and optionally the part of speech) and types the English word. The terminal-style input and feedback preserve the ASCII aesthetic of the app.

**Why this priority**: This is the exercise the user explicitly requested and the primary learning mode.

**Independent Test**: On the practice page, verify the "Type the Word" tab is active by default; verify each prompt shows a Vietnamese meaning; type the correct English word and confirm a clear correct-feedback; type a wrong word and confirm an incorrect-feedback; verify the session progresses through all words.

**Acceptance Scenarios**:

1. **Given** the learner is on the practice page, **When** the exercise begins, **Then** they see a Vietnamese meaning prompt and a terminal-style text input that is automatically focused.
2. **Given** a prompt is displayed, **When** the learner types the correct English word and submits, **Then** they receive immediate visual confirmation (e.g., `[ CORRECT ]`); they then press Enter or click `[ NEXT → ]` to advance.
3. **Given** a prompt is displayed, **When** the learner types an incorrect word and submits, **Then** they see the correct answer revealed (e.g., `[ WRONG ] → "apple"`); they then press Enter or click `[ NEXT → ]` to advance.
4. **Given** the learner is unsure, **When** they press a "skip" action, **Then** the word is counted as skipped and they advance; skipped words may reappear at end of session.
5. **Given** all words have been answered or skipped, **When** the last word is processed, **Then** a summary screen shows score (correct / total) and elapsed time.

---

### User Story 3 — Word → Meaning (Choose the Meaning) (Priority: P2)

The learner sees an English word and selects the correct Vietnamese meaning from 4 options. This tests recognition in the opposite direction.

**Why this priority**: Complements US2 (type direction vs. recognise direction) and is faster to complete, good for review.

**Independent Test**: On the practice page, switch to the "Choose the Meaning" tab; verify each card shows an English word and 4 meaning options; select the correct one and confirm correct feedback; select a wrong one and confirm wrong feedback with correct answer highlighted.

**Acceptance Scenarios**:

1. **Given** the learner switches to "Choose the Meaning" tab, **When** a card appears, **Then** they see an English word and exactly 4 Vietnamese meaning choices.
2. **Given** a card is displayed, **When** the learner selects the correct meaning, **Then** that option lights up as correct; they then press Enter or click `[ NEXT → ]` to advance.
3. **Given** a card is displayed, **When** the learner selects a wrong meaning, **Then** the wrong choice is highlighted and the correct meaning is revealed; they then press Enter or click `[ NEXT → ]` to advance.
4. **Given** the session dataset has fewer than 4 entries, **When** distractors are needed, **Then** the system gracefully shows fewer options rather than crashing.

---

### User Story 4 — Flash Cards (Flip & Self-Score) (Priority: P3)

The learner sees the Vietnamese meaning on a card front and flips it to reveal the English word, phonetic, and example sentence. They then self-score (known / unknown) to guide repetition.

**Why this priority**: Passive review before active recall; useful as warm-up or quick refresh.

**Independent Test**: On the practice page, switch to the "Flash Cards" tab; verify each card shows the meaning on the front; flip it and verify the word, phonetic (if available), and example (if available) appear; tap "Known" and "Unknown" and confirm the card advances.

**Acceptance Scenarios**:

1. **Given** the learner opens the Flash Cards tab, **When** a card appears, **Then** the Vietnamese meaning is shown face-up.
2. **Given** a card is face-up, **When** the learner flips it, **Then** the English word, phonetic (if present), and example sentence (if present) are revealed on the back.
3. **Given** the card is flipped, **When** the learner taps `[ KNOWN ]` or `[ UNKNOWN ]`, **Then** the session advances and unknown cards are queued for a second pass.
4. **Given** all cards have been reviewed, **When** the session ends, **Then** a summary shows known vs. unknown counts.

---

### Edge Cases

- What if a session has only 1 word? The "Choose the Meaning" tab must degrade gracefully (show fewer than 4 options or disable that tab with a message).
- What if a word has no Vietnamese meaning? Skip it from exercises that require a meaning prompt, or display a placeholder.
- What if the learner navigates back mid-session? Session progress is lost — no persistence is required; a fresh start on re-entry is acceptable.
- What if the typed answer differs only in case or leading/trailing whitespace? It should be accepted as correct (case-insensitive, trimmed comparison).
- What if the URL references a non-existent session number? Show an error message and a link back to the vocabulary page.

---

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: Both `/vocabulary/500` and `/vocabulary/1000` MUST display a `[ PRACTICE ]` button on the same row as the session dropdown.
- **FR-002**: Clicking `[ PRACTICE ]` MUST navigate to a practice page that receives the source dataset (500 or 1000) and the selected session number via the URL.
- **FR-003**: The practice page MUST display the source and session context in its heading (e.g., "DAY 5 · 500 WORDS PRACTICE").
- **FR-004**: The practice page MUST offer at least three exercise tabs: **Type the Word** (Meaning → Word), **Choose the Meaning** (Word → Meaning, 4 options), and **Flash Cards** (flip & self-score).
- **FR-005**: The **Type the Word** tab MUST use a terminal/ASCII-styled text input — monospace font, dashed border, cursor-blink effect — consistent with the app's overall aesthetic. The input is auto-focused on load and on every new question; the learner submits by pressing Enter (no submit button).
- **FR-006**: Answer evaluation for typed input MUST be case-insensitive and whitespace-trimmed; partial matches (e.g., first word only) are NOT accepted.
- **FR-007**: Each exercise MUST display immediate feedback after each answer — correct/incorrect indication and, when wrong, the correct answer revealed.
- **FR-008**: Each exercise MUST show a summary screen at the end with score (correct / total attempted) and elapsed time.
- **FR-009**: The "Choose the Meaning" tab MUST generate 3 distractors from other words in the same session; if fewer than 4 words exist in the session, show as many options as available.
- **FR-010**: The Flash Cards tab MUST include a flip animation and `[ KNOWN ]` / `[ UNKNOWN ]` self-score buttons; unknown cards are shown again in a second pass.
- **FR-011**: The practice page MUST be accessible via a direct URL with no login or prior navigation required.
- **FR-012**: Session progress is NOT persisted — closing or refreshing the page resets the exercise.
- **FR-013**: After each answer (correct or incorrect), the exercise MUST wait for manual advance — the learner presses Enter or clicks `[ NEXT → ]`. No auto-timer or auto-advance is used.

### Key Entities

- **PracticeSession**: Runtime exercise context — dataset source (500 or 1000), session number (1–32), ordered list of word entries, current position, correct/incorrect counts, start timestamp.
- **PracticeEntry**: One word being practised — derived from `VocabularyEntry` or `TopicVocabEntry`; the fields used are: `word`, `meaning` (Vietnamese), `partOfSpeech`, `phonetic`, `example`.

---

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: `[ PRACTICE ]` button is visible on both `/vocabulary/500` and `/vocabulary/1000` without any scrolling or extra interaction.
- **SC-002**: Clicking `[ PRACTICE ]` navigates to the practice page in under 500 ms (client-side navigation, no full reload).
- **SC-003**: All three exercise tabs (Type the Word, Choose the Meaning, Flash Cards) are accessible and functional for every valid session (Day 1–32) on both datasets.
- **SC-004**: Correct-answer evaluation returns a result within 100 ms of submission (immediate visual feedback, no perceptible delay).
- **SC-005**: The practice page renders correctly at viewport widths 375 px, 768 px, 1024 px, and 1440 px — no horizontal overflow.
- **SC-006**: The terminal-style input field in the Type-the-Word tab is immediately focusable on page load (no extra click required on desktop).
- **SC-007**: A summary screen appears after completing all words in any exercise tab, showing at minimum: words correct, words wrong/skipped, total words, time elapsed.

---

## Assumptions

- Practice draws exclusively from the words in the selected session (Day N) — no cross-session mixing.
- The practice page URL format encodes both dataset and session: e.g., `/practice/500/5` for Day 5 of the 500-word set; `/practice/1000/12` for Day 12 of the 1000-word set.
- Word order within an exercise is randomised on each session start; the same session accessed twice will present words in a different order.
- The "Type the Word" tab accepts the primary English word only (the `word` field). Alternate spellings or synonyms are not in scope.
- Phonetic and example fields are shown as supplementary context (on flash card backs, in post-answer reveals) but are never required as part of the answer.
- No score history, streak tracking, or spaced-repetition algorithm is in scope — this is a single-session practice tool.
- The 500-word dataset uses `VocabularyEntry` (fields: word, meaning, partOfSpeech, phonetic, example, viExample). The 1000-word dataset uses `TopicVocabEntry` (fields: word, meaning, partOfSpeech, phonetic; no example sentences).
- The Flash Cards tab shows the example sentence (viExample for 500-word set; not available for 1000-word set) when present; the absence of an example is handled gracefully.
