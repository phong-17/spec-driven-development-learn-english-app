"use client";

import { useCallback, useState } from "react";

export function useExpandedRows(resetKey: number) {
  const [expanded, setExpanded] = useState<Set<number>>(() => new Set());
  const [prevKey, setPrevKey] = useState<number>(resetKey);

  if (prevKey !== resetKey) {
    setPrevKey(resetKey);
    setExpanded(new Set());
  }

  const isExpanded = useCallback(
    (id: number) => expanded.has(id),
    [expanded],
  );

  const toggle = useCallback((id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setExpanded(new Set());
  }, []);

  return { isExpanded, toggle, clear };
}
