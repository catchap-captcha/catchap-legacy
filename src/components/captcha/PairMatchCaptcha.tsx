// src/components/captcha/PairMatchCaptcha.tsx
// Tap-to-connect: tap a word on the left, then its partner on the right —
// a line draws between them and both lock in. Wrong pair flashes red and
// un-selects. Used by WordMatchCaptcha (비슷한말/반대말).
import { useRef, useState } from "react";
import { shuffle } from "../../utils/random";
import type { CaptchaHandlers } from "./types";

export interface PairMatchItem {
  left: string;
  right: string;
}

interface Props extends CaptchaHandlers {
  promptTag: string;
  instruction: string;
  pairs: PairMatchItem[];
}

const COLORS = {
  primary: "#EF6F5C",
  primaryLight: "#FFE8E3",
  border: "#FFD9CD",
  text: "#3A2E2A",
  subtext: "#A6968F",
  danger: "#E2574C",
};

interface Line {
  key: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export default function PairMatchCaptcha({ promptTag, instruction, pairs, onSuccess, onRetry }: Props) {
  const [rightOrder] = useState(() => shuffle(pairs.map((_, i) => i)));
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [matched, setMatched] = useState<number[]>([]);
  const [flashWrong, setFlashWrong] = useState<{ left: number; right: number } | null>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const [state, setState] = useState<"idle" | "correct">("idle");

  const containerRef = useRef<HTMLDivElement | null>(null);
  const leftRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const rightRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const computeLine = (pairIndex: number): Line | null => {
    const container = containerRef.current;
    const leftEl = leftRefs.current[pairIndex];
    const rightEl = rightRefs.current[pairIndex];
    if (!container || !leftEl || !rightEl) return null;
    const c = container.getBoundingClientRect();
    const l = leftEl.getBoundingClientRect();
    const r = rightEl.getBoundingClientRect();
    return {
      key: pairIndex,
      x1: l.right - c.left,
      y1: l.top + l.height / 2 - c.top,
      x2: r.left - c.left,
      y2: r.top + r.height / 2 - c.top,
    };
  };

  const handleLeftTap = (i: number) => {
    if (matched.includes(i) || state === "correct") return;
    setSelectedLeft((prev) => (prev === i ? null : i));
  };

  const handleRightTap = (pairIndex: number) => {
    if (matched.includes(pairIndex) || selectedLeft === null || state === "correct") return;

    if (selectedLeft === pairIndex) {
      const line = computeLine(pairIndex);
      setLines((prev) => (line ? [...prev, line] : prev));
      setSelectedLeft(null);
      setMatched((prev) => {
        const next = [...prev, pairIndex];
        if (next.length === pairs.length) {
          setState("correct");
          setTimeout(onSuccess, 700);
        }
        return next;
      });
    } else {
      setFlashWrong({ left: selectedLeft, right: pairIndex });
      onRetry?.();
      setTimeout(() => {
        setFlashWrong(null);
        setSelectedLeft(null);
      }, 500);
    }
  };

  const cardBase: React.CSSProperties = {
    fontFamily: "inherit",
    fontSize: 13.5,
    fontWeight: 700,
    padding: "12px 14px",
    borderRadius: 14,
    textAlign: "left",
    cursor: "pointer",
    userSelect: "none",
    boxShadow: "0 4px 10px rgba(58,46,42,0.06)",
    width: "100%",
  };

  return (
    <div className="captcha-fade-in" style={{ textAlign: "center" }}>
      <p style={{ fontSize: 18, fontWeight: 800, color: COLORS.text, marginBottom: 6 }}>{instruction}</p>
      <p style={{ fontSize: 12, fontWeight: 700, color: COLORS.primary, marginBottom: 18 }}>
        {promptTag} 낱말을 누르고, 짝이 되는 낱말을 눌러 이어요
      </p>

      <div
        ref={containerRef}
        className={state === "correct" ? "captcha-pop-correct" : undefined}
        style={{ position: "relative", display: "flex", gap: 48, justifyContent: "center" }}
      >
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
          {lines.map((line) => (
            <line
              key={line.key}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke={COLORS.primary}
              strokeWidth={3}
              strokeLinecap="round"
            />
          ))}
        </svg>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, width: 150 }}>
          {pairs.map((p, i) => {
            const isMatched = matched.includes(i);
            const isSelected = selectedLeft === i;
            const isWrong = flashWrong?.left === i;
            return (
              <div
                key={i}
                ref={(el) => {
                  leftRefs.current[i] = el;
                }}
                onClick={() => handleLeftTap(i)}
                className={isWrong ? "captcha-shake" : undefined}
                style={{
                  ...cardBase,
                  background: isMatched ? COLORS.primaryLight : isSelected ? "#fff" : "#fff",
                  border: `2px solid ${
                    isWrong ? COLORS.danger : isMatched ? COLORS.primary : isSelected ? COLORS.primary : COLORS.border
                  }`,
                  color: COLORS.text,
                  cursor: isMatched ? "default" : "pointer",
                }}
              >
                {p.left}
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, width: 150 }}>
          {rightOrder.map((pairIndex) => {
            const isMatched = matched.includes(pairIndex);
            const isWrong = flashWrong?.right === pairIndex;
            return (
              <div
                key={pairIndex}
                ref={(el) => {
                  rightRefs.current[pairIndex] = el;
                }}
                onClick={() => handleRightTap(pairIndex)}
                className={isWrong ? "captcha-shake" : undefined}
                style={{
                  ...cardBase,
                  background: isMatched ? COLORS.primaryLight : "#fff",
                  border: `2px solid ${isWrong ? COLORS.danger : isMatched ? COLORS.primary : COLORS.border}`,
                  color: COLORS.text,
                  cursor: isMatched ? "default" : "pointer",
                }}
              >
                {pairs[pairIndex].right}
              </div>
            );
          })}
        </div>
      </div>

      <p
        style={{
          marginTop: 20,
          fontSize: 14,
          fontWeight: 600,
          color: flashWrong ? COLORS.danger : COLORS.subtext,
          minHeight: 20,
        }}
      >
        {state === "correct"
          ? "정답이에요! 🎉"
          : flashWrong
          ? "짝이 아니에요. 다시 눌러볼까요?"
          : `${matched.length} / ${pairs.length}쌍을 이었어요`}
      </p>
    </div>
  );
}
