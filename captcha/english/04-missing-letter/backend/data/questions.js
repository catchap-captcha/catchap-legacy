/**
 * Missing Letter CAPTCHA — 랜덤 문제 생성기 (5단계 × 5문제 = 25문제)
 * ---------------------------------------------------------------
 * 게임(세션)을 시작할 때마다 단어 풀에서 랜덤으로 문제를 생성한다.
 * - 한 세션 안에서 정답 단어가 중복되지 않도록 뽑는다.
 * - 빈칸 위치·보기 알파벳 순서도 매번 달라진다.
 */

const EMOJI = {
  cat: '🐱', dog: '🐶', sun: '☀️', pen: '🖊️', bus: '🚌', cap: '🧢', car: '🚗', cow: '🐮', pig: '🐷', egg: '🥚', fox: '🦊',
  book: '📘', fish: '🐟', cake: '🎂', ball: '⚽', bird: '🐦', bear: '🐻', pear: '🍐', duck: '🦆', milk: '🥛', frog: '🐸',
  apple: '🍎', grape: '🍇', peach: '🍑', lemon: '🍋', melon: '🍈', chair: '🪑', ruler: '📏',
  banana: '🍌', rabbit: '🐰', orange: '🍊', pencil: '✏️',
};
const ALL_WORDS = Object.keys(EMOJI);
const SHORT = ALL_WORDS.filter((w) => w.length === 3);           // 1단계
const MID = ALL_WORDS.filter((w) => w.length === 4);             // 2·3단계
const LONG = ALL_WORDS.filter((w) => w.length >= 4);             // 4단계
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
/** 정답 글자들 + 랜덤 오답 글자로 보기 구성 */
function buildOptions(targetLetters, total) {
  const opts = targetLetters.slice();
  while (opts.length < total) {
    const r = ALPHA[Math.floor(Math.random() * 26)];
    if (!targetLetters.includes(r) && !opts.includes(r)) opts.push(r);
  }
  return shuffle(opts);
}

/** 세션 1회분(25문제) 생성 */
function generateQuestions() {
  const used = new Set();
  const questions = [];

  // ── 1단계: 그림 + 가운데 빈칸 (보기 2) ──
  for (let i = 1; i <= 5; i++) {
    const word = pickUnused(SHORT, used);
    const blank = 1; // 3글자 단어의 가운데
    questions.push({
      id: `m1-q${i}`, stage: 1, order: i, word, image: EMOJI[word], category: null,
      blanks: [blank], options: buildOptions([word[blank]], 2),
      prompt: '그림을 보고 빠진 알파벳을 골라보세요.', hint: '그림이 힌트예요!',
    });
  }

  // ── 2단계: 그림 + 빈칸 (보기 4) ──
  for (let i = 1; i <= 5; i++) {
    const word = pickUnused(MID, used);
    const blank = 1 + Math.floor(Math.random() * (word.length - 2)); // 가운데 글자 중 하나
    questions.push({
      id: `m2-q${i}`, stage: 2, order: i, word, image: EMOJI[word], category: null,
      blanks: [blank], options: buildOptions([word[blank]], 4),
      prompt: '빠진 알파벳을 찾아 단어를 완성해보세요.', hint: '그림이 힌트예요!',
    });
  }

  // ── 3단계: 첫 글자·끝 글자 (보기 4) ──
  for (let i = 1; i <= 5; i++) {
    const word = pickUnused([...SHORT, ...MID], used);
    const blank = Math.random() < 0.5 ? 0 : word.length - 1;
    const opts = buildOptions([word[blank]], 4);
    const wrongTypes = {};
    opts.forEach((l) => { if (l !== word[blank]) wrongTypes[l] = 'similar'; });
    questions.push({
      id: `m3-q${i}`, stage: 3, order: i, word, image: EMOJI[word], category: null,
      blanks: [blank], options: opts, wrongTypes,
      prompt: '단어의 처음이나 끝에 들어갈 알파벳을 골라보세요.',
      hint: blank === 0 ? '첫 글자!' : '끝 글자!',
    });
  }

  // ── 4단계: 여러 빈칸 (2개, 순서대로) ──
  for (let i = 1; i <= 5; i++) {
    const word = pickUnused(LONG, used);
    const idxs = shuffle([...Array(word.length).keys()]).slice(0, 2).sort((a, b) => a - b);
    const targets = idxs.map((k) => word[k]);
    questions.push({
      id: `m4-q${i}`, stage: 4, order: i, word, image: EMOJI[word], category: null,
      blanks: idxs, options: buildOptions(targets, 4),
      prompt: '빠진 알파벳들을 순서대로 넣어 단어를 완성해보세요.', hint: '빈칸 2개를 채워요!',
    });
  }

  // ── 5단계: 그림 없이 카테고리 힌트만 ──
  const catNames = shuffle(Object.keys(CATEGORIES));
  for (let i = 1; i <= 5; i++) {
    const catName = catNames[i % catNames.length];
    const word = pickUnused(CATEGORIES[catName], used);
    const blank = Math.floor(Math.random() * word.length);
    questions.push({
      id: `m5-q${i}`, stage: 5, order: i, word, image: null, category: catName,
      blanks: [blank], options: buildOptions([word[blank]], 4),
      prompt: '힌트를 보고 빠진 알파벳을 채워 단어를 완성해보세요.', hint: '그림 없이 도전!',
    });
  }

  return questions;
}

const STAGE_PASS_THRESHOLD = 4;
const TOTAL_PASS_THRESHOLD = 20;

module.exports = { generateQuestions, STAGE_PASS_THRESHOLD, TOTAL_PASS_THRESHOLD, EMOJI };
