# Feature Specification: 500 Common Words — Session Browser

**Feature Branch**: `004-vocab-500-sessions`

**Created**: 2026-05-28

**Status**: Draft

**Input**: User description: "Hãy base vào trang home để tạo một màn hình các session của data/500-common-words.json. Ở đây tôi muốn rằng trước mắt sẽ có dropdown ra list các session ví dụ nếu là session 1 thì sẽ là session: Day 1 và data ở dưới sẽ dựa vào selected đó."

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Browse Words by Session (Priority: P1)

A learner opens the 500 Most Common Words page and wants to study words from a specific day. They open a session dropdown, pick "Day 3", and the page immediately shows only the 14–15 words belonging to that session in a scannable table.

**Why this priority**: Core interaction of the page — without session selection and word display there is nothing else to build on.

**Independent Test**: Navigate to `/vocabulary/500`, open the dropdown, select "Day 1", and verify 15 words are displayed with word, phonetic, part of speech, and meaning columns.

**Acceptance Scenarios**:

1. **Given** the page loads, **When** the dropdown is opened, **Then** all 32 sessions are listed as "Day 1" … "Day 32".
2. **Given** a session is selected, **When** the selection changes, **Then** the word table updates immediately to show only words for that session.
3. **Given** the page first loads, **When** no session has been chosen yet, **Then** "Day 1" is pre-selected and its words are shown by default.

---

### User Story 2 — Read Word Details at a Glance (Priority: P2)

For each word in the table, the learner can see the frequency rank, the English word, phonetic transcription, Vietnamese part-of-speech label, and Vietnamese meaning — all in a single row without any extra clicks.

**Why this priority**: Information density is a primary goal; hiding meaning behind a click would reduce study efficiency.

**Independent Test**: Select any session and verify every row shows: rank number, English word, phonetic, part-of-speech (Vietnamese), and meaning (Vietnamese) without interaction.

**Acceptance Scenarios**:

1. **Given** a session is displayed, **When** the learner scans the table, **Then** each row shows: frequency rank, word, phonetic, Vietnamese part-of-speech, Vietnamese meaning.
2. **Given** a word has a long meaning string, **When** displayed in the table, **Then** text wraps within the cell rather than truncating silently.

---

### User Story 3 — View Example Sentence (Priority: P3)

A learner wants to see how a word is used in context. They expand a row to reveal the English example sentence and its Vietnamese translation.

**Why this priority**: Contextual examples support retention but are secondary to the core word list view.

**Independent Test**: Click the `[ + ]` button on any word entry and verify an inline section expands revealing the English example and Vietnamese example for that word.

**Acceptance Scenarios**:

1. **Given** a word entry is collapsed, **When** the learner clicks/taps the `[ + ]` button, **Then** an inline section expands below showing the English example sentence and its Vietnamese translation, and the button label changes to `[ - ]`.
2. **Given** a word entry is expanded, **When** the learner clicks the `[ - ]` button, **Then** the example section collapses and the button returns to `[ + ]`.
3. **Given** a new session is selected from the dropdown, **When** the word table refreshes, **Then** all expanded rows are collapsed.

---

### Edge Cases

- What happens when a session number exists in the JSON but has 0 words? → Show an empty-state message: `[ NO WORDS FOUND ]`.
- What if the JSON file fails to load? → Show an error state: `[ ERROR: DATA UNAVAILABLE ]`.
- What if all 32 sessions are valid and the user switches rapidly between sessions? → Only the most recently selected session's words are shown; no stale data from prior selections.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The page MUST display a custom-styled session dropdown (not a native `<select>`) listing all sessions, labelled "Day N" (e.g., "Day 1", "Day 32"). The trigger button MUST use the bracket style (e.g., `[ Day 1 ▾ ]`) with a dashed border consistent with the ASCII aesthetic. The dropdown list MUST animate open/close.
- **FR-002**: The page MUST default to "Day 1" on first load.
- **FR-003**: Selecting a session from the dropdown MUST immediately update the word table to show only words for that session, without a full page reload.
- **FR-004**: The word list MUST display one entry per word showing: frequency rank, English word, phonetic transcription, Vietnamese part-of-speech, Vietnamese meaning. On desktop (≥ lg) this is a 5-column table row; on mobile (< lg) this is a vertical card with the same five fields stacked, using dashed borders consistent with the ASCII aesthetic.
- **FR-005**: Each word entry MUST have a dedicated `[ + ]` / `[ - ]` toggle button — positioned at the start of the row on desktop, top-right corner of the card on mobile — that expands/collapses an inline section revealing the English example sentence and its Vietnamese translation.
- **FR-006**: Expanding one row MUST NOT collapse other already-expanded rows.
- **FR-007**: Switching sessions MUST collapse all expanded rows.
- **FR-008**: The page layout and visual style MUST follow the home page aesthetic: ASCII/terminal theme, monospace font, dashed borders, no rounded corners, no shadows.
- **FR-009**: The page MUST include the standard navigation sidebar (shared with home) and the breadcrumb path `> ~/learn-english/vocabulary/500`.
- **FR-010**: The session dropdown MUST be keyboard-accessible and screen-reader friendly.

### Key Entities

- **VocabularyEntry**: Represents one word record — fields: `id`, `frequency` (rank), `word`, `meaning` (Vietnamese), `partOfSpeech` (English), `viPartOfSpeech` (Vietnamese), `phonetic`, `example` (English), `viExample` (Vietnamese), `session` (1–32).
- **Session**: A logical grouping of 14–15 VocabularyEntry items sharing the same `session` number, presented to the user as "Day N".

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A learner can select any session and see its full word list in under 1 second on a standard connection.
- **SC-002**: All 32 sessions are accessible from the dropdown without scrolling more than one viewport height.
- **SC-003**: Every word displays all five data fields (rank, word, phonetic, part-of-speech, meaning) without horizontal scrolling on screens ≥ 375 px wide — rendered as a vertical card on mobile (< lg) and as a full 5-column table row on desktop (≥ lg).
- **SC-004**: Expanding a row to see the example sentence requires exactly one interaction (click or tap).
- **SC-005**: The page is fully navigable by keyboard alone (dropdown, row expand/collapse).

---

## Assumptions

- Data is static JSON bundled with the app; no server-side fetching or API calls are required.
- All 32 sessions are present and non-empty in `500-common-words.json`.
- The existing `VocabularyEntry` type defined in `src/types/vocabulary.ts` is reused as-is without modification.
- The shared `NavigationMenu` component from the home feature is reused for the sidebar.
- The page is a client-side interactive component (dropdown state and row expand state managed in the browser).
- Mobile support is required (responsive layout, ≥ 375 px).
- No search, filter, or sort functionality is in scope for this version.
- No progress tracking, bookmarking, or persistence of session selection across page loads is in scope.

---

## Clarifications

### Session 2026-05-28

- Q: When 5 columns cannot fit on mobile (< lg), how should the word list layout adapt? → A: Card layout on mobile — each word displayed as a vertical card (dashed bordered) with all five fields stacked; full 5-column table on desktop (≥ lg).
- Q: Should the session dropdown use a native HTML `<select>` or a custom ASCII-styled component? → A: Custom styled dropdown — bracket-style trigger `[ Day 1 ▾ ]`, dashed border, monospace font, animated open/close via `motion/react`.
- Q: How does the user trigger row expand — full row click or a dedicated control? → A: Dedicated `[ + ]` / `[ - ]` button at row start (desktop) or card top-right (mobile); only this button toggles the example section.
