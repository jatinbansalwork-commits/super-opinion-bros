import { create } from "zustand";
import { getBossForCompletedCount } from "@/data/bosses";
import {
  questionIndexToWorldId,
} from "@/data/runWorlds";
import { getWorldEvent, pickWorldEvent } from "@/data/worldEvents";
import { computeCoinReward } from "@/lib/rewards";
import { BOSS_MAX_HEALTH } from "@/lib/constants";
import {
  featuresForMode,
  isBossMilestone,
  runLengthForMode,
} from "@/lib/gameMode";
import {
  buildRunWithDirector,
  createRunSeed,
  rebuildSlotWithCategory,
} from "@/lib/questionDirector";
import { pickInternetNews } from "@/lib/surprise/internetNews";
import { pickCrowdEnergy } from "@/lib/surprise/crowdEnergy";
import { pickMicroMoment } from "@/lib/surprise/microMoments";
import type { GateSurpriseBundle } from "@/lib/surprise/types";
import type { InternetNewsItem } from "@/lib/surprise/internetNews";
import {
  buildRunSurprises,
  surpriseToModifier,
  type RunSurprise,
} from "@/lib/surpriseEngine";
import {
  loadDirectorHistory,
  touchSessionQuestion,
  saveDirectorHistory,
} from "@/lib/questionHistory";
import { saveLastModifier } from "@/lib/playerRetention";
import {
  branchToRoute,
  computeRouteScores,
  resolveMapBranch,
  resolveSecretRoute,
} from "@/lib/routes";
import {
  buildPlayerAnswers,
  calculateFinalResult,
} from "@/lib/scoring";
import { usePlayerStore } from "@/store/player";
import type {
  AnswerChoice,
  BossState,
  CheckpointNext,
  FinalResult,
  GameMode,
  GamePhase,
  PlayerAnswer,
  Question,
  RunModifiers,
  SecretRoute,
  WorldEventId,
  LastPredictionResult,
  MapBranch,
  QuestionModifier,
  NextRunModifier,
} from "@/lib/types";

interface GameStore {
  phase: GamePhase;
  currentWorld: number;
  mapTargetWorld: number;
  runQuestions: Question[];
  runQuestionIds: string[];
  answers: Record<string, AnswerChoice>;
  playerAnswers: PlayerAnswer[];
  finalResult: FinalResult | null;
  pendingChoice: AnswerChoice | null;
  checkpointTargetWorld: number | null;
  checkpointNext: CheckpointNext | null;
  bossState: BossState | null;
  bossCompleted: number[];
  worldClearWorldId: number | null;
  route: SecretRoute;
  gameMode: GameMode;
  runLength: number;
  seed: number;
  worldEventId: WorldEventId;
  lastPrediction: LastPredictionResult | null;
  mapBranch: MapBranch;
  modifiers: RunModifiers;
  questionModifiers: Record<string, QuestionModifier>;
  gateSurprises: GateSurpriseBundle | null;
  bossInternetNews: InternetNewsItem | null;
  mapFlicker: boolean;
  runSurpriseCount: number;
  runSurprises: Map<number, RunSurprise>;
  activeRunModifier: NextRunModifier | null;
  resolvedRunModifier: NextRunModifier | "hot-takes" | "chaos" | "silent-majority" | null;
  speedRoundIndex: number | null;
  bossWins: number;
  bossAttempts: number;
  hydrated: boolean;

  hydrate: () => void;
  setPhase: (phase: GamePhase) => void;
  goToModeSelect: () => void;
  startNewGame: (mode: GameMode, nextModifier?: NextRunModifier | null) => void;
  startNextRun: (modifier: NextRunModifier) => void;
  submitAnswer: (choice: AnswerChoice) => void;
  skipQuestion: () => void;
  advanceAfterResult: () => void;
  dismissWorldMap: () => void;
  dismissCheckpoint: () => void;
  startBoss: () => void;
  submitBossPrediction: (choice: AnswerChoice) => void;
  dismissBossResult: () => void;
  dismissWorldClear: () => void;
  applyPowerUp: (type: import("@/lib/types").PowerUpType) => void;
  clearModifiers: () => void;
  quitToTitle: () => void;
  restartRun: () => void;
  resetGame: () => void;
  getCurrentQuestion: () => Question | null;
  getActiveSurprise: () => RunSurprise | null;
  isSpeedRound: () => boolean;
}

