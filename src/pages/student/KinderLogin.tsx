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

interface NavItem {
  key: NavKey;
  icon: string;
  label: string;
}

interface ClassItem {
  id: string;
  icon: string;
  label: string;
}

interface PicItem {
  id: string;
  icon: string;
}

const NAV: NavItem[] = [
  { key: "home", icon: "🏠", label: "홈" },
  { key: "play", icon: "🧩", label: "놀이" },
  { key: "collect", icon: "⭐", label: "모으기" },
  { key: "me", icon: "🐱", label: "나" },
];

const CLASSES: ClassItem[] = [
  { id: "byeol", icon: "🌟", label: "별님반" },
  { id: "haet", icon: "🌈", label: "햇님반" },
  { id: "dal", icon: "🌙", label: "달님반" },
];

const PICS: PicItem[] = [
  { id: "fish", icon: "🐟" },
  { id: "apple", icon: "🍎" },
  { id: "star", icon: "⭐" },
  { id: "car", icon: "🚗" },
];

const selectedRing: React.CSSProperties = {
  position: "absolute",
  inset: -2.5,
  borderRadius: 16,
  border: "2.5px solid #5f9e87",
  background: "#eef6f1",
  pointerEvents: "none",
};

export default function LoginScreen() {
  const navigate = useNavigate();
  const [active] = useState<NavKey>("me");
  const [selectedClass, setSelectedClass] = useState("byeol");
  const [picks, setPicks] = useState<string[]>(["fish"]);

  const togglePick = (id: string) =>
    setPicks((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const handleEnter = () => {
    console.log("입장:", selectedClass, picks);
    // TODO: 반 + 그림 암호 검증 후 입장
    navigate('/student/home');
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
        <main style={{ display: "flex", justifyContent: "center", paddingTop: 28 }}>
          <div
            style={{
              width: "100%",
              maxWidth: 820,
              background: "#fff",
              borderRadius: 28,
              padding: "44px 56px 40px",
              boxShadow: "0 12px 32px rgba(40,60,55,0.10)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 14,
            }}
          >
            <div style={{ fontSize: 56, lineHeight: 1 }}>🐱</div>
            <h1 style={{ margin: "0 0 18px", fontSize: 34, fontWeight: 800, color: "#1f3a5f", letterSpacing: "-0.5px" }}>
              안녕! 누구야?
            </h1>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 44, width: "100%" }}>
              {/* 반 고르기 */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ fontSize: 17, fontWeight: 800, color: "#334155" }}>① 우리 반 고르기</div>
                {CLASSES.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedClass(c.id)}
                    style={{
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      width: "100%",
                      padding: 16,
                      fontFamily: "inherit",
                      fontSize: 17,
                      fontWeight: 800,
                      color: "#334155",
                      cursor: "pointer",
                      borderRadius: 16,
                      background: "#fff",
                      border: "2.5px solid #eef0ee",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                    }}
                  >
                    {selectedClass === c.id && <span style={selectedRing} />}
                    <span style={{ position: "relative", zIndex: 1 }}>
                      {c.icon} {c.label}
                    </span>
                  </button>
                ))}
              </div>

              {/* 그림 암호 */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ fontSize: 17, fontWeight: 800, color: "#334155" }}>② 내 그림 암호 누르기</div>
                <div style={{ display: "flex", gap: 12 }}>
                  {PICS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => togglePick(p.id)}
                      style={{
                        position: "relative",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 74,
                        height: 74,
                        cursor: "pointer",
                        fontFamily: "inherit",
                        borderRadius: 16,
                        background: "#fff",
                        border: "2.5px solid #eef0ee",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                      }}
                    >
                      {picks.includes(p.id) && <span style={selectedRing} />}
                      <span style={{ position: "relative", zIndex: 1, fontSize: 30, lineHeight: 1 }}>{p.icon}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleEnter}
              style={{
                marginTop: 30,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "inherit",
                fontSize: 22,
                fontWeight: 800,
                color: "#fff",
                border: "none",
                cursor: "pointer",
                padding: "18px 72px",
                borderRadius: 16,
                background: "linear-gradient(135deg, #9ccc4f, #7cb342)",
                boxShadow: "0 5px 0 #5f9433, 0 8px 18px rgba(124,179,66,0.35)",
              }}
            >
              들어가기
            </button>

            <p style={{ margin: "16px 0 0", fontSize: 14, fontWeight: 600, color: "#94a3b8" }}>
              비밀번호 대신 그림으로 들어가요. 어려우면 선생님이 도와줘요.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}