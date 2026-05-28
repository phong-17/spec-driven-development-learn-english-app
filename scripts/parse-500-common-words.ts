// Extraction script for `500 Từ phổ biến nhất trong Tiếng Anh_Mingology.pdf`.
//
// Reads the source PDF from the project root, parses the 8-column vocabulary
// table, deduplicates by lowercased word, assigns each entry to one of 32
// study sessions via sequential block distribution (PDF order preserved),
// validates the result against the success criteria, and writes the JSON
// output to `src/data/vocabulary/500-common-words.json`.
//
// Run with: pnpm tsx scripts/parse-500-common-words.ts

import * as fs from "node:fs";
import * as path from "node:path";
import type { VocabularyEntry } from "../src/types/vocabulary";

const PDF_FILENAME = "500 Từ phổ biến nhất trong Tiếng Anh_Mingology.pdf";
const OUTPUT_PATH = "src/data/vocabulary/500-common-words.json";
const TOTAL_SESSIONS = 32;

// Column X-coordinate ranges derived from probing the PDF.
// Layout: Frequency | Word | Vietnamese | PoS (EN) | Từ loại (VI) | Phonetic | Example (EN) | Dịch ví dụ (VI)
const COL_FREQ     = { min: 40,  max: 70  };
const COL_WORD     = { min: 95,  max: 135 };
const COL_MEAN     = { min: 140, max: 205 };
const COL_POS      = { min: 205, max: 248 };
const COL_VI_POS   = { min: 248, max: 300 };
const COL_PHONETIC = { min: 300, max: 362 };
const COL_EXAMPLE  = { min: 362, max: 558 };
const COL_VI_EX    = { min: 558, max: 900 };

type RawItem = { str: string; x: number; y: number };
type RawRow = {
  rawFrequency: number | null;
  rawWord: string;
  rawMeaning: string;
  rawPos: string;
  rawViPos: string;
  rawPhonetic: string;
  rawExample: string;
  rawViExample: string;
};

function inCol(x: number, col: { min: number; max: number }) {
  return x >= col.min && x < col.max;
}

function normalizeWhitespace(s: string) {
  return s.replace(/\s+/g, " ").trim();
}

// The PoS column is narrow, so long labels wrap mid-word with no hyphen
// (e.g. "conjunction" → "conjunc tion"). Rejoin the known split labels.
const POS_NORMALIZATION: Record<string, string> = {
  "adjectiv e": "adjective",
  "preposit ion": "preposition",
  "pronou n": "pronoun",
  "conjunc tion": "conjunction",
  "interject ion": "interjection",
  "indefinit e article": "indefinite article",
  "determi ner, adjectiv e": "determiner, adjective",
  "possessi ve determi ner": "possessive determiner",
  "number, adjectiv e": "number, adjective",
};
function normalizePos(s: string): string {
  return POS_NORMALIZATION[s] ?? s;
}

// Parse the word-column items into a clean headword and (if bleed-over was
// detected) a virtual meaning-column item carrying the bled meaning chars
// at the same y-line as the headword.
function parseWordColumn(
  items: RawItem[],
): { word: string; virtualMeaningItem: RawItem | null } {
  if (items.length === 0) return { word: "", virtualMeaningItem: null };

  const Y_TOLERANCE = 2;
  const sortedByY = [...items].sort((a, b) => b.y - a.y);
  const yGroups: RawItem[][] = [];
  let currentY = sortedByY[0].y;
  let currentGroup: RawItem[] = [];
  for (const it of sortedByY) {
    if (Math.abs(it.y - currentY) <= Y_TOLERANCE) {
      currentGroup.push(it);
    } else {
      yGroups.push(currentGroup);
      currentGroup = [it];
      currentY = it.y;
    }
  }
  if (currentGroup.length > 0) yGroups.push(currentGroup);

  if (yGroups.length > 1) {
    // Mid-word wrap: concat letters across y-lines, strip whitespace.
    const concat = yGroups
      .map((g) =>
        [...g].sort((a, b) => a.x - b.x).map((it) => it.str).join(""),
      )
      .join("");
    return { word: concat.replace(/\s+/g, ""), virtualMeaningItem: null };
  }

  // Single y-line. Concat items in x-order.
  const line = [...yGroups[0]].sort((a, b) => a.x - b.x).map((it) => it.str).join("");
  const normalized = normalizeWhitespace(line);
  const firstSpace = normalized.search(/\s/);
  if (firstSpace < 0) {
    return { word: normalized, virtualMeaningItem: null };
  }

  // Bleed-over: first token is the headword, remainder is meaning bleed.
  const word = normalized.substring(0, firstSpace);
  const bleed = normalized.substring(firstSpace + 1);
  const y = yGroups[0][0].y;
  return {
    word,
    virtualMeaningItem: { str: bleed, x: 144, y },
  };
}

