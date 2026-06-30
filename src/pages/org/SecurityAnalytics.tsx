const FONT = "'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
const NAVY = "#1e3a5f";
const GREEN = "#16a34a";
const RED = "#e5484d";
const ORANGE = "#f59e0b";
const BG = "#f4f5f7";
const CARD = "#ffffff";
const BORDER = "#e6e8ec";
const TEXT = "#1e293b";
const MUTED = "#64748b";

type Sev = "danger" | "warn" | "info";
type State = "blocked" | "review" | "allowed";

interface Kpi { label: string; value: string; delta: string; up: boolean; }
interface HourBar { hour: string; blocks: number; }
interface EventRow { time: string; ip: string; kind: string; sev: Sev; state: State; }
interface Slice { label: string; value: number; color: string; }

const KPIS: Kpi[] = [
  { label: "비정상 접근 수", value: "1,284", delta: "+186", up: false },
  { label: "봇 의심 요청", value: "527", delta: "+74", up: false },
  { label: "차단 건수", value: "1,102", delta: "+158", up: true },
  { label: "차단율", value: "85.8%", delta: "+2.1%p", up: true },
];

const HOURS: HourBar[] = [
  { hour: "00", blocks: 32 }, { hour: "03", blocks: 18 }, { hour: "06", blocks: 41 },
  { hour: "09", blocks: 96 }, { hour: "12", blocks: 128 }, { hour: "15", blocks: 154 },
  { hour: "18", blocks: 187 }, { hour: "21", blocks: 142 },
];

const EVENTS: EventRow[] = [
  { time: "2026-06-30 18:42", ip: "203.0.113.45", kind: "봇 다중 요청", sev: "danger", state: "blocked" },
  { time: "2026-06-30 18:31", ip: "198.51.100.7", kind: "비정상 속도", sev: "warn", state: "review" },
  { time: "2026-06-30 18:15", ip: "203.0.113.91", kind: "토큰 위조 시도", sev: "danger", state: "blocked" },
  { time: "2026-06-30 17:58", ip: "192.0.2.130", kind: "프록시 의심", sev: "warn", state: "review" },
  { time: "2026-06-30 17:40", ip: "198.51.100.22", kind: "반복 실패", sev: "info", state: "allowed" },
  { time: "2026-06-30 17:12", ip: "203.0.113.5", kind: "자동화 패턴", sev: "danger", state: "blocked" },
];

const SLICES: Slice[] = [
  { label: "자동 차단", value: 64, color: RED },
  { label: "수동 검토", value: 22, color: ORANGE },
  { label: "정상 통과", value: 14, color: GREEN },
];

const cardStyle = { background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 20, boxShadow: "0 1px 3px rgba(16,24,40,0.06)" } as const;
const badgeBase = { display: "inline-block", borderRadius: 999, padding: "3px 10px", fontSize: 12, fontWeight: 700 } as const;
const thStyle = { textAlign: "left", fontSize: 12, fontWeight: 700, color: MUTED, padding: "12px 14px", borderBottom: `1px solid ${BORDER}` } as const;
const tdStyle = { padding: "14px", fontSize: 14, borderBottom: "1px solid #f0f1f4", color: TEXT } as const;

function sevBadge(s: Sev) {
  if (s === "danger") return { style: { ...badgeBase, background: "#fdeaea", color: "#c0392b" }, label: "위험" };
  if (s === "warn") return { style: { ...badgeBase, background: "#fef3e2", color: "#b45309" }, label: "주의" };
  return { style: { ...badgeBase, background: "#e8f0fe", color: "#1d4ed8" }, label: "정보" };
}
function stateBadge(s: State) {
  if (s === "blocked") return { style: { ...badgeBase, background: "#fdeaea", color: "#c0392b" }, label: "차단됨" };
  if (s === "review") return { style: { ...badgeBase, background: "#fef3e2", color: "#b45309" }, label: "검토 중" };
  return { style: { ...badgeBase, background: "#e7f6ee", color: "#16794c" }, label: "허용" };
}

const maxBlocks = Math.max(...HOURS.map((h) => h.blocks));

// build conic-gradient stops from slice percentages
let acc = 0;
const conicStops = SLICES.map((s) => {
  const start = acc;
  acc += s.value;
  return `${s.color} ${start}% ${acc}%`;
}).join(", ");

