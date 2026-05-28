"use client";

import type { VocabularyEntry } from "@/types/vocabulary";

import { WordRow } from "./WordRow";

type WordTableProps = {
  entries: ReadonlyArray<VocabularyEntry>;
  isExpanded: (id: number) => boolean;
  onToggle: (id: number) => void;
  className?: string;
};

const headerCell =
  "border-b-2 border-dashed border-accent/60 px-3 py-2 text-left font-mono text-sm uppercase tracking-wider text-accent";

export function WordTable({
  entries,
  isExpanded,
  onToggle,
  className,
}: WordTableProps) {
  if (entries.length === 0) {
    return (
      <p
        className={`${className ?? ""} border border-dashed border-foreground/30 px-4 py-6 text-center font-mono text-base text-foreground/60`}
      >
        [ NO WORDS FOUND ]
      </p>
    );
  }

  return (
    <table
      className={`${className ?? ""} w-full border-collapse border border-dashed border-foreground/30`}
    >
      <thead>
        <tr>
          <th className={`${headerCell} text-right`}>#</th>
          <th className={headerCell}>WORD</th>
          <th className={headerCell}>PHONETIC</th>
          <th className={headerCell}>POS (VI)</th>
          <th className={headerCell}>MEANING</th>
          <th className={`${headerCell} text-right`}>EX.</th>
        </tr>
      </thead>
      <tbody>
        {entries.map((entry) => (
          <WordRow
            key={entry.id}
            entry={entry}
            expanded={isExpanded(entry.id)}
            onToggle={() => onToggle(entry.id)}
          />
        ))}
      </tbody>
    </table>
  );
}
