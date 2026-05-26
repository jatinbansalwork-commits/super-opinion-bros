/** Strip internal catalog variant markers from player-visible question text. */
export function displayQuestionTitle(raw: string): string {
  return raw
    .replace(/\s*·\s*take\s+\d+\s*$/i, "")
    .replace(/\s*\(\d+\)\s*$/, "")
    .replace(/\s*\[\d+\]\s*$/, "")
    .replace(/\s*#\d+\s*$/, "")
    .trim();
}
