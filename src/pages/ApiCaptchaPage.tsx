// src/pages/ApiCaptchaPage.tsx
// Demo page for the REST API (backend/server.js): fetches a problem from
// GET /api/problem and renders it via CAPTCHA_COMPONENTS, reporting the
// outcome to POST /api/check. The captcha component itself already shows
// its own "정답이에요!" feedback on success — this page doesn't add a
// separate "verified" popup on top of it.
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchProblem, reportCheck } from "../api/client";
import { CAPTCHA_COMPONENTS, CAPTCHA_TYPE_LABELS } from "../api/captchaTypeMap";
import { COLORS } from "../game/theme";
import type { CaptchaProblem } from "../components/captcha/types";

type LoadState = "loading" | "ready" | "error";

export default function ApiCaptchaPage() {
  const [selectedType, setSelectedType] = useState<string>("");
  const [problem, setProblem] = useState<CaptchaProblem | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [solved, setSolved] = useState(false);

  const loadProblem = useCallback((type: string) => {
    setLoadState("loading");
    setSolved(false);
    fetchProblem(type || undefined)
      .then((p) => {
        setProblem(p);
        setLoadState("ready");
      })
      .catch(() => setLoadState("error"));
  }, []);

  useEffect(() => {
    loadProblem(selectedType);
  }, [selectedType, loadProblem]);

  const handleSuccess = () => {
    if (problem) reportCheck(problem.id, problem.type, "correct");
    setSolved(true);
  };

  const handleRetry = () => {
    if (problem) reportCheck(problem.id, problem.type, "retry");
  };

  const Captcha = problem ? CAPTCHA_COMPONENTS[problem.type] : null;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at top left, #fff3ef, #ffe3db 60%, #ffd8cd)",
        fontFamily: '"Pretendard", -apple-system, BlinkMacSystemFont, sans-serif',
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "40px 16px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 520, marginBottom: 16 }}>
        <Link
          to="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13.5,
            fontWeight: 700,
            color: COLORS.subtext,
            textDecoration: "none",
            marginBottom: 14,
          }}
        >
          ← 전체 학습으로
        </Link>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: COLORS.text }}>CatChap Guard API 데모</h1>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: COLORS.subtext }}>
              GET /api/problem 으로 받아온 문제를 그대로 렌더링합니다.
            </p>
          </div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            style={{
              fontFamily: "inherit",
              fontSize: 13,
              fontWeight: 700,
              padding: "8px 10px",
              borderRadius: 10,
              border: `1.5px solid ${COLORS.border}`,
              color: COLORS.text,
              background: "#fff",
            }}
          >
            <option value="">전체 (랜덤)</option>
            {Object.entries(CAPTCHA_TYPE_LABELS).map(([type, label]) => (
              <option key={type} value={type}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div
        id="captcha-mount"
        style={{
          width: "100%",
          maxWidth: 520,
          background: COLORS.cardBg,
          border: `1.5px solid ${COLORS.border}`,
          borderRadius: 24,
          padding: "22px 24px",
          boxShadow: "0 12px 32px rgba(58,46,42,0.10)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <span
            style={{
              fontSize: 12,
              fontWeight: 800,
              color: COLORS.primary,
              background: COLORS.primaryLight,
              padding: "5px 11px",
              borderRadius: 999,
            }}
          >
            Aa {problem ? CAPTCHA_TYPE_LABELS[problem.type] : "국어"}
          </span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              fontSize: 11,
              fontWeight: 700,
              color: solved ? COLORS.success : COLORS.subtext,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: solved ? COLORS.success : COLORS.gold,
                display: "inline-block",
              }}
            />
            CatChap Guard
          </span>
        </div>

        {loadState === "loading" && (
          <p style={{ textAlign: "center", color: COLORS.subtext, fontSize: 14, padding: "30px 0" }}>불러오는 중...</p>
        )}

        {loadState === "error" && (
          <p style={{ textAlign: "center", color: COLORS.primary, fontSize: 14, padding: "30px 0" }}>
            문제를 불러오지 못했어요. API 서버가 켜져 있는지 확인해 주세요.
          </p>
        )}

        {loadState === "ready" && problem && Captcha && (
          <Captcha key={problem.id} problem={problem} onSuccess={handleSuccess} onRetry={handleRetry} />
        )}

        {solved && (
          <div style={{ textAlign: "center", marginTop: 18 }}>
            <button
              onClick={() => loadProblem(selectedType)}
              style={{
                fontFamily: "inherit",
                fontSize: 14,
                fontWeight: 800,
                padding: "10px 22px",
                borderRadius: 999,
                border: "none",
                background: COLORS.primary,
                color: "#fff",
                cursor: "pointer",
              }}
            >
              다음 문제 →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
