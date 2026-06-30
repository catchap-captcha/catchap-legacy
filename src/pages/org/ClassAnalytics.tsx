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

interface Kpi { label: string; value: string; delta: string; up: boolean; }
interface DayPoint { day: string; rate: number; }
interface Weak { category: string; rate: number; }
interface StudentRow { name: string; rate: number; time: string; trend: "up" | "down" | "flat"; }

const KPIS: Kpi[] = [
  { label: "평균 성공률", value: "87.4%", delta: "+3.2%p", up: true },
  { label: "평균 풀이 시간", value: "12.6초", delta: "-1.4초", up: true },
  { label: "총 인증 수", value: "4,182", delta: "+612", up: true },
  { label: "재시도율", value: "9.1%", delta: "+0.8%p", up: false },
];

const DAYS: DayPoint[] = [
  { day: "월", rate: 82 }, { day: "화", rate: 88 }, { day: "수", rate: 79 },
  { day: "목", rate: 91 }, { day: "금", rate: 86 }, { day: "토", rate: 94 }, { day: "일", rate: 90 },
];

const WEAK: Weak[] = [
  { category: "신호등 식별", rate: 62 },
  { category: "자전거 식별", rate: 71 },
  { category: "횡단보도 식별", rate: 74 },
  { category: "버스 식별", rate: 83 },
  { category: "동물 식별", rate: 89 },
];

const STUDENTS: StudentRow[] = [
  { name: "김민서", rate: 94, time: "10.2초", trend: "up" },
  { name: "이준호", rate: 88, time: "12.8초", trend: "up" },
  { name: "박서연", rate: 76, time: "15.6초", trend: "down" },
  { name: "최예린", rate: 91, time: "11.1초", trend: "flat" },
  { name: "정우진", rate: 68, time: "18.3초", trend: "down" },
  { name: "한지민", rate: 85, time: "13.4초", trend: "up" },
];

const cardStyle = { background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 20, boxShadow: "0 1px 3px rgba(16,24,40,0.06)" } as const;
const selectStyle = { padding: "9px 12px", border: `1px solid ${BORDER}`, borderRadius: 10, fontSize: 14, fontFamily: "inherit", background: "#fff", color: TEXT, cursor: "pointer" } as const;
const thStyle = { textAlign: "left", fontSize: 12, fontWeight: 700, color: MUTED, padding: "12px 14px", borderBottom: `1px solid ${BORDER}` } as const;
const tdStyle = { padding: "14px", fontSize: 14, borderBottom: "1px solid #f0f1f4", color: TEXT } as const;

function trendMark(t: StudentRow["trend"]) {
  if (t === "up") return <span style={{ color: GREEN, fontWeight: 700 }}>▲ 상승</span>;
  if (t === "down") return <span style={{ color: RED, fontWeight: 700 }}>▼ 하락</span>;
  return <span style={{ color: MUTED, fontWeight: 700 }}>— 유지</span>;
}

export default function ClassAnalytics() {
  const [cls, setCls] = useState("1-2반");
  const [period, setPeriod] = useState("최근 7일");

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: FONT, color: TEXT, padding: "28px 32px" }}>
      <style>{`
        .ca-kpi { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }
        .ca-mid { display:grid; grid-template-columns:2fr 1fr; gap:20px; align-items:start; }
        .ca-btn:hover { filter:brightness(0.95); }
        .ca-bar:hover { opacity:0.85; }
        @media (max-width:880px){ .ca-kpi{ grid-template-columns:repeat(2,1fr); } .ca-mid{ grid-template-columns:1fr; } }
      `}</style>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: NAVY, letterSpacing: "-0.5px" }}>학급 분석</h1>
          <p style={{ margin: "6px 0 0", fontSize: 14, color: MUTED }}>학급별 캡차 인증 성과와 취약 영역을 분석합니다.</p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <select value={cls} onChange={(e) => setCls(e.target.value)} style={selectStyle}>
            <option>1-1반</option><option>1-2반</option><option>2-1반</option><option>2-3반</option>
          </select>
          <select value={period} onChange={(e) => setPeriod(e.target.value)} style={selectStyle}>
            <option>최근 7일</option><option>최근 30일</option><option>이번 학기</option>
          </select>
          <button className="ca-btn" style={{ background: NAVY, color: "#fff", border: "none", borderRadius: 10, padding: "10px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>📊 리포트 내보내기</button>
        </div>
      </div>

      <div style={{ fontSize: 13, color: MUTED, marginBottom: 16 }}>{cls} · {period} 기준</div>

      <div className="ca-kpi" style={{ marginBottom: 20 }}>
        {KPIS.map((k) => (
          <div key={k.label} style={cardStyle}>
            <div style={{ fontSize: 13, color: MUTED }}>{k.label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: NAVY, margin: "6px 0 4px" }}>{k.value}</div>
            <div style={{ fontSize: 12, color: k.up ? GREEN : RED, fontWeight: 700 }}>{k.delta} 전주 대비</div>
          </div>
        ))}
      </div>

      <div className="ca-mid" style={{ marginBottom: 20 }}>
        <div style={cardStyle}>
          <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 800, color: NAVY }}>일별 성공률</h3>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 14, height: 180, padding: "0 4px" }}>
            {DAYS.map((d) => (
              <div key={d.day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: NAVY, marginBottom: 6 }}>{d.rate}%</div>
                <div className="ca-bar" style={{ width: "100%", maxWidth: 36, height: `${d.rate * 1.5}px`, background: NAVY, borderRadius: "6px 6px 0 0", transition: "opacity .12s" }} />
                <div style={{ fontSize: 12, color: MUTED, marginTop: 8 }}>{d.day}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={cardStyle}>
          <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 800, color: NAVY }}>취약 영역</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {WEAK.map((w) => (
              <div key={w.category}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                  <span style={{ color: TEXT }}>{w.category}</span>
                  <span style={{ fontWeight: 700, color: w.rate < 70 ? RED : NAVY }}>{w.rate}%</span>
                </div>
                <div style={{ height: 8, background: "#eef1f5", borderRadius: 999, overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 999, background: w.rate < 70 ? RED : ACCENT, width: `${w.rate}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ ...cardStyle, padding: 0, overflowX: "auto" }}>
        <h3 style={{ margin: 0, padding: "20px 20px 4px", fontSize: 16, fontWeight: 800, color: NAVY }}>학생별 성취</h3>
        <p style={{ margin: 0, padding: "0 20px 12px", fontSize: 13, color: MUTED }}>{cls} 소속 학생 {STUDENTS.length}명</p>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={thStyle}>학생</th>
              <th style={thStyle}>성공률</th>
              <th style={thStyle}>풀이 시간</th>
              <th style={thStyle}>추세</th>
            </tr>
          </thead>
          <tbody>
            {STUDENTS.map((s) => (
              <tr key={s.name}>
                <td style={{ ...tdStyle, fontWeight: 700, color: NAVY }}>{s.name}</td>
                <td style={tdStyle}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ flex: 1, maxWidth: 160, height: 8, background: "#eef1f5", borderRadius: 999, overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: 999, background: s.rate < 75 ? RED : ACCENT, width: `${s.rate}%` }} />
                    </div>
                    <span style={{ fontWeight: 700, color: NAVY, minWidth: 38 }}>{s.rate}%</span>
                  </div>
                </td>
                <td style={tdStyle}>{s.time}</td>
                <td style={tdStyle}>{trendMark(s.trend)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
