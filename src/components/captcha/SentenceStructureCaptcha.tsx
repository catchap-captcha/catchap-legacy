// src/components/captcha/SentenceStructureCaptcha.tsx
// Click: two modes share one chapter. "find" shows a sentence broken into
// word chips and asks the student to tap the one that plays a given role
// (주어/서술어/목적어). "classify" shows a whole sentence and asks the
// student to tap whether it's a 홑문장 or 겹문장.
import { useState } from "react";
import type { SentenceStructureProblem, CaptchaHandlers } from "./types";

interface Props extends CaptchaHandlers {
  problem: SentenceStructureProblem;
}

const COLORS = {
  primary: "#EF6F5C",
  primaryLight: "#FFE8E3",
  border: "#FFD9CD",
  text: "#3A2E2A",
  subtext: "#A6968F",
};

export default function SentenceStructureCaptcha({ problem, onSuccess, onRetry }: Props) {
  const [selected, setSelected] = useState<number | string | null>(null);
  const [state, setState] = useState<"idle" | "correct" | "retry">("idle");

  const settle = (isCorrect: boolean) => {
    if (isCorrect) {
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

  const handleTokenPick = (index: number) => {
    if (state === "correct" || problem.mode !== "find") return;
    setSelected(index);
    settle(index === problem.answerIndex);
  };

  const handleOptionPick = (option: string) => {
    if (state === "correct" || problem.mode !== "classify") return;
    setSelected(option);
    settle(option === problem.answer);
  };

  const feedback =
    state === "correct"
      ? "정답이에요! 🎉"
      : state === "retry"
      ? "문장을 다시 살펴보며 골라볼까요?"
      : problem.mode === "find"
      ? "문장 성분의 역할을 잘 생각해 보아요."
      : "서술어가 몇 개인지 세어 보아요.";

  return (
    <div className="captcha-fade-in" style={{ textAlign: "center" }}>
      <p style={{ fontSize: 12, fontWeight: 800, color: COLORS.primary, marginBottom: 10 }}>
        문장의 짜임
      </p>

      {problem.mode === "find" ? (
        <>
          <p style={{ fontSize: 15, fontWeight: 700, color: COLORS.text, marginBottom: 18 }}>
            다음 문장에서 <span style={{ color: COLORS.primary }}>{problem.targetLabel}</span>를 찾아
            클릭하세요.
          </p>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              justifyContent: "center",
              marginBottom: 6,
            }}
          >
            {problem.tokens.map((word, i) => {
              const isSelected = selected === i;
              const isCorrectPick = isSelected && state === "correct";
              const isRetryPick = isSelected && state === "retry";

              return (
                <button
                  key={`${word}-${i}`}
                  onClick={() => handleTokenPick(i)}
                  disabled={state === "correct"}
                  className={isRetryPick ? "captcha-shake" : undefined}
                  style={{
                    fontFamily: "inherit",
                    fontSize: 17,
                    fontWeight: 700,
                    padding: "11px 20px",
                    borderRadius: 16,
                    border: `2px solid ${
                      isCorrectPick ? "#4CAF7D" : isRetryPick ? COLORS.primary : COLORS.border
                    }`,
                    background: isCorrectPick ? "#E8F8EF" : isRetryPick ? COLORS.primaryLight : "#fff",
                    color: COLORS.text,
                    cursor: state === "correct" ? "default" : "pointer",
                    boxShadow: "0 4px 10px rgba(58,46,42,0.06)",
                  }}
                >
                  {word}
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <>
          <div
            style={{
              background: "#fff",
              border: `2px solid ${COLORS.border}`,
              borderRadius: 20,
              padding: "18px 22px",
              marginBottom: 16,
            }}
          >
            <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: COLORS.text, lineHeight: 1.7 }}>
              {problem.sentence}
            </p>
          </div>
          <p style={{ fontSize: 13.5, fontWeight: 700, color: COLORS.text, marginBottom: 14 }}>
            이 문장은 홑문장일까요, 겹문장일까요?
          </p>
          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            {problem.options.map((option) => {
              const isSelected = selected === option;
              const isCorrectPick = isSelected && state === "correct";
              const isRetryPick = isSelected && state === "retry";

              return (
                <button
                  key={option}
                  onClick={() => handleOptionPick(option)}
                  disabled={state === "correct"}
                  className={isRetryPick ? "captcha-shake" : undefined}
                  style={{
                    fontFamily: "inherit",
                    fontSize: 15.5,
                    fontWeight: 800,
                    padding: "14px 32px",
                    borderRadius: 16,
                    border: `2px solid ${
                      isCorrectPick ? "#4CAF7D" : isRetryPick ? COLORS.primary : COLORS.border
                    }`,
                    background: isCorrectPick ? "#E8F8EF" : isRetryPick ? COLORS.primaryLight : "#fff",
                    color: COLORS.text,
                    cursor: state === "correct" ? "default" : "pointer",
                    boxShadow: "0 4px 10px rgba(58,46,42,0.06)",
                  }}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </>
      )}

      <p
        style={{
          marginTop: 20,
          fontSize: 14,
          fontWeight: 600,
          color: state === "retry" ? COLORS.primary : COLORS.subtext,
          minHeight: 20,
        }}
      >
        {feedback}
      </p>
    </div>
  );
}
