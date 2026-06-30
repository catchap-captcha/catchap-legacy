import { useState } from 'react';

const FONT = "'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
const NAVY = "#1e3a5f";
const ACCENT = "#4a9b8e";
const BLUE = "#2f6df6";
const GREEN = "#16a34a";
const RED = "#e5484d";
const BG = "#f4f5f7";
const CARD = "#ffffff";
const BORDER = "#e6e8ec";
const TEXT = "#1e293b";
const MUTED = "#64748b";

interface Choice {
  id: number;
  text: string;
}

const TYPES = ["수 세기", "모양·색", "한글", "안전", "드래그"] as const;
const DIFFS = ["쉬움", "보통", "어려움"] as const;

const cardStyle = {
  background: CARD,
  border: `1px solid ${BORDER}`,
  borderRadius: 14,
  padding: 20,
  boxShadow: "0 1px 3px rgba(16,24,40,0.06)",
} as const;

const labelStyle = { display: "block", fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 8 } as const;
const inputStyle = { width: "100%", padding: "9px 12px", border: `1px solid ${BORDER}`, borderRadius: 10, fontSize: 14, fontFamily: "inherit", color: TEXT, boxSizing: "border-box" } as const;

const PALETTE = ["#fde68a", "#bfdbfe", "#bbf7d0", "#fecaca"] as const;

