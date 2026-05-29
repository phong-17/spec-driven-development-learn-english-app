"use client";

import type { CategoryGroup } from "../lib/group-by-category";
import { TopicWordCard } from "./TopicWordCard";

type TopicWordCardListProps = {
  groups: ReadonlyArray<CategoryGroup>;
  className?: string;
};

export function TopicWordCardList({
  groups,
  className,
}: TopicWordCardListProps) {
  if (groups.length === 0) {
    return (
      <p
        className={`${className ?? ""} border border-dashed border-foreground/30 px-4 py-6 text-center font-mono text-sm text-foreground/60`}
      >
        [ NO WORDS FOUND ]
      </p>
    );
  }

  return (
    <div className={`${className ?? ""} flex flex-col gap-5`}>
      {groups.map((group) => (
        <section key={group.category} className="flex flex-col gap-3">
          <h2 className="border-b border-dashed border-accent/50 pb-1 font-mono text-sm uppercase tracking-wider text-accent">
            {`── ${group.category} ──`}
          </h2>
          <ul className="flex flex-col gap-3">
            {group.words.map((entry) => (
              <TopicWordCard key={entry.id} entry={entry} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
