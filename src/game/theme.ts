// src/game/theme.ts
export const COLORS = {
  primary: "#EF6F5C",
  primaryDark: "#C6503F",
  primaryLight: "#FFE8E3",
  border: "#FFD9CD",
  text: "#3A2E2A",
  subtext: "#A6968F",
  success: "#4CAF7D",
  successLight: "#E8F8EF",
  danger: "#E2574C",
  dangerLight: "#FCE7E4",
  gold: "#F2A93B",
  goldLight: "#FDECD1",
  cardBg: "#FFFFFF",
  inactiveBorder: "#EADFDA",
};

export interface Subject {
  key: string;
  icon: string;
  label: string;
  active: boolean;
  // Only used for the "coming soon" subject cards on the home page.
  description?: string;
  gradient?: string;
}

// "국어" is the only subject with real chapters right now; the rest are
// shown throughout the app (tabs, home page) as a preview of what's coming.
export const SUBJECTS: Subject[] = [
  { key: "korean", icon: "Aa", label: "국어", active: true, description: "글자와 낱말을 놀이로 익혀요", gradient: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})` },
  { key: "english", icon: "🌐", label: "영어", active: false, description: "알파벳과 쉬운 단어를 만나요", gradient: "linear-gradient(135deg, #F2A93B, #C97F1E)" },
  { key: "math", icon: "📐", label: "수학", active: false, description: "숫자와 도형을 놀이로 배워요", gradient: "linear-gradient(135deg, #5B9BD5, #3A6EA5)" },
  { key: "science", icon: "🧪", label: "과학", active: false, description: "우리 주변의 신기한 현상을 탐구해요", gradient: "linear-gradient(135deg, #63B37B, #3E8A5A)" },
  { key: "history", icon: "📖", label: "역사", active: false, description: "옛이야기 속 우리 역사를 배워요", gradient: "linear-gradient(135deg, #A67C52, #7A5A3A)" },
  { key: "life", icon: "🏠", label: "생활", active: false, description: "일상 속 지혜를 함께 익혀요", gradient: "linear-gradient(135deg, #A65B8C, #7A3F66)" },
];
