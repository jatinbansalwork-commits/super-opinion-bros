"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useGameStore } from "@/store/gameStore";
import { TitleScreen } from "@/components/screens/TitleScreen";
import { ModeSelectScreen } from "@/components/screens/ModeSelectScreen";
import { PipeEntryTransition } from "@/components/transitions/PipeEntryTransition";
import { FinalCastle } from "@/components/screens/FinalCastle";
import { GamePlayLayer } from "@/components/game/GamePlayLayer";
import { MusicToggle } from "@/components/ui/MusicToggle";
import { AudioToast } from "@/components/ui/AudioToast";
import { GameHud } from "@/components/ui/GameHud";
import { PlayerStatsBar } from "@/components/ui/PlayerStatsBar";
import { PowerUpInventory } from "@/components/powerups/PowerUpInventory";
import { useGameAudio } from "@/hooks/useGameAudio";
import { useAudioUnlock } from "@/hooks/useAudioUnlock";
import { audio } from "@/lib/audio";
import { getSavePreview } from "@/lib/savePreview";
import { saveSettings } from "@/lib/storage";
import { featuresForMode } from "@/lib/gameMode";
import type { GameMode } from "@/lib/types";
import { smooth } from "@/lib/animations";

const LAUNCH_MS = 580;

export function GameShell() {
  const {
    phase,
    gameMode,
    finalResult,
    hydrated,
    hasSave,
    hydrate,
    goToModeSelect,
    startNewGame,
    continueGame,
    quitToTitle,
    restartRun,
    resetGame,
  } = useGameStore();

  const [pipeActive, setPipeActive] = useState(false);
  const [modeLaunching, setModeLaunching] = useState(false);
  const [mapEntering, setMapEntering] = useState(false);

  const savePreview = useMemo(
    () => (phase === "mode-select" && hasSave ? getSavePreview() : null),
    [phase, hasSave]
  );

  useEffect(() => {
    hydrate();
    audio.init();
    saveSettings({ version: "2.3" });
  }, [hydrate]);

  useAudioUnlock();
  useGameAudio(phase, hydrated);

  const inGame =
    phase === "world-map" ||
    phase === "question" ||
    phase === "result" ||
    phase === "boss" ||
    phase === "boss-result" ||
    phase === "world-clear" ||
    phase === "checkpoint";

  const showPowerUps = inGame && featuresForMode(gameMode).powerUps;

  const handleStartClick = useCallback(() => {
    audio.unlock();
    audio.playSfx("select");
    setPipeActive(true);
  }, []);

  const handlePipeComplete = useCallback(() => {
    setPipeActive(false);
    goToModeSelect();
  }, [goToModeSelect]);

  const handleResume = useCallback(() => {
    audio.playSfx("start");
    continueGame();
  }, [continueGame]);

  const handleModeNewRun = useCallback(() => {
    audio.playSfx("select");
  }, []);

  const handleLaunchMode = useCallback(
    (mode: GameMode) => {
      audio.playSfx("start");
      setModeLaunching(true);
      window.setTimeout(() => {
        startNewGame(mode);
        setModeLaunching(false);
        setMapEntering(true);
        window.setTimeout(() => setMapEntering(false), 700);
      }, LAUNCH_MS);
    },
    [startNewGame]
  );

  const handleQuit = () => {
    audio.stop();
    setPipeActive(false);
    setModeLaunching(false);
    quitToTitle();
  };

  const handleRestart = () => {
    restartRun();
  };

  return (
    <div className="game-viewport bg-[#5C94FC]">
      <MusicToggle />
      <AudioToast />

      {inGame && (
        <>
          <GameHud onRestart={handleRestart} onQuit={handleQuit} />
          <PlayerStatsBar />
          {showPowerUps && <PowerUpInventory />}
        </>
      )}

      <div className="absolute inset-0">
        <motion.div
          className="absolute inset-0"
          animate={{
            opacity: inGame && mapEntering ? 1 : inGame ? 1 : 1,
            scale: mapEntering ? [0.96, 1] : 1,
          }}
          transition={{ duration: 0.65, ease: "easeOut" }}
        >
          {inGame && <GamePlayLayer phase={phase} />}
        </motion.div>

        <AnimatePresence mode="wait">
          {phase === "title" && (
            <motion.div
              key="title"
              className="absolute inset-0 z-30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={smooth}
            >
              <TitleScreen
                ready={hydrated}
                cloudsFrozen={pipeActive}
                uiHidden={pipeActive}
                onStart={handleStartClick}
              />
              <AnimatePresence>
                {pipeActive && (
                  <PipeEntryTransition onComplete={handlePipeComplete} />
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {phase === "mode-select" && (
            <motion.div
              key="mode-select"
              className="absolute inset-0 z-30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            >
              <ModeSelectScreen
                savePreview={savePreview}
                launching={modeLaunching}
                onResume={handleResume}
                onNewRun={handleModeNewRun}
                onLaunch={handleLaunchMode}
              />
            </motion.div>
          )}

          {phase === "final" && finalResult && (
            <motion.div
              key="final"
              className="absolute inset-0 z-30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={smooth}
            >
              <FinalCastle
                result={finalResult}
                onPlayAgain={() => {
                  audio.stop();
                  resetGame();
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
