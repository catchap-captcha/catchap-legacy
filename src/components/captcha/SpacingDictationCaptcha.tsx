// src/components/captcha/SpacingDictationCaptcha.tsx
// Listen-and-type: press 듣기 to hear the sentence read aloud (Web Speech
// API), then type it out exactly, spacing included. Checked as an exact
// match (trimmed) since spacing correctness is the whole point.
import { useState } from "react";
import type { SpacingDictationProblem, CaptchaHandlers } from "./types";

interface Props extends CaptchaHandlers {
  problem: SpacingDictationProblem;
}

const COLORS = {
  primary: "#EF6F5C",
  primaryLight: "#FFE8E3",
  border: "#FFD9CD",
  text: "#3A2E2A",
  subtext: "#A6968F",
};

const speechSupported = typeof window !== "undefined" && "speechSynthesis" in window;

export default function SpacingDictationCaptcha({ problem, onSuccess, onRetry }: Props) {
  const [input, setInput] = useState("");
  const [state, setState] = useState<"idle" | "correct" | "retry">("idle");
  const [playCount, setPlayCount] = useState(0);

  const speak = () => {
    if (!speechSupported) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(problem.sentence);
    utterance.lang = "ko-KR";
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
    setPlayCount((c) => c + 1);
  };

  const checkAnswer = () => {
    if (state === "correct") return;
    const isCorrect = input.trim() === problem.sentence;

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
    <div
      className={`captcha-fade-in ${state === "retry" ? "captcha-shake" : ""}`}
      style={{ textAlign: "center" }}
    >
      <p style={{ fontSize: 18, fontWeight: 800, color: COLORS.text, marginBottom: 6 }}>
        문장을 듣고 띄어쓰기까지 정확하게 입력해요.
      </p>
      <p style={{ fontSize: 12.5, color: COLORS.subtext, marginBottom: 20 }}>
        버튼을 눌러 몇 번이든 다시 들을 수 있어요.
      </p>

      <button
        onClick={speak}
        disabled={!speechSupported}
        style={{
          fontFamily: "inherit",
          fontSize: 16,
          fontWeight: 800,
          padding: "16px 32px",
          borderRadius: 999,
          border: `2px solid ${COLORS.primary}`,
          background: COLORS.primaryLight,
          color: COLORS.primary,
          cursor: speechSupported ? "pointer" : "not-allowed",
          marginBottom: 22,
        }}
      >
        🔊 {playCount > 0 ? "다시 듣기" : "듣기"}
      </button>

      {!speechSupported && (
        <p style={{ fontSize: 12.5, color: COLORS.primary, marginBottom: 16 }}>
          이 브라우저에서는 음성 듣기를 지원하지 않아요.
        </p>
      )}

      <div style={{ maxWidth: 420, margin: "0 auto 8px" }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") checkAnswer();
          }}
          disabled={state === "correct"}
          placeholder="들은 문장을 그대로 입력해요"
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
        style={{
          marginTop: 18,
          fontSize: 14,
          fontWeight: 600,
          color: state === "retry" ? COLORS.primary : COLORS.subtext,
          minHeight: 20,
        }}
      >
        {state === "correct" ? "정답이에요! 🎉" : state === "retry" ? problem.hint : " "}
      </p>
    </div>
  );
}
