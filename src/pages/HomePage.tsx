// src/pages/HomePage.tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { categories } from "../game/categories";
import { loadProgress, getChapterStates, type ChapterState } from "../game/progress";
import { COLORS, SUBJECTS, type Subject } from "../game/theme";

const NAV_ITEMS = [
  { label: "홈", active: false },
  { label: "전체 학습", active: true },
  { label: "개념 설명", active: false },
  { label: "AI 선생님", active: false },
  { label: "나의 기록", active: false },
];

function TopNav() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 28,
        padding: "16px 32px",
        background: "#fff",
        boxShadow: "0 2px 10px rgba(58,46,42,0.06)",
        flexWrap: "wrap",
      }}
    >
      <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", flex: "none" }}>
        <span
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            background: COLORS.primary,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
            flex: "none",
          }}
        >
          🐾
        </span>
        <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.15 }}>
          <span style={{ fontSize: 19, fontWeight: 800, color: COLORS.text }}>CatChap</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: COLORS.subtext }}>놀면서 배우는 캡차 학습</span>
        </span>
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, overflowX: "auto" }}>
        {NAV_ITEMS.map((item) => (
          <span
            key={item.label}
            title={item.active ? undefined : "준비 중이에요"}
            style={{
              flex: "none",
              fontSize: 14.5,
              fontWeight: 800,
              padding: "9px 16px",
              borderRadius: 999,
              color: item.active ? "#fff" : COLORS.subtext,
              background: item.active ? COLORS.primary : "transparent",
              cursor: item.active ? "default" : "not-allowed",
              userSelect: "none",
            }}
          >
            {item.label}
          </span>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14, flex: "none" }}>
        <span title="준비 중이에요" style={{ fontSize: 18, color: COLORS.subtext, cursor: "not-allowed" }}>
          🔍
        </span>
        <span title="준비 중이에요" style={{ fontSize: 18, color: COLORS.subtext, cursor: "not-allowed" }}>
          🔔
        </span>
        <span
          title="준비 중이에요"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: COLORS.primaryLight,
            padding: "6px 14px 6px 6px",
            borderRadius: 999,
            cursor: "not-allowed",
          }}
        >
          <span
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              background: COLORS.gold,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 15,
            }}
          >
            🐱
          </span>
          <span style={{ fontSize: 13.5, fontWeight: 800, color: COLORS.text }}>우리 친구</span>
        </span>
      </div>
    </div>
  );
}

function StatBadge({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div
      style={{
        background: "#fff",
        border: `1.5px solid ${COLORS.inactiveBorder}`,
        borderRadius: 16,
        padding: "10px 22px",
        textAlign: "center",
        flex: "none",
      }}
    >
      <div style={{ fontSize: 18, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 11, color: COLORS.subtext, fontWeight: 700, whiteSpace: "nowrap" }}>{label}</div>
    </div>
  );
}

function pillStyle(active: boolean, disabled = false): React.CSSProperties {
  return {
    flex: "none",
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "10px 18px",
    borderRadius: 999,
    fontSize: 13.5,
    fontWeight: 800,
    fontFamily: "inherit",
    border: `1.5px solid ${active ? COLORS.primary : COLORS.inactiveBorder}`,
    background: active ? COLORS.primary : "#fff",
    color: active ? "#fff" : COLORS.subtext,
    opacity: disabled ? 0.7 : 1,
    cursor: disabled ? "not-allowed" : "pointer",
  };
}

function ChapterStepCard({ state }: { state: ChapterState }) {
  const { category, chapterNumber, completed, isCurrent } = state;
  const status = completed ? "완료" : isCurrent ? "진행중" : "시작 전";
  const statusColor = completed ? COLORS.success : isCurrent ? COLORS.primary : COLORS.subtext;
  const icon = completed ? "✓" : isCurrent ? "▶" : "·";

  return (
    <Link
      to={category.path}
      style={{
        flex: "0 0 148px",
        background: completed ? COLORS.successLight : isCurrent ? COLORS.primaryLight : "#F7F3F0",
        border: `1.5px solid ${isCurrent ? COLORS.primary : "transparent"}`,
        borderRadius: 16,
        padding: "14px 14px",
        textDecoration: "none",
        display: "block",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 11.5, fontWeight: 800, color: COLORS.subtext }}>LV.{chapterNumber}</span>
        <span
          style={{
            width: 20,
            height: 20,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11,
            background: completed ? COLORS.success : isCurrent ? COLORS.primary : "#D8CFCA",
            color: "#fff",
          }}
        >
          {icon}
        </span>
      </div>
      <div style={{ fontSize: 13.5, fontWeight: 800, color: COLORS.text, marginBottom: 4, lineHeight: 1.3 }}>
        {category.shortTitle}
      </div>
      <div style={{ fontSize: 11.5, fontWeight: 700, color: statusColor }}>{status}</div>
    </Link>
  );
}

