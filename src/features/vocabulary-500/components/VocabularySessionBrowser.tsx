"use client";

import { useMemo, useState } from "react";

import vocabularyData from "@/data/vocabulary/500-common-words.json";
import type { VocabularyEntry } from "@/types/vocabulary";

import { useExpandedRows } from "../hooks/useExpandedRows";
import { groupBySession } from "../lib/group-by-session";
import { SessionDropdown, type SessionOption } from "./SessionDropdown";
import { WordCardList } from "./WordCardList";
import { WordTable } from "./WordTable";

const entries = vocabularyData as VocabularyEntry[];

let sessionGroups: Map<number, VocabularyEntry[]>;
let loadError = false;
try {
  sessionGroups = groupBySession(entries);
} catch {
  sessionGroups = new Map();
  loadError = true;
}

const sortedSessions = Array.from(sessionGroups.keys()).sort((a, b) => a - b);

export function VocabularySessionBrowser() {
  const [selectedSession, setSelectedSession] = useState<number>(
    sortedSessions[0] ?? 1,
  );

  const { isExpanded, toggle } = useExpandedRows(selectedSession);

  const sessionOptions: SessionOption[] = useMemo(
    () =>
      sortedSessions.map((session) => ({
        session,
        label: `Day ${session}`,
        count: sessionGroups.get(session)?.length ?? 0,
      })),
    [],
  );

  const currentEntries = sessionGroups.get(selectedSession) ?? [];

  if (loadError) {
    return (
      <p className="border border-dashed border-accent/60 px-4 py-6 text-center font-mono text-base text-accent">
        [ ERROR: DATA UNAVAILABLE ]
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-mono text-sm uppercase tracking-wider text-foreground/60">
          SESSION:
        </span>
        <SessionDropdown
          options={sessionOptions}
          selected={selectedSession}
          onChange={setSelectedSession}
        />
        <span className="font-mono text-sm text-foreground/40">
          ({currentEntries.length} words)
        </span>
      </div>

      <WordTable
        className="hidden lg:table"
        entries={currentEntries}
        isExpanded={isExpanded}
        onToggle={toggle}
      />
      <WordCardList
        className="lg:hidden"
        entries={currentEntries}
        isExpanded={isExpanded}
        onToggle={toggle}
      />
    </div>
  );
}
