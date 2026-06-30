const FONT = "'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
const NAVY = "#1e3a5f";
const ACCENT = "#4a9b8e";
const BLUE = "#2f6df6";
const GREEN = "#16a34a";
const RED = "#e5484d";
const BG = "#f4f5f7";
const CARD = "#ffffff";
const BORDER = "#e6e8ec";
const TEXT = "#1e293b";
const MUTED = "#64748b";

const cardStyle = {
  background: CARD,
  border: `1px solid ${BORDER}`,
  borderRadius: 14,
  padding: 20,
  boxShadow: "0 1px 3px rgba(16,24,40,0.06)",
} as const;

type BadgeTone = "success" | "info" | "warn" | "danger" | "neutral";

const BADGE_TINTS: Record<BadgeTone, { bg: string; color: string }> = {
  success: { bg: "#e7f6ee", color: "#16794c" },
  info: { bg: "#e8f0fe", color: "#1d4ed8" },
  warn: { bg: "#fef3e2", color: "#b45309" },
  danger: { bg: "#fdeaea", color: "#c0392b" },
  neutral: { bg: "#eef1f5", color: "#52606d" },
};

function Badge({ tone, children }: { tone: BadgeTone; children: string }) {
  const t = BADGE_TINTS[tone];
  return (
    <span
      style={{
        display: "inline-block",
        borderRadius: 999,
        padding: "3px 10px",
        fontSize: 12,
        fontWeight: 700,
        background: t.bg,
        color: t.color,
      }}
    >
      {children}
    </span>
  );
}

interface Kpi {
  label: string;
  value: string;
  delta: string;
  up: boolean;
  icon: string;
}

const KPIS: Kpi[] = [
  { label: "전체 학생 수", value: "1,284", delta: "+32 이번 주", up: true, icon: "👥" },
  { label: "오늘 인증 수", value: "3,917", delta: "+8.2% 어제 대비", up: true, icon: "🧩" },
  { label: "인증 성공률", value: "96.4%", delta: "+0.5%p", up: true, icon: "✅" },
  { label: "이상 행동 감지 수", value: "23", delta: "+5 오늘", up: false, icon: "🤖" },
];

interface Verify {
  student: string;
  klass: string;
  type: string;
  status: BadgeTone;
  statusLabel: string;
  time: string;
}

const RECENT: Verify[] = [
  { student: "김민서", klass: "2학년 1반", type: "이미지 선택", status: "success", statusLabel: "성공", time: "방금 전" },
  { student: "이준호", klass: "2학년 3반", type: "퍼즐 조각", status: "success", statusLabel: "성공", time: "1분 전" },
  { student: "박서연", klass: "1학년 2반", type: "행동 패턴", status: "danger", statusLabel: "이상 감지", time: "3분 전" },
  { student: "최우진", klass: "3학년 1반", type: "이미지 선택", status: "success", statusLabel: "성공", time: "4분 전" },
  { student: "정하늘", klass: "1학년 4반", type: "퍼즐 조각", status: "warn", statusLabel: "재시도", time: "6분 전" },
  { student: "강도윤", klass: "2학년 2반", type: "이미지 선택", status: "success", statusLabel: "성공", time: "8분 전" },
];

interface ClassProgress {
  name: string;
  teacher: string;
  pct: number;
}

const CLASSES: ClassProgress[] = [
  { name: "2학년 1반", teacher: "한지민 교사", pct: 92 },
  { name: "1학년 2반", teacher: "오세훈 교사", pct: 78 },
  { name: "3학년 1반", teacher: "윤가은 교사", pct: 64 },
  { name: "2학년 3반", teacher: "임채원 교사", pct: 88 },
  { name: "1학년 4반", teacher: "송민재 교사", pct: 41 },
];

interface AlertItem {
  title: string;
  desc: string;
  tone: BadgeTone;
  toneLabel: string;
  time: string;
}

const ALERTS: AlertItem[] = [
  { title: "비정상 인증 시도 급증", desc: "1학년 2반에서 동일 IP 다중 시도 감지", tone: "danger", toneLabel: "위험", time: "2026-06-30 09:14" },
  { title: "봇 의심 패턴", desc: "박서연 학생 계정 자동화 패턴 탐지", tone: "danger", toneLabel: "위험", time: "2026-06-30 08:52" },
  { title: "인증 지연 발생", desc: "퍼즐 조각 응답 시간 평소 대비 1.8배", tone: "warn", toneLabel: "주의", time: "2026-06-30 08:30" },
  { title: "신규 기기 로그인", desc: "강도윤 학생 새 기기에서 접속", tone: "warn", toneLabel: "주의", time: "2026-06-29 21:11" },
];

interface WeekPoint {
  day: string;
  value: number;
}

const WEEK: WeekPoint[] = [
  { day: "월", value: 62 },
  { day: "화", value: 74 },
  { day: "수", value: 81 },
  { day: "목", value: 69 },
  { day: "금", value: 95 },
  { day: "토", value: 38 },
  { day: "일", value: 44 },
];

