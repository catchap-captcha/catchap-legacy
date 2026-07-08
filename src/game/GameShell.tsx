// src/game/GameShell.tsx
import type { ReactNode } from "react";
import { COLORS, SUBJECTS } from "./theme";

interface GameShellProps {
  tagLabel: string;
  emoji: string;
  title: string;
  subtitle: string;
  round: number;
  total: number;
  points: number;
  rewardStars: number;
  rewardTarget: number;
  justEarnedSticker: boolean;
  correctCount: number;
  wrongCount: number;
  streak: number;
  encouragement: string;
  footerStatus: string;
  footerButtonLabel: string;
  footerButtonDisabled: boolean;
  showFooterButton: boolean;
  onFooterClick: () => void;
  onExit: () => void;
  children: ReactNode;
}

function StatRow({
  icon,
  iconBg,
  iconColor,
  label,
  value,
  valueColor,
}: {
  icon: string;
  iconBg: string;
  iconColor: string;
  label: string;
  value: number;
  valueColor: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: iconBg,
          color: iconColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 14,
          flex: "none",
        }}
      >
        {icon}
      </span>
      <span style={{ flex: 1, fontSize: 13.5, fontWeight: 700, color: COLORS.text }}>
        {label}
      </span>
      <span style={{ fontSize: 15, fontWeight: 800, color: valueColor }}>{value}</span>
    </div>
  );
}

