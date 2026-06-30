import { useState } from 'react';

const FONT = "'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
const NAVY = "#1e3a5f";
const ACCENT = "#4a9b8e";
const BLUE = "#2f6df6";
const GREEN = "#16a34a";
const ORANGE = "#f59e0b";
const BG = "#f4f5f7";
const CARD = "#ffffff";
const BORDER = "#e6e8ec";
const TEXT = "#1e293b";
const MUTED = "#64748b";

const cardStyle = { background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 20, boxShadow: "0 1px 3px rgba(16,24,40,0.06)" } as const;
const primaryBtn = { background: NAVY, color: "#fff", border: "none", borderRadius: 10, padding: "10px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" } as const;
const accentBtn = { ...primaryBtn, background: ACCENT } as const;
const secondaryBtn = { background: "#fff", color: NAVY, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "10px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" } as const;
const selectStyle = { padding: "9px 12px", border: `1px solid ${BORDER}`, borderRadius: 10, fontSize: 14, fontFamily: "inherit", background: "#fff", color: TEXT } as const;

type Diff = "쉬움" | "보통" | "어려움";
interface Student { id: string; name: string; cls: string; weak: string[]; }
interface Reco {
  id: string;
  title: string;
  category: string;
  diff: Diff;
  effect: number;
  match: number;
  reason: string;
}

const STUDENTS: Student[] = [
  { id: "s1", name: "김민서", cls: "1-2반", weak: ["수 세기 정확도", "도형 인식"] },
  { id: "s2", name: "이준호", cls: "1-2반", weak: ["한글 받침", "반응 속도"] },
  { id: "s3", name: "박서연", cls: "2-1반", weak: ["색 구분", "드래그 조작"] },
  { id: "s4", name: "정하윤", cls: "2-1반", weak: ["수 세기 정확도", "안전 판단"] },
];

const CLASSES = ["1-2반", "2-1반", "2-3반"];

const RECOS: Reco[] = [
  { id: "r1", title: "사과 개수 세기 (1~10)", category: "수 세기", diff: "쉬움", effect: 24, match: 92, reason: "이 학생은 수 세기 정확도가 평균보다 18% 낮아 기초 보강이 필요합니다." },
  { id: "r2", title: "같은 모양 찾기 — 삼각형", category: "모양·색", diff: "보통", effect: 19, match: 87, reason: "도형 인식 정답률이 최근 3회 인증에서 연속 하락해 시각 변별 훈련을 추천합니다." },
  { id: "r3", title: "숫자 순서대로 잇기", category: "수 세기", diff: "보통", effect: 16, match: 81, reason: "수 세기는 가능하나 순서 배열 과제의 평균 응답 시간이 1.6배 길어 보완이 필요합니다." },
  { id: "r4", title: "위험 표지판 고르기", category: "안전", diff: "어려움", effect: 12, match: 74, reason: "안전 판단 영역 미경험 문항이 많아 난이도 상향 전 점진적 노출을 권장합니다." },
];

const diffColor = (d: Diff) => (d === "쉬움" ? GREEN : d === "보통" ? ORANGE : "#e5484d");

function Badge({ text, bg, color }: { text: string; bg: string; color: string }) {
  return <span style={{ display: "inline-block", borderRadius: 999, padding: "3px 10px", fontSize: 12, fontWeight: 700, background: bg, color }}>{text}</span>;
}

