"use client";

import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useGameStore } from "@/store/gameStore";
import { usePlayerStore } from "@/store/player";
import { getThemedWorld } from "@/lib/worldTheme";
import { RoundView } from "@/components/game/RoundView";
import { WorldMap } from "@/components/world-map/WorldMap";
import { WorldClearScreen } from "@/components/world-map/WorldClearScreen";
import { BossBattle } from "@/components/boss/BossBattle";
import { CastleCheckpoint } from "@/components/checkpoint/CastleCheckpoint";
import { WorldBackdrop } from "@/components/ui/WorldBackdrop";
import { cameraPan, slideTransition } from "@/lib/animations";
import { CAMERA_PAN_MS } from "@/lib/constants";
import type { GamePhase } from "@/lib/types";

const PAUSE_MS_DEFAULT = 800;
const PAUSE_MS_SPEED = 220;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface GamePlayLayerProps {
  phase: GamePhase;
}

export function GamePlayLayer({ phase }: GamePlayLayerProps) {
  const {
    currentWorld,
    mapTargetWorld,
    route,
    runLength,
    mapBranch,
    gateSurprises,
    mapFlicker,
    bossInternetNews,
    getActiveSurprise,
    isSpeedRound,
    lastPrediction,
    bossCompleted,
    worldClearWorldId,
    answers,
    pendingChoice,
    playerAnswers,
    bossState,
    modifiers,
    submitAnswer,
    advanceAfterResult,
    dismissCheckpoint,
    dismissWorldMap,
    submitBossPrediction,
    dismissBossResult,
    dismissWorldClear,
    getCurrentQuestion,
  } = useGameStore();

  const [continuing, setContinuing] = useState(false);
  const [enterFromRight, setEnterFromRight] = useState(false);
  const [cameraX, setCameraX] = useState("0%");

  const question = getCurrentQuestion();
  const theme = getThemedWorld(currentWorld, route);
  const playerChoice = question ? answers[question.id] : undefined;
  const handleContinue = useCallback(async () => {
    if (continuing || !question) return;
    setContinuing(true);
    await delay(isSpeedRound() ? PAUSE_MS_SPEED : PAUSE_MS_DEFAULT);
    setCameraX("-14%");
    await delay(CAMERA_PAN_MS);
    setCameraX("0%");
    setEnterFromRight(true);
    advanceAfterResult();
    setContinuing(false);
  }, [continuing, question, advanceAfterResult, isSpeedRound]);

  const showRound =
    (phase === "question" || phase === "result") && question;

  return (
    <div className="absolute inset-0 overflow-hidden">
      <WorldBackdrop
        theme={theme}
        pan={phase === "result" || phase === "boss"}
      >
        <motion.div
          className="absolute inset-0"
          animate={{ x: cameraX }}
          transition={cameraPan}
        >
          <AnimatePresence mode="wait">
            {phase === "world-map" && (
              <motion.div
                key={`map-${mapTargetWorld}`}
                className="absolute inset-0"
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.55, ease: "easeOut" }}
              >
                <WorldMap
                  currentWorld={currentWorld}
                  mapTargetWorld={mapTargetWorld}
                  route={route}
                  bossCompleted={bossCompleted}
                  runLength={runLength}
                  mapBranch={mapBranch}
                  gateSurprises={gateSurprises}
                  mapFlicker={mapFlicker}
                  onContinue={dismissWorldMap}
                  onMicroBonus={(coins) =>
                    usePlayerStore.getState().addCoins(coins)
                  }
                />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {phase === "world-clear" && worldClearWorldId != null && (
              <WorldClearScreen
                key="world-clear"
                worldId={worldClearWorldId}
                onContinue={dismissWorldClear}
              />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {phase === "checkpoint" && (
              <CastleCheckpoint
                key="checkpoint"
                playerAnswers={playerAnswers}
                onContinue={dismissCheckpoint}
              />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {(phase === "boss" || phase === "boss-result") &&
              bossState && (
                <BossBattle
                  key="boss"
                  phase={phase}
                  completedCount={currentWorld + 1}
                  bossState={bossState}
                  lastChoice={pendingChoice ?? undefined}
                  internetNews={bossInternetNews}
                  onPredict={submitBossPrediction}
                  onDismissResult={dismissBossResult}
                />
              )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {showRound && (
              <motion.div
                key={question.id}
                className="absolute inset-0 z-10"
                initial={
                  enterFromRight
                    ? { x: "80%", opacity: 0 }
                    : { x: 0, opacity: 1 }
                }
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: "-80%", opacity: 0 }}
                transition={slideTransition}
                onAnimationComplete={(def) => {
                  if (def === "exit") setEnterFromRight(true);
                }}
              >
                <RoundView
                  question={question}
                  phase={phase}
                  playerChoice={(pendingChoice ?? playerChoice)!}
                  modifiers={modifiers}
                  lastPrediction={lastPrediction}
                  activeSurprise={getActiveSurprise()}
                  onAnswer={submitAnswer}
                  onContinue={handleContinue}
                  continuing={continuing}
                  locked={!!answers[question.id]}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </WorldBackdrop>
    </div>
  );
}
