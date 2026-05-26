/** Remove legacy game saves on boot — V1 is session-only. */
export function clearLegacySaves(): void {
  if (typeof window === "undefined") return;
  const keys = [
    "super-opinion-bros-save",
    "super-opinion-bros-player",
    "super-opinion-bros-archive",
    "super-opinion-bros-director",
    "super-opinion-bros-settings",
    /* question-history is intentionally kept for diversity */
  ];
  try {
    for (const key of keys) {
      localStorage.removeItem(key);
    }
  } catch {
    /* quota */
  }
}
