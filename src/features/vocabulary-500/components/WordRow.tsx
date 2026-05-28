"use client";

import { AnimatePresence, motion } from "motion/react";

import type { VocabularyEntry } from "@/types/vocabulary";

import { SpeakButton } from "./SpeakButton";

type WordRowProps = {
  entry: VocabularyEntry;
  expanded: boolean;
  onToggle: () => void;
};

const cellClass =
  "border-b border-dashed border-foreground/20 px-3 py-2 align-top";

function dash(value: string | null) {
  return value && value.trim().length > 0 ? value : "—";
}

export function WordRow({ entry, expanded, onToggle }: WordRowProps) {
  const exId = `ex-${entry.id}`;

  return (
    <>
      <tr className="font-mono text-base text-foreground/80">
        <td className={`${cellClass} text-right text-accent/80`}>
          {entry.frequency ?? "—"}
        </td>
        <td className={`${cellClass} font-bold text-foreground`}>
          <div className="flex items-center gap-2">
            <span>{entry.word}</span>
            <SpeakButton word={entry.word} />
          </div>
        </td>
        <td className={`${cellClass} text-foreground/60`}>
          <div className="flex items-center gap-2">
            <span>{dash(entry.phonetic)}</span>
            <SpeakButton word={entry.word} />
          </div>
        </td>
        <td className={`${cellClass} text-foreground/60`}>
          {dash(entry.viPartOfSpeech)}
        </td>
        <td className={cellClass}>{dash(entry.meaning)}</td>
        <td className={`${cellClass} text-right`}>
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={expanded}
            aria-controls={exId}
            className="border border-dashed border-foreground/40 px-2 py-0.5 font-mono text-sm text-foreground/70 transition-colors hover:border-accent hover:text-accent"
          >
            {expanded ? "[ - ]" : "[ + ]"}
          </button>
        </td>
      </tr>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.tr
            key="ex"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <td
              colSpan={6}
              id={exId}
              className="border-b border-dashed border-foreground/30 bg-foreground/[0.03] px-3 py-0"
            >
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="py-3 font-mono text-base">
                  <p className="text-accent/80">
                    {"> ex:"}{" "}
                    <span className="text-foreground/80">
                      {dash(entry.example)}
                    </span>
                  </p>
                  <p className="mt-1 text-accent/60">
                    {"> vi:"}{" "}
                    <span className="text-foreground/70">
                      {dash(entry.viExample)}
                    </span>
                  </p>
                </div>
              </motion.div>
            </td>
          </motion.tr>
        )}
      </AnimatePresence>
    </>
  );
}
