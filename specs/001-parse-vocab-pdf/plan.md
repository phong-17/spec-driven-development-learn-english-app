# Implementation Plan: Parse 500 Common English Words PDF to JSON

**Branch**: `001-parse-vocab-pdf` | **Date**: 2026-05-28 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-parse-vocab-pdf/spec.md`

## Summary

Extract all 500 vocabulary entries from `500 Từ phổ biến nhất trong Tiếng Anh_Mingology.pdf` and serialize them as a single JSON file at `src/data/vocabulary/500-common-words.json`. Each entry carries `id`, `word`, `meaning` (Vietnamese), `partOfSpeech`, `example`, and `session` (1–32, block-distributed in PDF order). The transformation is performed by a committed, reproducible Node/TypeScript script under `scripts/` invoked manually via `pnpm tsx scripts/parse-500-common-words.ts`. The JSON is committed to the repo and consumed by the Next.js app via the `@/data/...` path alias — no runtime PDF parsing.

## Technical Context

**Language/Version**: TypeScript 5 (Node.js runtime via `tsx`)

**Primary Dependencies**: `pdfjs-dist` for PDF text extraction (Mozilla, official, handles Unicode/Vietnamese diacritics robustly). `tsx` (dev dependency) for running TypeScript scripts directly without a build step. No new runtime app dependencies.

**Storage**: Filesystem only. Input PDF at project root; output JSON committed under `src/data/vocabulary/`. No database.

**Testing**: Lightweight script-level validation embedded in the extraction script itself (assert count, schema, session distribution). No formal test framework required for this one-off data pipeline — success is validated by the resulting JSON file passing the assertions in `quickstart.md`.

**Target Platform**: Local development machine (Windows/macOS/Linux). Output JSON is platform-agnostic and consumed at build time by Next.js 16 (App Router).

**Project Type**: Data pipeline + static asset. The script is one-off-by-design but kept reproducible.

**Performance Goals**: Extraction completes in under 30 seconds on a standard developer machine. JSON file parses in under 1 second when imported by the app (SC-004).

**Constraints**:
- Output must be valid, well-formed UTF-8 JSON.
- Vietnamese characters (with diacritics) must round-trip correctly.
- No runtime PDF dependency in the Next.js app — `pdfjs-dist` is a script-only dependency.
- Tolerable range 450–500 entries (SC-001). The PDF's title says "500 từ" but the source document contains only 455 numbered entries (45 frequency numbers in 1..500 are absent from the PDF itself).

**Scale/Scope**: ~455 vocabulary records (source PDF is short of its titular 500), ~50 KB JSON. Single PDF input. One script file. Sequential block session assignment over 32 sessions.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The project constitution at `.specify/memory/constitution.md` is a placeholder template with no ratified principles. No principle-derived gates apply. Standard project conventions from `CLAUDE.md` / `AGENTS.md` are followed:

- ✅ No new app-runtime dependencies; only a dev/script dependency (`pdfjs-dist`, `tsx`).
- ✅ Data lives under `src/data/` and is consumable via the `@/*` path alias.
- ✅ No UI work — pure data pipeline, deferring all vocabulary UI to later features per `CLAUDE.md` "Current focus" rule.
- ✅ Script is committed for reproducibility (FR-001a).

**Result**: PASS — no violations, no complexity to justify.

## Project Structure

### Documentation (this feature)

```text
specs/001-parse-vocab-pdf/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── vocabulary-entry.schema.json  # JSON Schema for VocabularyEntry
├── checklists/          # (already present from earlier speckit steps)
├── spec.md              # Feature spec
└── tasks.md             # Phase 2 output (created by /speckit-tasks — NOT this command)
```

### Source Code (repository root)

```text
scripts/
└── parse-500-common-words.ts     # Committed extraction script (FR-001a)

src/
├── data/
│   └── vocabulary/
│       └── 500-common-words.json # Output JSON (FR-002)
├── types/
│   └── vocabulary.ts             # TS types matching JSON Schema (VocabularyEntry)
├── app/                          # (unchanged — no routes added in this feature)
├── features/
│   └── vocabulary/               # (unchanged — UI deferred)
├── components/
├── hooks/
└── utils/
```

**Structure Decision**: Single-project Next.js layout (already in place). This feature adds:
1. A new `scripts/` directory at repo root containing the one extraction script.
2. A new `src/data/vocabulary/` directory holding the committed JSON output.
3. A new `src/types/vocabulary.ts` for the shared `VocabularyEntry` type that future vocabulary features will import.

No changes to `src/app/`, `src/features/`, `src/components/`, `src/hooks/`, or `src/utils/` in this feature — UI consumers come later.

## Complexity Tracking

> No constitution violations to justify. Table intentionally empty.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| —         | —          | —                                    |
