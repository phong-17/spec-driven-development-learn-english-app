"use client";

import type { CategoryGroup } from "../lib/group-by-category";
import { TopicWordRow } from "./TopicWordRow";

type TopicWordTableProps = {
  groups: ReadonlyArray<CategoryGroup>;
  className?: string;
};

const headerCell =
  "border-b-2 border-dashed border-accent/60 px-3 py-2 text-left font-mono text-sm uppercase tracking-wider text-accent";

export function TopicWordTable({ groups, className }: TopicWordTableProps) {
  if (groups.length === 0) {
    return (
      <p
        className={`${className ?? ""} border border-dashed border-foreground/30 px-4 py-6 text-center font-mono text-base text-foreground/60`}
      >
        [ NO WORDS FOUND ]
      </p>
    );
  }

  return (
    <table
      className={`${className ?? ""} w-full border-collapse border border-dashed border-foreground/30`}
    >
      <thead>
        <tr>
          <th className={`${headerCell} text-right`}>STT</th>
          <th className={headerCell}>WORD</th>
          <th className={headerCell}>PHONETIC</th>
          <th className={headerCell}>CATEGORY</th>
          <th className={headerCell}>POS</th>
          <th className={headerCell}>MEANING</th>
        </tr>
      </thead>
      <tbody>
        {groups.map((group) => (
          <CategoryRows key={group.category} group={group} />
        ))}
      </tbody>
    </table>
  );
}

function CategoryRows({ group }: { group: CategoryGroup }) {
  return (
    <>
      {group.words.map((entry) => (
        <TopicWordRow key={entry.id} entry={entry} />
      ))}
    </>
  );
}
