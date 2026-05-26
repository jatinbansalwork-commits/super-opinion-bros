import { create } from "zustand";
import { getBossForCompletedCount } from "@/data/bosses";
import {
  questionIndexToStageIndex,
  questionIndexToWorldId,
} from "@/data/runWorlds";
import { getWorldEvent, pickWorldEvent } from "@/data/worldEvents";
import { questionsFromIds } from "@/data/questionPool";
import { scorePrediction } from "@/lib/chaosScoring";
import { BOSS_MAX_HEALTH } from "@/lib/constants";
import {
  featuresForMode,
  isBossMilestone,
  runLengthForMode,
} from "@/lib/gameMode";
import {
  buildRunWithDirector,
  createRunSeed,
} from "@/lib/questionDirector";
import {
  branchToRoute,
  computeRouteScores,
  resolveMapBranch,
  resolveSecretRoute,
} from "@/lib/routes";
import { hasResumableSave, loadResumableSave } from "@/lib/saveRules";
import {
  answersToIds,
  normalizeSaveProgress,
  packSaveProgress,
} from "@/lib/saveProgress";
import {
  buildPlayerAnswers,
  calculateFinalResult,
} from "@/lib/scoring";
import {
  clearSave,
  loadSave,
  migrateLegacyStorage,
  saveProgress,
} from "@/lib/storage";
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
  runScore: number;
  seed: number;
  worldEventId: WorldEventId;
  exactStreak: number;
  lastPrediction: LastPredictionResult | null;
  mapBranch: MapBranch;
  modifiers: RunModifiers;
  hydrated: boolean;
  hasSave: boolean;

  hydrate: () => void;
  setPhase: (phase: GamePhase) => void;
  goToModeSelect: () => void;
  startNewGame: (mode: GameMode) => void;
  continueGame: () => void;
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
  persist: () => void;
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
  runScore: 0,
  seed: 0,
  worldEventId: "none" as WorldEventId,
  exactStreak: 0,
  lastPrediction: null as LastPredictionResult | null,
  mapBranch: null as MapBranch,
  modifiers: {} as RunModifiers,
};

function progressQuestionIndex(
  phase: GamePhase,
  currentWorld: number,
  mapTargetWorld: number
): number {
  return phase === "world-map" ? mapTargetWorld : currentWorld;
}

function applySaveToState(
  saved: NonNullable<ReturnType<typeof loadSave>>
): Pick<
  GameStore,
  | "phase"
  | "currentWorld"
  | "mapTargetWorld"
  | "runQuestions"
  | "runQuestionIds"
  | "answers"
  | "playerAnswers"
  | "finalResult"
  | "pendingChoice"
  | "checkpointTargetWorld"
  | "checkpointNext"
  | "bossState"
  | "bossCompleted"
  | "worldClearWorldId"
  | "route"
  | "gameMode"
  | "runLength"
  | "runScore"
  | "seed"
  | "worldEventId"
  | "exactStreak"
  | "lastPrediction"
  | "mapBranch"
  | "modifiers"
