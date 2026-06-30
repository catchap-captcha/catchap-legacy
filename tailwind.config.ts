import type { Config } from 'tailwindcss'

// preflight(전역 base 리셋)을 끄두어 인라인 스타일 기반의 기존 public/student
// 페이지 레이아웃이 깨지지 않도록 한다. 학부모(PAR) 페이지의 유틸리티 클래스만 활성화.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config
