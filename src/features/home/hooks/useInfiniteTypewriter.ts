"use client";

import { useEffect, useRef, useState } from "react";

const CHAR_DELAY = 70;
const PAUSE_FULL = 2000;
const PAUSE_EMPTY = 2000;

export function useInfiniteTypewriter(text: string, active: boolean): string {
  const [count, setCount] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const wasActive = useRef(false);

  // Reset to 0 every time the user hovers in
  useEffect(() => {
    if (active && !wasActive.current) {
      setCount(0);
      setDeleting(false);
    }
    wasActive.current = active;
  }, [active]);

  useEffect(() => {
    if (!active) return;

    let t: ReturnType<typeof setTimeout>;

    if (!deleting && count < text.length) {
      t = setTimeout(() => setCount((c) => c + 1), CHAR_DELAY);
    } else if (!deleting && count === text.length) {
      t = setTimeout(() => setDeleting(true), PAUSE_FULL);
    } else if (deleting && count > 0) {
      t = setTimeout(() => setCount((c) => c - 1), CHAR_DELAY);
    } else {
      t = setTimeout(() => setDeleting(false), PAUSE_EMPTY);
    }

    return () => clearTimeout(t);
  }, [count, deleting, text.length, active]);

  return text.slice(0, count);
}
