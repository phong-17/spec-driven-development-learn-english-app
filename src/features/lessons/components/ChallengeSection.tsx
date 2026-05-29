import { SpeakButton } from "@/features/vocabulary-500/components/SpeakButton";
import type { ChallengeEntry } from "@/types/lesson";

type ChallengeSectionProps = {
  challenge: ChallengeEntry;
};

export function ChallengeSection({ challenge }: ChallengeSectionProps) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="border-b border-dashed border-accent/50 pb-1 font-mono text-sm uppercase tracking-wider text-accent">
        {`── Challenge ${challenge.challenge}: ${challenge.titleVi} (${challenge.titleEn}) ──`}
      </h3>

      <ul className="flex flex-col">
        {challenge.words.map((entry) => (
          <li
            key={entry.ordinal}
            className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-dashed border-foreground/20 px-2 py-1.5 font-mono text-base text-foreground/80"
          >
            <span className="w-6 flex-shrink-0 text-right text-accent/80">
              {entry.ordinal}
            </span>
            <span className="font-bold text-foreground">{entry.word}</span>
            <SpeakButton word={entry.word} />
            <span className="break-words text-foreground/60">
              {entry.phonetic}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
