// Extraction script for `1000 từ vựng tiếng Anh theo chủ đề.pdf`.
//
// Reads the source PDF from the project root, parses its 4-column vocabulary
// table (STT | word + POS | phonetic | meaning) with category headings
// interleaved between word groups, assigns each entry to one of 32 study
// sessions via sequential block distribution, validates the result against
// the success criteria, and writes the JSON output to
// `src/data/vocabulary/1000-topic-words.json`.
//
// Run with: pnpm tsx scripts/parse-1000-topic-words.ts

import * as fs from "node:fs";
import * as path from "node:path";
import type { TopicVocabEntry } from "../src/types/topic-vocabulary";

const PDF_FILENAME = "1000 từ vựng tiếng Anh theo chủ đề.pdf";
const OUTPUT_PATH = "src/data/vocabulary/1000-topic-words.json";
const TOTAL_SESSIONS = 32;

// Column X-coordinate ranges (derived from probing page 1+2 of the source PDF).
const COL_STT      = { min:  80, max: 110 };
const COL_WORD     = { min: 110, max: 240 };
const COL_PHONETIC = { min: 240, max: 385 };
const COL_MEANING  = { min: 385, max: 700 };

// y-coordinate filters
const PAGE_TITLE_MIN_Y = 720; // anything at y > this on any page is the running title
const FOOTER_MAX_Y = 70;      // anything at y < this is a footer / page number / link

// Tolerance for grouping items into the same logical y-line.
const Y_TOLERANCE = 2;

// Maximum y-distance (in PDF units) for a continuation line to attach to a
// row. Normal multi-line wraps observed are ≤20 units away; the POS legend at
// the end of the PDF sits ≥40 units below its nearest row. 25 is a safe cap.
const MAX_CONTINUATION_DISTANCE = 25;

type RawItem = { str: string; x: number; y: number };
type YLine = { y: number; items: RawItem[] };
type RawRow = {
  rawStt: string;
  rawWord: string;
  rawPhonetic: string;
  rawMeaning: string;
  category: string;
};

function inCol(x: number, col: { min: number; max: number }) {
  return x >= col.min && x < col.max;
}

function normalizeWhitespace(s: string) {
  return s.replace(/\s+/g, " ").trim();
}

function assert(cond: boolean, msg: string): asserts cond {
  if (!cond) {
    console.error(`[parse-1000] ASSERTION FAILED: ${msg}`);
    process.exit(1);
  }
}

// Group items into y-lines (each line = items sharing a y within tolerance).
function groupByY(items: RawItem[]): YLine[] {
  if (items.length === 0) return [];
  const sorted = [...items].sort((a, b) => b.y - a.y);
  const lines: YLine[] = [];
  let current: YLine = { y: sorted[0].y, items: [] };
  for (const it of sorted) {
    if (Math.abs(it.y - current.y) <= Y_TOLERANCE) {
      current.items.push(it);
    } else {
      if (current.items.length > 0) lines.push(current);
      current = { y: it.y, items: [it] };
    }
  }
  if (current.items.length > 0) lines.push(current);
  return lines;
}

// Concat items in a y-line in x order. Items already include their own spaces.
function lineText(line: YLine): string {
  return [...line.items].sort((a, b) => a.x - b.x).map((it) => it.str).join("");
}

// Detect the STT integer in a y-line, if any. Returns the string value, or null.
function findStt(line: YLine): string | null {
  for (const it of line.items) {
    if (inCol(it.x, COL_STT) && /^\d+$/.test(it.str.trim())) {
      return it.str.trim();
    }
  }
  return null;
}

// Identify the column header row ("STT | TỪ VỰNG | PHIÊN ÂM | NGHĨA CỦA TỪ").
function isColumnHeader(line: YLine): boolean {
  const text = normalizeWhitespace(lineText(line));
  return /^STT\b/.test(text) || /TỪ VỰNG/.test(text);
}

