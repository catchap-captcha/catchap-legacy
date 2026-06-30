import { useState } from 'react';

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

type Status = "active" | "rest" | "warn";

interface Student {
  name: string;
  progress: number;
  success: number;
  last: string;
  status: Status;
}

interface DayBar {
  day: string;
  value: number;
}

type Tone = "info" | "success" | "warn" | "neutral";

interface LogItem {
  time: string;
  icon: string;
  text: string;
  tone: Tone;
}

const KPIS: Kpi[] = [
  { label: "학생 수", value: "24명", delta: "전원 등록", deltaUp: true, icon: "👥" },
  { label: "평균 성공률", value: "82%", delta: "+4% 지난주", deltaUp: true, icon: "✅" },
  { label: "평균 풀이 시간", value: "1분 12초", delta: "-8초 단축", deltaUp: true, icon: "⏱️" },
  { label: "이번 주 인증", value: "138건", delta: "+22건", deltaUp: true, icon: "📈" },
];

const STUDENTS: Student[] = [
  { name: "김민서", progress: 92, success: 88, last: "2026-06-30 09:12", status: "active" },
  { name: "이준호", progress: 74, success: 81, last: "2026-06-30 08:55", status: "active" },
  { name: "박서연", progress: 61, success: 69, last: "2026-06-29 16:40", status: "warn" },
  { name: "정도윤", progress: 88, success: 90, last: "2026-06-30 09:01", status: "active" },
  { name: "최아인", progress: 45, success: 58, last: "2026-06-27 14:20", status: "rest" },
  { name: "한지우", progress: 79, success: 84, last: "2026-06-30 08:30", status: "active" },
  { name: "오시현", progress: 33, success: 51, last: "2026-06-25 11:10", status: "warn" },
  { name: "윤하람", progress: 96, success: 94, last: "2026-06-30 09:20", status: "active" },
];

const WEEK: DayBar[] = [
  { day: "월", value: 18 },
  { day: "화", value: 24 },
  { day: "수", value: 21 },
  { day: "목", value: 30 },
  { day: "금", value: 27 },
  { day: "토", value: 12 },
  { day: "일", value: 6 },
];

const LOGS: LogItem[] = [
  { time: "09:20", icon: "✅", text: "윤하람 학생이 '한글 단어 맞추기' 인증을 완료했어요.", tone: "success" },
  { time: "09:12", icon: "🧩", text: "김민서 학생이 '모양·색 분류' 단계를 시작했어요.", tone: "info" },
  { time: "08:55", icon: "✅", text: "이준호 학생이 '수 세기 5단계' 인증에 성공했어요.", tone: "success" },
  { time: "08:30", icon: "⚠️", text: "오시현 학생의 이상 행동 점수가 상승했어요.", tone: "warn" },
  { time: "어제", icon: "📦", text: "콘텐츠 '안전 신호등' 3종이 학급에 배포되었어요.", tone: "neutral" },
  { time: "어제", icon: "🔔", text: "박서연 학생에게 미완료 알림이 발송되었어요.", tone: "neutral" },
];

const TABS = ["학생 목록", "인증 현황", "활동 로그"] as const;
type Tab = (typeof TABS)[number];

const cardStyle = {
  background: CARD,
  border: `1px solid ${BORDER}`,
  borderRadius: 14,
  padding: 20,
  boxShadow: "0 1px 3px rgba(16,24,40,0.06)",
} as const;

function statusBadge(status: Status) {
  const base = { display: "inline-block", borderRadius: 999, padding: "3px 10px", fontSize: 12, fontWeight: 700 } as const;
  if (status === "active") return { ...base, background: "#e7f6ee", color: "#16794c" };
  if (status === "warn") return { ...base, background: "#fef3e2", color: "#b45309" };
  return { ...base, background: "#eef1f5", color: "#52606d" };
}

function statusLabel(status: Status) {
  if (status === "active") return "활동중";
  if (status === "warn") return "주의";
  return "휴식";
}

function toneColor(tone: Tone) {
  if (tone === "success") return GREEN;
  if (tone === "info") return ACCENT;
  if (tone === "warn") return ORANGE;
  return MUTED;
}

