import { useState } from 'react';

const FONT = "'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
const NAVY = "#1e3a5f";
const ACCENT = "#4a9b8e";
const BG = "#f4f5f7";
const CARD = "#ffffff";
const BORDER = "#e6e8ec";
const TEXT = "#1e293b";
const MUTED = "#64748b";

type Category = "수 세기" | "모양·색" | "한글" | "안전";
type Difficulty = "쉬움" | "보통" | "어려움";
type Visibility = "public" | "private" | "pending";

interface Content {
  title: string;
  category: Category;
  difficulty: Difficulty;
  visibility: Visibility;
  updated: string;
}

const CATEGORIES = ["전체", "수 세기", "모양·색", "한글", "안전"] as const;
type CategoryFilter = (typeof CATEGORIES)[number];

const STATUS_OPTIONS = ["전체", "공개", "비공개", "검수 대기"] as const;
type StatusFilter = (typeof STATUS_OPTIONS)[number];

const CONTENTS: Content[] = [
  { title: "사과를 세어 보아요", category: "수 세기", difficulty: "쉬움", visibility: "public", updated: "2026-06-28" },
  { title: "10까지 수 맞추기", category: "수 세기", difficulty: "보통", visibility: "public", updated: "2026-06-26" },
  { title: "같은 모양을 찾아요", category: "모양·색", difficulty: "쉬움", visibility: "public", updated: "2026-06-25" },
  { title: "색깔 분류 챌린지", category: "모양·색", difficulty: "어려움", visibility: "pending", updated: "2026-06-24" },
  { title: "기역부터 히읗까지", category: "한글", difficulty: "보통", visibility: "public", updated: "2026-06-22" },
  { title: "받침이 있는 단어", category: "한글", difficulty: "어려움", visibility: "private", updated: "2026-06-20" },
  { title: "신호등 색깔의 의미", category: "안전", difficulty: "쉬움", visibility: "public", updated: "2026-06-19" },
  { title: "낯선 사람을 만났을 때", category: "안전", difficulty: "보통", visibility: "pending", updated: "2026-06-18" },
];

const cardStyle = {
  background: CARD,
  border: `1px solid ${BORDER}`,
  borderRadius: 14,
  padding: 20,
  boxShadow: "0 1px 3px rgba(16,24,40,0.06)",
} as const;

const categoryBadge = { display: "inline-block", borderRadius: 999, padding: "3px 10px", fontSize: 12, fontWeight: 700, background: "#e8f0fe", color: "#1d4ed8" } as const;

function visBadge(v: Visibility) {
  const base = { display: "inline-block", borderRadius: 999, padding: "3px 10px", fontSize: 12, fontWeight: 700 } as const;
  if (v === "public") return { ...base, background: "#e7f6ee", color: "#16794c" };
  if (v === "pending") return { ...base, background: "#fef3e2", color: "#b45309" };
  return { ...base, background: "#eef1f5", color: "#52606d" };
}

function visLabel(v: Visibility) {
  if (v === "public") return "공개";
  if (v === "pending") return "검수 대기";
  return "비공개";
}

function diffColor(d: Difficulty) {
  if (d === "쉬움") return ACCENT;
  if (d === "보통") return "#f59e0b";
  return "#e5484d";
}

const inputStyle = { padding: "9px 12px", border: `1px solid ${BORDER}`, borderRadius: 10, fontSize: 14, fontFamily: "inherit", color: TEXT } as const;

