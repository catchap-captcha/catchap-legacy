// src/pages/ChapterPage.tsx
// Shown when a chapter is opened from the home page: picks a difficulty
// stage (LV.1~LV.5) instead of dropping straight into gameplay. Each stage
// tracks its own "already solved" problem ids so a replay skips them until
// the whole stage has been cleared once.
import { Link } from "react-router-dom";
import { loadProgress, getStageStates } from "../game/progress";
import { COLORS } from "../game/theme";
import type { CategoryConfig } from "../game/categories";

interface Props {
  category: CategoryConfig;
}

function StageCard({ category, state }: { category: CategoryConfig; state: ReturnType<typeof getStageStates>[number] }) {
  const { index, label, total, solvedCount, completed, stars, isCurrent } = state;
  const statusText = completed ? "완료" : solvedCount > 0 ? `진행중 · ${solvedCount}/${total}` : "시작 전";
  const statusColor = completed ? COLORS.success : isCurrent ? COLORS.primary : COLORS.subtext;

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 14,
        background: "#fff",
        border: `2px solid ${isCurrent ? COLORS.primary : COLORS.inactiveBorder}`,
        borderRadius: 22,
        padding: "18px 22px",
        boxShadow: isCurrent ? "0 10px 24px rgba(239,111,92,0.14)" : "0 4px 14px rgba(58,46,42,0.05)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14, flex: "1 1 180px", minWidth: 0 }}>
        <span
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            flex: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 15,
            fontWeight: 800,
            background: completed ? COLORS.successLight : isCurrent ? COLORS.primaryLight : "#F5F1EE",
            color: completed ? COLORS.success : isCurrent ? COLORS.primary : COLORS.subtext,
          }}
        >
          {completed ? "✓" : `${index + 1}`}
        </span>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: COLORS.primary, marginBottom: 3 }}>LV.{index + 1}</div>
          <div style={{ fontSize: 15.5, fontWeight: 800, color: COLORS.text, whiteSpace: "nowrap" }}>{label}</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: statusColor, marginTop: 3, whiteSpace: "nowrap" }}>
            {statusText}
            {completed && stars > 0 && (
              <span style={{ marginLeft: 8, color: COLORS.gold }}>{"★".repeat(stars)}{"☆".repeat(3 - stars)}</span>
            )}
          </div>
        </div>
      </div>

      <Link
        to={`${category.path}/${index + 1}`}
        style={{
          flex: "none",
          marginLeft: "auto",
          fontSize: 13,
          fontWeight: 800,
          color: completed ? COLORS.primary : "#fff",
          background: completed ? COLORS.primaryLight : COLORS.primary,
          padding: "11px 20px",
          borderRadius: 999,
          textDecoration: "none",
          whiteSpace: "nowrap",
          boxShadow: completed ? "none" : "0 4px 10px rgba(239,111,92,0.35)",
        }}
      >
        {completed ? "↻ 다시 하기" : solvedCount > 0 ? "▶ 이어서 하기" : "▶ 도전!"}
      </Link>
    </div>
  );
}

export default function ChapterPage({ category }: Props) {
  const progress = loadProgress();
  const stageStates = getStageStates(category, progress);
  const completedCount = stageStates.filter((s) => s.completed).length;
  const current = stageStates.find((s) => s.isCurrent);
  const percent = Math.round((completedCount / stageStates.length) * 100);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at top left, #fff8f5, #fff1ea 55%, #ffe6db)",
        fontFamily: '"Pretendard", -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "28px 24px 48px" }}>
        <Link
          to="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13.5,
            fontWeight: 700,
            color: COLORS.subtext,
            textDecoration: "none",
            marginBottom: 18,
          }}
        >
          ← 전체 학습으로
        </Link>

        <div
          style={{
            background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`,
            borderRadius: 26,
            padding: "24px 26px",
            color: "#fff",
            marginBottom: 24,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span
              style={{
                width: 52,
                height: 52,
                borderRadius: 16,
                background: "rgba(255,255,255,0.22)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                flex: "none",
              }}
            >
              {category.emoji}
            </span>
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 700, background: "rgba(255,255,255,0.2)", display: "inline-block", padding: "3px 10px", borderRadius: 999, marginBottom: 6 }}>
                {category.tagLabel}
              </div>
              <div style={{ fontSize: 22, fontWeight: 800 }}>{category.shortTitle}</div>
            </div>
          </div>
          <p style={{ margin: "14px 0 0", fontSize: 13, opacity: 0.9 }}>{category.subtitle}</p>

          <div style={{ marginTop: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, fontWeight: 700, marginBottom: 8 }}>
              <span style={{ opacity: 0.85 }}>단계 진행</span>
              <span>
                5단계 중 {completedCount}개 완료
              </span>
            </div>
            <div style={{ height: 9, borderRadius: 999, background: "rgba(255,255,255,0.25)" }}>
              <div style={{ width: `${percent}%`, height: "100%", borderRadius: 999, background: "#fff" }} />
            </div>
          </div>

          {current && (
            <Link
              to={`${category.path}/${current.index + 1}`}
              style={{
                display: "inline-flex",
                marginTop: 18,
                fontSize: 13,
                fontWeight: 800,
                color: COLORS.primary,
                background: "#fff",
                padding: "10px 18px",
                borderRadius: 999,
                textDecoration: "none",
              }}
            >
              ▶ 이어서 하기
            </Link>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {stageStates.map((state) => (
            <StageCard key={state.index} category={category} state={state} />
          ))}
        </div>
      </div>
    </div>
  );
}
