"use client";

import Link from "next/link";

import type { PracticeSource } from "@/types/practice";
import { routePractice } from "@/utils/route-path";

type PracticeButtonProps = {
  source: PracticeSource;
  session: number;
};

export function PracticeButton({ source, session }: PracticeButtonProps) {
  return (
    <Link
      href={routePractice(source, session)}
      className="border border-dashed border-foreground/40 px-3 py-1.5 font-mono text-sm uppercase tracking-wider text-foreground transition-colors hover:border-accent hover:text-accent"
    >
      [ PRACTICE ▶ ]
    </Link>
  );
}
