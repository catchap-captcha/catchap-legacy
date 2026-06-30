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

interface Kpi {
  label: string;
  value: string;
  delta: string;
  deltaUp: boolean;
  icon: string;
}

type Result = "success" | "fail" | "partial";

interface Record {
  date: string;
  type: string;
  result: Result;
  time: string;
}

interface Weakness {
  label: string;
  pct: number;
}

type Risk = "low" | "mid" | "high";

interface Behavior {
  label: string;
  value: string;
  icon: string;
  risk?: Risk;
}

const KPIS: Kpi[] = [
  { label: "총 인증 수", value: "142건", delta: "+12 이번 달", deltaUp: true, icon: "✅" },
  { label: "성공률", value: "88%", delta: "+3%", deltaUp: true, icon: "📈" },
  { label: "평균 풀이 시간", value: "58초", delta: "-6초", deltaUp: true, icon: "⏱️" },
  { label: "연속 출석", value: "11일", delta: "최고 기록", deltaUp: true, icon: "🔥" },
];

const RECORDS: Record[] = [
  { date: "2026-06-30", type: "한글 단어", result: "success", time: "0분 52초" },
  { date: "2026-06-29", type: "수 세기", result: "success", time: "1분 04초" },
  { date: "2026-06-28", type: "모양·색 분류", result: "partial", time: "1분 28초" },
  { date: "2026-06-27", type: "안전 신호등", result: "success", time: "0분 47초" },
  { date: "2026-06-26", type: "수 세기", result: "fail", time: "1분 51초" },
  { date: "2026-06-25", type: "한글 자음", result: "success", time: "1분 12초" },
];

const WEAK: Weakness[] = [
  { label: "수 세기", pct: 38 },
  { label: "모양·색", pct: 24 },
  { label: "한글", pct: 18 },
  { label: "안전", pct: 9 },
];

const BEHAVIOR: Behavior[] = [
  { label: "드래그 경로 길이", value: "평균 312px", icon: "🖱️" },
  { label: "클릭 수", value: "평균 7.4회", icon: "👆" },
  { label: "평균 체류 시간", value: "1분 06초", icon: "⏳" },
  { label: "이상 행동 점수", value: "낮음 (12)", icon: "🛡️", risk: "low" },
];

const cardStyle = {
  background: CARD,
  border: `1px solid ${BORDER}`,
  borderRadius: 14,
  padding: 20,
  boxShadow: "0 1px 3px rgba(16,24,40,0.06)",
} as const;

function resultBadge(r: Result) {
  const base = { display: "inline-block", borderRadius: 999, padding: "3px 10px", fontSize: 12, fontWeight: 700 } as const;
  if (r === "success") return { ...base, background: "#e7f6ee", color: "#16794c" };
  if (r === "partial") return { ...base, background: "#fef3e2", color: "#b45309" };
  return { ...base, background: "#fdeaea", color: "#c0392b" };
}

function resultLabel(r: Result) {
  if (r === "success") return "성공";
  if (r === "partial") return "부분 성공";
  return "실패";
}

function riskBadge(risk: Risk) {
  const base = { display: "inline-block", borderRadius: 999, padding: "3px 10px", fontSize: 12, fontWeight: 700 } as const;
  if (risk === "low") return { ...base, background: "#e7f6ee", color: "#16794c" };
  if (risk === "mid") return { ...base, background: "#fef3e2", color: "#b45309" };
  return { ...base, background: "#fdeaea", color: "#c0392b" };
}

function weakColor(pct: number) {
  if (pct >= 30) return RED;
  if (pct >= 18) return ORANGE;
  return ACCENT;
}

