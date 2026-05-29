"use client";

import { useState } from "react";

import { SpeakButton } from "@/features/vocabulary-500/components/SpeakButton";
import type { PracticeEntry } from "@/types/practice";

import { useQuizProgress } from "../hooks/useQuizProgress";
import { QuizSummary } from "./QuizSummary";
import { TerminalInput } from "./TerminalInput";

type TypeTheWordProps = {
  entries: PracticeEntry[];
};

export function TypeTheWord({ entries }: TypeTheWordProps) {
  const progress = useQuizProgress(entries);
  const [answer, setAnswer] = useState("");
  const [wasCorrect, setWasCorrect] = useState(false);

  if (progress.finished) {
    return (
      <QuizSummary
        correct={progress.correct}
        wrong={progress.wrong + progress.skipped}
        total={progress.total}
        elapsedMs={progress.elapsedMs}
        onRestart={() => {
          setAnswer("");
          progress.restart();
        }}
      />
    );
  }

  const current = progress.current;
  if (!current) return null;

  function handleSubmit() {
    if (answer.trim().length === 0) return;
    const correct =
      answer.trim().toLowerCase() === current!.word.trim().toLowerCase();
    setWasCorrect(correct);
    progress.submit(correct);
  }

  function handleNext() {
    setAnswer("");
    progress.next();
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="font-mono text-sm uppercase tracking-wider text-foreground/40">
        {progress.index + 1} / {progress.total}
      </p>

      <div className="flex flex-col gap-1 font-mono">
        {current.partOfSpeech ? (
          <span className="text-sm text-foreground/50">
            ({current.partOfSpeech})
          </span>
        ) : null}
        <p className="text-2xl font-bold text-foreground">{current.meaning}</p>
      </div>

      {progress.phase === "answering" ? (
        <>
          <TerminalInput
            value={answer}
            onChange={setAnswer}
            onSubmit={handleSubmit}
          />
          <button
            type="button"
            onClick={progress.skip}
            className="self-start font-mono text-sm uppercase tracking-wider text-foreground/40 transition-colors hover:text-accent"
          >
            [ SKIP ]
          </button>
        </>
      ) : (
        <div className="flex flex-col gap-3 font-mono">
          {wasCorrect ? (
            <p className="text-lg text-accent">[ CORRECT ]</p>
          ) : (
            <p className="text-lg text-foreground/80">
              [ WRONG ] →{" "}
              <span className="font-bold text-accent">
                &quot;{current.word}&quot;
              </span>
            </p>
          )}
          <div className="flex items-center gap-2 text-base text-foreground/70">
            <span className="font-bold text-foreground">{current.word}</span>
            {current.phonetic ? <span>{current.phonetic}</span> : null}
            <SpeakButton word={current.word} />
          </div>
          <button
            type="button"
            autoFocus
            onClick={handleNext}
            className="self-start border border-dashed border-accent/50 px-3 py-1.5 text-sm uppercase tracking-wider text-accent transition-colors hover:border-accent"
          >
            [ NEXT → ]
          </button>
        </div>
      )}
    </div>
  );
}