export default function GameShell({
  tagLabel,
  emoji,
  title,
  subtitle,
  round,
  total,
  points,
  rewardStars,
  rewardTarget,
  justEarnedSticker,
  correctCount,
  wrongCount,
  streak,
  encouragement,
  footerStatus,
  footerButtonLabel,
  footerButtonDisabled,
  showFooterButton,
  onFooterClick,
  onExit,
  children,
}: GameShellProps) {
  const percent = Math.round((round / total) * 100);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at top left, #fff3ef, #ffe3db 60%, #ffd8cd)",
        fontFamily: '"Pretendard", -apple-system, BlinkMacSystemFont, sans-serif',
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* top bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
          padding: "18px 28px",
          background: "#fff",
          boxShadow: "0 2px 10px rgba(58,46,42,0.06)",
        }}
      >
        <button
          onClick={onExit}
          style={{
            fontFamily: "inherit",
            fontSize: 14,
            fontWeight: 700,
            color: COLORS.subtext,
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 4,
            flex: "none",
          }}
        >
          ✕ 그만하기
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: "none" }}>
          <span
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: COLORS.primaryLight,
              color: COLORS.primary,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: 14,
            }}
          >
            Aa
          </span>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: COLORS.text, lineHeight: 1.2 }}>
              {title}
            </div>
            <div style={{ fontSize: 12, color: COLORS.subtext, lineHeight: 1.2 }}>{subtitle}</div>
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 12, minWidth: 120 }}>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: COLORS.subtext, flex: "none" }}>
            문제 {round} / {total}
          </span>
          <div
            style={{
              flex: 1,
              height: 8,
              borderRadius: 999,
              background: COLORS.primaryLight,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${percent}%`,
                height: "100%",
                background: COLORS.primary,
                borderRadius: 999,
                transition: "width 0.3s ease",
              }}
            />
          </div>
          <span style={{ fontSize: 12.5, fontWeight: 800, color: COLORS.primary, flex: "none" }}>
            {percent}%
          </span>
        </div>

        <div
          style={{
            flex: "none",
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: COLORS.goldLight,
            color: "#B9781E",
            fontWeight: 800,
            fontSize: 14,
            padding: "8px 16px",
            borderRadius: 999,
          }}
        >
          ⭐ {points}
        </div>
      </div>

      {/* subject tabs */}
      <div
        style={{
          display: "flex",
          gap: 10,
          padding: "14px 28px",
          background: "#fff",
          borderBottom: `1px solid ${COLORS.inactiveBorder}`,
          overflowX: "auto",
        }}
      >
        {SUBJECTS.map((s) => (
          <span
            key={s.key}
            title={s.active ? undefined : "곧 추가될 과목이에요"}
            style={{
              flex: "none",
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "9px 16px",
              borderRadius: 999,
              fontSize: 13.5,
              fontWeight: 800,
              border: `1.5px solid ${s.active ? COLORS.primary : COLORS.inactiveBorder}`,
              background: s.active ? COLORS.primary : "#fff",
              color: s.active ? "#fff" : COLORS.subtext,
              opacity: s.active ? 1 : 0.7,
              cursor: s.active ? "default" : "not-allowed",
              userSelect: "none",
            }}
          >
            <span>{s.icon}</span>
            {s.label}
          </span>
        ))}
      </div>

      {/* main content */}
      <div className="game-shell-grid" style={{ flex: 1, width: "100%", boxSizing: "border-box", padding: 28 }}>
        <div
          style={{
            background: COLORS.cardBg,
            borderRadius: 28,
            padding: "28px 30px",
            boxShadow: "0 10px 28px rgba(58,46,42,0.08)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12.5,
                fontWeight: 800,
                color: COLORS.primary,
                background: COLORS.primaryLight,
                padding: "6px 12px",
                borderRadius: 999,
              }}
            >
              Aa {tagLabel} {emoji}
            </span>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
                fontWeight: 700,
                color: COLORS.success,
                background: COLORS.successLight,
                padding: "6px 12px",
                borderRadius: 999,
              }}
            >
              <span
                className="guard-dot"
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: COLORS.success,
                  display: "inline-block",
                }}
              />
              Guard 추적 중
            </span>
          </div>

          <div>{children}</div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 20,
            }}
          >
            <span style={{ fontSize: 13, color: COLORS.subtext, fontWeight: 600 }}>
              {footerStatus}
            </span>
            {showFooterButton && (
              <button
                onClick={onFooterClick}
                disabled={footerButtonDisabled}
                style={{
                  fontFamily: "inherit",
                  fontSize: 15,
                  fontWeight: 800,
                  padding: "13px 30px",
                  borderRadius: 999,
                  border: "none",
                  background: footerButtonDisabled ? "#F3D1C8" : COLORS.primary,
                  color: "#fff",
                  cursor: footerButtonDisabled ? "not-allowed" : "pointer",
                  boxShadow: footerButtonDisabled ? "none" : "0 6px 14px rgba(239,111,92,0.35)",
                }}
              >
                {footerButtonLabel}
              </button>
            )}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              background: "linear-gradient(160deg, #ffe9df, #ffd9cb)",
              borderRadius: 24,
              padding: "22px 20px",
              textAlign: "center",
            }}
          >
            <div
              className="captcha-mascot-bounce"
              style={{
                width: 96,
                height: 96,
                margin: "0 auto 10px",
                borderRadius: "50%",
                background: COLORS.primary,
                border: "5px solid #fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 44,
                boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
              }}
            >
              🐱
            </div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: COLORS.text }}>
              {encouragement}
            </p>
          </div>

          <div
            style={{
              background: COLORS.cardBg,
              borderRadius: 24,
              padding: "18px 20px",
              boxShadow: "0 8px 20px rgba(58,46,42,0.06)",
            }}
          >
            <p style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 800, color: COLORS.text }}>
              이번 판 진행
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <StatRow
                icon="✓"
                iconBg={COLORS.successLight}
                iconColor={COLORS.success}
                label="맞힌 문제"
                value={correctCount}
                valueColor={COLORS.success}
              />
              <StatRow
                icon="✕"
                iconBg={COLORS.dangerLight}
                iconColor={COLORS.danger}
                label="틀린 문제"
                value={wrongCount}
                valueColor={COLORS.danger}
              />
              <StatRow
                icon="⚡"
                iconBg={COLORS.goldLight}
                iconColor={COLORS.gold}
                label="연속 정답"
                value={streak}
                valueColor={COLORS.gold}
              />
            </div>
          </div>

          <div
            style={{
              background: COLORS.cardBg,
              borderRadius: 24,
              padding: "18px 20px",
              boxShadow: "0 8px 20px rgba(58,46,42,0.06)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: COLORS.text }}>
                다음 보상까지
              </p>
              <span
                style={{
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: COLORS.primary,
                  background: COLORS.primaryLight,
                  padding: "4px 10px",
                  borderRadius: 999,
                }}
              >
                🎁 새 스티커
              </span>
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              {Array.from({ length: rewardTarget }, (_, i) => (
                <span
                  key={i}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 15,
                    background: i < rewardStars ? COLORS.primaryLight : "#F5F1EE",
                    color: i < rewardStars ? COLORS.primary : "#D8CFCA",
                  }}
                >
                  ★
                </span>
              ))}
            </div>
            <p style={{ margin: 0, fontSize: 12.5, color: COLORS.subtext }}>
              {justEarnedSticker
                ? "스티커를 획득했어요! 🎉"
                : `별 ${rewardTarget - rewardStars}개만 더 모으면 새 스티커! 🎁`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