export default function SecurityAnalytics() {
  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: FONT, color: TEXT, padding: "28px 32px" }}>
      <style>{`
        .sa-kpi { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }
        .sa-mid { display:grid; grid-template-columns:2fr 1fr; gap:20px; align-items:start; }
        .sa-btn:hover { filter:brightness(0.95); }
        @media (max-width:880px){ .sa-kpi{ grid-template-columns:repeat(2,1fr); } .sa-mid{ grid-template-columns:1fr; } }
      `}</style>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: NAVY, letterSpacing: "-0.5px" }}>보안 분석</h1>
          <p style={{ margin: "6px 0 0", fontSize: 14, color: MUTED }}>🛡️ 비정상 접근과 봇 트래픽을 실시간 탐지하고 차단 현황을 추적합니다.</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="sa-btn" style={{ background: "#fff", color: NAVY, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "10px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>📋 로그 내보내기</button>
          <button className="sa-btn" style={{ background: RED, color: "#fff", border: "none", borderRadius: 10, padding: "10px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>🔒 IP 차단 규칙</button>
        </div>
      </div>

      <div className="sa-kpi" style={{ marginBottom: 20 }}>
        {KPIS.map((k) => (
          <div key={k.label} style={cardStyle}>
            <div style={{ fontSize: 13, color: MUTED }}>{k.label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: NAVY, margin: "6px 0 4px" }}>{k.value}</div>
            <div style={{ fontSize: 12, color: k.up ? GREEN : RED, fontWeight: 700 }}>{k.delta} 전일 대비</div>
          </div>
        ))}
      </div>

      <div className="sa-mid" style={{ marginBottom: 20 }}>
        <div style={cardStyle}>
          <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 800, color: NAVY }}>시간대별 차단</h3>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 180 }}>
            {HOURS.map((h) => (
              <div key={h.hour} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: NAVY, marginBottom: 6 }}>{h.blocks}</div>
                <div style={{ width: "100%", maxWidth: 38, height: `${(h.blocks / maxBlocks) * 130}px`, background: h.blocks >= 150 ? RED : h.blocks >= 90 ? ORANGE : NAVY, borderRadius: "6px 6px 0 0" }} />
                <div style={{ fontSize: 12, color: MUTED, marginTop: 8 }}>{h.hour}시</div>
              </div>
            ))}
          </div>
        </div>

        <div style={cardStyle}>
          <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 800, color: NAVY }}>차단 현황</h3>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
            <div style={{ position: "relative", width: 150, height: 150 }}>
              <div style={{ width: 150, height: 150, borderRadius: "50%", background: `conic-gradient(${conicStops})` }} />
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 92, height: 92, borderRadius: "50%", background: CARD, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: "inset 0 0 0 1px #f0f1f4" }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: RED }}>85.8%</div>
                <div style={{ fontSize: 11, color: MUTED }}>차단율</div>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {SLICES.map((s) => (
              <div key={s.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: s.color, display: "inline-block" }} />
                  {s.label}
                </span>
                <span style={{ fontWeight: 700, color: NAVY }}>{s.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ ...cardStyle, padding: 0, overflowX: "auto" }}>
        <h3 style={{ margin: 0, padding: "20px 20px 4px", fontSize: 16, fontWeight: 800, color: NAVY }}>위험 이벤트 로그</h3>
        <p style={{ margin: 0, padding: "0 20px 12px", fontSize: 13, color: MUTED }}>최근 24시간 · 위험·주의 이벤트 {EVENTS.length}건</p>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={thStyle}>시각</th>
              <th style={thStyle}>출처 IP</th>
              <th style={thStyle}>유형</th>
              <th style={thStyle}>위험도</th>
              <th style={thStyle}>처리 상태</th>
            </tr>
          </thead>
          <tbody>
            {EVENTS.map((e) => {
              const sv = sevBadge(e.sev);
              const st = stateBadge(e.state);
              return (
                <tr key={e.time + e.ip}>
                  <td style={{ ...tdStyle, color: MUTED }}>{e.time}</td>
                  <td style={{ ...tdStyle, fontWeight: 700, color: NAVY, fontFamily: "monospace" }}>{e.ip}</td>
                  <td style={tdStyle}>{e.kind}</td>
                  <td style={tdStyle}><span style={sv.style}>{sv.label}</span></td>
                  <td style={tdStyle}><span style={st.style}>{st.label}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
