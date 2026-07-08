/**
 * Word Puzzle CAPTCHA — 랜덤 문제 생성기 (5단계 × 5문제 = 25문제)
 * ---------------------------------------------------------------
 * 게임(세션)을 시작할 때마다 단어 풀에서 랜덤으로 문제를 생성한다.
 * - 한 세션 안에서 정답 단어가 중복되지 않도록 뽑는다.
 * - 알파벳 섞는 순서·방해 글자도 매번 달라진다.
 */

const EMOJI = {
  cat: '🐱', dog: '🐶', sun: '☀️', pen: '🖊️', bus: '🚌', cap: '🧢', car: '🚗', cow: '🐮', pig: '🐷', egg: '🥚', fox: '🦊',
  book: '📘', fish: '🐟', cake: '🎂', ball: '⚽', bird: '🐦', bear: '🐻', pear: '🍐', duck: '🦆', milk: '🥛', frog: '🐸',
  apple: '🍎', grape: '🍇', peach: '🍑', lemon: '🍋', melon: '🍈', chair: '🪑', ruler: '📏',
  banana: '🍌', rabbit: '🐰', orange: '🍊', pencil: '✏️',
};
const ALL_WORDS = Object.keys(EMOJI);
const LEN3 = ALL_WORDS.filter((w) => w.length === 3);
const LEN4 = ALL_WORDS.filter((w) => w.length === 4);
const LEN34 = ALL_WORDS.filter((w) => w.length <= 4);
const LEN56 = ALL_WORDS.filter((w) => w.length >= 5);
const CATEGORIES = {
  '동물': ['cat', 'dog', 'cow', 'pig', 'fox', 'fish', 'bird', 'bear', 'duck', 'frog', 'rabbit'],
  '과일': ['pear', 'apple', 'grape', 'peach', 'lemon', 'melon', 'banana', 'orange'],
  '학용품': ['pen', 'book', 'chair', 'ruler', 'pencil'],
};

const ALPHA = 'abcdefghijklmnopqrstuvwxyz';
const shuffle = (a) => { const x = a.slice(); for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [x[i], x[j]] = [x[j], x[i]]; } return x; };
const pick = (a) => a[Math.floor(Math.random() * a.length)];
function pickUnused(pool, used) {
  const fresh = pool.filter((w) => !used.has(w));
  const w = fresh.length ? pick(fresh) : pick(pool);
  used.add(w);
  return w;
}
/** 원래 철자와 다른 순서가 되도록 섞기 */
function shuffledLetters(word, extra = []) {
  const base = [...word.split(''), ...extra];
  for (let t = 0; t < 10; t++) {
    const s = shuffle(base);
    if (s.join('') !== word + extra.join('')) return s;
  }
  return shuffle(base);
}
/** 정답에 없는 방해 알파벳 n개 */
function distractorLetters(word, n) {
  const out = [];
  while (out.length < n) {
    const r = ALPHA[Math.floor(Math.random() * 26)];
    if (!word.includes(r) && !out.includes(r)) out.push(r);
  }
  return out;
}

/** 세션 1회분(25문제) 생성 */
function generateQuestions() {
  const used = new Set();
  const questions = [];

  // ── 1단계: 3글자 단어 ──
  for (let i = 1; i <= 5; i++) {
    const word = pickUnused(LEN3, used);
    questions.push({
      id: `p1-q${i}`, stage: 1, order: i, word, image: EMOJI[word], category: null,
      letters: shuffledLetters(word),
      prompt: '그림을 보고 알파벳을 순서대로 놓아 단어를 완성해보세요.', hint: '3글자 단어예요!',
    });
  }

  // ── 2단계: 4글자 단어 ──
  for (let i = 1; i <= 5; i++) {
    const word = pickUnused(LEN4, used);
    questions.push({
      id: `p2-q${i}`, stage: 2, order: i, word, image: EMOJI[word], category: null,
      letters: shuffledLetters(word),
      prompt: '알파벳을 바르게 옮겨 영어 단어를 완성해보세요.', hint: '4글자 단어예요!',
    });
  }

  // ── 3단계: 방해 알파벳 포함 (3~4글자 + 1~2개) ──
  for (let i = 1; i <= 5; i++) {
    const word = pickUnused(LEN34, used);
    const extra = distractorLetters(word, word.length <= 3 ? 1 : 2);
    questions.push({
      id: `p3-q${i}`, stage: 3, order: i, word, image: EMOJI[word], category: null,
      letters: shuffledLetters(word, extra),
      prompt: '필요한 알파벳만 골라 단어를 완성해보세요.', hint: '필요 없는 글자는 남겨요!',
    });
  }

  // ── 4단계: 긴 단어 (5~6글자) ──
  for (let i = 1; i <= 5; i++) {
    const word = pickUnused(LEN56, used);
    questions.push({
      id: `p4-q${i}`, stage: 4, order: i, word, image: EMOJI[word], category: null,
      letters: shuffledLetters(word),
      prompt: '긴 단어도 차근차근 알파벳을 놓아 완성해보세요.', hint: `${word.length}글자 단어예요!`,
    });
  }

  // ── 5단계: 그림 없이 카테고리 힌트만 ──
  const catNames = shuffle(Object.keys(CATEGORIES));
  for (let i = 1; i <= 5; i++) {
    const catName = catNames[i % catNames.length];
    const word = pickUnused(CATEGORIES[catName], used);
    questions.push({
      id: `p5-q${i}`, stage: 5, order: i, word, image: null, category: catName,
      letters: shuffledLetters(word),
      prompt: '힌트를 보고 알파벳을 순서대로 놓아 단어를 완성해보세요.', hint: `${catName} 단어예요.`,
    });
  }

  return questions;
}

const STAGE_PASS_THRESHOLD = 4;
const TOTAL_PASS_THRESHOLD = 20;

module.exports = { generateQuestions, STAGE_PASS_THRESHOLD, TOTAL_PASS_THRESHOLD, EMOJI };
