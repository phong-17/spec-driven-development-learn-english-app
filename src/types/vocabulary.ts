export interface VocabularyEntry {
  id: number;
  frequency: number | null; // original frequency number from the PDF (may have gaps)
  word: string;
  meaning: string | null;
  partOfSpeech: string | null;
  viPartOfSpeech: string | null;
  phonetic: string | null;
  example: string | null;
  viExample: string | null;
  session: number; // 1..32
}
