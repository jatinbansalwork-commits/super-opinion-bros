"use client";

import { useGameStore } from "@/store/gameStore";

export function useGame() {
  return useGameStore();
}
