// src/game/progress.ts
import { getStagePool, STAGE_COUNT, STAGE_LABELS, type CategoryConfig } from "./categories";

const STORAGE_KEY = "catchap:progress";

export const REWARD_TARGET = 5;
export const POINTS_PER_CORRECT = 10;

export interface StageProgress {
  // Ids of problems solved at least once in this stage. While this doesn't
  // yet cover every problem in the stage, unsolved ones are the only ones
  // shown (no repeats); once it does, the stage replays with the full set.
  solvedIds: string[];
  stars: number;
}

export interface Progress {
  points: number;
  rewardStars: number;
  stickers: number;
  stages: Record<string, StageProgress>;
}

const DEFAULT_PROGRESS: Progress = { points: 0, rewardStars: 0, stickers: 0, stages: {} };

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_PROGRESS, ...parsed, stages: { ...parsed.stages } };
    }
  } catch {
    // localStorage unavailable or corrupted — fall back to defaults
  }
  return { ...DEFAULT_PROGRESS, stages: {} };
}

function saveProgress(progress: Progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // storage full or unavailable — progress just won't persist
  }
}

export function recordCorrectAnswer(
  current: Progress
): { progress: Progress; earnedSticker: boolean } {
  const points = current.points + POINTS_PER_CORRECT;
  let rewardStars = current.rewardStars + 1;
  let stickers = current.stickers;
  let earnedSticker = false;

  if (rewardStars >= REWARD_TARGET) {
    rewardStars = 0;
    stickers += 1;
    earnedSticker = true;
  }

  const progress = { ...current, points, rewardStars, stickers };
  saveProgress(progress);
  return { progress, earnedSticker };
}

// Star rating rewards a clean run: 0 mistakes across the session earns all 3,
// a handful of slips (up to ~20% of the session) still earns 2, and simply
// finishing always earns at least 1.
function starsForRun(wrongCount: number, total: number): number {
  if (wrongCount === 0) return 3;
  if (wrongCount <= Math.max(1, Math.round(total * 0.2))) return 2;
  return 1;
}

function stageKey(categoryKey: string, stageIndex: number): string {
  return `${categoryKey}:${stageIndex}`;
}

export function getStageProgress(
  progress: Progress,
  categoryKey: string,
  stageIndex: number
): StageProgress {
  return progress.stages[stageKey(categoryKey, stageIndex)] ?? { solvedIds: [], stars: 0 };
}

// Marks one problem as solved within a stage — this is what makes it stop
// showing up once the stage is replayed (until every problem in the stage
// has been solved at least once, at which point the stage cycles fresh).
export function recordStageProblemSolved(
  current: Progress,
  categoryKey: string,
  stageIndex: number,
  problemId: string
): Progress {
  const key = stageKey(categoryKey, stageIndex);
  const prior = current.stages[key] ?? { solvedIds: [], stars: 0 };
  if (prior.solvedIds.includes(problemId)) return current;

  const progress: Progress = {
    ...current,
    stages: { ...current.stages, [key]: { ...prior, solvedIds: [...prior.solvedIds, problemId] } },
  };
  saveProgress(progress);
  return progress;
}

export function recordStageComplete(
  current: Progress,
  categoryKey: string,
  stageIndex: number,
  wrongCount: number,
  total: number
): Progress {
  const key = stageKey(categoryKey, stageIndex);
  const prior = current.stages[key] ?? { solvedIds: [], stars: 0 };
  const stars = Math.max(prior.stars, starsForRun(wrongCount, total));

  const progress: Progress = {
    ...current,
    stages: { ...current.stages, [key]: { ...prior, stars } },
  };
  saveProgress(progress);
  return progress;
}

export interface StageState {
  index: number;
  label: string;
  total: number;
  solvedCount: number;
  completed: boolean;
  stars: number;
  isCurrent: boolean;
}

// Every stage is playable any time — no locking. "Current" just marks the
// first not-yet-completed stage, for the "이어서 하기" shortcut and a bit of
// visual emphasis; it doesn't gate access to the others.
export function getStageStates(category: CategoryConfig, progress: Progress): StageState[] {
  let foundCurrent = false;
  return STAGE_LABELS.map((label, index) => {
    const pool = getStagePool(category, index);
    const stageProgress = getStageProgress(progress, category.key, index);
    const validIds = new Set(pool.map((p) => p.id));
    const solvedCount = stageProgress.solvedIds.filter((id) => validIds.has(id)).length;
    const completed = pool.length > 0 && solvedCount >= pool.length;
    const isCurrent = !completed && !foundCurrent;
    if (isCurrent) foundCurrent = true;
    return { index, label, total: pool.length, solvedCount, completed, stars: stageProgress.stars, isCurrent };
  });
}

export interface ChapterState {
  category: CategoryConfig;
  chapterNumber: number;
  completed: boolean;
  isCurrent: boolean;
  stageStates: StageState[];
}

export function getChapterStates(
  categories: CategoryConfig[],
  progress: Progress
): ChapterState[] {
  let foundCurrent = false;
  return categories.map((category, i) => {
    const stageStates = getStageStates(category, progress);
    const completed = stageStates.every((s) => s.completed);
    const isCurrent = !completed && !foundCurrent;
    if (isCurrent) foundCurrent = true;
    return { category, chapterNumber: i + 1, completed, isCurrent, stageStates };
  });
}

export { STAGE_COUNT };