export default function RecommendAI() {
  const [cls, setCls] = useState<string>(CLASSES[0]);
  const [studentId, setStudentId] = useState<string>(STUDENTS[0].id);
  const [applied, setApplied] = useState<string[]>([]);

  const classStudents = STUDENTS.filter((s) => s.cls === cls);
  const selected = STUDENTS.find((s) => s.id === studentId) ?? classStudents[0] ?? STUDENTS[0];

  const onClass = (c: string) => {
    setCls(c);
    const first = STUDENTS.find((s) => s.cls === c);
    if (first) setStudentId(first.id);
  };

  const toggleApply = (id: string) => {
    setApplied((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: FONT, color: TEXT, padding: "28px 32px" }}>
      <style>{`
        .rai-top { display:grid; grid-template-columns:2fr 1fr; gap:20px; margin-bottom:20px; }
        .rai-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:16px; }
        .rai-card { transition:all .15s ease; }
        .rai-card:hover { box-shadow:0 6px 18px rgba(16,24,40,0.10); transform:translateY(-2px); }
        @media (max-width:880px){ .rai-top{ grid-template-columns:1fr; } .rai-grid{ grid-template-columns:1fr; } }
      `}</style>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: NAVY, letterSpacing: "-0.5px" }}>🤖 취약 문제 추천 AI</h1>
          <p style={{ margin: "6px 0 0", fontSize: 14, color: MUTED }}>학생 인증 데이터를 분석해 보강이 필요한 문제를 AI가 자동으로 추천합니다.</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Badge text="AI 베타" bg="#e8f0fe" color="#1d4ed8" />
        </div>
      </div>

      <div className="rai-top">
        <div style={cardStyle}>
          <div style={{ fontSize: 13, fontWeight: 700, color: MUTED, marginBottom: 12 }}>추천 대상 선택</div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12, color: MUTED }}>
              학급
              <select style={selectStyle} value={cls} onChange={(e) => onClass(e.target.value)}>
                {CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12, color: MUTED }}>
              학생
              <select style={selectStyle} value={studentId} onChange={(e) => setStudentId(e.target.value)}>
                {classStudents.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </label>
          </div>
          <p style={{ margin: "14px 0 0", fontSize: 13, color: MUTED, lineHeight: 1.6 }}>
            대상을 변경하면 해당 학생의 최근 인증 기록을 기반으로 추천 결과가 갱신됩니다.
          </p>
        </div>

        <div style={{ ...cardStyle, background: "linear-gradient(135deg,#1e3a5f,#2f6df6)", color: "#fff", border: "none" }}>
          <div style={{ fontSize: 13, fontWeight: 700, opacity: 0.85, marginBottom: 8 }}>추천 대상</div>
          <div style={{ fontSize: 22, fontWeight: 800 }}>{selected.name}</div>
          <div style={{ fontSize: 13, opacity: 0.85, marginTop: 2 }}>{selected.cls}</div>
          <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.85, margin: "16px 0 8px" }}>취약 영역</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {selected.weak.map((w) => (
              <span key={w} style={{ display: "inline-block", borderRadius: 999, padding: "4px 11px", fontSize: 12, fontWeight: 700, background: "rgba(255,255,255,0.18)", color: "#fff" }}>{w}</span>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "8px 0 14px" }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: NAVY }}>추천 문제 {RECOS.length}건</div>
        <span style={{ fontSize: 12, color: MUTED }}>매칭 점수 높은 순</span>
      </div>

      <div className="rai-grid">
        {RECOS.map((r) => {
          const isApplied = applied.includes(r.id);
          return (
            <div key={r.id} className="rai-card" style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: NAVY }}>{r.title}</div>
                <Badge text={r.category} bg="#eef1f5" color="#52606d" />
              </div>

              <div style={{ display: "flex", gap: 18, margin: "14px 0", flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: 12, color: MUTED }}>난이도</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: diffColor(r.diff) }}>{r.diff}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: MUTED }}>예상 효과</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: GREEN }}>+{r.effect}%</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: MUTED }}>매칭 점수</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: BLUE }}>{r.match}점</div>
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: MUTED, marginBottom: 5 }}>
                  <span>매칭 신뢰도</span><span>{r.match}%</span>
                </div>
                <div style={{ height: 8, background: "#eef1f5", borderRadius: 999, overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 999, background: ACCENT, width: `${r.match}%` }} />
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, alignItems: "flex-start", background: "#f7faf9", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "10px 12px", marginBottom: 14 }}>
                <span style={{ fontSize: 14 }}>💡</span>
                <span style={{ fontSize: 13, color: TEXT, lineHeight: 1.5 }}><strong style={{ color: ACCENT }}>추천 사유 </strong>{r.reason}</span>
              </div>

              <button style={isApplied ? secondaryBtn : accentBtn} onClick={() => toggleApply(r.id)}>
                {isApplied ? "✓ 적용됨 (해제)" : "추천 적용"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
