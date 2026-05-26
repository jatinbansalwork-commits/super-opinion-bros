import {
  loadSurpriseTracker,
  nextNewsIndex,
  saveSurpriseTracker,
} from "./tracker";

export interface InternetNewsItem {
  headline: string;
  body: string;
}

const NEWS_POOL: InternetNewsItem[] = [
  {
    headline: "68% decided cereal is soup.",
    body: "Nobody learned anything.",
  },
  {
    headline: "The dress is still fighting.",
    body: "Comments remain undefeated.",
  },
  {
    headline: "Hot take season never ends.",
    body: "The algorithm is tired.",
  },
  {
    headline: "Majority picks pineapple pizza.",
    body: "Minority remains vocal.",
  },
  {
    headline: "Timeline reports: water is wet.",
    body: "Scientists log off.",
  },
  {
    headline: "Ghost votes haunt the feed.",
    body: "Percentages were hidden.",
  },
  {
    headline: "Everyone had opinions today.",
    body: "Zero conclusions reached.",
  },
  {
    headline: "Bot invasion contained.",
    body: "Votes stabilized briefly.",
  },
];

export function pickInternetNews(): InternetNewsItem {
  const tracker = loadSurpriseTracker();
  const { index, tracker: next } = nextNewsIndex(tracker);
  saveSurpriseTracker(next);
  return NEWS_POOL[index % NEWS_POOL.length]!;
}
