import { create } from "zustand";
import { MAX_POWERUPS } from "@/lib/constants";
import { COIN_BOSS, internetTitleForLevel, levelFromCoins } from "@/lib/rewards";
import type { PowerUpItem, PowerUpType, SecretRoute } from "@/lib/types";

interface PlayerStore {
  runCoins: number;
  level: number;
  internetTitle: string;
  route: SecretRoute;
  inventory: PowerUpItem[];
  hydrated: boolean;

  hydrate: () => void;
  resetSession: () => void;
  resetRun: () => void;
  addCoins: (amount: number) => void;
  addBossReward: () => void;
  setRoute: (route: SecretRoute) => void;
  grantPowerUp: (type: PowerUpType) => boolean;
  grantPowerUpAfterWorldClear: () => boolean;
  usePowerUp: (id: string) => PowerUpType | null;
}

let powerUpCounter = 0;

function applyCoinTotals(runCoins: number) {
  const level = levelFromCoins(runCoins);
  return {
    runCoins,
    level,
    internetTitle: internetTitleForLevel(level),
  };
}

const freshPlayer = {
  runCoins: 0,
  level: 1,
  internetTitle: internetTitleForLevel(1),
  route: "default" as SecretRoute,
  inventory: [] as PowerUpItem[],
};

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  ...freshPlayer,
  hydrated: false,

  hydrate: () => {
    set({ ...freshPlayer, hydrated: true });
  },

  resetSession: () => {
    set({ ...freshPlayer, hydrated: true });
  },

  resetRun: () =>
    set({
      ...applyCoinTotals(0),
      inventory: [],
      route: get().route,
      hydrated: true,
    }),

  addCoins: (amount) => {
    const runCoins = get().runCoins + amount;
    set(applyCoinTotals(runCoins));
  },

  addBossReward: () => {
    const runCoins = get().runCoins + COIN_BOSS;
    set(applyCoinTotals(runCoins));
  },

  setRoute: (route) => set({ route }),

  grantPowerUp: (type) => {
    if (get().inventory.length >= MAX_POWERUPS) return false;
    powerUpCounter += 1;
    set({
      inventory: [
        ...get().inventory,
        { type, id: `pu-${type}-${powerUpCounter}` },
      ],
    });
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
    return item.type;
  },
}));
