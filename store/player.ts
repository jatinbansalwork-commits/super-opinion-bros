import { create } from "zustand";
import { MAX_POWERUPS } from "@/lib/constants";
import {
  COIN_BOSS,
  COIN_MATCH,
  COIN_STREAK_BONUS,
  computeMatchPercent,
  levelFromXp,
  rankDisplayLabel,
  XP_BOSS,
  XP_CHECKPOINT,
  XP_MATCH,
} from "@/lib/progression";
import { loadPlayer, savePlayer } from "@/lib/storage";
import type { PowerUpItem, PowerUpType, SecretRoute } from "@/lib/types";

interface PlayerStore {
  coins: number;
  xp: number;
  level: number;
  matchRate: number;
  bestResult: string | null;
  route: SecretRoute;
  inventory: PowerUpItem[];
  runCoins: number;
  streak: number;
  hydrated: boolean;

  hydrate: () => void;
  resetRun: () => void;
  syncMatchRate: (answers: import("@/lib/types").PlayerAnswer[]) => void;
  setBestResult: (result: { order: number; title: string }) => void;
  addMatchReward: (
    matched: boolean,
    doubled?: boolean,
    allowPowerUpDrop?: boolean
  ) => void;
  addBossReward: () => void;
  addCheckpointXp: () => void;
  setRoute: (route: SecretRoute) => void;
  grantPowerUp: (type: PowerUpType) => boolean;
  grantPowerUpAfterWorldClear: () => boolean;
  usePowerUp: (id: string) => PowerUpType | null;
  persist: () => void;
}

let powerUpCounter = 0;

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  coins: 0,
  xp: 0,
  level: 1,
  matchRate: 0,
  bestResult: null,
  route: "default",
  inventory: [],
  runCoins: 0,
  streak: 0,
  hydrated: false,

  hydrate: () => {
    const p = loadPlayer();
    const level = levelFromXp(p.xp);
    set({
      coins: p.coins,
      xp: p.xp,
      level,
      matchRate: p.matchRate ?? 0,
      bestResult: p.bestResult ?? null,
      route: p.route,
      inventory: p.inventory.slice(0, MAX_POWERUPS),
      hydrated: true,
    });
  },

  resetRun: () => {
    set({ runCoins: 0, streak: 0, matchRate: 0 });
    get().persist();
  },

  syncMatchRate: (answers) => {
    const matchRate = computeMatchPercent(answers);
    set({ matchRate });
    get().persist();
  },

  setBestResult: (result) => {
    const existing = loadPlayer().bestResult;
    const existingOrder =
      existing?.startsWith("👑")
        ? 4
        : existing?.startsWith("🧠")
          ? 3
          : existing?.startsWith("🙂")
            ? 2
            : existing?.startsWith("👀")
              ? 1
              : existing?.startsWith("🥷")
                ? 0
                : -1;
    if (result.order >= existingOrder) {
      set({ bestResult: result.title });
      get().persist();
    }
  },

  addMatchReward: (matched, doubled = false, allowPowerUpDrop = true) => {
    let coins = COIN_MATCH;
    let streak = get().streak;
    if (matched) {
      streak += 1;
      if (streak > 0 && streak % 3 === 0) coins += COIN_STREAK_BONUS;
    } else {
      streak = 0;
    }
    if (doubled) coins *= 2;
    const xp = XP_MATCH;
    const totalCoins = get().coins + coins;
    const totalXp = get().xp + xp;
    const level = levelFromXp(totalXp);
    set({
      coins: totalCoins,
      runCoins: get().runCoins + coins,
      xp: totalXp,
      level,
      streak,
    });
    get().persist();
    /* Power-ups granted after world clear (Phase 2). */
  },

  addBossReward: () => {
    const totalCoins = get().coins + COIN_BOSS;
    const totalXp = get().xp + XP_BOSS;
    const level = levelFromXp(totalXp);
    set({
      coins: totalCoins,
      runCoins: get().runCoins + COIN_BOSS,
      xp: totalXp,
      level,
    });
    get().persist();
  },

  addCheckpointXp: () => {
    const totalXp = get().xp + XP_CHECKPOINT;
    const level = levelFromXp(totalXp);
    set({
      xp: totalXp,
      level,
    });
    get().persist();
  },

  setRoute: (route) => {
    set({ route });
    get().persist();
  },

  grantPowerUp: (type) => {
    if (get().inventory.length >= MAX_POWERUPS) return false;
    powerUpCounter += 1;
    set({
      inventory: [
        ...get().inventory,
        { type, id: `pu-${type}-${powerUpCounter}` },
      ],
    });
    get().persist();
    return true;
  },

  grantPowerUpAfterWorldClear: () => {
    if (get().inventory.length >= MAX_POWERUPS) return false;
    const pool: PowerUpType[] = [
      "double",
      "peek",
      "time-travel",
      "chaos-mode",
    ];
    const type = pool[Math.floor(Math.random() * pool.length)];
    return get().grantPowerUp(type);
  },

  usePowerUp: (id) => {
    const item = get().inventory.find((i) => i.id === id);
    if (!item) return null;
    set({ inventory: get().inventory.filter((i) => i.id !== id) });
    get().persist();
    return item.type;
  },

  persist: () => {
    savePlayer({
      coins: get().coins,
      xp: get().xp,
      matchRate: get().matchRate,
      bestResult: get().bestResult ?? undefined,
      route: get().route,
      inventory: get().inventory,
    });
  },
}));
