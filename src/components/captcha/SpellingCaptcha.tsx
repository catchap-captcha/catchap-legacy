// src/components/captcha/SpellingCaptcha.tsx
// Tile builder: instead of picking a whole pre-written word, the student
// assembles the correct spelling from syllable tiles, with wrong-shaped
// decoy tiles mixed into the tray. Supports drag and tap-to-append/undo.
import { useState } from "react";
import { shuffle } from "../../utils/random";
import type { SpellingProblem, CaptchaHandlers } from "./types";

interface Props extends CaptchaHandlers {
  problem: SpellingProblem;
}

const COLORS = {
  primary: "#EF6F5C",
  primaryLight: "#FFE8E3",
  border: "#FFD9CD",
  text: "#3A2E2A",
  subtext: "#A6968F",
};

export default function SpellingCaptcha({ problem, onSuccess, onRetry }: Props) {
  const target = problem.tiles.length;
  const [tray, setTray] = useState<string[]>(() => shuffle([...problem.tiles, ...problem.decoys]));
  const [built, setBuilt] = useState<string[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [state, setState] = useState<"idle" | "correct" | "retry">("idle");

  const resetTray = () => setTray(shuffle([...problem.tiles, ...problem.decoys]));

  const checkIfComplete = (next: string[]) => {
    if (next.length < target) return;
    const isCorrect = next.every((t, i) => t === problem.tiles[i]);
    if (isCorrect) {
      setState("correct");
      setTimeout(onSuccess, 700);
    } else {
      setState("retry");
      setTimeout(() => {
        setState("idle");
        setBuilt([]);
        resetTray();
        onRetry?.();
      }, 700);
    }
  };

  const placeTile = (trayIndex: number) => {
    if (state === "correct" || built.length >= target) return;
    const tile = tray[trayIndex];
    setTray((prev) => prev.filter((_, i) => i !== trayIndex));
    setBuilt((prev) => {
      const next = [...prev, tile];
      checkIfComplete(next);
      return next;
    });
  };

  const undoLast = () => {
    if (state === "correct" || built.length === 0) return;
    const last = built[built.length - 1];
    setBuilt((prev) => prev.slice(0, -1));
    setTray((prev) => [...prev, last]);
  };

  return (
    <div
      className={`captcha-fade-in ${state === "retry" ? "captcha-shake" : ""}`}
      style={{ textAlign: "center" }}
    >
      <div
        style={{
          background: "#fff",
          border: `2px solid ${COLORS.border}`,
          borderRadius: 20,
          padding: "18px 22px",
          marginBottom: 18,
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
          맞춤법·띄어쓰기 · 글자 조각을 순서대로 모아요
        </p>
        <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: COLORS.text, lineHeight: 1.7 }}>
          {problem.before}
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: 30,
              padding: "0 4px",
              margin: "0 2px",
              borderBottom: `2px dashed ${COLORS.primary}`,
              color: COLORS.primary,
              fontWeight: 800,
            }}
          >
            {built.length ? built.join("") : "○○○"}
          </span>
          {problem.after}
        </p>
      </div>

      <div
        className={state === "correct" ? "captcha-pop-correct" : undefined}
        onDragOver={(e) => e.preventDefault()}
        onDrop={() => {
          if (dragIndex === null) return;
          placeTile(dragIndex);
          setDragIndex(null);
        }}
        style={{
          minHeight: 56,
          border: `2px dashed ${COLORS.primary}`,
          borderRadius: 16,
          background: COLORS.primaryLight,
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          alignItems: "center",
          justifyContent: built.length ? "flex-start" : "center",
          padding: 10,
          marginBottom: 18,
        }}
      >
        {built.length === 0 && (
          <span style={{ color: COLORS.subtext, fontSize: 13 }}>여기로 글자 조각을 옮겨요</span>
        )}
        {built.map((tile, i) => (
          <button
            key={`${tile}-${i}`}
            onClick={i === built.length - 1 ? undoLast : undefined}
            style={{
              fontFamily: "inherit",
              fontSize: 18,
              fontWeight: 800,
              padding: "9px 14px",
              borderRadius: 12,
              border: `2px solid ${COLORS.primary}`,
              background: "#fff",
              color: COLORS.text,
              cursor: i === built.length - 1 ? "pointer" : "default",
            }}
          >
            {tile}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", marginBottom: 22 }}>
        {tray.map((tile, i) => (
          <div
            key={`${tile}-${i}`}
            draggable={state !== "correct"}
            onDragStart={() => setDragIndex(i)}
            onDragEnd={() => setDragIndex(null)}
            onClick={() => placeTile(i)}
            style={{
              fontSize: 18,
              fontWeight: 800,
              padding: "10px 16px",
              borderRadius: 12,
              border: `2px solid ${COLORS.border}`,
              background: "#fff",
              color: COLORS.text,
              cursor: state === "correct" ? "default" : "grab",
              userSelect: "none",
              boxShadow: "0 4px 10px rgba(58,46,42,0.06)",
              opacity: dragIndex === i ? 0.5 : 1,
            }}
          >
            {tile}
          </div>
        ))}
      </div>

      <p
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: state === "retry" ? COLORS.primary : COLORS.subtext,
          minHeight: 20,
        }}
      >
        {state === "correct"
          ? "정답이에요! 🎉"
          : state === "retry"
          ? "글자 조각을 다시 살펴볼까요?"
          : "마지막 조각을 다시 누르면 취소할 수 있어요."}
      </p>
    </div>
  );
}
