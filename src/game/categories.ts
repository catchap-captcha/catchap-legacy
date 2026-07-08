// src/game/categories.ts
import {
  SentenceOrderCaptcha,
  ContextBlankCaptcha,
  SpellingCaptcha,
  WordMatchCaptcha,
  FactOpinionCaptcha,
  SpacingDictationCaptcha,
  IdiomCaptcha,
  CharacterFeelingCaptcha,
  ExpressionCaptcha,
  SentenceStructureCaptcha,
  MainIdeaCaptcha,
  PunctuationCaptcha,
} from "../components/captcha";
import type {
  CaptchaHandlers,
  CaptchaProblem,
  SentenceOrderProblem,
  ContextBlankProblem,
  SpellingProblem,
  WordMatchProblem,
  FactOpinionProblem,
  SpacingDictationProblem,
  IdiomProblem,
  CharacterFeelingProblem,
  ExpressionProblem,
  SentenceStructureProblem,
  MainIdeaProblem,
  PunctuationProblem,
} from "../components/captcha/types";
import {
  sentenceOrderPool,
  contextBlankPool,
  spellingPool,
  wordMatchPool,
  factOpinionPool,
  spacingDictationPool,
  idiomPool,
  characterFeelingPool,
  expressionPool,
  sentenceStructurePool,
  mainIdeaPool,
  punctuationPool,
} from "../data/problemPools";

export interface CategoryConfig<P extends CaptchaProblem = CaptchaProblem> {
  key: string;
  path: string;
  tagLabel: string;
  emoji: string;
  title: string;
  shortTitle: string;
  subtitle: string;
  pool: P[];
  Component: React.ComponentType<{ problem: P } & CaptchaHandlers>;
}

// Every chapter's 25-problem pool is split into 5 equal stages (5 problems
// each), in the pool's existing easy→medium→hard order — so the stages
// still ramp up in difficulty even though they don't line up exactly with
// the difficulty-tier boundaries.
export const STAGE_COUNT = 5;
export const STAGE_LABELS = ["기초 익히기", "기초 다지기", "조금 더 어렵게", "도전 문제", "마스터 챌린지"];

export function getStagePool(category: CategoryConfig, stageIndex: number): CaptchaProblem[] {
  const size = Math.ceil(category.pool.length / STAGE_COUNT);
  return category.pool.slice(stageIndex * size, stageIndex * size + size);
}

// Each entry is fully type-checked against its own problem type P here;
// the cast below only erases that type for storage in one heterogeneous array.
function defineCategory<P extends CaptchaProblem>(
  config: CategoryConfig<P>
): CategoryConfig {
  return config as unknown as CategoryConfig;
}

