"use client";

import { SpeakButton } from "@/features/vocabulary-500/components/SpeakButton";
import type { TopicVocabEntry } from "@/types/topic-vocabulary";

type TopicWordCardProps = {
  entry: TopicVocabEntry;
};

function dash(value: string | null) {
  return value && value.trim().length > 0 ? value : "—";
}

export function TopicWordCard({ entry }: TopicWordCardProps) {
  return (
    <li className="border border-dashed border-foreground/30 px-4 py-3 font-mono text-base text-foreground/80">
      <span className="text-accent/80">#{entry.stt ?? "—"}</span>

      <div className="mt-1 flex items-center gap-2">
        <p className="break-words font-bold text-foreground">{entry.word}</p>
        <SpeakButton word={entry.word} />
      </div>
      <p className="mt-0.5 text-foreground/60">{dash(entry.phonetic)}</p>
      <p className="mt-0.5 text-foreground/60">{dash(entry.partOfSpeech)}</p>
      <p className="mt-1 break-words">{dash(entry.meaning)}</p>
    </li>
  );
}
