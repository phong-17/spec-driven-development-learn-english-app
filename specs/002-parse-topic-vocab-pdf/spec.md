# Feature Specification: Parse 1000 Topic-Based English Vocabulary PDF to JSON

**Feature Branch**: `002-parse-topic-vocab-pdf`

**Created**: 2026-05-28

**Status**: Draft

**Input**: User description: "phân tích file 1000 từ vựng tiếng Anh theo chủ đề.pdf thành file JSON. Nó sẽ có STT, TỪ VỰNG (LOẠI TỪ ), PHIÊN ÂM, NGHĨA CỦA TỪ, CATEGORY, ID, session."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Extract All Vocabulary Entries from PDF (Priority: P1)

As the app developer/operator, I need all ~1000 vocabulary entries extracted from the topic PDF and saved as a structured JSON file so the app can load topic-based vocabulary without parsing the PDF at runtime.

**Why this priority**: Foundational data step — no topic-vocabulary feature can work without this JSON. All downstream features (word lists, category browsing, flashcards) depend on this file existing with correct, complete data.

**Independent Test**: Run the extraction process and verify the output JSON contains entries from every category found in the PDF, each with `word`, `partOfSpeech`, `phonetic`, `meaning`, and `category` fields populated or set to `null` when absent in the source.

**Acceptance Scenarios**:

1. **Given** the PDF `1000 từ vựng tiếng Anh theo chủ đề.pdf` exists in the project root, **When** the extraction process runs, **Then** a JSON file is produced at `src/data/vocabulary/1000-topic-words.json` containing all vocabulary entries found in the PDF.
2. **Given** the extraction completes, **When** the JSON is opened, **Then** each entry contains at minimum: `id`, `stt`, `word`, `partOfSpeech`, `phonetic`, `meaning`, `category`, and `session`.
3. **Given** the extraction completes, **When** the JSON is validated, **Then** it is valid, parseable JSON with a consistent structure across all entries.

---

### User Story 2 - Category Metadata Preserved in Output (Priority: P2)

As the app, I need each vocabulary entry to carry its topic category so features can filter or group words by subject area (e.g., "Animals", "Food", "Technology").

**Why this priority**: The primary differentiator of this PDF over the 500-common-words data is its topic organisation. Losing category information would eliminate the most valuable aspect of this dataset.

**Independent Test**: Load the JSON and verify that (a) at least 2 distinct `category` values appear, (b) every entry has a non-null `category`, and (c) grouping entries by `category` produces coherent word clusters.

**Acceptance Scenarios**:

1. **Given** the JSON file, **When** all entries are grouped by `category`, **Then** at least 2 distinct categories are present and each category contains at least 1 word.
2. **Given** an entry in the JSON, **When** the `category` field is read, **Then** it matches the topic heading that word appears under in the PDF (e.g., "Animals", "Food").
3. **Given** entries across multiple categories, **When** filtered by a single `category` value, **Then** only entries from that category are returned.

---

### User Story 3 - Session Distribution Metadata (Priority: P3)

As the session planning system, I need each word to know which of the 32 study sessions it belongs to so the session view can display the correct subset of words from this PDF alongside words from the other vocabulary source.

**Why this priority**: The app's 32-session structure requires both vocabulary PDFs to be distributed evenly. Adding session assignment in the JSON avoids runtime computation and keeps the data self-describing.

**Independent Test**: Load the JSON and verify each entry has a `session` value between 1 and 32, and that all 32 sessions are represented with roughly equal word counts.

**Acceptance Scenarios**:

1. **Given** the JSON file, **When** entries are grouped by `session`, **Then** 32 distinct session values exist (1 through 32).
2. **Given** the extracted entries distributed across 32 sessions, **When** session sizes are measured, **Then** the difference between the largest and smallest session is at most 1 word.
3. **Given** a session number, **When** the JSON is filtered by that session, **Then** only words assigned to that session are returned.

---

### Edge Cases

