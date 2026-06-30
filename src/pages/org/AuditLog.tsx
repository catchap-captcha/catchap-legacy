import { useState } from 'react';

const FONT = "'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
const NAVY = "#1e3a5f";
const RED = "#e5484d";
const BG = "#f4f5f7";
const CARD = "#ffffff";
const BORDER = "#e6e8ec";
const TEXT = "#1e293b";
const MUTED = "#64748b";

type ActivityType = "로그인" | "설정변경" | "권한변경" | "콘텐츠" | "보안";
type Result = "성공" | "실패";

interface LogRow {
  time: string;
  name: string;
  email: string;
  type: ActivityType;
  target: string;
  ip: string;
  result: Result;
}

const LOGS: LogRow[] = [
  { time: "2026-06-30 14:32:11", name: "김민서", email: "minseo.kim@scjung.sen.go.kr", type: "로그인", target: "관리자 콘솔", ip: "121.135.20.14", result: "성공" },
  { time: "2026-06-30 13:58:47", name: "이준호", email: "junho.lee@scjung.sen.go.kr", type: "권한변경", target: "박서연 → 편집자", ip: "121.135.20.31", result: "성공" },
  { time: "2026-06-30 11:20:05", name: "박서연", email: "seoyeon.park@scjung.sen.go.kr", type: "콘텐츠", target: "2학년 1반 수업자료", ip: "211.45.10.88", result: "성공" },
  { time: "2026-06-30 09:14:39", name: "알 수 없음", email: "-", type: "보안", target: "로그인 5회 실패 차단", ip: "203.241.55.7", result: "실패" },
  { time: "2026-06-30 08:47:22", name: "김민서", email: "minseo.kim@scjung.sen.go.kr", type: "설정변경", target: "세션 만료 60분", ip: "121.135.20.14", result: "성공" },
  { time: "2026-06-29 17:03:10", name: "최우진", email: "woojin.choi@scjung.sen.go.kr", type: "로그인", target: "관리자 콘솔", ip: "121.135.20.52", result: "실패" },
  { time: "2026-06-29 16:41:58", name: "이준호", email: "junho.lee@scjung.sen.go.kr", type: "콘텐츠", target: "1학년 2반 평가 삭제", ip: "121.135.20.31", result: "성공" },
  { time: "2026-06-29 15:12:44", name: "박서연", email: "seoyeon.park@scjung.sen.go.kr", type: "설정변경", target: "알림 채널 수정", ip: "211.45.10.88", result: "성공" },
  { time: "2026-06-29 10:05:31", name: "김민서", email: "minseo.kim@scjung.sen.go.kr", type: "보안", target: "2단계 인증 활성화", ip: "121.135.20.14", result: "성공" },
  { time: "2026-06-28 22:18:07", name: "알 수 없음", email: "-", type: "보안", target: "허용되지 않은 IP 접근", ip: "45.83.122.19", result: "실패" },
  { time: "2026-06-28 14:50:26", name: "최우진", email: "woojin.choi@scjung.sen.go.kr", type: "권한변경", target: "정하늘 → 뷰어", ip: "121.135.20.52", result: "성공" },
  { time: "2026-06-28 09:33:19", name: "정하늘", email: "haneul.jung@scjung.sen.go.kr", type: "로그인", target: "관리자 콘솔", ip: "121.135.20.77", result: "성공" },
];

const TYPE_BADGE: Record<ActivityType, { bg: string; color: string }> = {
  "로그인": { bg: "#e8f0fe", color: "#1d4ed8" },
  "설정변경": { bg: "#eef1f5", color: "#52606d" },
  "권한변경": { bg: "#fef3e2", color: "#b45309" },
  "콘텐츠": { bg: "#e7f6ee", color: "#16794c" },
  "보안": { bg: "#fdeaea", color: "#c0392b" },
};

const TYPES: ActivityType[] = ["로그인", "설정변경", "권한변경", "콘텐츠", "보안"];

