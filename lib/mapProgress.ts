import {
  getRunWorld,
  questionIndexToStageIndex,
  questionIndexToWorldId,
  type MapNodeKind,
} from "@/data/runWorlds";
import { MAP_SEGMENT_SIZE } from "@/lib/constants";
import { worldCountForRunLength } from "@/lib/gameMode";
import type { MapBranch, SecretRoute } from "@/lib/types";
import { ROUTE_DISPLAY_NAMES } from "@/data/routes";

export type MapNodeStatus = "locked" | "current" | "completed";

export interface MapNodeView {
  index: number;
  stageIndex: number;
  kind: MapNodeKind;
  status: MapNodeStatus;
}

export interface WorldMapViewModel {
  worldId: number;
  worldLabel: string;
  kingdomTitle: string;
  difficulty: 1 | 2 | 3;
  routeLabel: string | null;
  stageLabel: string;
  nodes: MapNodeView[];
  journeyFilled: number;
  journeyTotal: number;
  journeyLabel: string;
  nextUnlockTitle: string | null;
  mapBranch: MapBranch;
  showBranchFork: boolean;
}

export interface RunProgressSnapshot {
  worldId: number;
  stageIndex: number;
  questionIndex: number;
  bossCompleted: number[];
}

export function snapshotFromQuestionIndex(
  questionIndex: number,
  bossCompleted: number[] = []
): RunProgressSnapshot {
  return {
    worldId: questionIndexToWorldId(questionIndex),
    stageIndex: questionIndexToStageIndex(questionIndex),
    questionIndex,
    bossCompleted,
  };
}

export function migrateSaveProgress(
  currentQuestion: number,
  mapTargetWorld: number | undefined,
  bossCompleted: number[] | undefined,
  answeredIds: string[] | undefined,
  runLength: number = 20
): RunProgressSnapshot {
  const questionIndex = mapTargetWorld ?? currentQuestion;
  const worldId = questionIndexToWorldId(questionIndex);
  const stageIndex = questionIndexToStageIndex(questionIndex);
  const worldTotal = worldCountForRunLength(runLength);

  let completed = bossCompleted ?? [];
  if (completed.length === 0 && answeredIds) {
    const answeredCount = answeredIds.length;
    completed = [];
    for (let w = 1; w <= worldTotal; w++) {
      if (answeredCount >= w * MAP_SEGMENT_SIZE) {
        completed.push(w);
      }
    }
  }

  return {
    worldId,
    stageIndex,
    questionIndex,
    bossCompleted: completed,
  };
}

export function buildWorldMapView(
  currentQuestionIndex: number,
  mapTargetQuestionIndex: number,
  route: SecretRoute,
  bossCompleted: number[] = [],
  runLength: number = 20,
  mapBranch: MapBranch = null
): WorldMapViewModel {
  const journeyTotal = worldCountForRunLength(runLength);
  const worldId = questionIndexToWorldId(mapTargetQuestionIndex);
  const showBranchFork =
    mapBranch !== null &&
    mapTargetQuestionIndex >= 3 &&
    mapTargetQuestionIndex < MAP_SEGMENT_SIZE;
  const world = getRunWorld(worldId);
  const worldStart = (worldId - 1) * MAP_SEGMENT_SIZE;
  const stageIndex = questionIndexToStageIndex(mapTargetQuestionIndex);

  const worldCleared = bossCompleted.includes(worldId);

  const nodes: MapNodeView[] = world.nodeKinds.map((kind, i) => {
    const globalIndex = worldStart + i;
    let status: MapNodeStatus = "locked";
    if (worldCleared && kind === "boss") {
      status = "completed";
    } else if (globalIndex < currentQuestionIndex) {
      status = "completed";
    } else if (globalIndex === mapTargetQuestionIndex) {
      status = "current";
    } else if (
      globalIndex < mapTargetQuestionIndex &&
      globalIndex >= worldStart
    ) {
      status = "completed";
    }

    return {
      index: i,
      stageIndex: i + 1,
      kind,
      status,
    };
  });

  const routeLabel =
    route === "default" ? null : ROUTE_DISPLAY_NAMES[route];

  const nextWorld = getRunWorld(worldId + 1);

  return {
    worldId,
    worldLabel: kingdomLabel(worldId),
    kingdomTitle: world.title,
    difficulty: world.difficulty,
    routeLabel,
    stageLabel: `Gate ${stageIndex} of ${MAP_SEGMENT_SIZE}`,
    nodes,
    journeyFilled: worldId,
    journeyTotal,
    journeyLabel: `KINGDOM ${worldId} OF ${journeyTotal}`,
    nextUnlockTitle:
      world.unlockTitle ?? nextWorld?.title ?? null,
    mapBranch,
    showBranchFork,
  };
}

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

export function kingdomLabel(worldId: number): string {
  const roman = ROMAN[worldId - 1];
  return roman ? `KINGDOM ${roman}` : `KINGDOM ${worldId}`;
}
