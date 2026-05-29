import type { MeaningChoice, PracticeEntry } from "@/types/practice";

import { shuffle } from "./shuffle";

/**
 * Build a multiple-choice question for one entry: the correct meaning plus up
 * to 3 distractor meanings sampled from other entries in the same session.
 * If fewer than 3 distinct distractors exist, returns fewer options (never
 * crashes — FR-009 edge case). `correct` is always present in `options`.
 */
export function buildChoices(
  correct: PracticeEntry,
  pool: ReadonlyArray<PracticeEntry>,
): MeaningChoice {
  const distractorMeanings = Array.from(
    new Set(
      pool
        .filter((e) => e.id !== correct.id && e.meaning !== correct.meaning)
        .map((e) => e.meaning),
    ),
  );

  const distractors = shuffle(distractorMeanings).slice(0, 3);
  const options = shuffle([correct.meaning, ...distractors]);

  return {
    entryId: correct.id,
    word: correct.word,
    options,
    correct: correct.meaning,
  };
}