> {
  const runQuestions = questionsFromIds(saved.runQuestionIds);
  const answersMap = Object.fromEntries(
    saved.answers.map((a) => [a.questionId, a.choice])
  );
  const progress = normalizeSaveProgress(saved);
  const currentWorld = Math.min(
    Math.max(progress.questionIndex, 0),
    Math.max(runQuestions.length - 1, 0)
  );
  let phase = saved.phase;
  let finalResult: FinalResult | null = null;
  let pendingChoice = saved.pendingChoice ?? null;
  let checkpointTargetWorld = saved.checkpointTargetWorld ?? null;
  let checkpointNext = saved.checkpointNext ?? null;
  let bossState = saved.bossState ?? null;
  const route = saved.route ?? "default";
  const gameMode = saved.gameMode ?? "chaos";
  const runLength = saved.runLength ?? runLengthForMode(gameMode);
  const runScore = saved.runScore ?? 0;
  const seed = saved.seed ?? createRunSeed();
  const worldEventId = saved.worldEvent ?? "none";
  const exactStreak = saved.exactStreak ?? 0;
  const mapBranch = saved.mapBranch ?? null;
  const modifiers = saved.modifiers ?? {};
  const bossCompleted = progress.bossCompleted;
  let mapTargetWorld = progress.questionIndex;
  let worldClearWorldId: number | null = null;

  if (phase === "world-map") {
    mapTargetWorld = progress.questionIndex;
  } else {
    mapTargetWorld = saved.mapTargetWorld ?? currentWorld;
  }

  if (phase === "world-clear") {
    worldClearWorldId =
      bossCompleted[bossCompleted.length - 1] ??
      questionIndexToWorldId(Math.max(0, currentWorld));
  }

  if (phase === "checkpoint") {
    checkpointTargetWorld =
      saved.checkpointTargetWorld ?? currentWorld + 1;
    checkpointNext = saved.checkpointNext ?? "world-map";
  }

  if (
    phase === "final" ||
    (runQuestions.length > 0 &&
      saved.answers.length >= runQuestions.length &&
      saved.currentQuestion >= runQuestions.length - 1 &&
      phase !== "checkpoint" &&
      phase !== "boss" &&
      phase !== "boss-result")
  ) {
    const player = usePlayerStore.getState();
    phase = "final";
    finalResult = calculateFinalResult({
      playerAnswers: saved.answers,
      runQuestions,
      coins: player.coins,
      runCoins: saved.runCoins ?? 0,
      runScore: saved.runScore ?? 0,
      level: player.level,
      route,
    });
    pendingChoice = null;
    checkpointTargetWorld = null;
    checkpointNext = null;
    bossState = null;
  }

  return {
    phase,
    currentWorld,
    mapTargetWorld,
    runQuestions,
    runQuestionIds: saved.runQuestionIds,
    answers: answersMap,
    playerAnswers: saved.answers,
    finalResult,
    pendingChoice,
    checkpointTargetWorld,
    checkpointNext,
    bossState,
    bossCompleted,
    worldClearWorldId,
    route,
    gameMode,
    runLength,
    runScore,
    seed,
    worldEventId,
    exactStreak,
    lastPrediction: null,
    mapBranch,
    modifiers,
  };
}

