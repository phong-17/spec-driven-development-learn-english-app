export interface CoursePart {
  part: number; // 1..5
  vi: string; // Vietnamese name
  en: string; // English name
}

/** A page image extracted from the source PDF, served from /public/lessons/. */
export interface PageImage {
  src: string; // e.g. "/lessons/page-28-1.png"
  width: number; // intrinsic pixel width (for next/image)
  height: number; // intrinsic pixel height
  alt: string; // descriptive caption
}

/** One pronounceable sound in a foundational phonetics chart. */
export interface SoundEntry {
  symbol: string; // headline glyph — a letter ("A") or an IPA symbol ("/p/")
  word: string; // example English word; also the SpeakButton target
  phonetic?: string; // optional IPA of the symbol itself (used by the alphabet chart)
}

export interface SoundChart {
  id: string; // "alphabet" | "consonants" | "monophthongs" | "diphthongs"
  titleEn: string;
  titleVi: string;
  sounds: SoundEntry[];
}

export interface LessonEntry {
  lesson: number; // 1..16
  title: string; // English lesson title
  soundFocus: string; // sound(s) practised (IPA where applicable)
  part: number; // book part this lesson belongs to (always 1 here)
  pageRange: string; // source PDF page range, e.g. "27-28"
  sessions: [number, number]; // the two Day numbers, e.g. [1, 2]
  images: PageImage[]; // embedded body page image(s) — the lesson's full content
}

export interface ChallengeWord {
  ordinal: number; // position within the challenge (1-based)
  word: string; // English word
  phonetic: string; // IPA, slash-delimited, e.g. "/wʌn/"
}

export interface ChallengeEntry {
  challenge: number; // 1..3
  titleVi: string; // Vietnamese title, e.g. "Đọc số"
  titleEn: string; // English gloss
  words: ChallengeWord[];
}

export interface AdvancedSection {
  titleEn: string; // "Advanced Pronunciation"
  titleVi: string; // Vietnamese description
  note: string; // short acknowledgement note
  pageRange: string; // "65-72"
  images: PageImage[]; // embedded page images of the advanced section
}

export interface LessonsData {
  courseParts: CoursePart[];
  soundCharts: SoundChart[]; // 4 foundational speakable charts
  lessons: LessonEntry[];
  referenceCharts: PageImage[]; // Part 1 scanned phonetic-chart pages
  challenges: ChallengeEntry[];
  advanced: AdvancedSection;
}
