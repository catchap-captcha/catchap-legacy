// src/widget/CatChapGuardWidget.tsx
// The embeddable challenge card: picks one problem from a chapter (category)
// and renders it standalone, without any of the app's own navigation chrome
// (no header, tabs, points, or stage progress) since a host site owns that.
import { useMemo, useState } from "react";
import { categories, type CategoryConfig } from "../game/categories";
import { COLORS } from "../game/theme";
import type { CaptchaProblem, Difficulty } from "../components/captcha/types";

export interface CatChapGuardWidgetProps {
  category?: string;
  difficulty?: Difficulty;
  onSuccess?: () => void;
  onRetry?: () => void;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function resolveCategory(key: string | undefined): CategoryConfig {
  const found = key ? categories.find((c) => c.key === key) : undefined;
  return found ?? pickRandom(categories);
}

function pickProblem(category: CategoryConfig, difficulty: Difficulty | undefined): CaptchaProblem {
  const candidates = difficulty ? category.pool.filter((p) => p.difficulty === difficulty) : category.pool;
  return pickRandom(candidates.length > 0 ? candidates : category.pool);
}

export default function CatChapGuardWidget({ category, difficulty, onSuccess, onRetry }: CatChapGuardWidgetProps) {
  const resolvedCategory = useMemo(() => resolveCategory(category), [category]);
  const [problem] = useState(() => pickProblem(resolvedCategory, difficulty));
  const [solved, setSolved] = useState(false);
  const Captcha = resolvedCategory.Component;

  const handleSuccess = () => {
    setSolved(true);
    onSuccess?.();
  };

  return (
    <div
      className="catchap-guard-widget"
      style={{
        fontFamily: '"Pretendard", -apple-system, BlinkMacSystemFont, sans-serif',
        background: COLORS.cardBg,
        border: `1.5px solid ${COLORS.border}`,
        borderRadius: 20,
        padding: "18px 20px",
        maxWidth: 420,
        boxSizing: "border-box",
        boxShadow: "0 8px 24px rgba(58,46,42,0.10)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12,
            fontWeight: 800,
            color: COLORS.primary,
            background: COLORS.primaryLight,
            padding: "5px 11px",
            borderRadius: 999,
          }}
        >
          {resolvedCategory.emoji} {resolvedCategory.tagLabel}
        </span>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            fontSize: 11,
            fontWeight: 700,
            color: solved ? COLORS.success : COLORS.subtext,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: solved ? COLORS.success : COLORS.gold,
              display: "inline-block",
            }}
          />
          CatChap Guard
        </span>
      </div>

      <Captcha
        key={problem.id}
        problem={problem}
        onSuccess={handleSuccess}
        onRetry={onRetry}
      />
    </div>
  );
}
