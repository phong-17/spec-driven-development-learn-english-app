export interface TopicVocabEntry {
  id: number;
  stt: number | null;
  word: string;
  partOfSpeech: string | null;
  phonetic: string | null;
  meaning: string;
  category: string;
  session: number; // 1..32
}
