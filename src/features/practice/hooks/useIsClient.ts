"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * Returns false on the server and on the first client render, then true after
 * hydration. Lets us defer client-only work (e.g. `Math.random` shuffling) to
 * after hydration so server and first client render agree — avoiding a
 * hydration mismatch without calling setState inside an effect.
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