// Identify a category heading: no STT, contains the "ENGLISH - VIETNAMESE"
// hyphen pattern characteristic of this PDF's section titles, and sits at the
// centered x position (~250). Examples: "JOB - NGHỀ NGHIỆP", "FRUIT - TRÁI CÂY".
function isCategoryHeading(line: YLine): boolean {
  if (findStt(line) !== null) return false;
  if (line.y > PAGE_TITLE_MIN_Y) return false;
  if (isColumnHeader(line)) return false;
  const text = normalizeWhitespace(lineText(line));
  if (text.length < 3) return false;
  // Section titles always use the "ENGLISH - VIETNAMESE" pattern. Without this
  // separator a centered line is almost certainly a wrapped meaning fragment.
  if (!/ [-–—] /.test(text)) return false;
  // Headings sit roughly centered (x of first item between 150 and 320).
  // Meaning continuations start at x ≈ 388.5, so this excludes them.
  const firstItem = [...line.items].sort((a, b) => a.x - b.x)[0];
  if (firstItem.x < 150 || firstItem.x > 320) return false;
  return true;
}

// PoS labels that may appear wrapped mid-word in narrow renderings.
// (Not currently observed in this PDF, but kept for safety/consistency.)
const POS_NORMALIZATION: Record<string, string> = {};

function normalizePos(s: string): string {
  return POS_NORMALIZATION[s] ?? s;
}

// Split a combined "word + (pos)" cell into separate `word` and `partOfSpeech`.
// The PoS marker is always the LAST parenthetical group in the cell. Examples:
//   "accountant (n)"             → word="accountant",            pos="n"
//   "actor/ actress (n)"         → word="actor/ actress",        pos="n"
//   "exam (n) examination"       → word="exam / examination",    pos="n"
//   "Fahrenheit (degree) (adj)"  → word="Fahrenheit (degree)",   pos="adj"
function splitWordAndPos(combined: string): {
  word: string;
  partOfSpeech: string | null;
} {
  const trimmed = combined.trim();
  const matches = [...trimmed.matchAll(/\(([^)]+)\)/g)];
  if (matches.length === 0) {
    return { word: trimmed, partOfSpeech: null };
  }
  const last = matches[matches.length - 1];
  const lastStart = last.index ?? 0;
  const lastEnd = lastStart + last[0].length;
  const before = trimmed.substring(0, lastStart).trim();
  const after = trimmed.substring(lastEnd).trim();
  const word = [before, after].filter((s) => s.length > 0).join(" / ");
  return {
    word,
    partOfSpeech: last[1].trim().toLowerCase() || null,
  };
}

