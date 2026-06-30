const FONT = "'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
const NAVY = "#1e3a5f";
const ACCENT = "#4a9b8e";
const GREEN = "#16a34a";
const RED = "#e5484d";
const ORANGE = "#f59e0b";
const BG = "#f4f5f7";
const CARD = "#ffffff";
const BORDER = "#e6e8ec";
const TEXT = "#1e293b";
const MUTED = "#64748b";

type Risk = "normal" | "warn" | "danger";

interface Kpi { label: string; value: string; delta: string; up: boolean; }
interface Session { name: string; sid: string; clicks: number; dwell: string; path: number; score: number; risk: Risk; }
interface DistBar { label: string; count: number; }

const KPIS: Kpi[] = [
  { label: "평균 클릭 수", value: "6.2", delta: "-0.4", up: true },
  { label: "평균 체류 시간", value: "14.8초", delta: "+1.2초", up: false },
  { label: "드래그 경로 길이", value: "842px", delta: "-31px", up: true },
  { label: "이상 행동 점수", value: "0.27", delta: "+0.05", up: false },
];

const SESSIONS: Session[] = [
  { name: "김민서", sid: "S-9F02A1", clicks: 5, dwell: "11.2초", path: 612, score: 0.12, risk: "normal" },
  { name: "이준호", sid: "S-9F02B7", clicks: 7, dwell: "13.9초", path: 788, score: 0.21, risk: "normal" },
  { name: "박서연", sid: "S-9F02C4", clicks: 14, dwell: "5.1초", path: 1980, score: 0.58, risk: "warn" },
  { name: "최예린", sid: "S-9F02D9", clicks: 3, dwell: "2.4초", path: 220, score: 0.91, risk: "danger" },
  { name: "정우진", sid: "S-9F02E2", clicks: 6, dwell: "12.7초", path: 705, score: 0.18, risk: "normal" },
  { name: "한지민", sid: "S-9F02F5", clicks: 11, dwell: "6.8초", path: 1540, score: 0.49, risk: "warn" },
];

const DIST: DistBar[] = [
  { label: "정상 패턴", count: 312 },
  { label: "비정상 속도", count: 84 },
  { label: "직선 드래그", count: 47 },
  { label: "클릭 폭주", count: 22 },
  { label: "봇 의심", count: 9 },
];

const cardStyle = { background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 20, boxShadow: "0 1px 3px rgba(16,24,40,0.06)" } as const;
const badgeBase = { display: "inline-block", borderRadius: 999, padding: "3px 10px", fontSize: 12, fontWeight: 700 } as const;
const thStyle = { textAlign: "left", fontSize: 12, fontWeight: 700, color: MUTED, padding: "12px 14px", borderBottom: `1px solid ${BORDER}` } as const;
const tdStyle = { padding: "14px", fontSize: 14, borderBottom: "1px solid #f0f1f4", color: TEXT } as const;

function riskBadge(r: Risk) {
  if (r === "normal") return { style: { ...badgeBase, background: "#e7f6ee", color: "#16794c" }, label: "정상" };
  if (r === "warn") return { style: { ...badgeBase, background: "#fef3e2", color: "#b45309" }, label: "주의" };
  return { style: { ...badgeBase, background: "#fdeaea", color: "#c0392b" }, label: "위험" };
}

const maxDist = Math.max(...DIST.map((d) => d.count));

