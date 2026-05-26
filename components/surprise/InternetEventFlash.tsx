"use client";

import { motion } from "framer-motion";
import type { InternetGateEvent } from "@/lib/surprise/types";
import { smoothIn } from "@/lib/animations";

interface InternetEventFlashProps {
  event: InternetGateEvent;
  durationMs: number;
}

export function InternetEventFlash({ event, durationMs }: InternetEventFlashProps) {
  return (
    <motion.div
      className="absolute inset-0 z-40 flex items-center justify-center px-4 bg-black/55 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.12 }}
    >
      <motion.div
        initial={{ scale: 0.85, y: 12 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92 }}
        transition={smoothIn}
        className="text-center max-w-sm border-8 border-[#3D2817] bg-[#5C94FC] rounded-2xl px-6 py-8 shadow-[8px_8px_0_#3D2817]"
      >
        <p className="text-5xl" aria-hidden>
          {event.emoji}
        </p>
        <p className="font-arcade text-sm text-[#FBD000] mt-3">{event.title}</p>
        <p className="font-arcade text-[10px] text-white/90 mt-2">{event.hint}</p>
      </motion.div>
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0, 1] }}
        transition={{ duration: durationMs / 1000, times: [0, 0.7, 1] }}
        aria-hidden
      />
    </motion.div>
  );
}