// Pair each non-STT, non-heading item with its closest STT row, where headings
// act as hard barriers (an item cannot be assigned across a heading).
function buildRows(
  lines: YLine[],
  initialCategory: string,
): { rows: RawRow[]; lastCategory: string } {
  // First pass: classify lines.
  type ClassifiedLine =
    | { kind: "title"; line: YLine }
    | { kind: "header"; line: YLine }
    | { kind: "heading"; line: YLine; text: string }
    | { kind: "row"; line: YLine; stt: string }
    | { kind: "continuation"; line: YLine };

  const classified: ClassifiedLine[] = [];
  for (const line of lines) {
    if (line.y > PAGE_TITLE_MIN_Y) {
      classified.push({ kind: "title", line });
      continue;
    }
    if (isColumnHeader(line)) {
      classified.push({ kind: "header", line });
      continue;
    }
    const stt = findStt(line);
    if (stt !== null) {
      classified.push({ kind: "row", line, stt });
      continue;
    }
    if (isCategoryHeading(line)) {
      classified.push({
        kind: "heading",
        line,
        text: normalizeWhitespace(lineText(line)),
      });
      continue;
    }
    classified.push({ kind: "continuation", line });
  }

  // Second pass: walk in order. For each row, also gather any
  // "continuation" lines that sit between previous anchor and this row
  // (these belong to whichever row is closer in y, but never across a heading).
  const rows: RawRow[] = [];
  let currentCategory = initialCategory;

  // Index of last anchor (heading | row | title | header). Continuations
  // get attached to the closer of the previous-anchor-row and next-anchor-row.
  type Anchor =
    | { kind: "row"; idx: number; row: RawRow; y: number }
    | { kind: "barrier"; y: number }; // heading / title / header
  const anchors: Anchor[] = [];
  // Track continuations awaiting attachment between two anchors.
  const pendingContinuations: YLine[] = [];

  const flushPending = () => {
    // Attach each pending continuation to the closer of the previous-row and
    // next-row anchors, IF there's a row anchor and no barrier between them.
    if (pendingContinuations.length === 0) return;
    // Find previous and next row anchors in `anchors`.
    let prevRow: Anchor | null = null;
    for (let i = anchors.length - 1; i >= 0; i--) {
      if (anchors[i].kind === "barrier") break; // barrier blocks lookup
      if (anchors[i].kind === "row") {
        prevRow = anchors[i];
        break;
      }
    }
    // The "next" row hasn't been seen yet at flush-time; this fn is called
    // with the next anchor already pushed onto `anchors`.
    let nextRow: Anchor | null = null;
    for (let i = anchors.length - 1; i >= 0; i--) {
      if (anchors[i].kind === "barrier") break;
      if (anchors[i].kind === "row") {
        nextRow = anchors[i];
        break;
      }
    }
    // Above logic accidentally picks the same anchor for prev/next when called
    // post-push; we fix by parameterizing. See actual call sites which pass
    // `prevRow` and `nextRow` explicitly. (This nested fn is unused — see
    // explicit attachment below.)
    void prevRow;
    void nextRow;
  };
  void flushPending;

  // Simpler implementation: collect rows first; collect headings with their y;
  // then for each continuation y-line, attach to closest row whose attachment
  // would not cross a heading.
  const rowAnchors: { idx: number; y: number; rawRow: RawRow }[] = [];
  const barriers: { y: number }[] = []; // headings & page-title positions

  // Build rows first (without continuation data).
  for (const c of classified) {
    if (c.kind === "row") {
      const rowItems = c.line.items.filter(
        (it) => !(inCol(it.x, COL_STT) && /^\d+$/.test(it.str.trim())),
      );
      const wordItems = rowItems.filter((it) => inCol(it.x, COL_WORD));
      const phoneticItems = rowItems.filter((it) => inCol(it.x, COL_PHONETIC));
      const meaningItems = rowItems.filter((it) => inCol(it.x, COL_MEANING));
      const rawRow: RawRow = {
        rawStt: c.stt,
        rawWord: normalizeWhitespace(
          [...wordItems].sort((a, b) => a.x - b.x).map((it) => it.str).join(""),
        ),
        rawPhonetic: normalizeWhitespace(
          [...phoneticItems].sort((a, b) => a.x - b.x).map((it) => it.str).join(""),
        ),
        rawMeaning: normalizeWhitespace(
          [...meaningItems].sort((a, b) => a.x - b.x).map((it) => it.str).join(""),
        ),
        category: currentCategory,
      };
      rows.push(rawRow);
      rowAnchors.push({ idx: rows.length - 1, y: c.line.y, rawRow });
    } else if (c.kind === "heading") {
      barriers.push({ y: c.line.y });
      currentCategory = c.text;
      // From here on, new rows take the new category.
    } else if (c.kind === "title" || c.kind === "header") {
      barriers.push({ y: c.line.y });
    }
  }

  // Now re-walk, attaching continuations to the closest row (no barrier crossing).
  for (const c of classified) {
    if (c.kind !== "continuation") continue;
    const yCont = c.line.y;

    // Find closest row anchor above and below, not separated by a barrier.
    let above: { idx: number; y: number; rawRow: RawRow } | null = null;
    let below: { idx: number; y: number; rawRow: RawRow } | null = null;

    for (const r of rowAnchors) {
      if (r.y > yCont) {
        // r is above the continuation. Check no barrier between r.y and yCont.
        const blocked = barriers.some((b) => b.y < r.y && b.y > yCont);
        if (!blocked) {
          if (!above || r.y < above.y) above = r; // pick the closest above
        }
      } else if (r.y < yCont) {
        // r is below. Check no barrier between yCont and r.y.
        const blocked = barriers.some((b) => b.y > r.y && b.y < yCont);
        if (!blocked) {
          if (!below || r.y > below.y) below = r; // pick the closest below
        }
      }
    }

    let target: typeof above = null;
    if (above && below) {
      target = Math.abs(above.y - yCont) <= Math.abs(below.y - yCont)
        ? above
        : below;
    } else {
      target = above ?? below;
    }
    if (!target) continue; // orphan, skip

    // Reject continuations too far from their nearest row — these are
    // typically the POS legend or other end-of-document boilerplate.
    if (Math.abs(target.y - yCont) > MAX_CONTINUATION_DISTANCE) continue;

    // Append the continuation line's items to the target row's appropriate column.
    const wordItems = c.line.items.filter((it) => inCol(it.x, COL_WORD));
    const phoneticItems = c.line.items.filter((it) => inCol(it.x, COL_PHONETIC));
    const meaningItems = c.line.items.filter((it) => inCol(it.x, COL_MEANING));

    const append = (existing: string, fresh: RawItem[]): string => {
      if (fresh.length === 0) return existing;
      const text = [...fresh].sort((a, b) => a.x - b.x).map((it) => it.str).join("");
      const t = normalizeWhitespace(text);
      if (t.length === 0) return existing;
      return existing.length === 0 ? t : `${existing} ${t}`;
    };

    target.rawRow.rawWord = append(target.rawRow.rawWord, wordItems);
    target.rawRow.rawPhonetic = append(target.rawRow.rawPhonetic, phoneticItems);
    target.rawRow.rawMeaning = append(target.rawRow.rawMeaning, meaningItems);
  }

  return { rows, lastCategory: currentCategory };
}

