"use client";

import { motion } from "framer-motion";
import type { MapNodeKind } from "@/data/runWorlds";
import type { MapNodeStatus } from "@/lib/mapProgress";
import { springFast } from "@/lib/animations";

interface MapNodeProps {
  kind: MapNodeKind;
  status: MapNodeStatus;
}

function nodeSymbol(kind: MapNodeKind, status: MapNodeStatus): string {
  if (status === "completed") return "✓";
  if (status === "current") return "🙂";
  if (kind === "boss") return "🏰";
  if (kind === "checkpoint") return "◆";
  return "●";
}

export function MapNode({ kind, status }: MapNodeProps) {
  const symbol = nodeSymbol(kind, status);
  const isBoss = kind === "boss";
  const isCurrent = status === "current";
  const isCompleted = status === "completed";

  return (
    <motion.div
      className={`
        relative flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center border-4 border-[#3D2817]
        ${isCompleted ? "bg-[#43B047] rounded-full" : ""}
        ${isCurrent ? "bg-[#FBD000] rounded-full" : ""}
        ${status === "locked" ? "bg-[#8B8B8B] rounded-full" : ""}
        ${kind === "checkpoint" && status === "locked" ? "rotate-45 rounded-sm" : ""}
        ${kind === "checkpoint" && status !== "locked" ? "rotate-45 rounded-sm" : ""}
      `}
      initial={isCompleted ? { scale: 0.6 } : false}
      animate={
        isCurrent
          ? { scale: [1, 1.06, 1], y: [0, -4, 0] }
          : isCompleted
            ? { scale: 1 }
            : isBoss && status !== "locked"
              ? { rotate: [0, -6, 6, 0] }
              : {}
      }
      transition={
        isCurrent
          ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" }
          : isCompleted
            ? springFast
            : isBoss
              ? { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
              : springFast
      }
    >
      <span
        className={`
          ${kind === "checkpoint" && status === "locked" ? "rotate-[-45deg]" : ""}
          ${kind === "checkpoint" && status !== "locked" ? "rotate-[-45deg]" : ""}
          ${isCompleted || isCurrent ? "font-arcade text-sm sm:text-base" : ""}
          ${status === "locked" && kind === "question" ? "text-white/60 text-lg leading-none" : ""}
          ${status === "locked" && kind !== "question" ? "text-white/70 text-base" : ""}
        `}
      >
        {symbol}
      </span>
      {isBoss && isCurrent && (
        <motion.span
          className="absolute -top-3 text-sm pointer-events-none"
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          🚩
        </motion.span>
      )}
    </motion.div>
  );
}
