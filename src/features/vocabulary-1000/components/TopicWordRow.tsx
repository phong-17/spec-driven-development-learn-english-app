"use client";

import { SpeakButton } from "@/features/vocabulary-500/components/SpeakButton";
import type { TopicVocabEntry } from "@/types/topic-vocabulary";

type TopicWordRowProps = {
  entry: TopicVocabEntry;
};

const cellClass =
  "border-b border-dashed border-foreground/20 px-3 py-2 align-top";

function dash(value: string | null) {
  return value && value.trim().length > 0 ? value : "—";
}

export function TopicWordRow({ entry }: TopicWordRowProps) {
  return (
    <tr className="font-mono text-base text-foreground/80">
      <td className={`${cellClass} text-right text-accent/80`}>
        {entry.stt ?? "—"}
      </td>
      <td className={`${cellClass} font-bold text-foreground`}>
        <div className="flex items-center gap-2">
          <span>{entry.word}</span>
          <SpeakButton word={entry.word} />
        </div>
      </td>
      <td className={`${cellClass} text-foreground/60`}>
        {dash(entry.phonetic)}
      </td>
      <td
        className={`${cellClass} border-dashed border-accent/30 text-sm uppercase tracking-wider text-accent`}
      >
        {dash(entry.category)}
      </td>
      <td className={`${cellClass} text-foreground/60`}>
        {dash(entry.partOfSpeech)}
      </td>
      <td className={cellClass}>{dash(entry.meaning)}</td>
    </tr>
  );
}