export default function ContentEdit() {
  const [title, setTitle] = useState("사과를 세어 보아요");
  const [desc, setDesc] = useState("화면에 보이는 사과의 개수를 세어 정답을 골라요.");
  const [type, setType] = useState<(typeof TYPES)[number]>("수 세기");
  const [diff, setDiff] = useState<(typeof DIFFS)[number]>("쉬움");
  const [choices, setChoices] = useState<Choice[]>([
    { id: 1, text: "3개" },
    { id: 2, text: "4개" },
    { id: 3, text: "5개" },
  ]);
  const [correctId, setCorrectId] = useState(2);
  const [showPreview, setShowPreview] = useState(true);
  const [nextId, setNextId] = useState(4);

  function updateChoice(id: number, text: string) {
    setChoices((cs) => cs.map((c) => (c.id === id ? { ...c, text } : c)));
  }

  function addChoice() {
    setChoices((cs) => [...cs, { id: nextId, text: "" }]);
    setNextId((n) => n + 1);
  }

  function removeChoice(id: number) {
    setChoices((cs) => (cs.length <= 2 ? cs : cs.filter((c) => c.id !== id)));
    if (correctId === id) setCorrectId(choices[0].id);
  }

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: FONT, color: TEXT, padding: "28px 32px" }}>
      <style>{`
        .ce-cols { display:grid; grid-template-columns:1fr 1fr; gap:20px; align-items:start; }
        @media (max-width:880px){ .ce-cols{ grid-template-columns:1fr; } }
      `}</style>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: NAVY, letterSpacing: "-0.5px" }}>콘텐츠 편집</h1>
          <p style={{ margin: "6px 0 0", fontSize: 14, color: MUTED }}>문제와 선택지를 작성하면 오른쪽에서 미리 볼 수 있어요</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => setShowPreview((p) => !p)} style={{ background: "#fff", color: NAVY, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "10px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>👁️ 미리보기 {showPreview ? "끄기" : "켜기"}</button>
          <button style={{ background: "#fff", color: NAVY, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "10px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>취소</button>
          <button style={{ background: NAVY, color: "#fff", border: "none", borderRadius: 10, padding: "10px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>💾 저장</button>
        </div>
      </div>

      <div className="ce-cols">
        {/* LEFT: form */}
        <div style={cardStyle}>
          <h2 style={{ margin: "0 0 18px", fontSize: 16, fontWeight: 800, color: NAVY }}>문제 정보</h2>

          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>제목</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} placeholder="문제 제목을 입력하세요" />
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>설명</label>
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} style={{ ...inputStyle, resize: "vertical" }} placeholder="학생에게 보여줄 설명" />
          </div>

          <div style={{ display: "flex", gap: 14, marginBottom: 18, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 140 }}>
              <label style={labelStyle}>유형</label>
              <select value={type} onChange={(e) => setType(e.target.value as (typeof TYPES)[number])} style={inputStyle}>
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ flex: 1, minWidth: 140 }}>
              <label style={labelStyle}>난이도</label>
              <select value={diff} onChange={(e) => setDiff(e.target.value as (typeof DIFFS)[number])} style={inputStyle}>
                {DIFFS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <label style={labelStyle}>정답 / 선택지</label>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {choices.map((c) => (
              <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 10, background: correctId === c.id ? "#e7f6ee" : "#f8fafc", border: `1px solid ${correctId === c.id ? GREEN : BORDER}`, borderRadius: 10, padding: "8px 12px" }}>
                <input
                  type="radio"
                  name="correct"
                  checked={correctId === c.id}
                  onChange={() => setCorrectId(c.id)}
                  style={{ accentColor: GREEN, width: 18, height: 18, cursor: "pointer" }}
                />
                <input
                  value={c.text}
                  onChange={(e) => updateChoice(c.id, e.target.value)}
                  placeholder="선택지 내용"
                  style={{ flex: 1, border: "none", background: "transparent", fontSize: 14, fontFamily: "inherit", color: TEXT, outline: "none" }}
                />
                {correctId === c.id && <span style={{ fontSize: 12, fontWeight: 700, color: GREEN }}>정답</span>}
                <button
                  onClick={() => removeChoice(c.id)}
                  disabled={choices.length <= 2}
                  style={{ background: "transparent", border: "none", color: choices.length <= 2 ? "#cbd5e1" : RED, cursor: choices.length <= 2 ? "default" : "pointer", fontSize: 16, fontFamily: "inherit" }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <button onClick={addChoice} style={{ marginTop: 12, background: "#fff", color: ACCENT, border: `1px dashed ${ACCENT}`, borderRadius: 10, padding: "9px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", width: "100%" }}>＋ 선택지 추가</button>
        </div>

        {/* RIGHT: preview */}
        {showPreview && (
          <div style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: NAVY }}>미리보기</h2>
              <span style={{ display: "inline-block", borderRadius: 999, padding: "3px 10px", fontSize: 12, fontWeight: 700, background: "#e8f0fe", color: "#1d4ed8" }}>{type} · {diff}</span>
            </div>

            <div style={{ background: "linear-gradient(160deg,#eef4ff,#f6fbfa)", border: `1px solid ${BORDER}`, borderRadius: 16, padding: 24 }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: NAVY, textAlign: "center" }}>{title || "문제 제목"}</div>
              <div style={{ fontSize: 14, color: MUTED, textAlign: "center", marginTop: 8 }}>{desc || "문제 설명이 여기에 표시돼요."}</div>

              <div style={{ display: "flex", justifyContent: "center", gap: 8, fontSize: 40, margin: "20px 0", flexWrap: "wrap" }}>
                🍎🍎🍎🍎
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {choices.map((c, i) => (
                  <div
                    key={c.id}
                    style={{
                      background: PALETTE[i % PALETTE.length],
                      border: correctId === c.id ? `2px solid ${BLUE}` : "2px solid transparent",
                      borderRadius: 14,
                      padding: "18px 12px",
                      textAlign: "center",
                      fontSize: 16,
                      fontWeight: 700,
                      color: NAVY,
                      position: "relative",
                    }}
                  >
                    {c.text || `선택지 ${i + 1}`}
                    {correctId === c.id && <span style={{ position: "absolute", top: 6, right: 8, fontSize: 14 }}>✅</span>}
                  </div>
                ))}
              </div>
            </div>

            <p style={{ fontSize: 13, color: MUTED, marginTop: 16, textAlign: "center" }}>학생에게 보이는 화면 미리보기입니다. 파란 테두리가 정답이에요.</p>
          </div>
        )}
      </div>
    </div>
  );
}
