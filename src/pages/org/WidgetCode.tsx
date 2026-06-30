import { useState } from 'react';

const FONT = "'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
const NAVY = "#1e3a5f";
const GREEN = "#16a34a";
const BG = "#f4f5f7";
const CARD = "#ffffff";
const BORDER = "#e6e8ec";
const TEXT = "#1e293b";
const MUTED = "#64748b";

const INSTALL_CODE = `<!-- 캣챱 위젯 설치 코드 -->
<script
  src="https://cdn.catchap.kr/widget.js"
  data-site-key="pk_live_a1b2c3d4e5f6"
  data-position="bottom-right"
  defer
></script>`;

const EXAMPLE_CODE = `<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <title>우리 학교 사이트</title>
  </head>
  <body>
    <!-- 페이지 콘텐츠 -->

    <!-- ↓ </body> 직전에 붙여넣기 -->
    <script
      src="https://cdn.catchap.kr/widget.js"
      data-site-key="pk_live_a1b2c3d4e5f6"
      defer
    ></script>
  </body>
</html>`;

interface Option {
  attr: string;
  desc: string;
  def: string;
}

const OPTIONS: Option[] = [
  { attr: "data-site-key", desc: "사이트 인증 공개키 (필수)", def: "—" },
  { attr: "data-position", desc: "위젯 버튼 노출 위치", def: "bottom-right" },
  { attr: "data-lang", desc: "위젯 표시 언어", def: "ko" },
  { attr: "defer", desc: "스크립트 지연 로딩 여부", def: "true" },
];

export default function WidgetCode() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    try {
      navigator.clipboard?.writeText(INSTALL_CODE);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const cardStyle: React.CSSProperties = { background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 20, boxShadow: "0 1px 3px rgba(16,24,40,0.06)" };
  const codeBlock: React.CSSProperties = {
    margin: 0, background: "#0f172a", color: "#e2e8f0", borderRadius: 12,
    padding: "16px 18px", fontSize: 13, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
    overflowX: "auto", lineHeight: 1.6,
  };

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: FONT, color: TEXT, padding: "28px 32px" }}>
      <style>{`
        .wc-grid { display:grid; grid-template-columns:1fr; gap:20px; }
      `}</style>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: NAVY, letterSpacing: "-0.5px" }}>위젯 설치 코드</h1>
          <p style={{ margin: "6px 0 0", fontSize: 14, color: MUTED }}>아래 스크립트를 사이트에 붙여넣어 위젯을 활성화하세요.</p>
        </div>
      </div>

      <div className="wc-grid">
        <div style={cardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: NAVY }}>설치 스크립트</h2>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: MUTED }}>data-site-key는 사이트별 발급된 공개키입니다.</p>
            </div>
            <button
              onClick={handleCopy}
              style={{
                background: copied ? GREEN : NAVY, color: "#fff", border: "none", borderRadius: 10,
                padding: "10px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap",
              }}
            >
              {copied ? "복사됨!" : "복사"}
            </button>
          </div>
          <pre style={codeBlock}>{INSTALL_CODE}</pre>
        </div>

        <div style={cardStyle}>
          <h2 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 800, color: NAVY }}>적용 예시</h2>
          <p style={{ margin: "0 0 12px", fontSize: 13, color: MUTED }}>HTML 문서의 <code style={{ background: "#eef1f5", padding: "1px 6px", borderRadius: 5, fontSize: 12.5 }}>&lt;/body&gt;</code> 직전에 삽입하세요.</p>
          <pre style={codeBlock}>{EXAMPLE_CODE}</pre>
        </div>

        <div style={{ ...cardStyle, padding: 0, overflowX: "auto" }}>
          <div style={{ padding: "16px 20px 0" }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: NAVY }}>옵션</h2>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: MUTED }}>스크립트 태그에 추가할 수 있는 속성입니다.</p>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 12 }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", fontSize: 12, fontWeight: 700, color: MUTED, padding: "12px 20px", borderBottom: `1px solid ${BORDER}` }}>속성</th>
                <th style={{ textAlign: "left", fontSize: 12, fontWeight: 700, color: MUTED, padding: "12px 14px", borderBottom: `1px solid ${BORDER}` }}>설명</th>
                <th style={{ textAlign: "left", fontSize: 12, fontWeight: 700, color: MUTED, padding: "12px 20px", borderBottom: `1px solid ${BORDER}` }}>기본값</th>
              </tr>
            </thead>
            <tbody>
              {OPTIONS.map(o => (
                <tr key={o.attr}>
                  <td style={{ padding: "14px 20px", fontSize: 13, borderBottom: "1px solid #f0f1f4", color: NAVY, fontFamily: "ui-monospace, monospace", fontWeight: 600 }}>{o.attr}</td>
                  <td style={{ padding: "14px", fontSize: 14, borderBottom: "1px solid #f0f1f4", color: TEXT }}>{o.desc}</td>
                  <td style={{ padding: "14px 20px", fontSize: 13, borderBottom: "1px solid #f0f1f4", color: MUTED, fontFamily: "ui-monospace, monospace" }}>{o.def}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
