import { useState } from "react";

const FONT = "'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
const NAVY = "#1e3a5f";
const ACCENT = "#4a9b8e";
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

type BadgeTone = "success" | "info" | "warn" | "danger" | "neutral";

const BADGE_TINTS: Record<BadgeTone, { bg: string; color: string }> = {
  success: { bg: "#e7f6ee", color: "#16794c" },
  info: { bg: "#e8f0fe", color: "#1d4ed8" },
  warn: { bg: "#fef3e2", color: "#b45309" },
  danger: { bg: "#fdeaea", color: "#c0392b" },
  neutral: { bg: "#eef1f5", color: "#52606d" },
};

function Badge({ tone, children }: { tone: BadgeTone; children: string }) {
  const t = BADGE_TINTS[tone];
  return (
    <span
      style={{
        display: "inline-block",
        borderRadius: 999,
        padding: "3px 10px",
        fontSize: 12,
        fontWeight: 700,
        background: t.bg,
        color: t.color,
      }}
    >
      {children}
    </span>
  );
}

type Role = "관리자" | "교사" | "개발자";
type Status = "active" | "inactive";

interface Member {
  name: string;
  email: string;
  role: Role;
  status: Status;
  lastSeen: string;
}

const ROLE_TONE: Record<Role, BadgeTone> = {
  관리자: "info",
  교사: "success",
  개발자: "warn",
};

const MEMBERS: Member[] = [
  { name: "김민서", email: "minseo.kim@catchap.io", role: "관리자", status: "active", lastSeen: "방금 전" },
  { name: "이준호", email: "junho.lee@catchap.io", role: "교사", status: "active", lastSeen: "12분 전" },
  { name: "박서연", email: "seoyeon.park@catchap.io", role: "교사", status: "active", lastSeen: "1시간 전" },
  { name: "최우진", email: "woojin.choi@catchap.io", role: "개발자", status: "active", lastSeen: "3시간 전" },
  { name: "정하늘", email: "haneul.jung@catchap.io", role: "교사", status: "inactive", lastSeen: "5일 전" },
  { name: "강도윤", email: "doyoon.kang@catchap.io", role: "개발자", status: "inactive", lastSeen: "2주 전" },
  { name: "한지민", email: "jimin.han@catchap.io", role: "관리자", status: "active", lastSeen: "어제" },
  { name: "오세훈", email: "sehun.oh@catchap.io", role: "교사", status: "active", lastSeen: "30분 전" },
];

export default function Members() {
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | Role>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | Status>("all");

  const filtered = MEMBERS.filter((m) => {
    const q = query.trim().toLowerCase();
    const matchQuery = !q || m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q);
    const matchRole = roleFilter === "all" || m.role === roleFilter;
    const matchStatus = statusFilter === "all" || m.status === statusFilter;
    return matchQuery && matchRole && matchStatus;
  });

  const total = MEMBERS.length;
  const admins = MEMBERS.filter((m) => m.role === "관리자").length;
  const teachers = MEMBERS.filter((m) => m.role === "교사").length;

  const chips = [
    { label: "전체 멤버", value: total, icon: "👥" },
    { label: "관리자", value: admins, icon: "🔑" },
    { label: "교사", value: teachers, icon: "✏️" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: FONT, color: TEXT, padding: "28px 32px" }}>
      <style>{`
        .om-chips { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
        .om-bar { display:flex; flex-wrap:wrap; gap:10px; }
        .om-bar .grow { flex:1; min-width:220px; }
        @media (max-width:880px){
          .om-chips { grid-template-columns:1fr; }
        }
      `}</style>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: NAVY, letterSpacing: "-0.5px" }}>멤버 · 권한</h1>
          <p style={{ margin: "6px 0 0", fontSize: 14, color: MUTED }}>기관 구성원의 역할과 접근 권한을 관리하세요</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ background: NAVY, color: "#fff", border: "none", borderRadius: 10, padding: "10px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            ＋ 멤버 초대
          </button>
        </div>
      </div>

      <div className="om-chips" style={{ marginBottom: 16 }}>
        {chips.map((c) => (
          <div key={c.label} style={{ ...cardStyle, display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: "#eef1f5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{c.icon}</div>
            <div>
              <div style={{ fontSize: 13, color: MUTED }}>{c.label}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: NAVY }}>{c.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ ...cardStyle, marginBottom: 16 }}>
        <div className="om-bar">
          <div className="grow" style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <span style={{ position: "absolute", left: 12, fontSize: 14 }}>🔍</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="이름 또는 이메일 검색"
              style={{ ...inputStyle, paddingLeft: 34, width: "100%", boxSizing: "border-box" }}
            />
          </div>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as "all" | Role)} style={inputStyle}>
            <option value="all">전체 역할</option>
            <option value="관리자">관리자</option>
            <option value="교사">교사</option>
            <option value="개발자">개발자</option>
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as "all" | Status)} style={inputStyle}>
            <option value="all">전체 상태</option>
            <option value="active">활성</option>
            <option value="inactive">비활성</option>
          </select>
        </div>
      </div>

      <div style={{ ...cardStyle, padding: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: `1px solid ${BORDER}` }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: NAVY }}>멤버 목록</h2>
          <span style={{ fontSize: 13, color: MUTED }}>{filtered.length}명 표시 중</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["이름", "이메일", "역할", "상태", "마지막 접속", "작업"].map((h) => (
                  <th key={h} style={{ textAlign: "left", fontSize: 12, fontWeight: 700, color: MUTED, padding: "12px 20px", borderBottom: `1px solid ${BORDER}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.email}>
                  <td style={{ padding: "14px 20px", fontSize: 14, borderBottom: "1px solid #f0f1f4" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ width: 32, height: 32, borderRadius: 999, background: ACCENT, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>{m.name.charAt(0)}</span>
                      <span style={{ fontWeight: 700 }}>{m.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: "14px 20px", fontSize: 14, borderBottom: "1px solid #f0f1f4", color: MUTED }}>{m.email}</td>
                  <td style={{ padding: "14px 20px", fontSize: 14, borderBottom: "1px solid #f0f1f4" }}><Badge tone={ROLE_TONE[m.role]}>{m.role}</Badge></td>
                  <td style={{ padding: "14px 20px", fontSize: 14, borderBottom: "1px solid #f0f1f4" }}>
                    <Badge tone={m.status === "active" ? "success" : "neutral"}>{m.status === "active" ? "활성" : "비활성"}</Badge>
                  </td>
                  <td style={{ padding: "14px 20px", fontSize: 14, borderBottom: "1px solid #f0f1f4", color: MUTED }}>{m.lastSeen}</td>
                  <td style={{ padding: "14px 20px", fontSize: 14, borderBottom: "1px solid #f0f1f4" }}>
                    <button style={{ background: "#fff", color: NAVY, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "6px 12px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>관리</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: "40px 20px", textAlign: "center", color: MUTED, fontSize: 14 }}>조건에 맞는 멤버가 없습니다.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
