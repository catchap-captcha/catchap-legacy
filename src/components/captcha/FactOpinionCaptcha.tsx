// src/components/captcha/FactOpinionCaptcha.tsx
// Swipe-sort: one statement shown at a time as a card. Swipe (or tap a
// button) left for 의견, right for 사실 — the card flies off and the next
// one slides in. A wrong swipe snaps back with a shake and stays on the
// same card instead of advancing.
import { useRef, useState } from "react";
import { shuffle } from "../../utils/random";
import type { FactOpinionProblem, CaptchaHandlers } from "./types";

interface Props extends CaptchaHandlers {
  problem: FactOpinionProblem;
}

const COLORS = {
  primary: "#EF6F5C",
  border: "#FFD9CD",
  text: "#3A2E2A",
  subtext: "#A6968F",
  fact: "#3E7CA6",
  factLight: "#E8F1F7",
  opinion: "#A65B8C",
  opinionLight: "#F5ECF1",
};

const SWIPE_THRESHOLD = 90;

export default function FactOpinionCaptcha({ problem, onSuccess, onRetry }: Props) {
  const total = 1;
  const [queue, setQueue] = useState<number[]>(() =>
    shuffle(problem.statements.map((_, i) => i)).slice(0, total)
  );
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [exiting, setExiting] = useState<"사실" | "의견" | null>(null);
  const [wrongShake, setWrongShake] = useState(false);
  const startXRef = useRef(0);

  const sorted = total - queue.length;
  const currentIndex = queue[0];
  const nextIndex = queue[1];

  const handleSwipe = (direction: "사실" | "의견") => {
    if (currentIndex === undefined || exiting) return;
    const actual = problem.statements[currentIndex].tag;

    if (actual === direction) {
      setExiting(direction);
      setTimeout(() => {
        setQueue((prev) => {
          const next = prev.slice(1);
          if (next.length === 0) setTimeout(onSuccess, 300);
          return next;
        });
        setExiting(null);
        setDragX(0);
      }, 280);
    } else {
      onRetry?.();
      setDragX(0);
      setWrongShake(true);
      setTimeout(() => setWrongShake(false), 400);
    }
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (exiting) return;
    startXRef.current = e.clientX;
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    setDragX(e.clientX - startXRef.current);
  };
  const onPointerUp = () => {
    if (!dragging) return;
    setDragging(false);
    if (dragX > SWIPE_THRESHOLD) handleSwipe("사실");
    else if (dragX < -SWIPE_THRESHOLD) handleSwipe("의견");
    else setDragX(0);
  };

  if (currentIndex === undefined) {
    return null;
  }

  const cardTransform = exiting
    ? `translateX(${exiting === "사실" ? 700 : -700}px) rotate(${exiting === "사실" ? 24 : -24}deg)`
    : `translateX(${dragX}px) rotate(${dragX / 18}deg)`;

  const factStampOpacity = Math.max(0, Math.min(dragX / SWIPE_THRESHOLD, 1));
  const opinionStampOpacity = Math.max(0, Math.min(-dragX / SWIPE_THRESHOLD, 1));

  return (
    <div className="captcha-fade-in" style={{ textAlign: "center" }}>
      <p style={{ fontSize: 18, fontWeight: 800, color: COLORS.text, marginBottom: 6 }}>
        문장을 좌우로 넘겨서 분류해요.
      </p>
      <p style={{ fontSize: 12.5, color: COLORS.subtext, marginBottom: 18 }}>
        {sorted} / {total}장 분류했어요
      </p>

      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 14, marginBottom: 18 }}>
        <span style={{ fontSize: 13, fontWeight: 800, color: COLORS.opinion }}>← 의견</span>

        <div style={{ position: "relative", width: 260, height: 150 }}>
          {nextIndex !== undefined && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: 18,
                border: `2px solid ${COLORS.border}`,
                background: "#fff",
                transform: "scale(0.94) translateY(6px)",
                opacity: 0.6,
              }}
            />
          )}

          <div
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            className={wrongShake ? "captcha-shake" : undefined}
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 18,
              border: `2px solid ${COLORS.primary}`,
              background: "#fff",
              boxShadow: "0 10px 22px rgba(58,46,42,0.14)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 18,
              cursor: dragging ? "grabbing" : "grab",
              touchAction: "none",
              transform: cardTransform,
              opacity: exiting ? 0 : 1,
              transition: dragging ? "none" : "transform 0.28s ease, opacity 0.28s ease",
              userSelect: "none",
            }}
          >
            <span
              style={{
                position: "absolute",
                top: 14,
                right: 14,
                fontSize: 13,
                fontWeight: 800,
                color: COLORS.fact,
                border: `2px solid ${COLORS.fact}`,
                borderRadius: 8,
                padding: "3px 8px",
                opacity: factStampOpacity,
                transform: "rotate(-8deg)",
              }}
            >
              사실
            </span>
            <span
              style={{
                position: "absolute",
                top: 14,
                left: 14,
                fontSize: 13,
                fontWeight: 800,
                color: COLORS.opinion,
                border: `2px solid ${COLORS.opinion}`,
                borderRadius: 8,
                padding: "3px 8px",
                opacity: opinionStampOpacity,
                transform: "rotate(8deg)",
              }}
            >
              의견
            </span>
            <p style={{ fontSize: 15.5, fontWeight: 700, color: COLORS.text, margin: 0 }}>
              {problem.statements[currentIndex].text}
            </p>
          </div>
        </div>

        <span style={{ fontSize: 13, fontWeight: 800, color: COLORS.fact }}>사실 →</span>
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: 14 }}>
        <button
          onClick={() => handleSwipe("의견")}
          style={{
            fontFamily: "inherit",
            fontSize: 14,
            fontWeight: 800,
            padding: "12px 22px",
            borderRadius: 999,
            border: `2px solid ${COLORS.opinion}`,
            background: COLORS.opinionLight,
            color: COLORS.opinion,
            cursor: "pointer",
          }}
        >
          ← 의견
        </button>
        <button
          onClick={() => handleSwipe("사실")}
          style={{
            fontFamily: "inherit",
            fontSize: 14,
            fontWeight: 800,
            padding: "12px 22px",
            borderRadius: 999,
            border: `2px solid ${COLORS.fact}`,
            background: COLORS.factLight,
            color: COLORS.fact,
            cursor: "pointer",
          }}
        >
          사실 →
        </button>
      </div>

      <p
        style={{
          marginTop: 18,
          fontSize: 14,
          fontWeight: 600,
          color: wrongShake ? COLORS.primary : COLORS.subtext,
          minHeight: 20,
        }}
      >
        {wrongShake ? "반대예요. 다시 넘겨볼까요?" : "카드를 잡고 좌우로 끌어도 돼요."}
      </p>
    </div>
  );
}
