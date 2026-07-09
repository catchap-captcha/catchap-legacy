// src/api/captchaTypeMap.ts
// type -> Component lookup for problems fetched from the REST API. Reuses
// the exact same components the main game uses (src/components/captcha) —
// no copies. The `as unknown as` cast only erases each component's own exact
// problem subtype for storage in one map, same pattern as
// src/game/categories.ts's defineCategory helper.
import type { ComponentType } from "react";
import SentenceOrderCaptcha from "../components/captcha/SentenceOrderCaptcha";
import ContextBlankCaptcha from "../components/captcha/ContextBlankCaptcha";
import SpellingCaptcha from "../components/captcha/SpellingCaptcha";
import WordMatchCaptcha from "../components/captcha/WordMatchCaptcha";
import FactOpinionCaptcha from "../components/captcha/FactOpinionCaptcha";
import SpacingDictationCaptcha from "../components/captcha/SpacingDictationCaptcha";
import IdiomCaptcha from "../components/captcha/IdiomCaptcha";
import CharacterFeelingCaptcha from "../components/captcha/CharacterFeelingCaptcha";
import ExpressionCaptcha from "../components/captcha/ExpressionCaptcha";
import SentenceStructureCaptcha from "../components/captcha/SentenceStructureCaptcha";
import MainIdeaCaptcha from "../components/captcha/MainIdeaCaptcha";
import PunctuationCaptcha from "../components/captcha/PunctuationCaptcha";
import type { CaptchaHandlers, CaptchaProblem } from "../components/captcha/types";

type AnyCaptchaComponent = ComponentType<{ problem: CaptchaProblem } & CaptchaHandlers>;

export const CAPTCHA_COMPONENTS: Record<CaptchaProblem["type"], AnyCaptchaComponent> = {
  sentence_order: SentenceOrderCaptcha,
  context_blank: ContextBlankCaptcha,
  spelling: SpellingCaptcha,
  word_match: WordMatchCaptcha,
  fact_opinion: FactOpinionCaptcha,
  spacing_dictation: SpacingDictationCaptcha,
  idiom: IdiomCaptcha,
  character_feeling: CharacterFeelingCaptcha,
  expression: ExpressionCaptcha,
  sentence_structure: SentenceStructureCaptcha,
  main_idea: MainIdeaCaptcha,
  punctuation: PunctuationCaptcha,
} as unknown as Record<CaptchaProblem["type"], AnyCaptchaComponent>;

export const CAPTCHA_TYPE_LABELS: Record<CaptchaProblem["type"], string> = {
  sentence_order: "문장 순서 배열",
  context_blank: "빈칸 낱말 고르기",
  spelling: "맞춤법 맞추기",
  word_match: "비슷한말·반대말 짝짓기",
  fact_opinion: "사실과 의견 구별",
  spacing_dictation: "띄어쓰기 받아쓰기",
  idiom: "속담·관용구 뜻",
  character_feeling: "인물의 마음 짐작",
  expression: "높임말 바꿔 쓰기",
  sentence_structure: "문장의 짜임",
  main_idea: "중심 생각·요약",
  punctuation: "문장 부호 바로 쓰기",
};
