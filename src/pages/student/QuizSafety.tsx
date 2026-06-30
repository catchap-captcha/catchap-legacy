import { useState } from "react";
import { useNavigate } from 'react-router-dom'

interface QuizOption {
  emojis: string;
  label: string;
}

const QUESTION = "길을 안전하게 건너는 친구는?";

const OPTIONS: QuizOption[] = [
  { emojis: "🚦 🙋", label: "초록불에 손 들고 건너요" },
  { emojis: "🚗 🏃", label: "차 사이로 뛰어가요" },
  { emojis: "📱 🚶", label: "휴대폰 보며 걸어요" },
];

const TOTAL_STEPS = 3;
const CORRECT_INDEX = 0;

function optionStyle(isSelected: boolean): React.CSSProperties {
  const base: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    width: 232,
    minHeight: 104,
    cursor: "pointer",
    fontFamily: "inherit",
    borderRadius: 20,
    padding: "22px 18px",
    background: "#fff",
    border: "2.5px solid #eef0ee",
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
    transition: "all 0.12s",
  };
  if (isSelected) {
    return {
      ...base,
      border: "2.5px solid #7bc043",
      background: "#f1f8e8",
      boxShadow: "0 6px 16px rgba(123,192,67,0.18)",
    };
  }
  return base;
}

export default function SafetyQuiz() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<number | null>(0);
  const [step] = useState(0); // 현재 문제 인덱스 (0부터)

  const handleSubmit = () => {
    if (selected === null) return;
    const isCorrect = selected === CORRECT_INDEX;
    console.log(isCorrect ? "정답!" : "다시 생각해보자");
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
          <span style={{ fontSize: 18, fontWeight: 800, color: "#334155" }}>안전 놀이</span>
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
              background: "linear-gradient(135deg, #5f9e87, #9ec3b4)",
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
          gap: 44,
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
          {QUESTION}
        </h1>

        <div style={{ display: "flex", gap: 22, flexWrap: "wrap", justifyContent: "center" }}>
          {OPTIONS.map((opt, i) => (
            <button key={opt.label} onClick={() => setSelected(i)} style={optionStyle(selected === i)}>
              <div style={{ fontSize: 30, lineHeight: 1 }}>{opt.emojis}</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#334155" }}>{opt.label}</div>
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
          골랐어요!
        </button>
      </main>
    </div>
  );
}