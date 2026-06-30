import { useNavigate } from 'react-router-dom'

const TOTAL_STEPS = 5;

interface Reward {
  icon: string;
  label: string;
}

interface RewardProps {
  rewards?: Reward[];
  title?: string;
  message?: string;
  onDecorate?: () => void;
  onHome?: () => void;
}

const DEFAULT_REWARDS: Reward[] = [
  { icon: "🐰", label: "토끼 친구" },
  { icon: "🌈", label: "무지개 테두리" },
];

export default function RewardScreen({
  rewards = DEFAULT_REWARDS,
  title = "새 친구가 생겼어요!",
  message = "별을 많이 모아서 선물이 열렸어요",
  onDecorate,
  onHome,
}: RewardProps) {
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
          <span style={{ fontSize: 18, fontWeight: 800, color: "#334155" }}>보상</span>
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

      {/* REWARD */}
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
        <div style={{ fontSize: 56, lineHeight: 1 }}>🎁</div>
        <h1 style={{ margin: "4px 0 0", fontSize: 40, fontWeight: 800, color: "#334155", letterSpacing: "-1px" }}>
          {title}
        </h1>
        <p style={{ margin: 0, fontSize: 17, fontWeight: 600, color: "#94a3b8" }}>{message}</p>

        {/* 보상 아이템 */}
        <div style={{ display: "flex", gap: 18, margin: "10px 0 4px" }}>
          {rewards.map((r) => (
            <div
              key={r.label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                width: 122,
                height: 122,
                borderRadius: 18,
                background: "#eef6f1",
              }}
            >
              <span style={{ fontSize: 38, lineHeight: 1 }}>{r.icon}</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: "#334155" }}>{r.label}</span>
            </div>
          ))}
        </div>

        <button
          onClick={onDecorate}
          style={{
            marginTop: 16,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
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
          꾸미러 가기
        </button>

        <button
          onClick={onHome ?? (() => navigate('/student/home'))}
          style={{
            marginTop: 14,
            fontFamily: "inherit",
            fontSize: 15,
            fontWeight: 800,
            color: "#5f9e87",
            background: "transparent",
            border: "none",
            cursor: "pointer",
          }}
        >
          집으로
        </button>
      </main>
    </div>
  );
}