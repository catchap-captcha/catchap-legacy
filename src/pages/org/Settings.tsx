import { useState } from 'react';

const FONT = "'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
const NAVY = "#1e3a5f";
const ACCENT = "#4a9b8e";
const BG = "#f4f5f7";
const CARD = "#ffffff";
const BORDER = "#e6e8ec";
const TEXT = "#1e293b";
const MUTED = "#64748b";

type ToggleProps = { on: boolean; onToggle: () => void };

function Toggle({ on, onToggle }: ToggleProps) {
  return (
    <div
      role="switch"
      aria-checked={on}
      onClick={onToggle}
      style={{
        width: 46,
        height: 26,
        borderRadius: 999,
        background: on ? ACCENT : "#cbd5e1",
        cursor: "pointer",
        padding: 3,
        boxSizing: "border-box",
        transition: "background .18s ease",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: "#fff",
          boxShadow: "0 1px 2px rgba(16,24,40,0.25)",
          transform: on ? "translateX(20px)" : "translateX(0)",
          transition: "transform .18s ease",
        }}
      />
    </div>
  );
}

export default function Settings() {
  const [securityAlert, setSecurityAlert] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(true);
  const [systemNotice, setSystemNotice] = useState(false);
  const [twoFactor, setTwoFactor] = useState(true);
  const [sessionTtl, setSessionTtl] = useState("60");
  const [orgType, setOrgType] = useState("school");

  const card = {
    background: CARD,
    border: `1px solid ${BORDER}`,
    borderRadius: 14,
    padding: 24,
    boxShadow: "0 1px 3px rgba(16,24,40,0.06)",
  } as const;

  const label = { display: "block", fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 7 } as const;
  const field = {
    width: "100%",
    padding: "10px 12px",
    border: `1px solid ${BORDER}`,
    borderRadius: 10,
    fontSize: 14,
    fontFamily: "inherit",
    color: TEXT,
    background: "#fff",
    boxSizing: "border-box" as const,
  };

  const sectionTitle = (icon: string, title: string, desc: string) => (
    <div style={{ marginBottom: 18 }}>
      <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: NAVY }}>{icon} {title}</h2>
      <p style={{ margin: "4px 0 0", fontSize: 13, color: MUTED }}>{desc}</p>
    </div>
  );

  const toggleRow = (title: string, desc: string, on: boolean, onToggle: () => void) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: `1px solid #f0f1f4` }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>{title}</div>
        <div style={{ fontSize: 12, color: MUTED, marginTop: 3 }}>{desc}</div>
      </div>
      <Toggle on={on} onToggle={onToggle} />
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: FONT, color: TEXT, padding: "28px 32px" }}>
      <style>{`
        .se-grid2 { display:grid; grid-template-columns:repeat(2,1fr); gap:16px; }
        .se-grid3 { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
        @media (max-width: 880px) {
          .se-grid2 { grid-template-columns:1fr; }
          .se-grid3 { grid-template-columns:1fr; }
        }
      `}</style>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: NAVY, letterSpacing: "-0.5px" }}>기관 설정</h1>
          <p style={{ margin: "6px 0 0", fontSize: 14, color: MUTED }}>기관 정보, 관리자, 알림 및 보안 정책을 관리합니다.</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ background: "#fff", color: NAVY, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "10px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            취소
          </button>
          <button style={{ background: NAVY, color: "#fff", border: "none", borderRadius: 10, padding: "10px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            💾 저장
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 980 }}>
        {/* 기관 정보 */}
        <div style={card}>
          {sectionTitle("🏫", "기관 정보", "기관의 기본 식별 정보입니다.")}
          <div className="se-grid2">
            <div>
              <label style={label}>기관명</label>
              <input style={field} defaultValue="서울중앙초등학교" />
            </div>
            <div>
              <label style={label}>기관 유형</label>
              <select style={field} value={orgType} onChange={(e) => setOrgType(e.target.value)}>
                <option value="school">초·중·고등학교</option>
                <option value="academy">학원</option>
                <option value="univ">대학</option>
                <option value="public">공공기관</option>
                <option value="company">기업</option>
              </select>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={label}>주소</label>
              <input style={field} defaultValue="서울특별시 종로구 세종대로 110" />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={label}>대표 이메일</label>
              <input style={field} type="email" defaultValue="admin@scjung.sen.go.kr" />
            </div>
          </div>
        </div>

        {/* 관리자 정보 */}
        <div style={card}>
          {sectionTitle("👤", "관리자 정보", "기관 운영을 담당하는 대표 관리자입니다.")}
          <div className="se-grid3">
            <div>
              <label style={label}>이름</label>
              <input style={field} defaultValue="김민서" />
            </div>
            <div>
              <label style={label}>이메일</label>
              <input style={field} type="email" defaultValue="minseo.kim@scjung.sen.go.kr" />
            </div>
            <div>
              <label style={label}>연락처</label>
              <input style={field} defaultValue="010-2480-1357" />
            </div>
          </div>
        </div>

        {/* 알림 설정 */}
        <div style={card}>
          {sectionTitle("🔔", "알림 설정", "수신할 알림 채널을 선택합니다.")}
          {toggleRow("보안 알림", "로그인 이상 징후·권한 변경 시 즉시 알림을 받습니다.", securityAlert, () => setSecurityAlert((v) => !v))}
          {toggleRow("주간 리포트", "매주 월요일 사용량·활동 요약 리포트를 발송합니다.", weeklyReport, () => setWeeklyReport((v) => !v))}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>시스템 공지</div>
              <div style={{ fontSize: 12, color: MUTED, marginTop: 3 }}>점검·업데이트 등 서비스 공지를 이메일로 받습니다.</div>
            </div>
            <Toggle on={systemNotice} onToggle={() => setSystemNotice((v) => !v)} />
          </div>
        </div>

        {/* 보안 설정 */}
        <div style={card}>
          {sectionTitle("🛡️", "보안 설정", "계정 보호와 접근 제어 정책입니다.")}
          {toggleRow("2단계 인증 (2FA)", "로그인 시 추가 인증 코드를 요구합니다.", twoFactor, () => setTwoFactor((v) => !v))}
          <div className="se-grid2" style={{ marginTop: 16 }}>
            <div>
              <label style={label}>세션 만료 시간</label>
              <select style={field} value={sessionTtl} onChange={(e) => setSessionTtl(e.target.value)}>
                <option value="30">30분</option>
                <option value="60">1시간</option>
                <option value="240">4시간</option>
                <option value="480">8시간</option>
                <option value="1440">24시간</option>
              </select>
            </div>
            <div>
              <label style={label}>IP 허용 목록</label>
              <input style={field} defaultValue="121.135.20.0/24, 211.45.10.88" placeholder="쉼표로 구분" />
            </div>
          </div>
          <p style={{ margin: "12px 0 0", fontSize: 12, color: MUTED }}>비어 있으면 모든 IP에서 접근이 허용됩니다.</p>
        </div>

        {/* sticky-ish save bar */}
        <div
          style={{
            position: "sticky",
            bottom: 16,
            background: CARD,
            border: `1px solid ${BORDER}`,
            borderRadius: 14,
            padding: "14px 20px",
            boxShadow: "0 4px 16px rgba(16,24,40,0.10)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <span style={{ fontSize: 13, color: MUTED }}>변경 사항은 저장 후 즉시 적용됩니다.</span>
          <div style={{ display: "flex", gap: 10 }}>
            <button style={{ background: "#fff", color: NAVY, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "10px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              취소
            </button>
            <button style={{ background: NAVY, color: "#fff", border: "none", borderRadius: 10, padding: "10px 22px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              💾 저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
