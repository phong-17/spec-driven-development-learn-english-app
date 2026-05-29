import type { TopicVocabEntry } from "@/types/topic-vocabulary";

export type CategoryGroup = {
  category: string;
  words: TopicVocabEntry[];
};

/**
 * Splits an ordered list of entries into contiguous category groups.
 *
 * Assumes `entries` is in source-book order (see `groupBySession`), so all
 * entries sharing a `category` are adjacent. Walks the list once, starting a
 * new group whenever `category` changes. Groups are returned in
 * first-appearance order. Pure — does not mutate the input.
 */
export function groupByCategory(
  entries: ReadonlyArray<TopicVocabEntry>,
): CategoryGroup[] {
  const groups: CategoryGroup[] = [];

  for (const entry of entries) {
    const current = groups[groups.length - 1];
    if (current && current.category === entry.category) {
      current.words.push(entry);
    } else {
      groups.push({ category: entry.category, words: [entry] });
    }
  }

  return groups;
}
