/**
 * Word Category Sort CAPTCHA — 랜덤 문제 생성기 (5단계 × 5문제 = 25문제)
 * ---------------------------------------------------------------
 * 게임(세션)을 시작할 때마다 단어 풀에서 랜덤으로 문제를 생성한다.
 * - 한 세션 안에서 단어가 중복되지 않도록 뽑는다.
 * - 카테고리 조합·단어 순서도 매번 달라진다.
 */

const EMOJI = {
  cat: '🐱', dog: '🐶', fish: '🐟', bird: '🐦', rabbit: '🐰', bear: '🐻', cow: '🐮',
  duck: '🦆', pig: '🐷', fox: '🦊', frog: '🐸',
  apple: '🍎', banana: '🍌', orange: '🍊', grape: '🍇', pear: '🍐', peach: '🍑',
  lemon: '🍋', melon: '🍈', kiwi: '🥝',
  pencil: '✏️', book: '📘', bag: '🎒', chair: '🪑', ruler: '📏', pen: '🖊️', crayon: '🖍️',
  red: '🔴', blue: '🔵', green: '🟢', yellow: '🟡', happy: '😊',
};

const CATS = [
  { id: 'animal', label: '동물', words: ['cat', 'dog', 'fish', 'bird', 'rabbit', 'bear', 'cow', 'duck', 'pig', 'fox', 'frog'] },
  { id: 'fruit', label: '과일', words: ['apple', 'banana', 'orange', 'grape', 'pear', 'peach', 'lemon', 'melon', 'kiwi'] },
  { id: 'supply', label: '학용품', words: ['pencil', 'book', 'bag', 'chair', 'ruler', 'pen', 'crayon'] },
];
const DISTRACTORS = ['red', 'blue', 'green', 'yellow', 'happy']; // 어느 상자에도 안 들어가는 방해 단어

const shuffle = (a) => { const x = a.slice(); for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [x[i], x[j]] = [x[j], x[i]]; } return x; };
const pick = (a) => a[Math.floor(Math.random() * a.length)];
function takeUnused(pool, used, n) {
  const fresh = shuffle(pool.filter((w) => !used.has(w)));
  const out = fresh.slice(0, n);
  while (out.length < n) { const w = pick(pool); if (!out.includes(w)) out.push(w); }
  out.forEach((w) => used.add(w));
  return out;
}
const catShape = (c) => ({ id: c.id, label: c.label });
const w = (word, cat) => ({ word, cat });

/** 세션 1회분(25문제) 생성 */
function generateQuestions() {
  const used = new Set();
  const questions = [];

  // ── 1단계: 한 카테고리 단어 1개 찾기 (보기 3) ──
  for (let i = 1; i <= 5; i++) {
    const cat = pick(CATS);
    const correct = takeUnused(cat.words, used, 1);
    const otherPool = CATS.filter((c) => c.id !== cat.id).flatMap((c) => c.words);
    const others = takeUnused(otherPool, used, 2);
    questions.push({
      id: `c1-q${i}`, stage: 1, order: i, categories: [catShape(cat)],
      prompt: `${cat.label} 단어를 찾아 상자에 넣어보세요.`, hint: '딱 하나만 골라요.',
      words: shuffle([...correct.map((x) => w(x, cat.id)), ...others.map((x) => w(x, 'none'))]),
    });
  }

  // ── 2단계: 한 카테고리 여러 개 찾기 (정답 3 + 오답 2) ──
  for (let i = 1; i <= 5; i++) {
    const cat = pick(CATS);
    const correct = takeUnused(cat.words, used, 3);
    const otherPool = CATS.filter((c) => c.id !== cat.id).flatMap((c) => c.words);
    const others = takeUnused(otherPool, used, 2);
    questions.push({
      id: `c2-q${i}`, stage: 2, order: i, categories: [catShape(cat)],
      prompt: `${cat.label} 단어를 모두 찾아 상자에 넣어보세요.`, hint: `${cat.label}이면 전부!`,
      words: shuffle([...correct.map((x) => w(x, cat.id)), ...others.map((x) => w(x, 'none'))]),
    });
  }

  // ── 3단계: 두 카테고리 분류 (2+2) ──
  for (let i = 1; i <= 5; i++) {
    const [a, b] = shuffle(CATS).slice(0, 2);
    const wordsA = takeUnused(a.words, used, 2);
    const wordsB = takeUnused(b.words, used, 2);
    questions.push({
      id: `c3-q${i}`, stage: 3, order: i, categories: [catShape(a), catShape(b)],
      prompt: '단어를 알맞은 주제 상자에 넣어보세요.', hint: `${a.label}과 ${b.label}로 나눠요.`,
      words: shuffle([...wordsA.map((x) => w(x, a.id)), ...wordsB.map((x) => w(x, b.id))]),
    });
  }

  // ── 4단계: 세 카테고리 분류 (2+2+2) ──
  for (let i = 1; i <= 5; i++) {
    const cats = shuffle(CATS);
    const items = cats.flatMap((c) => takeUnused(c.words, used, 2).map((x) => w(x, c.id)));
    questions.push({
      id: `c4-q${i}`, stage: 4, order: i, categories: cats.map(catShape),
      prompt: '각 단어가 어울리는 상자에 넣어보세요.', hint: '세 상자로 나눠요!',
      words: shuffle(items),
    });
  }

  // ── 5단계: 세 카테고리 + 방해 단어 2개 ──
  for (let i = 1; i <= 5; i++) {
    const cats = shuffle(CATS);
    const items = cats.flatMap((c) => takeUnused(c.words, used, 2).map((x) => w(x, c.id)));
    const distr = shuffle(DISTRACTORS).slice(0, 2).map((x) => w(x, 'none'));
    questions.push({
      id: `c5-q${i}`, stage: 5, order: i, categories: cats.map(catShape),
      prompt: '알맞은 단어만 골라 주제 상자에 넣어보세요.', hint: '어울리지 않는 단어는 남겨요!',
      words: shuffle([...items, ...distr]),
    });
  }

  return questions;
}

const STAGE_PASS_THRESHOLD = 4;
const TOTAL_PASS_THRESHOLD = 20;
const WORD_CORRECT_RATIO = 0.8;

module.exports = { generateQuestions, EMOJI, STAGE_PASS_THRESHOLD, TOTAL_PASS_THRESHOLD, WORD_CORRECT_RATIO };
