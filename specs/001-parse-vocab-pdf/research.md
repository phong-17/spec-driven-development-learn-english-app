# Phase 0 Research — Parse 500 Common English Words PDF to JSON

**Feature**: `001-parse-vocab-pdf` · **Date**: 2026-05-28

All `NEEDS CLARIFICATION` items from Technical Context are resolved below.

---

## Decision 1: PDF parsing library

**Decision**: Use **`pdfjs-dist`** (Mozilla's official PDF.js as an npm package) as a dev dependency, invoked from a Node script.

**Rationale**:
- Robust Unicode handling. The PDF contains Vietnamese with diacritics (`ă ơ ư ạ ậ ờ ớ ề ế …`). `pdfjs-dist` preserves these correctly via its `TextContent.items[].str` API.
- Maintained by Mozilla; no abandonment risk.
- Returns positional text items (`transform`, `width`) so we can reconstruct columns / detect headers vs. body if the PDF uses a tabular layout.
- Works in pure Node without a headless browser.

**Alternatives considered**:
- **`pdf-parse`** — simpler API, but its text reconstruction collapses multi-column layouts and has known issues with Vietnamese diacritics on certain font encodings.
- **`pdf2json`** — outputs structured JSON, but maintenance is uneven and Unicode handling is less predictable than pdfjs.
- **Manual copy-paste from a PDF viewer** — rejected per spec clarifications (FR-001a requires a committed script for reproducibility).
- **OCR (Tesseract)** — unnecessary; this PDF is text-based, not scanned imagery.

---

## Decision 2: Script execution model

**Decision**: Write the script in **TypeScript** and run it with **`tsx`** (added as a devDependency) via a one-off command: `pnpm tsx scripts/parse-500-common-words.ts`. Do **not** add an npm script entry to `package.json` — keep `package.json scripts` focused on app commands (`dev`, `build`, `start`, `lint`).

**Rationale**:
- TypeScript matches the rest of the codebase (`tsconfig.json`, `@/*` alias) and gives type-safety for the `VocabularyEntry` shape.
- `tsx` is a single dev dependency that runs `.ts` directly — no build step, no `ts-node` configuration cost.
- The script is run rarely (once, ideally), so a manual invocation is appropriate; cluttering `package.json` is not justified.

**Alternatives considered**:
- Plain JS (`.mjs`) — loses type-safety; the entry shape is non-trivial.
- Bundled into `next build` — over-engineering for a one-off extraction; would also pull `pdfjs-dist` into the app bundle.

---

## Decision 3: Entry parsing strategy

**Decision**: Extract raw text page-by-page via `pdfjs-dist`, then split into logical entries by heuristic line matching. Each entry is identified by a line that begins with the English word (typically followed by a part-of-speech marker like `(n)`, `(v)`, `(adj)` and/or a colon separating the Vietnamese meaning). Subsequent indented lines (if any) are treated as the example sentence.

**Rationale**:
- The Mingology PDF (per the source format common to Vietnamese vocabulary books) lists entries one per row in a roughly tabular form: `english_word (POS): vietnamese_meaning — example`.
- Heuristic line parsing is robust enough for 500 entries and is easily auditable / correctable.
- The script will write a brief `extraction-report.txt` (or console output) noting any line that failed to match the expected shape, so manual fixes are localized.

**Alternatives considered**:
- ML-based extraction (LLM call per page) — overkill for 500 structured entries, introduces non-determinism, costs API credits.
- Strict regex over the entire text blob — brittle; positional / per-line parsing is clearer.

---

## Decision 4: Deduplication semantics

**Decision**: Deduplicate by **lowercased English word**, keeping the **first occurrence** as authoritative (per FR-007).

**Rationale**: Case-insensitive matching catches accidental capitalization variants (e.g. `Apple` vs `apple`) while preserving the original casing from the first encounter. Spec explicitly mandates first-wins.

**Alternatives considered**:
- Case-sensitive dedupe — would let `Apple`/`apple` both through; unlikely intentional in a vocabulary list.
- Keep last occurrence — contradicts FR-007.

---

## Decision 5: Session distribution algorithm

**Decision**: Sequential **block** distribution — preserve PDF order, then assign sessions by:

- Sessions 1–16 contain 16 words each (256 words total).
- Sessions 17–32 contain 15 words each (240 words total).
- Total = 256 + 240 = 496. If exactly 500 entries are extracted, distribute the remaining 4 by giving sessions 17–20 one extra word each (so 4 of the back-half sessions hold 16 instead of 15).

In implementation terms: given `entries` (length N), and `S=32`, compute `base = Math.floor(N/S)`, `extra = N % S`. The first `extra` sessions get `base+1` words; the remaining get `base`. With `N=500`: `base=15, extra=20` → first 20 sessions get 16 words, last 12 sessions get 15 words.

**Rationale**:
- Implements the spec's "sequential block assignment, preserving the order words appear in the PDF" (FR-004).
- Guarantees every session has 15 or 16 entries (AC-2 of US3, SC-005's "no session < 10 or > 20").
- Generalizes cleanly if extraction returns 490–500 entries (per SC-001) without special casing.

**Alternatives considered**:
- Round-robin (`session = (index % 32) + 1`) — produces interleaved order, contradicts "preserve PDF order within a session" reading of FR-004.
- Equal split with floats — non-integer counts make no sense for whole word entries.

---

## Decision 6: Output formatting

**Decision**: Write JSON as a **top-level array** of entry objects, formatted with **2-space indentation and a trailing newline**, encoded as **UTF-8 without BOM**.

**Rationale**:
- Top-level array is the simplest shape for the app to consume (`import data from "@/data/..."` → `VocabularyEntry[]`).
- 2-space pretty-printing keeps the committed JSON diff-friendly for future manual corrections.
- UTF-8 no-BOM is the standard for cross-platform JSON; Vietnamese diacritics round-trip cleanly without surprising tools.

**Alternatives considered**:
- Minified JSON — smaller file, but harder to review/edit by hand.
- Wrapper object `{ "words": [...] }` — adds a layer with no benefit at this scale.
- JSON Lines (`.jsonl`) — incompatible with the `import json from '...'` pattern Next.js uses for static data.

---

## Decision 7: Validation inside the script

**Decision**: The script asserts the following before writing the output file, and exits non-zero on failure:

1. Entry count is between 490 and 500 (SC-001).
2. Every entry has a non-empty `word` (SC-002).
3. Every entry's `session` is an integer 1–32 (SC-003).
4. All 32 sessions are populated, and each session contains 10–20 words (SC-005).
5. Schema is uniform — every entry has exactly the keys `id, word, meaning, partOfSpeech, example, session`.

**Rationale**: Embedding the success criteria as runtime asserts removes the need for a separate test framework. If the PDF format ever drifts, the script fails loudly rather than producing silently-bad data.

**Alternatives considered**:
- Add `vitest` and write unit tests — adds tooling for a single-purpose script.
- Post-hoc validation via a JSON Schema validator (`ajv`) — overkill; the script controls both write and validate.

---

## Open questions

None. All Technical Context items resolved.
