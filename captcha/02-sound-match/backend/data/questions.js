/**
 * Sound Match CAPTCHA — 랜덤 문제 생성기 (5단계 × 5문제 = 25문제)
 * ---------------------------------------------------------------
 * 게임(세션)을 시작할 때마다 단어 풀에서 랜덤으로 문제를 생성한다.
 * - 한 세션 안에서 정답 단어가 중복되지 않도록 뽑는다.
 * - 보기(그림) 순서도 매번 섞인다.
 * - 단어 풀은 발음 오디오(.m4a)가 준비된 24개 단어로 제한
 *   (없어도 브라우저 TTS 폴백이 있지만, 실제 녹음 발음을 우선 사용).
 */

const EMOJI = {
  cat: '🐱', dog: '🐶', fish: '🐟', bird: '🐦', bear: '🐻', cow: '🐮',
  apple: '🍎', banana: '🍌', orange: '🍊', grape: '🍇', pear: '🍐', peach: '🍑',
  book: '📘', pencil: '✏️', bag: '🎒', chair: '🪑', pen: '🖊️',
  ball: '⚽', cap: '🧢', car: '🚗',
  red: '🔴', blue: '🔵', green: '🟢', yellow: '🟡',
};

/** 오디오 파일이 있는 단어들 (frontend/assets/audio/<word>.m4a) */
const AUDIO_WORDS = Object.keys(EMOJI);

/** 발음이 비슷한 단어 그룹 (3단계용) */
const SIMILAR_GROUPS = [
  ['cat', 'cap', 'car', 'cow'],
  ['bear', 'pear', 'pen', 'peach'],
  ['book', 'ball', 'bird', 'bag'],
  ['pencil', 'pen', 'pear', 'peach'],
  ['blue', 'book', 'bear', 'banana'],
];

const shuffle = (a) => { const x = a.slice(); for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [x[i], x[j]] = [x[j], x[i]]; } return x; };
const pick = (a) => a[Math.floor(Math.random() * a.length)];
function pickUnused(pool, used) {
  const fresh = pool.filter((w) => !used.has(w));
  const w = fresh.length ? pick(fresh) : pick(pool);
  used.add(w);
  return w;
}
function sampleOthers(exclude, n) {
  const pool = AUDIO_WORDS.filter((w) => !exclude.includes(w));
  return shuffle(pool).slice(0, n);
}
const toOptions = (words) => words.map((w, i) => ({ id: 'abcdefgh'[i], word: w, image: EMOJI[w] }));

/** 세션 1회분(25문제) 생성 */
function generateQuestions() {
  const used = new Set();
  const questions = [];

  // ── 1단계: 듣고 2개 그림 중 선택 ──
  for (let i = 1; i <= 5; i++) {
    const answer = pickUnused(AUDIO_WORDS, used);
    const words = shuffle([answer, ...sampleOthers([answer], 1)]);
    questions.push({
      id: `s1-q${i}`, stage: 1, order: i, type: 'pick', showLabel: true,
      prompt: '소리를 듣고 맞는 그림을 골라보세요.',
      hint: '🔊 버튼을 눌러 단어를 들어요.',
      audioWord: answer, options: toOptions(words), answer,
    });
  }

  // ── 2단계: 듣고 4개 그림 중 선택 ──
  for (let i = 1; i <= 5; i++) {
    const answer = pickUnused(AUDIO_WORDS, used);
    const words = shuffle([answer, ...sampleOthers([answer], 3)]);
    questions.push({
      id: `s2-q${i}`, stage: 2, order: i, type: 'pick', showLabel: true,
      prompt: '영어 단어를 잘 듣고 알맞은 그림을 선택해요.',
      hint: '🔊 소리를 듣고 4개 중에서 골라요.',
      audioWord: answer, options: toOptions(words), answer,
    });
  }

  // ── 3단계: 비슷한 발음 구분 ──
  const groups = shuffle(SIMILAR_GROUPS);
  for (let i = 1; i <= 5; i++) {
    const group = groups[(i - 1) % groups.length];
    const answer = pickUnused(group, used); // 그룹 안에서 아직 안 쓴 단어 우선
    const wrongTypes = {};
    group.forEach((w) => { if (w !== answer) wrongTypes[w] = 'similar-sound'; });
    questions.push({
      id: `s3-q${i}`, stage: 3, order: i, type: 'pick', showLabel: true,
      prompt: '비슷한 소리를 잘 듣고 맞는 그림을 골라보세요.',
      hint: '🔊 발음을 여러 번 들어봐도 좋아요.',
      audioWord: answer, options: toOptions(shuffle(group.slice())), answer,
      confusedPair: group.slice(0, 2), wrongTypes,
    });
  }

  // ── 4단계: 글자 힌트 제거 (그림만, 오디오 2회 제한) ──
  for (let i = 1; i <= 5; i++) {
    const answer = pickUnused(AUDIO_WORDS, used);
    const words = shuffle([answer, ...sampleOthers([answer], 3)]);
    questions.push({
      id: `s4-q${i}`, stage: 4, order: i, type: 'pick', showLabel: false, maxAudioPlays: 2,
      prompt: '단어를 듣고 그림만 보고 맞혀보세요.',
      hint: '🔊 오디오는 2번까지만 들을 수 있어요.',
      audioWord: answer, options: toOptions(words), answer,
    });
  }

  // ── 5단계: 연속 듣기 (2~3단어 순서대로) ──
  for (let i = 1; i <= 5; i++) {
    const len = i % 2 === 0 ? 3 : 2; // 2,3,2,3,2
    const seq = [];
    for (let k = 0; k < len; k++) seq.push(pickUnused(AUDIO_WORDS, used));
    const words = [...seq, ...sampleOthers(seq, 4 - len)]; // 보기 총 4개 (정답 시퀀스 포함)
    questions.push({
      id: `s5-q${i}`, stage: 5, order: i, type: 'sequence', showLabel: true,
      prompt: '소리를 듣고 순서대로 그림을 골라보세요.',
      hint: len === 3 ? '🔊 단어 3개! 순서를 기억해요.' : '🔊 들린 순서 그대로 눌러요.',
      audioSequence: seq, options: toOptions(shuffle(words)), answerSequence: seq,
    });
  }

  return questions;
}

const STAGE_PASS_THRESHOLD = 4;
const TOTAL_PASS_THRESHOLD = 20;

module.exports = { generateQuestions, STAGE_PASS_THRESHOLD, TOTAL_PASS_THRESHOLD, EMOJI, AUDIO_WORDS };
