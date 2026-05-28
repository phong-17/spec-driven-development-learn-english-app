# Feature Specification: Parse 500 Common English Words PDF to JSON

**Feature Branch**: `001-parse-vocab-pdf`

**Created**: 2026-05-28

**Status**: Draft

**Input**: User description: "phân tích file 500 Từ phổ biến nhất trong Tiếng Anh_Mingology.pdf thành file JSON"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Extract All Words from PDF (Priority: P1)

As the app developer/operator, I need all 500 vocabulary entries from the Mingology PDF extracted and saved as a structured JSON file so the app can load and display vocabulary data without parsing the PDF at runtime.

**Why this priority**: This is the foundational data step — no vocabulary feature in the app can work without this data. All downstream features depend on this JSON file existing with correct, complete data.

**Independent Test**: Run the extraction process on the PDF and verify the output JSON file contains 500 entries, each with word and associated data fields populated.

**Acceptance Scenarios**:

1. **Given** the PDF file `500 Từ phổ biến nhất trong Tiếng Anh_Mingology.pdf` exists in the project root, **When** the extraction process runs, **Then** a JSON file is produced containing exactly 500 word entries.
2. **Given** the extraction completes, **When** the JSON file is opened, **Then** each entry contains at minimum: the English word, its Vietnamese meaning, and any additional data fields present in the PDF (e.g., part of speech, example sentence).
3. **Given** the extraction completes, **When** the JSON is validated, **Then** it is valid, parseable JSON with a consistent structure across all entries.

---

### User Story 2 - Structured Output Suitable for App Consumption (Priority: P2)

As the app, I need the JSON data to have a consistent, predictable structure so vocabulary features (word lists, flashcards, quizzes) can read entries without custom per-entry handling.

**Why this priority**: Consistency of structure is critical for the app to display data correctly. Inconsistent fields would cause rendering errors.

**Independent Test**: Load the JSON file and confirm every entry has the same set of keys, with no missing required fields.

**Acceptance Scenarios**:

1. **Given** the JSON file exists, **When** every entry is iterated, **Then** all entries share the same schema (same keys present in each object).
2. **Given** an entry in the JSON, **When** accessed by any feature component, **Then** the English word and Vietnamese meaning are always present and non-empty.
3. **Given** optional fields (e.g., part of speech, example), **When** not available for a word, **Then** the field is present with a `null` or empty value rather than absent.

---

### User Story 3 - Session Distribution Metadata (Priority: P3)

As the session planning system, I need each word to know which of the 32 study sessions it belongs to so the session view can display the correct subset of words.

**Why this priority**: The app's 32-session structure requires words to be distributed evenly. Adding session assignment directly in the JSON avoids runtime computation.

**Independent Test**: Load the JSON and verify each entry has a `session` field with a value between 1 and 32, and that words are distributed roughly evenly (~15–16 words per session).

**Acceptance Scenarios**:

1. **Given** the JSON file, **When** entries are grouped by session number, **Then** 32 distinct session values exist (1 through 32).
2. **Given** 500 words distributed across 32 sessions, **When** session sizes are measured, **Then** each session contains either 15 or 16 words (500 ÷ 32 = 15.625, so some sessions have 16).
3. **Given** a session number, **When** the JSON is filtered by that session, **Then** only words assigned to that session are returned.

---

### Edge Cases

- What happens when a PDF page contains non-vocabulary content (headers, footers, page numbers)? → These must be excluded from the output.
- How does the system handle words where the Vietnamese meaning is missing or unclear in the PDF? → The entry is still created; the `meaning` field is set to `null` or an empty string.
- What if the PDF contains duplicate word entries? → Duplicates are deduplicated; only one entry per word is kept.
- What if the total extracted word count differs from 500? → The discrepancy is noted/logged; all extracted entries are preserved in the JSON regardless.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The extraction process MUST read the PDF file `500 Từ phổ biến nhất trong Tiếng Anh_Mingology.pdf` from the project root.
- **FR-001a**: An extraction script MUST be written and committed to the repository (e.g., under `scripts/`) so the process is reproducible and auditable.
- **FR-002**: The output MUST be a single JSON file saved to `src/data/vocabulary/500-common-words.json`.
- **FR-003**: Each entry in the JSON array MUST contain: `id` (sequential integer), `word` (English), `meaning` (Vietnamese), `partOfSpeech` (string or null), `example` (string or null), `session` (integer 1–32).
- **FR-004**: The system MUST assign a `session` value to each word by distributing 500 words evenly across sessions 1–32 using sequential block assignment, preserving the order words appear in the PDF.
- **FR-005**: The JSON file MUST be valid, well-formed JSON parseable by standard JSON parsers.
- **FR-006**: Non-vocabulary content (page numbers, headers, footers, section titles) MUST be excluded from the output.
- **FR-007**: Duplicate word entries MUST be deduplicated, keeping the first occurrence.

### Key Entities *(include if feature involves data)*

- **VocabularyEntry**: Represents one word record. Fields: `id`, `word`, `meaning`, `partOfSpeech`, `example`, `session`. This is the core data unit consumed by all vocabulary features.
- **Session**: A logical grouping (1–32) that bundles ~15–16 words for a single study session. Not a separate object — expressed as a field on each VocabularyEntry.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The output JSON file contains between 450 and 500 entries. Although the PDF is titled "500 từ", the source document actually contains only 455 numbered entries — 45 frequency numbers in 1..500 are absent from the PDF itself (e.g. it skips from entry 26 → 28). The acceptance range reflects this reality.
- **SC-002**: 100% of entries have a non-empty `word` field.
- **SC-003**: 100% of entries have a `session` value in the range 1–32.
- **SC-004**: The JSON file loads and parses in under 1 second on a standard development machine.
- **SC-005**: All 32 sessions are represented in the data, with no session containing fewer than 10 or more than 20 words. With 455 entries, sessions hold either 14 or 15 words.

## Assumptions

- The PDF structure is consistent enough that vocabulary entries can be reliably identified by a script or manual review.
- The app has no database — the JSON file is the sole storage format and is committed directly to the repository under `src/data/vocabulary/`.
- Part-of-speech and example sentence data may not be present for all words; these fields are optional and nullable.
- Session assignment uses sequential block distribution (words 1–16 → session 1, words 17–32 → session 2, etc.) in PDF order rather than alphabetical or topic-based grouping.
- The extraction is performed by a committed script (not manual copy-paste); the script is the source of truth for how the JSON is produced.
- The resulting JSON file will be imported by TypeScript features using the path alias `@/data/vocabulary/500-common-words.json`.

## Clarifications

### Session 2026-05-28

- Q: Should extraction be done via a committed script or manually? → A: Write and commit a script to the repository so the process is reproducible and auditable.
- Q: In what order should words be assigned to sessions? → A: Preserve PDF order — words are assigned to sessions in the sequence they appear in the PDF.
- Q: What is the canonical field name for Vietnamese meaning — `meaning` or `translation`? → A: `meaning` — used consistently across all sections and the JSON schema.
