import { useNavigate } from 'react-router-dom'
import logo from '../../assets/images/logo.png'

type NavKey = "home" | "play" | "collect" | "me";

const NAV_PATH: Record<NavKey, string> = {
  home: "/student/home",
  play: "/student/pick-play",
  collect: "/student/stickers",
  me: "/student/profile",
};

const CARD_PATH: Record<string, string> = {
  "수 세기": "/student/subject",
  "모양·색": "/student/quiz-shape-color",
  "한글 소리": "/student/quiz-hangul",
  "안전 놀이": "/student/quiz-safety",
};

interface NavItem {
  key: NavKey;
  icon: string;
  label: string;
}

interface CardDef {
  title: string;
  desc: string;
  icon: string;
  bg: string;
}

const NAV: NavItem[] = [
  { key: "home", icon: "🏠", label: "홈" },
  { key: "play", icon: "🧩", label: "놀이" },
  { key: "collect", icon: "⭐", label: "모으기" },
  { key: "me", icon: "🐱", label: "나" },
];

const CARDS: CardDef[] = [
  { title: "수 세기", desc: "그림을 세어요", icon: "🔢", bg: "linear-gradient(155deg, #6fb499, #4f9277)" },
  { title: "모양·색", desc: "같은 걸 찾아요", icon: "🔺", bg: "linear-gradient(155deg, #f0b878, #e09a4f)" },
  { title: "한글 소리", desc: "소리를 들어요", icon: "🗣️", bg: "linear-gradient(155deg, #9aa6e0, #7a86cf)" },
  { title: "안전 놀이", desc: "안전을 배워요", icon: "🚦", bg: "linear-gradient(155deg, #e09aae, #cf7a91)" },
];

export default function PlaySelect() {
  const navigate = useNavigate();
  // 활성 메뉴: 이 페이지는 "놀이"
  const active: NavKey = "play";

  const handleSpeak = () => {
    // TODO: 음성 안내 재생
  };

  const handleCardClick = (card: CardDef) => {
    console.log("놀이 시작:", card.title);
    navigate(CARD_PATH[card.title]);
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
          <img
            src={logo}
            alt="캣챱 로고"
            style={{ width: 38, height: 38, display: "block" }}
          />
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span style={{ fontSize: 28, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>
              캣챱
            </span>
            <span style={{ fontSize: 15, fontWeight: 600, color: "#ecfdf5" }}>
              Catchap
            </span>
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

      {/* BODY: 사이드바 + 메인 */}
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
        {/* 좌측 사이드바 — 학생 홈과 동일 */}
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

        {/* 중앙 메인 */}
        <main style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {/* 제목 + 들려줘 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <h1
              style={{
                margin: 0,
                fontSize: 30,
                fontWeight: 800,
                color: "#1f3a5f",
                letterSpacing: "-0.5px",
              }}
            >
              무슨 놀이 할까?
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

          {/* 4개 놀이 카드 */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 22,
            }}
          >
            {CARDS.map((card) => (
              <button
                key={card.title}
                onClick={() => handleCardClick(card)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 16,
                  aspectRatio: "1 / 1",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  borderRadius: 28,
                  padding: 20,
                  background: card.bg,
                  boxShadow: "0 8px 22px rgba(0,0,0,0.10)",
                  transition: "transform 0.12s",
                }}
              >
                <div
                  style={{
                    width: 84,
                    height: 84,
                    borderRadius: 22,
                    background: "rgba(255,255,255,0.55)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 44,
                    boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
                  }}
                >
                  {card.icon}
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: "#fff", letterSpacing: "-0.3px" }}>
                  {card.title}
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>
                  {card.desc}
                </div>
              </button>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}