"use client";

import { usePlayerStore } from "@/store/player";

export function PlayerStatsBar() {
  const runCoins = usePlayerStore((s) => s.runCoins);
  const level = usePlayerStore((s) => s.level);

  return (
    <div className="fixed top-3 left-3 z-40 border-[3px] border-[#3D2817] bg-[#FBD000]/95 rounded-md px-2.5 py-2 shadow-[2px_2px_0_#3D2817] font-arcade text-[8px] text-[#3D2817]">
      <p className="text-[9px] leading-none">🪙 {runCoins}</p>
      <p className="mt-2 text-[8px] leading-none opacity-80">
        Level {level}
      </p>
    </div>
  );
}
