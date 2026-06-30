import { useState } from 'react';

const FONT = "'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
const NAVY = "#1e3a5f";
const ACCENT = "#4a9b8e";
const GREEN = "#16a34a";
const ORANGE = "#f59e0b";
const RED = "#e5484d";
const BG = "#f4f5f7";
const CARD = "#ffffff";
const BORDER = "#e6e8ec";
const TEXT = "#1e293b";
const MUTED = "#64748b";

const cardStyle = { background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 20, boxShadow: "0 1px 3px rgba(16,24,40,0.06)" } as const;
const primaryBtn = { background: NAVY, color: "#fff", border: "none", borderRadius: 10, padding: "10px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" } as const;
const secondaryBtn = { background: "#fff", color: NAVY, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "10px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" } as const;
const numInput = { padding: "9px 12px", border: `1px solid ${BORDER}`, borderRadius: 10, fontSize: 14, fontFamily: "inherit", width: 100, color: TEXT } as const;

type Diff = "쉬움" | "보통" | "어려움";
interface TypeOpt { id: string; label: string; }

const DIFFS: Diff[] = ["쉬움", "보통", "어려움"];
const TYPE_OPTS: TypeOpt[] = [
  { id: "count", label: "수 세기" },
  { id: "shape", label: "모양·색" },
  { id: "hangul", label: "한글" },
  { id: "safety", label: "안전" },
  { id: "drag", label: "드래그" },
];

const DEFAULTS = {
  difficulty: "보통" as Diff,
  types: ["count", "shape"],
  timeLimit: 30,
  retries: 3,
  sensitivity: 60,
};

const diffColor = (d: Diff) => (d === "쉬움" ? GREEN : d === "보통" ? ORANGE : RED);

