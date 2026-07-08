// src/components/captcha/ExpressionCaptcha.tsx
// Type-in: read a sentence with a plain (non-honorific) word underlined in
// red, then type its honorific form and press Enter. Checked as an exact
// match (trimmed).
import { useState } from "react";
import type { ExpressionProblem, CaptchaHandlers } from "./types";

interface Props extends CaptchaHandlers {
  problem: ExpressionProblem;
}

const COLORS = {
  primary: "#EF6F5C",
  primaryLight: "#FFE8E3",
  border: "#FFD9CD",
  text: "#3A2E2A",
  subtext: "#A6968F",
  danger: "#E2574C",
};

export default function ExpressionCaptcha({ problem, onSuccess, onRetry }: Props) {
  const [input, setInput] = useState("");
  const [state, setState] = useState<"idle" | "correct" | "retry">("idle");

  const checkAnswer = () => {
    if (state === "correct" || !input.trim()) return;
    const isCorrect = input.trim() === problem.answer;

    if (isCorrect) {
      setState("correct");
      setTimeout(onSuccess, 700);
    } else {
      setState("retry");
      onRetry?.();
      setTimeout(() => setState("idle"), 650);
    }
  };

  return (
    <div className="captcha-fade-in" style={{ textAlign: "center" }}>
      <div
        style={{
          background: "#fff",
          border: `2px solid ${COLORS.border}`,
          borderRadius: 20,
          padding: "18px 22px",
          marginBottom: 12,
          textAlign: "left",
        }}
      >
        <p
          style={{
            margin: "0 0 8px",
            fontSize: 12,
            fontWeight: 800,
            color: COLORS.primary,
            letterSpacing: 0.2,
          }}
        >
          높임표현
        </p>
        <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: COLORS.text, lineHeight: 1.8 }}>
          {problem.before}
          <span
            style={{
              color: COLORS.danger,
              borderBottom: `3px solid ${COLORS.danger}`,
              fontWeight: 800,
            }}
          >
            {problem.highlight}
          </span>
          {problem.after}
        </p>
      </div>

      <p style={{ fontSize: 13.5, fontWeight: 700, color: COLORS.text, marginBottom: 14 }}>
        밑줄 친 표현을 알맞은 높임 표현으로 바꾸어 입력해요
      </p>

      <div style={{ maxWidth: 360, margin: "0 auto 8px" }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") checkAnswer();
          }}
          disabled={state === "correct"}
          placeholder="높임 표현을 입력해요"
          style={{
            width: "100%",
            fontFamily: "inherit",
            fontSize: 16,
            fontWeight: 600,
            padding: "14px 16px",
            borderRadius: 14,
            border: `2px solid ${state === "retry" ? COLORS.primary : COLORS.border}`,
            color: COLORS.text,
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>

      <button
        onClick={checkAnswer}
        disabled={!input.trim() || state === "correct"}
        style={{
          fontFamily: "inherit",
          fontSize: 16,
          fontWeight: 800,
          padding: "13px 36px",
          borderRadius: 999,
          border: "none",
          background: !input.trim() ? "#F3D1C8" : COLORS.primary,
          color: "#fff",
          cursor: !input.trim() ? "not-allowed" : "pointer",
          boxShadow: !input.trim() ? "none" : "0 6px 14px rgba(239,111,92,0.35)",
          marginTop: 14,
        }}
      >
        확인
      </button>

      <p
        className={state === "retry" ? "captcha-shake" : undefined}
        style={{
          marginTop: 18,
          fontSize: 14,
          fontWeight: 600,
          color: state === "retry" ? COLORS.primary : COLORS.subtext,
          minHeight: 20,
        }}
      >
        {state === "correct" ? "정답이에요! 🎉" : state === "retry" ? "문장을 다시 읽고 입력해 볼까요?" : "문장 속 표현을 잘 살펴보아요."}
      </p>
    </div>
  );
}
