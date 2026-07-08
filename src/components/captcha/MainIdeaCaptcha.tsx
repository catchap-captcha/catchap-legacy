// src/components/captcha/MainIdeaCaptcha.tsx
// Click, three stages: 1) read the paragraph alone (no options yet, so the
// student can't skim options while half-reading), 2) pick among four options
// designed as 정답/지나치게 구체적/일부만 담음/다른 일반화, 3) every pick —
// right or wrong — reveals a one-line rationale before advancing or resetting.
import { useState } from "react";
import type { MainIdeaProblem, CaptchaHandlers } from "./types";
import { shuffle } from "../../utils/random";

interface Props extends CaptchaHandlers {
  problem: MainIdeaProblem;
}

const COLORS = {
  primary: "#EF6F5C",
  primaryLight: "#FFE8E3",
  border: "#FFD9CD",
  text: "#3A2E2A",
  subtext: "#A6968F",
  success: "#4CAF7D",
  successLight: "#E8F8EF",
};

export default function MainIdeaCaptcha({ problem, onSuccess, onRetry }: Props) {
  const [options] = useState(() => shuffle(problem.options));
  const [phase, setPhase] = useState<"read" | "choose">("read");
  const [pickedIndex, setPickedIndex] = useState<number | null>(null);
  const [state, setState] = useState<"idle" | "correct" | "retry">("idle");

  const handlePick = (index: number) => {
    if (state !== "idle") return;
    setPickedIndex(index);

    if (options[index].correct) {
      setState("correct");
      setTimeout(onSuccess, 1400);
    } else {
      setState("retry");
      onRetry?.();
      setTimeout(() => {
        setState("idle");
        setPickedIndex(null);
      }, 2200);
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
          marginBottom: 16,
          textAlign: "left",
        }}
      >
        <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 800, color: COLORS.primary, letterSpacing: 0.2 }}>
          중심 생각·문단 요약
        </p>
        <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: COLORS.text, lineHeight: 1.8 }}>
          {problem.paragraph}
        </p>
      </div>

      {phase === "read" ? (
        <>
          <p style={{ fontSize: 13, color: COLORS.subtext, marginBottom: 18 }}>
            글을 천천히 읽고, 전체 내용을 하나로 묶을 수 있는 문장이 무엇일지 생각해 보아요.
          </p>
          <button
            onClick={() => setPhase("choose")}
            style={{
              fontFamily: "inherit",
              fontSize: 15,
              fontWeight: 800,
              padding: "13px 32px",
              borderRadius: 999,
              border: "none",
              background: COLORS.primary,
              color: "#fff",
              cursor: "pointer",
              boxShadow: "0 6px 14px rgba(239,111,92,0.35)",
            }}
          >
            생각 정리 완료 → 보기 보기
          </button>
        </>
      ) : (
        <>
          <p style={{ fontSize: 13.5, fontWeight: 700, color: COLORS.text, marginBottom: 14 }}>
            {problem.prompt}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 460, margin: "0 auto" }}>
            {options.map((option, i) => {
              const isPicked = pickedIndex === i;
              const revealCorrect = isPicked && state === "correct";
              const revealWrong = isPicked && state === "retry";

              return (
                <div key={option.text}>
                  <button
                    onClick={() => handlePick(i)}
                    disabled={state !== "idle"}
                    className={revealWrong ? "captcha-shake" : undefined}
                    style={{
                      width: "100%",
                      fontFamily: "inherit",
                      fontSize: 14,
                      fontWeight: 700,
                      padding: "13px 18px",
                      borderRadius: 16,
                      textAlign: "left",
                      border: `2px solid ${revealCorrect ? COLORS.success : revealWrong ? COLORS.primary : COLORS.border}`,
                      background: revealCorrect ? COLORS.successLight : revealWrong ? COLORS.primaryLight : "#fff",
                      color: COLORS.text,
                      cursor: state === "idle" ? "pointer" : "default",
                      boxShadow: isPicked ? "none" : "0 4px 10px rgba(58,46,42,0.06)",
                    }}
                  >
                    {option.text}
                  </button>
                  {isPicked && state !== "idle" && (
                    <p
                      style={{
                        margin: "8px 4px 0",
                        fontSize: 12.5,
                        fontWeight: 600,
                        color: revealCorrect ? COLORS.success : COLORS.primary,
                        textAlign: "left",
                        lineHeight: 1.5,
                      }}
                    >
                      {option.rationale}
                    </p>
                  )}
                </div>
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
        {phase === "read"
          ? " "
          : state === "correct"
          ? "정답이에요! 🎉"
          : state === "retry"
          ? "근거를 읽고 다시 골라볼까요?"
          : "글 전체를 아우르는 문장을 찾아보아요."}
      </p>
    </div>
  );
}
