const FONT = "'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
const NAVY = "#1e3a5f";
const GREEN = "#16a34a";
const RED = "#e5484d";
const BG = "#f4f5f7";
const CARD = "#ffffff";
const BORDER = "#e6e8ec";
const TEXT = "#1e293b";
const MUTED = "#64748b";

const cardStyle = { background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 20, boxShadow: "0 1px 3px rgba(16,24,40,0.06)" } as const;
const primaryBtn = { background: NAVY, color: "#fff", border: "none", borderRadius: 10, padding: "10px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" } as const;
const secondaryBtn = { background: "#fff", color: NAVY, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "10px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" } as const;
const th = { textAlign: "left", fontSize: 12, fontWeight: 700, color: MUTED, padding: "12px 14px", borderBottom: `1px solid ${BORDER}` } as const;
const td = { padding: "14px", fontSize: 14, borderBottom: "1px solid #f0f1f4", color: TEXT } as const;

type Status = "정상" | "대기" | "오류";
type Level = "INFO" | "WARN" | "ERROR";
interface Kpi { label: string; value: string; delta?: string; up?: boolean; }
interface Model { name: string; version: string; status: Status; requests: string; latency: string; deployed: string; }
interface Bar { hour: string; value: number; }
interface Log { time: string; level: Level; msg: string; }

const KPIS: Kpi[] = [
  { label: "모델 상태", value: "정상 가동" },
  { label: "추론 요청 수 (24h)", value: "48,219", delta: "+6.4%", up: true },
  { label: "평균 응답 시간", value: "182ms", delta: "-12ms", up: true },
  { label: "오류율", value: "0.42%", delta: "+0.08%", up: false },
];

const MODELS: Model[] = [
  { name: "captcha-vision", version: "v3.2.1", status: "정상", requests: "31,402", latency: "164ms", deployed: "2026-06-22" },
  { name: "weakness-recommender", version: "v1.8.0", status: "정상", requests: "12,118", latency: "210ms", deployed: "2026-06-18" },
  { name: "bot-detector", version: "v2.4.3", status: "대기", requests: "4,201", latency: "98ms", deployed: "2026-06-29" },
  { name: "ocr-fallback", version: "v0.9.5", status: "오류", requests: "498", latency: "—", deployed: "2026-05-30" },
];

const BARS: Bar[] = [
  { hour: "00", value: 820 }, { hour: "03", value: 540 }, { hour: "06", value: 980 },
  { hour: "09", value: 2240 }, { hour: "12", value: 2980 }, { hour: "15", value: 2610 },
  { hour: "18", value: 1840 }, { hour: "21", value: 1320 },
];

const LOGS: Log[] = [
  { time: "2026-06-30 09:51:22", level: "INFO", msg: "captcha-vision v3.2.1 헬스체크 통과 (응답 164ms)" },
  { time: "2026-06-30 09:48:10", level: "WARN", msg: "bot-detector 큐 적체 감지 — 자동 스케일아웃 1대 추가" },
  { time: "2026-06-30 09:42:57", level: "ERROR", msg: "ocr-fallback 추론 타임아웃 (3회 연속) — 모델 격리 처리" },
  { time: "2026-06-30 09:31:04", level: "INFO", msg: "weakness-recommender 배치 추론 1,024건 완료" },
  { time: "2026-06-30 09:15:33", level: "INFO", msg: "야간 트래픽 정상 범위 복귀" },
];

const statusBadge = (s: Status) => {
  if (s === "정상") return { text: "정상 가동", bg: "#e7f6ee", color: "#16794c" };
  if (s === "대기") return { text: "대기", bg: "#fef3e2", color: "#b45309" };
  return { text: "오류", bg: "#fdeaea", color: "#c0392b" };
};

const levelBadge = (l: Level) => {
  if (l === "INFO") return { bg: "#e8f0fe", color: "#1d4ed8" };
  if (l === "WARN") return { bg: "#fef3e2", color: "#b45309" };
  return { bg: "#fdeaea", color: "#c0392b" };
};

function Badge({ text, bg, color }: { text: string; bg: string; color: string }) {
  return <span style={{ display: "inline-block", borderRadius: 999, padding: "3px 10px", fontSize: 12, fontWeight: 700, background: bg, color }}>{text}</span>;
}

