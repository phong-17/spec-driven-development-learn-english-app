"use client";

import { useMemo, useState } from "react";

import { SpeakButton } from "@/features/vocabulary-500/components/SpeakButton";
import type { PracticeEntry } from "@/types/practice";

import { useIsClient } from "../hooks/useIsClient";
import { useQuizProgress } from "../hooks/useQuizProgress";
import { buildChoices } from "../lib/build-choices";
import { QuizSummary } from "./QuizSummary";

type ChooseTheMeaningProps = {
  entries: PracticeEntry[];
};

export function ChooseTheMeaning({ entries }: ChooseTheMeaningProps) {
  const progress = useQuizProgress(entries);
  const isClient = useIsClient();
  const [selected, setSelected] = useState<string | null>(null);

  const current = progress.current;

  // Build choices only after hydration (option order uses Math.random); server
  // and first client render produce null → no hydration mismatch.
  const choice = useMemo(
    () => (isClient && current ? buildChoices(current, entries) : null),
    [isClient, current, entries],
  );

  if (progress.finished) {
    return (
      <QuizSummary
        correct={progress.correct}
        wrong={progress.wrong}
        total={progress.total}
        elapsedMs={progress.elapsedMs}
        onRestart={() => {
          setSelected(null);
          progress.restart();
        }}
      />
    );
  }

  if (!current || !choice) return null;

  function handleSelect(option: string) {
    if (progress.phase !== "answering") return;
    setSelected(option);
    progress.submit(option === choice!.correct);
  }

  function handleNext() {
    setSelected(null);
    progress.next();
  }

  const revealed = progress.phase === "revealed";

  return (
    <div className="flex flex-col gap-4">
      <p className="font-mono text-sm uppercase tracking-wider text-foreground/40">
        {progress.index + 1} / {progress.total}
      </p>

      <div className="flex items-center gap-2 font-mono">
        <span className="text-2xl font-bold text-foreground">
          {current.word}
        </span>
        {current.phonetic ? (
          <span className="text-foreground/50">{current.phonetic}</span>
        ) : null}
        <SpeakButton word={current.word} />
      </div>

      <ul className="flex flex-col gap-2">
        {choice.options.map((option) => {
          const isCorrect = option === choice.correct;
          const isSelected = option === selected;
          let stateClass =
            "border-foreground/30 text-foreground/80 hover:border-accent hover:text-accent";
          if (revealed && isCorrect) {
            stateClass = "border-accent text-accent";
          } else if (revealed && isSelected && !isCorrect) {
            stateClass = "border-foreground/30 text-foreground/40 line-through";
          }
          return (
            <li key={option}>
              <button
                type="button"
                disabled={revealed}
                onClick={() => handleSelect(option)}
                className={`w-full border border-dashed px-3 py-2 text-left font-mono text-base transition-colors ${stateClass}`}
              >
                {`[ ${option} ]`}
              </button>
            </li>
          );
        })}
      </ul>

      {revealed ? (
        <button
          type="button"
          autoFocus
          onClick={handleNext}
          className="self-start border border-dashed border-accent/50 px-3 py-1.5 font-mono text-sm uppercase tracking-wider text-accent transition-colors hover:border-accent"
        >
          [ NEXT → ]
        </button>
      ) : null}
    </div>
  );
}
