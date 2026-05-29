# Phase 1 Data Model: Ms. Huong Lesson Browser

> **Revision 2026-05-29**: After recovering the image-based lesson content (see spec Clarifications revision), the model was extended. The authoritative types now live in `src/types/lesson.ts` and include: `PageImage` (extracted page image w/ dimensions), `SoundEntry` + `SoundChart` (4 speakable foundational charts), `LessonEntry.images` (embedded body page images), `LessonsData.referenceCharts` (Part 1 chart images), and `AdvancedSection.images`. The transcribed reference content (alphabet, consonants, monophthongs, diphthongs) and challenge words below remain the content source of truth; lesson practice-word tables are preserved as embedded images rather than transcribed.

This feature has **no runtime database** — all data is a single hand-authored JSON file (`src/data/lessons/ms-huong-lessons.json`) consumed at build time via `import`. The TypeScript shapes live in `src/types/lesson.ts`. This document is the **source of truth for the content** transcribed from the PDF; the JSON file must match it exactly.

## TypeScript Types (`src/types/lesson.ts`)

```ts
export interface CoursePart {
  part: number;   // 1..5
  vi: string;     // Vietnamese name
  en: string;     // English name
}

export interface LessonEntry {
  lesson: number;        // 1..16
  title: string;         // English lesson title
  soundFocus: string;    // sound(s) practised (IPA where applicable)
  part: number;          // book part this lesson belongs to (always 1 here)
  pageRange: string;     // source PDF page range, e.g. "27-28"
  sessions: [number, number]; // the two Day numbers, e.g. [1, 2]
}

export interface ChallengeWord {
  ordinal: number;   // position within the challenge (1-based)
  word: string;      // English word
  phonetic: string;  // IPA, slash-delimited, e.g. "/wʌn/"
}

export interface ChallengeEntry {
  challenge: number;  // 1..3
  titleVi: string;    // Vietnamese title, e.g. "Đọc số"
  titleEn: string;    // English gloss
  words: ChallengeWord[];
}

export interface AdvancedSection {
  titleEn: string;   // "Advanced Pronunciation"
  titleVi: string;   // Vietnamese description
  note: string;      // short acknowledgement note
  pageRange: string; // "65-72"
}

export interface LessonsData {
  courseParts: CoursePart[];
  lessons: LessonEntry[];
  challenges: ChallengeEntry[];
  advanced: AdvancedSection;
}
```

## Validation / Invariants

- `courseParts` has exactly **5** entries, `part` = 1..5 unique.
- `lessons` has exactly **16** entries, `lesson` = 1..16 unique and ascending.
- Each lesson's `sessions` pair = `[2*lesson - 1, 2*lesson]` → Lesson 1 → [1,2] … Lesson 16 → [31,32]. The 32 day numbers are contiguous 1..32 with no gaps/overlaps.
- `challenges` has exactly **3** entries with word counts **10 / 8 / 24** (total 42).
- Every `ChallengeWord.phonetic` is non-empty and slash-delimited.
- `advanced.titleEn` is present and non-empty (SC-007).

## Content — Course Parts

| part | vi | en |
|------|----|----|
| 1 | Học tổng quát 43 âm | General overview of 43 sounds |
| 2 | Luyện từ | Word practice |
| 3 | Luyện câu | Sentence practice |
| 4 | Luyện bài | Text / passage practice |
| 5 | Phụ lục 500 Vocabulary (Tự học thêm) | Appendix: 500 vocabulary (self-study) |

## Content — Lessons (Part 1)

