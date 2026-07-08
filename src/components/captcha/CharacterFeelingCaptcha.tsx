// src/components/captcha/CharacterFeelingCaptcha.tsx
// Click: read a short situation, tap the emoji face that matches the
// character's most likely feeling — a visual variant of 4-choice click.
import { useState } from "react";
import type { CharacterFeelingProblem, CaptchaHandlers } from "./types";

interface Props extends CaptchaHandlers {
  problem: CharacterFeelingProblem;
}

const COLORS = {
  primary: "#EF6F5C",
  primaryLight: "#FFE8E3",
  border: "#FFD9CD",
  text: "#3A2E2A",
  subtext: "#A6968F",
};

const EMOTION_EMOJI: Record<string, string> = {
  기쁘다: "😊",
  슬프다: "😢",
  화나다: "😠",
  무섭다: "😨",
  부끄럽다: "😳",
  답답하다: "😤",
  놀라다: "😲",
  뿌듯하다: "🥹",
  서운하다: "🙁",
  미안하다: "😔",
  걱정되다: "😟",
  지루하다: "🥱",
  편안하다: "😌",
  억울하다: "😣",
  설레다: "🤩",
  긴장되다: "😬",
};

export default function CharacterFeelingCaptcha({ problem, onSuccess, onRetry }: Props) {
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
          marginBottom: 16,
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
          인물의 마음 짐작하기
        </p>
        <p style={{ margin: 0, fontSize: 15.5, fontWeight: 700, color: COLORS.text, lineHeight: 1.7 }}>
          {problem.situation}
        </p>
      </div>

      <p style={{ fontSize: 13.5, fontWeight: 700, color: COLORS.text, marginBottom: 14 }}>
        이때 이 사람의 마음으로 가장 알맞은 표정은 무엇일까요?
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(96px, 1fr))",
          gap: 12,
          maxWidth: 460,
          margin: "0 auto",
        }}
      >
        {problem.options.map((option) => {
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
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                padding: "16px 8px",
                borderRadius: 18,
                border: `2px solid ${
                  isCorrectPick ? "#4CAF7D" : isRetryPick ? COLORS.primary : COLORS.border
                }`,
                background: isCorrectPick ? "#E8F8EF" : isRetryPick ? COLORS.primaryLight : "#fff",
                cursor: state === "correct" ? "default" : "pointer",
                boxShadow: isSelected ? "none" : "0 4px 10px rgba(58,46,42,0.06)",
              }}
            >
              <span style={{ fontSize: 34 }}>{EMOTION_EMOJI[option] ?? "❓"}</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: COLORS.text }}>{option}</span>
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
          ? "상황을 다시 떠올리며 골라볼까요?"
          : "인물이 겪은 일을 잘 살펴보아요."}
      </p>
    </div>
  );
}
