import type { LessonEntry } from "@/types/lesson";

import { PdfPageImage } from "./PdfPageImage";

type LessonDetailProps = {
  lesson: LessonEntry;
};

export function LessonDetail({ lesson }: LessonDetailProps) {
  return (
    <div className="flex flex-col gap-3 font-mono text-base text-foreground/80">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm uppercase tracking-wider text-accent">
            Lesson {lesson.lesson}
          </span>
          <span className="break-words text-xl font-bold text-foreground">
            {lesson.title}
          </span>
          <span className="break-words text-foreground/60">
            {lesson.soundFocus}
          </span>
        </div>

        <div className="flex flex-shrink-0 flex-wrap gap-2">
          {lesson.sessions.map((day) => (
            <span
              key={day}
              className="border border-dashed border-accent/50 px-2 py-0.5 text-sm text-accent"
            >
              [ Day {day} ]
            </span>
          ))}
        </div>
      </div>

      {lesson.images.length > 0 ? (
        <div className="flex flex-col gap-4 border-t border-dashed border-foreground/20 pt-3">
          {lesson.images.map((image) => (
            <PdfPageImage key={image.src} image={image} />
          ))}
        </div>
      ) : (
        <p className="text-foreground/50">[ NO CONTENT FOR THIS LESSON ]</p>
      )}
    </div>
  );
}
