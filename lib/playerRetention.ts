import type { NextRunModifier } from "@/lib/types";

const BEST_TITLE_KEY = "super-opinion-bros-best-title";
const LAST_MODIFIER_KEY = "super-opinion-bros-last-modifier";

export function loadBestTitle(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(BEST_TITLE_KEY);
  } catch {
    return null;
  }
}

export function saveBestTitle(title: string): void {
  if (typeof window === "undefined") return;
  try {
    const prev = loadBestTitle();
    if (!prev || title.length >= prev.length) {
      localStorage.setItem(BEST_TITLE_KEY, title);
    }
  } catch {
    /* quota */
  }
}

export function loadLastModifier(): NextRunModifier | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LAST_MODIFIER_KEY);
    if (
      raw === "hot-takes" ||
      raw === "chaos" ||
      raw === "silent-majority" ||
      raw === "random"
    ) {
      return raw;
    }
    return null;
  } catch {
    return null;
  }
}

export function saveLastModifier(mod: NextRunModifier): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LAST_MODIFIER_KEY, mod);
  } catch {
    /* quota */
  }
}
