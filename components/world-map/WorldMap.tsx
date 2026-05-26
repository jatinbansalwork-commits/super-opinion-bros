"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { pickKingdomRumor } from "@/data/kingdomRumors";
import { getRunWorldTheme } from "@/data/runWorlds";
import { getThemedWorld } from "@/lib/worldTheme";
import {
  buildWorldMapView,
  journeyDotStates,
} from "@/lib/mapProgress";
import { CROWD_ENERGY } from "@/lib/progression";
import { cameraPan, smoothIn } from "@/lib/animations";
import type { SecretRoute } from "@/lib/types";
import { MapNode } from "@/components/world-map/MapNode";

interface WorldMapProps {
  currentWorld: number;
  mapTargetWorld: number;
  route: SecretRoute;
  bossCompleted: number[];
  runLength: number;
  worldEventId?: import("@/lib/types").WorldEventId;
  mapBranch?: import("@/lib/types").MapBranch;
  onContinue: () => void;
}

function JourneyDot({ state }: { state: "done" | "active" | "future" }) {
  if (state === "done") {
    return (
      <span className="text-[#FBD000] text-lg leading-none" aria-hidden>
        ●
      </span>
    );
  }
  if (state === "active") {
    return (
      <motion.span
        className="text-[#FBD000] text-lg leading-none inline-block"
        animate={{ scale: [1, 1.2, 1], opacity: [0.85, 1, 0.85] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      >
        ◎
      </motion.span>
    );
  }
  return (
    <span className="text-white/40 text-lg leading-none" aria-hidden>
      ○
    </span>
  );
}

export function WorldMap({
  currentWorld,
  mapTargetWorld,
  route,
  bossCompleted,
  runLength,
  mapBranch = null,
  onContinue,
}: WorldMapProps) {
  const view = buildWorldMapView(
    currentWorld,
    mapTargetWorld,
    route,
    bossCompleted,
    runLength,
    mapBranch
  );
  const [rumor] = useState(() => pickKingdomRumor(view.worldId));
  const theme = getThemedWorld(mapTargetWorld, route);
  const runTheme = getRunWorldTheme(view.worldId);
  const journeyDots = journeyDotStates(view.journeyFilled, view.journeyTotal);

  return (
    <motion.div
      className="absolute inset-0 z-25 flex items-center justify-center px-4 overflow-hidden"
      style={{ background: theme.sky }}
      initial={{ opacity: 0, scale: 1 }}
      animate={{ opacity: 1, scale: 1.03 }}
      exit={{ opacity: 0, scale: 1 }}
      transition={cameraPan}
    >
      <motion.span
        className="absolute top-[14%] left-[10%] text-2xl opacity-35 pointer-events-none select-none"
        animate={{ x: [0, 12, 0], y: [0, -6, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      >
        ☁️
      </motion.span>
      <motion.span
        className="absolute top-[20%] right-[12%] text-xl opacity-25 pointer-events-none select-none"
        animate={{ x: [0, -10, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      />

      <div
        className="absolute bottom-0 left-0 right-0 h-[28%]"
        style={{
          background: `linear-gradient(180deg, transparent, ${theme.ground})`,
        }}
      />

      <div
        className="relative z-10 flex flex-col items-center w-full max-w-lg text-center gap-4 sm:gap-5"
        style={{ transform: "translateY(-24px)" }}
      >
        <div>
          <p className="font-arcade text-xs text-white/90 drop-shadow-[2px_2px_0_#3D2817]">
            {view.worldLabel}
          </p>
          <h2
            className="font-display text-3xl sm:text-4xl text-[#FBD000] mt-1"
            style={{ textShadow: "3px 3px 0 #3D2817" }}
          >
            {view.kingdomTitle}
          </h2>
        </div>

        <motion.p
          key={rumor}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={smoothIn}
          className="font-arcade text-[10px] text-white/90 border-2 border-[#3D2817] bg-black/25 px-3 py-1.5 max-w-sm"
        >
          INTERNET RUMOR: {rumor}
        </motion.p>

        <div className="font-arcade text-[10px] text-white/85">
          <p className="mb-1">Crowd Energy:</p>
          <div className="flex flex-wrap justify-center gap-x-3 gap-y-1">
            {CROWD_ENERGY.map((tier) => {
              const active = tier.level === view.difficulty;
              return (
                <span
                  key={tier.level}
                  className={
                    active
                      ? "text-[#FBD000]"
                      : "text-white/35"
                  }
                >
                  {tier.emoji} {tier.label}
                </span>
              );
            })}
          </div>
        </div>

        {view.routeLabel && (
          <p className="font-arcade text-[10px] text-[#FBD000]/90">
            {view.routeLabel}
          </p>
        )}

        {view.showBranchFork && (
          <div className="flex gap-8 font-arcade text-[10px] text-white">
            <span className={mapBranch === "normal" ? "text-[#FBD000]" : ""}>
              ↗ NORMAL ROAD
            </span>
            <span className={mapBranch === "chaos" ? "text-[#FBD000]" : ""}>
              ↘ CHAOS ROAD
            </span>
          </div>
        )}

        <div className="w-full max-w-md px-2">
          <motion.div
            className="flex items-center justify-between"
            initial={{ y: 8 }}
            animate={{ y: [8, 4, 8] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          >
            {view.nodes.map((node, i) => (
              <div key={node.index} className="flex items-center flex-1 min-w-0">
                <MapNode kind={node.kind} status={node.status} />
                {i < view.nodes.length - 1 && (
                  <div
                    className={`h-1 flex-1 mx-0.5 rounded min-w-[6px] ${
                      node.status === "completed" ||
                      (view.nodes[i + 1]?.status !== "locked" &&
                        node.status === "current")
                        ? "bg-[#43B047]"
                        : "bg-[#3D2817]/40"
                    }`}
                  />
                )}
              </div>
            ))}
          </motion.div>
          <p className="font-arcade text-xs text-white mt-4 drop-shadow-[1px_1px_0_#3D2817]">
            {view.stageLabel}
          </p>
        </div>

        <div className="text-center">
          <p className="font-arcade text-[10px] text-white/70">🗺 YOUR PATH</p>
          <div className="flex justify-center gap-2 mt-2">
            {journeyDots.map((state, i) => (
              <JourneyDot key={i} state={state} />
            ))}
          </div>
          <p className="font-arcade text-[10px] text-white/80 mt-2">
            {view.journeyLabel}
          </p>
        </div>

        <motion.button
          type="button"
          onClick={onContinue}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: [0, -4, 0] }}
          whileHover={{ y: -2, scale: 1.03 }}
          whileTap={{ y: 2, scale: 0.97 }}
          transition={{
            opacity: { delay: 0.4 },
            y: { duration: 2, repeat: Infinity, ease: "easeInOut" },
          }}
          className="font-arcade text-sm border-4 border-[#3D2817] bg-[#E52521] text-white px-8 py-3 rounded-lg shadow-[0_6px_0_#8B0000]"
        >
          ENTER KINGDOM
        </motion.button>
      </div>

      <span
        className="absolute bottom-[22%] right-[8%] text-2xl opacity-50 pointer-events-none"
        aria-hidden
      >
        {runTheme.decor}
      </span>
    </motion.div>
  );
}
