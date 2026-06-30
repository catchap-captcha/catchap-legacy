import { useState } from 'react';

const FONT = "'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
const NAVY = "#1e3a5f";
const ACCENT = "#4a9b8e";
const RED = "#e5484d";
const BG = "#f4f5f7";
const CARD = "#ffffff";
const BORDER = "#e6e8ec";
const TEXT = "#1e293b";
const MUTED = "#64748b";

const FULL_KEY = "sk_live_9f3a7c21b8e04d6f1234";
const MASKED_KEY = "sk_live_••••••••••••1234";

interface Scope {
  id: string;
  label: string;
  desc: string;
}

const SCOPES: Scope[] = [
  { id: "read", label: "read", desc: "데이터 조회 권한" },
  { id: "write", label: "write", desc: "데이터 생성·수정 권한" },
  { id: "analytics", label: "analytics", desc: "통계·리포트 조회" },
  { id: "webhook", label: "webhook", desc: "웹훅 이벤트 수신" },
];

const INITIAL_DOMAINS: string[] = ["school.catchap.kr", "class.minseo-edu.kr", "junho-class.kr"];

export default function ApiConfig() {
  const [masked, setMasked] = useState(true);
  const [copied, setCopied] = useState(false);
  const [domains, setDomains] = useState<string[]>(INITIAL_DOMAINS);
  const [newDomain, setNewDomain] = useState("");
  const [scopes, setScopes] = useState<Record<string, boolean>>({ read: true, analytics: true });

  const handleCopy = () => {
    try {
      navigator.clipboard?.writeText(FULL_KEY);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const addDomain = () => {
    const d = newDomain.trim();
    if (!d || domains.includes(d)) return;
    setDomains(prev => [...prev, d]);
    setNewDomain("");
  };

  const removeDomain = (d: string) => setDomains(prev => prev.filter(x => x !== d));
  const toggleScope = (id: string) => setScopes(prev => ({ ...prev, [id]: !prev[id] }));

  const cardStyle: React.CSSProperties = { background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 20, boxShadow: "0 1px 3px rgba(16,24,40,0.06)" };
  const primaryBtn: React.CSSProperties = { background: NAVY, color: "#fff", border: "none", borderRadius: 10, padding: "10px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" };
  const secondaryBtn: React.CSSProperties = { background: "#fff", color: NAVY, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "10px 16px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" };
  const dangerBtn: React.CSSProperties = { background: RED, color: "#fff", border: "none", borderRadius: 10, padding: "10px 16px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" };
  const inputStyle: React.CSSProperties = { padding: "10px 12px", border: `1px solid ${BORDER}`, borderRadius: 10, fontSize: 14, fontFamily: "inherit", flex: 1, minWidth: 220 };

  const chips: { label: string; value: string }[] = [
    { label: "활성 키", value: "1" },
    { label: "마지막 사용", value: "5분 전" },
    { label: "발급일", value: "2026-05-12" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: FONT, color: TEXT, padding: "28px 32px" }}>
      <style>{`
        .ac-chips { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; margin-bottom:20px; }
        .ac-grid { display:grid; grid-template-columns:1fr 1fr; gap:20px; align-items:start; }
        @media (max-width:880px){ .ac-chips{ grid-template-columns:1fr; } .ac-grid{ grid-template-columns:1fr; } }
      `}</style>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: NAVY, letterSpacing: "-0.5px" }}>API 설정</h1>
          <p style={{ margin: "6px 0 0", fontSize: 14, color: MUTED }}>API 키와 접근 권한, 허용 도메인을 관리하세요.</p>
        </div>
      </div>

      <div className="ac-chips">
        {chips.map(c => (
          <div key={c.label} style={cardStyle}>
            <div style={{ fontSize: 13, color: MUTED }}>{c.label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: NAVY, marginTop: 6 }}>{c.value}</div>
          </div>
        ))}
      </div>

      <div style={{ ...cardStyle, marginBottom: 20 }}>
        <h2 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 800, color: NAVY }}>🔑 API 키</h2>
        <p style={{ margin: "0 0 14px", fontSize: 13, color: MUTED }}>이 키는 서버 사이드에서만 사용하세요. 외부에 노출되지 않도록 주의하세요.</p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <code style={{
            flex: 1, minWidth: 240, background: "#0f172a", color: "#e2e8f0", borderRadius: 10,
            padding: "12px 14px", fontSize: 14, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            letterSpacing: "0.5px", overflowX: "auto", whiteSpace: "nowrap",
          }}>{masked ? MASKED_KEY : FULL_KEY}</code>
          <button style={secondaryBtn} onClick={() => setMasked(m => !m)}>{masked ? "표시" : "숨기기"}</button>
          <button style={{ ...secondaryBtn, background: copied ? "#e7f6ee" : "#fff", color: copied ? "#16794c" : NAVY, borderColor: copied ? "#cdeadf" : BORDER }} onClick={handleCopy}>{copied ? "복사됨!" : "복사"}</button>
          <button style={dangerBtn} onClick={() => undefined}>재발급</button>
        </div>
      </div>

      <div className="ac-grid">
        <div style={cardStyle}>
          <h2 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 800, color: NAVY }}>🌐 허용 도메인</h2>
          <p style={{ margin: "0 0 14px", fontSize: 13, color: MUTED }}>API 호출을 허용할 도메인 목록입니다.</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
            <input
              style={inputStyle}
              placeholder="예: app.example.com"
              value={newDomain}
              onChange={e => setNewDomain(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") addDomain(); }}
            />
            <button style={primaryBtn} onClick={addDomain}>추가</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {domains.length === 0 && (
              <div style={{ fontSize: 13, color: MUTED, padding: "12px 0" }}>등록된 도메인이 없습니다.</div>
            )}
            {domains.map(d => (
              <div key={d} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "10px 14px", border: `1px solid ${BORDER}`, borderRadius: 10, background: "#fafbfc",
              }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: TEXT }}>{d}</span>
                <button
                  onClick={() => removeDomain(d)}
                  style={{ background: "none", border: "none", color: RED, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
                >삭제</button>
              </div>
            ))}
          </div>
        </div>

        <div style={cardStyle}>
          <h2 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 800, color: NAVY }}>🛡️ 권한 범위 (Scope)</h2>
          <p style={{ margin: "0 0 14px", fontSize: 13, color: MUTED }}>이 키가 접근할 수 있는 권한을 선택하세요.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {SCOPES.map(s => {
              const on = !!scopes[s.id];
              return (
                <label key={s.id} style={{
                  display: "flex", alignItems: "center", gap: 12, cursor: "pointer",
                  padding: "12px 14px", borderRadius: 10, border: `1px solid ${on ? "#cdeadf" : BORDER}`,
                  background: on ? "#f3fbf7" : "#fff",
                }}>
                  <input type="checkbox" checked={on} onChange={() => toggleScope(s.id)} style={{ width: 17, height: 17, accentColor: ACCENT, cursor: "pointer" }} />
                  <span style={{ flex: 1 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: NAVY, fontFamily: "ui-monospace, monospace" }}>{s.label}</span>
                    <span style={{ display: "block", fontSize: 12.5, color: MUTED, marginTop: 2 }}>{s.desc}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
