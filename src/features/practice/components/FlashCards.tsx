"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";

import { SpeakButton } from "@/features/vocabulary-500/components/SpeakButton";
import type { PracticeEntry } from "@/types/practice";

import { useIsClient } from "../hooks/useIsClient";
import { shuffle } from "../lib/shuffle";
import { QuizSummary } from "./QuizSummary";

type FlashCardsProps = {
  entries: PracticeEntry[];
};

export function FlashCards({ entries }: FlashCardsProps) {
  const isClient = useIsClient();

  // First-pass order is shuffled only after hydration → no hydration mismatch.
  const pass1Order = useMemo(
    () => (isClient ? shuffle(entries) : entries),
    [isClient, entries],
  );

  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [knownIds, setKnownIds] = useState<Set<number>>(new Set());
  const [pass, setPass] = useState<1 | 2>(1);
  const [pass2Order, setPass2Order] = useState<PracticeEntry[]>([]);
  const [finished, setFinished] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const startRef = useRef(0);

  // Start the timer on mount (ref write, not setState). Restart resets it
  // directly in its handler.
  useEffect(() => {
    startRef.current = performance.now();
  }, []);

  if (finished) {
    return (
      <QuizSummary
        correct={knownIds.size}
        wrong={entries.length - knownIds.size}
        total={entries.length}
        elapsedMs={elapsedMs}
        onRestart={() => {
          startRef.current = performance.now();
          setIndex(0);
          setFlipped(false);
          setKnownIds(new Set());
          setPass(1);
          setPass2Order([]);
          setFinished(false);
          setElapsedMs(0);
        }}
        correctLabel="KNOWN"
        wrongLabel="UNKNOWN"
      />
    );
  }

  const queue = pass === 1 ? pass1Order : pass2Order;
  const current = queue[index];
  if (!current) return null;

  function mark(known: boolean) {
    const updatedKnown = known ? new Set(knownIds).add(current!.id) : knownIds;
    const atEnd = index + 1 >= queue.length;

    setKnownIds(updatedKnown);

    if (!atEnd) {
      setIndex(index + 1);
      setFlipped(false);
      return;
    }

    // End of pass: collect the cards still unknown (not in knownIds).
    const stillUnknown = queue.filter((e) => !updatedKnown.has(e.id));
    if (pass === 1 && stillUnknown.length > 0) {
      setPass2Order(shuffle(stillUnknown));
      setIndex(0);
      setPass(2);
      setFlipped(false);
      return;
    }

    setElapsedMs(performance.now() - startRef.current);
    setFinished(true);
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="font-mono text-sm uppercase tracking-wider text-foreground/40">
        {index + 1} / {queue.length}
        {pass === 2 ? " · REVIEW" : ""}
      </p>

      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        aria-label="Flip card"
        className="grid min-h-40 w-full border border-dashed border-foreground/40 p-6 text-left font-mono [transform-style:preserve-3d] transition-colors hover:border-accent"
        style={{ perspective: 800 }}
      >
        <motion.div
          className="grid"
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.4 }}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Front — Vietnamese meaning */}
          <div
            className="col-start-1 row-start-1 flex items-center justify-center"
            style={{ backfaceVisibility: "hidden" }}
          >
            <span className="text-center text-2xl font-bold text-foreground">
              {current.meaning}
            </span>
          </div>
          {/* Back — English word + phonetic + example */}
          <div
            className="col-start-1 row-start-1 flex flex-col items-center justify-center gap-1 text-center"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <span className="text-2xl font-bold text-accent">
              {current.word}
            </span>
            {current.phonetic ? (
              <span className="text-foreground/60">{current.phonetic}</span>
            ) : null}
            {current.example ? (
              <span className="text-sm text-foreground/50">
                {current.example}
              </span>
            ) : null}
          </div>
        </motion.div>
      </button>

      {flipped ? (
        <div className="flex flex-wrap items-center gap-3 font-mono">
          <SpeakButton word={current.word} />
          <button
            type="button"
            onClick={() => mark(true)}
            className="border border-dashed border-accent/50 px-3 py-1.5 text-sm uppercase tracking-wider text-accent transition-colors hover:border-accent"
          >
            [ KNOWN ]
          </button>
          <button
            type="button"
            onClick={() => mark(false)}
            className="border border-dashed border-foreground/40 px-3 py-1.5 text-sm uppercase tracking-wider text-foreground/70 transition-colors hover:border-accent hover:text-accent"
          >
            [ UNKNOWN ]
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setFlipped(true)}
          className="self-start border border-dashed border-foreground/40 px-3 py-1.5 font-mono text-sm uppercase tracking-wider text-foreground transition-colors hover:border-accent hover:text-accent"
        >
          [ FLIP ]
        </button>
      )}
    </div>
  );
}
