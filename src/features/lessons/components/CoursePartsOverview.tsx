import type { CoursePart } from "@/types/lesson";

type CoursePartsOverviewProps = {
  parts: ReadonlyArray<CoursePart>;
};

export function CoursePartsOverview({ parts }: CoursePartsOverviewProps) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-mono text-sm uppercase tracking-wider text-accent">
        ── COURSE STRUCTURE ──
      </h2>

      <ul className="flex flex-col gap-2">
        {parts.map((part) => (
          <li
            key={part.part}
            className="flex flex-col gap-1 border border-dashed border-foreground/30 px-4 py-2 font-mono text-base text-foreground/80"
          >
            <div className="flex flex-col gap-x-3 gap-y-0.5 sm:flex-row sm:items-baseline">
              <span className="flex-shrink-0 text-sm uppercase tracking-wider text-accent">
                [ Part {part.part} ]
              </span>
              <span className="break-words font-bold text-foreground">
                {part.vi}
              </span>
              <span className="break-words text-foreground/60">
                ── {part.en}
              </span>
            </div>
            {part.part === 1 ? (
              <span className="text-sm text-foreground/50">
                Foundational — includes the 16 lessons below.
              </span>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
