"use client";

import { motion } from "framer-motion";
import type { NextRunModifier } from "@/lib/types";
import { springFast } from "@/lib/animations";

const OPTIONS: {
  id: NextRunModifier;
  emoji: string;
  label: string;
  hint: string;
}[] = [
  { id: "hot-takes", emoji: "🔥", label: "HOT TAKES", hint: "Double rewards" },
  {
    id: "chaos",
    emoji: "🌪",
    label: "CHAOS",
    hint: "Unexpected outcomes",
  },
  {
    id: "silent-majority",
    emoji: "🗳",
    label: "SILENT MAJORITY",
    hint: "Hide vote bars",
  },
  { id: "random", emoji: "🎭", label: "RANDOM", hint: "Unknown effect" },
];

interface NextRunPickerProps {
  onPick: (mod: NextRunModifier) => void;
}

export function NextRunPicker({ onPick }: NextRunPickerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springFast}
      className="w-full max-w-md border-4 border-[#3D2817] bg-[#5C94FC]/95 rounded-2xl px-4 py-5 shadow-[6px_6px_0_#3D2817]"
    >
      <p className="font-arcade text-[10px] text-[#FBD000] text-center">
        -------------------------
      </p>
      <p className="font-arcade text-xs text-white text-center mt-1">
        YOUR NEXT INTERNET
      </p>
      <p className="font-arcade text-[10px] text-[#FBD000] text-center mt-1">
        -------------------------
      </p>

      <div className="grid grid-cols-2 gap-2 mt-4">
        {OPTIONS.map((opt) => (
          <motion.button
            key={opt.id}
            type="button"
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97, y: 1 }}
            onClick={() => onPick(opt.id)}
            className="border-4 border-[#3D2817] bg-[#FBD000] rounded-xl px-2 py-3 text-center shadow-[4px_4px_0_#3D2817]"
          >
            <p className="text-lg">{opt.emoji}</p>
            <p className="font-arcade text-[9px] text-[#3D2817] mt-1">
              {opt.label}
            </p>
            <p className="font-arcade text-[7px] text-[#3D2817]/75 mt-0.5">
              {opt.hint}
            </p>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
