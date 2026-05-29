import vocab500 from "@/data/vocabulary/500-common-words.json";
import vocab1000 from "@/data/vocabulary/1000-topic-words.json";
import { groupBySession as groupBySession500 } from "@/features/vocabulary-500/lib/group-by-session";
import { groupBySession as groupBySession1000 } from "@/features/vocabulary-1000/lib/group-by-session";
import type {
  PracticeEntry,
  PracticeSessionData,
  PracticeSource,
} from "@/types/practice";
import type { TopicVocabEntry } from "@/types/topic-vocabulary";
import type { VocabularyEntry } from "@/types/vocabulary";

const entries500 = vocab500 as VocabularyEntry[];
const entries1000 = vocab1000 as TopicVocabEntry[];

function hasMeaning(meaning: string | null): meaning is string {
  return meaning != null && meaning.trim().length > 0;
}

function sessionEntries(source: PracticeSource, session: number): PracticeEntry[] {
  if (source === "500") {
    const bucket = groupBySession500(entries500).get(session) ?? [];
    return bucket
      .filter((e) => hasMeaning(e.meaning))
      .map((e) => ({
        id: e.id,
        word: e.word,
        meaning: e.meaning as string,
        partOfSpeech: e.partOfSpeech,
        phonetic: e.phonetic,
        example: e.example,
      }));
  }

  const bucket = groupBySession1000(entries1000).get(session) ?? [];
  return bucket
    .filter((e) => hasMeaning(e.meaning))
    .map((e) => ({
      id: e.id,
      word: e.word,
      meaning: e.meaning,
      partOfSpeech: e.partOfSpeech,
      phonetic: e.phonetic,
      example: null,
    }));
}

/** Returns the practice context for a session, or null if the session is empty/invalid. */
export function loadPracticeSession(
  source: PracticeSource,
  session: number,
): PracticeSessionData | null {
  const entries = sessionEntries(source, session);
  if (entries.length === 0) return null;

  return {
    source,
    session,
    label: `Day ${session} · ${source} Words`,
    entries,
  };
}

/** All valid (source, session) pairs that have at least one practiceable entry. */
export function allPracticeParams(): Array<{
  source: PracticeSource;
  session: number;
}> {
  const params: Array<{ source: PracticeSource; session: number }> = [];
  for (const session of groupBySession500(entries500).keys()) {
    if (sessionEntries("500", session).length > 0) {
      params.push({ source: "500", session });
    }
  }
  for (const session of groupBySession1000(entries1000).keys()) {
    if (sessionEntries("1000", session).length > 0) {
      params.push({ source: "1000", session });
    }
  }
  return params;
}