async function extractRawRows(): Promise<RawRow[]> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const pdfPath = path.resolve(process.cwd(), PDF_FILENAME);
  console.log(`[parse-1000] Reading PDF: ${PDF_FILENAME}`);
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjs.getDocument({ data }).promise;
  console.log(`[parse-1000] Pages parsed: ${doc.numPages}`);

  const allRows: RawRow[] = [];
  let currentCategory = "Uncategorized";

  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const content = await page.getTextContent();

    const items: RawItem[] = [];
    for (const it of content.items) {
      if (!("str" in it)) continue;
      const item = it as { str: string; transform: number[] };
      if (item.str.length === 0 || item.str.trim().length === 0) continue;
      const y = item.transform[5];
      if (y < FOOTER_MAX_Y) continue;
      items.push({ str: item.str, x: item.transform[4], y });
    }

    const lines = groupByY(items);
    const { rows, lastCategory } = buildRows(lines, currentCategory);
    allRows.push(...rows);
    currentCategory = lastCategory;
  }

  console.log(`[parse-1000] Raw rows found: ${allRows.length}`);
  return allRows;
}

function assignSession(i: number, total: number): number {
  const base = Math.floor(total / TOTAL_SESSIONS);
  const extra = total % TOTAL_SESSIONS;
  const bigBlock = extra * (base + 1);
  if (i < bigBlock) {
    return Math.floor(i / (base + 1)) + 1;
  }
  return Math.floor((i - bigBlock) / base) + extra + 1;
}

function buildEntries(rows: RawRow[]): TopicVocabEntry[] {
  const n = rows.length;
  return rows.map((r, i) => {
    const stt = /^\d+$/.test(r.rawStt) ? parseInt(r.rawStt, 10) : null;
    const { word, partOfSpeech } = splitWordAndPos(r.rawWord);
    const phonetic = r.rawPhonetic === "" ? null : r.rawPhonetic;
    const meaning = r.rawMeaning;
    const category = r.category === "" ? "Uncategorized" : r.category;
    return {
      id: i + 1,
      stt,
      word,
      partOfSpeech: partOfSpeech ? normalizePos(partOfSpeech) : null,
      phonetic,
      meaning,
      category,
      session: assignSession(i, n),
    };
  });
}

