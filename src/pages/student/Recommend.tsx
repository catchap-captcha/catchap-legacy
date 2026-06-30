import { useNavigate } from 'react-router-dom'
import logo from '../../assets/images/logo.png'

type NavKey = "home" | "play" | "collect" | "me";

interface NavItem { key: NavKey; icon: string; label: string; }
interface PlayItem { icon: string; title: string; desc: string; }

const NAV_PATH: Record<NavKey, string> = {
  home: "/student/home",
  play: "/student/pick-play",
  collect: "/student/stickers",
  me: "/student/profile",
};

const ITEM_PATH: Record<string, string> = {
  "한글 소리 놀이": "/student/quiz-hangul",
  "생선 옮기기": "/student/quiz-drag",
  "사과 세기 도전": "/student/quiz-counting",
};

const NAV: NavItem[] = [
  { key: "home", icon: "🏠", label: "홈" },
  { key: "play", icon: "🧩", label: "놀이" },
  { key: "collect", icon: "⭐", label: "모으기" },
  { key: "me", icon: "🐱", label: "나" },
];

const ITEMS: PlayItem[] = [
  { icon: "🗣️", title: "한글 소리 놀이", desc: "천천히 하면 잘할 수 있어" },
  { icon: "🐟", title: "생선 옮기기", desc: "드래그 연습이에요" },
  { icon: "🍎", title: "사과 세기 도전", desc: "한 단계 더!" },
];

export default function RecommendScreen() {
  const navigate = useNavigate();
  const active: NavKey = "play";

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        background: "#eef0ee",
        fontFamily:
          "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif",
        color: "#334155",
        WebkitFontSmoothing: "antialiased",
        boxSizing: "border-box",
      }}
    >
      {/* HEADER — 학생 홈과 동일 */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 36px",
          background: "linear-gradient(to right, #5f9e87, #9ec3b4)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src={logo} alt="캣챱 로고" style={{ width: 38, height: 38, display: "block" }} />
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span style={{ fontSize: 28, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>캣챱</span>
            <span style={{ fontSize: 15, fontWeight: 600, color: "#ecfdf5" }}>Catchap</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 22 }}>🐱</span>
          <span style={{ fontSize: 17, fontWeight: 800, color: "#fff" }}>토리</span>
          <span
            style={{
              borderRadius: 999,
              background: "rgba(255,255,255,0.2)",
              padding: "6px 14px",
              fontSize: 13,
              fontWeight: 700,
              color: "#fff",
            }}
          >
            별님반·유치원
          </span>
        </div>
      </header>

      {/* BODY */}
      <div
        style={{
          width: "100%",
          boxSizing: "border-box",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "200px 1fr",
          alignItems: "start",
          gap: 28,
          padding: "28px 36px 48px",
        }}
      >
        {/* 사이드바 — 학생 홈과 동일 */}
        <aside
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            minHeight: 760,
            borderRadius: 20,
            background: "#fff",
            padding: "22px 14px",
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
          }}
        >
          {NAV.map((it) => {
            const isActive = it.key === active;
            return (
              <div
                key={it.key}
                onClick={() => navigate(NAV_PATH[it.key])}
                style={{
                  display: "flex",
                  cursor: "pointer",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  borderRadius: 16,
                  padding: "18px 8px",
                  background: isActive ? "#e3f3ea" : "transparent",
                  color: isActive ? "#3d9d70" : "#64748b",
                }}
              >
                <span style={{ fontSize: 28 }}>{it.icon}</span>
                <span style={{ fontSize: 14, fontWeight: 700 }}>{it.label}</span>
              </div>
            );
          })}
        </aside>

        {/* 메인 */}
        <main style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h1 style={{ margin: 0, fontSize: 38, fontWeight: 800, color: "#1f3a5f", letterSpacing: "-1px" }}>
              이거 해볼까?
            </h1>
            <button
              onClick={() => {}}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                fontFamily: "inherit",
                fontSize: 18,
                fontWeight: 800,
                color: "#8a6a16",
                cursor: "pointer",
                border: "none",
                padding: "12px 24px",
                borderRadius: 999,
                background: "#f5cf5e",
                boxShadow: "0 4px 0 #d9ad36",
              }}
            >
              🔊 들려줘
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {ITEMS.map((it) => (
              <button
                key={it.title}
                onClick={() => navigate(ITEM_PATH[it.title])}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                  width: "100%",
                  textAlign: "left",
                  fontFamily: "inherit",
                  cursor: "pointer",
                  border: "none",
                  padding: "26px 30px",
                  borderRadius: 20,
                  background: "#fff",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                }}
              >
                <span style={{ fontSize: 36, lineHeight: 1, flexShrink: 0 }}>{it.icon}</span>
                <span style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
                  <span style={{ fontSize: 21, fontWeight: 800, color: "#1f3a5f" }}>{it.title}</span>
                  <span style={{ fontSize: 16, fontWeight: 600, color: "#94a3b8" }}>{it.desc}</span>
                </span>
                <span style={{ fontSize: 26, color: "#5f9e87", lineHeight: 1, flexShrink: 0 }}>▶</span>
              </button>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}