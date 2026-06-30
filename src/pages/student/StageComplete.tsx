import { useNavigate } from 'react-router-dom'

const TOTAL_STEPS = 5;

interface CompleteProps {
  stars?: number;
  title?: string;
  message?: string;
  rewardLabel?: string;
  onHome?: () => void;
  onOther?: () => void;
}

export default function CountingComplete({
  stars = 3,
  title = "놀이 끝!",
  message = "생선 세기를 다 했어요",
  rewardLabel = "새 스티커를 받았어요",
  onHome,
  onOther,
}: CompleteProps) {
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

        {/* 진행 점 (모두 완료) */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div key={i} style={{ width: 10, height: 10, borderRadius: 999, background: "#5f9e87" }} />
          ))}
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

      {/* COMPLETE */}
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
          padding: 40,
        }}
      >
        <div style={{ fontSize: 52, lineHeight: 1 }}>🎉</div>
        <h1 style={{ margin: "4px 0 0", fontSize: 38, fontWeight: 800, color: "#334155", letterSpacing: "-1px" }}>
          {title}
        </h1>
        <p style={{ margin: 0, fontSize: 17, fontWeight: 600, color: "#94a3b8" }}>{message}</p>

        {/* 별 */}
        <div style={{ display: "flex", gap: 6, margin: "6px 0 4px" }}>
          {Array.from({ length: stars }).map((_, i) => (
            <span key={i} style={{ fontSize: 42, lineHeight: 1 }}>
              ⭐
            </span>
          ))}
        </div>

        {/* 스티커 보상 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
            padding: "18px 36px",
            borderRadius: 16,
            background: "#eef6f1",
          }}
        >
          <span style={{ fontSize: 30, lineHeight: 1 }}>🏅</span>
          <span style={{ fontSize: 15, fontWeight: 800, color: "#334155" }}>{rewardLabel}</span>
        </div>

        <button
          onClick={onHome ?? (() => navigate('/student/home'))}
          style={{
            marginTop: 16,
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
            padding: "18px 60px",
            borderRadius: 16,
            background: "linear-gradient(135deg, #9ccc4f, #7cb342)",
            boxShadow: "0 5px 0 #5f9433, 0 8px 18px rgba(124,179,66,0.35)",
          }}
        >
          집으로 🏠
        </button>

        <button
          onClick={onOther ?? (() => navigate('/student/pick-play'))}
          style={{
            marginTop: 14,
            fontFamily: "inherit",
            fontSize: 15,
            fontWeight: 700,
            color: "#5f9e87",
            background: "transparent",
            border: "none",
            cursor: "pointer",
          }}
        >
          다른 놀이 하기
        </button>
      </main>
    </div>
  );
}