export default function BehaviorAnalytics() {
  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: FONT, color: TEXT, padding: "28px 32px" }}>
      <style>{`
        .ba-kpi { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }
        .ba-mid { display:grid; grid-template-columns:1fr 1fr; gap:20px; align-items:start; }
        .ba-btn:hover { filter:brightness(0.95); }
        @media (max-width:880px){ .ba-kpi{ grid-template-columns:repeat(2,1fr); } .ba-mid{ grid-template-columns:1fr; } }
      `}</style>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: NAVY, letterSpacing: "-0.5px" }}>행동 · 화면 분석</h1>
          <p style={{ margin: "6px 0 0", fontSize: 14, color: MUTED }}>사용자 클릭·체류·드래그 패턴을 분석해 봇과 이상 행동을 탐지합니다.</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="ba-btn" style={{ background: "#fff", color: NAVY, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "10px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>🔄 새로고침</button>
          <button className="ba-btn" style={{ background: NAVY, color: "#fff", border: "none", borderRadius: 10, padding: "10px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>📊 세션 내보내기</button>
        </div>
      </div>

      <div className="ba-kpi" style={{ marginBottom: 20 }}>
        {KPIS.map((k) => (
          <div key={k.label} style={cardStyle}>
            <div style={{ fontSize: 13, color: MUTED }}>{k.label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: NAVY, margin: "6px 0 4px" }}>{k.value}</div>
            <div style={{ fontSize: 12, color: k.up ? GREEN : RED, fontWeight: 700 }}>{k.delta} 전주 대비</div>
          </div>
        ))}
      </div>

      <div style={{ ...cardStyle, padding: 0, overflowX: "auto", marginBottom: 20 }}>
        <h3 style={{ margin: 0, padding: "20px 20px 12px", fontSize: 16, fontWeight: 800, color: NAVY }}>세션 행동 로그</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={thStyle}>학생 / 세션 ID</th>
              <th style={thStyle}>클릭 수</th>
              <th style={thStyle}>체류 시간</th>
              <th style={thStyle}>드래그 경로</th>
              <th style={thStyle}>이상 점수</th>
              <th style={thStyle}>위험도</th>
            </tr>
          </thead>
          <tbody>
            {SESSIONS.map((s) => {
              const b = riskBadge(s.risk);
              return (
                <tr key={s.sid}>
                  <td style={tdStyle}>
                    <div style={{ fontWeight: 700, color: NAVY }}>{s.name}</div>
                    <div style={{ fontSize: 12, color: MUTED }}>{s.sid}</div>
                  </td>
                  <td style={tdStyle}>{s.clicks}회</td>
                  <td style={tdStyle}>{s.dwell}</td>
                  <td style={tdStyle}>{s.path}px</td>
                  <td style={{ ...tdStyle, fontWeight: 700, color: s.score >= 0.7 ? RED : s.score >= 0.4 ? ORANGE : GREEN }}>{s.score.toFixed(2)}</td>
                  <td style={tdStyle}><span style={b.style}>{b.label}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="ba-mid">
        <div style={cardStyle}>
          <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 800, color: NAVY }}>드래그 경로</h3>
          <p style={{ margin: "0 0 14px", fontSize: 13, color: MUTED }}>세션 S-9F02C4 · 마우스 이동 궤적</p>
          <div style={{ borderRadius: 10, background: "#f7f9fc", border: `1px solid ${BORDER}`, padding: 8 }}>
            <svg viewBox="0 0 400 200" width="100%" height="200" preserveAspectRatio="none" role="img" aria-label="드래그 경로 시각화">
              <defs>
                <pattern id="ba-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e6e8ec" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="400" height="200" fill="url(#ba-grid)" />
              <polyline
                points="20,170 55,150 70,120 110,140 150,80 175,95 220,55 260,90 300,45 345,70 380,30"
                fill="none" stroke={ACCENT} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
              <circle cx="20" cy="170" r="6" fill={GREEN} />
              <circle cx="380" cy="30" r="6" fill={RED} />
            </svg>
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 12, fontSize: 12, color: MUTED }}>
            <span>🟢 시작점</span><span>🔴 종료점</span><span>경로 길이 1,980px</span>
          </div>
        </div>

        <div style={cardStyle}>
          <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 800, color: NAVY }}>이상 행동 분포</h3>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 14, height: 180 }}>
            {DIST.map((d, i) => (
              <div key={d.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: NAVY, marginBottom: 6 }}>{d.count}</div>
                <div style={{ width: "100%", maxWidth: 40, height: `${(d.count / maxDist) * 130}px`, background: i >= DIST.length - 2 ? RED : i === DIST.length - 3 ? ORANGE : NAVY, borderRadius: "6px 6px 0 0" }} />
                <div style={{ fontSize: 11, color: MUTED, marginTop: 8, textAlign: "center" }}>{d.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
