"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { PracticeEntry } from "@/types/practice";

import { shuffle } from "../lib/shuffle";
import { useIsClient } from "./useIsClient";

type Phase = "answering" | "revealed";

/**
 * Shared progress engine for the Type-the-Word and Choose-the-Meaning
 * exercises: holds the shuffled order, current index, answer phase, and
 * running counts. The order is shuffled only after hydration (gated by
 * `useIsClient`) so SSR and the first client render agree — no hydration
 * mismatch, and no setState inside an effect.
 *
 * Callers must only invoke `submit`/`skip` while `phase === "answering"`.
 */
export function useQuizProgress(entries: PracticeEntry[]) {
  const isClient = useIsClient();

  const order = useMemo(
    () => (isClient ? shuffle(entries) : entries),
    [isClient, entries],
  );

  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("answering");
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [skipped, setSkipped] = useState(0);
  const [finished, setFinished] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const startRef = useRef(0);

  // Start the timer on mount. Writes a ref (not state), so this is not a
  // setState-in-effect. Restart resets it directly in its handler.
  useEffect(() => {
    startRef.current = performance.now();
  }, []);

  const total = order.length;
  const current = order[index];

  const submit = useCallback((isCorrect: boolean) => {
    if (isCorrect) setCorrect((c) => c + 1);
    else setWrong((w) => w + 1);
    setPhase("revealed");
  }, []);

  const next = useCallback(() => {
    if (index + 1 >= total) {
      setElapsedMs(performance.now() - startRef.current);
      setFinished(true);
    } else {
      setIndex((i) => i + 1);
      setPhase("answering");
    }
  }, [index, total]);

  const skip = useCallback(() => {
    setSkipped((s) => s + 1);
    next();
  }, [next]);

  const restart = useCallback(() => {
    startRef.current = performance.now();
    setIndex(0);
    setPhase("answering");
    setCorrect(0);
    setWrong(0);
    setSkipped(0);
    setFinished(false);
    setElapsedMs(0);
  }, []);

  return {
    current,
    index,
    total,
    phase,
    correct,
    wrong,
    skipped,
    finished,
    elapsedMs,
    submit,
    skip,
    next,
    restart,
  };
}
