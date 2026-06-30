import { useState } from "react";

const FONT = "'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
const NAVY = "#1e3a5f";
const ACCENT = "#4a9b8e";
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

const inputStyle = {
  padding: "9px 12px",
  border: `1px solid ${BORDER}`,
  borderRadius: 10,
  fontSize: 14,
  fontFamily: "inherit",
  width: "100%",
  boxSizing: "border-box",
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

type RoleKey = "admin" | "teacher" | "developer" | "viewer";

interface RoleOption {
  key: RoleKey;
  label: string;
  desc: string;
  tone: BadgeTone;
}

const ROLES: RoleOption[] = [
  { key: "admin", label: "관리자", desc: "멤버 초대, 권한 변경 등 모든 설정에 접근할 수 있습니다.", tone: "info" },
  { key: "teacher", label: "교사", desc: "담당 학급과 학생의 인증 현황을 조회·관리합니다.", tone: "success" },
  { key: "developer", label: "개발자", desc: "API 키와 연동 설정, 로그를 확인할 수 있습니다.", tone: "warn" },
  { key: "viewer", label: "뷰어", desc: "대시보드와 리포트를 읽기 전용으로만 볼 수 있습니다.", tone: "neutral" },
];

const ORG_NAME = "서울중앙고등학교";

export default function InviteMember() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<RoleKey>("teacher");
  const [message, setMessage] = useState("");

  const selectedRole = ROLES.find((r) => r.key === role) as RoleOption;
  const previewEmail = email.trim() || "초대할 이메일을 입력하세요";
  const hasEmail = email.trim().length > 0;

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: FONT, color: TEXT, padding: "28px 32px" }}>
      <style>{`
        .oi-grid { display:grid; grid-template-columns:2fr 1fr; gap:16px; align-items:start; }
        @media (max-width:880px){ .oi-grid { grid-template-columns:1fr; } }
      `}</style>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: NAVY, letterSpacing: "-0.5px" }}>멤버 초대</h1>
          <p style={{ margin: "6px 0 0", fontSize: 14, color: MUTED }}>새 구성원을 {ORG_NAME} 워크스페이스로 초대하세요</p>
        </div>
      </div>

      <div className="oi-grid">
        <div style={cardStyle}>
          <h2 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 800, color: NAVY }}>초대 정보</h2>
          <p style={{ margin: "0 0 20px", fontSize: 13, color: MUTED }}>이메일과 역할을 입력하면 초대 메일이 발송됩니다.</p>

          <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 8 }}>이메일 주소</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@school.ac.kr"
            style={inputStyle}
          />
          <p style={{ margin: "8px 0 24px", fontSize: 12, color: MUTED }}>쉼표(,)로 구분하여 여러 명을 한 번에 초대할 수 있습니다.</p>

          <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 10 }}>역할 선택</label>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
            {ROLES.map((r) => {
              const active = r.key === role;
              return (
                <label
                  key={r.key}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    padding: 14,
                    border: `1px solid ${active ? NAVY : BORDER}`,
                    borderRadius: 10,
                    cursor: "pointer",
                    background: active ? "#f5f8fc" : "#fff",
                  }}
                >
                  <input
                    type="radio"
                    name="role"
                    checked={active}
                    onChange={() => setRole(r.key)}
                    style={{ marginTop: 3, accentColor: NAVY }}
                  />
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 700 }}>{r.label}</span>
                      <Badge tone={r.tone}>{r.label}</Badge>
                    </div>
                    <div style={{ fontSize: 13, color: MUTED, marginTop: 4 }}>{r.desc}</div>
                  </div>
                </label>
              );
            })}
          </div>

          <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 8 }}>초대 메시지 (선택)</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="초대받는 분에게 전할 메시지를 입력하세요."
            rows={4}
            style={{ ...inputStyle, resize: "vertical" }}
          />

          <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
            <button
              disabled={!hasEmail}
              style={{
                background: hasEmail ? NAVY : "#aeb7c2",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                padding: "10px 18px",
                fontSize: 14,
                fontWeight: 700,
                cursor: hasEmail ? "pointer" : "not-allowed",
                fontFamily: "inherit",
              }}
            >
              ✉️ 초대 보내기
            </button>
            <button style={{ background: "#fff", color: NAVY, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "10px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              취소
            </button>
          </div>
        </div>

        <div style={cardStyle}>
          <h2 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 800, color: NAVY }}>초대 미리보기</h2>

          <div style={{ border: `1px solid ${BORDER}`, borderRadius: 12, padding: 16, background: "#fafbfc" }}>
            <div style={{ fontSize: 12, color: MUTED, marginBottom: 4 }}>받는 사람</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: hasEmail ? TEXT : MUTED, wordBreak: "break-all", marginBottom: 16 }}>{previewEmail}</div>

            <div style={{ fontSize: 12, color: MUTED, marginBottom: 6 }}>부여될 역할</div>
            <div style={{ marginBottom: 16 }}><Badge tone={selectedRole.tone}>{selectedRole.label}</Badge></div>

            <div style={{ fontSize: 12, color: MUTED, marginBottom: 4 }}>초대 기관</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <span style={{ width: 28, height: 28, borderRadius: 8, background: ACCENT, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🏫</span>
              <span style={{ fontSize: 14, fontWeight: 700 }}>{ORG_NAME}</span>
            </div>

            {message.trim() && (
              <>
                <div style={{ fontSize: 12, color: MUTED, marginBottom: 4 }}>메시지</div>
                <div style={{ fontSize: 13, color: TEXT, whiteSpace: "pre-wrap", borderLeft: `3px solid ${BORDER}`, paddingLeft: 10 }}>{message}</div>
              </>
            )}
          </div>

          <p style={{ margin: "14px 0 0", fontSize: 12, color: MUTED, lineHeight: 1.5 }}>
            초대 링크는 발송 후 7일간 유효하며, {selectedRole.label} 권한으로 워크스페이스에 참여하게 됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
