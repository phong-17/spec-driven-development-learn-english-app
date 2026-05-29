# Feature Specification: 1000 Topic Words — Session Browser

**Feature Branch**: `005-topic-1000-sessions`

**Created**: 2026-05-29

**Status**: Draft

**Input**: User description: "Hãy base vàng trang 500 đê tại màn hình các sesion của data/1000-topic-words.json"

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Browse Words by Session (Priority: P1)

A learner opens the 1000 Topic Words page and wants to study words from a specific session. They open a session dropdown, pick "Day 3", and the page immediately shows the ~31 words belonging to that session, grouped under their topic category headings (e.g. "FAMILY — GIA ĐÌNH", "ANIMAL — ĐỘNG VẬT").

**Why this priority**: Core interaction of the page — session selection and word display are the entire purpose. Nothing else works without this.

**Independent Test**: Navigate to `/vocabulary/1000`, open the dropdown, select "Day 1", and verify ~31 words are displayed with stt number, word, phonetic, part of speech, and meaning columns, under the category heading "JOB — NGHỀ NGHIỆP".

**Acceptance Scenarios**:

1. **Given** the page loads, **When** the dropdown is opened, **Then** all 32 sessions are listed as "Day 1" … "Day 32".
2. **Given** a session is selected, **When** the selection changes, **Then** the word table updates immediately to show only words for that session.
3. **Given** the page first loads, **When** no session has been chosen yet, **Then** "Day 1" is pre-selected and its words are shown by default.

---

### User Story 2 — See Topic Category Context Per Session (Priority: P2)

A session can contain words from up to 3 different topic categories (e.g. Day 5 has ANIMAL, COLOR, BODY PART). The learner can see which topic each word belongs to by visible category section headings that divide the word list.

**Why this priority**: Without category labels, learners lose the thematic grouping that is the defining feature of this word list — it is what distinguishes it from the 500 common words list.

**Independent Test**: Select "Day 5" and verify that words are grouped under distinct section headers for "ANIMAL — ĐỘNG VẬT", "COLOR — MÀU SẮC", and "BODY PART — BỘ PHẬN CƠ THỂ" respectively.

**Acceptance Scenarios**:

1. **Given** a session is selected that spans multiple categories, **When** the word list renders, **Then** category names appear as section headers above their respective word groups.
2. **Given** a session contains words from only one category, **When** the word list renders, **Then** a single category header is shown above all words.
3. **Given** a session is selected, **When** the learner counts words, **Then** the total matches the session's expected count (30–31 words).

---

### User Story 3 — Read Word Details at a Glance (Priority: P3)

For each word in the list, the learner sees the sequential number (stt), English word, phonetic transcription, part of speech, and Vietnamese meaning — all visible in a single row without any extra clicks.

**Why this priority**: Information density is a primary goal; all five fields must be immediately readable in the list view.

**Independent Test**: Select any session and verify every row shows: stt number, English word, phonetic, part of speech, and Vietnamese meaning without any interaction.

**Acceptance Scenarios**:

1. **Given** a session is displayed, **When** the learner scans the list, **Then** each row shows: stt number, word, phonetic, part of speech, Vietnamese meaning.
2. **Given** a word has a long meaning string, **When** displayed in the row, **Then** text wraps within the cell rather than truncating silently.
3. **Given** the viewport is mobile (< lg), **When** the session is displayed, **Then** each word is shown as a vertical card (dashed border) with all five fields stacked.

---

### Edge Cases

