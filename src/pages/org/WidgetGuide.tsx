import { useState } from 'react';

const FONT = "'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
const NAVY = "#1e3a5f";
const ACCENT = "#4a9b8e";
const GREEN = "#16a34a";
const BG = "#f4f5f7";
const CARD = "#ffffff";
const BORDER = "#e6e8ec";
const TEXT = "#1e293b";
const MUTED = "#64748b";

interface Step {
  id: number;
  title: string;
  desc: string;
  done: boolean;
  code?: string;
}

const STEPS: Step[] = [
  { id: 1, title: "도메인 등록", desc: "사이트 연동 메뉴에서 위젯을 설치할 도메인을 먼저 등록합니다.", done: true },
  { id: 2, title: "공개키 발급", desc: "도메인 등록이 완료되면 사이트 전용 공개키(data-site-key)가 발급됩니다.", done: true },
  { id: 3, title: "스크립트 삽입", desc: "발급받은 공개키가 포함된 스크립트를 페이지 </body> 직전에 붙여넣습니다.", done: false, code: `<script src="https://cdn.catchap.kr/widget.js" data-site-key="pk_live_a1b2c3"></script>` },
  { id: 4, title: "동작 확인", desc: "사이트를 새로고침해 위젯 버튼이 노출되고 대시보드에 연결됨으로 표시되는지 확인합니다.", done: false },
];

interface CheckItem {
  id: string;
  label: string;
}

const CHECK_ITEMS: CheckItem[] = [
  { id: "c1", label: "도메인이 사이트 연동 목록에 등록되어 있다" },
  { id: "c2", label: "공개키(data-site-key)를 올바르게 복사했다" },
  { id: "c3", label: "스크립트를 </body> 직전에 삽입했다" },
  { id: "c4", label: "배포(빌드) 후 운영 사이트에 반영했다" },
  { id: "c5", label: "위젯 버튼이 정상적으로 노출된다" },
];

export default function WidgetGuide() {
  const [checked, setChecked] = useState<Record<string, boolean>>({ c1: true, c2: true });

  const toggle = (id: string) => setChecked(prev => ({ ...prev, [id]: !prev[id] }));
  const doneCount = CHECK_ITEMS.filter(i => checked[i.id]).length;

  const cardStyle: React.CSSProperties = { background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 20, boxShadow: "0 1px 3px rgba(16,24,40,0.06)" };
  const primaryBtn: React.CSSProperties = { background: NAVY, color: "#fff", border: "none", borderRadius: 10, padding: "10px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" };

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: FONT, color: TEXT, padding: "28px 32px" }}>
      <style>{`
        .wg-grid { display:grid; grid-template-columns:1.6fr 1fr; gap:20px; align-items:start; }
        @media (max-width:880px){ .wg-grid{ grid-template-columns:1fr; } }
      `}</style>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: NAVY, letterSpacing: "-0.5px" }}>위젯 설치 안내</h1>
          <p style={{ margin: "6px 0 0", fontSize: 14, color: MUTED }}>아래 단계를 따라 사이트에 캣챱 위젯을 설치하세요.</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={primaryBtn} onClick={() => undefined}>📋 설치 코드 보기</button>
        </div>
      </div>

      <div className="wg-grid">
        <div style={cardStyle}>
          <h2 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 800, color: NAVY }}>설치 단계</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {STEPS.map((s, idx) => (
              <div key={s.id} style={{ display: "flex", gap: 14, position: "relative", paddingBottom: idx === STEPS.length - 1 ? 0 : 22 }}>
                {idx !== STEPS.length - 1 && (
                  <div style={{ position: "absolute", left: 17, top: 36, bottom: 0, width: 2, background: s.done ? ACCENT : BORDER }} />
                )}
                <div style={{
                  flexShrink: 0, width: 36, height: 36, borderRadius: "50%",
                  background: s.done ? ACCENT : "#fff", color: s.done ? "#fff" : NAVY,
                  border: s.done ? "none" : `2px solid ${BORDER}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 800, fontSize: 15, zIndex: 1,
                }}>
                  {s.done ? "✓" : s.id}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: NAVY }}>{s.title}</span>
                    <span style={{
                      display: "inline-block", borderRadius: 999, padding: "2px 9px", fontSize: 11, fontWeight: 700,
                      background: s.done ? "#e7f6ee" : "#eef1f5", color: s.done ? "#16794c" : "#52606d",
                    }}>{s.done ? "완료" : "진행 전"}</span>
                  </div>
                  <p style={{ margin: "6px 0 0", fontSize: 13, color: MUTED, lineHeight: 1.5 }}>{s.desc}</p>
                  {s.code && (
                    <pre style={{
                      margin: "10px 0 0", background: "#0f172a", color: "#e2e8f0", borderRadius: 10,
                      padding: "12px 14px", fontSize: 12.5, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                      overflowX: "auto", lineHeight: 1.5,
                    }}>{s.code}</pre>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: NAVY }}>설치 체크리스트</h2>
            <span style={{ fontSize: 13, fontWeight: 700, color: doneCount === CHECK_ITEMS.length ? GREEN : MUTED }}>{doneCount}/{CHECK_ITEMS.length}</span>
          </div>
          <p style={{ margin: "0 0 14px", fontSize: 13, color: MUTED }}>설치 전 모든 항목을 확인하세요.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {CHECK_ITEMS.map(item => {
              const on = !!checked[item.id];
              return (
                <label key={item.id} style={{
                  display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer",
                  padding: "10px 12px", borderRadius: 10, border: `1px solid ${on ? "#cdeadf" : BORDER}`,
                  background: on ? "#f3fbf7" : "#fff",
                }}>
                  <input type="checkbox" checked={on} onChange={() => toggle(item.id)} style={{ width: 17, height: 17, marginTop: 1, accentColor: ACCENT, cursor: "pointer" }} />
                  <span style={{ fontSize: 13.5, color: on ? NAVY : TEXT, textDecoration: on ? "line-through" : "none", lineHeight: 1.45 }}>{item.label}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
