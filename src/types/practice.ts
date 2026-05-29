export type PracticeSource = "500" | "1000";

export type PracticeExercise = "type" | "choose" | "flashcards";

/** Dataset-agnostic word used by every exercise. */
export interface PracticeEntry {
  id: number;
  word: string; // English — the answer in Type / Choose-front / Flash-back
  meaning: string; // Vietnamese — required (null-meaning entries are filtered out)
  partOfSpeech: string | null;
  phonetic: string | null;
  example: string | null; // English example sentence (500 set); null for 1000 set
}

/** Context resolved by the route shell and passed to the client browser. */
export interface PracticeSessionData {
  source: PracticeSource;
  session: number; // 1..32
  label: string; // e.g. "Day 5 · 500 Words"
  entries: PracticeEntry[]; // stable (source) order; client shuffles per exercise
}

/** One multiple-choice question for the Choose-the-Meaning exercise. */
export interface MeaningChoice {
  entryId: number;
  word: string;
  options: string[]; // 1..4 Vietnamese meanings, shuffled
  correct: string; // the correct meaning (one of options)
}
