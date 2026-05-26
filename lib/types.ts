export type AnswerChoice = "A" | "B";

export type GameMode = "casual" | "adventure" | "chaos";

export type GamePhase =
  | "title"
  | "mode-select"
  | "world-map"
  | "world-transition"
  | "question"
  | "result"
  | "boss"
  | "boss-result"
  | "world-clear"
  | "checkpoint"
  | "final";

export type CheckpointNext = "question" | "final" | "world-map";

export type SecretRoute = "default" | "crowd" | "chaos" | "glitch";

export type PowerUpType =
  | "double"
  | "peek"
  | "time-travel"
  | "chaos-mode"
  | "fifty-fifty"
  | "skip";

export type WorldEventId =
  | "none"
  | "food-war"
  | "hot-takes"
  | "reverse-internet"
  | "meme-storm"
  | "tech-trial";

export type PredictionTier = "exact" | "close" | "wrong";

export type MapBranch = "normal" | "chaos" | null;

export type PlayerRank =
  | "contrarian"
  | "lurker"
  | "main-character"
  | "trend-reader"
  | "internet-oracle";

export interface PowerUpItem {
  type: PowerUpType;
  id: string;
}

export interface BossState {
  bossId: string;
  roundIndex: number;
  bossHealth: number;
  playerWins: number;
  shake: boolean;
}

export interface QuestionResult {
  winner: AnswerChoice;
  percentA: number;
  percentB: number;
  totalVotes: number;
}

export interface Question {
  id: string;
  world: number;
  worldName: string;
  kingdom: string;
  title: string;
  emoji: string;
  optionA: string;
  optionB: string;
  result: QuestionResult;
}

export interface PlayerAnswer {
  questionId: string;
  choice: AnswerChoice;
  matchedMajority: boolean;
  tier?: PredictionTier;
  pointsEarned?: number;
}

export interface RunModifiers {
  fiftyFiftyRemoved?: AnswerChoice;
  peekShown?: boolean;
  doubleNext?: boolean;
  chaosFlip?: boolean;
  timeTravelIndex?: number;
}

export interface FinalResult {
  matchPercent: number;
  rareChoices: number;
  chaosScore: number;
  todayLabel: string;
  title: string;
  badge: string;
  description: string;
  playstyle: string;
  alignment: string;
  variant: "hero" | "chaos" | "timeline" | "rebel" | "oracle" | "npc" | "king" | "algorithm" | "knight" | "goblin" | "prophet";
  rank: string;
  rankFlavor: string;
  level: number;
  coins: number;
  runCoins: number;
  runScore: number;
  route: SecretRoute;
  shareLine: string;
}

export interface LastPredictionResult {
  tier: PredictionTier;
  pointsEarned: number;
  comboMultiplier: number;
  exactStreak: number;
}

export interface WorldTheme {
  id: number;
  name: string;
  kingdom: string;
  sky: string;
  ground: string;
  accent: string;
  decor: string;
}

export interface MapNodeState {
  index: number;
  status: "locked" | "current" | "completed";
}
