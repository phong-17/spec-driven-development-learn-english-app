# Phase 0 Research — Parse 1000 Topic-Based Vocabulary PDF to JSON

**Feature**: `002-parse-topic-vocab-pdf` · **Date**: 2026-05-28

All `NEEDS CLARIFICATION` items from Technical Context are resolved below. Where feature 001 has already settled a question, the decision is reused with a one-line rationale and a back-reference.

---

## Decision 1: PDF parsing library

**Decision**: Reuse `pdfjs-dist` (already a devDependency from feature 001), imported via the legacy build (`pdfjs-dist/legacy/build/pdf.mjs`) for Node compatibility.

**Rationale**:
- Already proven in this codebase on a similar Vietnamese-text PDF (feature 001's Mingology source).
- Robust Unicode/diacritic handling validated end-to-end on feature 001's output.
- No new package to install, no learning curve.

**Alternatives considered**: `pdf-parse` (rejected in feature 001 for diacritic issues), `pdf2json` (uneven maintenance), LLM extraction (overkill, non-deterministic, costs API credits).

---

## Decision 2: Script execution model

**Decision**: TypeScript script run via `tsx` — `pnpm tsx scripts/parse-1000-topic-words.ts`. Do not add an npm script entry to `package.json`.

**Rationale**: Identical reasoning to feature 001 — TypeScript matches the codebase, `tsx` is already installed, and the script is run rarely (ideally once). Keeping `package.json scripts` focused on app commands (`dev`, `build`, `start`, `lint`) avoids clutter.

---

## Decision 3: Row & category detection strategy

**Decision**: Identify entry rows by the per-book sequential number in the leftmost column (STT). Identify category headings by lines that visually stand alone (large font, no STT, no Vietnamese meaning column data) between groups of numbered rows. Maintain a "current category" variable while iterating rows in PDF order; assign it to each entry encountered.

**Rationale**:
- Topic books almost universally use a "heading then list" structure.
- The STT column gives a strong, machine-detectable signal for entry rows.
- Headings are detectable because they break the row pattern (no leading number, often on their own y-line).
- Forward-propagation matches how a human reader interprets the page.

**Alternatives considered**:
- Font-size-based heading detection (more accurate but `pdfjs-dist` font reporting is verbose and font naming varies). Use only if the simpler signal fails during probing.
- Detecting category headings by matching against a known list — rejected as brittle and requires hand-maintained dictionary.
- One-pass-per-page treating each page as a single category — rejected because a category may span multiple pages, and a page may contain multiple categories.

---

## Decision 4: `stt` semantics

**Decision**: `stt` reflects the per-book sequence number printed in the PDF's STT column — unique across the entire JSON file, 1 → ~1000. Resolved in `/speckit-clarify` session 2026-05-28.

**Rationale**: Globally unique numbers are easier to sort, cross-reference, and debug than per-category numbering that resets. Also consistent in spirit with how `frequency` works in `500-common-words.json`.

**Note on the relationship between `id` and `stt`**: `id` is the script-assigned 1-based array index (always sequential, no gaps). `stt` is the value extracted from the PDF (may have gaps if the source numbering skips, exactly as `frequency` does in feature 001). Both are stored side-by-side so callers can choose either depending on use case.

---

## Decision 5: `category` field language and missing-heading fallback

**Decision**: Store `category` exactly as it appears in the PDF (Vietnamese or bilingual text preserved as-is). When no category heading has been encountered before an entry, set `category = "Uncategorized"`. Both resolved in `/speckit-clarify` session 2026-05-28.

**Rationale**:
- As-is storage keeps the data source-faithful and avoids lossy translation. UI layer handles display formatting.
- `"Uncategorized"` fallback satisfies SC-003 (100% non-null) without forcing the script to abort or skip entries.
- A literal string fallback is searchable/filterable; `null` would force every UI consumer to handle a special case.

**Alternatives considered**:
- Normalize to English — rejected (lossy, would require a translation step or hand-built mapping).
- Allow `null` — rejected (relaxes SC-003 and creates UI complexity).
- Abort/skip — rejected (silently loses data and would create inconsistency vs feature 001).

---

## Decision 6: Session distribution algorithm

**Decision**: Sequential block distribution — identical algorithm to feature 001. Given `entries` of length `N`, compute `base = Math.floor(N/32)`, `extra = N % 32`. The first `extra` sessions get `base+1` words; the remaining get `base`. With `N=1000`: `base=31, extra=8` → first 8 sessions get 32 words each, last 24 sessions get 31 words each. Range stays within SC-005's "≤1 difference between sessions" constraint.

**Rationale**: Consistency with the existing `500-common-words.json` is more valuable than any alternative grouping. The 32-session structure is the app's organizing principle and both vocabulary sources must distribute the same way. Also satisfies SC-005 by construction (max difference always 1).

**Alternatives considered**:
- Group by category — would couple session size to category size (uneven). Rejected.
- Round-robin — interleaves PDF order; loses local coherence. Rejected.

---

## Decision 7: Output JSON formatting

**Decision**: Top-level JSON array of entry objects, 2-space indentation, trailing newline, UTF-8 without BOM. Same shape and formatting as `500-common-words.json`.

**Rationale**: Consistency with the existing vocabulary file makes app-side consumers symmetric (`import data from "@/data/vocabulary/..."` → `TopicVocabEntry[]`). 2-space pretty printing keeps the diff readable for future manual fixes.

**Alternatives considered**: Minified JSON (rejected for diff-friendliness), wrapper object `{ "words": [...] }` (no benefit at this scale), JSON Lines (incompatible with the static-import pattern).

---

## Decision 8: Runtime assertions inside the script

**Decision**: Embed the spec's success criteria as runtime assertions. The script exits non-zero on any failure and does **not** write the output file:

1. Entry count is in `[900, 1050]` (SC-001).
2. Every entry has a non-empty `word` (SC-002).
3. Every entry has a non-null `category` string (SC-003).
4. Every entry's `session` is an integer 1–32 (SC-004).
5. All 32 sessions populated, and `max(session_size) - min(session_size) ≤ 1` (SC-005).
6. At least 2 distinct category values present (SC-007).
7. Schema uniform — every entry has exactly the canonical key list in the canonical order.

**Rationale**: Same pattern as feature 001. Avoids a separate test framework while still catching regressions if the PDF format ever drifts or the script logic is changed.

---

## Open questions

None. All Technical Context items resolved.
