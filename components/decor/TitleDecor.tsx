"use client";

import { motion } from "framer-motion";
import { smoothLinear, smoothLoop } from "@/lib/animations";

export function FloatingCoins() {
  return (
    <>
      {[
        { left: "15%", top: "20%", delay: 0 },
        { left: "72%", top: "28%", delay: 0.5 },
        { left: "88%", top: "48%", delay: 1 },
      ].map((coin, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl sm:text-4xl pointer-events-none select-none"
          style={{ left: coin.left, top: coin.top }}
          animate={{ y: [0, -14, 0] }}
          transition={{
            ...smoothLoop,
            duration: 3.4,
            delay: coin.delay,
          }}
        >
          🪙
        </motion.div>
      ))}
    </>
  );
}

export function FloatingPipes() {
  return (
    <>
      {[
        { left: "8%", bottom: "28%", delay: 0.2 },
        { right: "10%", bottom: "32%", delay: 0.7 },
      ].map((pipe, i) => (
        <motion.div
          key={i}
          className="absolute text-3xl sm:text-5xl pointer-events-none select-none"
          style={{
            left: pipe.left,
            right: pipe.right,
            bottom: pipe.bottom,
          }}
          animate={{ y: [0, -8, 0] }}
          transition={{
            ...smoothLoop,
            duration: 4,
            delay: pipe.delay,
          }}
        >
          🟩
        </motion.div>
      ))}
    </>
  );
}

export function ParallaxClouds({
  slow = false,
  frozen = false,
}: {
  slow?: boolean;
  frozen?: boolean;
}) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[0, 1].map((layer) => (
        <motion.div
          key={layer}
          className="absolute flex gap-20 whitespace-nowrap text-4xl sm:text-5xl opacity-60"
          style={{ top: `${18 + layer * 14}%` }}
          animate={frozen ? { x: 0 } : { x: ["0%", "-50%"] }}
          transition={
            frozen
              ? { duration: 0 }
              : {
                  ...smoothLinear,
                  duration: slow ? 90 + layer * 32 : 52 + layer * 18,
                }
          }
        >
          <span>☁️</span>
          <span>☁️</span>
          <span>☁️</span>
          <span>☁️</span>
        </motion.div>
      ))}
    </div>
  );
}
