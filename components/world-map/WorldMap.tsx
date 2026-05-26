"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { pickKingdomRumor } from "@/data/kingdomRumors";
import { getRunWorldTheme } from "@/data/runWorlds";
import { getThemedWorld } from "@/lib/worldTheme";
import { buildWorldMapView } from "@/lib/mapProgress";
import { cameraPan, smoothIn } from "@/lib/animations";
import type { SecretRoute } from "@/lib/types";
import type { GateSurpriseBundle } from "@/lib/surprise/types";
import { MapNode } from "@/components/world-map/MapNode";
import { InternetEventFlash } from "@/components/surprise/InternetEventFlash";

interface WorldMapProps {
  currentWorld: number;
  mapTargetWorld: number;
  route: SecretRoute;
  bossCompleted: number[];
  runLength: number;
  mapBranch?: import("@/lib/types").MapBranch;
  gateSurprises?: GateSurpriseBundle | null;
  mapFlicker?: boolean;
  onContinue: () => void;
  onMicroBonus?: (coins: number) => void;
}

export function WorldMap({
  currentWorld,
  mapTargetWorld,
  route,
  bossCompleted,
  runLength,
  mapBranch = null,
  gateSurprises = null,
  mapFlicker = false,
  onContinue,
  onMicroBonus,
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
  const [flashEvent, setFlashEvent] = useState(false);
  const theme = getThemedWorld(mapTargetWorld, route);
  const runTheme = getRunWorldTheme(view.worldId);
  const crowd = gateSurprises?.crowdEnergy;
  const gateEvent = gateSurprises?.gateEvent;
  const micro = gateSurprises?.micro;
  const flashMs = gateSurprises?.flashMs ?? 800;
  const enterLabel =
    micro?.id === "do-not-click" && micro.buttonLabel
      ? micro.buttonLabel
      : "ENTER KINGDOM";

  const handleEnter = () => {
    if (micro?.coinBonus && onMicroBonus) {
      onMicroBonus(micro.coinBonus);
    }
    if (gateEvent) {
      setFlashEvent(true);
      window.setTimeout(() => {
        setFlashEvent(false);
        onContinue();
      }, flashMs);
      return;
    }
    onContinue();
  };

  return (
    <motion.div
      className="absolute inset-0 z-25 flex items-center justify-center px-4 overflow-hidden"
      style={{ background: theme.sky }}
      initial={{ opacity: 0, scale: 1 }}
      animate={
        mapFlicker || micro?.id === "bg-flicker"
          ? { opacity: [1, 0.7, 1, 0.85, 1], scale: 1.03 }
          : { opacity: 1, scale: 1.03 }
      }
      exit={{ opacity: 0, scale: 1 }}
      transition={
        mapFlicker || micro?.id === "bg-flicker"
          ? { duration: 0.35, repeat: 2 }
          : cameraPan
      }
    >
      <motion.span
        className="absolute top-[14%] left-[10%] text-2xl opacity-35 pointer-events-none select-none"
        animate={{ x: [0, 12, 0], y: [0, -6, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      >
        ☁️
      </motion.span>
      {(micro?.id === "cloud-whisper" || micro?.id === "wrong-timeline") &&
        micro.message && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.4, 0.9, 0.5] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="absolute top-[12%] left-[18%] font-arcade text-[9px] text-white/70 max-w-[100px] pointer-events-none"
          >
            {micro.message}
          </motion.p>
        )}
      <motion.span
        className="absolute top-[20%] right-[12%] text-xl opacity-25 pointer-events-none select-none"
        animate={{ x: [0, -10, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      >
        ☁️
      </motion.span>

      <div
        className="absolute bottom-0 left-0 right-0 h-[28%]"
        style={{
          background: `linear-gradient(180deg, transparent, ${theme.ground})`,
        }}
      />

      <div
        className="relative z-10 flex flex-col items-center w-full max-w-lg text-center gap-5 sm:gap-6"
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
          className="font-arcade text-[10px] text-white/90 max-w-sm leading-relaxed"
        >
          INTERNET RUMOR:
          <br />
          {rumor}
        </motion.p>

        {crowd && (
          <p className="font-arcade text-[10px] text-white/85">
            Crowd Energy:{" "}
            <span className="text-[#FBD000]">
              {crowd.emoji} {crowd.label}
            </span>
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

        <motion.button
          type="button"
          onClick={handleEnter}
          disabled={flashEvent}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: [0, -4, 0] }}
          whileHover={{ y: -2, scale: 1.03 }}
          whileTap={{ y: 2, scale: 0.97 }}
          transition={{
            opacity: { delay: 0.4 },
            y: { duration: 2, repeat: Infinity, ease: "easeInOut" },
          }}
          className={`font-arcade text-sm border-4 border-[#3D2817] text-white px-8 py-3 rounded-lg shadow-[0_6px_0_#8B0000] ${
            micro?.id === "do-not-click"
              ? "bg-[#3D2817]"
              : "bg-[#E52521]"
          }`}
        >
          {enterLabel}
        </motion.button>
      </div>

      <span
        className="absolute bottom-[22%] right-[8%] text-2xl opacity-50 pointer-events-none"
        aria-hidden
      >
        {runTheme.decor}
      </span>

      <AnimatePresence>
        {flashEvent && gateEvent && (
          <InternetEventFlash event={gateEvent} durationMs={flashMs} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
