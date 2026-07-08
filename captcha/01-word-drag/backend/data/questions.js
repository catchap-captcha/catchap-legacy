/**
 * Word Drag CAPTCHA — 랜덤 문제 생성기 (5단계 × 5문제 = 25문제)
 * ---------------------------------------------------------------
 * 게임(세션)을 시작할 때마다 단어 풀에서 랜덤으로 문제를 생성한다.
 * - 한 세션 안에서 정답 단어가 중복되지 않도록 뽑는다.
 * - 보기 순서도 매번 섞인다.
 * - 생성된 문제는 routes/captcha.js 가 세션별로 저장하고 채점한다.
 */

const EMOJI = {
  cat: '🐱', dog: '🐶', fish: '🐟', bird: '🐦', rabbit: '🐰', bear: '🐻', cow: '🐮',
  duck: '🦆', pig: '🐷', fox: '🦊', frog: '🐸', lion: '🦁',
  apple: '🍎', banana: '🍌', orange: '🍊', grape: '🍇', pear: '🍐', peach: '🍑',
  lemon: '🍋', melon: '🍈', kiwi: '🥝',
  book: '📘', pencil: '✏️', bag: '🎒', chair: '🪑', pen: '🖊️', ruler: '📏', crayon: '🖍️',
  ball: '⚽', cap: '🧢', car: '🚗', bus: '🚌', sun: '☀️', milk: '🥛', cake: '🎂', egg: '🥚',
};

const CATEGORIES = {
  '동물': ['cat', 'dog', 'fish', 'bird', 'rabbit', 'bear', 'cow', 'duck', 'pig', 'fox', 'frog', 'lion'],
  '과일': ['apple', 'banana', 'orange', 'grape', 'pear', 'peach', 'lemon', 'melon', 'kiwi'],
  '학용품': ['book', 'pencil', 'bag', 'chair', 'pen', 'ruler', 'crayon'],
  '생활': ['ball', 'cap', 'car', 'bus', 'sun', 'milk', 'cake', 'egg'],
};
const ALL_WORDS = Object.values(CATEGORIES).flat();

/** 철자·발음이 비슷한 단어 그룹 (3단계용) */
const SIMILAR_GROUPS = [
  ['cat', 'cap', 'car', 'cow'],
  ['bear', 'pear', 'pen', 'peach'],
  ['book', 'ball', 'bird', 'bus'],
  ['pig', 'pen', 'pear', 'pencil'],
  ['bag', 'ball', 'bear', 'banana'],
  ['duck', 'dog', 'fox', 'frog'],
];

// ── 랜덤 유틸 ──
const shuffle = (a) => { const x = a.slice(); for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [x[i], x[j]] = [x[j], x[i]]; } return x; };
const pick = (a) => a[Math.floor(Math.random() * a.length)];

/** used 집합을 피해서 뽑는 헬퍼 (모두 사용됐으면 아무거나) */
function pickUnused(pool, used) {
  const fresh = pool.filter((w) => !used.has(w));
  const w = fresh.length ? pick(fresh) : pick(pool);
  used.add(w);
  return w;
}
function sampleOthers(exclude, n) {
  const pool = ALL_WORDS.filter((w) => !exclude.includes(w));
  return shuffle(pool).slice(0, n);
}
function categoryOf(word) {
  for (const [k, ws] of Object.entries(CATEGORIES)) if (ws.includes(word)) return k;
  return null;
}

/** 세션 1회분(25문제) 생성 */
function generateQuestions() {
  const used = new Set(); // 세션 내 정답 단어 중복 방지
  const questions = [];

  // ── 1단계: 그림 1 + 보기 2 ──
  for (let i = 1; i <= 5; i++) {
    const answer = pickUnused(ALL_WORDS, used);
    const options = shuffle([answer, ...sampleOthers([answer], 1)]);
    questions.push({
      id: `l1-q${i}`, stage: 1, order: i, type: 'single',
      prompt: '이 그림은 영어로 뭘까요?',
      hint: '그림에 맞는 영어 단어를 끌어다 놓아보세요.',
      images: [EMOJI[answer]], options, answer,
    });
  }

  // ── 2단계: 그림 1 + 보기 4 ──
  for (let i = 1; i <= 5; i++) {
    const answer = pickUnused(ALL_WORDS, used);
    const options = shuffle([answer, ...sampleOthers([answer], 3)]);
    questions.push({
      id: `l2-q${i}`, stage: 2, order: i, type: 'single',
      prompt: '이 그림에 맞는 영어 단어를 골라보세요.',
      hint: '알맞은 영어 단어를 골라 그림 위에 놓아보세요.',
      images: [EMOJI[answer]], options, answer,
    });
  }

  // ── 3단계: 비슷한 단어 그룹에서 정답 고르기 ──
  const groups = shuffle(SIMILAR_GROUPS).slice(0, 5);
  groups.forEach((group, idx) => {
    const answer = pickUnused(group, used); // 그룹 안에서 아직 안 쓴 단어 우선
    const wrongTypes = {};
    group.forEach((w) => { if (w !== answer) wrongTypes[w] = 'similar'; });
    questions.push({
      id: `l3-q${idx + 1}`, stage: 3, order: idx + 1, type: 'single',
      prompt: '비슷한 단어를 잘 보고 정답을 골라보세요.',
      hint: '철자가 비슷한 단어가 섞여 있어요!',
      images: [EMOJI[answer]], options: shuffle(group.slice()), answer, wrongTypes,
    });
  });

  // ── 4단계: 그림 3개 ↔ 단어 3개 매칭 ──
  for (let i = 1; i <= 5; i++) {
    const words = [pickUnused(ALL_WORDS, used), pickUnused(ALL_WORDS, used), pickUnused(ALL_WORDS, used)];
    const targets = words.map((w, k) => ({ slot: `s${k + 1}`, image: EMOJI[w] }));
    const answers = {};
    words.forEach((w, k) => { answers[`s${k + 1}`] = w; });
    questions.push({
      id: `l4-q${i}`, stage: 4, order: i, type: 'multi',
      prompt: '그림마다 맞는 영어 단어를 연결해보세요.',
      hint: '단어를 끌어서 알맞은 그림 위에 놓아요.',
      targets, options: shuffle(words.slice()), answers,
    });
  }

  // ── 5단계: 카테고리 분류 ──
  const catNames = shuffle(Object.keys(CATEGORIES));
  for (let i = 1; i <= 5; i++) {
    const catName = catNames[i % catNames.length];
    const catWords = CATEGORIES[catName];
    const answers = shuffle(catWords.filter((w) => !used.has(w))).slice(0, 3);
    while (answers.length < 3) { const w = pick(catWords); if (!answers.includes(w)) answers.push(w); }
    answers.forEach((w) => used.add(w));
    const others = shuffle(ALL_WORDS.filter((w) => categoryOf(w) !== catName)).slice(0, 2);
    questions.push({
      id: `l5-q${i}`, stage: 5, order: i, type: 'category',
      prompt: '조건에 맞는 영어 단어만 골라 상자에 넣어보세요.',
      hint: `${catName} 단어를 모두 찾아요.`,
      category: catName, images: ['🧺'],
      options: shuffle([...answers, ...others]), answers,
    });
  }

  return questions;
}

const STAGE_PASS_THRESHOLD = 4;
const TOTAL_PASS_THRESHOLD = 20;

module.exports = { generateQuestions, STAGE_PASS_THRESHOLD, TOTAL_PASS_THRESHOLD, EMOJI };