export default function CaptchaConfig() {
  const [difficulty, setDifficulty] = useState<Diff>(DEFAULTS.difficulty);
  const [types, setTypes] = useState<string[]>(DEFAULTS.types);
  const [timeLimit, setTimeLimit] = useState<number>(DEFAULTS.timeLimit);
  const [retries, setRetries] = useState<number>(DEFAULTS.retries);
  const [sensitivity, setSensitivity] = useState<number>(DEFAULTS.sensitivity);
  const [saved, setSaved] = useState<boolean>(false);

  const toggleType = (id: string) => {
    setSaved(false);
    setTypes((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const reset = () => {
    setDifficulty(DEFAULTS.difficulty);
    setTypes(DEFAULTS.types);
    setTimeLimit(DEFAULTS.timeLimit);
    setRetries(DEFAULTS.retries);
    setSensitivity(DEFAULTS.sensitivity);
    setSaved(false);
  };

  const typeLabels = TYPE_OPTS.filter((t) => types.includes(t.id)).map((t) => t.label);
  const sensLabel = sensitivity >= 75 ? "높음" : sensitivity >= 45 ? "보통" : "낮음";

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: FONT, color: TEXT, padding: "28px 32px" }}>
      <style>{`
        .cc-grid { display:grid; grid-template-columns:2fr 1fr; gap:20px; align-items:start; }
        .cc-range { width:100%; accent-color:${ACCENT}; }
        @media (max-width:880px){ .cc-grid{ grid-template-columns:1fr; } }
      `}</style>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: NAVY, letterSpacing: "-0.5px" }}>🧩 CAPTCHA 설정</h1>
          <p style={{ margin: "6px 0 0", fontSize: 14, color: MUTED }}>학생에게 제공되는 인증 문제의 난이도와 동작 방식을 설정합니다.</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={secondaryBtn} onClick={reset}>기본값으로 초기화</button>
          <button style={primaryBtn} onClick={() => setSaved(true)}>저장</button>
        </div>
      </div>

      <div className="cc-grid">
        <div style={cardStyle}>
          {/* 난이도 */}
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: NAVY, marginBottom: 4 }}>난이도</div>
            <div style={{ fontSize: 12, color: MUTED, marginBottom: 10 }}>문제의 전반적인 복잡도를 결정합니다.</div>
            <div style={{ display: "inline-flex", border: `1px solid ${BORDER}`, borderRadius: 10, overflow: "hidden" }}>
              {DIFFS.map((d) => {
                const active = difficulty === d;
                return (
                  <button
                    key={d}
                    onClick={() => { setDifficulty(d); setSaved(false); }}
                    style={{ border: "none", padding: "9px 20px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", background: active ? NAVY : "#fff", color: active ? "#fff" : MUTED }}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 문제 유형 */}
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: NAVY, marginBottom: 4 }}>문제 유형</div>
            <div style={{ fontSize: 12, color: MUTED, marginBottom: 10 }}>출제할 문제 유형을 하나 이상 선택하세요.</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {TYPE_OPTS.map((t) => {
                const on = types.includes(t.id);
                return (
                  <label key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, cursor: "pointer", padding: "8px 12px", border: `1px solid ${on ? ACCENT : BORDER}`, borderRadius: 10, background: on ? "#f3faf9" : "#fff" }}>
                    <input type="checkbox" checked={on} onChange={() => toggleType(t.id)} style={{ width: 16, height: 16, accentColor: ACCENT }} />
                    <span style={{ fontWeight: 600, color: TEXT }}>{t.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* 제한 시간 */}
          <div style={{ marginBottom: 22 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>제한 시간</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: ACCENT }}>{timeLimit}초</span>
            </div>
            <input className="cc-range" type="range" min={10} max={120} step={5} value={timeLimit} onChange={(e) => { setTimeLimit(Number(e.target.value)); setSaved(false); }} />
          </div>

          {/* 재시도 횟수 */}
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: NAVY, marginBottom: 4 }}>재시도 횟수</div>
            <div style={{ fontSize: 12, color: MUTED, marginBottom: 10 }}>실패 시 다시 시도할 수 있는 최대 횟수입니다.</div>
            <input type="number" min={1} max={10} value={retries} onChange={(e) => { setRetries(Number(e.target.value)); setSaved(false); }} style={numInput} /> <span style={{ fontSize: 13, color: MUTED }}>회</span>
          </div>

          {/* 봇 차단 민감도 */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>봇 차단 민감도</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: ACCENT }}>{sensitivity} · {sensLabel}</span>
            </div>
            <input className="cc-range" type="range" min={0} max={100} step={5} value={sensitivity} onChange={(e) => { setSensitivity(Number(e.target.value)); setSaved(false); }} />
            <div style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>높을수록 자동화 트래픽을 강하게 차단하지만 오탐이 늘 수 있습니다.</div>
          </div>
        </div>

        {/* 현재 설정 요약 */}
        <div style={{ ...cardStyle, position: "sticky", top: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: NAVY, marginBottom: 14 }}>⚙️ 현재 설정 요약</div>

          {saved && (
            <div style={{ background: "#e7f6ee", color: "#16794c", borderRadius: 10, padding: "8px 12px", fontSize: 13, fontWeight: 700, marginBottom: 14 }}>✅ 설정이 저장되었습니다.</div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <div style={{ fontSize: 12, color: MUTED }}>난이도</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: diffColor(difficulty) }}>{difficulty}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: MUTED, marginBottom: 6 }}>문제 유형 ({typeLabels.length})</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {typeLabels.length === 0 ? (
                  <span style={{ fontSize: 13, color: RED, fontWeight: 600 }}>유형을 1개 이상 선택하세요</span>
                ) : typeLabels.map((l) => (
                  <span key={l} style={{ display: "inline-block", borderRadius: 999, padding: "3px 10px", fontSize: 12, fontWeight: 700, background: "#eef1f5", color: "#52606d" }}>{l}</span>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: 24 }}>
              <div>
                <div style={{ fontSize: 12, color: MUTED }}>제한 시간</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: NAVY }}>{timeLimit}<span style={{ fontSize: 12, color: MUTED }}>초</span></div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: MUTED }}>재시도</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: NAVY }}>{retries}<span style={{ fontSize: 12, color: MUTED }}>회</span></div>
              </div>
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: MUTED, marginBottom: 5 }}>
                <span>봇 차단 민감도</span><span>{sensLabel}</span>
              </div>
              <div style={{ height: 8, background: "#eef1f5", borderRadius: 999, overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: 999, background: ACCENT, width: `${sensitivity}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
