"use client";

import { AnimatePresence, motion } from "motion/react";

import type { VocabularyEntry } from "@/types/vocabulary";

import { SpeakButton } from "./SpeakButton";

type WordCardProps = {
  entry: VocabularyEntry;
  expanded: boolean;
  onToggle: () => void;
};

function dash(value: string | null) {
  return value && value.trim().length > 0 ? value : "—";
}

export function WordCard({ entry, expanded, onToggle }: WordCardProps) {
  const exId = `ex-card-${entry.id}`;

  return (
    <li className="border border-dashed border-foreground/30 px-4 py-3 font-mono text-base text-foreground/80">
      <div className="flex items-start justify-between gap-2">
        <span className="text-accent/80">#{entry.frequency ?? "—"}</span>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          aria-controls={exId}
          className="border border-dashed border-foreground/40 px-2 py-0.5 text-sm text-foreground/70 transition-colors hover:border-accent hover:text-accent"
        >
          {expanded ? "[ - ]" : "[ + ]"}
        </button>
      </div>

      <div className="mt-1 flex items-center gap-2">
        <p className="break-words font-bold text-foreground">{entry.word}</p>
        <SpeakButton word={entry.word} />
      </div>
      <div className="mt-0.5 flex items-center gap-2 text-foreground/60">
        <p>{dash(entry.phonetic)}</p>
        <SpeakButton word={entry.word} />
      </div>
      <p className="mt-0.5 text-foreground/60">{dash(entry.viPartOfSpeech)}</p>
      <p className="mt-1 break-words">{dash(entry.meaning)}</p>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="ex"
            id={exId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3 border-t border-dashed border-foreground/30 pt-2 text-base">
              <p className="text-accent/80">
                {"> ex:"}{" "}
                <span className="break-words text-foreground/80">
                  {dash(entry.example)}
                </span>
              </p>
              <p className="mt-1 text-accent/60">
                {"> vi:"}{" "}
                <span className="break-words text-foreground/70">
                  {dash(entry.viExample)}
                </span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}
