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

const cardStyle = { background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 20, boxShadow: "0 1px 3px rgba(16,24,40,0.06)" } as const;
const primaryBtn = { background: NAVY, color: "#fff", border: "none", borderRadius: 10, padding: "10px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" } as const;
const secondaryBtn = { background: "#fff", color: NAVY, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "10px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" } as const;
const fieldStyle = { padding: "9px 12px", border: `1px solid ${BORDER}`, borderRadius: 10, fontSize: 14, fontFamily: "inherit", background: "#fff", color: TEXT } as const;
const th = { textAlign: "left", fontSize: 12, fontWeight: 700, color: MUTED, padding: "12px 14px", borderBottom: `1px solid ${BORDER}` } as const;
const td = { padding: "14px", fontSize: 14, borderBottom: "1px solid #f0f1f4", color: TEXT } as const;

type FileType = "PDF" | "CSV";
interface Kpi { label: string; value: string; delta: string; up: boolean; }
interface Bar { month: string; value: number; }
interface ClassRow { cls: string; auth: number; success: number; students: number; anomaly: number; }
interface FileRow { name: string; type: FileType; size: string; date: string; }

const PERIODS = ["주간", "월간", "분기"];

const KPIS: Kpi[] = [
  { label: "총 인증", value: "128,402", delta: "+8.2%", up: true },
  { label: "평균 성공률", value: "96.4%", delta: "+1.1%p", up: true },
  { label: "활성 학생", value: "412", delta: "+15", up: true },
  { label: "이상 감지", value: "37", delta: "-9", up: true },
];

const BARS: Bar[] = [
  { month: "1월", value: 8200 }, { month: "2월", value: 7400 }, { month: "3월", value: 9800 },
  { month: "4월", value: 11200 }, { month: "5월", value: 12600 }, { month: "6월", value: 13950 },
];

const CLASS_ROWS: ClassRow[] = [
  { cls: "1-2반", auth: 24102, success: 97.1, students: 102, anomaly: 6 },
  { cls: "2-1반", auth: 21840, success: 95.8, students: 98, anomaly: 11 },
  { cls: "2-3반", auth: 19560, success: 96.9, students: 96, anomaly: 4 },
  { cls: "3-1반", auth: 17320, success: 94.2, students: 88, anomaly: 16 },
];

const FILES: FileRow[] = [
  { name: "2026년 6월 월간 인증 리포트", type: "PDF", size: "2.4MB", date: "2026-06-30" },
  { name: "학급별 인증 상세 데이터", type: "CSV", size: "812KB", date: "2026-06-30" },
  { name: "2026년 2분기 종합 리포트", type: "PDF", size: "5.1MB", date: "2026-06-28" },
  { name: "이상 감지 이벤트 로그", type: "CSV", size: "1.2MB", date: "2026-06-27" },
];

const fileBadge = (t: FileType) => (t === "PDF" ? { bg: "#fdeaea", color: "#c0392b" } : { bg: "#e7f6ee", color: "#16794c" });

function Badge({ text, bg, color }: { text: string; bg: string; color: string }) {
  return <span style={{ display: "inline-block", borderRadius: 999, padding: "3px 10px", fontSize: 12, fontWeight: 700, background: bg, color }}>{text}</span>;
}

