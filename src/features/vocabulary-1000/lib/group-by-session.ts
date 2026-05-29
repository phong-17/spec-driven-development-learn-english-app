import type { TopicVocabEntry } from "@/types/topic-vocabulary";

export function groupBySession(
  entries: ReadonlyArray<TopicVocabEntry>,
): Map<number, TopicVocabEntry[]> {
  const groups = new Map<number, TopicVocabEntry[]>();

  for (const entry of entries) {
    const bucket = groups.get(entry.session);
    if (bucket) {
      bucket.push(entry);
    } else {
      groups.set(entry.session, [entry]);
    }
  }

  // Preserve source-book order within each session (sort by id ascending).
  // This keeps same-category entries contiguous and their `stt` runs intact.
  for (const bucket of groups.values()) {
    bucket.sort((a, b) => a.id - b.id);
  }

  return groups;
}