export default function StudentDetail() {
  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: FONT, color: TEXT, padding: "28px 32px" }}>
      <style>{`
        .sd-grid4 { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }
        .sd-cols { display:grid; grid-template-columns:2fr 1fr; gap:20px; align-items:start; }
        .sd-row:hover { background:#fafbfc; }
        @media (max-width:880px){ .sd-grid4{ grid-template-columns:repeat(2,1fr); } .sd-cols{ grid-template-columns:1fr; } }
        @media (max-width:560px){ .sd-grid4{ grid-template-columns:1fr; } }
      `}</style>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: NAVY, letterSpacing: "-0.5px" }}>김민서</h1>
          <p style={{ margin: "6px 0 0", fontSize: 14, color: MUTED }}>1학년 2반 · 학생 상세</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ background: "#fff", color: NAVY, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "10px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>📋 리포트</button>
          <button style={{ background: NAVY, color: "#fff", border: "none", borderRadius: 10, padding: "10px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>🔔 보호자 메시지</button>
        </div>
      </div>

      <div style={{ ...cardStyle, marginBottom: 20, display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#e8f0fe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, flexShrink: 0 }}>🧒</div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: NAVY }}>김민서</div>
          <div style={{ fontSize: 14, color: MUTED, marginTop: 4 }}>1학년 2반 · 가입일 2026-03-02</div>
        </div>
        <div style={{ display: "flex", gap: 28 }}>
          <div><div style={{ fontSize: 13, color: MUTED }}>레벨</div><div style={{ fontSize: 22, fontWeight: 800, color: ACCENT }}>Lv.7</div></div>
          <div><div style={{ fontSize: 13, color: MUTED }}>포인트</div><div style={{ fontSize: 22, fontWeight: 800, color: NAVY }}>2,480 P</div></div>
        </div>
      </div>

      <div className="sd-grid4" style={{ marginBottom: 20 }}>
        {KPIS.map((k) => (
          <div key={k.label} style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, color: MUTED }}>{k.label}</span>
              <span style={{ fontSize: 18 }}>{k.icon}</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: NAVY, marginTop: 8 }}>{k.value}</div>
            <div style={{ fontSize: 12, color: k.deltaUp ? GREEN : RED, marginTop: 4 }}>{k.delta}</div>
          </div>
        ))}
      </div>

      <div className="sd-cols">
        <div style={cardStyle}>
          <h2 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 800, color: NAVY }}>인증 기록</h2>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["날짜", "유형", "결과", "풀이 시간"].map((h) => (
                    <th key={h} style={{ textAlign: "left", fontSize: 12, fontWeight: 700, color: MUTED, padding: "12px 14px", borderBottom: `1px solid ${BORDER}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {RECORDS.map((r, i) => (
                  <tr key={i} className="sd-row">
                    <td style={{ padding: 14, fontSize: 14, borderBottom: "1px solid #f0f1f4", color: MUTED }}>{r.date}</td>
                    <td style={{ padding: 14, fontSize: 14, borderBottom: "1px solid #f0f1f4", color: TEXT, fontWeight: 600 }}>{r.type}</td>
                    <td style={{ padding: 14, fontSize: 14, borderBottom: "1px solid #f0f1f4" }}><span style={resultBadge(r.result)}>{resultLabel(r.result)}</span></td>
                    <td style={{ padding: 14, fontSize: 14, borderBottom: "1px solid #f0f1f4", color: TEXT }}>{r.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={cardStyle}>
            <h2 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 800, color: NAVY }}>취약 유형</h2>
            {WEAK.map((w) => (
              <div key={w.label} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                  <span style={{ color: TEXT, fontWeight: 600 }}>{w.label}</span>
                  <span style={{ color: MUTED }}>{w.pct}%</span>
                </div>
                <div style={{ height: 8, background: "#eef1f5", borderRadius: 999, overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 999, background: weakColor(w.pct), width: `${w.pct}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div style={cardStyle}>
            <h2 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 800, color: NAVY }}>행동 데이터 요약</h2>
            {BEHAVIOR.map((b) => (
              <div key={b.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid #f0f1f4` }}>
                <span style={{ fontSize: 14, color: TEXT }}>{b.icon} {b.label}</span>
                {b.risk ? <span style={riskBadge(b.risk)}>{b.value}</span> : <span style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>{b.value}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
