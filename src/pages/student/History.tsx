import { useNavigate } from 'react-router-dom'
import logo from '../../assets/images/logo.png'

type NavKey = "home" | "play" | "collect" | "me";

interface NavItem { key: NavKey; icon: string; label: string; }
interface Day { label: string; done: boolean; }

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

const DAYS: Day[] = [
  { label: "월", done: true },
  { label: "화", done: true },
  { label: "수", done: false },
  { label: "목", done: true },
  { label: "금", done: true },
];

export default function PlayHistory() {
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
        <main style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <button
            onClick={() => navigate('/student/profile')}
            style={{
              alignSelf: "flex-start",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontFamily: "inherit",
              fontSize: 15,
              fontWeight: 700,
              color: "#64748b",
              cursor: "pointer",
              border: "none",
              background: "#e7eae7",
              padding: "10px 18px",
              borderRadius: 999,
            }}
          >
            ← 뒤로
          </button>

          <h1 style={{ margin: "0 0 6px", fontSize: 38, fontWeight: 800, color: "#1f3a5f", letterSpacing: "-1px" }}>
            이만큼 놀았어요 🌱
          </h1>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 26, alignItems: "stretch" }}>
            {/* 주간 출석 */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
                padding: 26,
                borderRadius: 20,
                background: "#fff",
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
              }}
            >
              <div style={{ fontSize: 17, fontWeight: 800, color: "#334155" }}>이번 주 놀이</div>
              <div style={{ display: "flex", gap: 10 }}>
                {DAYS.map((d) => (
                  <div
                    key={d.label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 56,
                      height: 56,
                      borderRadius: 14,
                      fontSize: 17,
                      fontWeight: 800,
                      background: d.done ? "#5f9e87" : "#eef0ee",
                      color: d.done ? "#fff" : "#b6bdb8",
                    }}
                  >
                    {d.label}
                  </div>
                ))}
              </div>
            </div>

            {/* 잘한 과목 — 강조 */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                padding: 30,
                borderRadius: 20,
                background: "#f1f8ec",
                border: "2px solid #c3e3a8",
              }}
            >
              <div style={{ fontSize: 38, lineHeight: 1 }}>🔢</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#1f3a5f" }}>수 세기</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#6d9e55" }}>아주 잘했어요 👍</div>
            </div>

            {/* 더 할 과목 */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                padding: 30,
                borderRadius: 20,
                background: "#fff",
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
              }}
            >
              <div style={{ fontSize: 38, lineHeight: 1 }}>🗣️</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#1f3a5f" }}>한글 소리</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#94a3b8" }}>같이 더 해봐요</div>
            </div>
          </div>

          <p style={{ margin: "4px 0 0", alignSelf: "center", fontSize: 15, fontWeight: 600, color: "#94a3b8" }}>
            자세한 기록은 부모님 화면에서 볼 수 있어요
          </p>
        </main>
      </div>
    </div>
  );
}