export default function ClassDetail() {
  const [tab, setTab] = useState<Tab>("학생 목록");
  const maxWeek = Math.max(...WEEK.map((w) => w.value));
  const totalWeek = WEEK.reduce((a, b) => a + b.value, 0);

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: FONT, color: TEXT, padding: "28px 32px" }}>
      <style>{`
        .cd-grid4 { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }
        .cd-row:hover { background:#fafbfc; }
        @media (max-width:880px){ .cd-grid4{ grid-template-columns:repeat(2,1fr); } }
        @media (max-width:560px){ .cd-grid4{ grid-template-columns:1fr; } }
      `}</style>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: NAVY, letterSpacing: "-0.5px" }}>1학년 2반</h1>
          <p style={{ margin: "6px 0 0", fontSize: 14, color: MUTED }}>담당 교사 · 학생 24명</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ background: "#fff", color: NAVY, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "10px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>📋 리포트 내보내기</button>
          <button style={{ background: NAVY, color: "#fff", border: "none", borderRadius: 10, padding: "10px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>＋ 학생 추가</button>
        </div>
      </div>

      <div className="cd-grid4" style={{ marginBottom: 20 }}>
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

      <div style={cardStyle}>
        <div style={{ display: "flex", gap: 24, borderBottom: `1px solid ${BORDER}`, marginBottom: 18 }}>
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                background: "transparent",
                border: "none",
                padding: "0 0 12px",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: 14,
                color: tab === t ? NAVY : MUTED,
                fontWeight: tab === t ? 700 : 500,
                borderBottom: tab === t ? `2px solid ${NAVY}` : "2px solid transparent",
                marginBottom: -1,
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "학생 목록" && (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["이름", "진도", "성공률", "마지막 활동", "상태"].map((h) => (
                    <th key={h} style={{ textAlign: "left", fontSize: 12, fontWeight: 700, color: MUTED, padding: "12px 14px", borderBottom: `1px solid ${BORDER}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {STUDENTS.map((s) => (
                  <tr key={s.name} className="cd-row">
                    <td style={{ padding: 14, fontSize: 14, borderBottom: "1px solid #f0f1f4", color: TEXT, fontWeight: 700 }}>{s.name}</td>
                    <td style={{ padding: 14, fontSize: 14, borderBottom: "1px solid #f0f1f4", color: TEXT, minWidth: 160 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ flex: 1, height: 8, background: "#eef1f5", borderRadius: 999, overflow: "hidden" }}>
                          <div style={{ height: "100%", borderRadius: 999, background: ACCENT, width: `${s.progress}%` }} />
                        </div>
                        <span style={{ fontSize: 12, color: MUTED, width: 34 }}>{s.progress}%</span>
                      </div>
                    </td>
                    <td style={{ padding: 14, fontSize: 14, borderBottom: "1px solid #f0f1f4", color: TEXT }}>{s.success}%</td>
                    <td style={{ padding: 14, fontSize: 14, borderBottom: "1px solid #f0f1f4", color: MUTED }}>{s.last}</td>
                    <td style={{ padding: 14, fontSize: 14, borderBottom: "1px solid #f0f1f4" }}>
                      <span style={statusBadge(s.status)}>{statusLabel(s.status)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "인증 현황" && (
          <div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 18, height: 200, padding: "12px 8px 0" }}>
              {WEEK.map((w) => (
                <div key={w.day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: NAVY, marginBottom: 6 }}>{w.value}</span>
                  <div style={{ width: "100%", maxWidth: 46, height: `${(w.value / maxWeek) * 150}px`, background: w.value === maxWeek ? NAVY : ACCENT, borderRadius: "6px 6px 0 0" }} />
                  <span style={{ fontSize: 12, color: MUTED, marginTop: 8 }}>{w.day}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 32, marginTop: 20, paddingTop: 16, borderTop: `1px solid ${BORDER}`, flexWrap: "wrap" }}>
              <div><div style={{ fontSize: 13, color: MUTED }}>주간 총 인증</div><div style={{ fontSize: 24, fontWeight: 800, color: NAVY }}>{totalWeek}건</div></div>
              <div><div style={{ fontSize: 13, color: MUTED }}>일 평균</div><div style={{ fontSize: 24, fontWeight: 800, color: NAVY }}>{Math.round(totalWeek / WEEK.length)}건</div></div>
              <div><div style={{ fontSize: 13, color: MUTED }}>최고 요일</div><div style={{ fontSize: 24, fontWeight: 800, color: ACCENT }}>목요일</div></div>
            </div>
          </div>
        )}

        {tab === "활동 로그" && (
          <div style={{ paddingLeft: 8 }}>
            {LOGS.map((l, i) => (
              <div key={i} style={{ display: "flex", gap: 14, paddingBottom: i === LOGS.length - 1 ? 0 : 18 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#f4f5f7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, border: `2px solid ${toneColor(l.tone)}` }}>{l.icon}</div>
                  {i !== LOGS.length - 1 && <div style={{ width: 2, flex: 1, background: BORDER, marginTop: 4 }} />}
                </div>
                <div style={{ paddingTop: 4 }}>
                  <div style={{ fontSize: 14, color: TEXT }}>{l.text}</div>
                  <div style={{ fontSize: 12, color: MUTED, marginTop: 3 }}>{l.time}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