// PDF text within a column wraps across multiple y-lines. Within a line,
// pdfjs items already include their own spacing — concat directly. Between
// lines (distinct y values), insert a space so words don't merge.
function joinColumnText(items: RawItem[]): string {
  if (items.length === 0) return "";
  const Y_TOLERANCE = 2;
  const sorted = [...items].sort((a, b) => b.y - a.y || a.x - b.x);
  const lines: string[][] = [];
  let currentY = sorted[0].y;
  let currentLine: string[] = [];
  for (const it of sorted) {
    if (Math.abs(it.y - currentY) <= Y_TOLERANCE) {
      currentLine.push(it.str);
    } else {
      lines.push(currentLine);
      currentLine = [it.str];
      currentY = it.y;
    }
  }
  if (currentLine.length > 0) lines.push(currentLine);
  return lines.map((line) => line.join("")).join(" ");
}

function assert(cond: boolean, msg: string): asserts cond {
  if (!cond) {
    console.error(`[parse-500] ASSERTION FAILED: ${msg}`);
    process.exit(1);
  }
}

async function extractRawRows(): Promise<RawRow[]> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const pdfPath = path.resolve(process.cwd(), PDF_FILENAME);
  console.log(`[parse-500] Reading PDF: ${PDF_FILENAME}`);
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjs.getDocument({ data }).promise;
  console.log(`[parse-500] Pages parsed: ${doc.numPages}`);

  const rows: RawRow[] = [];

  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const content = await page.getTextContent();

    const items: RawItem[] = [];
    for (const it of content.items) {
      if (!("str" in it)) continue;
      const item = it as { str: string; transform: number[] };
      if (item.str.length === 0) continue;
      const y = item.transform[5];
      // Skip footer ("Tăng tốc... Đặt sách ngay -> Tại đây!") at y~10
      // and the page number at y~23.
      if (y < 30) continue;
      items.push({ str: item.str, x: item.transform[4], y });
    }
    items.sort((a, b) => b.y - a.y || a.x - b.x);

    type Row = { freqItem: RawItem; items: RawItem[] };
    const pageRows: Row[] = [];

    for (const it of items) {
      // The PDF title "500 Từ phổ biến..." on page 1 sits at y~547 in the
      // freq column and would otherwise be parsed as a fake row. Skip it.
      const isPage1Title = p === 1 && it.y > 540;
      if (
        !isPage1Title &&
        inCol(it.x, COL_FREQ) &&
        /^\d+$/.test(it.str.trim())
      ) {
        pageRows.push({ freqItem: it, items: [it] });
      } else if (pageRows.length > 0) {
        pageRows[pageRows.length - 1].items.push(it);
      }
      // Items before the first numbered row on a page are headers/preamble — skip.
    }

    for (const row of pageRows) {
      const wordItems: RawItem[] = [];
      const meanItems: RawItem[] = [];
      const posItems: RawItem[] = [];
      const viPosItems: RawItem[] = [];
      const phoneticItems: RawItem[] = [];
      const exItems: RawItem[] = [];
      const viExItems: RawItem[] = [];

      for (const it of row.items) {
        if (inCol(it.x, COL_WORD))         wordItems.push(it);
        else if (inCol(it.x, COL_MEAN))    meanItems.push(it);
        else if (inCol(it.x, COL_POS))     posItems.push(it);
        else if (inCol(it.x, COL_VI_POS))  viPosItems.push(it);
        else if (inCol(it.x, COL_PHONETIC))phoneticItems.push(it);
        else if (inCol(it.x, COL_EXAMPLE)) exItems.push(it);
        else if (inCol(it.x, COL_VI_EX))   viExItems.push(it);
        // COL_FREQ items (the frequency number itself) are intentionally ignored here
      }

      const { word: rawWord, virtualMeaningItem } = parseWordColumn(wordItems);
      const augmentedMeanItems = virtualMeaningItem
        ? [...meanItems, virtualMeaningItem]
        : meanItems;

      // Example column uses square-bracket markers around the headword
      // (e.g. "[the] driver was killed"); strip the brackets but keep the word.
      const example = joinColumnText(exItems).replace(/\[([^\]]+?)\]/g, "$1");
      const viExample = joinColumnText(viExItems);

      const freqStr = row.freqItem.str.trim();
      const rawFrequency = /^\d+$/.test(freqStr) ? parseInt(freqStr, 10) : null;

      rows.push({
        rawFrequency,
        rawWord,
        rawMeaning: normalizeWhitespace(joinColumnText(augmentedMeanItems)),
        rawPos: normalizeWhitespace(joinColumnText(posItems)),
        rawViPos: normalizeWhitespace(joinColumnText(viPosItems)),
        rawPhonetic: normalizeWhitespace(joinColumnText(phoneticItems)),
        rawExample: normalizeWhitespace(example),
        rawViExample: normalizeWhitespace(viExample),
      });
    }
  }

  console.log(`[parse-500] Raw rows found: ${rows.length}`);
  return rows;
}

