"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { stageBob } from "@/lib/animations";

const BLOCK_COUNT = 7;

export function StageBlocks() {
  const [shineIndex, setShineIndex] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => {
      if (Math.random() > 0.65) {
        setShineIndex(Math.floor(Math.random() * BLOCK_COUNT));
        setTimeout(() => setShineIndex(null), 400);
      }
    };
    const id = setInterval(tick, 2800);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 z-[5] flex justify-center gap-2 sm:gap-3 bottom-[36px] sm:bottom-[48px]"
      aria-hidden
    >
      {Array.from({ length: BLOCK_COUNT }).map((_, i) => (
        <motion.div
          key={i}
          className="relative h-12 w-12 sm:h-14 sm:w-14 rounded-sm border-4 border-[#5D3A1A] bg-[#8B4513]"
          style={{
            boxShadow:
              "0 6px 0 #5D3A1A, 0 10px 16px rgba(61,40,23,0.35)",
          }}
          animate={{ y: [0, -6, 0] }}
          transition={{
            ...stageBob,
            delay: i * 0.1,
          }}
        >
          {shineIndex === i && (
            <motion.div
              className="absolute inset-1 rounded-sm bg-white/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.7, 0] }}
              transition={{ duration: 0.4 }}
            />
          )}
        </motion.div>
      ))}
    </div>
  );
}
