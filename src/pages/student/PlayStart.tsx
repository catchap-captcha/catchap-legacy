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

interface GameInfo {
  icon: string;
  title: string;
  desc: string;
}

interface Chip {
  icon: string;
  label: string;
}

const NAV: NavItem[] = [
  { key: "home", icon: "🏠", label: "홈" },
  { key: "play", icon: "🧩", label: "놀이" },
  { key: "collect", icon: "⭐", label: "모으기" },
  { key: "me", icon: "🐱", label: "나" },
];

const GAME: GameInfo = {
  icon: "🐟",
  title: "생선 세기 놀이",
  desc: "생선이 몇 마리인지 같이 세어 볼까?",
};

const CHIPS: Chip[] = [
  { icon: "🎯", label: "그림 5개" },
  { icon: "⏱️", label: "천천히" },
  { icon: "⭐", label: "별 3개" },
];

export default function PlayIntro() {
  const navigate = useNavigate();
  const active: NavKey = "play";

  const handleStart = () => {
    navigate('/student/quiz-counting');
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
        <main style={{ display: "flex", justifyContent: "center", paddingTop: 56 }}>
          <div
            style={{
              width: "100%",
              maxWidth: 680,
              background: "#fff",
              borderRadius: 28,
              padding: "52px 56px",
              boxShadow: "0 12px 32px rgba(40,60,55,0.10)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 18,
            }}
          >
            <div style={{ fontSize: 60, lineHeight: 1 }}>{GAME.icon}</div>
            <h1 style={{ margin: "6px 0 0", fontSize: 32, fontWeight: 800, color: "#334155", letterSpacing: "-0.5px" }}>
              {GAME.title}
            </h1>
            <p style={{ margin: 0, fontSize: 17, fontWeight: 600, color: "#94a3b8", textAlign: "center" }}>
              {GAME.desc}
            </p>

            {/* 정보 칩 */}
            <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
              {CHIPS.map((chip) => (
                <span
                  key={chip.label}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    background: "#f1f3f1",
                    borderRadius: 999,
                    padding: "9px 16px",
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#475569",
                  }}
                >
                  <span>{chip.icon}</span>
                  {chip.label}
                </span>
              ))}
            </div>

            {/* 시작 버튼 */}
            <button
              onClick={handleStart}
              style={{
                marginTop: 22,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                fontFamily: "inherit",
                fontSize: 24,
                fontWeight: 800,
                color: "#fff",
                border: "none",
                cursor: "pointer",
                padding: "20px 64px",
                borderRadius: 18,
                background: "linear-gradient(135deg, #9ccc4f, #7cb342)",
                boxShadow: "0 5px 0 #5f9433, 0 8px 18px rgba(124,179,66,0.35)",
              }}
            >
              <span style={{ fontSize: 22 }}>🎮</span> 시작하기
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}