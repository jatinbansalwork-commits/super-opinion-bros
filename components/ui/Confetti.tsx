"use client";

import { motion } from "framer-motion";
import { smoothIn } from "@/lib/animations";

const COLORS = ["#E52521", "#FBD000", "#43B047", "#5C94FC", "#FF6B9D"];

export function Confetti() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-20">
      {Array.from({ length: 40 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 rounded-sm"
          style={{
            background: COLORS[i % COLORS.length],
            left: `${(i * 2.5) % 100}%`,
            top: -20,
          }}
          animate={{
            y: ["0vh", "110vh"],
            x: (i % 2 === 0 ? 1 : -1) * (30 + (i % 5) * 20),
            rotate: i % 2 === 0 ? 360 : -360,
            opacity: [1, 0],
          }}
          transition={{
            ...smoothIn,
            duration: 2.5 + (i % 5) * 0.4,
            repeat: Infinity,
            delay: (i % 10) * 0.15,
          }}
        />
      ))}
    </div>
  );
}
