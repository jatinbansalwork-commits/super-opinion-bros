import type { InternetGateEventId, SurpriseTrackerState } from "./types";

const TRACKER_KEY = "super-opinion-bros-surprise-tracker";
const VERSION = 1;

const EMPTY: SurpriseTrackerState = {
  version: VERSION,
  eventsSeen: {},
  lastGateEventId: null,
  microSeen: [],
  newsIndex: 0,
};

export function loadSurpriseTracker(): SurpriseTrackerState {
  if (typeof window === "undefined") return { ...EMPTY };
  try {
    const raw = localStorage.getItem(TRACKER_KEY);
    if (!raw) return { ...EMPTY };
    const data = JSON.parse(raw) as SurpriseTrackerState;
    return {
      version: VERSION,
      eventsSeen: data.eventsSeen ?? {},
      lastGateEventId: data.lastGateEventId ?? null,
      microSeen: data.microSeen ?? [],
      newsIndex: data.newsIndex ?? 0,
    };
  } catch {
    return { ...EMPTY };
  }
}

export function saveSurpriseTracker(state: SurpriseTrackerState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(TRACKER_KEY, JSON.stringify({ ...state, version: VERSION }));
  } catch {
    /* quota */
  }
}

export function recordGateEventSeen(
  tracker: SurpriseTrackerState,
  eventId: InternetGateEventId
): SurpriseTrackerState {
  return {
    ...tracker,
    lastGateEventId: eventId,
    eventsSeen: {
      ...tracker.eventsSeen,
      [eventId]: (tracker.eventsSeen[eventId] ?? 0) + 1,
    },
  };
}

export function recordMicroSeen(
  tracker: SurpriseTrackerState,
  microId: string
): SurpriseTrackerState {
  const microSeen = tracker.microSeen.includes(microId)
    ? tracker.microSeen
    : [...tracker.microSeen, microId].slice(-20);
  return { ...tracker, microSeen };
}

export function nextNewsIndex(tracker: SurpriseTrackerState): {
  index: number;
  tracker: SurpriseTrackerState;
} {
  const index = tracker.newsIndex;
  return {
    index,
    tracker: { ...tracker, newsIndex: index + 1 },
  };
}