function spawnRun(runLength: number, seed = createRunSeed()) {
  const event = pickWorldEvent(seed);
  const { questions, runQuestionIds } = buildRunWithDirector(
    runLength,
    seed,
    event.categoryFilter ?? null
  );
  return {
    runQuestions: questions,
    runQuestionIds,
    seed,
    worldEventId: event.id,
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
    scoreMultiplier: event.scoreMultiplier ?? 1,
    reverseInternet: event.reverseInternet ?? false,
  };
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...titleState,
  hydrated: false,
  hasSave: false,

  hydrate: () => {
    if (typeof window === "undefined") return;
    migrateLegacyStorage();
    usePlayerStore.getState().hydrate();
    set({
      ...titleState,
      hydrated: true,
      hasSave: hasResumableSave(),
    });
  },

  setPhase: (phase) => {
    set({ phase });
    if (phase !== "title" && phase !== "mode-select") {
      get().persist();
    }
  },

  goToModeSelect: () => {
    set({ phase: "mode-select" });
  },

  startNewGame: (mode) => {
    clearSave();
    usePlayerStore.getState().resetRun();
    const runLength = runLengthForMode(mode);
    const { runQuestions, runQuestionIds, seed, worldEventId } =
      spawnRun(runLength);
    set({
      ...titleState,
      runQuestions,
      runQuestionIds,
      gameMode: mode,
      runLength,
      runScore: 0,
      seed,
      worldEventId,
      exactStreak: 0,
      lastPrediction: null,
      mapBranch: null,
      phase: "world-map",
      mapTargetWorld: 0,
      currentWorld: 0,
      hydrated: true,
      hasSave: false,
    });
    saveProgress({
      phase: "world-map",
      currentQuestion: 0,
      worldId: 1,
      stageIndex: 1,
      bossCompleted: [],
      answeredIds: [],
      answers: [],
      runQuestionIds,
      route: "default",
      gameMode: mode,
      runLength,
      runScore: 0,
      seed,
      worldEvent: worldEventId,
      runCoins: 0,
      streak: 0,
      inventory: usePlayerStore.getState().inventory,
    });
  },

  continueGame: () => {
    const saved = loadResumableSave();
    if (!saved) {
      set({ hasSave: false });
      return;
    }
    usePlayerStore.getState().hydrate();
    set({
      ...applySaveToState(saved),
      hydrated: true,
      hasSave: true,
    });
    usePlayerStore.getState().syncMatchRate(saved.answers);
  },

  submitAnswer: (choice) => {
    const question = get().getCurrentQuestion();
    if (!question || get().answers[question.id]) return;

    const mods = get().modifiers;
    const eventMods = getEventModifiers(get().worldEventId);
    const chaosFlip =
      mods.chaosFlip || eventMods.reverseInternet;
    const outcome = scorePrediction(choice, question, get().exactStreak, {
      doubleNext: mods.doubleNext,
      scoreMultiplier: eventMods.scoreMultiplier,
      reverseInternet: chaosFlip,
    });

    const newAnswers = { ...get().answers, [question.id]: choice };
    const playerAnswers = buildPlayerAnswers(
      newAnswers,
      get().runQuestions,
      chaosFlip
    );
    const lastIdx = playerAnswers.length - 1;
    if (lastIdx >= 0) {
      playerAnswers[lastIdx] = {
        ...playerAnswers[lastIdx],
        tier: outcome.tier,
        pointsEarned: outcome.pointsEarned,
      };
    }

    const { gameMode, runLength } = get();
    usePlayerStore
      .getState()
      .addMatchReward(outcome.tier !== "wrong", mods.doubleNext, false);
    usePlayerStore.getState().syncMatchRate(playerAnswers);

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
      runScore: get().runScore + outcome.pointsEarned,
      exactStreak: outcome.exactStreak,
      lastPrediction: {
        tier: outcome.tier,
        pointsEarned: outcome.pointsEarned,
        comboMultiplier: outcome.comboMultiplier,
        exactStreak: outcome.exactStreak,
      },
      mapBranch,
      modifiers: {},
    });

    if (bossNow) {
      get().startBoss();
    } else {
      set({ phase: "result" });
    }
    get().persist();
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
    usePlayerStore
      .getState()
      .addMatchReward(false, false, featuresForMode(gameMode).powerUps);
    usePlayerStore.getState().syncMatchRate(playerAnswers);
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
    get().persist();
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
    get().persist();
  },

  submitBossPrediction: (choice) => {
    const { bossState, runQuestions } = get();
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
    get().persist();
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
      usePlayerStore.getState().addCheckpointXp();
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
          finalResult: calculateFinalResult({
            playerAnswers: get().playerAnswers,
            runQuestions: get().runQuestions,
            coins: player.coins,
            runCoins: player.runCoins,
            runScore: get().runScore,
            level: player.level,
            route: get().route,
          }),
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
    get().persist();
  },

  dismissWorldClear: () => {
    if (featuresForMode(get().gameMode).powerUps) {
      usePlayerStore.getState().grantPowerUpAfterWorldClear();
    }
    set({
      phase: "checkpoint",
      worldClearWorldId: null,
    });
    get().persist();
  },

  advanceAfterResult: () => {
    const nextWorld = get().currentWorld + 1;
    const { runQuestions } = get();

    if (nextWorld >= runQuestions.length) {
      const player = usePlayerStore.getState();
      const finalResult = calculateFinalResult({
        playerAnswers: get().playerAnswers,
        runQuestions,
        coins: player.coins,
        runCoins: player.runCoins,
        runScore: get().runScore,
        level: player.level,
        route: get().route,
      });
      set({ phase: "final", finalResult, pendingChoice: null });
      get().persist();
      return;
    }

    set({
      mapTargetWorld: nextWorld,
      phase: "world-map",
      pendingChoice: null,
      modifiers: {},
    });
    get().persist();
  },

  dismissWorldMap: () => {
    const target = get().mapTargetWorld;
    const { runQuestions } = get();

    if (target >= runQuestions.length) {
      const player = usePlayerStore.getState();
      const finalResult = calculateFinalResult({
        playerAnswers: get().playerAnswers,
        runQuestions,
        coins: player.coins,
        runCoins: player.runCoins,
        runScore: get().runScore,
        level: player.level,
        route: get().route,
      });
      set({ phase: "final", finalResult });
      get().persist();
      return;
    }

    set({
      currentWorld: target,
      phase: "question",
      modifiers: {},
    });
    get().persist();
  },

  dismissCheckpoint: () => {
    const { checkpointNext, checkpointTargetWorld, runQuestions } = get();

    if (checkpointNext === "final") {
      const player = usePlayerStore.getState();
      const finalResult = calculateFinalResult({
        playerAnswers: get().playerAnswers,
        runQuestions,
        coins: player.coins,
        runCoins: player.runCoins,
        runScore: get().runScore,
        level: player.level,
        route: get().route,
      });
      set({
        phase: "final",
        finalResult,
        checkpointTargetWorld: null,
        checkpointNext: null,
        bossState: null,
      });
      get().persist();
      return;
    }

    const target = checkpointTargetWorld ?? get().currentWorld + 1;
    set({
      mapTargetWorld: target,
      phase: "world-map",
      checkpointTargetWorld: null,
      checkpointNext: null,
      bossState: null,
    });
    get().persist();
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
          get().persist();
          return;
        }
      }
    }
    if (type === "chaos-mode") {
      mods.chaosFlip = true;
    }
    set({ modifiers: mods });
    get().persist();
  },

  clearModifiers: () => set({ modifiers: {} }),

  quitToTitle: () => {
    get().persist();
    set({
      ...titleState,
      hydrated: true,
      hasSave: hasResumableSave(),
    });
  },

  restartRun: () => {
    clearSave();
    usePlayerStore.getState().resetRun();
    set({
      ...titleState,
      hydrated: true,
      hasSave: false,
    });
  },

  resetGame: () => {
    get().restartRun();
  },

  persist: () => {
    const state = get();
    if (
      state.phase === "title" ||
      state.phase === "mode-select" ||
      state.runQuestionIds.length === 0
    ) {
      return;
    }
    const player = usePlayerStore.getState();
    const qIndex = progressQuestionIndex(
      state.phase,
      state.currentWorld,
      state.mapTargetWorld
    );
    const progress = {
      worldId: questionIndexToWorldId(qIndex),
      stageIndex: questionIndexToStageIndex(qIndex),
      questionIndex: qIndex,
      bossCompleted: state.bossCompleted,
      answeredIds: answersToIds(state.playerAnswers),
    };
    saveProgress({
      phase: state.phase,
      ...packSaveProgress(progress),
      answers: state.playerAnswers,
      pendingChoice: state.pendingChoice ?? undefined,
      runQuestionIds: state.runQuestionIds,
      checkpointTargetWorld: state.checkpointTargetWorld ?? undefined,
      checkpointNext: state.checkpointNext ?? undefined,
      bossState: state.bossState,
      route: state.route,
      modifiers: state.modifiers,
      runCoins: player.runCoins,
      streak: player.streak,
      inventory: player.inventory,
      gameMode: state.gameMode,
      runLength: state.runLength,
      runScore: state.runScore,
      seed: state.seed,
      worldEvent: state.worldEventId,
      exactStreak: state.exactStreak,
      mapBranch: state.mapBranch ?? undefined,
    });
    set({ hasSave: true });
  },

  getCurrentQuestion: () => {
    const { runQuestions, currentWorld } = get();
    return runQuestions[currentWorld] ?? null;
  },
}));