export default function Report() {
  const [period, setPeriod] = useState<string>("월간");
  const [start, setStart] = useState<string>("2026-06-01");
  const [end, setEnd] = useState<string>("2026-06-30");

  const maxBar = Math.max(...BARS.map((b) => b.value));

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: FONT, color: TEXT, padding: "28px 32px" }}>
      <style>{`
        .rp-kpi { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:20px; }
        .rp-period { display:flex; gap:10px; flex-wrap:wrap; align-items:flex-end; }
        .rp-filerow:hover { background:#f7faf9; }
        @media (max-width:880px){ .rp-kpi{ grid-template-columns:repeat(2,1fr); } }
      `}</style>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: NAVY, letterSpacing: "-0.5px" }}>📊 리포트</h1>
          <p style={{ margin: "6px 0 0", fontSize: 14, color: MUTED }}>기간별 인증 현황과 학급 성과를 집계하고 내려받을 수 있습니다.</p>
        </div>
      </div>

      {/* period selector */}
      <div style={{ ...cardStyle, marginBottom: 20 }}>
        <div className="rp-period">
          <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12, color: MUTED }}>
            기간
            <select style={fieldStyle} value={period} onChange={(e) => setPeriod(e.target.value)}>
              {PERIODS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12, color: MUTED }}>
            시작일
            <input type="date" style={fieldStyle} value={start} onChange={(e) => setStart(e.target.value)} />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12, color: MUTED }}>
            종료일
            <input type="date" style={fieldStyle} value={end} onChange={(e) => setEnd(e.target.value)} />
          </label>
          <button style={primaryBtn}>리포트 생성</button>
          <button style={secondaryBtn}>⬇ PDF</button>
          <button style={secondaryBtn}>⬇ CSV</button>
        </div>
      </div>

      <div className="rp-kpi">
        {KPIS.map((k) => (
          <div key={k.label} style={cardStyle}>
            <div style={{ fontSize: 13, color: MUTED }}>{k.label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: NAVY, marginTop: 4 }}>{k.value}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: k.up ? GREEN : RED, marginTop: 4 }}>{k.delta} 전기 대비</div>
          </div>
        ))}
      </div>

      <div style={{ ...cardStyle, marginBottom: 20 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: NAVY, marginBottom: 6 }}>📈 월별 인증 추이</div>
        <div style={{ fontSize: 12, color: MUTED, marginBottom: 18 }}>2026년 상반기 누적 인증 건수</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 18, height: 200 }}>
          {BARS.map((b) => (
            <div key={b.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
              <div style={{ fontSize: 11, color: MUTED, marginBottom: 6 }}>{(b.value / 1000).toFixed(1)}k</div>
              <div style={{ width: "100%", maxWidth: 46, height: `${(b.value / maxBar) * 150}px`, background: ACCENT, borderRadius: "6px 6px 0 0" }} />
              <div style={{ fontSize: 12, color: MUTED, marginTop: 8 }}>{b.month}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ ...cardStyle, overflowX: "auto", marginBottom: 20 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: NAVY, marginBottom: 12 }}>학급별 요약</div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={th}>학급</th>
              <th style={th}>인증 건수</th>
              <th style={th}>성공률</th>
              <th style={th}>활성 학생</th>
              <th style={th}>이상 감지</th>
            </tr>
          </thead>
          <tbody>
            {CLASS_ROWS.map((r) => (
              <tr key={r.cls}>
                <td style={{ ...td, fontWeight: 700, color: NAVY }}>{r.cls}</td>
                <td style={td}>{r.auth.toLocaleString()}</td>
                <td style={td}>
                  <span style={{ fontWeight: 700, color: r.success >= 96 ? GREEN : r.success >= 95 ? NAVY : RED }}>{r.success}%</span>
                </td>
                <td style={td}>{r.students}명</td>
                <td style={td}>
                  {r.anomaly >= 12
                    ? <Badge text={`${r.anomaly}건`} bg="#fdeaea" color="#c0392b" />
                    : <Badge text={`${r.anomaly}건`} bg="#eef1f5" color="#52606d" />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={cardStyle}>
        <div style={{ fontSize: 16, fontWeight: 800, color: NAVY, marginBottom: 14 }}>📦 다운로드 가능한 리포트</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {FILES.map((f) => {
            const fb = fileBadge(f.type);
            return (
              <div key={f.name} className="rp-filerow" style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 10px", borderRadius: 10, transition: "background .12s" }}>
                <Badge text={f.type} bg={fb.bg} color={fb.color} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: TEXT }}>{f.name}</div>
                  <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{f.size} · 생성일 {f.date}</div>
                </div>
                <button style={secondaryBtn}>⬇ 다운로드</button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
