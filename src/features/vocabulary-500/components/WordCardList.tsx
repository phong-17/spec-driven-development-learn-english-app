"use client";

import type { VocabularyEntry } from "@/types/vocabulary";

import { WordCard } from "./WordCard";

type WordCardListProps = {
  entries: ReadonlyArray<VocabularyEntry>;
  isExpanded: (id: number) => boolean;
  onToggle: (id: number) => void;
  className?: string;
};

export function WordCardList({
  entries,
  isExpanded,
  onToggle,
  className,
}: WordCardListProps) {
  if (entries.length === 0) {
    return (
      <p
        className={`${className ?? ""} border border-dashed border-foreground/30 px-4 py-6 text-center font-mono text-sm text-foreground/60`}
      >
        [ NO WORDS FOUND ]
      </p>
    );
  }

  return (
    <ul className={`${className ?? ""} flex flex-col gap-3`}>
      {entries.map((entry) => (
        <WordCard
          key={entry.id}
          entry={entry}
          expanded={isExpanded(entry.id)}
          onToggle={() => onToggle(entry.id)}
        />
      ))}
    </ul>
  );
}
