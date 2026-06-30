import { useNavigate } from 'react-router-dom'
import logo from '../../assets/images/logo.png'

type NavKey = "home" | "play" | "collect" | "me";
type StageStatus = "done" | "current" | "locked";

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

interface Subject {
  icon: string;
  title: string;
  desc: string;
}

interface Stage {
  name: string;
  icon: string;
  status: StageStatus;
  stars?: number;
}

const NAV: NavItem[] = [
  { key: "home", icon: "🏠", label: "홈" },
  { key: "play", icon: "🧩", label: "놀이" },
  { key: "collect", icon: "⭐", label: "모으기" },
  { key: "me", icon: "🐱", label: "나" },
];

const SUBJECT: Subject = {
  icon: "🔢",
  title: "수 세기 놀이",
  desc: "그림을 세어 보아요",
};

const STAGES: Stage[] = [
  { name: "생선 세기", icon: "🐟", status: "done", stars: 3 },
  { name: "사과 세기", icon: "🍎", status: "current" },
  { name: "풍선 세기", icon: "🎈", status: "locked" },
  { name: "과자 세기", icon: "🍪", status: "locked" },
];

function stageCardStyle(status: StageStatus): React.CSSProperties {
  const base: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    minHeight: 172,
    cursor: status === "locked" ? "default" : "pointer",
    fontFamily: "inherit",
    borderRadius: 24,
    padding: "26px 18px",
    background: "#fff",
    border: "2px solid transparent",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
    transition: "transform 0.12s",
  };
  if (status === "current") {
    return {
      ...base,
      border: "2px solid #74c79b",
      background: "#f1f8f4",
      boxShadow: "0 8px 22px rgba(60,120,95,0.14)",
    };
  }
  if (status === "locked") {
    return { ...base, opacity: 0.9 };
  }
  return base;
}

function statusTextStyle(status: StageStatus): React.CSSProperties {
  if (status === "current") return { fontSize: 15, fontWeight: 800, color: "#3d9d70" };
  if (status === "locked") return { fontSize: 14, fontWeight: 700, color: "#94a3b8" };
  return { fontSize: 16, letterSpacing: 2, color: "#f5b301" };
}

function statusLabel(stage: Stage): string {
  if (stage.status === "current") return "놀기 ▶";
  if (stage.status === "locked") return "🔒 다음에";
  return "⭐".repeat(stage.stars ?? 0);
}

export default function PlayRoom() {
  const navigate = useNavigate();
  const active: NavKey = "play";

  const handleBack = () => {
    navigate('/student/pick-play');
  };

  const handleSpeak = () => {
    // TODO: 과목 안내 음성 재생
  };

  const handleStageClick = (stage: Stage) => {
    if (stage.status === "locked") return;
    console.log("단계 시작:", stage.name);
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
            <span style={{ fontSize: 28, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>
              캣챱
            </span>
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

          {/* 과목 배너 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderRadius: 24,
              background: "linear-gradient(135deg, #5f9e87, #82b29c)",
              padding: "26px 30px",
              boxShadow: "0 8px 22px rgba(60,120,95,0.18)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <div
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: 16,
                  background: "rgba(255,255,255,0.55)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 30,
                }}
              >
                {SUBJECT.icon}
              </div>
              <div>
                <h1 style={{ margin: "0 0 4px", fontSize: 26, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>
                  {SUBJECT.title}
                </h1>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>
                  {SUBJECT.desc}
                </p>
              </div>
            </div>
            <button
              onClick={handleSpeak}
              style={{
                width: 44,
                height: 44,
                borderRadius: 999,
                border: "none",
                background: "rgba(255,255,255,0.85)",
                fontSize: 20,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
              }}
            >
              🔊
            </button>
          </div>

          {/* 단계 카드 */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 22 }}>
            {STAGES.map((stage) => (
              <button
                key={stage.name}
                onClick={() => handleStageClick(stage)}
                style={stageCardStyle(stage.status)}
              >
                <span style={{ fontSize: 40, lineHeight: 1 }}>{stage.icon}</span>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#334155", letterSpacing: "-0.3px" }}>
                  {stage.name}
                </div>
                <div style={statusTextStyle(stage.status)}>{statusLabel(stage)}</div>
              </button>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}