/**
 * Fisher–Yates shuffle. Returns a NEW array — does not mutate the input.
 *
 * Must be called on the client (uses `Math.random`); callers run it inside a
 * mount effect so server and first client render agree (no hydration mismatch).
 */
export function shuffle<T>(input: ReadonlyArray<T>): T[] {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
