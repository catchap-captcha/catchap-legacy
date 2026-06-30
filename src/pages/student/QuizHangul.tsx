import { useState } from "react";
import { useNavigate } from 'react-router-dom'

interface JamoOption {
  jamo: string;
}

const QUIZ = {
  word: "여우",
  emoji: "🦊",
  options: [{ jamo: "ㅇ" }, { jamo: "ㄱ" }, { jamo: "ㅁ" }] as JamoOption[],
  correctIndex: 0,
};

const TOTAL_STEPS = 4;

function optionStyle(): React.CSSProperties {
  return {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 226,
    height: 196,
    cursor: "pointer",
    fontFamily: "inherit",
    borderRadius: 26,
    background: "#fff",
    border: "2.5px solid #eef0ee",
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
    transition: "all 0.12s",
  };
}

const selectedRingStyle: React.CSSProperties = {
  position: "absolute",
  inset: -2.5,
  borderRadius: 26,
  border: "2.5px solid #5f9e87",
  background: "#eef6f1",
  boxShadow: "0 6px 16px rgba(95,158,135,0.18)",
  pointerEvents: "none",
};

export default function HangulSoundQuiz() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<number | null>(0);
  const [step] = useState(0); // 현재 문제 인덱스 (0부터)

  const handleSubmit = () => {
    if (selected === null) return;
    const isCorrect = selected === QUIZ.correctIndex;
    console.log(isCorrect ? "정답!" : "다시 들어보자");
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
          <span style={{ fontSize: 18, fontWeight: 800, color: "#334155" }}>한글 소리</span>
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
          gap: 18,
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
          <span style={{ fontSize: 38 }}>{QUIZ.emoji}</span>{" "}
          <span style={{ color: "#e09a4f" }}>{QUIZ.word}</span>의 첫소리를 골라요
        </h1>
        <p style={{ margin: "0 0 22px", fontSize: 17, fontWeight: 700, color: "#94a3b8" }}>
          소리를 듣고 같은 글자를 눌러요
        </p>

        {/* 보기 */}
        <div style={{ display: "flex", gap: 30, flexWrap: "wrap", justifyContent: "center" }}>
          {QUIZ.options.map((opt, i) => (
            <button key={i} onClick={() => setSelected(i)} style={optionStyle()}>
              {selected === i && <span style={selectedRingStyle} />}
              <span
                style={{
                  position: "relative",
                  zIndex: 1,
                  fontSize: 72,
                  fontWeight: 700,
                  color: "#2b2b2b",
                  lineHeight: 1,
                }}
              >
                {opt.jamo}
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          style={{
            marginTop: 26,
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