- What happens when a PDF page contains non-vocabulary content (category headings, page numbers, introductory text)? → These are filtered out; category headings are captured as metadata on each entry, not as entries themselves.
- What if a word entry is missing its phonetic transcription or meaning in the PDF? → The entry is still created; missing fields are set to `null`.
- What if the total extracted count differs significantly from 1000? → All extracted entries are preserved; the discrepancy is logged. Session distribution is computed on the actual count.
- What if the same word appears in multiple categories? → Each occurrence is kept as a separate entry with its own `category` value and a distinct `id`.
- What if a category heading is ambiguous or missing? → The entry inherits the most recently seen category heading; if no heading has been seen yet, `category` is set to `"Uncategorized"`.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The extraction process MUST read the PDF file `1000 từ vựng tiếng Anh theo chủ đề.pdf` from the project root.
- **FR-001a**: An extraction script MUST be written and committed under `scripts/` so the process is reproducible and auditable.
- **FR-002**: The output MUST be a single JSON file saved to `src/data/vocabulary/1000-topic-words.json`.
- **FR-003**: Each entry in the JSON array MUST contain: `id` (sequential integer, 1-based), `stt` (per-book sequence number from the PDF, unique across the entire file, 1 → ~1000), `word` (English), `partOfSpeech` (string or null), `phonetic` (string or null), `meaning` (Vietnamese), `category` (string), `session` (integer 1–32).
- **FR-004**: The system MUST assign a `session` value to each word by distributing entries evenly across sessions 1–32 using sequential block assignment, preserving the order words appear in the PDF.
- **FR-005**: The JSON file MUST be valid, well-formed JSON parseable by standard JSON parsers.
- **FR-006**: Non-vocabulary content (page numbers, section headings used as separators, introductory text) MUST be excluded as standalone entries; category headings MUST be captured as the `category` field value on each subsequent entry.
- **FR-007**: Each entry MUST have a `category` field populated from the topic heading that appears above it in the PDF, stored **exactly as it appears** (Vietnamese or bilingual text preserved as-is). If no heading has been encountered before the entry, `category` MUST be set to `"Uncategorized"`.

### Key Entities

- **TopicVocabEntry**: Represents one vocabulary record. Fields: `id`, `stt`, `word`, `partOfSpeech`, `phonetic`, `meaning`, `category`, `session`. The `category` field is what distinguishes this dataset from the frequency-based vocabulary.
- **Category**: A topic grouping (e.g., "Animals", "Food & Drink") expressed as a string on each `TopicVocabEntry`. Not a separate object — stored directly on each entry.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The output JSON file contains between 900 and 1050 entries (allowing for minor PDF parsing edge cases while targeting the stated 1000).
- **SC-002**: 100% of entries have a non-empty `word` field.
- **SC-003**: 100% of entries have a non-null `category` field.
- **SC-004**: 100% of entries have a `session` value in the range 1–32.
- **SC-005**: All 32 sessions are represented in the data, with session sizes differing by at most 1 word from each other.
- **SC-006**: The JSON file loads and parses in under 1 second on a standard development machine.
- **SC-007**: At least 2 distinct category values are present in the data.

## Clarifications

### Session 2026-05-28

- Q: Is `stt` per-book (1 → ~1000) or per-category (resets per heading)? → A: Per-book — unique sequence number across the entire file.
- Q: Should `category` store the heading as-is from the PDF or normalize to English? → A: Store exactly as it appears in the PDF (Vietnamese or bilingual).
- Q: If a word appears before any category heading, should category be null, "Uncategorized", or cause an abort? → A: Use `"Uncategorized"` as fallback so SC-003 (100% non-null) is always satisfied.

## Assumptions

- The PDF uses visible topic/category headings (e.g., bold text or a distinct line) to delineate word groups. These headings are captured as the `category` value for subsequent entries.
- The `stt` field is the sequence number across the **entire book** (1 → ~1000), not per-category. It is unique across the whole JSON file.
- The same word may appear in multiple categories — this is intentional in a topic-based book and each occurrence is treated as a distinct entry with its own `id`.
- Session assignment uses sequential block distribution in PDF order, consistent with how `500-common-words.json` is distributed.
- `partOfSpeech` and `phonetic` may be absent for some entries; these fields are nullable.
- The resulting JSON will be imported by TypeScript features using the path alias `@/data/vocabulary/1000-topic-words.json`.
- No database — JSON is committed directly to the repository as the sole storage format.
- The app has 32 sessions total; both vocabulary PDFs share this session structure but their words are stored in separate JSON files.
