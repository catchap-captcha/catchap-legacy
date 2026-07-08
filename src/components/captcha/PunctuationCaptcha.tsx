// src/components/captcha/PunctuationCaptcha.tsx
// Multi-select: a sentence is shown as word chips with a few tappable gap
// slots between them. The student toggles every slot where the given mark
// belongs, then presses 확인 — the whole selected set must match exactly
// (no missing, no extra) for it to count as correct.
import { useState } from "react";
import type { PunctuationProblem, CaptchaHandlers } from "./types";

interface Props extends CaptchaHandlers {
  problem: PunctuationProblem;
}

const COLORS = {
  primary: "#EF6F5C",
  primaryLight: "#FFE8E3",
  border: "#FFD9CD",
  text: "#3A2E2A",
  subtext: "#A6968F",
};

function sameSet(a: number[], b: number[]) {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort((x, y) => x - y);
  const sortedB = [...b].sort((x, y) => x - y);
  return sortedA.every((v, i) => v === sortedB[i]);
}

export default function PunctuationCaptcha({ problem, onSuccess, onRetry }: Props) {
  const [picked, setPicked] = useState<number[]>([]);
  const [state, setState] = useState<"idle" | "correct" | "retry">("idle");

  const toggleGap = (gap: number) => {
    if (state !== "idle") return;
    setPicked((prev) => (prev.includes(gap) ? prev.filter((g) => g !== gap) : [...prev, gap]));
  };

  const checkAnswer = () => {
    if (state !== "idle" || picked.length === 0) return;
    if (sameSet(picked, problem.correctGaps)) {
      setState("correct");
      setTimeout(onSuccess, 700);
    } else {
      setState("retry");
      onRetry?.();
      setTimeout(() => {
        setState("idle");
        setPicked([]);
      }, 650);
    }
  };

  return (
    <div className={`captcha-fade-in ${state === "retry" ? "captcha-shake" : ""}`} style={{ textAlign: "center" }}>
      <p style={{ fontSize: 13.5, fontWeight: 700, color: COLORS.text, marginBottom: 4 }}>
        <span style={{ color: COLORS.primary }}>{problem.markLabel}</span>가 들어갈 자리를 모두 찾아 탭하세요.
      </p>
      <p style={{ fontSize: 12, color: COLORS.subtext, marginBottom: 18 }}>
        다 골랐으면 확인을 눌러요.
      </p>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
          marginBottom: 22,
          maxWidth: 480,
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        {problem.tokens.map((word, i) => {
          const isCandidate = problem.candidateGaps.includes(i);
          const isPicked = picked.includes(i);
          const isCorrectPick = isPicked && state === "correct";

          return (
            <span key={`${word}-${i}`} style={{ display: "inline-flex", alignItems: "center" }}>
              <span style={{ fontSize: 17, fontWeight: 700, color: COLORS.text }}>{word}</span>
              {isCandidate && (
                <button
                  onClick={() => toggleGap(i)}
                  disabled={state !== "idle"}
                  aria-label="부호 자리"
                  style={{
                    fontFamily: "inherit",
                    fontSize: 15,
                    fontWeight: 800,
                    width: 28,
                    height: 28,
                    margin: "0 3px",
                    borderRadius: "50%",
                    border: `2px solid ${isCorrectPick ? "#4CAF7D" : isPicked ? COLORS.primary : COLORS.border}`,
                    background: isCorrectPick ? "#E8F8EF" : isPicked ? COLORS.primaryLight : "#fff",
                    color: isPicked ? COLORS.primary : COLORS.subtext,
                    cursor: state === "idle" ? "pointer" : "default",
                    lineHeight: 1,
                  }}
                >
                  {isPicked ? "✓" : "_"}
                </button>
              )}
            </span>
          );
        })}
      </div>

      <button
        onClick={checkAnswer}
        disabled={picked.length === 0 || state !== "idle"}
        style={{
          fontFamily: "inherit",
          fontSize: 16,
          fontWeight: 800,
          padding: "13px 36px",
          borderRadius: 999,
          border: "none",
          background: picked.length === 0 ? "#F3D1C8" : COLORS.primary,
          color: "#fff",
          cursor: picked.length === 0 ? "not-allowed" : "pointer",
          boxShadow: picked.length === 0 ? "none" : "0 6px 14px rgba(239,111,92,0.35)",
        }}
      >
        확인
      </button>

      <p
        style={{
          marginTop: 18,
          fontSize: 14,
          fontWeight: 600,
          color: state === "retry" ? COLORS.primary : COLORS.subtext,
          minHeight: 20,
        }}
      >
        {state === "correct" ? "정답이에요! 🎉" : state === "retry" ? "자리를 다시 살펴볼까요?" : " "}
      </p>
    </div>
  );
}
