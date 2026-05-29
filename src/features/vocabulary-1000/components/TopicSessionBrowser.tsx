"use client";

import { useMemo, useState } from "react";

import {
  SessionDropdown,
  type SessionOption,
} from "@/features/vocabulary-500/components/SessionDropdown";
import topicData from "@/data/vocabulary/1000-topic-words.json";
import { PracticeButton } from "@/features/practice/components/PracticeButton";
import type { TopicVocabEntry } from "@/types/topic-vocabulary";

import { groupByCategory } from "../lib/group-by-category";
import { groupBySession } from "../lib/group-by-session";
import { TopicWordCardList } from "./TopicWordCardList";
import { TopicWordTable } from "./TopicWordTable";

const entries = topicData as TopicVocabEntry[];

let sessionGroups: Map<number, TopicVocabEntry[]>;
let loadError = false;
try {
  sessionGroups = groupBySession(entries);
} catch {
  sessionGroups = new Map();
  loadError = true;
}

const sortedSessions = Array.from(sessionGroups.keys()).sort((a, b) => a - b);

export function TopicSessionBrowser() {
  const [selectedSession, setSelectedSession] = useState<number>(
    sortedSessions[0] ?? 1,
  );

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

  const categoryGroups = useMemo(
    () => groupByCategory(currentEntries),
    // currentEntries is derived purely from selectedSession (module-scoped data)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedSession],
  );

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
        <PracticeButton source="1000" session={selectedSession} />
      </div>

      <TopicWordTable className="hidden lg:table" groups={categoryGroups} />
      <TopicWordCardList className="lg:hidden" groups={categoryGroups} />
    </div>
  );
}
