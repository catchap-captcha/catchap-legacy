import { useNavigate } from 'react-router-dom'
import logo from '../../assets/images/logo.png'

type NavKey = "home" | "play" | "collect" | "me";

const NAV_PATH: Record<NavKey, string> = {
  home: "/student/home",
  play: "/student/pick-play",
  collect: "/student/stickers",
  me: "/student/profile",
};

interface NavItem {
  key: NavKey;
  icon: string;
  label: string;
}

interface Sticker {
  icon: string;
  label: string;
}

const NAV: NavItem[] = [
  { key: "home", icon: "🏠", label: "홈" },
  { key: "play", icon: "🧩", label: "놀이" },
  { key: "collect", icon: "⭐", label: "모으기" },
  { key: "me", icon: "🐱", label: "나" },
];

const OWNED: Sticker[] = [
  { icon: "🐟", label: "생선왕" },
  { icon: "🔢", label: "수세기" },
  { icon: "🔥", label: "3일 놀이" },
  { icon: "🔺", label: "모양박사" },
  { icon: "🚦", label: "안전이" },
  { icon: "🍎", label: "사과왕" },
  { icon: "⭐", label: "별 모으기" },
  { icon: "🎨", label: "색칠이" },
];

const LOCKED_COUNT = 4;

function stickerStyle(owned: boolean): React.CSSProperties {
  const base: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    height: 118,
    borderRadius: 16,
    border: "2px solid transparent",
  };
  if (owned) {
    return {
      ...base,
      background: "#fff",
      border: "2px solid #f3c969",
      boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
    };
  }
  return { ...base, background: "#f2f4f2" };
}

export default function MyStickers() {
  const navigate = useNavigate();
  const active: NavKey = "collect";

  const handleSpeak = () => {
    // TODO: 음성 안내 재생
  };

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
        <main style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <h1 style={{ margin: 0, fontSize: 30, fontWeight: 800, color: "#1f3a5f", letterSpacing: "-0.5px" }}>
              내 스티커 ⭐
            </h1>
            <button
              onClick={handleSpeak}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                fontFamily: "inherit",
                fontSize: 16,
                fontWeight: 700,
                color: "#7a5a00",
                background: "#ffd84d",
                border: "none",
                padding: "11px 22px",
                borderRadius: 999,
                cursor: "pointer",
                boxShadow: "0 3px 8px rgba(255,200,40,0.4)",
              }}
            >
              <span style={{ fontSize: 18 }}>🎲</span> 들려줘
            </button>
          </div>
          <p style={{ margin: "0 0 22px", fontSize: 15, fontWeight: 600, color: "#94a3b8" }}>
            모은 스티커 {OWNED.length}개
          </p>

          {/* 스티커 그리드 */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 18 }}>
            {OWNED.map((s) => (
              <div key={s.label} style={stickerStyle(true)}>
                <span style={{ fontSize: 36, lineHeight: 1 }}>{s.icon}</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: "#334155" }}>{s.label}</span>
              </div>
            ))}
            {Array.from({ length: LOCKED_COUNT }).map((_, i) => (
              <div key={`locked-${i}`} style={stickerStyle(false)}>
                <span style={{ fontSize: 36, lineHeight: 1 }}>🔒</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#aab2ad" }}>잠김</span>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}