import type { VocabularyEntry } from "@/types/vocabulary";

export function groupBySession(
  entries: ReadonlyArray<VocabularyEntry>,
): Map<number, VocabularyEntry[]> {
  const groups = new Map<number, VocabularyEntry[]>();

  for (const entry of entries) {
    const bucket = groups.get(entry.session);
    if (bucket) {
      bucket.push(entry);
    } else {
      groups.set(entry.session, [entry]);
    }
  }

  for (const bucket of groups.values()) {
    bucket.sort((a, b) => {
      const af = a.frequency;
      const bf = b.frequency;
      if (af === null && bf === null) return a.id - b.id;
      if (af === null) return 1;
      if (bf === null) return -1;
      if (af !== bf) return af - bf;
      return a.id - b.id;
    });
  }

  return groups;
}