const titleState = {
  phase: "title" as GamePhase,
  currentWorld: 0,
  mapTargetWorld: 0,
  runQuestions: [] as Question[],
  runQuestionIds: [] as string[],
  answers: {} as Record<string, AnswerChoice>,
  playerAnswers: [] as PlayerAnswer[],
  finalResult: null as FinalResult | null,
  pendingChoice: null as AnswerChoice | null,
  checkpointTargetWorld: null as number | null,
  checkpointNext: null as CheckpointNext | null,
  bossState: null as BossState | null,
  bossCompleted: [] as number[],
  worldClearWorldId: null as number | null,
  route: "default" as SecretRoute,
  gameMode: "chaos" as GameMode,
  runLength: 20,
  seed: 0,
  worldEventId: "none" as WorldEventId,
  lastPrediction: null as LastPredictionResult | null,
  mapBranch: null as MapBranch,
  modifiers: {} as RunModifiers,
  questionModifiers: {} as Record<string, QuestionModifier>,
  gateSurprises: null as GateSurpriseBundle | null,
  bossInternetNews: null as InternetNewsItem | null,
  mapFlicker: false,
  runSurpriseCount: 0,
  runSurprises: new Map(),
  activeRunModifier: null as NextRunModifier | null,
  resolvedRunModifier: null,
  speedRoundIndex: null as number | null,
  bossWins: 0,
  bossAttempts: 0,
};

function rollGateForMap(seed: number, gateIndex: number): GateSurpriseBundle {
  return {
    gateEvent: null,
    crowdEnergy: pickCrowdEnergy(seed, gateIndex),
    micro: pickMicroMoment(seed, gateIndex),
    flashMs: 0,
  };
}

function resolveNextRunModifier(
  mod: NextRunModifier | null,
  rng: () => number
): NextRunModifier | null {
  if (!mod) return null;
  if (mod !== "random") return mod;
  const pool: NextRunModifier[] = ["hot-takes", "chaos", "silent-majority"];
  return pool[Math.floor(rng() * pool.length)]!;
}

function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function spawnRun(
  runLength: number,
  seed = createRunSeed(),
  nextModifier: NextRunModifier | null = null
) {
  const event = pickWorldEvent(seed);
  const rng = mulberry32(seed);
  const resolved = resolveNextRunModifier(nextModifier, rng);

  let { questions, runQuestionIds } = buildRunWithDirector(
    runLength,
    seed,
    event.categoryFilter ?? null
  );

  const runSurprises = buildRunSurprises(runLength, seed);
  const questionModifiers: Record<string, QuestionModifier> = {};
  const exclude = new Set(runQuestionIds);
  let surpriseCount = runSurprises.size;

  for (const [idx, surprise] of runSurprises) {
    if (surprise.type === "food-war") {
      questions = rebuildSlotWithCategory(
        questions,
        idx,
        "food",
        seed,
        exclude
      );
      runQuestionIds[idx] = questions[idx]!.id;
      surpriseCount += 1;
    }
    const mod = surpriseToModifier(surprise.type);
    const q = questions[idx];
    if (mod && q) questionModifiers[q.id] = mod;
  }

  const runQuestions = questions.map((q) => ({
    ...q,
    modifier: questionModifiers[q.id],
  }));

  let speedRoundIndex: number | null = null;
  for (const [idx, s] of runSurprises) {
    if (s.type === "speed-round") speedRoundIndex = idx;
  }

  return {
    runQuestions,
    runQuestionIds,
    questionModifiers,
    seed,
    worldEventId: event.id,
    runSurprises,
    surpriseCount: surpriseCount + (event.id !== "none" ? 1 : 0),
    activeRunModifier: nextModifier,
    resolvedRunModifier: resolved,
    speedRoundIndex,
  };
}

function syncRoute(
  playerAnswers: PlayerAnswer[],
  mode: GameMode,
  mapBranch: MapBranch
) {
  if (mapBranch) {
    const route = branchToRoute(mapBranch);
    usePlayerStore.getState().setRoute(route);
    return route;
  }
  if (!featuresForMode(mode).routes) {
    return "default" as SecretRoute;
  }
  const route = resolveSecretRoute(computeRouteScores(playerAnswers));
  usePlayerStore.getState().setRoute(route);
  return route;
}

function getEventModifiers(worldEventId: WorldEventId) {
  const event = getWorldEvent(worldEventId);
  return {
    reverseInternet: event.reverseInternet ?? false,
  };
}

