import { useState } from 'react';

const FONT = "'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
const NAVY = "#1e3a5f";
const ACCENT = "#4a9b8e";
const GREEN = "#16a34a";
const RED = "#e5484d";
const BG = "#f4f5f7";
const CARD = "#ffffff";
const BORDER = "#e6e8ec";
const TEXT = "#1e293b";
const MUTED = "#64748b";

interface DayRow {
  date: string;
  calls: number;
  success: number;
  fail: number;
  latency: number;
}

type Status = "정상" | "주의" | "오류";

const DAILY: DayRow[] = [
  { date: "06-17", calls: 1820, success: 1798, fail: 22, latency: 142 },
  { date: "06-18", calls: 2140, success: 2120, fail: 20, latency: 138 },
  { date: "06-19", calls: 1960, success: 1931, fail: 29, latency: 151 },
  { date: "06-20", calls: 2580, success: 2566, fail: 14, latency: 129 },
  { date: "06-21", calls: 1240, success: 1232, fail: 8, latency: 118 },
  { date: "06-22", calls: 980, success: 974, fail: 6, latency: 121 },
  { date: "06-23", calls: 2310, success: 2274, fail: 36, latency: 163 },
  { date: "06-24", calls: 2720, success: 2701, fail: 19, latency: 134 },
  { date: "06-25", calls: 2890, success: 2811, fail: 79, latency: 188 },
  { date: "06-26", calls: 2460, success: 2438, fail: 22, latency: 144 },
  { date: "06-27", calls: 1530, success: 1521, fail: 9, latency: 126 },
  { date: "06-28", calls: 1100, success: 1094, fail: 6, latency: 119 },
  { date: "06-29", calls: 2630, success: 2602, fail: 28, latency: 147 },
  { date: "06-30", calls: 2980, success: 2949, fail: 31, latency: 152 },
];

const QUOTA_USED = 31340;
const QUOTA_LIMIT = 50000;

function statusOf(row: DayRow): Status {
  const rate = row.fail / row.calls;
  if (rate >= 0.025) return "오류";
  if (rate >= 0.012) return "주의";
  return "정상";
}

const BADGE: Record<Status, { bg: string; color: string }> = {
  "정상": { bg: "#e7f6ee", color: "#16794c" },
  "주의": { bg: "#fef3e2", color: "#b45309" },
  "오류": { bg: "#fdeaea", color: "#c0392b" },
};