function KoreanSubjectCard({
  chapterStates,
  completedCount,
  percent,
  current,
}: {
  chapterStates: ChapterState[];
  completedCount: number;
  percent: number;
  current: ChapterState | undefined;
}) {
  const korean = SUBJECTS[0];

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 26,
        padding: 22,
        boxShadow: "0 8px 24px rgba(58,46,42,0.06)",
        marginBottom: 20,
        display: "flex",
        gap: 22,
        flexWrap: "wrap",
      }}
    >
      <div
        style={{
          flex: "0 0 260px",
          background: korean.gradient,
          borderRadius: 22,
          padding: "22px 20px",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div>
          <span
            style={{
              display: "inline-flex",
              fontSize: 11.5,
              fontWeight: 700,
              background: "rgba(255,255,255,0.2)",
              padding: "4px 10px",
              borderRadius: 999,
            }}
          >
            국어
          </span>
          <div style={{ fontSize: 24, fontWeight: 800, marginTop: 10 }}>국어</div>
          <div style={{ fontSize: 12.5, opacity: 0.9, marginTop: 4 }}>{korean.description}</div>
        </div>
        <div style={{ marginTop: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
            <span>
              {completedCount}/{chapterStates.length} 챕터
            </span>
            <span>{percent}%</span>
          </div>
          <div style={{ height: 8, borderRadius: 999, background: "rgba(255,255,255,0.28)" }}>
            <div style={{ width: `${percent}%`, height: "100%", borderRadius: 999, background: "#fff" }} />
          </div>
        </div>
      </div>

      <div style={{ flex: 1, minWidth: 280 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: COLORS.text }}>챕터별 학습</span>
          {current ? (
            <Link
              to={`${current.category.path}/${(current.stageStates.find((s) => s.isCurrent)?.index ?? 0) + 1}`}
              style={{ fontSize: 13, fontWeight: 800, color: COLORS.primary, textDecoration: "none" }}
            >
              이어서 하기 →
            </Link>
          ) : (
            <span style={{ fontSize: 13, fontWeight: 800, color: COLORS.gold }}>🏆 전체 완주!</span>
          )}
        </div>
        <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 6 }}>
          {chapterStates.map((state) => (
            <ChapterStepCard key={state.category.key} state={state} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ComingSoonSubjectCard({ subject }: { subject: Subject }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 26,
        padding: 22,
        boxShadow: "0 8px 24px rgba(58,46,42,0.06)",
        marginBottom: 20,
        display: "flex",
        gap: 22,
        flexWrap: "wrap",
        opacity: 0.85,
      }}
    >
      <div style={{ flex: "0 0 260px", background: subject.gradient, borderRadius: 22, padding: "22px 20px", color: "#fff" }}>
        <span
          style={{
            display: "inline-flex",
            fontSize: 11.5,
            fontWeight: 700,
            background: "rgba(255,255,255,0.2)",
            padding: "4px 10px",
            borderRadius: 999,
          }}
        >
          {subject.label}
        </span>
        <div style={{ fontSize: 24, fontWeight: 800, marginTop: 10 }}>{subject.label}</div>
        <div style={{ fontSize: 12.5, opacity: 0.9, marginTop: 4 }}>{subject.description}</div>
      </div>
      <div style={{ flex: 1, minWidth: 280, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 13.5, fontWeight: 700, color: COLORS.subtext }}>🚧 준비 중인 과목이에요. 곧 만나요!</span>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [progress] = useState(loadProgress);
  const [activeSubject, setActiveSubject] = useState("all");
  const chapterStates = getChapterStates(categories, progress);
  const completedCount = chapterStates.filter((c) => c.completed).length;
  const current = chapterStates.find((c) => c.isCurrent);
  const percent = Math.round((completedCount / categories.length) * 100);
  const level = Math.floor(progress.points / 100) + 1;

  const showKorean = activeSubject === "all" || activeSubject === "korean";
  const otherSubjects = SUBJECTS.filter(
    (s) => s.key !== "korean" && (activeSubject === "all" || activeSubject === s.key)
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at top left, #fff8f5, #fff1ea 55%, #ffe6db)",
        fontFamily: '"Pretendard", -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      <TopNav />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 48px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: 16,
            padding: "28px 0 0",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span
              style={{
                width: 52,
                height: 52,
                borderRadius: 16,
                background: COLORS.primaryLight,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                flex: "none",
              }}
            >
              🐾
            </span>
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, color: COLORS.text }}>전체 학습</div>
              <div style={{ fontSize: 13.5, color: COLORS.subtext, marginTop: 4 }}>
                국어·영어·수학·과학·역사·생활 여섯 과목을 단계별로 차근차근 배워요
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <StatBadge value={`레벨 ${level}`} label="나의 학습 레벨" color={COLORS.gold} />
            <StatBadge value={`${percent}%`} label="국어 진행률" color={COLORS.success} />
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, padding: "24px 0 22px", overflowX: "auto" }}>
          <button onClick={() => setActiveSubject("all")} style={pillStyle(activeSubject === "all")}>
            🗂️ 전체
          </button>
          {SUBJECTS.map((s) => (
            <button
              key={s.key}
              onClick={() => s.active && setActiveSubject(s.key)}
              title={s.active ? undefined : "곧 추가될 과목이에요"}
              style={pillStyle(activeSubject === s.key, !s.active)}
            >
              <span>{s.icon}</span>
              {s.label}
            </button>
          ))}
        </div>

        {showKorean && (
          <KoreanSubjectCard
            chapterStates={chapterStates}
            completedCount={completedCount}
            percent={percent}
            current={current}
          />
        )}
        {otherSubjects.map((s) => (
          <ComingSoonSubjectCard key={s.key} subject={s} />
        ))}
      </div>
    </div>
  );
}
