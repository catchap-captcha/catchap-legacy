import { useState } from "react";

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

const cardStyle = {
  background: CARD,
  border: `1px solid ${BORDER}`,
  borderRadius: 14,
  padding: 20,
  boxShadow: "0 1px 3px rgba(16,24,40,0.06)",
} as const;

const inputStyle = {
  padding: "9px 12px",
  border: `1px solid ${BORDER}`,
  borderRadius: 10,
  fontSize: 14,
  fontFamily: "inherit",
} as const;

interface ClassRoom {
  name: string;
  teacher: string;
  students: number;
  successRate: number;
  lastActivity: string;
}

const CLASSES: ClassRoom[] = [
  { name: "1학년 2반", teacher: "오세훈 교사", students: 28, successRate: 94, lastActivity: "3분 전" },
  { name: "2학년 1반", teacher: "한지민 교사", students: 31, successRate: 97, lastActivity: "방금 전" },
  { name: "2학년 3반", teacher: "임채원 교사", students: 29, successRate: 89, lastActivity: "12분 전" },
  { name: "3학년 1반", teacher: "윤가은 교사", students: 26, successRate: 72, lastActivity: "1시간 전" },
  { name: "1학년 4반", teacher: "송민재 교사", students: 30, successRate: 61, lastActivity: "어제" },
  { name: "3학년 2반", teacher: "이준호 교사", students: 27, successRate: 85, lastActivity: "2시간 전" },
];

function rateColor(pct: number): string {
  if (pct >= 90) return GREEN;
  if (pct >= 75) return BLUE;
  return RED;
}

export default function Classes() {
  const [query, setQuery] = useState("");

  const filtered = CLASSES.filter((c) => {
    const q = query.trim().toLowerCase();
    return !q || c.name.toLowerCase().includes(q) || c.teacher.toLowerCase().includes(q);
  });

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: FONT, color: TEXT, padding: "28px 32px" }}>
      <style>{`
        .oc-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; align-items:stretch; }
        @media (max-width:1100px){ .oc-grid { grid-template-columns:repeat(2,1fr); } }
        @media (max-width:880px){ .oc-grid { grid-template-columns:1fr; } }
        .oc-card { transition:box-shadow .15s ease, transform .15s ease; }
        .oc-card:hover { box-shadow:0 6px 18px rgba(16,24,40,0.10); transform:translateY(-2px); }
        .oc-add { transition:border-color .15s ease, background .15s ease; }
        .oc-add:hover { border-color:${NAVY}; background:#f5f8fc; }
      `}</style>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: NAVY, letterSpacing: "-0.5px" }}>학급 · 학생</h1>
          <p style={{ margin: "6px 0 0", fontSize: 14, color: MUTED }}>학급별 인증 현황과 담당 교사를 관리하세요</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ background: NAVY, color: "#fff", border: "none", borderRadius: 10, padding: "10px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            ＋ 학급 추가
          </button>
        </div>
      </div>

      <div style={{ ...cardStyle, marginBottom: 16, display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
        <div style={{ position: "relative", display: "flex", alignItems: "center", flex: 1, minWidth: 220 }}>
          <span style={{ position: "absolute", left: 12, fontSize: 14 }}>🔍</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="학급명 또는 담당 교사 검색"
            style={{ ...inputStyle, paddingLeft: 34, width: "100%", boxSizing: "border-box" }}
          />
        </div>
        <span style={{ fontSize: 13, color: MUTED }}>{filtered.length}개 학급</span>
      </div>

      <div className="oc-grid">
        {filtered.map((c) => (
          <div key={c.name} className="oc-card" style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 40, height: 40, borderRadius: 12, background: "#eef1f5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🏫</span>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: NAVY }}>{c.name}</div>
                  <div style={{ fontSize: 13, color: MUTED }}>{c.teacher}</div>
                </div>
              </div>
              <span style={{ fontSize: 13, color: MUTED }}>👥 {c.students}명</span>
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: MUTED }}>평균 성공률</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: rateColor(c.successRate) }}>{c.successRate}%</span>
              </div>
              <div style={{ height: 8, background: "#eef1f5", borderRadius: 999, overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: 999, background: ACCENT, width: `${c.successRate}%` }} />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: `1px solid ${BORDER}` }}>
              <span style={{ fontSize: 12, color: MUTED }}>최근 활동 · {c.lastActivity}</span>
              <button style={{ background: "#fff", color: NAVY, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "6px 12px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>상세 보기</button>
            </div>
          </div>
        ))}

        <button
          className="oc-add"
          style={{
            background: "transparent",
            border: `2px dashed ${BORDER}`,
            borderRadius: 14,
            padding: 20,
            minHeight: 180,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            cursor: "pointer",
            fontFamily: "inherit",
            color: MUTED,
          }}
        >
          <span style={{ fontSize: 30, fontWeight: 800, color: NAVY }}>＋</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>새 학급 추가</span>
          <span style={{ fontSize: 12 }}>담당 교사를 지정하고 학생을 등록하세요</span>
        </button>
      </div>
    </div>
  );
}
