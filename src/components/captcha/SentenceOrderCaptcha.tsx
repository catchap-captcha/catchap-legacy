// src/components/captcha/SentenceOrderCaptcha.tsx
// Tap-to-number: word bubbles stay put, tapping stamps the next order badge
// onto them. The order array IS the source of truth — a bubble's badge number
// is just its position in that array, so un-tapping a bubble cleanly renumbers
// everything after it.
import { useState } from "react";
import { shuffleDistinct } from "../../utils/random";
import type { SentenceOrderProblem, CaptchaHandlers } from "./types";

interface Props extends CaptchaHandlers {
  problem: SentenceOrderProblem;
}

const COLORS = {
  primary: "#EF6F5C",
  primaryLight: "#FFE8E3",
  border: "#FFD9CD",
  text: "#3A2E2A",
  subtext: "#A6968F",
};

export default function SentenceOrderCaptcha({ problem, onSuccess, onRetry }: Props) {
  const total = problem.correctOrder.length;
  const [bubbles, setBubbles] = useState<string[]>(() => shuffleDistinct(problem.correctOrder));
  const [order, setOrder] = useState<number[]>([]);
  const [state, setState] = useState<"idle" | "correct" | "retry">("idle");

  const toggleBubble = (index: number) => {
    if (state === "correct") return;
    setOrder((prev) => {
      if (prev.includes(index)) return prev.filter((i) => i !== index);
      return [...prev, index];
    });
  };

  const checkAnswer = () => {
    const built = order.map((i) => bubbles[i]);
    const isCorrect = built.every((w, i) => w === problem.correctOrder[i]);

    if (isCorrect) {
      setState("correct");
      setTimeout(onSuccess, 700);
    } else {
      setState("retry");
      setTimeout(() => {
        setState("idle");
        setBubbles(shuffleDistinct(problem.correctOrder));
        setOrder([]);
        onRetry?.();
      }, 750);
    }
  };

  const preview = order.map((i) => bubbles[i]).join(" ");

  return (
    <div
      className={`captcha-fade-in ${state === "retry" ? "captcha-shake" : ""}`}
      style={{ textAlign: "center" }}
    >
      <p style={{ fontSize: 18, fontWeight: 800, color: COLORS.text, marginBottom: 16 }}>
        어절을 순서대로 눌러서 번호를 매겨요.
      </p>

      <div
        className={state === "correct" ? "captcha-pop-correct" : undefined}
        style={{
          minHeight: 32,
          fontSize: 16,
          fontWeight: 700,
          color: order.length ? COLORS.text : COLORS.subtext,
          marginBottom: 18,
        }}
      >
        {order.length ? preview : "여기에 완성된 문장이 보여요"}
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          justifyContent: "center",
          marginBottom: 22,
        }}
      >
        {bubbles.map((word, i) => {
          const position = order.indexOf(i);
          const isPlaced = position !== -1;
          return (
            <button
              key={`${word}-${i}`}
              onClick={() => toggleBubble(i)}
              disabled={state === "correct"}
              style={{
                position: "relative",
                fontFamily: "inherit",
                fontSize: 17,
                fontWeight: 700,
                padding: "11px 20px",
                borderRadius: 16,
                border: `2px solid ${isPlaced ? COLORS.primary : COLORS.border}`,
                background: isPlaced ? COLORS.primaryLight : "#fff",
                color: COLORS.text,
                cursor: state === "correct" ? "default" : "pointer",
                boxShadow: "0 4px 10px rgba(58,46,42,0.06)",
              }}
            >
              {word}
              {isPlaced && (
                <span
                  style={{
                    position: "absolute",
                    top: -10,
                    right: -10,
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: COLORS.primary,
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.25)",
                  }}
                >
                  {position + 1}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <button
        onClick={checkAnswer}
        disabled={order.length < total || state === "correct"}
        style={{
          fontFamily: "inherit",
          fontSize: 16,
          fontWeight: 800,
          padding: "13px 36px",
          borderRadius: 999,
          border: "none",
          background: order.length < total ? "#F3D1C8" : COLORS.primary,
          color: "#fff",
          cursor: order.length < total ? "not-allowed" : "pointer",
          boxShadow: order.length < total ? "none" : "0 6px 14px rgba(239,111,92,0.35)",
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
        {state === "correct"
          ? "정답이에요! 🎉"
          : state === "retry"
          ? "순서를 다시 한번 생각해볼까요?"
          : "번호가 매겨진 낱말을 다시 누르면 취소돼요."}
      </p>
    </div>
  );
}