| lesson | title | soundFocus | pageRange | sessions |
|--------|-------|------------|-----------|----------|
| 1 | Alphabets | Alphabet letters | 27-28 | [1, 2] |
| 2 | Review Consonant Sounds | All consonant sounds | 29-30 | [3, 4] |
| 3 | Review Vowel Sounds | All vowel sounds | 31-32 | [5, 6] |
| 4 | /__r/ Sounds | R-colored vowels | 33-35 | [7, 8] |
| 5 | /w/ and /r/ Sounds | /w/ vs /r/ | 36-37 | [9, 10] |
| 6 | /l/, /w/ and /r/ Sounds | /l/, /w/, /r/ | 38-40 | [11, 12] |
| 7 | /l/, /f/ and /v/ Sounds | /l/, /f/, /v/ | 41-42 | [13, 14] |
| 8 | /s/, /z/ and /ʃ/ Sounds | /s/, /z/, /ʃ/ | 43-45 | [15, 16] |
| 9 | /ʃ/ and /ʒ/ Sounds | /ʃ/ vs /ʒ/ | 46-47 | [17, 18] |
| 10 | /m/, /n/ and /ŋ/ Sounds | /m/, /n/, /ŋ/ | 48-50 | [19, 20] |
| 11 | /p/ and /b/ Sounds | /p/ vs /b/ | 51-52 | [21, 22] |
| 12 | /t/ and /d/ Sounds | /t/ vs /d/ | 53-54 | [23, 24] |
| 13 | /k/ and /g/ Sounds | /k/ vs /g/ | 55-56 | [25, 26] |
| 14 | /θ/ and /ð/ Sounds | /θ/ vs /ð/ | 57-58 | [27, 28] |
| 15 | /h/ and /j/ Sounds | /h/ vs /j/ | 59-60 | [29, 30] |
| 16 | /tʃ/ and /dʒ/ Sounds | /tʃ/ vs /dʒ/ | 61-62 | [31, 32] |

> Note: `part` = 1 for all 16 lessons (they are the lesson content of Part 1 of the book). Parts 2–5 have no extractable per-lesson content and exist as course-structure context only. Page ranges for lessons that span 3 PDF pages are given as the inclusive range observed during extraction.

## Content — Challenges (Part 1 pre-lesson)

### Challenge 1 — "Đọc số" (Read the numbers) — 10 words

| ordinal | word | phonetic |
|---------|------|----------|
| 1 | One | /wʌn/ |
| 2 | Two | /tuː/ |
| 3 | Three | /θriː/ |
| 4 | Four | /fɔːr/ |
| 5 | Five | /faɪv/ |
| 6 | Six | /sɪks/ |
| 7 | Seven | /ˈsevn/ |
| 8 | Eight | /eɪt/ |
| 9 | Nine | /naɪn/ |
| 10 | Ten | /ten/ |

### Challenge 2 — "Đọc từ khá giống nhau" (Read similar-looking words) — 8 words

| ordinal | word | phonetic |
|---------|------|----------|
| 1 | Like | /laɪk/ |
| 2 | Life | /laɪf/ |
| 3 | Line | /laɪn/ |
| 4 | Lime | /laɪm/ |
| 5 | Lie | /laɪ/ |
| 6 | Light | /laɪt/ |
| 7 | Liar | /ˈlaɪər/ |
| 8 | Lice | /laɪs/ |

### Challenge 3 — "Đọc từ phổ biến" (Read common words) — 24 words

| ordinal | word | phonetic |
|---------|------|----------|
| 1 | Exit | /ˈɛksɪt/ |
| 2 | Post | /poʊst/ |
| 3 | Upload | /ˈʌp.loʊd/ |
| 4 | Pizza | /ˈpiːt.sə/ |
| 5 | Acoustics | /əˈkuː.stɪks/ |
| 6 | Karate | /kəˈrɑː.ti/ |
| 7 | Image | /ˈɪ.mɪdʒ/ |
| 8 | Vegetable | /ˈvedʒ.tə.bəl/ |
| 9 | Voucher | /ˈvaʊ.tʃɚ/ |
| 10 | Feeling | /ˈfiː.lɪŋ/ |
| 11 | Vision | /ˈvɪʒ.ən/ |
| 12 | Laugh | /læf/ |
| 13 | Suggest | /səɡˈdʒest/ |
| 14 | Chef | /ʃef/ |
| 15 | Heart | /hɑːrt/ |
| 16 | Time | /taɪm/ |
| 17 | Audition | /ɑːˈdɪʃ.ən/ |
| 18 | Pause | /pɑːz/ |
| 19 | Nothing | /ˈnʌθ.ɪŋ/ |
| 20 | Question | /ˈkwes.tʃən/ |
| 21 | Fish | /fɪʃ/ |
| 22 | Christmas | /ˈkrɪs.məs/ |
| 23 | Karaoke | /ˌkæ.riˈoʊ.ki/ |
| 24 | Island | /ˈaɪ.lənd/ |

## Content — Advanced Section

| field | value |
|-------|-------|
| titleEn | Advanced Pronunciation |
| titleVi | Ôn tập so sánh nguyên âm và phụ âm; một số lưu ý khi ghép âm |
| note | Supplementary section after Lesson 16 — vowel/consonant comparison review and notes on combining sounds. Content is in the source book (image-based); not split into study sessions. |
| pageRange | 65-72 |
