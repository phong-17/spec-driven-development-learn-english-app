import Link from "next/link";

import { NavigationMenu } from "@/features/home/components/NavigationMenu";
import { HOME_NAV_LINKS } from "@/features/home/content";
import { PracticeBrowser } from "@/features/practice/components/PracticeBrowser";
import {
  allPracticeParams,
  loadPracticeSession,
} from "@/features/practice/lib/load-practice-session";
import type { PracticeSource } from "@/types/practice";
import { ROUTE_VOCAB_500, ROUTE_VOCAB_1000 } from "@/utils/route-path";

export function generateStaticParams() {
  return allPracticeParams().map((p) => ({
    source: p.source,
    session: String(p.session),
  }));
}

function PageShell({
  breadcrumb,
  children,
}: {
  breadcrumb: string;
  children: React.ReactNode;
}) {
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
        <p className="font-mono text-xs text-accent">{breadcrumb}</p>
        {children}
      </main>
    </div>
  );
}

export default async function PracticePage({
  params,
}: {
  params: Promise<{ source: string; session: string }>;
}) {
  const { source, session } = await params;
  const sessionNum = Number.parseInt(session, 10);
  const isValidSource = source === "500" || source === "1000";
  const data = isValidSource
    ? loadPracticeSession(source as PracticeSource, sessionNum)
    : null;

  if (!data) {
    const backHref = source === "1000" ? ROUTE_VOCAB_1000 : ROUTE_VOCAB_500;
    return (
      <PageShell breadcrumb={`> ~/learn-english/practice/${source}/${session}`}>
        <div className="flex flex-col items-start gap-4">
          <p className="border border-dashed border-accent/60 px-4 py-6 font-mono text-base text-accent">
            [ SESSION NOT FOUND ]
          </p>
          <Link
            href={backHref}
            className="border border-dashed border-foreground/40 px-3 py-1.5 font-mono text-sm uppercase tracking-wider text-foreground transition-colors hover:border-accent hover:text-accent"
          >
            [ ← BACK TO VOCABULARY ]
          </Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      breadcrumb={`> ~/learn-english/practice/${data.source}/${data.session}`}
    >
      <h1 className="font-mono text-3xl font-bold uppercase tracking-widest text-foreground md:text-4xl">
        {data.label}
      </h1>
      <PracticeBrowser data={data} />
    </PageShell>
  );
}
