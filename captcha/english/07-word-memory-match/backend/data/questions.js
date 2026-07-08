/**
 * Word Memory Match CAPTCHA — 랜덤 문제 생성기 (5단계 × 5문제 = 25문제)
 * ---------------------------------------------------------------
 * 게임(세션)을 시작할 때마다 단어 풀에서 랜덤으로 짝 카드를 생성한다.
 * - 한 세션 안에서 짝 단어가 중복되지 않도록 뽑는다.
 * - 카드 배치(board)도 매번 무작위로 섞인다.
 * - 카드 짝 정보(key)는 서버 board 에만 있고 클라이언트로 안 내려간다.
 */

const EMOJI = {
  cat: '🐱', dog: '🐶', fish: '🐟', bird: '🐦', rabbit: '🐰', bear: '🐻', cow: '🐮',
  duck: '🦆', pig: '🐷', fox: '🦊', frog: '🐸',
  apple: '🍎', banana: '🍌', orange: '🍊', grape: '🍇', pear: '🍐', peach: '🍑',
  book: '📘', pencil: '✏️', bag: '🎒', chair: '🪑', pen: '🖊️', ruler: '📏',
  ball: '⚽', cap: '🧢', car: '🚗', bus: '🚌', sun: '☀️', milk: '🥛', cake: '🎂', pan: '🍳',
};
const ALL_WORDS = Object.keys(EMOJI);

/** 4단계 유사 단어 짝 (헷갈림 유도) — 두 단어 모두 이모지 존재 */
const SIMILAR_PAIRS = [
  ['cat', 'cap'], ['bear', 'pear'], ['pen', 'pan'], ['dog', 'duck'], ['cat', 'car'], ['peach', 'pear'],
];

const shuffle = (a) => { const x = a.slice(); for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [x[i], x[j]] = [x[j], x[i]]; } return x; };
const pick = (a) => a[Math.floor(Math.random() * a.length)];
function takeUnused(pool, used, n) {
  const fresh = shuffle(pool.filter((w) => !used.has(w)));
  const out = fresh.slice(0, n);
  while (out.length < n) { const w = pick(pool); if (!out.includes(w)) out.push(w); }
  out.forEach((w) => used.add(w));
  return out;
}
const toPairs = (words) => words.map((word) => ({ key: word, image: EMOJI[word], word }));

/** pairs → 무작위로 섞인 board (각 카드: {id, type, value, key}) */
function buildBoard(pairs) {
  const cards = [];
  pairs.forEach((p) => {
    cards.push({ type: 'image', value: p.image, key: p.key });
    cards.push({ type: 'word', value: p.word, key: p.key });
  });
  const shuffled = shuffle(cards);
  shuffled.forEach((c, i) => { c.id = 'c' + i; }); // 셔플 후 순번 id → id로는 짝을 알 수 없음
  return shuffled;
}

/** 세션 1회분(25문제) 생성 */
function generateQuestions() {
  const used = new Set();
  const questions = [];
  const add = (q) => { q.board = buildBoard(q.pairs); questions.push(q); };

  // ── 1단계: 1쌍 (카드 2장) ──
  for (let i = 1; i <= 5; i++) {
    add({ id: `k1-q${i}`, stage: 1, order: i, pairs: toPairs(takeUnused(ALL_WORDS, used, 1)) });
  }
  // ── 2단계: 2쌍 (카드 4장) ──
  for (let i = 1; i <= 5; i++) {
    add({ id: `k2-q${i}`, stage: 2, order: i, pairs: toPairs(takeUnused(ALL_WORDS, used, 2)) });
  }
  // ── 3단계: 3쌍 (카드 6장) ──
  for (let i = 1; i <= 5; i++) {
    add({ id: `k3-q${i}`, stage: 3, order: i, pairs: toPairs(takeUnused(ALL_WORDS, used, 3)) });
  }
  // ── 4단계: 유사 단어 짝 (카드 4장) ──
  const simGroups = shuffle(SIMILAR_PAIRS);
  for (let i = 1; i <= 5; i++) {
    const pair = simGroups[(i - 1) % simGroups.length];
    pair.forEach((w) => used.add(w));
    add({ id: `k4-q${i}`, stage: 4, order: i, similarPairs: [pair.slice()], pairs: toPairs(pair) });
  }
  // ── 5단계: 시간 제한 + 4쌍 (카드 8장) ──
  for (let i = 1; i <= 5; i++) {
    add({
      id: `k5-q${i}`, stage: 5, order: i,
      timeLimitMs: 60000 + (Math.floor(Math.random() * 3) * 5000), // 60~70초
      pairs: toPairs(takeUnused(ALL_WORDS, used, 4)),
    });
  }

  return questions;
}

const STAGE_PASS_THRESHOLD = 4;
const TOTAL_PASS_THRESHOLD = 20;

module.exports = { generateQuestions, STAGE_PASS_THRESHOLD, TOTAL_PASS_THRESHOLD, EMOJI };
