import { NavigationMenu } from "@/features/home/components/NavigationMenu";
import { HOME_NAV_LINKS } from "@/features/home/content";
import { VocabularySessionBrowser } from "@/features/vocabulary-500/components/VocabularySessionBrowser";

export default function Vocabulary500Page() {
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
            {"> ~/learn-english/vocabulary/500"}
          </p>
          <h1 className="mt-2 font-mono text-3xl font-bold uppercase tracking-widest text-foreground md:text-4xl">
            500 Most Common Words
          </h1>
        </div>
        <VocabularySessionBrowser />
      </main>
    </div>
  );
}
