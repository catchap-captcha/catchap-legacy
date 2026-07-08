// src/components/captcha/IdiomCaptcha.tsx
// Click: read the sentence with the idiom/proverb highlighted, pick its
// meaning among four options.
import { useState } from "react";
import type { IdiomProblem, CaptchaHandlers } from "./types";
import { shuffle } from "../../utils/random";

interface Props extends CaptchaHandlers {
  problem: IdiomProblem;
}

const COLORS = {
  primary: "#EF6F5C",
  primaryLight: "#FFE8E3",
  border: "#FFD9CD",
  text: "#3A2E2A",
  subtext: "#A6968F",
};

export default function IdiomCaptcha({ problem, onSuccess, onRetry }: Props) {
  const [options] = useState(() => shuffle(problem.options));
  const [selected, setSelected] = useState<string | null>(null);
  const [state, setState] = useState<"idle" | "correct" | "retry">("idle");

  const handlePick = (option: string) => {
    if (state === "correct") return;
    setSelected(option);

    if (option === problem.answer) {
      setState("correct");
      setTimeout(onSuccess, 700);
    } else {
      setState("retry");
      setTimeout(() => {
        setState("idle");
        setSelected(null);
        onRetry?.();
      }, 650);
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
          속담·관용 표현
        </p>
        <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: COLORS.text, lineHeight: 1.8 }}>
          {problem.before}
          <span
            style={{
              color: COLORS.primary,
              borderBottom: `3px solid ${COLORS.primaryLight}`,
              fontWeight: 800,
            }}
          >
            {problem.idiom}
          </span>
          {problem.after}
        </p>
      </div>

      <p style={{ fontSize: 13.5, fontWeight: 700, color: COLORS.text, marginBottom: 14 }}>
        밑줄 친 표현의 뜻은 무엇일까요?
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 460, margin: "0 auto" }}>
        {options.map((option) => {
          const isSelected = selected === option;
          const isCorrectPick = isSelected && state === "correct";
          const isRetryPick = isSelected && state === "retry";

          return (
            <button
              key={option}
              onClick={() => handlePick(option)}
              disabled={state === "correct"}
              className={isRetryPick ? "captcha-shake" : undefined}
              style={{
                fontFamily: "inherit",
                fontSize: 14.5,
                fontWeight: 700,
                padding: "13px 18px",
                borderRadius: 16,
                textAlign: "left",
                border: `2px solid ${
                  isCorrectPick ? "#4CAF7D" : isRetryPick ? COLORS.primary : COLORS.border
                }`,
                background: isCorrectPick ? "#E8F8EF" : isRetryPick ? COLORS.primaryLight : "#fff",
                color: COLORS.text,
                cursor: state === "correct" ? "default" : "pointer",
                boxShadow: isSelected ? "none" : "0 4px 10px rgba(58,46,42,0.06)",
              }}
            >
              {option}
            </button>
          );
        })}
      </div>

      <p
        style={{
          marginTop: 20,
          fontSize: 14,
          fontWeight: 600,
          color: state === "retry" ? COLORS.primary : COLORS.subtext,
          minHeight: 20,
        }}
      >
        {state === "correct"
          ? "정답이에요! 🎉"
          : state === "retry"
          ? "문장을 다시 읽고 골라볼까요?"
          : "문장 속 상황을 떠올리며 뜻을 짐작해 보아요."}
      </p>
    </div>
  );
}
