"use client";

import { useEffect, useState } from "react";

export function useTransitionDelay(
  minMs: number,
  maxMs: number,
  active: boolean
): boolean {
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!active) {
      setDone(false);
      return;
    }
    setDone(false);
    const delay = minMs + Math.random() * (maxMs - minMs);
    const timer = setTimeout(() => setDone(true), delay);
    return () => clearTimeout(timer);
  }, [minMs, maxMs, active]);

  return done;
}
