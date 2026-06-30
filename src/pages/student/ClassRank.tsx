import { useNavigate } from 'react-router-dom'
import logo from '../../assets/images/logo.png'

type NavKey = "home" | "play" | "collect" | "me";

interface NavItem { key: NavKey; icon: string; label: string; }

const NAV_PATH: Record<NavKey, string> = {
  home: "/student/home",
  play: "/student/pick-play",
  collect: "/student/stickers",
  me: "/student/profile",
};

const NAV: NavItem[] = [
  { key: "home", icon: "🏠", label: "홈" },
  { key: "play", icon: "🧩", label: "놀이" },
  { key: "collect", icon: "⭐", label: "모으기" },
  { key: "me", icon: "🐱", label: "나" },
];

export default function GrowthScreen() {
  const navigate = useNavigate();
  const active: NavKey = "me";

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
        <main style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <h1 style={{ margin: 0, fontSize: 38, fontWeight: 800, color: "#1f3a5f", letterSpacing: "-1px" }}>
            나는 이만큼 자랐어요 🌱
          </h1>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              padding: "56px 40px",
              borderRadius: 24,
              background: "#f1f8ec",
              border: "2px solid #c3e3a8",
              maxWidth: 760,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <span style={{ fontSize: 52, lineHeight: 1 }}>🌱</span>
              <span style={{ fontSize: 44, lineHeight: 1 }}>➡️</span>
              <span style={{ fontSize: 60, lineHeight: 1 }}>🌿</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#1f3a5f" }}>지난주보다 한 뼘 자랐어요!</div>
            <div style={{ fontSize: 17, fontWeight: 600, color: "#6d9e55" }}>지금처럼 천천히 같이 놀아요</div>
          </div>

          <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#94a3b8" }}>
            친구 점수나 이름은 보이지 않아요 · 유치원 설정에 따라 안 보일 수 있어요
          </p>
        </main>
      </div>
    </div>
  );
}