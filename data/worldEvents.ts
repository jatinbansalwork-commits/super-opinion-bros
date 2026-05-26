export type WorldEventId =
  | "none"
  | "food-war"
  | "hot-takes"
  | "reverse-internet"
  | "meme-storm"
  | "tech-trial";

export interface WorldEventDefinition {
  id: WorldEventId;
  label: string;
  description: string;
  categoryFilter?: string;
  scoreMultiplier?: number;
  reverseInternet?: boolean;
}

export const WORLD_EVENTS: WorldEventDefinition[] = [
  {
    id: "food-war",
    label: "FOOD WAR",
    description: "All food questions this world.",
    categoryFilter: "food",
  },
  {
    id: "hot-takes",
    label: "HOT TAKES",
    description: "Prediction rewards doubled.",
    scoreMultiplier: 2,
  },
  {
    id: "reverse-internet",
    label: "REVERSE INTERNET",
    description: "Minority wins.",
    reverseInternet: true,
  },
  {
    id: "meme-storm",
    label: "MEME STORM",
    description: "Wild questions surge.",
    categoryFilter: "chaos",
  },
  {
    id: "tech-trial",
    label: "TECH TRIAL",
    description: "Silicon Valley judges you.",
    categoryFilter: "tech",
  },
];

export function pickWorldEvent(seed: number): WorldEventDefinition {
  const rollables = WORLD_EVENTS.filter((e) => e.id !== "none");
  const idx = Math.abs(seed) % rollables.length;
  return rollables[idx] ?? WORLD_EVENTS[0];
}

export function getWorldEvent(id: WorldEventId): WorldEventDefinition {
  return (
    WORLD_EVENTS.find((e) => e.id === id) ??
    ({ id: "none", label: "", description: "" } as WorldEventDefinition)
  );
}
