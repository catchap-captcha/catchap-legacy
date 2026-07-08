// src/components/captcha/ContextBlankCaptcha.tsx
// Drag-only: the option chips must be dragged into the blank inside the
// sentence itself. Deliberately no click-to-place fallback here — this
// chapter is the one place in the app where dragging is required.
import { useState } from "react";
import type { ContextBlankProblem, CaptchaHandlers } from "./types";

interface Props extends CaptchaHandlers {
  problem: ContextBlankProblem;
}

const COLORS = {
  primary: "#EF6F5C",
  primaryLight: "#FFE8E3",
  border: "#FFD9CD",
  text: "#3A2E2A",
  subtext: "#A6968F",
};

export default function ContextBlankCaptcha({ problem, onSuccess, onRetry }: Props) {
  const [placed, setPlaced] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [state, setState] = useState<"idle" | "correct" | "retry">("idle");

  const handleDrop = () => {
    setDragOver(false);
    if (dragIndex === null || state === "correct") return;
    const word = problem.options[dragIndex];
    setPlaced(word);
    setDragIndex(null);

    if (word === problem.answer) {
      setState("correct");
      setTimeout(onSuccess, 700);
    } else {
      setState("retry");
      setTimeout(() => {
        setState("idle");
        setPlaced(null);
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
          padding: "22px 22px",
          marginBottom: 24,
          textAlign: "left",
        }}
      >
        <p
          style={{
            margin: "0 0 10px",
            fontSize: 12,
            fontWeight: 800,
            color: COLORS.primary,
            letterSpacing: 0.2,
          }}
        >
          문맥 추론 · 빈칸으로 낱말을 드래그해요
        </p>
        <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: COLORS.text, lineHeight: 1.9 }}>
          {problem.before}
          <span
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={
              state === "correct" ? "captcha-pop-correct" : state === "retry" ? "captcha-shake" : undefined
            }
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: 54,
              minHeight: 34,
              padding: "0 10px",
              margin: "0 3px",
              borderRadius: 10,
              border: `2px dashed ${dragOver ? COLORS.primary : placed ? COLORS.primary : "#C9BEB9"}`,
              background: dragOver ? "#FFF3EF" : placed ? COLORS.primaryLight : "#FBF7F5",
              color: placed ? COLORS.text : COLORS.subtext,
              fontWeight: 800,
              verticalAlign: "middle",
            }}
          >
            {placed ?? "○○○"}
          </span>
          {problem.after}
        </p>
      </div>

      <p style={{ fontSize: 12.5, color: COLORS.subtext, marginBottom: 12 }}>
        낱말 카드를 손으로 잡아 빈칸에 끌어다 놓아요.
      </p>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 12,
          maxWidth: 480,
          margin: "0 auto",
        }}
      >
        {problem.options.map((word, i) => (
          <div
            key={word}
            draggable={state !== "correct"}
            onDragStart={() => setDragIndex(i)}
            onDragEnd={() => setDragIndex(null)}
            style={{
              fontSize: 16,
              fontWeight: 700,
              padding: "13px 20px",
              borderRadius: 18,
              border: `2px solid ${COLORS.border}`,
              background: "#fff",
              color: COLORS.text,
              cursor: state === "correct" ? "default" : "grab",
              userSelect: "none",
              boxShadow: "0 4px 10px rgba(58,46,42,0.06)",
              opacity: dragIndex === i ? 0.5 : 1,
            }}
          >
            {word}
          </div>
        ))}
      </div>

      <p
        style={{
          marginTop: 22,
          fontSize: 14,
          fontWeight: 600,
          color: state === "retry" ? COLORS.primary : COLORS.subtext,
          minHeight: 20,
        }}
      >
        {state === "correct"
          ? "정답이에요! 🎉"
          : state === "retry"
          ? "문장을 다시 읽고 다른 낱말을 끌어와 볼까요?"
          : " "}
      </p>
    </div>
  );
}