export default function Home() {
  const maxWeek = Math.max(...WEEK.map((w) => w.value));

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: FONT, color: TEXT, padding: "28px 32px" }}>
      <style>{`
        .og-grid4 { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }
        .og-main { display:grid; grid-template-columns:2fr 1fr; gap:16px; align-items:start; }
        .og-sub { display:grid; grid-template-columns:1fr 1fr; gap:16px; align-items:start; }
        @media (max-width:880px){
          .og-grid4 { grid-template-columns:1fr 1fr; }
          .og-main { grid-template-columns:1fr; }
          .og-sub { grid-template-columns:1fr; }
        }
        @media (max-width:520px){
          .og-grid4 { grid-template-columns:1fr; }
        }
      `}</style>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: NAVY, letterSpacing: "-0.5px" }}>기관 대시보드</h1>
          <p style={{ margin: "6px 0 0", fontSize: 14, color: MUTED }}>실시간 CAPTCHA 인증 현황과 보안 상태를 한눈에 확인하세요</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ background: "#fff", color: NAVY, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "10px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            📋 리포트 내보내기
          </button>
          <button style={{ background: NAVY, color: "#fff", border: "none", borderRadius: 10, padding: "10px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            ⚙️ 인증 설정
          </button>
        </div>
      </div>

      <div className="og-grid4" style={{ marginBottom: 16 }}>
        {KPIS.map((k) => (
          <div key={k.label} style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, color: MUTED }}>{k.label}</span>
              <span style={{ fontSize: 18 }}>{k.icon}</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: NAVY, margin: "8px 0 4px" }}>{k.value}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: k.up ? GREEN : RED }}>
              {k.up ? "▲" : "▼"} {k.delta}
            </div>
          </div>
        ))}
      </div>

      <div className="og-main" style={{ marginBottom: 16 }}>
        <div style={cardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: NAVY }}>최근 CAPTCHA 인증 현황</h2>
            <span style={{ fontSize: 12, color: MUTED }}>자동 새로고침 · 5초</span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["학생", "학급", "유형", "상태", "시간"].map((h) => (
                    <th key={h} style={{ textAlign: "left", fontSize: 12, fontWeight: 700, color: MUTED, padding: "12px 14px", borderBottom: `1px solid ${BORDER}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {RECENT.map((r, i) => (
                  <tr key={i}>
                    <td style={{ padding: 14, fontSize: 14, borderBottom: "1px solid #f0f1f4", color: TEXT, fontWeight: 700 }}>{r.student}</td>
                    <td style={{ padding: 14, fontSize: 14, borderBottom: "1px solid #f0f1f4", color: MUTED }}>{r.klass}</td>
                    <td style={{ padding: 14, fontSize: 14, borderBottom: "1px solid #f0f1f4", color: TEXT }}>{r.type}</td>
                    <td style={{ padding: 14, fontSize: 14, borderBottom: "1px solid #f0f1f4" }}><Badge tone={r.status}>{r.statusLabel}</Badge></td>
                    <td style={{ padding: 14, fontSize: 14, borderBottom: "1px solid #f0f1f4", color: MUTED }}>{r.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={cardStyle}>
          <h2 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 800, color: NAVY }}>📈 주간 인증 추이</h2>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 160 }}>
            {WEEK.map((w) => (
              <div key={w.day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: NAVY, marginBottom: 4 }}>{w.value}</span>
                <div
                  style={{
                    width: "100%",
                    height: `${(w.value / maxWeek) * 130}px`,
                    background: w.value === maxWeek ? ACCENT : NAVY,
                    borderRadius: "6px 6px 0 0",
                  }}
                />
                <span style={{ fontSize: 12, color: MUTED, marginTop: 6 }}>{w.day}</span>
              </div>
            ))}
          </div>
          <p style={{ margin: "14px 0 0", fontSize: 12, color: MUTED }}>단위: 백 건 · 금요일 최고치 9,500건</p>
        </div>
      </div>

      <div className="og-sub">
        <div style={cardStyle}>
          <h2 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 800, color: NAVY }}>🏫 학급별 진행률</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {CLASSES.map((c) => (
              <div key={c.name}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>{c.name}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: c.pct >= 80 ? GREEN : c.pct >= 60 ? BLUE : RED }}>{c.pct}%</span>
                </div>
                <div style={{ fontSize: 12, color: MUTED, marginBottom: 6 }}>{c.teacher}</div>
                <div style={{ height: 8, background: "#eef1f5", borderRadius: 999, overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 999, background: ACCENT, width: `${c.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: NAVY }}>🔔 보안 알림</h2>
            <Badge tone="danger">{`${ALERTS.filter((a) => a.tone === "danger").length}건 위험`}</Badge>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {ALERTS.map((a, i) => (
              <div key={i} style={{ display: "flex", gap: 12, padding: 12, border: `1px solid ${BORDER}`, borderRadius: 10 }}>
                <span style={{ fontSize: 18 }}>{a.tone === "danger" ? "🛡️" : "⚠️"}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 700 }}>{a.title}</span>
                    <Badge tone={a.tone}>{a.toneLabel}</Badge>
                  </div>
                  <div style={{ fontSize: 13, color: MUTED, margin: "4px 0" }}>{a.desc}</div>
                  <div style={{ fontSize: 12, color: MUTED }}>{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
