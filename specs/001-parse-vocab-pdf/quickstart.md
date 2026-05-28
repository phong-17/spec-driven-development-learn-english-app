# Quickstart — Run the 500-word PDF extraction

**Feature**: `001-parse-vocab-pdf` · **Date**: 2026-05-28

This is the operator-facing runbook for producing `src/data/vocabulary/500-common-words.json` from the Mingology PDF.

## Prerequisites

- Node 20+ and pnpm installed (already required by the project).
- The source PDF present at the repo root:
  - `500 Từ phổ biến nhất trong Tiếng Anh_Mingology.pdf`

## One-time setup

Install the two dev dependencies (only needed the first time the script is run on a fresh checkout):

```bash
pnpm add -D pdfjs-dist tsx
```

> These are **dev** dependencies. They are not bundled into the Next.js app — the app only ever reads the produced JSON.

## Run the extraction

From the repo root:

```bash
pnpm tsx scripts/parse-500-common-words.ts
```

Expected output (approximate):

```text
[parse-500] Reading PDF: 500 Từ phổ biến nhất trong Tiếng Anh_Mingology.pdf
[parse-500] Pages parsed: NN
[parse-500] Raw lines: NNNN
[parse-500] Entries extracted: 500
[parse-500] After dedupe: 500
[parse-500] Sessions assigned: 1..32 (sizes: 16×20, 15×12)
[parse-500] Writing: src/data/vocabulary/500-common-words.json
[parse-500] ✓ Done in N.NN s
```

If the script exits non-zero, read the printed assertion failure; the JSON file is **not** written when validation fails.

## Verify the result

```bash
# 1. JSON is valid
node -e "console.log(JSON.parse(require('fs').readFileSync('src/data/vocabulary/500-common-words.json','utf8')).length)"
# → prints a number in [490, 500]

# 2. Vietnamese diacritics round-trip
node -e "const d=JSON.parse(require('fs').readFileSync('src/data/vocabulary/500-common-words.json','utf8')); console.log(d.slice(0,3))"
# → first 3 entries should display Vietnamese meanings with correct diacritics

# 3. Sessions cover 1..32
node -e "const d=JSON.parse(require('fs').readFileSync('src/data/vocabulary/500-common-words.json','utf8')); const s=new Set(d.map(e=>e.session)); console.log(s.size, [...s].sort((a,b)=>a-b))"
# → 32, [1..32]
```

## Commit

```bash
git add scripts/parse-500-common-words.ts \
        src/data/vocabulary/500-common-words.json \
        src/types/vocabulary.ts \
        package.json pnpm-lock.yaml
git commit -m "data(vocabulary): extract 500 common words from Mingology PDF"
```

## Re-running

The script is **idempotent against the same PDF**. Re-running it should produce a byte-identical JSON file (modulo `pdfjs-dist` version changes). If the JSON changes unexpectedly between runs, treat that as a regression and investigate before committing.

## Importing in the app

Once the JSON exists, any feature can consume it via the path alias:

```ts
import vocabulary from "@/data/vocabulary/500-common-words.json";
import type { VocabularyEntry } from "@/types/vocabulary";

const wordsForSession = (n: number): VocabularyEntry[] =>
  (vocabulary as VocabularyEntry[]).filter((e) => e.session === n);
```
