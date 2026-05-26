"use client";

import { motion } from "framer-motion";
import { BOSS_MAX_HEALTH } from "@/lib/constants";

interface BossHealthBarProps {
  health: number;
  shake?: boolean;
}

export function BossHealthBar({ health, shake = false }: BossHealthBarProps) {
  const pct = (health / BOSS_MAX_HEALTH) * 100;

  return (
    <motion.div
      animate={shake ? { x: [0, -8, 8, -6, 6, 0] } : {}}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md"
    >
      <p className="font-arcade text-[10px] text-white mb-1 drop-shadow-[1px_1px_0_#3D2817]">
        BOSS HP
      </p>
      <div className="h-4 rounded-lg border-2 border-[#3D2817] bg-black/40 overflow-hidden">
        <motion.div
          className="h-full bg-[#E52521]"
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.35 }}
        />
      </div>
    </motion.div>
  );
}
