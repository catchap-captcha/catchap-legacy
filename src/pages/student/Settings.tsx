import { useState } from "react";
import { useNavigate } from 'react-router-dom'
import logo from '../../assets/images/logo.png'

type NavKey = "home" | "play" | "collect" | "me";

const NAV_PATH: Record<NavKey, string> = {
  home: "/student/home",
  play: "/student/pick-play",
  collect: "/student/stickers",
  me: "/student/profile",
};

interface NavItem { key: NavKey; icon: string; label: string; }
interface ToggleDef { id: string; icon: string; label: string; }

const NAV: NavItem[] = [
  { key: "home", icon: "🏠", label: "홈" },
  { key: "play", icon: "🧩", label: "놀이" },
  { key: "collect", icon: "⭐", label: "모으기" },
  { key: "me", icon: "🐱", label: "나" },
];

const TOGGLES: ToggleDef[] = [
  { id: "read", icon: "🔊", label: "문제 읽어주기" },
  { id: "sound", icon: "🎵", label: "소리·효과음" },
  { id: "slow", icon: "🐢", label: "천천히 하기" },
  { id: "pattern", icon: "🎨", label: "색+무늬 같이 보기" },
];

export default function Settings() {
  const navigate = useNavigate();
  const active: NavKey = "me";
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    read: true,
    sound: true,
    slow: true,
    pattern: true,
  });

  const flip = (id: string) =>
    setToggles((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleSave = () => {
    console.log("설정 저장:", toggles);
    // TODO: 설정 저장
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

          <h1 style={{ margin: 0, fontSize: 38, fontWeight: 800, color: "#1f3a5f", letterSpacing: "-1px" }}>
            설정 ⚙️
          </h1>
          <p style={{ margin: "-4px 0 8px", fontSize: 16, fontWeight: 600, color: "#94a3b8" }}>
            어른과 함께 정해요
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22, maxWidth: 1180 }}>
            {TOGGLES.map((t) => {
              const on = toggles[t.id];
              return (
                <button
                  key={t.id}
                  onClick={() => flip(t.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 16,
                    width: "100%",
                    textAlign: "left",
                    fontFamily: "inherit",
                    cursor: "pointer",
                    border: "none",
                    padding: "24px 28px",
                    borderRadius: 18,
                    background: "#fff",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                  }}
                >
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      fontSize: 19,
                      fontWeight: 800,
                      color: "#334155",
                    }}
                  >
                    <span style={{ fontSize: 24, lineHeight: 1 }}>{t.icon}</span>
                    {t.label}
                  </span>
                  <span
                    style={{
                      position: "relative",
                      display: "inline-block",
                      width: 54,
                      height: 30,
                      flexShrink: 0,
                      borderRadius: 999,
                      background: on ? "#7bc043" : "#cfd6d2",
                      transition: "background 0.15s",
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        top: 3,
                        left: on ? 27 : 3,
                        width: 24,
                        height: 24,
                        borderRadius: 999,
                        background: "#fff",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                        transition: "left 0.15s",
                      }}
                    />
                  </span>
                </button>
              );
            })}
          </div>

          <button
            onClick={handleSave}
            style={{
              marginTop: 8,
              alignSelf: "flex-start",
              fontFamily: "inherit",
              fontSize: 20,
              fontWeight: 800,
              color: "#fff",
              border: "none",
              cursor: "pointer",
              padding: "16px 44px",
              borderRadius: 16,
              background: "linear-gradient(135deg, #9ccc4f, #7cb342)",
              boxShadow: "0 5px 0 #5f9433, 0 8px 18px rgba(124,179,66,0.35)",
            }}
          >
            저장
          </button>
        </main>
      </div>
    </div>
  );
}