function dedupe(rows: RawRow[]): { kept: RawRow[]; removed: number } {
  const seen = new Set<string>();
  const kept: RawRow[] = [];
  let removed = 0;
  for (const r of rows) {
    if (r.rawWord === "") {
      removed++;
      continue;
    }
    const k = r.rawWord.toLowerCase();
    if (seen.has(k)) {
      removed++;
      continue;
    }
    seen.add(k);
    kept.push(r);
  }
  return { kept, removed };
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

function buildEntries(rows: RawRow[]): VocabularyEntry[] {
  const n = rows.length;
  return rows.map((r, i) => ({
    id: i + 1,
    frequency: r.rawFrequency,
    word: r.rawWord,
    meaning: r.rawMeaning === "" ? null : r.rawMeaning,
    partOfSpeech: r.rawPos === "" ? null : normalizePos(r.rawPos.toLowerCase()),
    viPartOfSpeech: r.rawViPos === "" ? null : r.rawViPos,
    phonetic: r.rawPhonetic === "" ? null : r.rawPhonetic,
    example: r.rawExample === "" ? null : r.rawExample,
    viExample: r.rawViExample === "" ? null : r.rawViExample,
    session: assignSession(i, n),
  }));
}

function validate(entries: VocabularyEntry[]) {
  // SC-001: total entry count in [450, 500]
  assert(
    entries.length >= 450 && entries.length <= 500,
    `entry count ${entries.length} not in [450, 500]`,
  );

  // SC-002: every entry has a non-empty word
  assert(
    entries.every((e) => typeof e.word === "string" && e.word.length > 0),
    "some entries have empty/missing word",
  );

  // Uniform key set in canonical order
  const expectedKeys = [
    "id", "frequency", "word", "meaning",
    "partOfSpeech", "viPartOfSpeech", "phonetic",
    "example", "viExample", "session",
  ];
  for (const e of entries) {
    const keys = Object.keys(e);
    assert(
      keys.length === expectedKeys.length &&
        keys.every((k, idx) => k === expectedKeys[idx]),
      `entry id=${e.id} has wrong key set: ${JSON.stringify(keys)}`,
    );
  }

  // SC-003: session is an integer 1..32
  assert(
    entries.every(
      (e) => Number.isInteger(e.session) && e.session >= 1 && e.session <= 32,
    ),
    "some entries have invalid session value",
  );

  // SC-005: all 32 sessions appear, each with 10..20 entries
  const sizes = new Map<number, number>();
  for (const e of entries) sizes.set(e.session, (sizes.get(e.session) ?? 0) + 1);
  assert(sizes.size === TOTAL_SESSIONS, `expected ${TOTAL_SESSIONS} sessions, got ${sizes.size}`);
  for (const [s, n] of sizes) {
    assert(n >= 10 && n <= 20, `session ${s} has ${n} entries (need 10..20)`);
  }

  const distribution = Array.from(sizes.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([s, n]) => `${s}:${n}`)
    .join(" ");
  console.log(`[parse-500] Session sizes — ${distribution}`);
}

async function main() {
  const t0 = Date.now();
  const rawRows = await extractRawRows();
  const { kept, removed } = dedupe(rawRows);
  console.log(`[parse-500] After dedupe: ${kept.length} (removed ${removed})`);

  const entries = buildEntries(kept);
  validate(entries);

  const outFull = path.resolve(process.cwd(), OUTPUT_PATH);
  fs.mkdirSync(path.dirname(outFull), { recursive: true });
  fs.writeFileSync(outFull, JSON.stringify(entries, null, 2) + "\n", "utf8");
  console.log(`[parse-500] Wrote: ${OUTPUT_PATH}`);

  const elapsed = ((Date.now() - t0) / 1000).toFixed(2);
  console.log(`[parse-500] ✓ Done in ${elapsed}s`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