export default function AuditLog() {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [from, setFrom] = useState("2026-06-28");
  const [to, setTo] = useState("2026-06-30");

  const card = {
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
    color: TEXT,
    background: "#fff",
  } as const;

  const th = {
    textAlign: "left" as const,
    fontSize: 12,
    fontWeight: 700,
    color: MUTED,
    padding: "12px 14px",
    borderBottom: `1px solid ${BORDER}`,
    whiteSpace: "nowrap" as const,
  };
  const td = { padding: "14px", fontSize: 14, borderBottom: "1px solid #f0f1f4", color: TEXT } as const;

  const q = query.trim().toLowerCase();
  const filtered = LOGS.filter((l) => {
    const matchType = typeFilter === "all" || l.type === typeFilter;
    const matchQuery =
      q === "" ||
      l.name.toLowerCase().includes(q) ||
      l.email.toLowerCase().includes(q) ||
      l.target.toLowerCase().includes(q) ||
      l.ip.includes(q);
    return matchType && matchQuery;
  });

  const todayCount = LOGS.filter((l) => l.time.startsWith("2026-06-30")).length;
  const weekCount = LOGS.length;
  const failCount = LOGS.filter((l) => l.result === "실패").length;

  const chips = [
    { label: "오늘 활동", value: todayCount, icon: "📅", color: NAVY },
    { label: "이번 주", value: weekCount, icon: "📈", color: NAVY },
    { label: "실패 시도", value: failCount, icon: "⚠️", color: RED },
  ];

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: FONT, color: TEXT, padding: "28px 32px" }}>
      <style>{`
        .al-grid3 { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
        @media (max-width: 880px) {
          .al-grid3 { grid-template-columns:1fr; }
        }
        .al-row:hover { background:#fafbfc; }
      `}</style>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: NAVY, letterSpacing: "-0.5px" }}>감사 기록</h1>
          <p style={{ margin: "6px 0 0", fontSize: 14, color: MUTED }}>관리자 활동과 보안 이벤트를 추적하고 감사합니다.</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ background: NAVY, color: "#fff", border: "none", borderRadius: 10, padding: "10px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            ⬇ 내보내기
          </button>
        </div>
      </div>

      {/* stat chips */}
      <div className="al-grid3" style={{ marginBottom: 16 }}>
        {chips.map((c) => (
          <div key={c.label} style={{ ...card, display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ fontSize: 26 }}>{c.icon}</div>
            <div>
              <div style={{ fontSize: 13, color: MUTED }}>{c.label}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: c.color, lineHeight: 1.1 }}>{c.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* filter bar */}
      <div style={{ ...card, marginBottom: 16 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
          <div style={{ position: "relative", flex: "1 1 240px", minWidth: 200 }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14 }}>🔍</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="관리자, 대상, IP 검색"
              style={{ ...inputStyle, width: "100%", paddingLeft: 34, boxSizing: "border-box" }}
            />
          </div>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
            <option value="all">전체 유형</option>
            {TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} style={inputStyle} />
          <span style={{ color: MUTED }}>~</span>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} style={inputStyle} />
        </div>
      </div>

      {/* log table */}
      <div style={{ ...card, padding: 0, overflowX: "auto" }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${BORDER}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: NAVY }}>활동 로그</h2>
          <span style={{ fontSize: 13, color: MUTED }}>{filtered.length}건</span>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={th}>시각</th>
              <th style={th}>관리자</th>
              <th style={th}>활동 유형</th>
              <th style={th}>대상</th>
              <th style={th}>IP</th>
              <th style={th}>결과</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((l, i) => {
              const tb = TYPE_BADGE[l.type];
              const rb = l.result === "성공" ? { bg: "#e7f6ee", color: "#16794c" } : { bg: "#fdeaea", color: "#c0392b" };
              return (
                <tr key={`${l.time}-${i}`} className="al-row">
                  <td style={{ ...td, color: MUTED, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{l.time}</td>
                  <td style={td}>
                    <div style={{ fontWeight: 700 }}>{l.name}</div>
                    <div style={{ fontSize: 12, color: MUTED }}>{l.email}</div>
                  </td>
                  <td style={td}>
                    <span style={{ display: "inline-block", borderRadius: 999, padding: "3px 10px", fontSize: 12, fontWeight: 700, background: tb.bg, color: tb.color }}>{l.type}</span>
                  </td>
                  <td style={td}>{l.target}</td>
                  <td style={{ ...td, color: MUTED, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{l.ip}</td>
                  <td style={td}>
                    <span style={{ display: "inline-block", borderRadius: 999, padding: "3px 10px", fontSize: 12, fontWeight: 700, background: rb.bg, color: rb.color }}>{l.result}</span>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td style={{ ...td, textAlign: "center", color: MUTED, padding: "40px 14px" }} colSpan={6}>
                  조건에 맞는 기록이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