- What happens when a session number exists in the JSON but has 0 words? → Show an empty-state message: `[ NO WORDS FOUND ]`.
- What if the JSON file fails to load? → Show an error state: `[ ERROR: DATA UNAVAILABLE ]`.
- What if the user switches rapidly between sessions? → Only the most recently selected session's words are shown; no stale data from prior selections.
- What if a session contains words from 3 different categories? → All three category headings are rendered, each followed by its group of words.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The page MUST display a custom-styled session dropdown (not a native `<select>`) listing all 32 sessions labelled "Day 1" … "Day 32". The trigger button MUST use bracket style (e.g., `[ Day 1 ▾ ]`) with a dashed border and monospace font. The dropdown list MUST animate open/close.
- **FR-002**: The page MUST default to "Day 1" on first load.
- **FR-003**: Selecting a session MUST immediately update the word list to show only words for that session, without a full page reload.
- **FR-004**: Words within a session MUST be grouped by their `category` field. Each group MUST be preceded by a full-width separator row spanning all columns (desktop) or a full-width block (mobile card layout) showing the category name formatted as `── CATEGORY ──` (e.g., `── JOB / NGHỀ NGHIỆP ──`).
- **FR-005**: Each word entry MUST display: stt number (raw value from data, resets per category), English word, phonetic transcription, part of speech, Vietnamese meaning. On desktop (≥ lg): 5-column table row. On mobile (< lg): vertical card with dashed border.
- **FR-006**: The page layout and visual style MUST follow the 500 common words page aesthetic: ASCII/terminal theme, VT323 monospace font, dashed borders, no rounded corners, no shadows.
- **FR-007**: The page MUST include the standard navigation sidebar (shared with other vocabulary pages) and the breadcrumb path `> ~/learn-english/vocabulary/1000`.
- **FR-008**: The session dropdown MUST be keyboard-accessible and screen-reader friendly.
- **FR-009**: There is NO row-expand or example sentence feature (the `1000-topic-words` data has no example sentences).

### Key Entities

- **TopicVocabEntry**: Represents one word record — fields: `id`, `stt` (sequential number), `word`, `partOfSpeech`, `phonetic`, `meaning` (Vietnamese), `category` (topic group name in ENGLISH — VIETNAMESE format), `session` (1–32).
- **Session**: A logical grouping of 30–31 TopicVocabEntry items sharing the same `session` number, presented to the user as "Day N".
- **Category**: A thematic grouping within a session (e.g., "JOB — NGHỀ NGHIỆP"). One session may contain words from 1 to 3 categories.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A learner can select any session and see its full word list in under 1 second on a standard connection.
- **SC-002**: All 32 sessions are accessible from the dropdown without scrolling more than one viewport height.
- **SC-003**: Every word displays all five data fields (stt, word, phonetic, part of speech, meaning) without horizontal scrolling on screens ≥ 375 px wide — vertical card layout on mobile (< lg) and 5-column table row on desktop (≥ lg).
- **SC-004**: Category section headings are visible for every category present in the selected session, making thematic grouping immediately apparent.
- **SC-005**: The page is fully navigable by keyboard alone (dropdown open/close, option selection).

---

## Assumptions

- Data is static JSON bundled with the app (`src/data/vocabulary/1000-topic-words.json`); no server-side fetching or API calls are required.
- All 32 sessions are present and non-empty in the JSON (983 total entries, 30–31 per session).
- The existing `TopicVocabEntry` type defined in `src/types/topic-vocabulary.ts` is reused as-is without modification.
- The shared `NavigationMenu` component from the home feature is reused for the sidebar.
- The page is a client-side interactive component (dropdown state managed in the browser).
- Mobile support is required (responsive layout, ≥ 375 px).
- No search, filter, sort, or expand-for-detail functionality is in scope (no example sentence data available).
- Session selection is managed in in-memory React state only; no URL query param is updated, so the selected session does not persist across page loads or navigation.
- No progress tracking, bookmarking, or persistence of session selection across page loads is in scope.
- The visual design and component structure mirrors the 500 common words session page (`/vocabulary/500`) as closely as possible, adapting only for the different data fields and category grouping.
- The route for this page is `/vocabulary/1000`.

---

## Clarifications

### Session 2026-05-29

- Q: Should the selected session be encoded in the URL (e.g., `?session=3`) for bookmarking/linking? → A: No — in-memory state only; URL does not update on session change.
- Q: How should category headings appear in the desktop table layout? → A: Full-width separator row spanning all 5 columns, formatted as `── CATEGORY ──`.
- Q: Should the `stt` column display the raw per-category value from the data, or a session-relative counter? → A: Raw `stt` value — resets to 1 at each new category, matching original PDF numbering.
