import { useNavigate } from 'react-router-dom'

const TOTAL_STEPS = 5;

interface ResultProps {
  step?: number;        // 현재 문제 인덱스 (0부터)
  emoji?: string;
  title?: string;
  message?: string;
  onNext?: () => void;
  onReplay?: () => void;
}

export default function CountingResult({
  step = 1,
  emoji = "🎉",
  title = "맞았어요!",
  message = "생선을 잘 세었어요. 멋지다!",
  onNext,
  onReplay,
}: ResultProps) {
  const navigate = useNavigate();
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
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: 18, fontWeight: 800, color: "#334155" }}>수 세기</span>
        </div>

        {/* 진행 점 */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => {
            const done = i <= step;
            return (
              <div
                key={i}
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 999,
                  background: done ? "#5f9e87" : "#d6dcd8",
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

      {/* RESULT */}
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          padding: 40,
        }}
      >
        <div style={{ fontSize: 56, lineHeight: 1 }}>{emoji}</div>
        <h1 style={{ margin: "4px 0 0", fontSize: 38, fontWeight: 800, color: "#334155", letterSpacing: "-1px" }}>
          {title}
        </h1>
        <p style={{ margin: 0, fontSize: 17, fontWeight: 600, color: "#94a3b8" }}>{message}</p>
        <div style={{ fontSize: 34, lineHeight: 1, margin: "6px 0 4px" }}>⭐</div>

        <button
          onClick={onNext ?? (() => navigate('/student/pick-play'))}
          style={{
            marginTop: 8,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            fontFamily: "inherit",
            fontSize: 22,
            fontWeight: 800,
            color: "#fff",
            border: "none",
            cursor: "pointer",
            padding: "18px 64px",
            borderRadius: 16,
            background: "linear-gradient(135deg, #9ccc4f, #7cb342)",
            boxShadow: "0 5px 0 #5f9433, 0 8px 18px rgba(124,179,66,0.35)",
          }}
        >
          다음 놀이 ▶
        </button>

        <button
          onClick={onReplay}
          style={{
            marginTop: 14,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontFamily: "inherit",
            fontSize: 15,
            fontWeight: 700,
            color: "#94a3b8",
            background: "transparent",
            border: "none",
            cursor: "pointer",
          }}
        >
          🔊 다시 듣기
        </button>
      </main>
    </div>
  );
}