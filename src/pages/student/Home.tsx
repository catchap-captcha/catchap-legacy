import { useNavigate } from 'react-router-dom'
import logo from '../../assets/images/logo.png'

interface NavItem {
  icon: string;
  label: string;
  active: boolean;
}

const NAV_PATH: Record<string, string> = {
  "홈": "/student/home",
  "놀이": "/student/pick-play",
  "모으기": "/student/stickers",
  "나": "/student/profile",
};

const NAV: NavItem[] = [
  { icon: "🏠", label: "홈", active: true },
  { icon: "🧩", label: "놀이", active: false },
  { icon: "⭐", label: "모으기", active: false },
  { icon: "🐱", label: "나", active: false },
];

const TAGS = ["⏱ 3분", "📊 쉬움", "⭐ 별 2개 지급"];
const PROBLEM_TAGS = ["예상 시간 5분", "난이도 보통"];

export default function StudentHome() {
  const navigate = useNavigate();
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
      {/* HEADER */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 36px",
          background:
            "linear-gradient(to right, #5f9e87, #9ec3b4)",
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

      {/* BODY: 3열 */}
      <div
        style={{
          width: "100%",
          boxSizing: "border-box",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "200px 1fr 380px",
          alignItems: "start",
          gap: 28,
          padding: "28px 36px 48px",
        }}
      >
        {/* 좌측 사이드바 */}
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
          {NAV.map((it) => (
            <div
              key={it.label}
              onClick={() => navigate(NAV_PATH[it.label])}
              style={{
                display: "flex",
                cursor: "pointer",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                borderRadius: 16,
                padding: "18px 8px",
                background: it.active ? "#e3f3ea" : "transparent",
                color: it.active ? "#3d9d70" : "#64748b",
              }}
            >
              <span style={{ fontSize: 28 }}>{it.icon}</span>
              <span style={{ fontSize: 14, fontWeight: 700 }}>{it.label}</span>
            </div>
          ))}
        </aside>

        {/* 중앙 메인 */}
        <main style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {/* 인사 카드 */}
          <div
            style={{
              borderRadius: 18,
              background: "#fff",
              padding: "24px 28px",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
              textAlign: "left",
            }}
          >
            <h1 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 800, color: "#334155" }}>
              별님반 토리야, 오늘도 반가워!
            </h1>
            <p style={{ margin: 0, fontSize: 14, color: "#94a3b8" }}>
              오늘도 즐겁게 놀면서 실력을 키워보자!
            </p>
          </div>

          {/* 추천 놀이 배너 */}
          <div
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              minHeight: 360,
              overflow: "hidden",
              borderRadius: 22,
              background: "linear-gradient(135deg, #6f8fd6, #7d7fcf, #8aa0db)",
              padding: "36px 40px",
              textAlign: "left",
            }}
          >
            <div
              style={{
                position: "absolute",
                right: -40,
                top: -40,
                transform: "rotate(-12deg)",
                fontSize: 240,
                opacity: 0.1,
                pointerEvents: "none",
              }}
            >
              🐟
            </div>

            <span
              style={{
                position: "relative",
                alignSelf: "flex-start",
                borderRadius: 999,
                background: "#4caf82",
                padding: "6px 14px",
                fontSize: 13,
                fontWeight: 800,
                color: "#fff",
              }}
            >
              오늘의 추천 놀이
            </span>
            <h2
              style={{
                position: "relative",
                margin: "18px 0 10px",
                fontSize: 46,
                fontWeight: 800,
                letterSpacing: "-1px",
                color: "#fff",
              }}
            >
              생선 세기 놀이
            </h2>
            <p style={{ position: "relative", margin: "0 0 18px", fontSize: 16, color: "#eef2ff" }}>
              그림을 보고 물고기를 세어 보자!
            </p>
            <div style={{ position: "relative", display: "flex", gap: 10 }}>
              {TAGS.map((t) => (
                <span
                  key={t}
                  style={{
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.9)",
                    padding: "8px 14px",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#64748b",
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
            <div
              style={{
                position: "relative",
                marginTop: 18,
                display: "flex",
                flex: 1,
                alignItems: "flex-end",
                justifyContent: "center",
              }}
            >
              <button
                onClick={() => navigate('/student/play-start')}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  borderRadius: 16,
                  border: "none",
                  background: "linear-gradient(135deg, #74c79b, #5fae84)",
                  padding: "18px 40px",
                  fontSize: 20,
                  fontWeight: 800,
                  color: "#fff",
                  cursor: "pointer",
                  boxShadow: "0 10px 25px rgba(16,80,50,0.3)",
                  fontFamily: "inherit",
                }}
              >
                놀이 시작하기 <span style={{ fontSize: 16 }}>▶</span>
              </button>
            </div>
          </div>

          {/* AI 추천 문제 */}
          <div
            style={{
              borderRadius: 18,
              background: "#fff",
              padding: "24px 28px",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
              textAlign: "left",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
              <h3 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: "#334155" }}>
                토리를 위한 추천 문제
              </h3>
              <span
                style={{
                  borderRadius: 999,
                  background: "#7c3aed",
                  padding: "4px 12px",
                  fontSize: 12,
                  fontWeight: 800,
                  color: "#fff",
                }}
              >
                AI
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <div
                style={{
                  display: "flex",
                  flexShrink: 0,
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 18,
                  width: 108,
                  height: 74,
                  borderRadius: 14,
                  background: "#cfe5fb",
                  fontSize: 26,
                  fontWeight: 800,
                  color: "#2f6fb0",
                }}
              >
                <span>3</span>
                <span>7</span>
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 800, color: "#334155" }}>
                  수 세기 연습 문제
                </h4>
                <p style={{ margin: "0 0 10px", fontSize: 14, color: "#94a3b8" }}>
                  6~10까지의 수를 정확히 세는 연습을 해봐요.
                </p>
                <div style={{ display: "flex", gap: 8 }}>
                  {PROBLEM_TAGS.map((t) => (
                    <span
                      key={t}
                      style={{
                        borderRadius: 999,
                        background: "#f1ecfd",
                        padding: "5px 12px",
                        fontSize: 12,
                        fontWeight: 700,
                        color: "#7c3aed",
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => navigate('/student/recommend')}
                style={{
                  flexShrink: 0,
                  borderRadius: 12,
                  border: "none",
                  background: "#7c3aed",
                  padding: "14px 22px",
                  fontSize: 14,
                  fontWeight: 800,
                  color: "#fff",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                추천 문제 풀기 ▶
              </button>
            </div>
          </div>

          {/* 지난 기록 */}
          <div style={{ marginTop: 6, display: "flex", justifyContent: "center" }}>
            <button
              onClick={() => navigate('/student/history')}
              style={{
                marginLeft: 200,
                borderRadius: 999,
                border: "none",
                background: "#fff",
                padding: "11px 22px",
                fontSize: 14,
                fontWeight: 700,
                color: "#94a3b8",
                cursor: "pointer",
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                fontFamily: "inherit",
              }}
            >
              ⟳ 지난 기록 보기
            </button>
          </div>
        </main>

        {/* 우측 사이드 패널 */}
        <aside style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* 오늘 목표 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              borderRadius: 18,
              background: "#fbf3df",
              padding: "20px 24px",
              textAlign: "left",
            }}
          >
            <span style={{ whiteSpace: "nowrap", fontSize: 14, fontWeight: 800, color: "#b07e2e" }}>
              오늘 목표
            </span>
            <span style={{ fontSize: 20, letterSpacing: "0.2em", color: "#e0c074" }}>☆☆</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#9b7b3e" }}>
              별 2개 더 모으면 스티커 선물!
            </span>
          </div>

          {/* 놀이 고르기 */}
          <div
            style={{
              borderRadius: 18,
              background: "#fff",
              padding: "22px 24px",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
              textAlign: "left",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div
                style={{
                  flexShrink: 0,
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: "#d8ede2",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                }}
              >
                🧩
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: "0 0 4px", fontSize: 17, fontWeight: 800, color: "#334155" }}>
                  놀이 고르기
                </h4>
                <p style={{ margin: 0, fontSize: 13, color: "#94a3b8" }}>
                  새로운 놀이를 선택해보자!
                </p>
              </div>
              <button
                onClick={() => navigate('/student/pick-play')}
                style={{
                  flexShrink: 0,
                  width: 42,
                  height: 42,
                  borderRadius: 999,
                  border: "none",
                  background: "#4caf82",
                  fontSize: 18,
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                ›
              </button>
            </div>
            <span
              style={{
                marginTop: 14,
                display: "inline-block",
                borderRadius: 999,
                background: "#e8f5ee",
                padding: "6px 14px",
                fontSize: 12,
                fontWeight: 700,
                color: "#3d9d70",
              }}
            >
              오늘 새로 나온 놀이 2개
            </span>
          </div>

          {/* 내 스티커 */}
          <div
            style={{
              borderRadius: 18,
              background: "#fff",
              padding: "22px 24px",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
              textAlign: "left",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div
                style={{
                  flexShrink: 0,
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: "#ece4fb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                }}
              >
                ⭐
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: "0 0 4px", fontSize: 17, fontWeight: 800, color: "#334155" }}>
                  내 스티커
                </h4>
                <p style={{ margin: 0, fontSize: 13, color: "#94a3b8" }}>
                  모은 스티커를 확인해보자!
                </p>
              </div>
              <button
                onClick={() => navigate('/student/stickers')}
                style={{
                  flexShrink: 0,
                  width: 42,
                  height: 42,
                  borderRadius: 999,
                  border: "none",
                  background: "#7c3aed",
                  fontSize: 18,
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                ›
              </button>
            </div>
            <span
              style={{
                marginTop: 14,
                display: "inline-block",
                borderRadius: 999,
                background: "#f1ecfd",
                padding: "6px 14px",
                fontSize: 12,
                fontWeight: 700,
                color: "#7c3aed",
              }}
            >
              보유 스티커 15개
            </span>
          </div>

          {/* 오늘 모은 별 */}
          <div
            style={{
              borderRadius: 18,
              background: "#fff",
              padding: 24,
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
              textAlign: "left",
            }}
          >
            <h4 style={{ margin: "0 0 18px", fontSize: 17, fontWeight: 800, color: "#334155" }}>
              오늘 모은 별
            </h4>
            <div
              style={{
                marginBottom: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span style={{ fontSize: 26, letterSpacing: "0.2em" }}>
                ⭐⭐⭐<span style={{ color: "#e2e8f0" }}>☆☆</span>
              </span>
              <span style={{ fontSize: 30, fontWeight: 800, color: "#334155" }}>3 / 5</span>
            </div>
            <div
              style={{
                marginBottom: 16,
                height: 12,
                overflow: "hidden",
                borderRadius: 999,
                background: "#eef0ee",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: "60%",
                  borderRadius: 999,
                  background: "linear-gradient(to right, #f5c451, #f0a93a)",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 8,
                borderRadius: 12,
                background: "#fbf3df",
                padding: "12px 14px",
              }}
            >
              <span style={{ fontSize: 13 }}>🔴</span>
              <span style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.6, color: "#9b7b3e" }}>
                오늘 별 2개 더 모으면 새 스티커를 받을 수 있어요!
              </span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}