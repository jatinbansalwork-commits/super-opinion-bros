"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import type { WorldTheme } from "@/lib/types";
import { smoothLinear, smoothLoop } from "@/lib/animations";

interface WorldBackdropProps {
  theme: WorldTheme;
  children: ReactNode;
  pan?: boolean;
}

export function WorldBackdrop({ theme, children, pan = false }: WorldBackdropProps) {
  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{ background: theme.sky }}
    >
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={pan ? { x: ["0%", "-8%", "0%"] } : { x: [0, -20, 0] }}
        transition={
          pan
            ? { ...smoothLinear, duration: 12 }
            : { ...smoothLinear, duration: 20 }
        }
        style={{
          background: `radial-gradient(circle at 20% 30%, ${theme.accent}44 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, white33 0%, transparent 40%)`,
        }}
      />

      <div
        className="absolute bottom-0 left-0 right-0 h-[35%] sm:h-[30%]"
        style={{
          background: `linear-gradient(180deg, transparent 0%, ${theme.ground} 40%)`,
        }}
      />

      <div className="absolute bottom-[28%] left-0 right-0 flex justify-around opacity-60 text-2xl sm:text-4xl pointer-events-none">
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.span
            key={i}
            animate={{ y: [0, -6, 0] }}
            transition={{
              ...smoothLoop,
              duration: 2 + i * 0.3,
            }}
          >
            {theme.decor}
          </motion.span>
        ))}
      </div>

      <div className="relative z-10 h-full w-full">{children}</div>
    </div>
  );
}