function validate(entries: TopicVocabEntry[]) {
  // SC-001: entry count in [900, 1050]
  assert(
    entries.length >= 900 && entries.length <= 1050,
    `entry count ${entries.length} not in [900, 1050]`,
  );

  // SC-002: every entry has non-empty word
  assert(
    entries.every((e) => typeof e.word === "string" && e.word.length > 0),
    "some entries have empty/missing word",
  );

  // SC-003: every entry has non-null, non-empty category
  assert(
    entries.every(
      (e) => typeof e.category === "string" && e.category.length > 0,
    ),
    "some entries have null/empty category",
  );

  // SC-007: at least 2 distinct categories
  const distinctCategories = new Set(entries.map((e) => e.category));
  assert(
    distinctCategories.size >= 2,
    `expected ≥2 distinct categories, got ${distinctCategories.size}`,
  );

  // Schema uniformity
  const expectedKeys = [
    "id",
    "stt",
    "word",
    "partOfSpeech",
    "phonetic",
    "meaning",
    "category",
    "session",
  ];
  for (const e of entries) {
    const keys = Object.keys(e);
    assert(
      keys.length === expectedKeys.length &&
        keys.every((k, idx) => k === expectedKeys[idx]),
      `entry id=${e.id} has wrong key set: ${JSON.stringify(keys)}`,
    );
  }

  // SC-004: session ∈ 1..32
  assert(
    entries.every(
      (e) => Number.isInteger(e.session) && e.session >= 1 && e.session <= 32,
    ),
    "some entries have invalid session value",
  );

  // SC-005: all 32 sessions appear; max-min difference ≤ 1
  const sizes = new Map<number, number>();
  for (const e of entries) sizes.set(e.session, (sizes.get(e.session) ?? 0) + 1);
  assert(
    sizes.size === TOTAL_SESSIONS,
    `expected ${TOTAL_SESSIONS} sessions, got ${sizes.size}`,
  );
  const sizeValues = [...sizes.values()];
  const maxSize = Math.max(...sizeValues);
  const minSize = Math.min(...sizeValues);
  assert(
    maxSize - minSize <= 1,
    `session size spread (max=${maxSize} min=${minSize}) > 1`,
  );

  // Logging
  console.log(`[parse-1000] Distinct categories: ${distinctCategories.size}`);
  const catCounts = [...entries.reduce(
    (m, e) => m.set(e.category, (m.get(e.category) ?? 0) + 1),
    new Map<string, number>(),
  )].sort((a, b) => b[1] - a[1]);
  console.log(`[parse-1000] Top 10 categories by entry count:`);
  for (const [cat, count] of catCounts.slice(0, 10)) {
    console.log(`  - ${cat}: ${count}`);
  }
  const uncategorizedCount = entries.filter(
    (e) => e.category === "Uncategorized",
  ).length;
  if (uncategorizedCount > 0) {
    console.log(
      `[parse-1000] ⚠ ${uncategorizedCount} entries fell back to "Uncategorized" (no heading seen yet at extraction time)`,
    );
  }

  const sessionDist = [...sizes.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([s, n]) => `${s}:${n}`)
    .join(" ");
  console.log(`[parse-1000] Session sizes — ${sessionDist}`);
}

async function main() {
  const t0 = Date.now();
  const rawRows = await extractRawRows();
  const entries = buildEntries(rawRows);
  validate(entries);

  const outFull = path.resolve(process.cwd(), OUTPUT_PATH);
  fs.mkdirSync(path.dirname(outFull), { recursive: true });
  fs.writeFileSync(outFull, JSON.stringify(entries, null, 2) + "\n", "utf8");
  console.log(`[parse-1000] Wrote: ${OUTPUT_PATH}`);

  const elapsed = ((Date.now() - t0) / 1000).toFixed(2);
  console.log(`[parse-1000] ✓ Done in ${elapsed}s`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
