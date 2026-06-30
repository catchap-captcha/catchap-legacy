import { useNavigate } from 'react-router-dom'
import logo from '../../assets/images/logo.png'

type NavKey = "home" | "play" | "collect" | "me";
type NodeStatus = "done" | "current" | "locked";

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

interface PathNode {
  num: string;
  status: NodeStatus;
}

const NAV: NavItem[] = [
  { key: "home", icon: "🏠", label: "홈" },
  { key: "play", icon: "🧩", label: "놀이" },
  { key: "collect", icon: "⭐", label: "모으기" },
  { key: "me", icon: "🐱", label: "나" },
];

const NODES: PathNode[] = [
  { num: "1", status: "done" },
  { num: "2", status: "done" },
  { num: "3", status: "current" },
  { num: "4", status: "locked" },
  { num: "5", status: "locked" },
];

function circleStyle(status: NodeStatus): React.CSSProperties {
  const base: React.CSSProperties = {
    width: 88,
    height: 88,
    borderRadius: 999,
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    transition: "transform 0.12s",
  };
  if (status === "done") {
    return { ...base, background: "#5f9e87", cursor: "pointer", boxShadow: "0 4px 10px rgba(60,120,95,0.25)" };
  }
  if (status === "current") {
    return {
      ...base,
      background: "#e09a4f",
      cursor: "pointer",
      boxShadow: "0 0 0 10px rgba(224,154,79,0.22), 0 6px 14px rgba(200,130,50,0.3)",
    };
  }
  return { ...base, background: "#c5cdc9", cursor: "default" };
}

export default function FishCountPath() {
  const navigate = useNavigate();
  const active: NavKey = "play";

  const handleBack = () => {
    navigate('/student/subject');
  };

  const handleNodeClick = (node: PathNode) => {
    if (node.status === "locked") return;
    console.log("단계 시작:", node.num);
    navigate('/student/play-start');
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
        <main style={{ display: "flex", flexDirection: "column", gap: 26 }}>
          {/* 뒤로 */}
          <div>
            <button
              onClick={handleBack}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontFamily: "inherit",
                fontSize: 14,
                fontWeight: 700,
                color: "#64748b",
                background: "#fff",
                border: "none",
                padding: "10px 18px",
                borderRadius: 999,
                cursor: "pointer",
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
              }}
            >
              ← 뒤로
            </button>
          </div>

          {/* 제목 */}
          <h1 style={{ margin: 0, fontSize: 30, fontWeight: 800, color: "#1f3a5f", letterSpacing: "-0.5px" }}>
            생선 세기 길 🐟
          </h1>

          {/* 진행 경로 */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "56px 0" }}>
            {NODES.map((node, i) => {
              const isLocked = node.status === "locked";
              const connectorActive = node.status === "done" || node.status === "current";
              return (
                <div key={node.num} style={{ display: "flex", alignItems: "center" }}>
                  {i > 0 && (
                    <div
                      style={{
                        width: 72,
                        height: 5,
                        borderRadius: 999,
                        background: connectorActive ? "#7fb39b" : "#dde2de",
                      }}
                    />
                  )}
                  <div onClick={() => handleNodeClick(node)} style={circleStyle(node.status)}>
                    {isLocked ? (
                      <span style={{ fontSize: 26, lineHeight: 1 }}>🔒</span>
                    ) : (
                      <>
                        <span style={{ fontSize: 28, fontWeight: 800, color: "#fff", lineHeight: 1 }}>
                          {node.num}
                        </span>
                        {node.status === "current" ? (
                          <span style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>여기!</span>
                        ) : (
                          <span style={{ fontSize: 12, lineHeight: 1 }}>⭐</span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}