export const useGameStore = create<GameStore>((set, get) => {
  const finalCalcPayload = () => {
    const player = usePlayerStore.getState();
    const s = get();
    return {
      playerAnswers: s.playerAnswers,
      runQuestions: s.runQuestions,
      runCoins: player.runCoins,
      level: player.level,
      route: s.route,
      surpriseCount: s.runSurpriseCount,
      bossWins: s.bossWins,
      bossAttempts: s.bossAttempts,
    };
  };

  return {
  ...titleState,
  hydrated: false,

  hydrate: () => {
    usePlayerStore.getState().hydrate();
    set({ ...titleState, hydrated: true });
  },

  setPhase: (phase) => set({ phase }),

  goToModeSelect: () => set({ phase: "mode-select" }),

  startNewGame: (mode, nextModifier = null) => {
    usePlayerStore.getState().resetSession();
    const runLength = runLengthForMode(mode);
    const spawned = spawnRun(runLength, createRunSeed(), nextModifier);
    set({
      ...titleState,
      runQuestions: spawned.runQuestions,
      runQuestionIds: spawned.runQuestionIds,
      questionModifiers: spawned.questionModifiers,
      gameMode: mode,
      runLength,
      seed: spawned.seed,
      worldEventId: spawned.worldEventId,
      runSurprises: spawned.runSurprises,
      runSurpriseCount: spawned.surpriseCount,
      activeRunModifier: spawned.activeRunModifier,
      resolvedRunModifier: spawned.resolvedRunModifier,
      speedRoundIndex: spawned.speedRoundIndex,
      lastPrediction: null,
      mapBranch: null,
      phase: "world-map",
      mapTargetWorld: 0,
      currentWorld: 0,
      gateSurprises: rollGateForMap(spawned.seed, 0),
      hydrated: true,
    });
  },

  startNextRun: (modifier) => {
    saveLastModifier(modifier);
    const mode = get().gameMode;
    usePlayerStore.getState().resetSession();
    const runLength = get().runLength;
    const spawned = spawnRun(runLength, createRunSeed(), modifier);
    set({
      ...titleState,
      runQuestions: spawned.runQuestions,
      runQuestionIds: spawned.runQuestionIds,
      questionModifiers: spawned.questionModifiers,
      gameMode: mode,
      runLength,
      seed: spawned.seed,
      worldEventId: spawned.worldEventId,
      runSurprises: spawned.runSurprises,
      runSurpriseCount: spawned.surpriseCount,
      activeRunModifier: spawned.activeRunModifier,
      resolvedRunModifier: spawned.resolvedRunModifier,
      speedRoundIndex: spawned.speedRoundIndex,
      finalResult: get().finalResult,
      phase: "world-map",
      mapTargetWorld: 0,
      currentWorld: 0,
      gateSurprises: rollGateForMap(spawned.seed, 0),
      hydrated: true,
    });
  },

  submitAnswer: (choice) => {
    const question = get().getCurrentQuestion();
    if (!question || get().answers[question.id]) return;

    const history = loadDirectorHistory();
    saveDirectorHistory(touchSessionQuestion(history, question.id));

    const mods = get().modifiers;
    const eventMods = getEventModifiers(get().worldEventId);
    const qMod = get().questionModifiers[question.id];
    const surprise = get().runSurprises.get(get().currentWorld);
    const runMod = get().resolvedRunModifier;

    let reverseInternet =
      eventMods.reverseInternet ||
      qMod === "crowd-flip" ||
      mods.chaosFlip;
    if (runMod === "chaos") {
      reverseInternet =
        ((get().seed + get().currentWorld) % 3) !== 0
          ? !reverseInternet
          : reverseInternet;
    }

    const doubleNext =
      mods.doubleNext ||
      qMod === "double-reward" ||
      runMod === "hot-takes";

    const majorityBonus = surprise?.type === "main-character";

    const outcome = computeCoinReward(choice, question, {
      doubleNext,
      reverseInternet,
      majorityBonus,
      isRare: question.isRare,
    });

    const newAnswers = { ...get().answers, [question.id]: choice };
    const reverseForAnswers =
      reverseInternet || qMod === "crowd-flip";
    const playerAnswers = buildPlayerAnswers(
      newAnswers,
      get().runQuestions,
      reverseForAnswers
    );
    const lastIdx = playerAnswers.length - 1;
    if (lastIdx >= 0) {
      playerAnswers[lastIdx] = {
        ...playerAnswers[lastIdx],
        tier: outcome.tier,
        coinsEarned: outcome.coinsEarned,
      };
    }

    const { gameMode, runLength } = get();
    usePlayerStore.getState().addCoins(outcome.coinsEarned);

    let mapBranch = get().mapBranch;
    if (playerAnswers.length >= 3 && !mapBranch) {
      mapBranch = resolveMapBranch(playerAnswers);
    }

    const route = syncRoute(playerAnswers, gameMode, mapBranch);
    const completedCount = get().currentWorld + 1;
    const bossNow = isBossMilestone(completedCount, gameMode, runLength);

    set({
      answers: newAnswers,
      playerAnswers,
      pendingChoice: choice,
      route,
      lastPrediction: {
        tier: outcome.tier,
        coinsEarned: outcome.coinsEarned,
      },
      mapBranch,
      modifiers: {},
    });

    if (bossNow) {
      get().startBoss();
    } else {
      set({ phase: "result" });
    }
  },

  skipQuestion: () => {
    const question = get().getCurrentQuestion();
    if (!question) return;
    const choice: AnswerChoice = "A";
    const newAnswers = { ...get().answers, [question.id]: choice };
    const playerAnswers = buildPlayerAnswers(
      newAnswers,
      get().runQuestions
    );
    const { gameMode, runLength } = get();
    usePlayerStore.getState().addCoins(0);
    const route = syncRoute(playerAnswers, gameMode, get().mapBranch);
    const completedCount = get().currentWorld + 1;
    const bossNow = isBossMilestone(completedCount, gameMode, runLength);

    set({
      answers: newAnswers,
      playerAnswers,
      pendingChoice: choice,
      route,
      modifiers: {},
    });

    if (bossNow) {
      get().startBoss();
    } else {
      set({ phase: "result" });
    }
  },

  startBoss: () => {
    const completedCount = get().currentWorld + 1;
    const boss = getBossForCompletedCount(completedCount);
    if (!boss) {
      set({ phase: "result" });
      return;
    }
    set({
      phase: "boss",
      bossState: {
        bossId: boss.id,
        roundIndex: 0,
        bossHealth: BOSS_MAX_HEALTH,
        playerWins: 0,
        shake: false,
      },
    });
  },

  submitBossPrediction: (choice) => {
    const { bossState } = get();
    if (!bossState) return;
    const completedCount = get().currentWorld + 1;
    const boss = getBossForCompletedCount(completedCount);
    if (!boss) return;

    const round = boss.rounds[bossState.roundIndex];
    if (!round) return;

    const correct = round.winner === choice;
    let bossHealth = bossState.bossHealth;
    let playerWins = bossState.playerWins;
    let roundIndex = bossState.roundIndex + 1;

    if (correct) {
      bossHealth -= 1;
      playerWins += 1;
    }

    const defeated = bossHealth <= 0;
    const roundsDone = roundIndex >= boss.rounds.length;

    if (defeated || roundsDone) {
      const bossAttempts = get().bossAttempts + 1;
      const bossWins = defeated ? get().bossWins + 1 : get().bossWins;
      if (defeated) {
        usePlayerStore.getState().addBossReward();
      }
      set({
        phase: "boss-result",
        bossState: {
          ...bossState,
          bossHealth,
          playerWins,
          roundIndex,
          shake: !correct,
        },
        pendingChoice: choice,
        bossInternetNews: defeated ? pickInternetNews() : null,
        bossAttempts,
        bossWins,
      });
    } else {
      set({
        bossState: {
          ...bossState,
          bossHealth,
          playerWins,
          roundIndex,
          shake: !correct,
        },
        pendingChoice: choice,
      });
    }
  },

  dismissBossResult: () => {
    const completedCount = get().currentWorld + 1;
    const boss = getBossForCompletedCount(completedCount);
    const defeated =
      get().bossState && get().bossState!.bossHealth <= 0;

    if (defeated) {
      const worldId = questionIndexToWorldId(get().currentWorld);
      const bossCompleted = get().bossCompleted.includes(worldId)
        ? get().bossCompleted
        : [...get().bossCompleted, worldId];
      const runDone = completedCount >= get().runQuestions.length;
      set({
        phase: featuresForMode(get().gameMode).bosses
          ? "world-clear"
          : runDone
            ? "final"
            : "world-map",
        worldClearWorldId: worldId,
        bossCompleted,
        checkpointNext: runDone ? "final" : "world-map",
        checkpointTargetWorld: get().currentWorld + 1,
        bossState: null,
      });
      if (!featuresForMode(get().gameMode).bosses && runDone) {
        const player = usePlayerStore.getState();
        set({
          finalResult: calculateFinalResult(finalCalcPayload()),
        });
      }
    } else if (boss) {
      set({
        phase: "boss",
        bossState: {
          bossId: boss.id,
          roundIndex: 0,
          bossHealth: BOSS_MAX_HEALTH,
          playerWins: 0,
          shake: false,
        },
        pendingChoice: null,
      });
    }
  },

  dismissWorldClear: () => {
    if (featuresForMode(get().gameMode).powerUps) {
      usePlayerStore.getState().grantPowerUpAfterWorldClear();
    }
    set({
      phase: "checkpoint",
      worldClearWorldId: null,
    });
  },

  advanceAfterResult: () => {
    const nextWorld = get().currentWorld + 1;
    const { runQuestions } = get();

    if (nextWorld >= runQuestions.length) {
      const player = usePlayerStore.getState();
      const finalResult = calculateFinalResult(finalCalcPayload());
      set({ phase: "final", finalResult, pendingChoice: null });
      return;
    }

    const { seed } = get();
    set({
      mapTargetWorld: nextWorld,
      phase: "world-map",
      pendingChoice: null,
      modifiers: {},
      gateSurprises: rollGateForMap(seed, nextWorld),
      mapFlicker: false,
    });
  },

  dismissWorldMap: () => {
    const target = get().mapTargetWorld;
    const { runQuestions } = get();

    if (target >= runQuestions.length) {
      const finalResult = calculateFinalResult(finalCalcPayload());
      set({ phase: "final", finalResult });
      return;
    }

    const bundle = get().gateSurprises;
    let surpriseBump = 0;
    if (bundle?.micro) surpriseBump += 1;

    set({
      currentWorld: target,
      phase: "question",
      modifiers: {},
      gateSurprises: null,
      mapFlicker: false,
      runSurpriseCount: get().runSurpriseCount + surpriseBump,
    });
  },

  dismissCheckpoint: () => {
    const { checkpointNext, checkpointTargetWorld } = get();

    if (checkpointNext === "final") {
      const finalResult = calculateFinalResult(finalCalcPayload());
      set({
        phase: "final",
        finalResult,
        checkpointTargetWorld: null,
        checkpointNext: null,
        bossState: null,
      });
      return;
    }

    const target = checkpointTargetWorld ?? get().currentWorld + 1;
    const { seed } = get();
    set({
      mapTargetWorld: target,
      phase: "world-map",
      checkpointTargetWorld: null,
      checkpointNext: null,
      bossState: null,
      gateSurprises: rollGateForMap(seed, target),
      bossInternetNews: null,
    });
  },

  applyPowerUp: (type) => {
    const mods = { ...get().modifiers };
    if (type === "double") mods.doubleNext = true;
    if (type === "peek") mods.peekShown = true;
    if (type === "fifty-fifty") {
      const q = get().getCurrentQuestion();
      if (q) {
        const weaker =
          q.result.percentA <= q.result.percentB ? "A" : "B";
        mods.fiftyFiftyRemoved = weaker;
      }
    }
    if (type === "skip") {
      get().skipQuestion();
      return;
    }
    if (type === "time-travel") {
      const idx = get().currentWorld;
      if (idx > 0) {
        const prevQ = get().runQuestions[idx - 1];
        if (prevQ) {
          const answers = { ...get().answers };
          delete answers[prevQ.id];
          const playerAnswers = get().playerAnswers.filter(
            (a) => a.questionId !== prevQ.id
          );
          set({
            answers,
            playerAnswers,
            currentWorld: idx - 1,
            phase: "question",
            modifiers: { timeTravelIndex: idx - 1 },
          });
          return;
        }
      }
    }
    if (type === "chaos-mode") {
      mods.chaosFlip = true;
    }
    set({ modifiers: mods });
  },

  clearModifiers: () => set({ modifiers: {} }),

  quitToTitle: () => {
    set({ ...titleState, hydrated: true, phase: "title" });
  },

  restartRun: () => {
    usePlayerStore.getState().resetSession();
    set({ ...titleState, hydrated: true, phase: "mode-select" });
  },

  resetGame: () => {
    usePlayerStore.getState().resetSession();
    set({ ...titleState, hydrated: true, phase: "title" });
  },

  getCurrentQuestion: () => {
    const {
      runQuestions,
      currentWorld,
      questionModifiers,
      resolvedRunModifier,
    } = get();
    const q = runQuestions[currentWorld];
    if (!q) return null;
    let mod = questionModifiers[q.id] ?? q.modifier;
    if (resolvedRunModifier === "silent-majority") mod = "votes-hidden";
    return mod ? { ...q, modifier: mod } : q;
  },

  getActiveSurprise: () => get().runSurprises.get(get().currentWorld) ?? null,

  isSpeedRound: () => get().speedRoundIndex === get().currentWorld,
  };
});
