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

type Status = "wait" | "approve" | "reject";

interface ReviewImage {
  id: string;
  file: string;
  emoji: string;
  tone: string;
  aiLabel: string;
  confidence: number;
  status: Status;
  risks: { label: string; flagged: boolean }[];
}

const IMAGES: ReviewImage[] = [
  { id: "img-1", file: "horse_field_01.png", emoji: "🐴", tone: "#e8f0fe", aiLabel: "동물 / 말", confidence: 97, status: "approve",
    risks: [{ label: "선정성", flagged: false }, { label: "폭력성", flagged: false }, { label: "개인정보 노출", flagged: false }] },
  { id: "img-2", file: "traffic_light_22.png", emoji: "🚦", tone: "#fef3e2", aiLabel: "사물 / 신호등", confidence: 71, status: "wait",
    risks: [{ label: "선정성", flagged: false }, { label: "흐릿한 이미지", flagged: true }, { label: "중복 이미지", flagged: false }] },
  { id: "img-3", file: "bicycle_07.png", emoji: "🚲", tone: "#e7f6ee", aiLabel: "사물 / 자전거", confidence: 88, status: "approve",
    risks: [{ label: "선정성", flagged: false }, { label: "폭력성", flagged: false }, { label: "저작권 의심", flagged: false }] },
  { id: "img-4", file: "unknown_blur_14.png", emoji: "🌫️", tone: "#fdeaea", aiLabel: "분류 불가", confidence: 42, status: "reject",
    risks: [{ label: "흐릿한 이미지", flagged: true }, { label: "분류 신뢰도 낮음", flagged: true }, { label: "노이즈 과다", flagged: true }] },
  { id: "img-5", file: "bus_side_30.png", emoji: "🚌", tone: "#e8f0fe", aiLabel: "사물 / 버스", confidence: 93, status: "wait",
    risks: [{ label: "선정성", flagged: false }, { label: "폭력성", flagged: false }, { label: "번호판 노출", flagged: true }] },
  { id: "img-6", file: "crosswalk_09.png", emoji: "🚸", tone: "#e7f6ee", aiLabel: "사물 / 횡단보도", confidence: 85, status: "wait",
    risks: [{ label: "선정성", flagged: false }, { label: "보행자 얼굴", flagged: true }, { label: "중복 이미지", flagged: false }] },
];

const cardStyle = { background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 20, boxShadow: "0 1px 3px rgba(16,24,40,0.06)" } as const;
const badgeBase = { display: "inline-block", borderRadius: 999, padding: "3px 10px", fontSize: 12, fontWeight: 700 } as const;

function statusBadge(s: Status) {
  if (s === "approve") return { ...badgeBase, background: "#e7f6ee", color: "#16794c" };
  if (s === "reject") return { ...badgeBase, background: "#fdeaea", color: "#c0392b" };
  return { ...badgeBase, background: "#fef3e2", color: "#b45309" };
}
function statusLabel(s: Status) {
  return s === "approve" ? "승인" : s === "reject" ? "반려" : "대기";
}

