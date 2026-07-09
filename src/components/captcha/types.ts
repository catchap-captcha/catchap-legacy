// src/components/captcha/types.ts
export type CaptchaResult = "correct" | "retry";

export interface CaptchaHandlers {
  onSuccess: () => void;
  onRetry?: () => void;
}

export type Difficulty = "easy" | "medium" | "hard";

export interface SentenceOrderProblem {
  type: "sentence_order";
  id?: string;
  difficulty?: Difficulty;
  correctOrder: string[];
}

export interface ContextBlankProblem {
  type: "context_blank";
  id?: string;
  difficulty?: Difficulty;
  before: string;
  after: string;
  answer: string;
  options: string[];
}

export interface SpellingProblem {
  type: "spelling";
  id?: string;
  difficulty?: Difficulty;
  before: string;
  after: string;
  // Correct tiles in order (e.g. ["며", "칠"]) plus extra wrong tiles mixed
  // into the tray (e.g. ["몇", "일"]) — the student builds the answer by
  // assembling tiles instead of picking a whole pre-written word.
  tiles: string[];
  decoys: string[];
}

export interface WordMatchPair {
  word: string;
  partner: string;
}

export interface WordMatchProblem {
  type: "word_match";
  id?: string;
  difficulty?: Difficulty;
  relation: "synonym" | "antonym";
  pairs: WordMatchPair[];
}

export interface FactOpinionStatement {
  text: string;
  tag: "사실" | "의견";
}

export interface FactOpinionProblem {
  type: "fact_opinion";
  id?: string;
  difficulty?: Difficulty;
  statements: FactOpinionStatement[];
}

export interface SpacingDictationProblem {
  type: "spacing_dictation";
  id?: string;
  difficulty?: Difficulty;
  // Spoken aloud via TTS and typed against exactly (including spacing).
  sentence: string;
  // Shown only after a wrong attempt, explains the spacing rule being tested.
  hint: string;
}

export interface IdiomProblem {
  type: "idiom";
  id?: string;
  difficulty?: Difficulty;
  before: string;
  idiom: string;
  after: string;
  answer: string;
  options: string[];
}

export interface CharacterFeelingProblem {
  type: "character_feeling";
  id?: string;
  difficulty?: Difficulty;
  situation: string;
  answer: string;
  options: string[];
}

export interface ExpressionProblem {
  type: "expression";
  id?: string;
  difficulty?: Difficulty;
  // highlight is the plain (non-honorific) word or phrase to retype as its honorific form.
  before: string;
  highlight: string;
  after: string;
  answer: string;
}

export interface FindStructureProblem {
  type: "sentence_structure";
  id?: string;
  difficulty?: Difficulty;
  mode: "find";
  tokens: string[];
  targetLabel: "주어" | "서술어" | "목적어";
  answerIndex: number;
}

export interface ClassifyStructureProblem {
  type: "sentence_structure";
  id?: string;
  difficulty?: Difficulty;
  mode: "classify";
  sentence: string;
  options: string[];
  answer: string;
}

export type SentenceStructureProblem = FindStructureProblem | ClassifyStructureProblem;

export interface MainIdeaOption {
  text: string;
  correct: boolean;
  // Shown after the option is picked, whether right or wrong.
  rationale: string;
}

export interface MainIdeaProblem {
  type: "main_idea";
  id?: string;
  difficulty?: Difficulty;
  paragraph: string;
  prompt: string;
  options: MainIdeaOption[];
}

export interface PunctuationProblem {
  type: "punctuation";
  id?: string;
  difficulty?: Difficulty;
  // Label shown in the instruction, e.g. "쉼표( , )" or "물음표( ? )".
  markLabel: string;
  tokens: string[];
  // Tappable slots, each the gap right after tokens[gapIndex]. Some are
  // decoys; the student must select exactly the ones in correctGaps.
  candidateGaps: number[];
  correctGaps: number[];
}

export interface CrosswordWordSlot {
  // Clue number shown both on the grid's starting cell and in the hint list
  // (e.g. 1~5) — always unique per word, even when two words start on the
  // same cell (no shared "1 Across / 1 Down" numbering).
  number: number;
  direction: "across" | "down";
  row: number;
  col: number;
  answer: string;
  hint: string;
  // Leading consonant of each syllable (e.g. "바다" -> "ㅂㄷ"), authored in
  // data rather than derived at render time — see CrosswordCaptcha.
  choseong: string;
}

export interface CrosswordProblem {
  type: "crossword";
  id?: string;
  difficulty?: Difficulty;
  // Drives how much help CrosswordCaptcha shows (first-letter reveal,
  // choseong hint, decoy count/theme) — see CrosswordCaptcha's LEVEL_CONFIG.
  level: 1 | 2 | 3 | 4 | 5;
  // Grid is size x size; unused cells simply have no word covering them.
  size: number;
  // Always 3 across + 2 down (5 words total) — see CrosswordCaptcha.
  words: CrosswordWordSlot[];
  // Extra wrong letters mixed into the letter-tile bank. The correct
  // letters are derived from `words` automatically, one tile per grid cell.
  decoys: string[];
}

export type CaptchaProblem =
  | SentenceOrderProblem
  | ContextBlankProblem
  | SpellingProblem
  | WordMatchProblem
  | FactOpinionProblem
  | SpacingDictationProblem
  | IdiomProblem
  | CharacterFeelingProblem
  | ExpressionProblem
  | SentenceStructureProblem
  | MainIdeaProblem
  | PunctuationProblem
  | CrosswordProblem;
