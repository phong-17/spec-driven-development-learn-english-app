"use client";

import { useState } from "react";

import type { PracticeExercise, PracticeSessionData } from "@/types/practice";

import { ChooseTheMeaning } from "./ChooseTheMeaning";
import { FlashCards } from "./FlashCards";
import { TypeTheWord } from "./TypeTheWord";

const TABS: ReadonlyArray<{ id: PracticeExercise; label: string }> = [
  { id: "type", label: "Type the Word" },
  { id: "choose", label: "Choose Meaning" },
  { id: "flashcards", label: "Flash Cards" },
];

type PracticeBrowserProps = {
  data: PracticeSessionData;
};

export function PracticeBrowser({ data }: PracticeBrowserProps) {
  const [activeTab, setActiveTab] = useState<PracticeExercise>("type");

  if (data.entries.length === 0) {
    return (
      <p className="border border-dashed border-foreground/30 px-4 py-6 text-center font-mono text-base text-foreground/60">
        [ NO WORDS IN THIS SESSION ]
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div role="tablist" aria-label="Practice exercises" className="flex flex-wrap gap-2">
        {TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.id)}
              className={`border border-dashed px-3 py-1.5 font-mono text-sm uppercase tracking-wider transition-colors ${
                isActive
                  ? "border-accent text-accent"
                  : "border-foreground/30 text-foreground/60 hover:border-accent hover:text-accent"
              }`}
            >
              {`[ ${tab.label} ]`}
            </button>
          );
        })}
      </div>

      {activeTab === "type" ? (
        <TypeTheWord key={`type-${data.session}`} entries={data.entries} />
      ) : null}

      {activeTab === "choose" ? (
        <ChooseTheMeaning key={`choose-${data.session}`} entries={data.entries} />
      ) : null}

      {activeTab === "flashcards" ? (
        <FlashCards key={`flashcards-${data.session}`} entries={data.entries} />
      ) : null}
    </div>
  );
}
