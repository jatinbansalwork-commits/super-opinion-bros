"use client";

import { motion } from "framer-motion";
import { featuresForMode } from "@/lib/gameMode";
import { usePlayerStore } from "@/store/player";
import { useGameStore } from "@/store/gameStore";
import type { PowerUpType } from "@/lib/types";
import { tweenFast } from "@/lib/animations";

const POWER_META: Record<
  PowerUpType,
  { emoji: string; label: string; color: string }
> = {
  double: { emoji: "🟡", label: "DOUBLE DOWN", color: "bg-[#FBD000]" },
  peek: { emoji: "🔵", label: "WHISPER", color: "bg-[#5C94FC]" },
  "time-travel": { emoji: "🟢", label: "TIME TRAVEL", color: "bg-[#43B047]" },
  "chaos-mode": { emoji: "🔴", label: "CHAOS", color: "bg-[#E52521]" },
  "fifty-fifty": { emoji: "🟡", label: "50/50", color: "bg-[#FBD000]" },
  skip: { emoji: "🟢", label: "SKIP", color: "bg-[#43B047]" },
};

export function PowerUpInventory() {
  const inventory = usePlayerStore((s) => s.inventory);
  const applyPowerUp = useGameStore((s) => s.applyPowerUp);
  const phase = useGameStore((s) => s.phase);
  const gameMode = useGameStore((s) => s.gameMode);

  if (
    phase !== "question" ||
    inventory.length === 0 ||
    !featuresForMode(gameMode).powerUps
  ) {
    return null;
  }

  const handleUse = (id: string) => {
    const used = usePlayerStore.getState().usePowerUp(id);
    if (used) applyPowerUp(used);
  };

  return (
    <div className="fixed top-16 right-4 z-40 flex flex-col gap-2">
      {inventory.map((item) => {
        const meta = POWER_META[item.type];
        return (
          <motion.button
            key={item.id}
            type="button"
            onClick={() => handleUse(item.id)}
            whileHover={{ y: -2, scale: 1.05 }}
            whileTap={{ y: 1, scale: 0.95 }}
            transition={tweenFast}
            className={`flex items-center gap-2 border-4 border-[#3D2817] ${meta.color} px-3 py-2 rounded-lg shadow-[3px_3px_0_#3D2817] font-arcade text-[10px] text-[#3D2817]`}
          >
            <span>{meta.emoji}</span>
            <span>{meta.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