export default function AiInference() {
  const maxBar = Math.max(...BARS.map((b) => b.value));

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: FONT, color: TEXT, padding: "28px 32px" }}>
      <style>{`
        .ai-kpi { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:20px; }
        .ai-split { display:grid; grid-template-columns:1.6fr 1fr; gap:20px; }
        @media (max-width:880px){ .ai-kpi{ grid-template-columns:repeat(2,1fr); } .ai-split{ grid-template-columns:1fr; } }
      `}</style>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: NAVY, letterSpacing: "-0.5px" }}>🤖 AI 추론 운영</h1>
          <p style={{ margin: "6px 0 0", fontSize: 14, color: MUTED }}>추론 모델의 가동 상태, 요청량, 응답 성능을 모니터링합니다.</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={secondaryBtn}>🔄 로그 새로고침</button>
          <button style={primaryBtn}>모델 재시작</button>
        </div>
      </div>

      <div className="ai-kpi">
        {KPIS.map((k) => (
          <div key={k.label} style={cardStyle}>
            <div style={{ fontSize: 13, color: MUTED }}>{k.label}</div>
            {k.label === "모델 상태" ? (
              <div style={{ marginTop: 8 }}><Badge text="정상 가동" bg="#e7f6ee" color="#16794c" /></div>
            ) : (
              <div style={{ fontSize: 28, fontWeight: 800, color: NAVY, marginTop: 4 }}>{k.value}</div>
            )}
            {k.delta && <div style={{ fontSize: 12, fontWeight: 700, color: k.up ? GREEN : RED, marginTop: 4 }}>{k.delta} 전일 대비</div>}
          </div>
        ))}
      </div>

      <div style={{ ...cardStyle, overflowX: "auto", marginBottom: 20 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: NAVY, marginBottom: 12 }}>모델 목록</div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={th}>모델명</th>
              <th style={th}>버전</th>
              <th style={th}>상태</th>
              <th style={th}>요청 수</th>
              <th style={th}>평균 지연</th>
              <th style={th}>마지막 배포</th>
            </tr>
          </thead>
          <tbody>
            {MODELS.map((m) => {
              const b = statusBadge(m.status);
              return (
                <tr key={m.name}>
                  <td style={{ ...td, fontWeight: 700, color: NAVY }}>{m.name}</td>
                  <td style={td}>{m.version}</td>
                  <td style={td}><Badge text={b.text} bg={b.bg} color={b.color} /></td>
                  <td style={td}>{m.requests}</td>
                  <td style={td}>{m.latency}</td>
                  <td style={{ ...td, color: MUTED }}>{m.deployed}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="ai-split">
        <div style={cardStyle}>
          <div style={{ fontSize: 16, fontWeight: 800, color: NAVY, marginBottom: 6 }}>📈 시간대별 추론 요청</div>
          <div style={{ fontSize: 12, color: MUTED, marginBottom: 18 }}>최근 24시간 · 3시간 단위</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 14, height: 180 }}>
            {BARS.map((b) => (
              <div key={b.hour} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
                <div style={{ fontSize: 11, color: MUTED, marginBottom: 6 }}>{(b.value / 1000).toFixed(1)}k</div>
                <div style={{ width: "100%", maxWidth: 38, height: `${(b.value / maxBar) * 140}px`, background: NAVY, borderRadius: "6px 6px 0 0" }} />
                <div style={{ fontSize: 11, color: MUTED, marginTop: 8 }}>{b.hour}시</div>
              </div>
            ))}
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ fontSize: 16, fontWeight: 800, color: NAVY, marginBottom: 14 }}>📋 운영 로그</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {LOGS.map((l, i) => {
              const lb = levelBadge(l.level);
              return (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", paddingBottom: 12, borderBottom: i < LOGS.length - 1 ? "1px solid #f0f1f4" : "none" }}>
                  <Badge text={l.level} bg={lb.bg} color={lb.color} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: TEXT, lineHeight: 1.4 }}>{l.msg}</div>
                    <div style={{ fontSize: 11, color: MUTED, marginTop: 3 }}>{l.time}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