export default function ImageReview() {
  const tabs: { key: Status | "all"; label: string }[] = [
    { key: "all", label: "전체" },
    { key: "wait", label: "검수 대기" },
    { key: "approve", label: "승인" },
    { key: "reject", label: "반려" },
  ];
  const counts = {
    all: IMAGES.length,
    wait: IMAGES.filter((i) => i.status === "wait").length,
    approve: IMAGES.filter((i) => i.status === "approve").length,
    reject: IMAGES.filter((i) => i.status === "reject").length,
  };

  const [tab, setTab] = useState<Status | "all">("all");
  const [selectedId, setSelectedId] = useState<string>(IMAGES[0].id);
  const [memo, setMemo] = useState<string>("");

  const visible = IMAGES.filter((i) => tab === "all" || i.status === tab);
  const selected = IMAGES.find((i) => i.id === selectedId) ?? IMAGES[0];

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: FONT, color: TEXT, padding: "28px 32px" }}>
      <style>{`
        .ir-layout { display:grid; grid-template-columns:2fr 1fr; gap:20px; align-items:start; }
        .ir-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:16px; }
        .ir-card { transition:transform .12s ease, box-shadow .12s ease, border-color .12s ease; }
        .ir-card:hover { transform:translateY(-2px); box-shadow:0 6px 18px rgba(16,24,40,0.10); }
        .ir-btn:hover { filter:brightness(0.95); }
        .ir-tab:hover { color:${NAVY}; }
        @media (max-width:980px){ .ir-layout{ grid-template-columns:1fr; } }
        @media (max-width:880px){ .ir-grid{ grid-template-columns:1fr; } }
      `}</style>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: NAVY, letterSpacing: "-0.5px" }}>이미지 AI 검수</h1>
          <p style={{ margin: "6px 0 0", fontSize: 14, color: MUTED }}>AI가 자동 분류한 캡차 이미지를 검수하고 승인 또는 반려합니다.</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="ir-btn" style={{ background: "#fff", color: NAVY, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "10px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>🔄 재검수 요청</button>
          <button className="ir-btn" style={{ background: NAVY, color: "#fff", border: "none", borderRadius: 10, padding: "10px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>📦 일괄 승인</button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20, borderBottom: `1px solid ${BORDER}` }}>
        {tabs.map((t) => {
          const active = tab === t.key;
          const c = counts[t.key];
          return (
            <button key={t.key} className="ir-tab" onClick={() => setTab(t.key)}
              style={{ background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 14, padding: "10px 14px",
                color: active ? NAVY : MUTED, fontWeight: active ? 700 : 500, borderBottom: active ? `2px solid ${NAVY}` : "2px solid transparent" }}>
              {t.label}
              <span style={{ ...badgeBase, marginLeft: 8, background: active ? "#e8f0fe" : "#eef1f5", color: active ? "#1d4ed8" : "#52606d" }}>{c}</span>
            </button>
          );
        })}
      </div>

      <div className="ir-layout">
        <div className="ir-grid">
          {visible.map((img) => {
            const isSel = img.id === selectedId;
            return (
              <div key={img.id} className="ir-card" onClick={() => setSelectedId(img.id)}
                style={{ ...cardStyle, padding: 16, cursor: "pointer", border: isSel ? `2px solid ${NAVY}` : `1px solid ${BORDER}` }}>
                <div style={{ height: 130, borderRadius: 10, background: img.tone, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 52, marginBottom: 12 }}>{img.emoji}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: NAVY, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{img.file}</span>
                  <span style={statusBadge(img.status)}>{statusLabel(img.status)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                  <span style={{ fontSize: 13, color: MUTED }}>🤖 {img.aiLabel}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: img.confidence >= 80 ? GREEN : img.confidence >= 60 ? ORANGE : RED }}>{img.confidence}%</span>
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                  <button className="ir-btn" onClick={(e) => e.stopPropagation()}
                    style={{ flex: 1, background: ACCENT, color: "#fff", border: "none", borderRadius: 10, padding: "8px 0", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>✅ 승인</button>
                  <button className="ir-btn" onClick={(e) => e.stopPropagation()}
                    style={{ flex: 1, background: RED, color: "#fff", border: "none", borderRadius: 10, padding: "8px 0", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>⚠️ 반려</button>
                </div>
              </div>
            );
          })}
          {visible.length === 0 && (
            <div style={{ ...cardStyle, gridColumn: "1 / -1", textAlign: "center", color: MUTED }}>해당 상태의 이미지가 없습니다.</div>
          )}
        </div>

        <div style={{ ...cardStyle, position: "sticky", top: 20 }}>
          <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 800, color: NAVY }}>검수 결과 패널</h3>
          <p style={{ margin: "0 0 16px", fontSize: 13, color: MUTED }}>{selected.file}</p>

          <div style={{ height: 150, borderRadius: 10, background: selected.tone, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 64, marginBottom: 16 }}>{selected.emoji}</div>

          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 13, color: MUTED }}>AI 분류</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>{selected.aiLabel}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 13, color: MUTED }}>신뢰도</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>{selected.confidence}%</span>
          </div>
          <div style={{ height: 8, background: "#eef1f5", borderRadius: 999, overflow: "hidden", marginBottom: 18 }}>
            <div style={{ height: "100%", borderRadius: 999, background: ACCENT, width: `${selected.confidence}%` }} />
          </div>

          <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 10 }}>위험 요소 체크리스트</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
            {selected.risks.map((r) => (
              <div key={r.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: TEXT }}>{r.flagged ? "⚠️" : "✅"} {r.label}</span>
                <span style={{ ...badgeBase, background: r.flagged ? "#fdeaea" : "#e7f6ee", color: r.flagged ? "#c0392b" : "#16794c" }}>{r.flagged ? "감지" : "정상"}</span>
              </div>
            ))}
          </div>

          <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 8 }}>검수자 메모</div>
          <textarea value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="검수 의견을 입력하세요..."
            style={{ width: "100%", boxSizing: "border-box", minHeight: 80, padding: "10px 12px", border: `1px solid ${BORDER}`, borderRadius: 10, fontSize: 13, fontFamily: "inherit", resize: "vertical", marginBottom: 14 }} />

          <div style={{ display: "flex", gap: 8 }}>
            <button className="ir-btn" style={{ flex: 1, background: ACCENT, color: "#fff", border: "none", borderRadius: 10, padding: "10px 0", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>승인</button>
            <button className="ir-btn" style={{ flex: 1, background: RED, color: "#fff", border: "none", borderRadius: 10, padding: "10px 0", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>반려</button>
          </div>
        </div>
      </div>
    </div>
  );
}