export default function ContentManage() {
  const [cat, setCat] = useState<CategoryFilter>("전체");
  const [status, setStatus] = useState<StatusFilter>("전체");
  const [query, setQuery] = useState("");

  const filtered = CONTENTS.filter((c) => {
    if (cat !== "전체" && c.category !== cat) return false;
    if (status === "공개" && c.visibility !== "public") return false;
    if (status === "비공개" && c.visibility !== "private") return false;
    if (status === "검수 대기" && c.visibility !== "pending") return false;
    if (query.trim() && !c.title.includes(query.trim())) return false;
    return true;
  });

  const stats = [
    { label: "전체 콘텐츠", value: CONTENTS.length, icon: "📦" },
    { label: "공개", value: CONTENTS.filter((c) => c.visibility === "public").length, icon: "✅" },
    { label: "비공개", value: CONTENTS.filter((c) => c.visibility === "private").length, icon: "🔒" },
    { label: "검수 대기", value: CONTENTS.filter((c) => c.visibility === "pending").length, icon: "🕒" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: FONT, color: TEXT, padding: "28px 32px" }}>
      <style>{`
        .cm-grid4 { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }
        .cm-row:hover { background:#fafbfc; }
        @media (max-width:880px){ .cm-grid4{ grid-template-columns:repeat(2,1fr); } }
        @media (max-width:560px){ .cm-grid4{ grid-template-columns:1fr; } }
      `}</style>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: NAVY, letterSpacing: "-0.5px" }}>콘텐츠 관리</h1>
          <p style={{ margin: "6px 0 0", fontSize: 14, color: MUTED }}>학습 콘텐츠를 검색하고 공개 상태를 관리하세요</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ background: NAVY, color: "#fff", border: "none", borderRadius: 10, padding: "10px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>＋ 콘텐츠 추가</button>
        </div>
      </div>

      <div className="cm-grid4" style={{ marginBottom: 20 }}>
        {stats.map((s) => (
          <div key={s.label} style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, color: MUTED }}>{s.label}</span>
              <span style={{ fontSize: 18 }}>{s.icon}</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: NAVY, marginTop: 8 }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ ...cardStyle, marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              style={{
                background: cat === c ? NAVY : "#fff",
                color: cat === c ? "#fff" : MUTED,
                border: `1px solid ${cat === c ? NAVY : BORDER}`,
                borderRadius: 999,
                padding: "7px 16px",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              {c}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
            <span style={{ position: "absolute", left: 12, top: 9, fontSize: 14 }}>🔍</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="콘텐츠 제목 검색"
              style={{ ...inputStyle, width: "100%", paddingLeft: 34, boxSizing: "border-box" }}
            />
          </div>
          <select value={status} onChange={(e) => setStatus(e.target.value as StatusFilter)} style={inputStyle}>
            {STATUS_OPTIONS.map((o) => (
              <option key={o} value={o}>{o === "전체" ? "전체 상태" : o}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ ...cardStyle, padding: 0 }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["제목", "카테고리", "난이도", "상태", "수정일", "작업"].map((h) => (
                  <th key={h} style={{ textAlign: "left", fontSize: 12, fontWeight: 700, color: MUTED, padding: "14px", borderBottom: `1px solid ${BORDER}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr key={i} className="cm-row">
                  <td style={{ padding: 14, fontSize: 14, borderBottom: "1px solid #f0f1f4", color: TEXT, fontWeight: 700 }}>{c.title}</td>
                  <td style={{ padding: 14, fontSize: 14, borderBottom: "1px solid #f0f1f4" }}><span style={categoryBadge}>{c.category}</span></td>
                  <td style={{ padding: 14, fontSize: 14, borderBottom: "1px solid #f0f1f4", color: diffColor(c.difficulty), fontWeight: 700 }}>{c.difficulty}</td>
                  <td style={{ padding: 14, fontSize: 14, borderBottom: "1px solid #f0f1f4" }}><span style={visBadge(c.visibility)}>{visLabel(c.visibility)}</span></td>
                  <td style={{ padding: 14, fontSize: 14, borderBottom: "1px solid #f0f1f4", color: MUTED }}>{c.updated}</td>
                  <td style={{ padding: 14, fontSize: 14, borderBottom: "1px solid #f0f1f4" }}>
                    <button style={{ background: "#fff", color: NAVY, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "6px 12px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>✏️ 수정</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: 40, textAlign: "center", color: MUTED, fontSize: 14 }}>조건에 맞는 콘텐츠가 없어요.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
