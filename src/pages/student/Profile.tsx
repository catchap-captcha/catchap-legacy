import { useNavigate } from 'react-router-dom'
import logo from '../../assets/images/logo.png'

type NavKey = "home" | "play" | "collect" | "me";

interface NavItem { key: NavKey; icon: string; label: string; }
interface Stat { icon: string; value: string; label: string; }
interface Menu { icon: string; label: string; }

const NAV_PATH: Record<NavKey, string> = {
  home: "/student/home",
  play: "/student/pick-play",
  collect: "/student/stickers",
  me: "/student/profile",
};

const MENU_PATH: Record<string, string> = {
  "나의 놀이 기록": "/student/history",
  "설정": "/student/settings",
};

const NAV: NavItem[] = [
  { key: "home", icon: "🏠", label: "홈" },
  { key: "play", icon: "🧩", label: "놀이" },
  { key: "collect", icon: "⭐", label: "모으기" },
  { key: "me", icon: "🐱", label: "나" },
];

const STATS: Stat[] = [
  { icon: "⭐", value: "23", label: "모은 별" },
  { icon: "🧩", value: "13", label: "한 놀이" },
  { icon: "🔥", value: "4일", label: "매일 놀이" },
];

const MENUS: Menu[] = [
  { icon: "🎨", label: "내 캐릭터 꾸미기" },
  { icon: "🌱", label: "나의 놀이 기록" },
  { icon: "⚙️", label: "설정" },
];

export default function Profile() {
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
        <main style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 28, alignItems: "start" }}>
          {/* 프로필 카드 */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              padding: "44px 28px",
              borderRadius: 24,
              background: "#fdf7e8",
              border: "2px solid #f3dca0",
            }}
          >
            <div style={{ fontSize: 84, lineHeight: 1 }}>🐱</div>
            <div style={{ fontSize: 30, fontWeight: 800, color: "#334155", letterSpacing: "-0.5px" }}>토리</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#94a3b8" }}>7세 · 별님반</div>
          </div>

          {/* 통계 + 메뉴 */}
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 22 }}>
              {STATS.map((s) => (
                <div
                  key={s.label}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4,
                    padding: 22,
                    borderRadius: 18,
                    background: "#fff",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 24, lineHeight: 1 }}>{s.icon}</span>
                    <span style={{ fontSize: 26, fontWeight: 800, color: "#334155" }}>{s.value}</span>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#94a3b8" }}>{s.label}</span>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {MENUS.map((m) => (
                <button
                  key={m.label}
                  onClick={() => {
                    const path = MENU_PATH[m.label];
                    if (path) navigate(path);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    width: "100%",
                    textAlign: "left",
                    fontFamily: "inherit",
                    fontSize: 18,
                    fontWeight: 800,
                    color: "#334155",
                    cursor: "pointer",
                    padding: "22px 26px",
                    borderRadius: 18,
                    background: "#fff",
                    border: "none",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                  }}
                >
                  <span style={{ fontSize: 20, lineHeight: 1 }}>{m.icon}</span>
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}