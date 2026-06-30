import { useState } from "react";
import { useNavigate } from 'react-router-dom'

const QUIZ = {
  target: 3,
  counts: [2, 3, 5], // 그릇별 생선 수
  get correctIndex() {
    return this.counts.indexOf(this.target);
  },
};

const TOTAL_STEPS = 5;

const optionStyle: React.CSSProperties = {
  position: "relative",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexWrap: "wrap",
  gap: 4,
  width: 212,
  height: 156,
  padding: 22,
  cursor: "pointer",
  fontFamily: "inherit",
  borderRadius: 24,
  background: "#fff",
  border: "2.5px solid #eef0ee",
  boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
  transition: "all 0.12s",
};

const selectedRingStyle: React.CSSProperties = {
  position: "absolute",
  inset: -2.5,
  borderRadius: 24,
  border: "2.5px solid #5f9e87",
  background: "#eef6f1",
  boxShadow: "0 6px 16px rgba(95,158,135,0.18)",
  pointerEvents: "none",
};

export default function CountingQuiz() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<number | null>(1);
  const [step] = useState(0); // 현재 문제 인덱스 (0부터)

  const handleSubmit = () => {
    if (selected === null) return;
    const isCorrect = selected === QUIZ.correctIndex;
    console.log(isCorrect ? "정답!" : "다시 세어보자");
    navigate('/student/result');
  };

  const handleClose = () => {
    navigate('/student/home');
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        background: "#fff",
        fontFamily:
          "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif",
        color: "#334155",
        WebkitFontSmoothing: "antialiased",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* HEADER */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 24px",
          borderBottom: "1px solid #eef0ee",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1 }}>
          <button
            onClick={handleClose}
            style={{
              width: 38,
              height: 38,
              borderRadius: 999,
              border: "none",
              background: "#eef0ee",
              color: "#64748b",
              fontSize: 18,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>
          <span style={{ fontSize: 18, fontWeight: 800, color: "#334155" }}>수 세기</span>
        </div>

        {/* 진행 점 */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => {
            const active = i === step;
            return (
              <div
                key={i}
                style={{
                  width: active ? 26 : 10,
                  height: 10,
                  borderRadius: 999,
                  background: active ? "#5f9e87" : "#d6dcd8",
                  transition: "all 0.2s",
                }}
              />
            );
          })}
        </div>

        <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 999,
              background: "linear-gradient(135deg, #f0b84a, #e6a82f)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
            }}
          >
            🐱
          </div>
        </div>
      </header>

      {/* QUIZ */}
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 40,
          padding: 40,
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: 36,
            fontWeight: 800,
            color: "#334155",
            letterSpacing: "-1px",
            textAlign: "center",
          }}
        >
          생선이 <span style={{ color: "#e09a4f" }}>{QUIZ.target}마리</span>인 그릇을 눌러요
        </h1>

        {/* 보기 (그릇) */}
        <div style={{ display: "flex", gap: 28, flexWrap: "wrap", justifyContent: "center" }}>
          {QUIZ.counts.map((count, i) => (
            <button key={i} onClick={() => setSelected(i)} style={optionStyle}>
              {selected === i && <span style={selectedRingStyle} />}
              {Array.from({ length: count }).map((_, k) => (
                <span key={k} style={{ position: "relative", zIndex: 1, fontSize: 28, lineHeight: 1 }}>
                  🐟
                </span>
              ))}
            </button>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          style={{
            fontFamily: "inherit",
            fontSize: 22,
            fontWeight: 800,
            color: "#fff",
            border: "none",
            cursor: "pointer",
            padding: "18px 56px",
            borderRadius: 16,
            background: "linear-gradient(135deg, #9ccc4f, #7cb342)",
            boxShadow: "0 5px 0 #5f9433, 0 8px 18px rgba(124,179,66,0.35)",
          }}
        >
          눌렀어요!
        </button>
      </main>
    </div>
  );
}