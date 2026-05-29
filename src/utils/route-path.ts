import type { PracticeSource } from "@/types/practice";

export const ROUTE_HOME = "/" as const;
export const ROUTE_LESSONS = "/lessons" as const;
export const ROUTE_VOCAB_500 = "/vocabulary/500" as const;
export const ROUTE_VOCAB_1000 = "/vocabulary/1000" as const;
export const ROUTE_PRACTICE = "/practice" as const;

export function routePractice(source: PracticeSource, session: number): string {
  return `/practice/${source}/${session}`;
}
