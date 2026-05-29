import { NavigationMenu } from "@/features/home/components/NavigationMenu";
import { HOME_NAV_LINKS } from "@/features/home/content";
import { LessonsBrowser } from "@/features/lessons/components/LessonsBrowser";
import lessonsData from "@/data/lessons/ms-huong-lessons.json";
import type { LessonsData } from "@/types/lesson";

const data = lessonsData as LessonsData;

export default function LessonsPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden lg:flex-row">
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-19"
        aria-hidden
        style={{
          backgroundImage: "url('/images/theme.gif')",
          backgroundRepeat: "repeat",
          backgroundSize: "250px",
        }}
      />

      <NavigationMenu links={HOME_NAV_LINKS} />
      <main className="relative z-10 flex flex-1 flex-col gap-6 overflow-x-hidden px-4 py-8 md:px-8">
        <div>
          <p className="font-mono text-xs text-accent">
            {"> ~/learn-english/lessons"}
          </p>
          <h1 className="mt-2 font-mono text-3xl font-bold uppercase tracking-widest text-foreground md:text-4xl">
            Ms. Huong Lessons
          </h1>
        </div>

        <LessonsBrowser data={data} />
      </main>
    </div>
  );
}