export const categories: CategoryConfig[] = [
  defineCategory<SentenceOrderProblem>({
    key: "sentence-order",
    path: "/sentence-order",
    tagLabel: "문장배열·한글",
    emoji: "✏️",
    title: "4학년 · 문장 순서 배열",
    shortTitle: "문장 순서 배열",
    subtitle: "어절을 순서에 맞게 옮겨 문장을 완성해요",
    pool: sentenceOrderPool,
    Component: SentenceOrderCaptcha,
  }),
  defineCategory<ContextBlankProblem>({
    key: "context-blank",
    path: "/context-blank",
    tagLabel: "빈칸추론·한글",
    emoji: "🧩",
    title: "4학년 · 빈칸에 들어갈 낱말 고르기",
    shortTitle: "빈칸 낱말 고르기",
    subtitle: "문장을 읽고 빈칸에 알맞은 낱말을 클릭해요",
    pool: contextBlankPool,
    Component: ContextBlankCaptcha,
  }),
  defineCategory<SpellingProblem>({
    key: "spelling",
    path: "/spelling",
    tagLabel: "맞춤법·한글",
    emoji: "✍️",
    title: "4학년 · 맞춤법 맞추기",
    shortTitle: "맞춤법 맞추기",
    subtitle: "글자 조각을 모아 올바른 낱말을 완성해요",
    pool: spellingPool,
    Component: SpellingCaptcha,
  }),
  defineCategory<WordMatchProblem>({
    key: "word-match",
    path: "/word-match",
    tagLabel: "비슷한말·반대말",
    emoji: "🔗",
    title: "4학년 · 비슷한말·반대말 짝짓기",
    shortTitle: "비슷한말·반대말",
    subtitle: "뜻이 통하는 낱말을 드래그해서 짝지어요",
    pool: wordMatchPool,
    Component: WordMatchCaptcha,
  }),
  defineCategory<FactOpinionProblem>({
    key: "fact-opinion",
    path: "/fact-opinion",
    tagLabel: "사실·의견",
    emoji: "🗂️",
    title: "4학년 · 사실과 의견 구별하기",
    shortTitle: "사실과 의견 구별",
    subtitle: "문장을 사실 또는 의견 바구니로 드래그해요",
    pool: factOpinionPool,
    Component: FactOpinionCaptcha,
  }),
  defineCategory<SpacingDictationProblem>({
    key: "spacing-dictation",
    path: "/spacing-dictation",
    tagLabel: "띄어쓰기·받아쓰기",
    emoji: "🎧",
    title: "4학년 · 띄어쓰기 받아쓰기",
    shortTitle: "띄어쓰기 받아쓰기",
    subtitle: "문장을 듣고 띄어쓰기까지 정확하게 입력해요",
    pool: spacingDictationPool,
    Component: SpacingDictationCaptcha,
  }),
  defineCategory<IdiomProblem>({
    key: "idiom",
    path: "/idiom",
    tagLabel: "속담·관용구",
    emoji: "💬",
    title: "4학년 · 속담·관용 표현 뜻 짐작하기",
    shortTitle: "속담·관용구 뜻",
    subtitle: "문장 속 상황을 보고 표현의 뜻을 클릭해요",
    pool: idiomPool,
    Component: IdiomCaptcha,
  }),
  defineCategory<CharacterFeelingProblem>({
    key: "character-feeling",
    path: "/character-feeling",
    tagLabel: "인물의 마음",
    emoji: "🎭",
    title: "4학년 · 인물의 마음 짐작하기",
    shortTitle: "인물의 마음 짐작",
    subtitle: "상황을 읽고 인물의 마음에 맞는 표정을 클릭해요",
    pool: characterFeelingPool,
    Component: CharacterFeelingCaptcha,
  }),
  defineCategory<ExpressionProblem>({
    key: "expression",
    path: "/expression",
    tagLabel: "높임말",
    emoji: "🗣️",
    title: "4학년 · 높임말 바꿔 쓰기",
    shortTitle: "높임말 바꿔 쓰기",
    subtitle: "밑줄 친 낱말을 알맞은 높임말로 바꾸어 입력해요",
    pool: expressionPool,
    Component: ExpressionCaptcha,
  }),
  defineCategory<SentenceStructureProblem>({
    key: "sentence-structure",
    path: "/sentence-structure",
    tagLabel: "문장의 짜임",
    emoji: "🧱",
    title: "4학년 · 문장의 짜임",
    shortTitle: "문장의 짜임",
    subtitle: "문장 성분과 홑문장·겹문장을 클릭해서 찾아요",
    pool: sentenceStructurePool,
    Component: SentenceStructureCaptcha,
  }),
  defineCategory<MainIdeaProblem>({
    key: "main-idea",
    path: "/main-idea",
    tagLabel: "중심 생각",
    emoji: "🔍",
    title: "4학년 · 중심 생각·문단 요약",
    shortTitle: "중심 생각·요약",
    subtitle: "글을 읽고 중심 생각과 요약을 클릭해요",
    pool: mainIdeaPool,
    Component: MainIdeaCaptcha,
  }),
  defineCategory<PunctuationProblem>({
    key: "punctuation",
    path: "/punctuation",
    tagLabel: "문장 부호",
    emoji: "❕",
    title: "4학년 · 문장 부호 바로 쓰기",
    shortTitle: "문장 부호 바로 쓰기",
    subtitle: "부호가 들어갈 자리를 모두 찾아 탭해요",
    pool: punctuationPool,
    Component: PunctuationCaptcha,
  }),
];
