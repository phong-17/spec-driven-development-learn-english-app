# Implementation Plan: Parse 1000 Topic-Based English Vocabulary PDF to JSON

**Branch**: `002-parse-topic-vocab-pdf` | **Date**: 2026-05-28 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-parse-topic-vocab-pdf/spec.md`

## Summary

Extract ~1000 vocabulary entries from `1000 từ vựng tiếng Anh theo chủ đề.pdf` and serialize them as a JSON array at `src/data/vocabulary/1000-topic-words.json`. Each entry carries `id`, `stt` (per-book PDF sequence number), `word`, `partOfSpeech`, `phonetic`, `meaning` (Vietnamese), `category` (topic heading preserved as-is from the PDF, or `"Uncategorized"` as fallback), and `session` (1–32). The script reuses the same toolchain as feature 001 (`pdfjs-dist` + `tsx`) so it stays consistent with the existing extraction pattern. Session distribution uses sequential block assignment matching `500-common-words.json`.

## Technical Context

**Language/Version**: TypeScript 5 (Node.js runtime via `tsx`)

**Primary Dependencies**: `pdfjs-dist` (already a devDep from feature 001) for PDF text extraction; `tsx` (already a devDep) for running TypeScript scripts directly. No new package additions required.

**Storage**: Filesystem only. Input PDF at project root; output JSON committed under `src/data/vocabulary/`. No database.

**Testing**: Embedded runtime assertions inside the extraction script (count range, schema uniformity, category non-null, session distribution). No formal test framework — consistent with feature 001.

**Target Platform**: Local development machine (Windows/macOS/Linux). JSON output is platform-agnostic and consumed at build time by Next.js 16.

**Project Type**: Data pipeline + static asset (one-off-by-design but committed and reproducible).

**Performance Goals**: Extraction completes in under 60 seconds (PDF is larger than feature 001's source). JSON parses in under 1 second when imported by the app (SC-006).

**Constraints**:
- Output must be valid, well-formed UTF-8 JSON.
- Vietnamese characters (with diacritics) must round-trip correctly — same Unicode handling as feature 001.
- `pdfjs-dist` stays a script-only dependency (never bundled into the Next.js app).
- Targeting 1000 entries; tolerable range 900–1050 (SC-001).
- Every entry must have a non-null `category` (SC-003) — fallback `"Uncategorized"` used when no heading has been seen yet.

**Scale/Scope**: ~1000 vocabulary records, ~150–200 KB JSON. Single PDF input. One script file (~250 LOC, similar shape to feature 001). Multiple distinct category headings; the script must detect them and propagate forward to subsequent entries.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The project constitution at `.specify/memory/constitution.md` is still a placeholder template with no ratified principles. No principle-derived gates apply. Standard project conventions from `CLAUDE.md` / `AGENTS.md` are followed:

- ✅ No new app-runtime dependencies; reuses `pdfjs-dist` + `tsx` already installed in feature 001.
- ✅ Data lives under `src/data/vocabulary/` (alongside `500-common-words.json`) and is consumable via the `@/*` path alias.
- ✅ No UI work — pure data pipeline, deferring all topic-vocabulary UI to later features per `CLAUDE.md` "Current focus" rule.
- ✅ Script is committed for reproducibility (FR-001a).
- ✅ Both vocabulary JSONs share the same 32-session structure.

**Result**: PASS — no violations, no complexity to justify.

## Project Structure

### Documentation (this feature)

```text
specs/002-parse-topic-vocab-pdf/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── topic-vocab-entry.schema.json   # JSON Schema for TopicVocabEntry
├── checklists/
│   └── requirements.md                 # Already exists from /speckit-specify
├── spec.md              # Feature spec
└── tasks.md             # Phase 2 output (created by /speckit-tasks — NOT this command)
```

### Source Code (repository root)

```text
scripts/
├── parse-500-common-words.ts            # Existing (feature 001)
└── parse-1000-topic-words.ts            # NEW — this feature's extraction script

src/
├── data/
│   └── vocabulary/
│       ├── 500-common-words.json        # Existing (feature 001)
│       └── 1000-topic-words.json        # NEW — this feature's output
├── types/
│   ├── vocabulary.ts                    # Existing — VocabularyEntry (500-words)
│   └── topic-vocabulary.ts              # NEW — TopicVocabEntry interface
├── app/                                 # Unchanged
├── features/
│   └── vocabulary/                      # Unchanged — UI deferred
├── components/
├── hooks/
└── utils/
```

**Structure Decision**: Single-project Next.js layout (already in place). This feature adds:
1. One new extraction script: `scripts/parse-1000-topic-words.ts`.
2. One new committed JSON: `src/data/vocabulary/1000-topic-words.json`.
3. One new TypeScript type file: `src/types/topic-vocabulary.ts` exporting `TopicVocabEntry`.

No changes to `src/app/`, `src/features/`, `src/components/`, `src/hooks/`, or `src/utils/`. The two vocabulary datasets are kept in separate files with separate types — they are different shapes (frequency-driven vs topic-driven), so they don't share a TS interface.

## Complexity Tracking

> No constitution violations to justify. Table intentionally empty.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| —         | —          | —                                    |
