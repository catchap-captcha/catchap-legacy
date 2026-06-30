import { useState } from "react";
import { useNavigate } from 'react-router-dom'

const TARGET = 2;
const TOTAL_FISH = 4;
const TOTAL_STEPS = 5;

export default function FeedCatGame() {
  const navigate = useNavigate();
  const [givenIds, setGivenIds] = useState<number[]>([]);
  const [step] = useState(1); // 현재 문제 인덱스 (0부터)

  const allIds = Array.from({ length: TOTAL_FISH }, (_, i) => i);
  const basketIds = allIds.filter((id) => !givenIds.includes(id));

  const give = (id: number) =>
    setGivenIds((prev) => (prev.includes(id) ? prev : [...prev, id]));

  const takeBack = (id: number) =>
    setGivenIds((prev) => prev.filter((x) => x !== id));

  const handleDragStart = (e: React.DragEvent, id: number) => {
    e.dataTransfer.setData("text/plain", String(id));
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const id = parseInt(e.dataTransfer.getData("text/plain"), 10);
    if (!Number.isNaN(id)) give(id);
  };

  const handleSubmit = () => {
    const correct = givenIds.length === TARGET;
    console.log(correct ? "정답!" : `다시 세어보자: ${givenIds.length}마리`);
    navigate('/student/result');
  };

  const handleClose = () => {
    navigate('/student/home');
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        background: "#fff",
        fontFamily:
          "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif",
        color: "#334155",
        WebkitFontSmoothing: "antialiased",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* HEADER */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 24px",
          borderBottom: "1px solid #eef0ee",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1 }}>
          <button
            onClick={handleClose}
            style={{
              width: 38,
              height: 38,
              borderRadius: 999,
              border: "none",
              background: "#eef0ee",
              color: "#64748b",
              fontSize: 18,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>
          <span style={{ fontSize: 18, fontWeight: 800, color: "#334155" }}>수 세기</span>
        </div>

        {/* 진행 점 */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => {
            const active = i === step;
            return (
              <div
                key={i}
                style={{
                  width: active ? 26 : 10,
                  height: 10,
                  borderRadius: 999,
                  background: active ? "#5f9e87" : "#d6dcd8",
                  transition: "all 0.2s",
                }}
              />
            );
          })}
        </div>

        <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 999,
              background: "linear-gradient(135deg, #f0b84a, #e6a82f)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
            }}
          >
            🐱
          </div>
        </div>
      </header>

      {/* GAME */}
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 44,
          padding: 40,
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: 36,
            fontWeight: 800,
            color: "#334155",
            letterSpacing: "-1px",
            textAlign: "center",
          }}
        >
          고양이에게 생선 <span style={{ color: "#e09a4f" }}>{TARGET}마리</span>를 주자
        </h1>

        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {/* 생선 바구니 */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 14,
              minWidth: 290,
              padding: "22px 26px",
              border: "2.5px dashed #b7cfc4",
              borderRadius: 20,
              background: "#f7faf8",
            }}
          >
            <span style={{ fontSize: 15, fontWeight: 700, color: "#64748b" }}>생선 바구니</span>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexWrap: "wrap",
                gap: 14,
                minHeight: 44,
              }}
            >
              {basketIds.map((id) => (
                <span
                  key={id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, id)}
                  onClick={() => give(id)}
                  style={{ fontSize: 34, lineHeight: 1, cursor: "grab", userSelect: "none" }}
                >
                  🐟
                </span>
              ))}
            </div>
          </div>

          {/* 화살표 */}
          <div style={{ fontSize: 34, lineHeight: 1 }}>➡️</div>

          {/* 고양이 (놓는 곳) */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                width: 130,
                minHeight: 100,
                padding: 14,
                border: "2.5px dashed #c9b07a",
                borderRadius: 18,
                background: "#fdfaf2",
              }}
            >
              <span style={{ fontSize: 40, lineHeight: 1 }}>🐱</span>
              {givenIds.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                  }}
                >
                  {givenIds.map((id) => (
                    <span
                      key={id}
                      onClick={() => takeBack(id)}
                      style={{ fontSize: 24, lineHeight: 1, cursor: "pointer" }}
                    >
                      🐟
                    </span>
                  ))}
                </div>
              )}
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8" }}>여기에 놓아요</span>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          style={{
            fontFamily: "inherit",
            fontSize: 22,
            fontWeight: 800,
            color: "#fff",
            border: "none",
            cursor: "pointer",
            padding: "18px 56px",
            borderRadius: 16,
            background: "linear-gradient(135deg, #9ccc4f, #7cb342)",
            boxShadow: "0 5px 0 #5f9433, 0 8px 18px rgba(124,179,66,0.35)",
          }}
        >
          다 줬어요!
        </button>
      </main>
    </div>
  );
}