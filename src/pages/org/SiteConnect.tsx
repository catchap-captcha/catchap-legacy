import { useState } from 'react';

const FONT = "'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
const NAVY = "#1e3a5f";
const RED = "#e5484d";
const BG = "#f4f5f7";
const CARD = "#ffffff";
const BORDER = "#e6e8ec";
const TEXT = "#1e293b";
const MUTED = "#64748b";

type SiteStatus = "connected" | "pending" | "error";

interface Site {
  id: number;
  domain: string;
  publicKey: string;
  status: SiteStatus;
  lastSync: string;
}

const SITES: Site[] = [
  { id: 1, domain: "school.catchap.kr", publicKey: "pk_live_a1b2c3", status: "connected", lastSync: "2026-06-30 09:12" },
  { id: 2, domain: "class.minseo-edu.kr", publicKey: "pk_live_d4e5f6", status: "connected", lastSync: "2026-06-30 08:47" },
  { id: 3, domain: "beta.catchap.kr", publicKey: "pk_test_g7h8i9", status: "pending", lastSync: "—" },
  { id: 4, domain: "old.junho-class.kr", publicKey: "pk_live_j1k2l3", status: "error", lastSync: "2026-06-28 21:03" },
];

const STATUS_META: Record<SiteStatus, { label: string; bg: string; color: string }> = {
  connected: { label: "연결됨", bg: "#e7f6ee", color: "#16794c" },
  pending: { label: "대기", bg: "#fef3e2", color: "#b45309" },
  error: { label: "오류", bg: "#fdeaea", color: "#c0392b" },
};

export default function SiteConnect() {
  const [domain, setDomain] = useState("");

  const connectedCount = SITES.filter(s => s.status === "connected").length;
  const pendingCount = SITES.filter(s => s.status === "pending").length;
  const errorCount = SITES.filter(s => s.status === "error").length;

  const cardStyle: React.CSSProperties = { background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 20, boxShadow: "0 1px 3px rgba(16,24,40,0.06)" };
  const primaryBtn: React.CSSProperties = { background: NAVY, color: "#fff", border: "none", borderRadius: 10, padding: "10px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" };
  const secondaryBtn: React.CSSProperties = { background: "#fff", color: NAVY, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "8px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" };
  const dangerBtn: React.CSSProperties = { ...secondaryBtn, color: RED, borderColor: "#f6caca" };
  const inputStyle: React.CSSProperties = { padding: "10px 12px", border: `1px solid ${BORDER}`, borderRadius: 10, fontSize: 14, fontFamily: "inherit", flex: 1, minWidth: 220 };

  const chips: { label: string; value: number; icon: string }[] = [
    { label: "연결된 사이트", value: connectedCount, icon: "✅" },
    { label: "대기", value: pendingCount, icon: "⚠️" },
    { label: "오류", value: errorCount, icon: "🔌" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: FONT, color: TEXT, padding: "28px 32px" }}>
      <style>{`
        .sc-chips { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; margin-bottom:20px; }
        .sc-grid { display:grid; grid-template-columns:1fr; gap:20px; }
        .sc-row:hover { background:#fafbfc; }
        @media (max-width:880px){ .sc-chips{ grid-template-columns:1fr; } }
      `}</style>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: NAVY, letterSpacing: "-0.5px" }}>사이트 연동</h1>
          <p style={{ margin: "6px 0 0", fontSize: 14, color: MUTED }}>위젯을 설치할 도메인을 등록하고 연동 상태를 관리하세요.</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={secondaryBtn} onClick={() => undefined}>🔄 전체 동기화</button>
        </div>
      </div>

      <div className="sc-chips">
        {chips.map(c => (
          <div key={c.label} style={cardStyle}>
            <div style={{ fontSize: 13, color: MUTED, display: "flex", alignItems: "center", gap: 6 }}><span>{c.icon}</span>{c.label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: NAVY, marginTop: 6 }}>{c.value}</div>
          </div>
        ))}
      </div>

      <div className="sc-grid">
        <div style={cardStyle}>
          <h2 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 800, color: NAVY }}>도메인 등록</h2>
          <p style={{ margin: "0 0 14px", fontSize: 13, color: MUTED }}>연동할 사이트의 도메인을 입력하세요. 등록 후 공개키가 발급됩니다.</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input
              style={inputStyle}
              placeholder="예: school.example.com"
              value={domain}
              onChange={e => setDomain(e.target.value)}
            />
            <button style={primaryBtn} onClick={() => setDomain("")}>등록</button>
          </div>
        </div>

        <div style={{ ...cardStyle, padding: 0, overflowX: "auto" }}>
          <div style={{ padding: "16px 20px 0" }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: NAVY }}>연결된 사이트</h2>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: MUTED }}>총 {SITES.length}개 도메인</p>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 12 }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", fontSize: 12, fontWeight: 700, color: MUTED, padding: "12px 20px", borderBottom: `1px solid ${BORDER}` }}>도메인</th>
                <th style={{ textAlign: "left", fontSize: 12, fontWeight: 700, color: MUTED, padding: "12px 14px", borderBottom: `1px solid ${BORDER}` }}>공개키</th>
                <th style={{ textAlign: "left", fontSize: 12, fontWeight: 700, color: MUTED, padding: "12px 14px", borderBottom: `1px solid ${BORDER}` }}>연동 상태</th>
                <th style={{ textAlign: "left", fontSize: 12, fontWeight: 700, color: MUTED, padding: "12px 14px", borderBottom: `1px solid ${BORDER}` }}>마지막 동기화</th>
                <th style={{ textAlign: "right", fontSize: 12, fontWeight: 700, color: MUTED, padding: "12px 20px", borderBottom: `1px solid ${BORDER}` }}>작업</th>
              </tr>
            </thead>
            <tbody>
              {SITES.map(s => {
                const meta = STATUS_META[s.status];
                return (
                  <tr key={s.id} className="sc-row">
                    <td style={{ padding: "14px 20px", fontSize: 14, borderBottom: "1px solid #f0f1f4", color: TEXT, fontWeight: 600 }}>🌐 {s.domain}</td>
                    <td style={{ padding: "14px", fontSize: 13, borderBottom: "1px solid #f0f1f4", color: MUTED, fontFamily: "ui-monospace, monospace" }}>{s.publicKey}••••</td>
                    <td style={{ padding: "14px", fontSize: 14, borderBottom: "1px solid #f0f1f4" }}>
                      <span style={{ display: "inline-block", borderRadius: 999, padding: "3px 10px", fontSize: 12, fontWeight: 700, background: meta.bg, color: meta.color }}>{meta.label}</span>
                    </td>
                    <td style={{ padding: "14px", fontSize: 14, borderBottom: "1px solid #f0f1f4", color: MUTED }}>{s.lastSync}</td>
                    <td style={{ padding: "14px 20px", fontSize: 14, borderBottom: "1px solid #f0f1f4", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: 8 }}>
                        <button style={secondaryBtn} onClick={() => undefined}>재연결</button>
                        <button style={dangerBtn} onClick={() => undefined}>삭제</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