export default function ApiUsage() {
  const [period, setPeriod] = useState("14d");

  const totalCalls = DAILY.reduce((s, d) => s + d.calls, 0);
  const totalSuccess = DAILY.reduce((s, d) => s + d.success, 0);
  const totalFail = DAILY.reduce((s, d) => s + d.fail, 0);
  const successRate = (totalSuccess / totalCalls) * 100;
  const avgLatency = Math.round(DAILY.reduce((s, d) => s + d.latency, 0) / DAILY.length);
  const quotaPct = Math.round((QUOTA_USED / QUOTA_LIMIT) * 100);
  const maxCalls = Math.max(...DAILY.map((d) => d.calls));

  const successPct = (totalSuccess / totalCalls) * 100;
  const failPct = 100 - successPct;

  const card = {
    background: CARD,
    border: `1px solid ${BORDER}`,
    borderRadius: 14,
    padding: 20,
    boxShadow: "0 1px 3px rgba(16,24,40,0.06)",
  } as const;

  const selectStyle = {
    padding: "9px 12px",
    border: `1px solid ${BORDER}`,
    borderRadius: 10,
    fontSize: 14,
    fontFamily: "inherit",
    color: TEXT,
    background: "#fff",
    cursor: "pointer",
  } as const;

  const th = {
    textAlign: "left" as const,
    fontSize: 12,
    fontWeight: 700,
    color: MUTED,
    padding: "12px 14px",
    borderBottom: `1px solid ${BORDER}`,
  };
  const td = { padding: "14px", fontSize: 14, borderBottom: "1px solid #f0f1f4", color: TEXT } as const;

  const kpis = [
    { label: "총 호출 수", value: totalCalls.toLocaleString(), delta: "+12.4% vs 지난 기간", up: true, icon: "📈" },
    { label: "성공률", value: `${successRate.toFixed(2)}%`, delta: "+0.3%p", up: true, icon: "✅" },
    { label: "평균 응답 시간", value: `${avgLatency}ms`, delta: "+6ms", up: false, icon: "⚡" },
    { label: "남은 쿼터", value: (QUOTA_LIMIT - QUOTA_USED).toLocaleString(), delta: `${quotaPct}% 사용`, up: false, icon: "📦" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: FONT, color: TEXT, padding: "28px 32px" }}>
      <style>{`
        .au-grid4 { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }
        .au-grid2 { display:grid; grid-template-columns:2fr 1fr; gap:16px; }
        @media (max-width: 880px) {
          .au-grid4 { grid-template-columns:1fr; }
          .au-grid2 { grid-template-columns:1fr; }
        }
        .au-bar { transition: opacity .15s ease; }
        .au-bar:hover { opacity:.78; }
      `}</style>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: NAVY, letterSpacing: "-0.5px" }}>API 사용량</h1>
          <p style={{ margin: "6px 0 0", fontSize: 14, color: MUTED }}>기관 API 호출 현황과 성공률, 쿼터 소진을 모니터링합니다.</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <select value={period} onChange={(e) => setPeriod(e.target.value)} style={selectStyle}>
            <option value="7d">최근 7일</option>
            <option value="14d">최근 14일</option>
            <option value="30d">최근 30일</option>
            <option value="90d">최근 90일</option>
          </select>
          <button style={{ background: NAVY, color: "#fff", border: "none", borderRadius: 10, padding: "10px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            📋 리포트 내보내기
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="au-grid4" style={{ marginBottom: 16 }}>
        {kpis.map((k) => (
          <div key={k.label} style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, color: MUTED }}>{k.label}</span>
              <span style={{ fontSize: 18 }}>{k.icon}</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: NAVY, marginTop: 8 }}>{k.value}</div>
            <div style={{ fontSize: 12, color: k.up ? GREEN : RED, marginTop: 6 }}>{k.delta}</div>
          </div>
        ))}
      </div>

      {/* Chart + success ratio */}
      <div className="au-grid2" style={{ marginBottom: 16 }}>
        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: NAVY }}>일별 호출 수</h2>
            <span style={{ fontSize: 12, color: MUTED }}>단위: 건</span>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 180, paddingTop: 8 }}>
            {DAILY.map((d) => (
              <div key={d.date} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, height: "100%", justifyContent: "flex-end" }}>
                <span style={{ fontSize: 10, color: MUTED, fontWeight: 700 }}>{(d.calls / 1000).toFixed(1)}k</span>
                <div
                  className="au-bar"
                  title={`${d.date}: ${d.calls.toLocaleString()}건`}
                  style={{
                    width: "100%",
                    height: `${(d.calls / maxCalls) * 140}px`,
                    background: NAVY,
                    borderRadius: "6px 6px 0 0",
                  }}
                />
                <span style={{ fontSize: 10, color: MUTED }}>{d.date.slice(3)}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={card}>
          <h2 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 800, color: NAVY }}>성공/실패 비율</h2>
          <div style={{ display: "flex", height: 16, borderRadius: 999, overflow: "hidden", border: `1px solid ${BORDER}` }}>
            <div style={{ width: `${successPct}%`, background: GREEN }} />
            <div style={{ width: `${failPct}%`, background: RED }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
                <span style={{ width: 10, height: 10, borderRadius: 3, background: GREEN, display: "inline-block" }} /> 성공
              </span>
              <span style={{ fontWeight: 800, color: NAVY }}>{totalSuccess.toLocaleString()} ({successPct.toFixed(2)}%)</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
                <span style={{ width: 10, height: 10, borderRadius: 3, background: RED, display: "inline-block" }} /> 실패
              </span>
              <span style={{ fontWeight: 800, color: NAVY }}>{totalFail.toLocaleString()} ({failPct.toFixed(2)}%)</span>
            </div>
          </div>

          <div style={{ marginTop: 22, paddingTop: 18, borderTop: `1px solid ${BORDER}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8 }}>
              <span style={{ color: MUTED }}>쿼터 사용량</span>
              <span style={{ fontWeight: 700, color: NAVY }}>{QUOTA_USED.toLocaleString()} / {QUOTA_LIMIT.toLocaleString()}</span>
            </div>
            <div style={{ height: 8, background: "#eef1f5", borderRadius: 999, overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 999, background: quotaPct >= 80 ? RED : ACCENT, width: `${quotaPct}%` }} />
            </div>
            <div style={{ fontSize: 12, color: MUTED, marginTop: 6 }}>{quotaPct}% 소진 · 월간 한도 기준</div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={{ ...card, padding: 0, overflowX: "auto" }}>
        <div style={{ padding: "18px 20px", borderBottom: `1px solid ${BORDER}` }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: NAVY }}>사용량 상세</h2>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={th}>날짜</th>
              <th style={{ ...th, textAlign: "right" }}>호출 수</th>
              <th style={{ ...th, textAlign: "right" }}>성공</th>
              <th style={{ ...th, textAlign: "right" }}>실패</th>
              <th style={{ ...th, textAlign: "right" }}>평균 지연</th>
              <th style={th}>상태</th>
            </tr>
          </thead>
          <tbody>
            {[...DAILY].reverse().map((d) => {
              const st = statusOf(d);
              const b = BADGE[st];
              return (
                <tr key={d.date}>
                  <td style={{ ...td, fontWeight: 700 }}>2026-{d.date}</td>
                  <td style={{ ...td, textAlign: "right" }}>{d.calls.toLocaleString()}</td>
                  <td style={{ ...td, textAlign: "right", color: GREEN }}>{d.success.toLocaleString()}</td>
                  <td style={{ ...td, textAlign: "right", color: d.fail > 30 ? RED : TEXT }}>{d.fail}</td>
                  <td style={{ ...td, textAlign: "right" }}>{d.latency}ms</td>
                  <td style={td}>
                    <span style={{ display: "inline-block", borderRadius: 999, padding: "3px 10px", fontSize: 12, fontWeight: 700, background: b.bg, color: b.color }}>{st}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
