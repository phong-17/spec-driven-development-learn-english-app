# Quickstart — Run the 1000-topic-words PDF extraction

**Feature**: `002-parse-topic-vocab-pdf` · **Date**: 2026-05-28

This is the operator-facing runbook for producing `src/data/vocabulary/1000-topic-words.json` from the topic-based PDF.

## Prerequisites

- Node 20+ and pnpm installed.
- The source PDF present at the repo root:
  - `1000 từ vựng tiếng Anh theo chủ đề.pdf`
- `pdfjs-dist` and `tsx` already installed as devDependencies (from feature 001). If you're on a fresh clone, run `pnpm install` once.

## Run the extraction

From the repo root:

```bash
pnpm tsx scripts/parse-1000-topic-words.ts
```

Expected output (approximate):

```text
[parse-1000] Reading PDF: 1000 từ vựng tiếng Anh theo chủ đề.pdf
[parse-1000] Pages parsed: NN
[parse-1000] Raw rows found: ~1000
[parse-1000] Categories detected: NN
[parse-1000] After validation: ~1000 entries
[parse-1000] Session sizes — 1:32 2:32 ... 8:32 9:31 ... 32:31
[parse-1000] Wrote: src/data/vocabulary/1000-topic-words.json
[parse-1000] ✓ Done in N.NN s
```

If the script exits non-zero, read the printed assertion failure; the JSON file is **not** written when validation fails.

## Verify the result

```bash
# 1. JSON is valid and within count range
node -e "const d=JSON.parse(require('fs').readFileSync('src/data/vocabulary/1000-topic-words.json','utf8')); console.log('count:', d.length)"
# → prints a number in [900, 1050]

# 2. Vietnamese diacritics round-trip
node -e "const d=JSON.parse(require('fs').readFileSync('src/data/vocabulary/1000-topic-words.json','utf8')); console.log(d.slice(0,3))"
# → first 3 entries display Vietnamese meanings with correct diacritics

# 3. All 32 sessions covered
node -e "const d=JSON.parse(require('fs').readFileSync('src/data/vocabulary/1000-topic-words.json','utf8')); const s=new Set(d.map(e=>e.session)); console.log(s.size, [...s].sort((a,b)=>a-b))"
# → 32, [1..32]

# 4. Category coverage
node -e "const d=JSON.parse(require('fs').readFileSync('src/data/vocabulary/1000-topic-words.json','utf8')); const c=new Set(d.map(e=>e.category)); console.log('categories:', c.size); console.log([...c].slice(0, 10))"
# → categories: N (≥ 2), with sample category names listed
```

## Commit

```bash
git add scripts/parse-1000-topic-words.ts \
        src/data/vocabulary/1000-topic-words.json \
        src/types/topic-vocabulary.ts \
        specs/002-parse-topic-vocab-pdf/
git commit -m "data(vocabulary): extract 1000 topic-based words from topic PDF"
```

## Re-running

The script is **idempotent against the same PDF**. Re-running it should produce a byte-identical JSON file (modulo `pdfjs-dist` version changes). If the JSON changes unexpectedly between runs, treat it as a regression and investigate before committing.

## Importing in the app

Any feature can consume the data via the path alias:

```ts
import topicWords from "@/data/vocabulary/1000-topic-words.json";
import type { TopicVocabEntry } from "@/types/topic-vocabulary";

const animals = (topicWords as TopicVocabEntry[]).filter(
  (e) => e.category.toLowerCase().includes("animal"),
);

const wordsForSession = (n: number): TopicVocabEntry[] =>
  (topicWords as TopicVocabEntry[]).filter((e) => e.session === n);
```

## Notes for parser maintenance

- The topic PDF's layout is **different** from the Mingology 500-words PDF — do not reuse column X-coordinates wholesale; probe this PDF separately.
- Category headings sit between rows of numbered entries. Detect them by the absence of a leading STT number on the line, and forward-propagate as the "current category" while iterating.
- Entries encountered before the first heading get `category = "Uncategorized"` (validated by `V-CT-1`).
- Same lessons as feature 001 may apply: mid-word column wraps, footer/header filtering by y-coordinate, Vietnamese diacritic handling. Reuse the helper patterns from `scripts/parse-500-common-words.ts` where applicable.
