// src/game/PlayPage.tsx
import { useCallback, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { shuffle } from "../utils/random";
import {
  loadProgress,
  recordCorrectAnswer,
  recordStageProblemSolved,
  recordStageComplete,
  getStageProgress,
  POINTS_PER_CORRECT,
  REWARD_TARGET,
  type Progress,
} from "./progress";
import GameShell from "./GameShell";
import { COLORS } from "./theme";
import { getStagePool, STAGE_COUNT, STAGE_LABELS, type CategoryConfig } from "./categories";
import type { CaptchaProblem } from "../components/captcha/types";

const ENCOURAGEMENTS = [
  "천천히, 잘 하고 있어요!",
  "이 속도면 금방 끝나요!",
  "집중력이 최고예요!",
  "다음 문제도 파이팅!",
];

interface Props {
  category: CategoryConfig;
}

function parseStageIndex(stageParam: string | undefined): number {
  const parsed = Number(stageParam);
  if (!Number.isFinite(parsed)) return 0;
  return Math.min(Math.max(parsed - 1, 0), STAGE_COUNT - 1);
}

// While a stage still has unsolved problems, only those are shown (no
// repeats). Once every problem in the stage has been solved at least once,
// it replays with the full set — repeats are fine at that point.
function pickOrder(category: CategoryConfig, stageIndex: number, progress: Progress): CaptchaProblem[] {
  const pool = getStagePool(category, stageIndex);
  const stageProgress = getStageProgress(progress, category.key, stageIndex);
  const unsolved = pool.filter((p) => !p.id || !stageProgress.solvedIds.includes(p.id));
  const candidates = unsolved.length > 0 ? unsolved : pool;
  return shuffle(candidates);
}

export default function PlayPage({ category }: Props) {
  const { stage } = useParams<{ stage: string }>();
  // Re-key on the stage param: React Router reuses the component instance
  // when only a route param changes, which would otherwise leak the
  // previous stage's round/order/progress state into the new one.
  return <PlayPageForStage key={stage} category={category} stage={stage} />;
}

function PlayPageForStage({ category, stage }: Props & { stage: string | undefined }) {
  const navigate = useNavigate();
  const stageIndex = parseStageIndex(stage);
  const [progress, setProgress] = useState(loadProgress);
  const [order, setOrder] = useState(() => pickOrder(category, stageIndex, progress));
  const total = order.length;
  const [round, setRound] = useState(1);
  const [solved, setSolved] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [justEarnedSticker, setJustEarnedSticker] = useState(false);
  const [done, setDone] = useState(false);

  const handleSuccess = useCallback(() => {
    setSolved(true);
    setCorrectCount((c) => c + 1);
    setStreak((s) => s + 1);
    const problemId = order[round - 1]?.id;
    setProgress((prev) => {
      const { progress: afterPoints, earnedSticker } = recordCorrectAnswer(prev);
      setJustEarnedSticker(earnedSticker);
      return problemId ? recordStageProblemSolved(afterPoints, category.key, stageIndex, problemId) : afterPoints;
    });
  }, [order, round, category.key, stageIndex]);

  const handleRetry = useCallback(() => {
    setWrongCount((w) => w + 1);
    setStreak(0);
  }, []);

  const isLastRound = round >= total;

  const goToChapter = () => navigate(category.path);

  const handleFooterClick = () => {
    if (isLastRound) {
      setProgress((prev) => recordStageComplete(prev, category.key, stageIndex, wrongCount, total));
      setDone(true);
      return;
    }
    setRound((r) => r + 1);
    setSolved(false);
    setJustEarnedSticker(false);
  };

  const handleRestart = () => {
    setOrder(pickOrder(category, stageIndex, progress));
    setRound(1);
    setSolved(false);
    setCorrectCount(0);
    setWrongCount(0);
    setStreak(0);
    setJustEarnedSticker(false);
    setDone(false);
  };

  const encouragement = ENCOURAGEMENTS[round % ENCOURAGEMENTS.length];
  const Captcha = category.Component;
  const currentIndex = round - 1;
  const stageLabel = STAGE_LABELS[stageIndex];

  return (
    <GameShell
      tagLabel={category.tagLabel}
      emoji={category.emoji}
      title={category.title}
      subtitle={`LV.${stageIndex + 1} ${stageLabel} · ${category.subtitle}`}
      round={Math.min(round, total)}
      total={total}
      points={progress.points}
      rewardStars={progress.rewardStars}
      rewardTarget={REWARD_TARGET}
      justEarnedSticker={justEarnedSticker}
      correctCount={correctCount}
      wrongCount={wrongCount}
      streak={streak}
      encouragement={encouragement}
      footerStatus={done ? "국어 · 단계 완료" : `국어 · ${round}/${total}문제 진행 중`}
      footerButtonLabel={isLastRound ? "결과 보기" : "다음 문제 →"}
      footerButtonDisabled={!solved}
      showFooterButton={!done}
      onFooterClick={handleFooterClick}
      onExit={goToChapter}
    >
      {done ? (
        <SessionSummary
          total={total}
          correctCount={correctCount}
          wrongCount={wrongCount}
          earnedPoints={correctCount * POINTS_PER_CORRECT}
          onRestart={handleRestart}
          onExit={goToChapter}
        />
      ) : (
        <Captcha
          key={currentIndex}
          problem={order[currentIndex]}
          onSuccess={handleSuccess}
          onRetry={handleRetry}
        />
      )}
    </GameShell>
  );
}

function SessionSummary({
  total,
  correctCount,
  wrongCount,
  earnedPoints,
  onRestart,
  onExit,
}: {
  total: number;
  correctCount: number;
  wrongCount: number;
  earnedPoints: number;
  onRestart: () => void;
  onExit: () => void;
}) {
  return (
    <div className="captcha-fade-in" style={{ textAlign: "center", padding: "12px 0" }}>
      <div style={{ fontSize: 46, marginBottom: 10 }}>🎉</div>
      <p style={{ fontSize: 19, fontWeight: 800, color: COLORS.text, margin: "0 0 6px" }}>
        {total}문제를 모두 풀었어요!
      </p>
      <p style={{ fontSize: 14, color: COLORS.subtext, margin: "0 0 24px" }}>
        맞힌 문제 {correctCount}개 · 틀린 문제 {wrongCount}개 · 획득 포인트 +{earnedPoints}
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12 }}>
        <button
          onClick={onRestart}
          style={{
            fontFamily: "inherit",
            fontSize: 14.5,
            fontWeight: 800,
            padding: "12px 24px",
            borderRadius: 999,
            border: `2px solid ${COLORS.border}`,
            background: "#fff",
            color: COLORS.text,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          다시 도전하기
        </button>
        <button
          onClick={onExit}
          style={{
            fontFamily: "inherit",
            fontSize: 14.5,
            fontWeight: 800,
            padding: "12px 24px",
            borderRadius: 999,
            border: "none",
            background: COLORS.primary,
            color: "#fff",
            cursor: "pointer",
            whiteSpace: "nowrap",
            boxShadow: "0 6px 14px rgba(239,111,92,0.35)",
          }}
        >
          다른 단계 하러 가기
        </button>
      </div>
    </div>
  );
}
