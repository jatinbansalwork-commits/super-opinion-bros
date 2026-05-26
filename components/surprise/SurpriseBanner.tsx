"use client";

import { motion } from "framer-motion";
import { getSurpriseDef, type SurpriseType } from "@/lib/surpriseEngine";
import { smoothIn } from "@/lib/animations";

interface SurpriseBannerProps {
  type: SurpriseType;
}

export function SurpriseBanner({ type }: SurpriseBannerProps) {
  const def = getSurpriseDef(type);
  if (!def) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={smoothIn}
      className="font-arcade text-[10px] text-white border-2 border-[#FBD000] bg-[#E52521]/90 px-3 py-1.5 rounded-lg shadow-[3px_3px_0_#3D2817] text-center"
    >
      {def.emoji} {def.title} — {def.hint}
    </motion.div>
  );
}
